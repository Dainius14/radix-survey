import React from 'react';
import { connect } from 'react-redux'
import * as NewSurveyActions from '../actions/NewSurveyActions';
import { Form, Input, Button, Select, Radio, Checkbox } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
const InputGroup = Input.Group;
const Option = Select.Option;

function Question({ question, removeQuestion, editQuestion, addAnswerChoice, removeAnswerChoice, editAnswerChoiceProperty }) {
  const { id: questionId, questionText, questionType, answerChoices } = question;
  
  return (
    <Form.Item>
      <InputGroup compact>
      {/* TODO: handle width of input */}
        <Input placeholder="Question" required={true}
              name="questionText"
              value={questionText}
              onChange={(event) => editQuestion(questionId, event.target.name, event.target.value)}
              style={{ width: '74%' }}/>
        <Select defaultValue="radio"
                name="questionType"
                value={questionType}
                onChange={(type) => editQuestion(questionId, 'questionType', type)}
                style={{ width: '20%' }}>
          <Option value="radio">Radio</Option>
          <Option value="checkbox">Checkbox</Option>
          <Option value="shortText">Short text</Option>
          <Option value="longText">Long text</Option>
        </Select>
        <Button shape="circle" icon="close" style={{}}
                onClick={() => removeQuestion(questionId)} />

      </InputGroup>

      {questionType !== 'shortText' && questionType !== 'longText'
      && answerChoices.items.map((answerId, index) => {
        const answerChoice = answerChoices[answerId];

        if (questionType === 'radio')
          return (
            <Radio key={answerChoice.id}
                   disabled={true}
                   style={{ display: 'table' }}>
              <Input placeholder={'Answer ' + (index + 1)}
                     name="answerText"
                     value={answerChoice.answerText}
                     onChange={e => editAnswerChoiceProperty(questionId, answerChoice.id, e.target.name, e.target.value)}
                     />
              <Button shape="circle" icon="close" style={{ border: 'none' }}
                      onClick={() => removeAnswerChoice(questionId, answerChoice.id)} />
            </Radio>
          );
        else if (questionType === 'checkbox') {
          return (
            <Checkbox key={answerChoice.id}
                      disabled={true}
                      style={{ display: 'table', width: '60%', marginLeft: 0 }}>
              <Input placeholder={'Answer ' + (index + 1)}
                     style={{ width: '80%' }}
                     name="answerText"
                     value={answerChoice.answerText}
                     onChange={e => editAnswerChoiceProperty(questionId, answerChoice.id, e.target.name, e.target.value)}
                     />
              <Button shape="circle" icon="close" style={{ border: 'none' }}
                      onClick={() => removeAnswerChoice(questionId, answerChoice.id)} />
            </Checkbox>
          );

        }
        return null;
      })}

      <br/>

      {questionType === 'shortText' &&
        <Input placeholder="User's answer" disabled/>
      }
      {questionType === 'longText' &&
        <TextArea placeholder="User's answer" disabled autosize={{ minRows: 2, maxRows: 6 }}/>
      }

      {questionType !== 'shortText' && questionType !== 'longText' &&
        <Button icon="plus" onClick={() => addAnswerChoice(questionId)}>Add answer</Button>
      }
    

    </Form.Item>

  );
}

const mapStateToProps = (state, ownProps) => {
  return {
    question: state.newSurvey.questions[ownProps.question.id]
  };
}

const mapDispatcherToProps = (dispatcher) => ({
  addAnswerChoice: (questionId) =>
    dispatcher(NewSurveyActions.addAnswerChoice(questionId)),
  removeAnswerChoice: (questionId, answerId) =>
    dispatcher(NewSurveyActions.removeAnswerChoice(questionId, answerId)),
  editAnswerChoiceProperty: (questionId, answerId, property, value) =>
    dispatcher(NewSurveyActions.editAnswerChoiceProperty(questionId, answerId, property, value))
});

export default connect(
  mapStateToProps,
  mapDispatcherToProps
)(Question);
