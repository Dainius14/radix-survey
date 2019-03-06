import React from 'react';
import { connect } from 'react-redux';
import { Button, Spin } from 'antd';
import * as SurveyListActions from '../actions/SurveyListActions';


function SurveyList({ state, fetchSurveyList }) {
  return (
    <>
      <Button onClick={() => fetchSurveyList()}>Get surveys</Button>
      <div style={{ marginTop: 10 }}>
        <Spin spinning={state.isLoading}/>
      </div>
      {/* {state.map(survey => {
        return (<div>test</div>);
      })} */}
    </>
  );
}

function mapStateToProps(state) {
  return { state: state.surveyList }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchSurveyList: () => dispatch(SurveyListActions.fetchSurveyList())
  }
}; 


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SurveyList);
