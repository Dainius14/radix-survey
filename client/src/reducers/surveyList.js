import * as Actions from '../actions/SurveyListActions';

const initialState = {
  isLoading: false,
  data: {}
};

const surveyList = (state = initialState, action) => { 
  switch (action.type) {
    case Actions.REQUEST_SURVEYS:
      return Object.assign({}, state, { isLoading: true });

      case Actions.RECEIVE_SURVEYS:
        return Object.assign({}, state, { isLoading: false, data: action.data });

    default:
      return state;
  }
}

export default surveyList;