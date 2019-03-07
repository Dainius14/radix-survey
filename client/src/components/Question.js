import React from 'react';
import { connect } from 'react-redux'
import * as NewSurveyActions from '../actions/NewSurveyActions';
import { Form, Input, Button, Select, Radio, Checkbox } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
const InputGroup = Input.Group;
const Option = Select.Option;

function Question({ question, answers, removeQuestion, editQuestion, addAnswer, removeAnswer, editAnswer }) {
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

      {questionType !== 'text' && questionType !== 'long_text'
      && answers.items.filter(a => answers[a].questionId == question.id).map((answerId, i) => {
        const answer = answers[answerId];

        if (questionType === 'radio')
          return (
            <Radio key={answer.id}
                   disabled={true}
                   style={{ display: 'table' }}>
              <Input placeholder={'Answer ' + (i + 1)}
                     name="answerText"
                     value={answer.answerText}
                     onChange={e => editAnswer(answer.id, e.target.name, e.target.value)}
                     />
              <Button shape="circle" icon="close" style={{ border: 'none' }}
                      onClick={() => removeAnswer(answer.id)} />
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
                     onChange={e => editAnswer(answer.id, e.target.name, e.target.value)}
                     />
              <Button shape="circle" icon="close" style={{ border: 'none' }}
                      onClick={() => removeAnswer(answer.id)} />
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
    question: state.newSurvey.questions[ownProps.question.id],
    answers: state.newSurvey.answers
  };
}

const mapDispatcherToProps = (dispatcher) => ({
  addAnswer: (questionId) =>
    dispatcher(NewSurveyActions.addAnswer(questionId)),
  removeAnswer: (answerId) =>
    dispatcher(NewSurveyActions.removeAnswer(answerId)),
  editAnswer: (answerId, property, value) =>
    dispatcher(NewSurveyActions.editAnswerProperty(answerId, property, value))
});

export default connect(
  mapStateToProps,
  mapDispatcherToProps
)(Question);
