import { radixUniverse, RadixUniverse, RadixLogger, RadixKeyStore, RadixSimpleIdentity, RadixAtom, RadixTransactionBuilder, RadixNEDBAtomCache, radixTokenManager, RadixAccount, RadixApplicationData, RadixKeyPair, RadixTokenClass } from 'radixdlt';
import logger from './logger';
import nanoid from 'nanoid';


export default class RadixAPI {
  public readonly appID: string;
  public readonly token: RadixTokenClass;
  public readonly tokenLabel: string;
  private readonly cacheFilePath: string;

  private identity!: RadixSimpleIdentity;
  private account!: RadixAccount;

  // private submittedData: []
  

  constructor(appID: string, cacheFilePath: string, radixLoggerLevel: string = 'warn') {
    this.cacheFilePath = 'E:\\radix-survey-bakis\\server\\cache.db';
    this.appID = appID;

    RadixLogger.setLevel(radixLoggerLevel);  // Available levels: trace/debug/info/warn/error
    radixUniverse.bootstrap(RadixUniverse.ALPHANET);
    this.token = radixTokenManager.getTokenByISO('TEST');
    this.tokenLabel = (this.token as any).label;
  }

  async initialize(key: any, password: string) {
    const keyPair = await RadixKeyStore.decryptKey(key, password);
    this.identity = new RadixSimpleIdentity(keyPair);
    this.account = this.identity.account;
    this.account.enableCache(new RadixNEDBAtomCache(this.cacheFilePath));
    this.account.openNodeConnection();
    this.subscribeToDataSystem();
    this.subscribeToTransferSystem();
    logger.info('radix.initiliaze.connection_open');
    return Promise.resolve();
  }


  transferTokens(toAddress: string, amount: number, message: string) {
    logger.info(`radix.transferToken.to=${toAddress}.amount=${amount}${this.tokenLabel}.msg="${message}"`);
    const toAccount = RadixAccount.fromAddress(toAddress, true);
    RadixTransactionBuilder
      .createTransferAtom(this.account, toAccount, this.token, amount, message)
      .signAndSubmit(this.identity)
      .subscribe({
        next: state => {
          logger.debug(`radix.transferToken.next.to=${this.shortenAddress(toAddress)}.state=${state}`);
        },
        complete: () => {
          logger.info(`radix.transferToken.complete.to=${this.shortenAddress(toAddress)}}`);
        },
        error: error => {
          logger.error(`radix.transferToken.error.to=${this.shortenAddress(toAddress)}.error=${error}`);
        }
      });
  }

  sendMessage(toAddress: string, message: string) {
    logger.info(`radix.sendMessage.to=${toAddress}.msg="${message}"`);
    const toAccount = RadixAccount.fromAddress(toAddress, true);
    RadixTransactionBuilder
      .createRadixMessageAtom(this.account, toAccount, message)
      .signAndSubmit(this.identity)
      .subscribe({
        next: state => {
          logger.debug(`radix.sendMessage.next.to=${this.shortenAddress(toAddress)}.state=${state}`);
        },
        complete: () => {
          logger.info(`radix.sendMessage.complete.to=${this.shortenAddress(toAddress)}}`);
        },
        error: error => {
          logger.error(`radix.sendMessage.error.to=${this.shortenAddress(toAddress)}.error=${error}`);
        }
      })
  }

  private submitDataAtom(data: string) {
    logger.info(`radix.storeDataAtom`);
    return new Promise(resolve => {
      RadixTransactionBuilder
      .createPayloadAtom([this.account], this.appID, data)
      .signAndSubmit(this.identity)
      .subscribe({
        next: state => {
          logger.debug(`radix.storeDataAtom.next  [Data atom ID: ${data.substr(0, 26)}]  [State: ${state}]`);
        },
        complete: () => {
          logger.info(`radix.storeDataAtom.complete  [Data atom ID: ${data.substr(0, 26)}]`);
          resolve(true);
        },
        error: error => {
          logger.error(`radix.storeDataAtom.error [Error: ${error}]`);
        }
      });
    });
  }

  /**
   * Given an object, splits it into smaller parts (if needed) and submits it to the ledger.
   * @param givenData an object to be stored on the ledger
   * @returns ID of the object once all of its part are stored
   */
  async submitData(givenData: object): Promise<string> {
    if ((givenData as any).id) throw new Error('Object should not have an ID property');

    const id = nanoid();
    const data = { ...givenData, id };
    const json = JSON.stringify(data);
    
    // Split JSON string into 900 Byte parts
    const jsonParts = [];
    let jsonPart = '';
    for (let i = 0; i < json.length; i++) {
      jsonPart += json[i];

      if (Buffer.byteLength(jsonPart) >= 890) {
        jsonParts.push(jsonPart);
        jsonPart = '';
      }
    }
    // Data was smaller than the limit or there is a leftover
    if (jsonParts.length === 0 || jsonPart.length !== 0) {
      jsonParts.push(jsonPart);
    }

    // For each part, prepend 23 char long (21B) part ID which is data ID + padded part index
    // <id>$<001>$<data>.
    // With 999 part should hold around 868 kB of data.
    const prepedJsonParts = jsonParts.map((part, index) => {
      const partId = `${id}$${index.toString().padStart(3, '0')}$`;
      return partId + part;
    });

    await Promise.all(prepedJsonParts.map(async x => await this.submitDataAtom(x)));
    return id;
  }

  getData(id: string) {
    const filteredAtoms = this.getAppData()
      .filter(x => x.payload.split('$', 1)[0] === id)
      .map(x => x.payload.split('$', 3))
    const sortedAtoms = filteredAtoms
      .sort((a, b) => parseInt(a[1]) - parseInt(b[1]))
    const dataStr = sortedAtoms
      .map(x => x[2])
      .join('');
    try {
      return JSON.parse(dataStr);
    }
    catch (e) {
      return null;
    }
  }


  private subscribeToTransferSystem() {
    // Subscribe for all previous transactions as well as new ones
    this.account.transferSystem
      .getAllTransactions()
      .subscribe(transactionUpdate => {
        logger.debug('radix.transferSystem.new_transaction:', transactionUpdate);
        
        const transaction = transactionUpdate.transaction;
        if (!transaction) {
          logger.error('radix.transferSystem.new_transaction.is_empty:', transactionUpdate);
          return;
        }
        
        const participants: string[] = Object.values(transaction.participants);
        if (participants.length === 0) {
          logger.error('radix.transferSystem.new_transaction.no_participants:', transactionUpdate);
          return;
        }

        const balance = this.token.toTokenUnits((transaction.balance as any)[this.token.id.toString()])
        if (participants.length > 1) {
          logger.warn('radix.transferSystem.new_transaction.more_than_one_participant:', transactionUpdate);
        }
        const transactionFrom = participants[0];
        // logger.info(`radix.transferSystem.new_transaction  [From: ${transactionFrom}]  [Balance: ${balance}${this.token.iso}]`);
        


      //   // Buy results
      //   logger.info(`Received a transaction of ${balance} ${this.tokenLabel} from ${transactionFrom}`);
        
      //   const waitingForPurchase = surveysWaitingForResultsPurchase.find((x: any) => transactionFrom.startsWith(x.radixAddress));
      //   if (waitingForPurchase) {
      //     logger.info(`There is a survey '${waitingForPurchase.survey.title}' waiting for its results to be bought`);
      //     buyResults(waitingForPurchase, balance);
      //   }



      //   // Publish paid survey
      //   const paidSurveyWaitingForTokens = paidSurveysWaitingForTokens.find((x: any) => transactionFrom.startsWith(x.radixAddress));
      //   if (paidSurveyWaitingForTokens) {
      //     const survey = paidSurveyWaitingForTokens;
      //     logger.info(`Found survey '${survey.title}' waiting for a transaction of ${survey.totalReward}`);

      //     if (balance >= survey.totalReward) {
      //       logger.info(`Received tokens are sufficient`);
      //       submitSurveyToRadix(survey);
      //     }
      //     else {
      //       logger.info(`Received ${balance} tokens are not sufficient (required ${survey.totalReward})`);
      //     }
      // }
    });

  }

  private subscribeToDataSystem() {
    this.account.dataSystem.getApplicationData(this.appID)
      .subscribe({
        next: item => {
          logger.info(`radix.dataSystem.new_data  [TS: ${item.data.timestamp}]`);
          // const data = item.data;
          // let payload: any;
          // try {
          //   payload = JSON.parse(data.payload);
          // }
          // catch {
          //   return
          // }
          // logger.info(`Received new ${payload.type} (created at: ${data.timestamp}). Radix ID: ${data.hid}.`);

          // const waitingResponse = surveysWaitingForId[payload.data.created];
          // if (waitingResponse && waitingResponse.title === (payload.data as Survey).title) {
          //   logger.info('Found request waiting for response');
          //   waitingResponse.res.send({ id: data.hid });
          //   waitingResponse.next();
          //   delete surveysWaitingForId[payload.data.created];
          // }
        },
        error: error => logger.error('radix.dataSystem.subscribe_error: ', JSON.stringify(error, null, 2))
      });

  }

  private shortenAddress(address: string) {
    return `${address.substr(0, 5)}...${address.substr(address.length - 5)}`
  }


  private getAppData(): RadixApplicationData[] {
    const appData = this.account.dataSystem.applicationData.get(this.appID);
    if (appData) {
      return appData.values();
    }
    return [];
  }

}



// RadixKeyStore.decryptKey(key, process.env.KEY_PASSWORD as string)
//   .then((keyPair: RadixKeyPair) => {
//     account.enableCache(new RadixNEDBAtomCache('./cache.db'));
//     account.openNodeConnection();
//     logger.info('Account address: ' + account.getAddress());

//     // Subscribe for all previous transactions as well as new ones
//     account.transferSystem.getAllTransactions().subscribe(transactionUpdate => {
//       logger.debug('Received transaction update:', transactionUpdate);

//       const transaction = transactionUpdate.transaction;
//       if (!transaction) {
//         logger.error('Received transaction is empty:', transactionUpdate);
//         return;
//       }

//       const participants: string[] = Object.values(transaction.participants);
//       if (participants.length === 0) {
//         logger.error('Received transaction with no participants:', transactionUpdate);
//         return;
//       }

//       const balance = radixToken.toTokenUnits((transaction.balance as any)[radixToken.id.toString()])
//       if (participants.length > 1) {
//         logger.warn('There is more than one participant:', transactionUpdate);
//       }
      


//       // Buy results
//       const transactionFrom = participants[0];
//       logger.info(`Received a transaction of ${balance} ${(radixToken as any).label} from ${transactionFrom}`);
      
//       const waitingForPurchase = surveysWaitingForResultsPurchase.find((x: any) => transactionFrom.startsWith(x.radixAddress));
//       if (waitingForPurchase) {
//         logger.info(`There is a survey '${waitingForPurchase.survey.title}' waiting for its results to be bought`);
//         buyResults(waitingForPurchase, balance);
//       }



//       // Publish paid survey
//       const paidSurveyWaitingForTokens = paidSurveysWaitingForTokens.find((x: any) => transactionFrom.startsWith(x.radixAddress));
//       if (paidSurveyWaitingForTokens) {
//         const survey = paidSurveyWaitingForTokens;
//         logger.info(`Found survey '${survey.title}' waiting for a transaction of ${survey.totalReward}`);

//         if (balance >= survey.totalReward) {
//           logger.info(`Received tokens are sufficient`);
//           submitSurveyToRadix(survey);
//         }
//         else {
//           logger.info(`Received ${balance} tokens are not sufficient (required ${survey.totalReward})`);
//         }
//       }
//     });


//     // Subscribe to all data
//     account.dataSystem.getApplicationData(process.env.APP_ID as string)
//       .subscribe({
//         next: item => {
//           const data = item.data;
//           let payload: any;
//           try {
//             payload = JSON.parse(data.payload);
//           }
//           catch {
//             return
//           }
//           logger.info(`Received new ${payload.type} (created at: ${data.timestamp}). Radix ID: ${data.hid}.`);

//           const waitingResponse = surveysWaitingForId[payload.data.created];
//           if (waitingResponse && waitingResponse.title === (payload.data as Survey).title) {
//             logger.info('Found request waiting for response');
//             waitingResponse.res.send({ id: data.hid });
//             waitingResponse.next();
//             delete surveysWaitingForId[payload.data.created];
//           }
//         },
//         error: error => logger.error('Error observing application data: ' + JSON.stringify(error, null, 2))
//       });
    
// });
