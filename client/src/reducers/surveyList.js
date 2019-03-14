import * as Actions from '../actions/SurveyListActions';
import update from 'immutability-helper';

const initialState = {
  isLoading: true,
  allLoaded: false,
  data: {
    items: []
  }
};

const surveys = (state = initialState, action) => { 
  switch (action.type) {
    case Actions.REQUEST_SURVEYS: {
      return Object.assign({}, state, { isLoading: true });
    }

    case Actions.RECEIVE_SURVEYS: {
      return update(state, {
        isLoading: {$set: false},
        allLoaded: {$set: true},
        data: {$set: action.data}
      });
    }

    case Actions.GET_SURVEY_REQUEST: {
      return update(state, {
        isLoading: {$set: true}
      });
    }

    case Actions.GET_SURVEY_RESPONSE: {
      const { response } = action;
      return update(state, {
        isLoading: {$set: false},
        data: {
          $merge: {[response.id]: response},
          items: {$push: [response.id]}
        }
      });
    }

    default:
      return state;
  }
}

export default surveys;