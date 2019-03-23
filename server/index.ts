import restify from 'restify';
import errors from 'restify-errors';
import { radixUniverse, RadixUniverse, RadixIdentity, RadixLogger, RadixKeyStore, RadixSimpleIdentity, RadixAtom, RadixTransactionBuilder, RadixNEDBAtomCache, radixTokenManager, RadixTransaction } from 'radixdlt';
import fs from 'fs';
import Datastore from 'nedb';
import Ajv from 'ajv';
import { filter as rxFilter } from 'rxjs/operators';
import winston, { format } from 'winston';

import env from './.env.json';
import key from './key.json';
import { newSurveySchema } from './newSurveySchema';
import { timestampToHumanISODate, random } from './utils';
import { Survey } from './types';

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


// Open cached database
const db = new Datastore({ filename: './cache.db', autoload: true });

// Setup Radix
radixUniverse.bootstrap(RadixUniverse.ALPHANET);
const radixToken = radixTokenManager.getTokenByISO('TEST');
RadixLogger.setLevel('warn'); // Available levels: trace/debug/info/warn/error
let identity: RadixSimpleIdentity;

RadixKeyStore.decryptKey(key, env.keyPassword)
  .then((keyPair) => {
    identity = new RadixSimpleIdentity(keyPair);

    const account = identity.account;
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
      
      logger.info(`Received transaction with ${balance} ${(radixToken as any).label} from ${participants[0]} with ${balance}`);
      
      waitingSurveys.forEach(survey => {
        if (survey.radixAddress === participants[0]) {
          logger.info(`Found survey waiting for transaction ${survey.title}. Submitting to Radix`);
          submitSurveyToRadix(survey);
        }
      });
    });


    // Subscribe to new data
    const tsNow = new Date().getTime();
    account.dataSystem.applicationDataSubject
      .pipe(
        rxFilter(item => {
          // Return only items which are not older than 10 seconds
          return item.data.timestamp > tsNow - (10 * 1000);
        })
      )
      .subscribe({
        next: item => {
          const data = item.data;

          // Reload database, because it doesn't reread the new file
          db.loadDatabase();

          logger.info(`New survey '${JSON.parse(data.payload).title}'. ID: ${data.hid}`);

          latestId = data.hid;
        },
        error: error => logger.error('Error observing application data: ' + JSON.stringify(error, null, 2))
      });
});


server.get('/api/surveys', (req, res, next) => {
  db.find({ applicationId: env.appId },
    (error: Error, docs: RadixAtom[]) => {
      if (error) {
        return next(new errors.InternalServerError(error))
      }

      // Sort from newest to oldest
      const sortedDocs = docs.sort((a, b) => {
        return b.timestamps.default - a.timestamps.default;
      });

      // const takeNDocs = sortedDocs.slice(0, 5);

      // Prepare data
      const acc = {};
      const data = sortedDocs.reduce(( acc: any, x: RadixAtom) => {
        let payload = x.payload;
        try {
          payload = JSON.parse(payload);
        } catch (e) { }

        if (payload.title) {
          acc[x._id] = payload;
          acc[x._id].id = x._id;
          acc.items.push(x._id);
        }
        return acc;
        //   payload: payload,
        //   timestamp: x.timestamps.default,
        //   date: utils.timestampToHumanISODate(x.timestamps.default),
        //   applicationId: x.applicationId,
        //   id: x._id,
        //   // raw: x
        // };
      }, { items: [] });
      res.send(data);
      return next();
    });
});

server.get('/api/surveys/:survey_id', (req, res, next) => {
  db.findOne({ applicationId: env.appId, _id: req.params.survey_id },
    (error: Error, doc: RadixAtom) => {
      if (error) {
        return next(new errors.InternalServerError(error))
      }

      if (!doc) {
        return next(new errors.NotFoundError());
      }

      let payload = doc.payload;
      try {
        payload = JSON.parse(payload);
      } catch (e) { }

      payload.id = doc._id;

      res.send(payload);
      return next();
    });
});


let latestId: string = '';
server.post('/api/create-survey', (req, res, next) => {
  const isValid = testSchema(req.body);
  if (!isValid) {
    logger.warn('Invalid survey: ' + ajv.errorsText(testSchema.errors))
    return next(
      new errors.BadRequestError(JSON.stringify(testSchema.errors))
    );
  }

  // Request valid

  // Clean up survey data:
  // Questions will be transformed to array which is already sorted the way it needs to be
  // Ids are not neccessary anymore, since quesiton position in the array will be a good
  // identifier.
  // Same goes for answer choices
  const newQuestions = req.body.questions.items.map((questionId: number) => {
    const question = Object.assign({}, req.body.questions[questionId]);
    delete question.id;

    if (question.answerChoices) {
      question.answerChoices = question.answerChoices.items.map((answerId: number) => {
        const answer = Object.assign({}, question.answerChoices[answerId]);
        delete answer.id;
        return answer;
      });
    }

    return question;
  });

  const surveyId = random();
  const cleanSurvey: Survey = Object.assign({}, req.body, { questions: newQuestions, id: surveyId });

  waitingSurveys.push(cleanSurvey);

  // If time passes, ignore survey
  // setTimeout(() => {
  //   logger.info('Time has passed. Removing survey: ' + cleanSurvey.id);
  //   const surveyIndex = waitingSurveyTokens.findIndex(x => x.id == cleanSurvey.id);
  //   if (surveyIndex) {
  //     waitingSurveyTokens.splice(surveyIndex, 1);
  //   }
  // }, 1000 * 60);

  res.send({ ok: 'ok' });
  return next();

  // res.send(cleanSurvey);
  // return next();
  const jsonData = JSON.stringify(cleanSurvey);

});

const waitingSurveys: Survey[] = [];

function submitSurveyToRadix(survey: Survey) {
  RadixTransactionBuilder
    .createPayloadAtom([identity.account], env.appId, JSON.stringify(survey))
    .signAndSubmit(identity)
    .subscribe({
      next: state => logger.debug(`Survey ${survey.title} state: ${state}`),
      complete: () => {
        logger.info(`Survey '${survey.title}' successfully submitted`);
        // NEED TO PROPERLY DEAL WITH THIS STUFF HERE
        //res.send({ id: latestId });
        //return next();
      },
      error: error => {
        logger.error('Error submitting survey to Radix:', error);
        //return next(new errors.InternalServerError(error));
      }
    });

}


const ajv = Ajv({ allErrors: true });
const testSchema = ajv.compile(newSurveySchema);


server.listen(8080, function () {
  logger.info(`${server.name} listening at ${server.url}`);
});
