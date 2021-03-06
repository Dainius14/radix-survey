import React from 'react';
import { connect } from 'react-redux';
import { Spin, Input, Typography, Statistic, Radio, Modal, Form, Table as AntTable, Button, Row, Col } from 'antd';
import * as SurveyListActions from '../../actions/SurveyListActions';
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/NoBottomMargin.css';
import { PageHeader, DescriptionItem } from '../PageHeader';
import { format as formatDate } from 'timeago.js';
const { Title, Text } = Typography;


class Responses extends React.Component {
  state = {
    chartSetup: false,
    resultsView: 'summary',
    chartOptions: undefined,
    questionResponses: undefined,
  }

  componentDidMount() {
    const { match, getSurveyResults } = this.props;
    getSurveyResults(match.params.surveyId);
    // else if (survey.resultsVisibility !== ResultsVisibility.Public) {
      
    // }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.survey && this.props.survey.responses
        && (!this.state.chartOptions || prevProps.survey.responses.length !== this.props.survey.responses.length)) {
      this.setupCharts();
      this.setupTableData();
    }
  }

  /**
   * Setup charts for first use. Using local state for this.
   */
  setupCharts = () => {
    const { survey } = this.props;
    const questionResponses = survey.questions
      .map((_, index) => 
        survey.responses.map((response) => response.answers[index])
          .filter(x => !(typeof x === 'undefined' || x === ''))
      );
    
    const chartOptions = survey.questions.map((question, questionIndex) => {
      if (!['radio', 'checkbox'].includes(question.type)) {
        return null;
      }

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
            y: questionResponses[questionIndex].filter(x => x.includes(answerIndex)).length,
            showInLegend: true,
          })),
          showInLegend: true,
          }]
        };
    });
    this.setState({
      questionResponses: questionResponses,
      chartOptions: chartOptions
    });
  }

  setupTableData = () => {
    const tableView = {
      columns: [
        {
          dataIndex: '_number',
          title: 'No.',
          width: 'min-content'
        },
        {
          dataIndex: '_date',
          title: 'Date',
          width: 140
        },
        ...this.props.survey.questions.map((question, index) => ({
          key: index + 2,
          dataIndex: index,
          title: question.questionText
        }))
      ],
      data: this.props.survey.responses.map((response, index) => {
        const totalQuestions = this.props.survey.questions.length;
        const data = {
          key: index + 1,
          _number: index + 1,
          _date: `${new Date(response.created).toLocaleString('lt-LT')}\n(${formatDate(response.created)})`
        };
        for (let i = 0; i < totalQuestions; i++) {
          const question = this.props.survey.questions[i];
          const questionAnswer = response.answers[i];
          
          if (typeof questionAnswer === 'undefined') {
            data[i] = '';
            continue;
          }

          if (question.type === 'radio') {
            data[i] = question.answerChoices[questionAnswer].answerText;
          }
          else if (question.type === 'checkbox') {
            data[i] = questionAnswer.map(answer => question.answerChoices[answer].answerText).join(', ');
          }
          else {
            data[i] = questionAnswer;
          }
        }
        return data;
      })
    };
    
    this.setState({ tableView: tableView });
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
      this.props.closePasswordDialog();
      this.props.getSurveyResults(this.props.match.params.surveyId, values.password);
    });
  }

  handleDownloadResults = () => {
    let csvContent = "data:text/csv;charset=utf-8,";

    const columns = this.state.tableView.columns.filter(x => x.dataIndex !== '_number' && x.dataIndex !== 'key').map(x => x.dataIndex);
    csvContent += this.state.tableView.columns.filter(x => x.dataIndex !== '_number' && x.dataIndex !== 'key')
      .map(x => `"${x.title.replace(/"/g, '""')}"`).join(',') + '\n';
    csvContent += this.state.tableView.data.map(row => {
      return columns.map((col) => {
        let value = row[col];
        if (col === '_date') {
          value = row[col].split('\n')[0]
        }
        return `"${value.replace(/"/g, '""')}"`;
      }).join(',')
    }).join('\n');

    var anchor = document.createElement('a');
    anchor.href = csvContent;
    anchor.target = '_blank';
    anchor.download = this.props.survey.title.toLowerCase().replace(/ /g, '_') + '.csv';
    anchor.click();
  }

  handleChartTypeChanged = (questionId, newType) => {
    const chartOptions = [ ...this.state.chartOptions ];
    chartOptions[questionId] = { 
      chart: {
        type: newType
      }
    };
    console.log(questionId, newType);
    
    chartOptions[questionId].legend = {
      enabled: newType === 'pie'
    };

    this.setState({ chartOptions });
  }


  render() {
    const { chartOptions, ...state } = this.state;
    const { survey, isLoading, error, needPassword } = this.props;

    const pageHeader = survey ? <PageHeader
        title={survey.title}
        subTitle="Responses"
        onBack={() => this.props.history.push(`/surveys/${this.props.match.params.surveyId}`)}
        bottomLeftActions={
          <Radio.Group key="0" defaultValue="summary" buttonStyle="solid"
            onChange={(e) => this.setState({ resultsView: e.target.value })}>
            <Radio.Button value="summary" icon="ordered-list">Summary</Radio.Button>
            <Radio.Button value="table">Table</Radio.Button>
          </Radio.Group>}
        bottomRightActions={
          <Button key="1" icon="download" onClick={this.handleDownloadResults}>Download responses (.csv)</Button>
        }
        >
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <Row>
              <DescriptionItem label="Survey created">{formatDate(survey.published)}</DescriptionItem>
              <DescriptionItem label="Survey type">{survey.surveyType[0].toUpperCase() + survey.surveyType.substr(1)}</DescriptionItem>
              <DescriptionItem label="First response">{survey.firstResponse ? formatDate(survey.firstResponse) : '-'}</DescriptionItem>
              <DescriptionItem label="Last response">{survey.lastResponse ? formatDate(survey.lastResponse) : '-'}</DescriptionItem>
            </Row>
          </div>
          <div>
            <Row>
              <Col span={12}>
                <Statistic title="Total responses" value={survey.totalResponses} />
              </Col>

              {survey.responsesPurchased &&
              <Col span={12}>
                <Statistic title="Your purchased responses" value={survey.responses.length} />
              </Col>}
              
              
            </Row>
          </div>
        </div>
      </PageHeader> : null;

    if (isLoading || (survey && !survey.responses) || !chartOptions) {
      return (
        <>
          {pageHeader}
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
        {pageHeader}

        {state.resultsView === 'summary' &&
          <>
            {survey.questions.map((question, index) =>
              <div key={index}>
                <Title level={3} className="no-bottom-margin">{question.questionText}</Title>
                <Text>{state.questionResponses[index].length} responses</Text>


                {!state.questionResponses[index].length ?
                  null :
                  ['radio', 'checkbox'].includes(question.type) ?
                    <Chart chartOptions={chartOptions[index]}
                    handleChartTypeChanged={e => this.handleChartTypeChanged(index, e.target.value)} /> :
                    <Table responses={state.questionResponses[index]} />
                }
              </div>
            )}
          </>}
        

        {state.resultsView === 'table' &&
          <AntTable dataSource={state.tableView.data} columns={state.tableView.columns} scroll={{ x: 'max-content' }} size="middle" />}
      </>
    );
  }
}


function Chart({ chartOptions, handleChartTypeChanged }) {
  return <>
    <span style={{ float: 'right' }}>
      <Text style={{ marginRight: '1ch' }}>Chart type</Text>
      <Radio.Group defaultValue="pie" size="small"
        value={chartOptions.chart.type}
        onChange={handleChartTypeChanged}
        >
        <Radio.Button value="pie">Pie</Radio.Button>
        <Radio.Button value="column">Column</Radio.Button>
      </Radio.Group>
    </span>
    <div style={{ clear: 'both' }}  /* Fix previous float */>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
      />
    </div>
  </>;
}


function Table({ responses }) {
  const columns = [{
    title: 'Answer',
    dataIndex: 'answer',
    key: 'answer',
  }];

  const dataSource = responses.map((response, index) => ({
    key: index,
    answer: response
  }));
  return <AntTable dataSource={dataSource} columns={columns} size="small"
    pagination={false} showHeader={false} bordered={false} scroll={{ y: 300 }}/>;
}

const PasswordForm = Form.create({ name: 'password_form' })(
  // eslint-disable-next-line
  class extends React.Component {
    render() {
      const { visible, onCancel, onSubmit, form } = this.props;
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
                <Input.Password onKeyDown={(e)=> e.keyCode === 13 && onSubmit()} />
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
)(Responses);
