import React from 'react';
import { Button, Form, Input, Select, Radio, Checkbox, Typography } from 'antd';
import '../../styles/QuestionDeleteButton.css';
import { FastField, FieldArray } from 'formik';
const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function QuestionList ({ form, push, remove }) {
  const addQuestion = () => push({ ...questionTemplate, id: questionId++ });
  const removeQuestion = (index) => remove(index);

  return <>
    {form.values.questions.map((question, index) => {
      return <div key={question.id}>
        <Question {...{ form, question, index }} removeQuestion={() => removeQuestion(index)}/>
      </div>;
    })}
    
    {// Empty form item to show label, info text and
     // validation message when there are no questions
      form.values.questions.length === 0 &&
      <Form.Item help={form.errors.questions && form.submitCount > 0 ? form.errors.questions : false}
                validateStatus={form.errors.questions && form.submitCount > 0 ? "error" : "success"}>
        <Text>There are no questions. Start by adding some questions!</Text>
      </Form.Item>}
    <Button icon="plus" type="dashed" onClick={addQuestion}
      style={{ width: '100%' }}>Add question</Button>
  </>;
}


function Question({ form, question, index, removeQuestion }) {
  // TODO Opt for something less cryptic maybe?
  const touchedQuestions = form.touched.questions;
  const errorQuestions = form.errors.questions;
  const touchedQuestionText = touchedQuestions && touchedQuestions[index] && touchedQuestions[index].questionText;
  const errorQuestionText = errorQuestions && errorQuestions[index] && errorQuestions[index].questionText;

  const touchedAnswers = form.touched.answers;
  const errorAnswers = form.errors.answers;
  const questionAnswers = form.values.answers.map((x, i) =>
    ({ ...x, touched: touchedAnswers && !!touchedAnswers[i], error: errorAnswers && errorAnswers[i] && errorAnswers[i].answerText }))
    .filter(x => x.questionId === question.id);

  const touchedAnswer = questionAnswers.some(x => x.touched);
  const errorAnswer = questionAnswers.find(x => x.error);
  const errorNoAnswer = ['checkbox', 'radio'].indexOf(question.type) !== -1 && questionAnswers.length === 0 && 'This question must have at least 1 answer choice';
  const showError = (errorQuestionText && touchedQuestionText) || (errorAnswer && touchedAnswer) || (errorNoAnswer && touchedQuestionText);
  const error = errorQuestionText ? errorQuestionText : (errorAnswer ? errorAnswer.error : ( errorNoAnswer ? errorNoAnswer : false));

  return (
    // TODO all fields are red, when only on fails
    <Form.Item help={showError && error}
               validateStatus={showError && error ? "error" : "success"}>
      <Input.Group compact>
        
        <QuestionText positionInArray={index} />

        <QuestionType positionInArray={index} />

        <Button shape="circle" icon="close"
                className="question-delete-button"
                style={{ width: '6%' }}
                onClick={removeQuestion} />
        <br/>
        
      </Input.Group>

      
      <FieldArray name="answers">
          {arrayHelpers => <Answers {...arrayHelpers} question={question}/>}
        </FieldArray>
    </Form.Item>
  );
}


function QuestionText({ positionInArray }) {
  return (
    <FastField name={`questions.${positionInArray}.questionText`}>
      {({ field, form }) => {
        console.log(field)
        return (
          <Input name={field.name} value={field.value}
                onChange={e => form.setFieldValue(field.name, e.target.value)}
                onBlur={() => form.setFieldTouched(field.name, true)}
                placeholder={`Question ${positionInArray + 1}`} style={{ width: '74%' }}/>
        );
      }}
    
    </FastField>
  );
}

function QuestionType({ positionInArray }) {
  return (
    <FastField name={`questions.${positionInArray}.type`}>
      {({ field, form }) => {
        return (
          <Select name={field.name} value={field.value} style={{ width: '20%' }}
                  onChange={v => form.setFieldValue(field.name, v)}
                  onBlur={() => form.setFieldTouched(field.name, true)}>
            <Option value="radio">Radio</Option>
            <Option value="checkbox">Checkbox</Option>
            <Option value="shortText">Short text</Option>
            <Option value="longText">Long text</Option>
          </Select>
        );
      }}
    </FastField>
  );
}

function Answers({ question, form, push, remove }) {
  // Add position in array to answer and filter only relavant answers
  const answers = form.values.answers.map((x, index) => ({ ...x, index })).filter(x => x.questionId === question.id);
  const addAnswer = () => push({ ...answerTemplate, id: answerId++, questionId: question.id });
  const removeAnswer = (index) => remove(index);
  const validateAnswer = (value) => {
    if (['radio', 'checkbox'].indexOf(question.type) !== -1 && !value.trim()) {
      return 'Supply an answer choice or delete it';
    }
    return undefined;
  }

  switch (question.type) {
    case 'radio':
      return <RadioCheckboxAnswers {...{ answers, addAnswer, removeAnswer, validateAnswer }} component={Radio}/>
    case 'checkbox':
      return <RadioCheckboxAnswers {...{ answers, addAnswer, removeAnswer, validateAnswer }} component={Checkbox}/>
    case 'shortText':
      return <ShortTextAnswer />
    case 'longText':
      return <LongTextAnswer />
    default:
      throw new RangeError('Unknown question type')
  }
}

function AddAnswerButton({ addAnswer }) {
  return <Button icon="plus" type="dashed" onClick={addAnswer} >Add answer</Button>;
}

function RadioCheckboxAnswers({ component: Component, answers, addAnswer, removeAnswer, validateAnswer }) {
  const componentStyle = { marginRight: 8 };
  return <>
    {answers.map((answer, positionInQuestion) => (
      <div key={answer.id} >
        <Component style={componentStyle} disabled />
        
        <FastField name={`answers.${answer.index}.answerText`}
                   validate={validateAnswer}>
          {({ field, form }) => {
            return (
              <Input name={field.name} value={field.value} style={{ width: '50%'}}
                    placeholder={`Answer ${positionInQuestion + 1}`}
                    onChange={e => form.setFieldValue(field.name, e.target.value)}
                    onBlur={() => form.setFieldTouched(field.name, true)} />
            );
          }}
        </FastField>

        <Button shape="circle" icon="close" style={{ border: 'none' }} onClick={() => removeAnswer(answer.index)}/>
      </div>
    ))}

    <Component style={componentStyle} disabled />
    <AddAnswerButton addAnswer={addAnswer}/>
  </>;
}

function ShortTextAnswer() {
  return <Input placeholder="User's answer" disabled />;
}

function LongTextAnswer() {
  return <TextArea placeholder="User's answer" rows={2} disabled />
}

let questionId = 0;
const questionTemplate = {
  id: undefined,
  questionText: '',
  type: 'radio'
};

let answerId = 0;
const answerTemplate = {
  id: undefined,
  questionId: undefined,
  answerText: ''
}

export default QuestionList;
