import * as Actions from '../actions/NewSurveyActions';
import update from 'immutability-helper';


const initialState = {
  title: '',
  shortDescription: '',
  questions: {
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
        required: true,
        answerChoices: {
          items: []
        }
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


    case Actions.ADD_ANSWER_CHOICE: {
      const { questionId, answerId } = action;
      const answerChoice = {
        id: answerId,
        answerText: ''
      };

      return update(state, {
        questions: {
          [questionId]: {
            answerChoices: {
              $merge: {[answerId]: answerChoice},
              items: {$push: [answerId]}
            }
          }
        }
      });
    }

    case Actions.REMOVE_ANSWER_CHOICE: {
      const { questionId, answerId } = action;
      const answerIndex = state.questions[questionId].answerChoices.items.indexOf(answerId);

      return update(state, {
        questions: {
          [questionId]: {
            answerChoices: {
              $unset: [answerId],
              items: {$splice: [[answerIndex, 1]]}
            }
          }
        }
      });
    }

    case Actions.EDIT_ANSWER_CHOICE_PROPERTY: {
      const { questionId, answerId, property, value } = action;
      
      return update(state, {
        questions: {
          [questionId]: {
            answerChoices: {
              [answerId]: {
                [property]: {$set: value}
              }
            }
          }
        }
      });
    }

    case Actions.POST_SURVEY_REQUEST: {
      return state;
    }

    case Actions.POST_SURVEY_SUCCESS: {
      return state;
    }
    
    case Actions.POST_SURVEY_ERROR: {
      return state;
    }


    default:
      return state;
  }
}

export default newSurvey;
