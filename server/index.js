const restify = require('restify');
const errors = require('restify-errors');
const fs = require('fs');
const radix = require('radixdlt');
const Datastore = require('nedb');
const utils = require('./utils');
const rxOperators = require('rxjs/operators');
const rxFilter = rxOperators.filter;
const rxMap = rxOperators.map;

const APP_ID = 'dd-testing';

const server = restify.createServer({});
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




server.get('/api/survey-list', (req, res, next) => {
  db.find({/*  timestamps: { default: 1548848339432 }  */})
    .exec((error, docs) => {
    if (error) {
      return next(new errors.InternalServerError(error))
    }

    // Sort from newest to oldest
    const sortedDocs = docs.sort((a, b) => {
      return b.timestamps.default - a.timestamps.default;
    });

    const takeNDocs = sortedDocs.slice(0, 5);

    // Prepare data
    const data = takeNDocs.map(x => {
      let payload = x.payload;
      try {
        payload = JSON.parse(payload);
      } catch (e) {}

      return {
        payload: payload,
        timestamp: x.timestamps.default,
        date: utils.timestampToHumanISODate(x.timestamps.default),
        applicationId: x.applicationId,
        id: x._id,
        // raw: x
      };
    });
    res.send(data);
    return next();
  });
});

server.post('/api/create-survey', (req, res, next) => {
  const jsonData = JSON.stringify(req.body);
  radix.RadixTransactionBuilder
    .createPayloadAtom([identity.account], APP_ID, jsonData)
    .signAndSubmit(identity)
    .subscribe({
        next: item => {},
        complete:() => {
          res.send({ status: 'Stored' });
          next();
        },
        error: error => {
          return next(
            new errors.InternalServerError(error)
          );
        }
  });
});

server.listen(8080, function() {
  console.log('%s listening at %s', server.name, server.url);
});
