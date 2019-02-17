import React from 'react';
import { Input, Radio, Button, } from 'antd';

function RadioAnswer({ state, position, removeAnswer }) {
  const { id, answerText } = state;

  return (
    <Radio disabled={true}
           style={{ display: 'table' }}>
      <Input placeholder={'Answer ' + position}
             value={answerText}
            //  onChange={e => actions.answers.editAnswerText(answer.id, e.target.value)}
             />
      <Button shape="circle" icon="close" style={{ border: 'none' }}
              onClick={() => removeAnswer(id)}
              />
    </Radio>
  );
}

export default RadioAnswer;
