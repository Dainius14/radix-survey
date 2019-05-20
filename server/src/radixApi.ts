import { radixUniverse, RadixUniverse, RadixLogger, RadixKeyStore, RadixSimpleIdentity, RadixTransactionBuilder, RadixNEDBAtomCache, radixTokenManager, RadixAccount, RadixApplicationData, RadixTokenClass, RadixTransactionUpdate, RadixTransferAccountSystem, RadixTokenManager } from 'radixdlt';
import logger from './logger';
import nanoid from 'nanoid';
import { Survey, Response } from './types';
import { Subject } from 'rxjs';


export default class RadixAPI {
  public readonly appID: string;
  public readonly token: RadixTokenClass;
  public readonly tokenLabel: string;

  private identity!: RadixSimpleIdentity;
  private account!: RadixAccount;

  public transactionSubject!: Subject<RadixTransactionUpdate>;

  constructor(appID: string, radixLoggerLevel: string = 'warn') {
    logger.info(`radix  [App ID: ${appID}]`);
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
    this.account.enableCache(new RadixNEDBAtomCache('./cache.db'));
    this.account.openNodeConnection();
    this.transactionSubject = this.account.transferSystem.transactionSubject;

    // this.subscribeToDataSystem();
    this.subscribeToTransferSystem();

    logger.info('radix.initiliaze.connection_open');
    return Promise.resolve();
  }


  /**
   * Transfers tokens to other account.
   * @param toAddress account address to send tokens to
   * @param amount number of tokens to send in decimals
   * @param message additional message to add
   */
  transferTokens(toAddress: string, amount: number, message?: string) {
    logger.info(`radix.transferToken  [To: ${toAddress}]  [Amount: ${amount} ${this.tokenLabel}]  [Msg: ${message}]`);
    const toAccount = RadixAccount.fromAddress(toAddress, true);
    RadixTransactionBuilder
      .createTransferAtom(this.account, toAccount, this.token, amount, message)
      .signAndSubmit(this.identity)
      .subscribe({
        next: state => {
          logger.debug(`radix.transferToken.next  [To: ${this.shortenAddress(toAddress)}]  [State: ${state}]`);
        },
        complete: () => {
          logger.info(`radix.transferToken.complete  [To: ${this.shortenAddress(toAddress)}]`);
        },
        error: error => {
          logger.error(`radix.transferToken.error  [To: ${this.shortenAddress(toAddress)}]  [Error: ${error}]`);
        }
      });
  }

  /**
   * Sends a message to other account.
   * @param toAddress account address to send message to
   * @param message message to send
   */
  sendMessage(toAddress: string, message: string) {
    logger.info(`radix.sendMessage  [To: ${toAddress}]  [Msg: ${message}]`);
    const toAccount = RadixAccount.fromAddress(toAddress, true);
    RadixTransactionBuilder
      .createRadixMessageAtom(this.account, toAccount, message)
      .signAndSubmit(this.identity)
      .subscribe({
        next: state => {
          logger.debug(`radix.sendMessage.next  [To: ${this.shortenAddress(toAddress)}]  [State: ${state}]`);
        },
        complete: () => {
          logger.info(`radix.sendMessage.complete  [To: ${this.shortenAddress(toAddress)}]`);
        },
        error: error => {
          logger.error(`radix.sendMessage.error  [To: ${this.shortenAddress(toAddress)}]  [Error: ${error}]`);
        }
      })
  }

  /**
   * Submits payload atom to the ledger.
   * @param data some data to store
   * @returns {Promise<void>} if data is storred successfully
   */
  private submitPayloadAtom(data: string): Promise<void> {
    logger.info(`radix.storeDataAtom  [Payload: ${data.substr(0, 28)}]`);
    return new Promise((resolve, reject) => {
      RadixTransactionBuilder
      .createPayloadAtom([this.account], this.appID, data)
      .signAndSubmit(this.identity)
      .subscribe({
        next: state => {
          logger.debug(`radix.storeDataAtom.next  [Payload: ${data.substr(0, 28)}]  [State: ${state}]`);
        },
        complete: () => {
          logger.info(`radix.storeDataAtom.complete  [Payload: ${data.substr(0, 28)}]`);
          resolve();
        },
        error: error => {
          logger.error(`radix.storeDataAtom.error [Payload: ${data.substr(0, 28)}]  [Error: ${error}]`);
          reject(error);
        }
      });
    });
  }

  /**
   * Given an object, splits it into smaller parts (if needed) and submits it to the ledger.
   * @param data an object to be stored on the ledger
   * @returns ID of the object once all of its part are stored
   */
  async submitData(data: object, type: DataType): Promise<string> {
    if ((data as any).id) throw new Error('Data should not have an ID property');

    const id = nanoid();
    const json = JSON.stringify({ ...data, id });
    
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

    // For each part, prepend 23 char long (21B) part ID which is data ID + padded part index + type
    // <id>$<001>$<type>$<data>.
    // With 999 part should hold around 868 kB of data.
    const prepedJsonParts = jsonParts.map((part, index) => {
      const partId = `${id}$${index.toString().padStart(3, '0')}$${type}$`;
      return partId + part;
    });

    await Promise.all(prepedJsonParts.map(async x => await this.submitPayloadAtom(x)));
    return id;
  }

  private getDataByType(type: DataType) {
    return this.getAppData()
      .filter(x => x.type === type)
      .sort((a, b) => parseInt(a.partId) - parseInt(b.partId))
      .reduce((acc: any, x) => {
        if (!acc[x.id]) acc[x.id] = '';
        acc[x.id] += x.data;
        return acc;
      }, {});
  }

  getSurveys() {
    return Object.values(this.getDataByType(DataType.Survey))
      .map((x) => {logger.info(x); return JSON.parse(x as string) as Survey});
  }

  getResponses() {
    return Object.values(this.getDataByType(DataType.Response))
      .map((x) => JSON.parse(x as string) as Response);
  }

  getDataById(id: string) {
    const dataStr = this.getAppData()
      .filter(x => x.id === id)
      .sort((a, b) => parseInt(a.partId) - parseInt(b.partId))
      .map(x => x.data)
      .join('');
    try {
      return JSON.parse(dataStr);
    }
    catch (e) {
      return null;
    }
  }

  /**
   * Convert subunits token amount to actual decimal token amount.
   * @param balance 
   */
  getTransactionBalance(balance: any) {
    return this.token.toTokenUnits((balance)[this.token.id.toString()])
  }

  private subscribeToTransferSystem(all: boolean = false) {
    // Subscribe for all previous transactions as well as new ones
    let transferSystem: any = this.transactionSubject;
    if (all) {
      transferSystem = this.account.transferSystem.getAllTransactions();
    }

    transferSystem
      .subscribe((transactionUpdate: RadixTransactionUpdate) => {
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
        logger.info(`radix.transferSystem.new_transaction  [From: ${transactionFrom}]  [Balance: ${balance}${this.token.iso}]`);
        


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

  private getAppData(): DataPayload[] {
    const appData = this.account.dataSystem.applicationData.get(this.appID);
    if (appData) {
      return appData.values()
        .map(x => {
          const id = x.payload.substr(0, 21);
          const partId = x.payload.substr(22, 3);
          const type = x.payload.substr(26, 2);
          const data = x.payload.substr(29);
          return { id, partId, type, data } as DataPayload;
        });
    }
    return [];
  }
}

export enum DataType {
  Survey = '00',
  Response = '01'
}

type DataPayload = {
  /** 21 char long */
  id: string;
  /** 3 char long */
  partId: string;
  /** 2 char long */
  type: DataType;
  data: string;
}