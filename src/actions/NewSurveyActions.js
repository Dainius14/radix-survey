import * as NewSurvey from './NewSurveyActionTypes';

export const editSurveyProperty = (name, value) => ({
    type: NewSurvey.EDIT_SURVEY_PROPERTY,
    name,
    value
  });

export const addQuestion = () => ({ type: NewSurvey.ADD_QUESTION });
export const removeQuestion = (questionId) => ({ type: NewSurvey.REMOVE_QUESTION, questionId });

export const editQuestionProperty = (questionId, property, value) => ({
  type: NewSurvey.EDIT_QUESTION_PROPERTY,
  questionId,
  property,
  value
});


export const addAnswer = (questionId) => ({
  type: NewSurvey.ADD_ANSWER,
  questionId
});

export const removeAnswer = (questionId, answerId) => ({
  type: NewSurvey.REMOVE_ANSWER,
  questionId,
  answerId
});

export const editAnswerProperty = (questionId, answerId, property, value) => ({
  type: NewSurvey.EDIT_ANSWER_PROPERTY,
  questionId,
  answerId,
  property,
  value
});
