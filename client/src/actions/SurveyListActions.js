import { request } from '../utilities';

export const GET_SURVEYS_REQUEST = 'GET_SURVEYS_REQUEST';
export function getSurveysRequest() {
  return {
    type: GET_SURVEYS_REQUEST
  };
}

export const GET_SURVEYS_SUCCESS = 'GET_SURVEYS_SUCCESS';
export function getSurveysSuccess(data) {
  return {
    type: GET_SURVEYS_SUCCESS,
    data
  };
}

export const GET_SURVEYS_ERROR = 'GET_SURVEYS_ERROR';
export function getSurveysError(error) {
  return {
    type: GET_SURVEYS_ERROR,
    error
  };
}

export const GET_SURVEY_REQUEST = 'GET_SURVEY_REQUEST';
export const getSurveyRequest = () => ({
  type: GET_SURVEY_REQUEST
});

export const GET_SURVEY_SUCCESS = 'GET_SURVEY_SUCCESS';
export const getSurveySuccess = (data) => ({
  type: GET_SURVEY_SUCCESS,
  data
});
export const GET_SURVEY_ERROR = 'GET_SURVEY_ERROR';
export const getSurveyError = (error) => ({
  type: GET_SURVEY_ERROR,
  error
});


export const POST_SURVEY_ANSWERS_REQUEST = 'POST_SURVEY_ANSWERS_REQUEST';
export const postSurveyAnswersRequest = () => ({
  type: POST_SURVEY_ANSWERS_REQUEST
});

export const POST_SURVEY_ANSWERS_SUCCESS = 'POST_SURVEY_ANSWERS_SUCCESS';
export const postSurveyAnswersSuccess = (data) => ({
  type: POST_SURVEY_ANSWERS_SUCCESS,
  data
});
export const POST_SURVEY_ANSWERS_ERROR = 'POST_SURVEY_ANSWERS_ERROR';
export const postSurveyAnswersError = (error) => ({
  type: POST_SURVEY_ANSWERS_ERROR,
  error
});

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || window.location.origin;

export function getSurveys() {
  return async dispatch => {
    console.debug('getSurveys() request');
    dispatch(getSurveysRequest());
    try {
      const response = await request(`${API_ENDPOINT}/api/surveys`, {
        method: 'GET'
      });
      console.debug('getSurveys() success', response);
      dispatch(getSurveysSuccess(response));
    }
    catch (error) {
      console.error('getSurveys() error', error);
      dispatch(getSurveysError(error));
    }
  }
}



export function getSurvey(surveyId) {
  return async dispatch => {
    console.debug('getSurvey() request', surveyId);
    dispatch(getSurveyRequest());
    
    try {
      const response = await request(`${API_ENDPOINT}/api/surveys/${surveyId}`, {
        method: 'GET'
      });
      console.debug('getSurvey() success', response);
      dispatch(getSurveySuccess(response));
    }
    catch (error) {
      console.error('getSurvey() error', error);
      dispatch(getSurveyError(error));
    }
  }
}


export function postSurveyAnswers(surveyId, userRadixAddress, answers) {
  return async dispatch => {
    console.debug('postSurveyAnswers() request', { surveyId, userRadixAddress, answers });
    dispatch(postSurveyAnswersRequest());
    
    try {
      const response = await request(`${API_ENDPOINT}/api/surveys/${surveyId}/answers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userRadixAddress, answers })
      });
      console.debug('postSurveyAnswers() success', response);
      dispatch(postSurveyAnswersSuccess(response));
    }
    catch (error) {
      console.error('postSurveyAnswers() error', error);
      dispatch(postSurveyAnswersError(error));
    }
  }
}
