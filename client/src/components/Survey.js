import React from 'react';
import { connect } from 'react-redux';
import { Divider, Button, Spin, Input } from 'antd';
import * as SurveyListActions from '../actions/SurveyListActions';


class Survey extends React.Component {
  
  componentDidMount() {
    const { survey, match, getSurvey } = this.props;
    if (!survey) {
      getSurvey(match.params.surveyId);
    }
  }

  render() {
    const { survey } = this.props;

    if (!survey) {
      return (
        <div style={{ marginTop: 10 }}>
          <Spin spinning={!survey}/>
        </div>
      );
    }

    // Got survey, can render it
    const { title, shortDescription } = survey;
    return (
      <>
        <h1>{title}</h1>
        <p>{shortDescription}</p>

        <Divider/>

        {survey.questions.items.map(questionId => {
          const question = survey.questions[questionId];

          return (
            <div key={questionId}>
              <h2>{question.questionText}</h2>

              {question.question_type === 'short_text' &&
                <Input></Input>
              }
            </div>
          );
        })}

        <Button>Submit answers</Button>
      </>
    );
  }
}

function mapStateToProps(state, ownProps) {
  return {
    isLoading: state.surveys.isLoading,
    survey: state.surveys.data[ownProps.match.params.surveyId],
    match: ownProps.match
  }
}

function mapDispatchToProps(dispatch) {
  return {
    getSurvey: (surveyId) => 
      dispatch(SurveyListActions.getSurvey(surveyId))
    // editSurveyProperty: (property, value) =>
    //   dispatch(NewSurveyActions.editSurveyProperty(property, value)),
    // postSurvey: (survey) =>
    //   dispatch(NewSurveyActions.postSurvey(survey))
  }
}; 

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Survey);
