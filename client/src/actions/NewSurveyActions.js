import { request } from '../utilities';

export const EDIT_SURVEY_PROPERTY = 'CHANGE_NEW_SURVEY_INPUT_VALUE';
export const editSurveyProperty = (property, value) => ({
  type: EDIT_SURVEY_PROPERTY,
  property,
  value
});

let questionId = 0;
export const ADD_QUESTION = 'ADD_QUESTION';
export const addQuestion = () => ({
  type: ADD_QUESTION,
  questionId: questionId++
})

export const REMOVE_QUESTION = 'REMOVE_QUESTION';
export const removeQuestion = (questionId) => ({
  type: REMOVE_QUESTION,
  questionId
});

export const EDIT_QUESTION_PROPERTY = 'CHANGE_QUESTION_PROPERTY';
export const editQuestionProperty = (questionId, property, value) => ({
  type: EDIT_QUESTION_PROPERTY,
  questionId,
  property,
  value
});

let answerId = 0;
export const ADD_ANSWER_CHOICE = 'ADD_ANSWER_CHOICE';
export const addAnswerChoice = (questionId) => ({
  type: ADD_ANSWER_CHOICE,
  answerId: answerId++,
  questionId
});

export const REMOVE_ANSWER_CHOICE = 'REMOVE_ANSWER_CHOICE';
export const removeAnswerChoice = (questionId, answerId) => ({
  type: REMOVE_ANSWER_CHOICE,
  questionId,
  answerId
});

export const EDIT_ANSWER_CHOICE_PROPERTY = 'EDIT_ANSWER_CHOICE_PROPERTY';
export const editAnswerChoiceProperty = (questionId, answerId, property, value) => ({
  type: EDIT_ANSWER_CHOICE_PROPERTY,
  questionId,
  answerId,
  property,
  value
});

export const POST_SURVEY_REQUEST = 'POST_SURVEY_REQUEST';
export const postSurveyRequest = () => ({
  type: POST_SURVEY_REQUEST
});

export const POST_SURVEY_SUCCESS = 'POST_SURVEY_SUCCESS';
export const postSurveySuccess = (data) => ({
  type: POST_SURVEY_SUCCESS,
  data
});

export const POST_SURVEY_ERROR = 'POST_SURVEY_ERROR';
export const postSurveyError = (error) => ({
  type: POST_SURVEY_ERROR,
  error
});



export function postSurvey(survey) {
  return async dispatch => {
    console.debug('postSurvey() request', survey);
    dispatch(postSurveyRequest());
    
    try {
      const response = await request('http://localhost:8080/api/create-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(survey)
      });
      console.debug('postSurvey() success', response);
      dispatch(postSurveySuccess(response));
    }
    catch (error) {
      console.error('postSurvey() error', error);
      dispatch(postSurveyError(error));
    }
  }
}

