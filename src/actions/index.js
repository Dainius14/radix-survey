import * as NewSurvey from './NewSurveyTypes';

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
