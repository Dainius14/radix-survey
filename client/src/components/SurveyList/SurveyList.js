import React from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { List, Typography, Icon } from 'antd';
import * as SurveyListActions from '../../actions/SurveyListActions';
import '../../styles/MultilineCode.css';
import '../../styles/SurveyList.css';
const { Text } = Typography;

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
      getSurveys();
    }
  }

  render() {
    const { surveys } = this.props;

    if (surveys.error) {
      return (
        <Text code className="multiline-code">{JSON.stringify(surveys.error, null, 4)}</Text>
      );
    }

    // Already have surveys, can render them
    return (
      <>
        <List dataSource={surveys.data.items}
              itemLayout="vertical"
              loading={surveys.isLoading}
              renderItem={id => {
                const survey = surveys.data[id];
                return (
                  <List.Item>
                    <List.Item.Meta
                      title={<Link to={`/surveys/${survey.id}`}>{survey.title}</Link>}
                      description={<>
                        <IconText type="calendar" text={new Date(survey.published).toLocaleString('lt-LT')} />
                        <IconText type="bars" text={`${survey.questions.length} questions`} />
                        <IconText type="dollar" text={survey.reward / survey.firstNCount} />
                        <IconText type="bar-chart" text={`${survey.answerCount} answers`} />
                      </>}
                      
                      />
                    {survey.shortDescription}
                  </List.Item>
                );
              }}/>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    surveys: state.surveys,
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurveys: () => dispatch(SurveyListActions.getSurveys())
  }
}; 


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SurveyList);
