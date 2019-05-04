import restify from 'restify';
import errors from 'restify-errors';
import { radixUniverse, RadixUniverse, RadixLogger, RadixKeyStore, RadixSimpleIdentity, RadixAtom, RadixTransactionBuilder, RadixNEDBAtomCache, radixTokenManager, RadixAccount, RadixApplicationData } from 'radixdlt';
import Ajv from 'ajv';
import { filter as rxFilter } from 'rxjs/operators';
import winston, { format } from 'winston';

import key from './key.json';
import { newSurvey, surveyAnswers } from './jsonSchemas';
import { random } from './utils';
import { Survey, Response, AppData, Payload, AppDataType, SurveyType, WinnerSelection, ResultsVisibility } from './types';
import { TSMap } from 'typescript-map';
import { info } from 'verror';

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

// Skip some things in production
if (process.env.NODE_ENV != 'production') {
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


  const corsMiddleware = require('restify-cors-middleware');
  const cors = corsMiddleware({ allowHeaders: ['Content-Type'] });
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

RadixKeyStore.decryptKey(key, process.env.KEY_PASSWORD as string)
  .then((keyPair) => {
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
      const balance = radixToken.toTokenUnits((transaction.balance as any)[radixToken.id.toString()])
      if (participants.length > 1) {
        logger.warn('There is more than one participant:', transactionUpdate);
      }
      
      logger.info(`Received a transaction of ${balance} ${(radixToken as any).label} from ${participants[0]}`);
      
      for (let i = 0; i < waitingSurveys.length; i++) {
        const survey = waitingSurveys[i];
        if (survey.radixAddress === participants[0]) {
          logger.info(`Found survey '${survey.title}' waiting for a transaction of ${survey.totalReward}`);

          if (balance < survey.totalReward) {
            logger.info(`Received ${balance} tokens are not sufficient (required ${survey.totalReward})`);
            continue;
          }
          logger.info(`Received tokens are sufficient`);
          submitSurveyToRadix(survey);
          break;
        }
      }
    });


    // Subscribe to all data
    account.dataSystem.getApplicationData(process.env.APP_ID as string)
      .subscribe({
        next: item => {
          const data = item.data;
          const payload: Payload = JSON.parse(data.payload);
          logger.info(`Received new ${payload.type} (created at: ${payload.data.created}). Radix ID: ${data.hid}.`);

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


/**
 * Returns a list of surveys.
 */
server.get('/api/surveys', (req, res, next) => {
  const surveys = account.dataSystem.applicationData.get(process.env.APP_ID as string).values()
    .sort((a, b) => {
      return b.timestamp - a.timestamp;
    })
    .reduce((acc: any, item) => {
      const payload: Payload = JSON.parse(item.payload);
      if (payload.type == AppDataType.Survey) {
        acc[item.hid] = { ...payload.data, id: item.hid, published: item.timestamp, responseCount: getSurveyResponseCount(item.hid) };
        acc.items.push(item.hid);
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

  res.send(survey);
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

  if (survey.resultsVisibility === ResultsVisibility.Public) {
    const response = { survey, responses: getSurveyResponses(req.params.survey_id)};
    res.send(response);
  }

  res.status(200);
  return next();
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
  switch (survey.surveyType) {
    case SurveyType.Free: {
      submitSurveyToRadix(survey);
      break;
    }
    case SurveyType.Paid: {
      waitingSurveys.push(survey);
      logger.info(`Added survey (created at: ${survey.created}) to waiting list. ` + 
        `Waiting for a transaction of ${survey.totalReward} ${(radixToken as any).label}`);
      break;
    }
    default:
      break;
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
  const answers: Response = { ...req.body, created: new Date().getTime(), surveyId: survey.id };
  logger.debug(`Survey ${survey.id} type: ${survey.surveyType}`);
  
  if (survey.surveyType === SurveyType.Paid) {
    logger.debug(`Survey ${survey.id} winner selection: ${survey.winnerSelection}`);
    switch (survey.winnerSelection) {
      case WinnerSelection.FirstN: {
        const answerCount = getSurveyResponseCount(survey.id);
        logger.debug(`Survey answer count is ${answerCount} and first ${survey.firstNCount} people must be rewarded`);
  
        if (answerCount <= survey.firstNCount) {
          transferTokens(answers.userRadixAddress, survey.totalReward / survey.firstNCount);
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
 * Serve React
 */
server.get('/*', restify.plugins.serveStatic({
  directory: './public',
  default: 'index.html'
}));

/**
 * Takes survey of given answers and checks if answers are valid for given questions
 * TODO complete this method
 */
function testAnswersAgainstSurvey(answers: Response, survey: Survey) {
  return true;
}

const waitingSurveys: Survey[] = [];

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
        logger.error(`Error submitting ${payload.type} to Radix: `, error);
      }
    });
}

function transferTokens(userAddress: string, amount: number) {
  logger.info(`Transferring ${amount} ${(radixToken as any).label} to address ${userAddress}...`);
  const userAccount = RadixAccount.fromAddress(userAddress, true);
  RadixTransactionBuilder
    .createTransferAtom(identity.account, userAccount, radixToken, amount)
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
  const item = account.dataSystem.applicationData.get(process.env.APP_ID as string).values().find(item => {
    return item.hid === surveyId;
  });

  if (!item) {
    return null;
  }

  return { ...JSON.parse(item.payload).data, id: item.hid };
}

/**
 */
function getSurveyResponses(surveyId: string): Response[] {
  return account.dataSystem.applicationData.get(process.env.APP_ID as string).values().reduce((acc: Response[], item) => {
    const payload: Payload = JSON.parse(item.payload);
    if (payload.type == AppDataType.Answers && (payload.data as Response).surveyId == surveyId) {
      acc.push(payload.data as Response);
    }
    return acc;
  }, []);
}

/**
 * Counts number of submitted answers for given survey.
 */
function getSurveyResponseCount(surveyId: string): number {
  return getSurveyResponses(surveyId).length;
}

const ajv = Ajv({ allErrors: true });
const testNewSurvey = ajv.compile(newSurvey);
const testSurveyAnswers = ajv.compile(surveyAnswers);


server.listen(8080, function () {
  logger.info(`${server.name} listening at ${server.url}`);
  logger.info(`Current Application ID: ${process.env.APP_ID}`);
});
