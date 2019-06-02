import React from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { List, Typography, Icon, Divider, Button } from 'antd';
import * as SurveyListActions from '../../actions/SurveyListActions';
import '../../styles/MultilineCode.css';
import '../../styles/SurveyList.css';
import Paragraph from 'antd/lib/typography/Paragraph';
const { Text } = Typography;

const itemCount = 8;

const IconText = ({ type, text }) => (
  <span style={{ marginRight: 24 }}>
    <Icon type={type} style={{ marginRight: 8 }} />
    {text}
  </span>
);

class SurveyList extends React.Component {

  componentDidMount() {
    // Get surveys from server if not all are loaded
    const { surveys, getSurveys } = this.props;
    if (!surveys.allLoaded) {
      getSurveys(0, itemCount);
    }
  }

  render() {
    const { surveys } = this.props;
    
    if (surveys.error) {
      // Remove error on next load
      const errorText = JSON.stringify(surveys.error, null, 4);
      surveys.error = null;
      return (
        <Text code className="multiline-code">{errorText}</Text>
      );
    }
    
    // Already have surveys, can render them
    return (
      <>
        {// Show about message in first 
          this.props.location.pathname === '/' &&
          <AboutPage />
        }
        <List dataSource={surveys.data.items}
              loadMore={
                <div
                  style={{ textAlign: 'center', marginTop: 8 }}
                >
                  <Button
                    onClick={() => this.props.getSurveys(surveys.data.items.length, itemCount)}
                  >
                    Load more
                  </Button>
                </div>
              }
              itemLayout="vertical"
              loading={surveys.isLoading}
              renderItem={id => {
                const survey = surveys.data[id];
                if (survey.surveyVisibility === 'private') return null;
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={<Link to={`/surveys/${survey.id}`}>{survey.title}</Link>}
                      description={<>
                        <IconText type="calendar" text={getFormattedTime(survey.created)} />
                        <IconText type="bars" text={`${survey.questions.length} questions`} />
                        <IconText type="dollar" text={getRewardForUser(survey)} />
                        <IconText type="bar-chart" text={`${survey.totalResponses} responses`} />
                      </>}
                      
                      />
                    {survey.description}
                  </List.Item>
                );
              }}/>
      </>
    );
  }
}

function getFormattedTime(date) {
  const d = new Date(date);
  return d.getFullYear() + '-' +
    ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
    ('0' + d.getDate()).slice(-2) + ' ' +
    ('0' + d.getHours()).slice(-2) + ':' +
    ('0' + d.getMinutes()).slice(-2);
}

function getRewardForUser(survey) {
  if (survey.surveyType === 'free') {
    return 'Free';
  }
  return roundToPrecision(survey.totalReward / survey.winnerCount, 2) + ' Rads';
}

function roundToPrecision(number, precision) {
  return Math.round(number * Math.pow(10, precision)) / Math.pow(10, precision);
}

function AboutPage() {
  return <>
    <strong>About this website</strong><br/>
    <Paragraph>Create and participate in surveys. When creating a survey,
      you can choose to spend some RadixDLT tokens and people get a chance to win them for
      participating in your survey. <a href="https://www.radixdlt.com/" target="_blank" rel="noopener noreferrer">You can
      read more about RadixDLT here.</a> You can download your own RadixDLT wallet <a href="https://www.radixdlt.com/wallet/">here</a>.
    </Paragraph>
    <Divider />
  </>;
}

function mapStateToProps(state, ownProps) {
  return {
    surveys: state.surveys,
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurveys: (start, limit) => dispatch(SurveyListActions.getSurveys(start, limit))
  }
}; 


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SurveyList);
