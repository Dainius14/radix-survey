import * as Actions from '../actions/NewSurveyActions';
import update from 'immutability-helper';


const initialState = {
  error: null,
  isPosting: false,
  data: {
    title: '',
    shortDescription: '',
    questions: {
      items: []
    }
  }
};

const removeAnswerChoices = ['shortText', 'longText'];
const addAnswerChoices = ['radio', 'checkbox'];

const newSurvey = (state = initialState, action) => { 
  switch (action.type) {
    case Actions.EDIT_SURVEY_PROPERTY: {
      const { property, value } = action;
      return update(state, {
        data: {
          [property]: {$set: value}
        }
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
        data: {
          questions: {
            $merge: {[questionId]: newQuestion},
            items: {$push: [questionId]}
          }
        }
      });
    }

    case Actions.REMOVE_QUESTION: {
      const { questionId } = action;
      const questionIndex = state.data.questions.items.indexOf(questionId);
      return update(state, {
        data: {
          questions: {
            $unset: [questionId],
            items: {$splice: [[questionIndex, 1]]}
          }
        }
      });
    }

    case Actions.EDIT_QUESTION_PROPERTY: {
      const { questionId, property, value } = action;

      const prevValue = state.data.questions[questionId].questionType;

      
      // Changing type must not leave any trace of answer choices
      if (property === 'questionType') {
        if (removeAnswerChoices.includes(prevValue) && addAnswerChoices.includes(value)) {
          return update(state, {
            data: {
              questions: {
                [questionId]: {
                  [property]: {$set: value},
                  $merge: { answerChoices: { items: [] } }
                }
              }
            }
          });
        }
        else if (addAnswerChoices.includes(prevValue) && removeAnswerChoices.includes(value)) {
          return update(state, {
            data: {
              questions: {
                [questionId]: {
                  [property]: {$set: value},
                  $unset: ['answerChoices']
                }
              }
            }
          });
        }
      }
      
      return update(state, {
        data: {
          questions: {
            [questionId]: {
              [property]: {$set: value}
            }
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
        data: {
          questions: {
            [questionId]: {
              answerChoices: {
                $merge: {[answerId]: answerChoice},
                items: {$push: [answerId]}
              }
            }
          }
        }
      });
    }

    case Actions.REMOVE_ANSWER_CHOICE: {
      const { questionId, answerId } = action;
      const answerIndex = state.data.questions[questionId].answerChoices.items.indexOf(answerId);

      return update(state, {
        data: {
          questions: {
            [questionId]: {
              answerChoices: {
                $unset: [answerId],
                items: {$splice: [[answerIndex, 1]]}
              }
            }
          }
        }
      });
    }

    case Actions.EDIT_ANSWER_CHOICE_PROPERTY: {
      const { questionId, answerId, property, value } = action;
      
      return update(state, {
        data: {
          questions: {
            [questionId]: {
              answerChoices: {
                [answerId]: {
                  [property]: {$set: value}
                }
              }
            }
          }
        }
      });
    }

    case Actions.POST_SURVEY_REQUEST: {
      return update(state, {
        isPosting: {$set: true},
        error: {$set: null}
      });
    }

    case Actions.POST_SURVEY_SUCCESS: {
      return update(state, {
        isPosting: {$set: false},
        error: {$set: null}
      });
    }
    
    case Actions.POST_SURVEY_ERROR: {
      return update(state, {
        isPosting: {$set: false},
        error: {$set: action.error}
      });
    }


    default:
      return state;
  }
}

export default newSurvey;
