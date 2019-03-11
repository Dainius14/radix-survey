import { combineReducers } from 'redux';
import newSurvey from './newSurvey';
import surveys from './surveyList';

export default combineReducers({
  newSurvey,
  surveys
});
