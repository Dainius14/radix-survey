import React from 'react';
import { Typography } from 'antd';
const { Title } = Typography;

export default function NotFound404() {

  return (
    <div style={{ margin: 'auto', width: 'fit-content' }}>
      <Title style={{ fontSize: '5rem', marginBottom: 0 }}>404</Title>
      <Title style={{ fontSize: '2rem', marginTop: 0 }}>Page does not exist</Title>
    </div>);
}