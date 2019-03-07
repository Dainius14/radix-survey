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

export const EDIT_QUESTION_PROPERTY = 'CHANGE_NEW_SURVEY_QUESTION_PROPERTY';
export const editQuestionProperty = (questionId, property, value) => ({
  type: EDIT_QUESTION_PROPERTY,
  questionId,
  property,
  value
});

let answerId = 0;
export const ADD_ANSWER = 'ADD_ANSWER';
export const addAnswer = (questionId) => ({
  type: ADD_ANSWER,
  answerId: answerId++,
  questionId
});

export const REMOVE_ANSWER = 'REMOVE_ANSWER';
export const removeAnswer = (answerId) => ({
  type: REMOVE_ANSWER,
  answerId
});

export const EDIT_ANSWER_PROPERTY = 'EDIT_ANSWER_PROPERTY';
export const editAnswerProperty = (answerId, property, value) => ({
  type: EDIT_ANSWER_PROPERTY,
  answerId,
  property,
  value
});

export const POST_SURVEY = 'POST_SURVEY';
export function postSurvey(survey) {
  return {
    type: POST_SURVEY,
    survey
  };
}