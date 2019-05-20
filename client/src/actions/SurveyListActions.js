import { request, history } from '../utilities';

export const CLOSE_PASSWORD_DIALOG = 'CLOSE_PASSWORD_DIALOG';
export function closePasswordDialog() {
  return {
    type: CLOSE_PASSWORD_DIALOG
  };
}

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


export const GET_SURVEY_RESULTS_REQUEST = 'GET_SURVEYS_RESULTS_REQUEST';
export function getSurveyResultsRequest() {
  return {
    type: GET_SURVEY_RESULTS_REQUEST
  };
}

export const GET_SURVEY_RESULTS_SUCCESS = 'GET_SURVEYS_RESULTS_SUCCESS';
export function getSurveyResultsSuccess(data) {
  return {
    type: GET_SURVEY_RESULTS_SUCCESS,
    data
  };
}

export const GET_SURVEY_RESULTS_ERROR = 'GET_SURVEYS_RESULTS_ERROR';
export function getSurveyResultsError(error) {
  return {
    type: GET_SURVEY_RESULTS_ERROR,
    error
  };
}

export const GET_SURVEY_RESULTS_NEED_PASSWORD = 'GET_SURVEY_RESULTS_NEED_PASSWORD';
export function getSurveyResultsNeedPassword() {
  return {
    type: GET_SURVEY_RESULTS_NEED_PASSWORD
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


export const BUY_SURVEY_RESULTS_REQUEST = 'BUY_SURVEY_RESULTS_REQUEST';
export const buySurveyResultsRequest = () => ({
  type: BUY_SURVEY_RESULTS_REQUEST
});

export const BUY_SURVEY_RESULTS_SUCCESS = 'BUY_SURVEY_RESULTS_SUCCESS';
export const buySurveyResultsSuccess = (data) => ({
  type: BUY_SURVEY_RESULTS_SUCCESS,
  data
});

export const BUY_SURVEY_RESULTS_ERROR = 'BUY_SURVEY_RESULTS_ERROR';
export const buySurveyResultsError = (error) => ({
  type: BUY_SURVEY_RESULTS_ERROR,
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


export function getSurveyResults(surveyId, password) {
  return async dispatch => {
    console.debug('getSurveyResults() request', surveyId);
    dispatch(getSurveyResultsRequest());
    
    try {
      const response = await request(`${API_ENDPOINT}/api/surveys/${surveyId}/responses`, {
        method: 'GET',
        headers: {
          'Authorization': password || ''
        }
      });
      console.debug('getSurveyResults() success', response);
      dispatch(getSurveyResultsSuccess(response));
    }
    catch (error) {
      if (error.status === 401) {
        console.debug('getSurveyResults() Unauthorized')
        dispatch(getSurveyResultsNeedPassword());
        return;
      }
      console.error('getSurveyResults() error', error);
      dispatch(getSurveyResultsError(error));
    }
  }
}


export function postSurveyAnswers(surveyId, surveyResponse, antMessage) {
  return async dispatch => {
    console.debug('postSurveyAnswers() request', { surveyId, surveyResponse });
    dispatch(postSurveyAnswersRequest());
    
    try {
      const response = await request(`${API_ENDPOINT}/api/surveys/${surveyId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(surveyResponse)
      });
      console.debug('postSurveyAnswers() success', response);
      dispatch(postSurveyAnswersSuccess(response));
      antMessage.config({ top: 50 });
      antMessage.success('Answers submitted successfully!', 5);
    }
    catch (error) {
      console.error('postSurveyAnswers() error', error);
      if (error.message === 'radixAddress_repeat') {
        antMessage.config({ top: 50 });
        antMessage.error('Response with that RadixDLT addres has already been submitted!', 5);
        dispatch(postSurveyAnswersSuccess(error));
      }
      else {
        dispatch(postSurveyAnswersError(error));
      }
    }
  }
}


export function buySurveyResults(surveyId, radixAddress) {
  return async dispatch => {
    console.debug('buySurveyResults() request', { surveyId, radixAddress });
    dispatch(buySurveyResultsRequest());
    
    try {
      const response = await request(`${API_ENDPOINT}/api/surveys/${surveyId}/responses/buy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ radixAddress })
      });
      console.debug('buySurveyResults() success', response);
      dispatch(buySurveyResultsSuccess(response));
      history.push(`/surveys/${surveyId}/responses`)
    }
    catch (error) {
      console.error('buySurveyResults() error', error);
      dispatch(buySurveyResultsError(error));
    }
  }
}
