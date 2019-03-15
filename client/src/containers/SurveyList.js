import React from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { Spin, List } from 'antd';
import * as SurveyListActions from '../actions/SurveyListActions';


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

    if (surveys.isLoading) {
      return (
        <div style={{ marginTop: 10 }}>
          <Spin spinning={surveys.isLoading}/>
        </div>
      );
    }
    if (surveys.error) {
      return (
        <div style={{ marginTop: 10 }}>{surveys.error.toString()}</div>
      );
    }

    // Already have surveys, can render them
    return (
      <>
        <List dataSource={surveys.data.items}
              renderItem={id => {
                const survey = surveys.data[id];
                return (
                  <List.Item actions={[
                      <span>{survey.questions.items.length} questions</span>,
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
