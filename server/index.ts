import restify from 'restify';
import errors from 'restify-errors';
import { radixUniverse, RadixUniverse, RadixIdentity, RadixLogger, RadixKeyStore, RadixSimpleIdentity, RadixAtom, RadixTransactionBuilder, RadixNEDBAtomCache } from 'radixdlt';
import fs from 'fs';
import Datastore from 'nedb';
import Ajv from 'ajv';
import { filter as rxFilter } from 'rxjs/operators';

import env from './.env.json';
import key from './key.json';
import { newSurveySchema } from './newSurveySchema';
import { timestampToHumanISODate } from './utils';


const server: restify.Server = restify.createServer();

// Skip some things in production
if (process.env.NODE_ENV != 'production') {
  const corsMiddleware = require('restify-cors-middleware');
  const cors = corsMiddleware({ allowHeaders: ['Content-Type'] });
  server.pre(cors.preflight);
  server.use(cors.actual);

  // For testing purposes add some delay to response
  server.use((req, res, next) => {
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
RadixLogger.setLevel('warn'); // Available levels: trace/debug/info/warn/error
let identity: RadixSimpleIdentity;

RadixKeyStore.decryptKey(key, env.keyPassword)
  .then((keyPair) => {
    console.log('Private key successfuly decrypted');
    identity = new RadixSimpleIdentity(keyPair);

    const account = identity.account;
    account.enableCache(new RadixNEDBAtomCache('./cache.db'));
    account.openNodeConnection();
    console.log('Address:', account.getAddress());

    // Subscribe for all previous transactions as well as new ones
    account.transferSystem.getAllTransactions().subscribe(transactionUpdate => {
      console.log('Transaction update', transactionUpdate)
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

          console.log(`[${timestampToHumanISODate(data.timestamp)}]: New survey '${JSON.parse(data.payload).title}'. ID: ${data.hid}`);

          latestId = data.hid;
        },
        error: error => console.error('Error observing application data.', error)
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
      console.log(req.params.survey_id)

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
    console.log(ajv.errorsText(testSchema.errors))
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

  const cleanSurvey = Object.assign({}, req.body, { questions: newQuestions });

  // res.send(cleanSurvey);
  // return next();
  const jsonData = JSON.stringify(cleanSurvey);

  RadixTransactionBuilder
    .createPayloadAtom([identity.account], env.appId, jsonData)
    .signAndSubmit(identity)
    .subscribe({
      next: item => { },
      complete: () => {
        // NEED TO PROPERLY DEAL WITH THIS STUFF HERE
        res.send({ id: latestId });
        return next();
      },
      error: error => {
        console.error('Error storing survey', error);
        return next(new errors.InternalServerError(error));
      }
    });
});


const ajv = Ajv({ allErrors: true });
const testSchema = ajv.compile(newSurveySchema);



server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
