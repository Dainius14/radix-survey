import * as Actions from '../actions/SurveyListActions';
import update from 'immutability-helper';

const initialState = {
  isLoading: true,
  allLoaded: false,
  error: null,
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
      return update(state, {
        error: {$set: null},
        isLoading: {$set: false},
        allLoaded: {$set: true},
        data: {$set: action.data}
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

    default:
      return state;
  }
}

export default surveys;