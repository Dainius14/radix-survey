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

export function fetchSurveyList() {
  return dispatch => {
    dispatch(requestSurveys());
    
    return fetch('http://localhost:8080/api/survey-list')
      .then(response => response.json(), error => console.log(error))
      .then(json => {
        dispatch(receiveSurveys(json))
      })
  }
}

