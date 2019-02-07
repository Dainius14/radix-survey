import React, { Component } from 'react';
import Question from './question';
import { Form, Input, Divider, Button } from 'antd';
const { TextArea } = Input;


class CreateSurvey extends Component {
  render() {
    const { state, actions } = this.props;
    const survey = state.survey;

    return (
      <Form layout="vertical">

        <Form.Item label="Title">
          <Input placeholder="Title of your survey" required={true}
            value={survey.title}
            onChange={e => actions.editTitle(e.target.value)} />
        </Form.Item>

        <Form.Item label="Description">
          <TextArea placeholder="Short description of your survey" rows={3}
            value={survey.shortDescription}
            onChange={e => actions.editShortDescription(e.target.value)} />
        </Form.Item>

        <Divider />

        {Object.values(survey.questions).map(question => {
          return (
            <Question key={question.id} questionId={question.id} state={state} actions={actions} />
          );
        })}


        <Button icon="plus" onClick={() => actions.questions.addQuestion()}>Add question</Button>
        <Button onClick={() => console.log(JSON.stringify(state, true, 2))}>log state</Button>
      </Form>
    );
  }
}

export default CreateSurvey;
