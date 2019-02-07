import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';
import * as serviceWorker from './serviceWorker';
import flyd from 'flyd';
import { P, S, PS, D } from 'patchinko/explicit';
import uuid from 'uuid/v4';
import { BrowserRouter } from 'react-router-dom'

/*
State management is based on Meiosis pattern http://meiosis.js.org/
*/

const answers = {
  initialState: () => ({}),

  actions: update => ({
    addAnswer: (questionId) => {
      update(S(list => {
        const newId = uuid();
        list[newId] = {
          id: newId,
          questionId: questionId,
          answerText: ''
        };
        return list;
      }));
    },
    deleteAnswer: (id) => {
      update(PS({
        [id]: D
      }));
    },
    editAnswerText: (id, value) => {
      update(PS({
        [id]: PS({ answerText: value })
      }));
    },
  })
}

const questions = {
  initialState: () => ({}),

  actions: update => ({
    addQuestion: () => {
      update(S(list => {
        const newID = uuid();
        list[newID] = {
          id: newID,
          questionText: '',
          type: 'checkbox'
        };
        return list;
      }));
    },
    deleteQuestion: (id) => {
      update(PS({
        [id]: D
      }));
    },
    editQuestionText: (id, value) => {
      update(PS({
        [id]: PS({ questionText: value })
      }));
    },
    editQuestionType: (id, value) => {
      update(PS({
        [id]: PS({ type: value })
      }));
    },
  })
};

const app = {
  initialState: () => ({
    survey: {
      title: '',
      shortDescription: '',
      questions: questions.initialState(),
      answers: answers.initialState()
    },
  }),
  actions: update => ({
    questions: questions.actions(x => {
      update({
        survey: PS({
          questions: x
        })
      })
    }),

    answers: answers.actions(x => {
      update({
        survey: PS({
          answers: x
        })
      })
    }),

    editTitle: value =>
      update({
        survey: PS({ title: value })
      }),
    editShortDescription: value =>
      update({
        survey: PS({ shortDescription: value })
      }),
  })
};

const update = flyd.stream();
const states = flyd.scan(P, app.initialState(), update);
const actions = app.actions(update);


ReactDOM.render(
  <BrowserRouter>
    <App states={states} actions={actions} />
  </BrowserRouter>, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
