import React from 'react';
import { connect } from 'react-redux';
import { Form, Divider, Button, Spin, Input, Radio, Checkbox, Typography } from 'antd';
import * as SurveyListActions from '../../actions/SurveyListActions';
import '../../styles/MultilineCode.css';
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/NoBottomMargin.css';
const { TextArea } = Input;
const { Title, Paragraph, Text } = Typography;

// const questionTextStyle = {
//   marginTop: '1.5em',
//   marginBottom: '0.1em'
// }

class Survey extends React.Component {

  handleSubmit = event => {
    event.preventDefault();
    this.props.form.validateFields((error, values) => {
      if (!error) {
        const { userRadixAddress, ...answers } = values;
        this.props.postSurveyAnswers(this.props.survey.id, userRadixAddress, answers);
      }
    });
  }
  
  componentDidMount() {
    const { survey, match, getSurvey } = this.props;
    if (!survey) {
      getSurvey(match.params.surveyId);
    }
  }

  render() {
    const { survey, isLoading, error } = this.props;
    const { getFieldDecorator } = this.props.form;

    if (isLoading) {
      return (
        <div>
          <Spin style={{ width: '100%' }} spinning={true}/>
        </div>
      );
    }

    if (error) {
      return (
        <Text code className="multiline-code">{JSON.stringify(error, null, 4)}</Text>
      );
    }

    // Got survey, can render it
    const { title, shortDescription } = survey;
    return (
      <>
        <Title>{title}</Title>
        <Paragraph>{shortDescription}</Paragraph>

        <Divider/>
        <Form layout="vertical" onSubmit={this.handleSubmit}>

          <Form.Item label={<Title level={4} className="no-bottom-margin">Your Radix DLT wallet address</Title>}>
            {getFieldDecorator('userRadixAddress', {
              rules: [{ required: true, message: 'Your Radix DLT address is required' }]
            })(
              <Input placeholder='Address of your Radix DLT wallet address where you want to receive the prize'/>
            )}
          </Form.Item>
        
          <Divider/>
          
          {survey.questions.map((question, index) => {

            return (
              <Form.Item label={<Title level={3} className="no-bottom-margin">{question.questionText}</Title>}
                          key={index}>
                {question.questionType === 'shortText' && getFieldDecorator(index.toString(), {
                  rules: [{ required: question.required, message: 'This answer is required' }]
                })(
                  <Input placeholder='Your answer...'/>
                )}


                {question.questionType === 'longText' && getFieldDecorator(index.toString(), {
                  rules: [{ required: question.required, message: 'This answer is required' }]
                })(
                  <TextArea placeholder='Your answer...'/>
                )}


                {question.questionType === 'radio' && getFieldDecorator(index.toString(), {
                  rules: [{ required: question.required, message: 'This answer is required' }]
                })(
                  <Radio.Group>
                    {question.answerChoices.map((answer, answerIndex) => {
                      return (
                        <Radio key={answerIndex}
                              value={answerIndex}
                              style={{ display: 'table' }}>
                          {answer.answerText}
                        </Radio>
                      );

                    })}
                  </Radio.Group>
                )}


                {question.questionType === 'checkbox' && getFieldDecorator(index.toString(), {
                  rules: [{ required: question.required, message: 'This answer is required' }]
                })(
                  <Checkbox.Group>
                    {question.answerChoices.map((answer, answerIndex) => {
                      return (
                        <div key={answerIndex}>
                          <Checkbox value={answerIndex}>
                            {answer.answerText}
                          </Checkbox>
                          <br/>
                        </div>
                      );

                    })}
                  </Checkbox.Group>
                )}


                </Form.Item>
              );
          })}

<Button type="primary" htmlType="submit" loading={this.props.isPostingAnswers}
                  style={{ marginTop: '2em', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
            Submit answers
          </Button>
          {/* eslint-disable-next-line  */}
          <a href="#"
                  style={{ marginTop: '2em', marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
            Show results
          </a>
          
        </Form>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isLoading: state.surveys.isLoading,
    isPostingAnswers: state.surveys.isPostingAnswers,
    error: state.surveys.error,
    survey: state.surveys.data[ownProps.match.params.surveyId],
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurvey: (surveyId) => 
      dispatch(SurveyListActions.getSurvey(surveyId)),
    postSurveyAnswers: (surveyId, radixAddress, answers) =>
      dispatch(SurveyListActions.postSurveyAnswers(surveyId, radixAddress, answers))
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(Survey));