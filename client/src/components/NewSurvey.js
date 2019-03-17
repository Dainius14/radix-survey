import React from 'react';
import { connect } from 'react-redux'
import { Form, Input, Divider, Button, Typography } from 'antd';
import * as NewSurveyActions from '../actions/NewSurveyActions';
import NewSurveyQuestionList from '../containers/NewSurveyQuestionList';
import '../styles/MultilineCode.css';
const { TextArea } = Input;
const { Text } = Typography;


function CreateSurvey({ state, editSurveyProperty, postSurvey }) {
  const { title, shortDescription } = state.data;

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
      
      <Divider />

      <Button onClick={() => postSurvey(state.data)} loading={state.isPosting}>Post survey</Button>
      {state.error && <Text code className="multiline-code">{JSON.stringify(state.error, null, 4)}</Text>}

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
    postSurvey: (survey) =>
      dispatch(NewSurveyActions.postSurvey(survey))
  }
}; 

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateSurvey);
