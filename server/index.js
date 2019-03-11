const restify = require('restify');
const errors = require('restify-errors');
const fs = require('fs');
const radix = require('radixdlt');
const Datastore = require('nedb');
const utils = require('./utils');
const Ajv = require('ajv');
const ajv = Ajv({ allErrors: true });
const rxOperators = require('rxjs/operators');
const rxFilter = rxOperators.filter;
const rxMap = rxOperators.map;

const APP_ID = 'dd-testing-2';

const server = restify.createServer({});

if (process.env.NODE_ENV != 'production') {
  const corsMiddleware  = require('restify-cors-middleware')
  const cors = corsMiddleware({ allowHeaders: ['Content-Type'] });
  // server.use(cors({ allowHeaders: ['Content-Type'] }));
  server.pre(cors.preflight)
  server.use(cors.actual)
}

// console.log(restify)
server.use(restify.plugins.bodyParser());
server.use(restify.plugins.fullResponse());
server.use((req, res, next) => {
  if (req.method === 'POST' && !req.is('application/json')) {
    return next(
      new errors.InvalidContentError('Expecting \'application/json\'')
    );
  }
  return next();
})

// Create Radix identity
const db = new Datastore({ filename: './cache.db', autoload: true });
let identity;
radix.radixUniverse.bootstrap(radix.RadixUniverse.ALPHANET);
fs.readFile('file.key', function(error, key) {
  if (error) {
      console.error('Error reading file.', error);
  }
  radix.RadixLogger.setLevel('warn'); // Available levels: trace/debug/info/warn/error
  const identityManager = new radix.RadixIdentityManager();
  const keypair = radix.RadixKeyPair.fromPrivate(key);
  identity = identityManager.addSimpleIdentity(keypair);
  identity.account.enableCache(new radix.RadixNEDBAtomCache('./cache.db'));

  identity.account.openNodeConnection();


  // Subscribe to all old and new data
  // identity.account.dataSystem
  //   .getApplicationData(APP_ID)
  
  // Subscribe to new data
  const tsNow = new Date().getTime();
  identity.account.dataSystem.applicationData.get(APP_ID);
  identity.account.dataSystem.applicationDataSubject
    .pipe(
      rxFilter(item => {
        // Return only items which are not older than 10 seconds
        if (item.data.timestamp > tsNow - (10 * 1000)) {
          return item;
        }
      })
    )
    .subscribe({
      next: item => {
          const data = item.data;
          
          // Reload database, because it doesn't reread the new file
          db.loadDatabase();

          console.log(`[${utils.timestampToHumanISODate(data.timestamp)}]: ${data.payload}`);
      },
      error: error => console.error('Error observing application data.', error)
  });
});


server.get('/api/surveys', (req, res, next) => {
  db.find({ applicationId: APP_ID })
    .exec((error, docs) => {
      if (error) {
        return next(new errors.InternalServerError(error))
      }

      // Sort from newest to oldest
      const sortedDocs = docs.sort((a, b) => {
        return b.timestamps.default - a.timestamps.default;
      });

      // const takeNDocs = sortedDocs.slice(0, 5);

      // Prepare data
      const data = sortedDocs.reduce((acc, x) => {
        let payload = x.payload;
        try {
          payload = JSON.parse(payload);
        } catch (e) {}

        if (payload.title) {
          acc[payload.id] = payload;
          acc.items.push(payload.id);
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

server.post('/api/create-survey', (req, res, next) => {
  const isValid = testSchema(req.body);
  if (!isValid) {
    console.log(ajv.errorsText(testSchema.errors))
    return next(
      new errors.BadRequestError(JSON.stringify(testSchema.errors))
    );
  }
  
  // Request valid
  const id = utils.random();
  const data = Object.assign({}, req.body, { id });
  const jsonData = JSON.stringify(data);

  radix.RadixTransactionBuilder
    .createPayloadAtom([identity.account], APP_ID, jsonData)
    .signAndSubmit(identity)
    .subscribe({
        next: item => {},
        complete:() => {
          res.send({ id });
          next();
        },
        error: error => {
          return next(
            new errors.InternalServerError(error)
          );
        }
  });
});

const schema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'shortDescription', 'questions', 'answers'],
  properties: {
    title: {
      type: 'string',
      minLength: 0,
      maxLength: 50
    },
    shortDescription: {
      type: 'string',
      minLength: 0,
      maxLength: 200
    },
    questions: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array'
        }
      }
    },
    answers: {
      type: 'object',
      required: ['items'],
      properties: {
        items: {
          type: 'array'
        }
      }
    },
  }
};
const testSchema = ajv.compile(schema);


server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
