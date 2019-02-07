import React, { Component } from 'react';
import { Form, Input, Button, Select, } from 'antd';
import RadioAnswer from './answerTypes/radio';
import CheckboxAnswer from './answerTypes/checkbox';
import TextArea from 'antd/lib/input/TextArea';
const InputGroup = Input.Group;
const Option = Select.Option;

class Question extends Component {  
  render() {
    const { questionId, state, actions } = this.props;
    const question = state.survey.questions[questionId];
    // const data = this.state.data;
    // const answers = data.answers;
    return (
      <Form.Item>
        <InputGroup compact>
        {/* TODO: handle width of input */}
          <Input placeholder="Question" required={true}
                value={question.questionText}
                onChange={e => actions.questions.editQuestionText(questionId, e.target.value)}
                style={{ width: '74%' }}/>
          <Select defaultValue="radio"
                  value={question.type}
                  onChange={type => actions.questions.editQuestionType(questionId, type)}
                  style={{ width: '20%' }}>
            <Option value="radio">Radio</Option>
            <Option value="checkbox">Checkbox</Option>
            <Option value="short_text">Short text</Option>
            <Option value="long_text">Long text</Option>
          </Select>
          <Button shape="circle" icon="close" style={{}}
                  onClick={() => actions.questions.deleteQuestion(questionId)}/>

        </InputGroup>

        
          {question.type !== 'text' && question.type !== 'long_text'
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
          })}
        <br/>

        {question.type !== 'short_text' && question.type !== 'long_text' &&
            <Button icon="plus"
            onClick={() => actions.answers.addAnswer(questionId)}>Add answer</Button>
        }

        {question.type === 'short_text' &&
          <Input placeholder="User's answer" disabled/>
        }
        {question.type === 'long_text' &&
          <TextArea placeholder="User's answer" disabled autosize={{ minRows: 2, maxRows: 6 }}/>
        }
      </Form.Item>

    );
  }
}

export default Question;
