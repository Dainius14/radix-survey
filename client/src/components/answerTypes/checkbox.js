import React, { Component } from 'react';
import { Input, Checkbox, Button, } from 'antd';

class CheckboxAnswer extends Component {
  render() {
    const { answerId, state, actions, position } = this.props;
    const answer = state.survey.answers[answerId];

    return (
      <Checkbox disabled={true} style={{ display: 'table', width: '60%', marginLeft: 0 }}>

        <Input placeholder={'Answer ' + position} style={{ width: '80%' }}
          value={answer.answerText}
          onChange={e => actions.answers.editAnswerText(answer.id, e.target.value)} />
        <Button shape="circle" icon="close" style={{ border: 'none' }}
          onClick={() => actions.answers.deleteAnswer(answer.id)} />
      </Checkbox>
    );
  }
}

export default CheckboxAnswer;
