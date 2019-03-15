import fetch from 'cross-fetch';
import { checkIfResponseOk } from '../utilities';

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
export const getSurveySuccess = (response) => ({
  type: GET_SURVEY_SUCCESS,
  response
});
export const GET_SURVEY_ERROR = 'GET_SURVEY_ERROR';
export const getSurveyError = (error) => ({
  type: GET_SURVEY_ERROR,
  error
});

export function getSurveys() {
  return dispatch => {
    dispatch(getSurveysRequest());
    return fetch('http://localhost:8080/api/surveys', {
        method: 'GET'
      })
      .then(checkIfResponseOk)
      .then(response => {
        console.debug('getSurveys() response:', response);
        return response.json();
      })
      .then(responseJson => {
        console.debug('getSurveys() json:', responseJson);
        dispatch(getSurveysSuccess(responseJson));
      })
      .catch(error => {
        console.error('getSurveys() error:', error);
        dispatch(getSurveysError(error));
      });
  }
}



export function getSurvey(surveyId) {
  return dispatch => {
    dispatch(getSurveyRequest());
    
    return fetch(`http://localhost:8080/api/surveys/${surveyId}`, {
        method: 'GET'
      })
      .then(checkIfResponseOk)
      .then(response => {
        console.debug('getSurvey() response:', response);
        return response.json();
      })
      .then(responseJson => {
        console.debug('getSurveys() json:', responseJson);
        dispatch(getSurveySuccess(responseJson));
      })
      .catch(error => {
        console.error('getSurvey() error:', error);
        dispatch(getSurveyError(error));
      });
  }
}
