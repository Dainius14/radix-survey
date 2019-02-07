import React, { Component } from 'react';
import { Input, Radio, Button, } from 'antd';

class RadioAnswer extends Component {
  render() {
    const { answerId, state, actions, position } = this.props;
    const answer = state.survey.answers[answerId];

    return (
      <Radio disabled={true}
        style={{ display: 'table' }}>
        <Input placeholder={'Answer ' + position}
          value={answer.answerText}
          onChange={e => actions.answers.editAnswerText(answer.id, e.target.value)} />
        <Button shape="circle" icon="close" style={{ border: 'none' }}
          onClick={() => actions.answers.deleteAnswer(answer.id)} />
      </Radio>
    );
  }
}

export default RadioAnswer;
