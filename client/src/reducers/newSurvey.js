import * as Actions from '../actions/NewSurveyActions';
import update from 'immutability-helper';


const initialState = {
  title: '',
  shortDescription: '',
  questions: {
    items: []
  },
  answers: {
    items: []
  }
};

const newSurvey = (state = initialState, action) => { 
  switch (action.type) {
    case Actions.EDIT_SURVEY_PROPERTY: {
      const { property, value } = action;
      return update(state, {
        [property]: {$set: value}
      });
    }

    case Actions.ADD_QUESTION: {
      const { questionId } = action;
      const newQuestion = {
        id: questionId,
        questionText: '',
        questionType: 'radio',
      };

      return update(state, {
        questions: {
          $merge: {[questionId]: newQuestion},
          items: {$push: [questionId]}
        }
      });
    }

    case Actions.REMOVE_QUESTION: {
      const { questionId } = action;
      const questionIndex = state.questions.items.indexOf(questionId);
      return update(state, {
        questions: {
          $unset: [questionId],
          items: {$splice: [[questionIndex, 1]]}
        }
      });
    }

    case Actions.EDIT_QUESTION_PROPERTY: {
      const { questionId, property, value } = action;
      
      return update(state, {
        questions: {
          [questionId]: {
            [property]: {$set: value}
          }
        }
      });
    }


    case Actions.ADD_ANSWER: {
      const { answerId, questionId } = action;
      const answer = {
        id: answerId,
        questionId,
        answerText: ''
      };

      return update(state, {
        answers: {
          $merge: {[answerId]: answer},
          items: {$push: [answerId]}
        }
      });
    }

    case Actions.REMOVE_ANSWER: {
      const { answerId } = action;
      const answerIndex = state.answers.items.indexOf(answerId);

      return update(state, {
        answers: {
          $unset: [answerId],
          items: {$splice: [[answerIndex, 1]]}
        }
      });
    }

    case Actions.EDIT_ANSWER_PROPERTY: {
      const { answerId, property, value } = action;
      
      return update(state, {
        answers: {
          [answerId]: {
            [property]: {$set: value}
          }
        }
      });
    }

    case Actions.POST_SURVEY_REQUEST: {
      console.log('posting survey to server');
      return state;
    }

    case Actions.POST_SURVEY_RESPONSE: {
      const { response } = action;
      console.log('got response', response);
      return state;
    }


    default:
      return state;
  }
}

export default newSurvey;
