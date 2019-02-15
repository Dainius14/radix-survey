import React, { Component } from 'react';
import { Card } from 'antd';


class CreateSurvey extends Component {
  render() {
    const { state, actions } = this.props;
    const survey = state.survey;

    return (
      <>
        {Object.values(state.surveyList).map(survey => {
          return (
            <Card title="Some survey">
              <p>Some survey about some shit</p>
            </Card>
          );
        })}
      </>
    );
  }
}

export default CreateSurvey;
