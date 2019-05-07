import React from 'react';
import { connect } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { Form, Divider, Button, Spin, Input, Radio, Checkbox, Typography, message } from 'antd';
import * as SurveyListActions from '../../actions/SurveyListActions';
import '../../styles/MultilineCode.css';
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/NoBottomMargin.css';
import { SurveyType } from '../../constants';
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
        const survey = this.props.survey;
        
        // Put radio answers into array
        const response = {
          answers: Object.keys(values).reduce((acc, key) => {
            if (key == 'radixAddress') return;

            if (survey.questions[key].type === 'radio')
              acc[key] = [ values[key] ];
            else
              acc[key] = values[key];
            return acc;
          }, {})
        };

        if (survey.surveyType === 'paid') {
          response.radixAddress = values.radixAddress || null;
        }

        this.props.postSurveyAnswers(survey.id, response, message);
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
    
    if (isLoading || !survey) {
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
    return (
      <>
        <Title>{survey.title}</Title>
        <Paragraph>{survey.description}</Paragraph>
        
        <NavLink to={`${this.props.match.url}/results`}>Show results</NavLink>
        <Divider/>
        <Form layout="vertical" onSubmit={this.handleSubmit}>

          {survey.surveyType === SurveyType.Paid &&
            <Form.Item label={<Title level={4} className="no-bottom-margin">Your Radix DLT wallet address</Title>}>
          
            {getFieldDecorator('radixAddress', {
              rules: [{ required: false }]
            })(
              <Input placeholder='Address of your Radix DLT wallet address where you want to receive the prize'/>
            )}
          </Form.Item>
          }
          
          
          {survey.questions.map((question, index) => {

            return (
              <Form.Item label={<Title level={3} className="no-bottom-margin">{question.questionText}</Title>}
                          key={index}>
                {question.type === 'shortText' && getFieldDecorator(index.toString(), {
                  rules: [{ required: question.required, message: 'This answer is required' }]
                })(
                  <Input placeholder='Your answer...'/>
                )}


                {question.type === 'longText' && getFieldDecorator(index.toString(), {
                  rules: [{ required: question.required, message: 'This answer is required' }]
                })(
                  <TextArea placeholder='Your answer...'/>
                )}


                {question.type === 'radio' && getFieldDecorator(index.toString(), {
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


                {question.type === 'checkbox' && getFieldDecorator(index.toString(), {
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
    answersSubmitted: state.answersSubmitted,
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurvey: (surveyId) => 
      dispatch(SurveyListActions.getSurvey(surveyId)),
    postSurveyAnswers: (surveyId, answers, antMessage) =>
      dispatch(SurveyListActions.postSurveyAnswers(surveyId, answers, antMessage))
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Form.create()(Survey));
