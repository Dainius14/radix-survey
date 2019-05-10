import restify from 'restify';
import errors from 'restify-errors';
import bcrypt from 'bcrypt';
import { radixUniverse, RadixUniverse, RadixLogger, RadixKeyStore, RadixSimpleIdentity, RadixAtom, RadixTransactionBuilder, RadixNEDBAtomCache, radixTokenManager, RadixAccount, RadixApplicationData, RadixKeyPair } from 'radixdlt';
import Ajv from 'ajv';
import winston, { format } from 'winston';
import axios from 'axios';

import key from './key.json';
import { newSurvey, surveyAnswers } from './jsonSchemas';
import { Survey, Response, AppData, Payload, AppDataType, WinnerSelection, ResultsVisibility, SurveyType, SurveyVisibility } from './types';
import { existsSync } from 'fs';

// Setup logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    new winston.transports.File({ dirname: 'logs', filename: 'error.log', level: 'error' }),
    new winston.transports.File({ dirname: 'logs', filename: 'log.log' })
  ]
});


const server: restify.Server = restify.createServer();

  logger.add(new winston.transports.Console({
    format: format.combine(
      format.timestamp({ format: 'HH:mm:ss' }),
      format.splat(),
      format.printf(({ level, timestamp, message, service, ...rest }) => {
        let restStr = JSON.stringify(rest, null, 4);
        restStr = restStr != '{}' ? ' ' + restStr : '';
        return format.colorize().colorize(level, `[${timestamp}] ${level}: `)
          + message + restStr;
      }
    )
  )}));


// Skip some things in production
if (process.env.NODE_ENV != 'production') {
  const corsMiddleware = require('restify-cors-middleware');
  const cors = corsMiddleware({ allowHeaders: ['Content-Type', 'Authorization'] });
  server.pre(cors.preflight);
  server.use(cors.actual);

  // For testing purposes add some delay to response
  server.use((req, res, next) => {
    logger.info(`${req.method} to ${req.url}`);

    setTimeout(() => next(), 1000);
  });
}

// Apply middleware
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.fullResponse());
// For POST methods, require application/json header
server.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return next(
      new errors.InvalidContentError('Expecting \'application/json\'')
    );
  }
  return next();
})

// Setup Radix
radixUniverse.bootstrap(RadixUniverse.ALPHANET);
const radixToken = radixTokenManager.getTokenByISO('TEST');
RadixLogger.setLevel('warn'); // Available levels: trace/debug/info/warn/error
let identity: RadixSimpleIdentity;
let account: RadixAccount;

const surveysWaitingForId: any = {};
const surveysWaitingForResultsPurchase: any[] = [];
const paidSurveysWaitingForTokens: any[] = [];

RadixKeyStore.decryptKey(key, process.env.KEY_PASSWORD as string)
  .then((keyPair: RadixKeyPair) => {
    identity = new RadixSimpleIdentity(keyPair);
    account = identity.account;
    account.enableCache(new RadixNEDBAtomCache('./cache.db'));
    account.openNodeConnection();
    logger.info('Account address: ' + account.getAddress());

    // Subscribe for all previous transactions as well as new ones
    account.transferSystem.getAllTransactions().subscribe(transactionUpdate => {
      logger.debug('Received transaction update:', transactionUpdate);

      const transaction = transactionUpdate.transaction;
      if (!transaction) {
        logger.error('Received transaction is empty:', transactionUpdate);
        return;
      }

      const participants: string[] = Object.values(transaction.participants);
      if (participants.length === 0) {
        logger.error('Received transaction with no participants:', transactionUpdate);
        return;
      }

      const balance = radixToken.toTokenUnits((transaction.balance as any)[radixToken.id.toString()])
      if (participants.length > 1) {
        logger.warn('There is more than one participant:', transactionUpdate);
      }
      


      // Buy results
      const transactionFrom = participants[0];
      logger.info(`Received a transaction of ${balance} ${(radixToken as any).label} from ${transactionFrom}`);
      
      const waitingForPurchase = surveysWaitingForResultsPurchase.find((x: any) => transactionFrom.startsWith(x.radixAddress));
      if (waitingForPurchase) {
        logger.info(`There is a survey '${waitingForPurchase.survey.title}' waiting for its results to be bought`);
        buyResults(waitingForPurchase, balance);
      }



      // Publish paid survey
      const paidSurveyWaitingForTokens = paidSurveysWaitingForTokens.find((x: any) => transactionFrom.startsWith(x.radixAddress));
      if (paidSurveyWaitingForTokens) {
        const survey = paidSurveyWaitingForTokens;
        logger.info(`Found survey '${survey.title}' waiting for a transaction of ${survey.totalReward}`);

        if (balance >= survey.totalReward) {
          logger.info(`Received tokens are sufficient`);
          submitSurveyToRadix(survey);
        }
        else {
          logger.info(`Received ${balance} tokens are not sufficient (required ${survey.totalReward})`);
        }
      }
    });


    // Subscribe to all data
    account.dataSystem.getApplicationData(process.env.APP_ID as string)
      .subscribe({
        next: item => {
          const data = item.data;
          let payload: any;
          try {
            payload = JSON.parse(data.payload);
          }
          catch {
            return
          }
          logger.info(`Received new ${payload.type} (created at: ${data.timestamp}). Radix ID: ${data.hid}.`);

          const waitingResponse = surveysWaitingForId[payload.data.created];
          if (waitingResponse && waitingResponse.title === (payload.data as Survey).title) {
            logger.info('Found request waiting for response');
            waitingResponse.res.send({ id: data.hid });
            waitingResponse.next();
            delete surveysWaitingForId[payload.data.created];
          }
        },
        error: error => logger.error('Error observing application data: ' + JSON.stringify(error, null, 2))
      });
    
});


async function buyResults(item: any, tokenAmount: number) {
  const survey = item.survey as Survey;
  const responses = getSurveyResponses(survey.id);
  try {
    logger.info('Making request to random.org...');
    const req = await axios.get(`https://www.random.org/sequences/?min=0&max=${responses.length - 1}&col=1&format=plain&rnd=new`);
    const indexes: [] = req.data.split('\n');

    const responseCountToBuy = Math.min(parseInt((tokenAmount / survey.resultPrice).toString()), indexes.length - 1);
    const selectedResponses = indexes.slice(0, responseCountToBuy).map(x => responses[x]);
    
    logger.info(`Sending ${selectedResponses.length} responses...`);
    item.res.send({ responses: selectedResponses, surveyId: survey.id });
    item.res.status(200);
    item.next();

    const indexOfItem = surveysWaitingForResultsPurchase.findIndex(x => x.radixAddress === item.radixAddress && x.survey.id === survey.id);
    surveysWaitingForResultsPurchase.splice(indexOfItem, 1);
    const msg = `Purchase of ${selectedResponses.length} responses for "${survey.title}" survey`;

    transferTokens(survey.radixAddress, selectedResponses.length * survey.resultPrice, msg)
  }
  catch {}
    
}

/**
 * Returns a list of surveys.
 */
server.get('/api/surveys', (req, res, next) => {
  const surveys = getAppData()
    .sort((a, b) => {
      return b.timestamp - a.timestamp;
    })
    .reduce((acc: any, item) => {
      const payload: Payload = JSON.parse(item.payload);
      if (payload.type == AppDataType.Survey) {
        const survey = payload.data as Survey;

        if (survey.surveyVisibility === SurveyVisibility.Public) {
          const surveyPrepared = prepareSurveyData({ ...survey, id: item.hid, published: item.timestamp });
          acc[surveyPrepared.id] = surveyPrepared;
          acc.items.push(surveyPrepared.id);
        }
      }
      return acc;
    }, { items: [] });

  res.send(surveys);
  return next();
});

/**
 * Returns a single survey.
 */
server.get('/api/surveys/:survey_id', (req, res, next) => {
  const survey = findSurvey(req.params.survey_id);
  if (!survey) {
    return next(new errors.NotFoundError());
  }
  const surveyPrepared = prepareSurveyData(survey);
  res.send(surveyPrepared);
  return next();
});

/**
 * Returns a results for a survey.
 */
server.get('/api/surveys/:survey_id/results', (req, res, next) => {
  const survey = findSurvey(req.params.survey_id);

  if (!survey) {
    return next(new errors.NotFoundError());
  }

  const surveyPrepared = prepareSurveyData(survey);
  if (survey.resultsVisibility === ResultsVisibility.Public) {
    res.send(surveyPrepared);
  }
  else if (bcrypt.compareSync(req.headers.authorization, survey.resultsPasswordHashed)) {
    surveyPrepared.responses = getSurveyResponses(req.params.survey_id);
    res.send(surveyPrepared);
  }
  else {
    return next(new errors.UnauthorizedError());
  }

  res.status(200);
  return next();
});


server.post('/api/surveys/:survey_id/results', (req, res, next) => {
  const survey = findSurvey(req.params.survey_id);

  if (!survey) {
    return next(new errors.NotFoundError());
  }
  surveysWaitingForResultsPurchase.push({
    radixAddress: req.body.radixAddress,
    survey: survey,
    req: req,
    res: res,
    next: next
  });
});


/**
 * Validates survey and adds it to waiting list.
 */
server.post('/api/surveys', (req, res, next) => {
  const isValid = testNewSurvey(req.body);
  if (!isValid) {
    logger.warn('Invalid new survey: ' + ajv.errorsText(testNewSurvey.errors))
    return next(new errors.BadRequestError(JSON.stringify(testNewSurvey.errors)));
  }

  const survey: Survey = { ...req.body, created: new Date().getTime() };
  
  if (survey.resultsVisibility !== ResultsVisibility.Public) {
    survey.resultsPasswordHashed = bcrypt.hashSync(survey.resultsPassword, 5);
    delete survey.resultsPassword;
  }

  if (survey.surveyType === SurveyType.Free) {
      submitSurveyToRadix(survey);
  }
  else {
    paidSurveysWaitingForTokens.push(survey);
    logger.info(`Added survey (created at: ${survey.created}) to waiting list. ` + 
      `Waiting for a transaction of ${survey.totalReward} ${(radixToken as any).label}`);
  }

  surveysWaitingForId[survey.created] = {
    created: survey.created,
    title: survey.title,
    res: res,
    req: req,
    next: next
  }
});


/**
 * Validates answers and adds to RadixDLT
 */
server.post('/api/surveys/:survey_id/answers', (req, res, next) => {
  logger.debug('Received some answers...');
  const isValid = testSurveyAnswers(req.body);
  if (!isValid) {
    logger.warn('Invalid survey answers: ' + ajv.errorsText(testSurveyAnswers.errors))
    return next(new errors.BadRequestError(JSON.stringify(testSurveyAnswers.errors)));
  }

  // Answers are syntactically ok
  const survey = findSurvey(req.params.survey_id);
  if (!survey) {
    logger.warn(`Survey ${req.params.survey_id} was not found`);
    return next(new errors.BadRequestError());
  }

  // Survey found
  const isValidAgainstSurvey = testAnswersAgainstSurvey(req.body, survey);
  if (!isValidAgainstSurvey) {
    logger.warn('Invalid survey answers')
    return next(new errors.BadRequestError());
  }

  // Answers are valid
  const answers: Response = { ...req.body, surveyId: survey.id };
  logger.debug(`Survey ${survey.id} type: ${survey.surveyType}`);
  
  if (survey.surveyType === SurveyType.Paid) {
    switch (survey.winnerSelection) {
      case WinnerSelection.FirstN: {
        const answerCount = getSurveyResponses(survey.id).length;
        logger.debug(`Survey answer count is ${answerCount} and first ${survey.winnerCount} people must be rewarded`);

        if (answerCount <= survey.winnerCount) {
          const msg = `Reward for participation in "${survey.title}" survey`;
          transferTokens(answers.radixAddress, survey.totalReward / survey.winnerCount, msg);
        }
      }
      default:
        break;
    }
  }

  submitAnswersToRadix(answers);
  res.status(204)
  res.send();
  return next();
});



/**
 * Takes survey of given answers and checks if answers are valid for given questions
 * TODO complete this method
 */
function testAnswersAgainstSurvey(answers: Response, survey: Survey) {
  return true;
}

/** Encapsulates and submits user survey */
function submitSurveyToRadix(survey: Survey) {
  const payload: Payload = {
    type: AppDataType.Survey,
    data: survey
  };
  submitToRadix(payload);
}

/** Encapsulates and submits user answers */
function submitAnswersToRadix(answers: Response) {
  const appData = {
    type: AppDataType.Answers,
    data: answers
  };
  submitToRadix(appData);
}

/** Submits encapsulated data to RadixDLT. */
function submitToRadix(payload: Payload) {
  logger.info(`Submitting ${payload.type} to the ledger...`);
  RadixTransactionBuilder
    .createPayloadAtom([identity.account], process.env.APP_ID as string, JSON.stringify(payload))
    .signAndSubmit(identity)
    .subscribe({
      next: state => {
        logger.debug(`${payload.type} (created at: ${payload.data.created}) state: ${state}`)
      },
      complete: () => {
        const capitalizedType = payload.type[0].toUpperCase() + payload.type.substr(1);
        logger.info(`${capitalizedType} (created at: ${payload.data.created}) successfully submitted`);
      },
      error: error => {
        logger.error(`Error submitting ${payload.type} to Radix: ${error}`);
      }
    });
}

function transferTokens(userAddress: string, amount: number, message: string) {
  logger.info(`Transferring ${amount} ${(radixToken as any).label} to address ${userAddress}...`);
  const toAccount = RadixAccount.fromAddress(userAddress, true);
  RadixTransactionBuilder
    .createTransferAtom(identity.account, toAccount, radixToken, amount, message)
    .signAndSubmit(identity)
    .subscribe({
      next: state => {
        logger.debug(`Transaction to ${userAddress} state: ${state}`)
      },
      complete: () => {
        logger.info(`Transaction to ${userAddress} completed successfully`);
      },
      error: error => {
        logger.error(`Error transfering tokens to ${userAddress}: ${error}`);
      }
    });
}


function findSurvey(surveyId: string): Survey|null {
  const item = getAppData().find(item => {
    return item.hid === surveyId;
  });

  if (!item) {
    return null;
  }

  const survey = JSON.parse(item.payload).data as Survey;

  return { ...survey, id: item.hid, published: item.timestamp };
}

function prepareSurveyData(surveyToPrepare: Survey): Survey {
  const survey = { ...surveyToPrepare };
  delete survey.resultsPasswordHashed;

  const responses = getSurveyResponses(survey.id);
  
  survey.totalResponses = responses.length;
  if (responses.length === 0) {
    survey.firstResponse = null;
    survey.lastResponse = null;
  }
  else {
    survey.firstResponse = responses.reduce((acc, response) => Math.min(response.created, acc), responses[0].created);
    survey.lastResponse = responses.reduce((acc, response) => Math.max(response.created, acc), responses[0].created);
  }

  if (survey.resultsVisibility === ResultsVisibility.Public) {
    survey.responses = responses;
  }
  return survey;
}

/**
 */
function getSurveyResponses(surveyId: string): Response[] {
  return getAppData().reduce((acc: Response[], item) => {
    const payload: Payload = JSON.parse(item.payload);
    if (payload.type == AppDataType.Answers && (payload.data as Response).surveyId == surveyId) {
      acc.push({ ...payload.data, created: item.timestamp } as Response);
    }
    return acc;
  }, []);
}

function getAppData(): RadixApplicationData[] {
  const appData = account.dataSystem.applicationData.get(process.env.APP_ID as string);
  if (appData) {
    return appData.values();
  }
  return [];

}

const ajv = Ajv({ allErrors: true });
const testNewSurvey = ajv.compile(newSurvey);
const testSurveyAnswers = ajv.compile(surveyAnswers);


server.listen(process.env.PORT, function () {
  logger.info(`${server.name} listening at ${server.url}`);
  logger.info(`Current Application ID: ${process.env.APP_ID}`);
});
