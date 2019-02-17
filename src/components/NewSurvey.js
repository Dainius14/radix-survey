import React from 'react';
import { connect } from 'react-redux'
import { Form, Input, Divider } from 'antd';
import * as NewSurveyActions from '../actions/NewSurveyActions';
import NewSurveyQuestionList from '../containers/NewSurveyQuestionList';
const { TextArea } = Input;


function CreateSurvey({ state, editSurveyProperty }) {
  const { title, shortDescription } = state;

  return (
    <Form layout="vertical">

      <Form.Item label="Title">
        <Input placeholder="Title of your survey"
              name="title"
              required={true}
              value={title}
              onChange={(event) => editSurveyProperty(event.target.name, event.target.value)}
              />
      </Form.Item>

      <Form.Item label="Description">
        <TextArea placeholder="Short description of your survey" rows={3}
                  name="shortDescription"
                  value={shortDescription}
                  onChange={(event) => editSurveyProperty(event.target.name, event.target.value)}
                  />
      </Form.Item>

      <Divider />

      <NewSurveyQuestionList />

    </Form>
  );
}

function mapStateToProps(state) {
  return { state: state.newSurvey }
}

function mapDispatchToProps(dispatch) {
  return {
    editSurveyProperty: (property, value) =>
      dispatch(NewSurveyActions.editSurveyProperty(property, value)),
  }
}; 

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateSurvey);
