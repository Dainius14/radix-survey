import React from 'react';
import { connect } from 'react-redux'
import * as NewSurveyActions from '../actions/NewSurveyActions';
import { Form, Input, Button, Select, Radio, Checkbox } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
const InputGroup = Input.Group;
const Option = Select.Option;

function Question({ question, removeQuestion, editQuestion, addAnswer, removeAnswer, editAnswer }) {
  // console.log(things)
  const { id, questionText, questionType, answers } = question;
  
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

      
      {questionType !== 'text' && questionType !== 'long_text'
      && answers.map((answer, i) => {
        if (questionType === 'radio')
          return (
            <Radio key={answer.id}
                   disabled={true}
                   style={{ display: 'table' }}>
              <Input placeholder={'Answer ' + (i + 1)}
                     name="answerText"
                     value={answer.answerText}
                     onChange={e => editAnswer(question.id, answer.id, e.target.name, e.target.value)}
                     />
              <Button shape="circle" icon="close" style={{ border: 'none' }}
                      onClick={() => removeAnswer(question.id, answer.id)} />
            </Radio>
          );
        else if (questionType === 'checkbox') {
          return (
            <Checkbox key={answer.id}
                      disabled={true}
                      style={{ display: 'table', width: '60%', marginLeft: 0 }}>
              <Input placeholder={'Answer ' + (i + 1)}
                     style={{ width: '80%' }}
                     name="answerText"
                     value={answer.answerText}
                     onChange={e => editAnswer(question.id, answer.id, e.target.name, e.target.value)}
                     />
              <Button shape="circle" icon="close" style={{ border: 'none' }}
                      onClick={() => removeAnswer(question.id, answer.id)} />
            </Checkbox>
          );

        }
        return null;
      })}

      <br/>

      {questionType === 'short_text' &&
        <Input placeholder="User's answer" disabled/>
      }
      {questionType === 'long_text' &&
        <TextArea placeholder="User's answer" disabled autosize={{ minRows: 2, maxRows: 6 }}/>
      }

      {questionType !== 'short_text' && questionType !== 'long_text' &&
          <Button icon="plus" onClick={() => addAnswer(question.id)}>Add answer</Button>
      }
   

    </Form.Item>

  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    question: state.newSurvey.questions.find(q => q.id == ownProps.question.id)
  };
}

const mapDispatcherToProps = (dispatcher) => ({
  addAnswer: (questionId) =>
    dispatcher(NewSurveyActions.addAnswer(questionId)),
  removeAnswer: (questionId, answerId) =>
    dispatcher(NewSurveyActions.removeAnswer(questionId, answerId)),
  editAnswer: (questionId, answerId, property, value) =>
    dispatcher(NewSurveyActions.editAnswerProperty(questionId, answerId, property, value))
});

export default connect(
  mapStateToProps,
  mapDispatcherToProps
)(Question);
