import React from 'react';
import { connect } from 'react-redux'
import * as NewSurveyActions from '../actions/NewSurveyActions';


function SurveyList({ state }) {
  return (
    <>
      {state.map(survey => {
        return (<div>test</div>);
      })}
    </>
  );
}

function mapStateToProps(state) {
  return { state: state.surveyList }
}

function mapDispatchToProps(dispatch) {
  return {
  }
}; 


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SurveyList);
