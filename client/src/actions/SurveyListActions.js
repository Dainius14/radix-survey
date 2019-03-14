import fetch from 'cross-fetch';

export const REQUEST_SURVEYS = 'REQUEST_SURVEYS';
export function requestSurveys() {
  return {
    type: REQUEST_SURVEYS
  };
}

export const RECEIVE_SURVEYS = 'RECEIVE_SURVEYS';
export function receiveSurveys(data) {
  return {
    type: RECEIVE_SURVEYS,
    data: data
  };
}

export const GET_SURVEY_REQUEST = 'GET_SURVEY_REQUEST';
export const getSurveyRequest = () => ({
  type: GET_SURVEY_REQUEST
});

export const GET_SURVEY_RESPONSE = 'GET_SURVEY_RESPONSE';
export const getSurveyResponse = (response) => ({
  type: GET_SURVEY_RESPONSE,
  response
});

export function getSurveys() {
  return dispatch => {
    dispatch(requestSurveys());
    
    return fetch('http://localhost:8080/api/surveys')
      .then(response => response.json(), error => console.log(error))
      .then(json => {
        dispatch(receiveSurveys(json));
        console.log('Surveys', json)
      })
  }
}



export function getSurvey(surveyId) {
  return dispatch => {
    dispatch(getSurveyRequest());
    
    return fetch(`http://localhost:8080/api/surveys/${surveyId}`, {
        method: 'GET',
      })
      .then(response => response.json(), error => console.log(error))
      .then(json => {
        dispatch(getSurveyResponse(json))
      });
  }
}