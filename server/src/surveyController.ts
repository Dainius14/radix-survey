import Ajv from 'ajv';
import bcrypt from 'bcrypt';

import { Survey, Response, ResultsVisibility, SurveyVisibility, SurveyType } from './types';
import { surveySchema, responseSchema } from './jsonSchemas';
import RadixAPI from './radixApi';
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
  getPublicSurveys(): Survey[] {
    const responses = this.radixApi.getResponses();
    return this.radixApi.getSurveys()
      .filter(x => x.surveyVisibility === SurveyVisibility.Public)
      .map(x => this.prepareSurveyData(x, responses));
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
   * Returns a single survey with additional data.
   */
  getSurveyById(surveyId: string): Survey | null {
    const survey = this.radixApi.getDataById(surveyId);
    if (!survey) {
      return null;
    }
    return this.prepareSurveyData(survey);
  }


  createSurvey(surveyData: {}) {
    const isValid = this.testSurvey(surveyData);
    if (!isValid) {
      throw new RangeError(this.ajv.errorsText(this.testSurvey.errors));
    }

    const survey = { ...surveyData, created: new Date().getTime() } as Survey;

    if (survey.resultsVisibility !== ResultsVisibility.Public) {
      survey.resultsPasswordHashed = bcrypt.hashSync(survey.resultsPassword, 5);
      delete survey.resultsPassword;
    }

    if (survey.surveyType === SurveyType.Free) {
      const id = this.radixApi.submitData(survey, 'survey');
      return id;
    }
  }

  /**
   * Prepares survey by adding extra properties, removing password etc.
   * @param surveyToPrepare survey to prepare
   * @param responses if responses are given, a separate call is not made
   */
  private prepareSurveyData(surveyToPrepare: Survey, responses?: Response[]): Survey {
    const survey = { ...surveyToPrepare };
    delete survey.resultsPasswordHashed;

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

    if (survey.resultsVisibility === ResultsVisibility.Public) {
      survey.responses = responses;
    }
    return survey;
  }

}

export default SurveyController;
