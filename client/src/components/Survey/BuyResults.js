import React from 'react';
import { connect } from 'react-redux';
import { Form, Button, Spin, Input, Typography, Row, Col, Statistic, InputNumber } from 'antd';
import { PageHeader, DescriptionItem } from '../PageHeader';
import * as SurveyListActions from '../../actions/SurveyListActions';
import { format as formatDate } from 'timeago.js';
import QRCode from 'qrcode.react';

const { Title, Text } = Typography;

class BuyResults extends React.Component {
  state = {
    enteredResponseCount: 0,
    waitingForResponse: false
  }
  
  componentDidMount() {
    const { survey, match, getSurvey } = this.props;
    if (!survey) {
      getSurvey(match.params.surveyId);
    }
  }

  saveFormRef = (formRef) => {
    this.formRef = formRef;
  }

  handleFormSubmit = (e) => {
    e.preventDefault();
    const form = this.formRef.props.form;
    
    form.validateFields((err, values) => {
      if (!err) {
        this.setState({ waitingForResponse: true });
        
        this.props.buySurveyResults(this.props.match.params.surveyId, values.radixAddress);
      }
    });
  }

  render() {
    const { survey, isLoading, error } = this.props;
    
    if (isLoading) {
      return (
        <>
          <Spin style={{ width: '100%', display: 'block' }} spinning={true} />
        </>
      );
    }
    
    return <>
      <PageHeader
        title={survey.title}
        subTitle="Purchase responses"
        onBack={() => this.props.history.push(`/surveys/${this.props.match.params.surveyId}`)}
      >
      <Row>
        <DescriptionItem label="Survey created">{formatDate(survey.published)}</DescriptionItem>
        <DescriptionItem label="Survey type">{survey.surveyType[0].toUpperCase() + survey.surveyType.substr(1)}</DescriptionItem>
      </Row>

      <Row>
        <Col span={7}>
          <Statistic title="Last response"
            value={survey.firstResponse}
            formatter={(value) => value ?
              <>
                <span>{formatDate(value)}</span>
                <span style={{ fontSize: 16, display: 'block' }}>{new Date(value).toISOString().split('T')[0]}</span>
              </> : '-'} />
        </Col>
        <Col span={7}>
          <Statistic title="Last response"
            value={survey.lastResponse}
            formatter={(value) => value ?
              <>
                <span>{formatDate(value)}</span>
                <span style={{ fontSize: 16, display: 'block' }}>{new Date(value).toISOString().split('T')[0]}</span>
              </> : '-'} />
        </Col>
        <Col span={5}>
          <Statistic title="Total responses" value={survey.totalResponses} />
        </Col>
        <Col span={5}>
          <Statistic title="Price per response" value={survey.resultPrice} suffix="Rads"
            formatter={(value) => value} />
        </Col>
      </Row>
      </PageHeader>

      <Title level={4}>How to purchases responses?</Title>
      <ol style={{ marginLeft: -24 }}>
        <li><Text>Decide the number of responses you will be buying. You can calculate the total price here:</Text>
          <div>
            <Text>Number of responses</Text>
            <InputNumber size="small" style={{ marginLeft: '1ch', marginRight: '1ch', width: '10ch' }}
              value={this.state.enteredResponseCount} precision={0} min={0}
              onChange={(v) => !isNaN(v) && this.setState({ enteredResponseCount: v })}
            />
            <Text>Total price: </Text> <Text strong>{this.state.enteredResponseCount * survey.resultPrice} Rads</Text>
            
          </div>
          <Text type="secondary">The number of responses you have entered here is only for informational purposes.
            How many responses you receive will depend on the amount of tokens you transfer.</Text>
        </li>
        <li><Text>Enter your first 5 symbols of your RadixDLT wallet address from which you will be transfering the tokens.</Text></li>
        <li><Text>Press button "Initiate purchase". <Text strong>Do not leave this page!</Text></Text></li>
        <li><Text>Transfer tokens to our RadixDLT wallet.</Text></li>
      </ol>

      
      <div style={{ textAlign: 'center' }}>Our wallet address is <Text code copyable>9g7MxcyYrXAFpMMMnPZD74etUAdd7kiRufpkxeuf921haFgAiNs</Text></div>
      <QRCode value="9g7MxcyYrXAFpMMMnPZD74etUAdd7kiRufpkxeuf921haFgAiNs" style={{ margin: '8px auto', display: 'block' }}/>
      
      {/* <Text strong>Important!</Text>If you */}
      <BuyResponsesForm
        wrappedComponentRef={this.saveFormRef}
        onSubmit={this.handleFormSubmit}
        loading={this.state.waitingForResponse}
      />
    </>;
  }
}

const BuyResponsesForm = Form.create({ name: 'buy_responses_form' })(
  class extends React.Component {
    render() {
      const { onSubmit, form, loading } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Form layout="vertical" onSubmit={onSubmit} style={{ width: '50%', margin: 'auto' }}>
          <Form.Item label="First 5 symbols of your RadixDLT wallet address">
            {getFieldDecorator('radixAddress', {
              rules: [
                { required: true, message: 'Please enter at least 5 first symbols of your wallet' },
                { min: 5, message: 'Please enter at least 5 first symbols of your wallet' }
              ],
            })(
              <Input maxLength={51} onKeyDown={(e)=> e.keyCode === 13 && onSubmit()} />
            )}
          </Form.Item>
          <Button type="primary" htmlType="submit"
            onClick={this.handleFormSubmit}
            loading={loading} >Initiate purchase</Button>
        </Form>
      );
    }
  }
);

function mapStateToProps(state, ownProps) {
  return {
    isLoading: state.surveys.isLoading,
    error: state.surveys.error,
    survey: state.surveys.data[ownProps.match.params.surveyId],
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurvey: (surveyId) => 
      dispatch(SurveyListActions.getSurvey(surveyId)),
    buySurveyResults: (surveyId, radixAddress) => 
      dispatch(SurveyListActions.buySurveyResults(surveyId, radixAddress)),
  }
};



export default connect(
  mapStateToProps,
  mapDispatchToProps
)(BuyResults);
