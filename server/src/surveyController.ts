import Ajv from 'ajv';
import bcrypt from 'bcrypt';

import { Survey, Response, ResponseVisibility, SurveyVisibility, SurveyType } from './types';
import { surveySchema, responseSchema } from './jsonSchemas';
import RadixAPI, { DataType } from './radixApi';
import logger from './logger';

class SurveyController {
  private radixApi: RadixAPI;
  private ajv: any;
  private testResponse: Ajv.ValidateFunction;
  private testSurvey: Ajv.ValidateFunction;

  constructor(radixApi: RadixAPI) {
    this.radixApi = radixApi;

    this.ajv = Ajv({ allErrors: true });
    this.testSurvey = this.ajv.compile(surveySchema);
    this.testResponse = this.ajv.compile(responseSchema);
  }

  /**
   * Returns a list of surveys, that have property surveyVisibility set to Public.
   */
  async getPublicSurveys(): Promise<Survey[]> {
    const responses = this.radixApi.getResponses();
    const res = await Promise.all(this.radixApi.getSurveys()
      .filter(x => x.surveyVisibility === SurveyVisibility.Public)
      .map(async x => await this.prepareSurveyData(x, responses)))
      return res;
  }

  /**
   * Returns a list of all responses belonging to survey.
   * @param surveyId Survey ID to get responses for
   */
  getSurveyResponses(surveyId: string): Response[] {
    return this.radixApi.getResponses()
      .filter(x => x.surveyId === surveyId);
  }

  /**
   */
  /**
   * 
   * Returns a single survey with additional data.
   * @throws {ItemNotFound} if no data with given ID exists
   * @param surveyId 
   * @param responsesPassword 
   */
  async getSurveyById(surveyId: string, responsesPassword?: string): Promise<Survey> {
    const survey = this.radixApi.getDataById(surveyId);
    if (!survey) {
      throw new ItemNotFoundError('Survey with provided ID not found');
    }
    return await this.prepareSurveyData(survey, undefined, responsesPassword);
  }


  async createSurvey(surveyData: {}): Promise<string> {
    const isValid = this.testSurvey(surveyData);
    if (!isValid) {
      throw new RangeError(this.ajv.errorsText(this.testSurvey.errors));
    }

    const survey = { ...surveyData, created: new Date().getTime() } as Survey;

    if (survey.responseVisibility !== ResponseVisibility.Public) {
      survey.responsePasswordHashed = bcrypt.hashSync(survey.responsePassword, 5);
      delete survey.responsePassword;
    }

    if (survey.surveyType === SurveyType.Free) {
      // Survey is free, don't wait for any transfer and just create
      const id = await this.radixApi.submitData(survey, DataType.Survey);
      return id;
    }
    else {
      // Survey is paid, wait for transaction
      return new Promise(resolve => {
        this.radixApi.transactionSubject.subscribe({
          next: update => {
            const transaction = update.transaction;
            if (!transaction) return;

            const participants: string[] = Object.values(transaction.participants);
            if (participants.length === 0) return;
            const transactionFrom = participants[0];
            const balance = this.radixApi.getTransactionBalance(transaction.balance);

            if (transactionFrom.startsWith(survey.radixAddress) && balance >= survey.totalReward) {
              const id = this.radixApi.submitData(survey, DataType.Survey);
              resolve(id);
            }
          }
        })
      });
    }
  }

  async createResponse(surveyId: string, responseData: {}): Promise<any> {
    const isValidResponse = this.testResponse(responseData);
    if (!isValidResponse) throw new InvalidResponseFormatError(this.ajv.errorsText(this.testResponse.errors));    
    const survey = await this.getSurveyById(surveyId);
    if (!this.isValidResponseForSurvey(survey, responseData)) throw new InvalidResponseFormatError();

    // Response is valid
    const response = { ...responseData, created: new Date().getTime(), surveyId: survey.id } as Response;
    
    // if (survey.surveyType === SurveyType.Paid) {
    //   switch (survey.winnerSelection) {
    //     case WinnerSelection.FirstN: {
    //       const answerCount = getSurveyResponses(survey.id).length;
    //       logger.debug(`Survey answer count is ${answerCount} and first ${survey.winnerCount} people must be rewarded`);

    //       if (answerCount <= survey.winnerCount) {
    //         const msg = `Reward for participation in "${survey.title}" survey`;
    //         transferTokens(answers.radixAddress, survey.totalReward / survey.winnerCount, msg);
    //       }
    //     }
    //     default:
    //       break;
    //   }
    // }
    return await this.radixApi.submitData(response, DataType.Response);
  }

  private isValidResponseForSurvey(survey: Survey, responseData: {}) {
    return true;
  }

  /**
   * Prepares survey by adding extra properties, removing password etc.
   * @param surveyToPrepare survey to prepare
   * @param responses if responses are given, a separate call to get responses is not made
   * @param responsesPassword if password for responses are given, it is checked against one in the survey to add responses
   */
  private async prepareSurveyData(surveyToPrepare: Survey, responses?: Response[], responsesPassword?: string): Promise<Survey> {
    const survey = { ...surveyToPrepare };

    if (!responses) responses = this.getSurveyResponses(survey.id);

    survey.totalResponses = responses.length;
    if (responses.length === 0) {
      survey.firstResponse = null;
      survey.lastResponse = null;
    }
    else {
      survey.firstResponse = responses.reduce((acc, response) => Math.min(response.created, acc), responses[0].created);
      survey.lastResponse = responses.reduce((acc, response) => Math.max(response.created, acc), responses[0].created);
    }

    if (survey.responseVisibility === ResponseVisibility.Public) {
      // Response visibility is public, add them
      survey.responses = responses;
    }
    else if (responsesPassword) {
      // If a password is given and is correct, add responses, otherwise throw error that the password is wrong
      if (await bcrypt.compare(responsesPassword, survey.responsePasswordHashed)) {
        survey.responses = responses;
      }
      else throw new WrongResponsesPasswordError('Wrong password for private responses');
    }
    
    delete survey.responsePasswordHashed;
    return survey;
  }
}

// export class ItemNotFoundError extends Error {
//   constructor(msg: string) {
//     super(msg);
//     this.name = 'ItemNotFoundError';
//   }
// }
export class ItemNotFoundError extends Error {
  private __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}
export class WrongResponsesPasswordError extends Error { 
  private __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message);
    this.__proto__ = trueProto;
  }
}

export class InvalidResponseFormatError extends Error { 
  private __proto__: Error;
  constructor(message?: string) {
    const trueProto = new.target.prototype;
    super(message || 'Answers for questions do not map correctly');
    this.__proto__ = trueProto;
  }
}


export default SurveyController;
