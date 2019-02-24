import uuid from 'uuid/v4';
import * as Actions from '../actions/NewSurveyActionTypes';


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


      case Actions.ADD_ANSWER: {
        const newAnswer = {
          id: uuid(),
          answerText: ''
        };
  
        const question = state.questions.find(q => q.id === action.questionId);
  
        const newQuestion = {
          ...question,
          answers: [
            ...question.answers,
            newAnswer
          ]
        };
  
        const newQuestions = state.questions.map(q => q.id === action.questionId ? newQuestion : q);
  
        return {
          ...state,
          questions: newQuestions
        };
      }

    case Actions.REMOVE_ANSWER: {
      const question = state.questions.find(q => q.id === action.questionId);

      const newQuestion = {
        ...question,
        answers: question.answers.filter(a => a.id !== action.answerId)
      };

      const newQuestions = state.questions.map(q => q.id === action.questionId ? newQuestion : q);

      return {
        ...state,
        questions: newQuestions
      };
    }

    case Actions.EDIT_ANSWER_PROPERTY: {
      const question = state.questions.find(q => q.id === action.questionId);
      const answer = question.answers.find(a => a.id === action.answerId);

      const newAnswer = {
        ...answer,
        [action.property]: action.value
      };

      const newQuestion = {
        ...question,
        answers: question.answers.map(a => a.id === action.answerId ? newAnswer : a)
      };

      return {
        ...state,
        questions: state.questions.map(q => q.id === action.questionId ? newQuestion : q)
      };
    }

    default:
      return state;
  }
}

export default newSurvey;