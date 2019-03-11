import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { Form, Input, Divider, Button } from 'antd';
import * as NewSurveyActions from '../actions/NewSurveyActions';
import NewSurveyQuestionList from '../containers/NewSurveyQuestionList';
const { TextArea } = Input;


function Survey({ survey, match, editSurveyProperty, postSurvey }) {
  const { title, shortDescription } = survey;

  return ( <div>{title}</div>
    // <Form layout="vertical">

    //   <Form.Item label="Title">
    //     <Input placeholder="Title of your survey"
    //           name="title"
    //           required={true}
    //           value={title}
    //           onChange={(event) => editSurveyProperty(event.target.name, event.target.value)}
    //           />
    //   </Form.Item>

    //   <Form.Item label="Description">
    //     <TextArea placeholder="Short description of your survey" rows={3}
    //               name="shortDescription"
    //               value={shortDescription}
    //               onChange={(event) => editSurveyProperty(event.target.name, event.target.value)}
    //               />
    //   </Form.Item>

    //   <Divider />

    //   <NewSurveyQuestionList />
      
    //   <Divider />

      
    //   <Button onClick={() => postSurvey(state)}>Post survey</Button>
    // </Form>
  );
}

function mapStateToProps(state, ownProps) {
  console.log('state', state);
  console.log('ownProps', ownProps);
  return {
    survey: state.surveys.data[ownProps.match.params.surveyId],
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    // editSurveyProperty: (property, value) =>
    //   dispatch(NewSurveyActions.editSurveyProperty(property, value)),
    // postSurvey: (survey) =>
    //   dispatch(NewSurveyActions.postSurvey(survey))
  }
}; 

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Survey);
