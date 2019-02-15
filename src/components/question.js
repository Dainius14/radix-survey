import React, { Component } from 'react';
import { connect } from 'react-redux'
import { Form, Input, Button, Select, } from 'antd';
// import RadioAnswer from './answerTypes/radio';
// import CheckboxAnswer from './answerTypes/checkbox';
import TextArea from 'antd/lib/input/TextArea';
const InputGroup = Input.Group;
const Option = Select.Option;

function Question({ question, removeQuestion, editQuestion }) {
  // console.log(things)
  const { id, questionText, questionType } = question;
  
  return (
    <Form.Item>
      <InputGroup compact>
      {/* TODO: handle width of input */}
        <Input placeholder="Question" required={true}
              name="questionText"
              value={questionText}
              onChange={(event) => editQuestion(id, event.target.name, event.target.value)}
              style={{ width: '74%' }}/>
        <Select defaultValue="radio"
                name="questionType"
                value={questionType}
                onChange={(type) => editQuestion(id, 'questionType', type)}
                style={{ width: '20%' }}>
          <Option value="radio">Radio</Option>
          <Option value="checkbox">Checkbox</Option>
          <Option value="short_text">Short text</Option>
          <Option value="long_text">Long text</Option>
        </Select>
        <Button shape="circle" icon="close" style={{}}
                onClick={() => removeQuestion(id)} />

      </InputGroup>

      
        {/* {question.type !== 'text' && question.type !== 'long_text'
        && Object.values(state.survey.answers).filter(x => x.questionId === questionId).map((answer, i) => {
          if (question.type === 'radio')
            return (
              <RadioAnswer key={answer.id} answerId={answer.id} state={state} actions={actions} position={i + 1}/>
            );
          if (question.type === 'checkbox')
            return (
              <CheckboxAnswer key={answer.id} answerId={answer.id} state={state} actions={actions} position={i + 1}/>
            );
          return null;
        })} */}
      <br/>

      {/* {questionType !== 'short_text' && questionType !== 'long_text' &&
          <Button icon="plus"
          // onClick={() => actions.answers.addAnswer(questionId)}
          >Add answer</Button>
      }

      {questionType === 'short_text' &&
        <Input placeholder="User's answer" disabled/>
      }
      {questionType === 'long_text' &&
        <TextArea placeholder="User's answer" disabled autosize={{ minRows: 2, maxRows: 6 }}/>
      } */}
    </Form.Item>

  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    question: state.newSurvey.questions.find(q => q.id == ownProps.question.id)
  };
}

const mapDispatcherToProps = (dispatcher) => ({
  // removeQuestion: (questionId) =>
  //   dispatcher(NewSurveyActions.removeQuestion(questionId)),
  // editQuestion: (questionId, property, value) =>
  //   dispatcher(NewSurveyActions.editQuestionProperty(questionId, property, value))
});

export default connect(
  mapStateToProps,
  mapDispatcherToProps
)(Question);
