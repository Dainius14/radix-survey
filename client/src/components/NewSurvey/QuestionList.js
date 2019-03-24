import React from 'react';
import { connect } from 'react-redux'
import Question from './Question';
import { Button } from 'antd';
import * as NewSurveyActions from '../../actions/NewSurveyActions';

function NewSurveyQuestionList({ questions, addQuestion, removeQuestion, editQuestion }) {
  return(
    <>
      {questions.items.map(questionId => {
        const q = questions[questionId];
        return <Question key={q.id} question={q} removeQuestion={removeQuestion} editQuestion={editQuestion} />;
      })}
      <Button icon="plus" onClick={addQuestion}>Add question</Button>
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    questions: state.newSurvey.data.questions
  }
};

const mapDispatcherToProps = (dispatcher) => ({
  addQuestion: () =>
    dispatcher(NewSurveyActions.addQuestion()),
  removeQuestion: (questionId) =>
    dispatcher(NewSurveyActions.removeQuestion(questionId)),
  editQuestion: (questionId, property, value) =>
    dispatcher(NewSurveyActions.editQuestionProperty(questionId, property, value))
});

export default connect(
  mapStateToProps,
  mapDispatcherToProps
)(NewSurveyQuestionList);