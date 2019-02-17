import { combineReducers } from 'redux';
import newSurvey from './newSurvey';
import surveyList from './surveyList';

export default combineReducers({
  newSurvey,
  surveyList
});
