import React from 'react';
import { connect } from 'react-redux';
import { Spin, Input, Typography, Statistic, Radio, Modal, Form } from 'antd';
import * as SurveyListActions from '../../actions/SurveyListActions';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/NoBottomMargin.css';
const { Title, Text } = Typography;


class Results extends React.Component {
  constructor() {
    super();
    this.state = {
      chartOptions: undefined,
      questionResponses: undefined
    }
  }

  componentDidMount() {
    const { match, getSurveyResults } = this.props;
    getSurveyResults(match.params.surveyId);
  }

  handleChartTypeChanged = (questionId, newType) => {
    const chartOptions = [ ...this.state.chartOptions ];
    chartOptions[questionId] = { 
      chart: {
        type: newType
      }
    };

    switch (newType) {
      case 'column':
        chartOptions[questionId].legend = {
          enabled: false
        };
        break;
      case 'pie':
      default:
        chartOptions[questionId].legend = {
          enabled: true
        };
        break;
    }

    this.setState({ chartOptions });
  }

  componentDidUpdate() {
    if (this.props.survey && this.props.survey.responses && !this.state.chartOptions) {
      this.setupCharts();
    }
  }

  /**
   * Setup charts for first use. Using local state for this.
   */
  setupCharts = () => {
    const { survey } = this.props;
    const questionResponses = survey.questions
      .map((_, index) => survey.responses.map((response) => response.answers[index]))
      .filter(x => x !== undefined);
    this.setState({
      questionResponses: questionResponses,
      chartOptions: survey.questions.map((question, questionIndex) => {
        return {
          chart: {
            height: 300,
            type: 'pie'
          },
          title: {
            text: null,
          },
          credits: {
            enabled: false
          },
          legend: {
            enabled: true,
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle'
          },
          xAxis: {
            categories: question.answerChoices.map((choice) => choice.answerText)
          },
          series: [{
            name: question.questionText,
            data: question.answerChoices.map((choice, answerIndex) => ({
              name: choice.answerText,
              y: questionResponses[questionIndex].filter(x => x === answerIndex).length,
              showInLegend: true,
            })),
            showInLegend: true,
            }]
          };
        })
      });
  }

  savePasswordFormRef = (formRef) => {
    this.passwordFormRef = formRef;
  }

  handlePasswordCancel = () => {
    this.props.closePasswordDialog();
    this.props.history.push('/surveys/' + this.props.match.params.surveyId);
  }

  handlePasswordSubmit = () => {
    const form = this.passwordFormRef.props.form;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }
      form.resetFields();
      console.log(values)
      this.props.closePasswordDialog();
      this.props.getSurveyResults(this.props.match.params.surveyId, values.password);
    });
  }

  render() {
    const { chartOptions } = this.state;
    const { survey, isLoading, error, needPassword } = this.props;

    if (isLoading || (survey && !survey.responses) || !chartOptions) {
      return (
        <>
          <Spin style={{ width: '100%', display: 'block' }} spinning={true} />
          <PasswordForm
            wrappedComponentRef={this.savePasswordFormRef}
            visible={needPassword}
            onSubmit={this.handlePasswordSubmit}
            onCancel={this.handlePasswordCancel}
            />
        </>
      );
    }

    if (error) {
      return (
        <Text code className="multiline-code">{JSON.stringify(error, null, 4)}</Text>
      );
    }


    // Got results, can render them
    return (
      <>
        <Title>{survey.title}</Title>
        <Title level={2} style={{ marginTop: 0 }}>Results</Title>
        
        <Statistic title="Total answers" value={survey.responses.length} />

        {survey.questions.map((question, index) => {

          if (['radio', 'checkbox'].includes(question.type)) {
            return (
              <div key={index}>
                <Title level={3} className="no-bottom-margin">{question.questionText}</Title>
                <Text>{this.state.questionResponses[index].length} answers</Text>
                

                <span style={{ float: 'right' }}>
                  <Text style={{ marginRight: '1ch' }}>Chart type</Text>
                  <Radio.Group defaultValue="pie" size="small"
                    value={this.state.chartOptions[index].chart.type}
                    onChange={e => this.handleChartTypeChanged(index, e.target.value)}>
                    <Radio.Button value="pie">Pie</Radio.Button>
                    <Radio.Button value="column">Column</Radio.Button>
                  </Radio.Group>
                </span>
                <div style={{ clear: 'both' }}  /* Fix previous float */>
                  <HighchartsReact
                    highcharts={Highcharts}
                    options={this.state.chartOptions[index]}
                  />
                </div>
              </div>
            );
          }
          else {
            return this.state.questionResponses[index].forEach(response => {
              return <div>response</div>
            });
          }
        })}
      </>
    );
  }
}

const PasswordForm = Form.create({ name: 'password_form' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onSubmit, form, survey } = this.props;
      const { getFieldDecorator } = form;
      return (
        <Modal
          visible={visible}
          title="Please enter a password to view survey results"
          okText="Submit"
          onCancel={onCancel}
          onOk={onSubmit}
        >
          <Form layout="vertical">
            <Form.Item label="Password">
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input a password!' }],
              })(
                <Input.Password onKeyDown={(e)=> e.keyCode == 13 && onSubmit()} />
              )}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);
function mapStateToProps(state, ownProps) {
  return {
    isLoading: state.surveys.isLoading,
    error: state.surveys.error,
    survey: state.surveys.data[ownProps.match.params.surveyId],
    match: ownProps.match,
    needPassword: state.surveys.needPassword
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurveyResults: (surveyId, password) => 
      dispatch(SurveyListActions.getSurveyResults(surveyId, password)),
    closePasswordDialog: () =>
      dispatch(SurveyListActions.closePasswordDialog())
  }
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
