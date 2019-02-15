import uuid from 'uuid/v4';
import * as Actions from '../actions/NewSurveyTypes';

const initialState = {
  title: '',
  shortDescription: '',
  questions: []
};

const newSurvey = (state = initialState, action) => { 
  switch (action.type) {
    case Actions.EDIT_SURVEY_PROPERTY:
      return { ...state, [action.name]: action.value };

    case Actions.ADD_QUESTION:
      const newQuestion = {
        id: uuid(),
        questionText: '',
        questionType: 'radio',
        answers: []
      };

      return {
        ...state,
        questions: [
          ...state.questions,
          newQuestion
        ]
      };

    case Actions.REMOVE_QUESTION:
      return {
        ...state,
        questions: state.questions.filter(q => q.id !== action.questionId)
      };

    case Actions.EDIT_QUESTION_PROPERTY:
      const { questionId, property, value } = action;
      return {
        ...state,
        questions: state.questions.map(q => 
          q.id === questionId ? 
          { ...q, [property]: value } :
          q
        )
      };

    default:
      return state;
  }
}

export default newSurvey;