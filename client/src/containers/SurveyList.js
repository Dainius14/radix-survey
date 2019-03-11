import React from 'react';
import { Link } from 'react-router-dom'
import { connect } from 'react-redux';
import { Button, Spin, List } from 'antd';
import * as SurveyListActions from '../actions/SurveyListActions';


function SurveyList({ state, match, fetchSurveyList }) {
  return (
    <>
      <Button onClick={() => fetchSurveyList()}>Get surveys</Button>
      <div style={{ marginTop: 10 }}>
        <Spin spinning={state.isLoading}/>
      </div>

      <List dataSource={state.data.items}
            renderItem={id => {
              const survey = state.data[id];
              return (
                <List.Item actions={[
                    <span>{survey.questions.items.length} questions</span>,
                    <Link to={`${match.url}/${survey.id}`}>Open</Link>
                  ]}>
                  <List.Item.Meta
                    title={survey.title}
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

function mapStateToProps(state, ownProps) {
  return {
    state: state.surveys,
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    fetchSurveyList: () => dispatch(SurveyListActions.fetchSurveyList())
  }
}; 


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SurveyList);
