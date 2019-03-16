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
    console.debug('getSurveys() request');
    dispatch(getSurveysRequest());
    return request('http://localhost:8080/api/surveys', {
        method: 'GET'
      })
      .then(response => {
        console.debug('getSurveys() success', response);
        dispatch(getSurveysSuccess(response));
      })
      .catch(error => {
        console.error('getSurveys() error', error);
        dispatch(getSurveysError(error));
      });
  }
}



export function getSurvey(surveyId) {
  return dispatch => {
    console.debug('getSurvey() request', surveyId);
    dispatch(getSurveyRequest());
    
    return request(`http://localhost:8080/api/surveys/${surveyId}`, {
        method: 'GET'
      })
      .then(response => {
        console.debug('getSurvey() success', response);
        dispatch(getSurveySuccess(response));
      })
      .catch(error => {
        console.error('getSurvey() error', error);
        dispatch(getSurveyError(error));
      });
  }
}
