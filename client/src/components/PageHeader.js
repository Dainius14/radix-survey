import React from 'react';
import { PageHeader as AntPageHeader, Col, Divider } from 'antd';
import '../styles/PageHeader.css';

export const PageHeader = React.memo(({ title, subTitle, onBack, bottomLeftActions, bottomRightActions, children}) => {
  return <>
    <AntPageHeader
      title={title}
      subTitle={subTitle}
      className="custom-header"
      onBack={onBack}
      >
      {children}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
        {bottomLeftActions}
        {bottomRightActions}
      </div>
    </AntPageHeader>
    <Divider/>
    </>;
});


  
export const DescriptionItem = React.memo(({ label, children }) => (
  <Col className="description-item" span={12}>
    <span className="description-item-label">{label}</span>
    <span className="description-item-value">{children}</span>
  </Col>
));