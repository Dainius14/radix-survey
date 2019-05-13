import * as Actions from '../actions/SurveyListActions';
import update from 'immutability-helper';

const initialState = {
  isLoading: true,
  isPostingAnswers: false,
  allLoaded: false,
  error: null,
  needPasword: false,
  data: {
    items: []
  }
};

const surveys = (state = initialState, action) => { 
  switch (action.type) {
    case Actions.GET_SURVEYS_REQUEST: {
      return update(state, {
        isLoading: {$set: true},
        error: {$set: null}
      });
    }

    case Actions.GET_SURVEYS_SUCCESS: {
      const items = action.data.map(x => x.id);
      const surveyMap = action.data.reduce((acc, x) => {
        acc[x.id] = x;
        return acc;
      }, {});

      return update(state, {
        error: {$set: null},
        isLoading: {$set: false},
        allLoaded: {$set: true},
        data: {
          $merge: surveyMap,
          items: {$set: items}
        }
      });
    }

    case Actions.GET_SURVEYS_ERROR: {
      return update(state, {
        error: {$set: action.error},
        isLoading: {$set: false},
      });
    }

    case Actions.GET_SURVEY_REQUEST: {
      return update(state, {
        error: {$set: null},
        isLoading: {$set: true}
      });
    }

    case Actions.GET_SURVEY_SUCCESS: {
      const { data } = action;
      return update(state, {
        error: {$set: null},
        isLoading: {$set: false},
        data: {
          $merge: {[data.id]: data},
          items: {$push: [data.id]}
        }
      });
    }

    case Actions.GET_SURVEY_ERROR: {
      return update(state, {
        isLoading: {$set: false},
        error: {$set: action.error}
      });
    }

    case Actions.POST_SURVEY_ANSWERS_REQUEST: {
      return update(state, {
        isPostingAnswers: {$set: true},
        error: {$set: null}
      });
    }

    case Actions.POST_SURVEY_ANSWERS_SUCCESS: {
      return update(state, {
        isPostingAnswers: {$set: false},
        error: {$set: null}
      });
    }
    
    case Actions.POST_SURVEY_ANSWERS_ERROR: {
      return update(state, {
        isPostingAnswers: {$set: false},
        error: {$set: action.error}
      });
    }

    

    case Actions.GET_SURVEY_RESULTS_REQUEST: {
      return update(state, {
        error: {$set: null},
        isLoading: {$set: true}
      });
    }

    case Actions.GET_SURVEY_RESULTS_SUCCESS: {
      const { data } = action;
      
      if (state.data[data.id]) {
        return update(state, {
          error: {$set: null},
          isLoading: {$set: false},
          data: {
            [data.id]: {
              totalResponses: {$set: data.totalResponses},
              firstResponse: {$set: data.firstResponse},
              lastResponse: {$set: data.lastResponse},
              responses: {$set: data.responses}
            }
          }
        });
      }
      else {
        return update(state, {
          error: {$set: null},
          isLoading: {$set: false},
          data: {
            $merge: {[data.id]: data},
            items: {$push: [data.id]}
          }
        });
      }
    }

    case Actions.GET_SURVEY_RESULTS_NEED_PASSWORD: {
      return update(state, {
        needPassword: {$set: true},
        isLoading: {$set: false},
      });
    }

    case Actions.BUY_SURVEY_RESULTS_REQUEST: {
      return state;
      // return update(state, {
      //   isLoading: {$set: false},
      //   error: {$set: action.error}
      // });
    }
    case Actions.BUY_SURVEY_RESULTS_SUCCESS: {
      const { data } = action;
      
      return update(state, {
        error: {$set: null},
        isLoading: {$set: false},
        data: {
          [data.surveyId]: {
            responses: {$set: data.responses},
            responsesPurchased: {$set: true}
          }
        }
      });
    }

    case Actions.BUY_SURVEY_RESULTS_ERROR: {
      return state;
      // return update(state, {
      //   isLoading: {$set: false},
      //   error: {$set: action.error}
      // });
    }

    case Actions.CLOSE_PASSWORD_DIALOG: {
      return update(state, {
        needPassword: {$set: false}
      });
    }

    default:
      return state;
  }
}

export default surveys;