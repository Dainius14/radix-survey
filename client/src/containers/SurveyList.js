import React from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { List, Typography } from 'antd';
import * as SurveyListActions from '../actions/SurveyListActions';
import '../styles/MultilineCode.css';
const { Text } = Typography;


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
              loading={surveys.isLoading}
              renderItem={id => {
                const survey = surveys.data[id];
                return (
                  <List.Item actions={[
                      <span>{survey.questions.length} questions</span>,
                      <Link to={`/surveys/${survey.id}`}>Open</Link>
                    ]}>
                    <List.Item.Meta
                      title={<Link to={`/surveys/${survey.id}`}>{survey.title}</Link>}
                      description={survey.shortDescription}/>
                  </List.Item>
                );
              }}/>
        {/* {state.data.items && state.data.items.map(id => {

          return (
            <Card title={survey.title} key={survey.id}
                  size="small" type="inner"
                  extra={<a href='#'>Open</a>}>
              <div>{survey.shortDescription}</div>
              <div><b>{survey.questions.items.length}</b> questions</div>
            </Card>
          );
        })} */}
        
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
