import React from 'react';
import { FormikInput, FormikTextArea, FormikRadioGroup, } from './AntField';
import { Button, Typography, Form as AntForm, InputNumber, Radio, Select } from 'antd';
import { Formik, Form, Field, FastField, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/AntFormItemLabelHeight.css';
import QuestionList from './QuestionList';
import { WinnerSelection } from '../../constants';
import { request } from '../../utilities';
const { Text, Paragraph } = Typography;
const { Option } = Select;



const initialValues = {
  title: '',
  description: '',
  surveyType: 'free',

  winnerSelection: WinnerSelection.FirstN,
  
  firstNCount: 0,
  
  randomNAfterTimeCount: 0,
  randomNAfterTimeLength: 0,
  randomNAfterTimeUnits: 'hours',
  
  totalReward: 0,
  radixAddress: '',

  questions: [],
  answers: [],
};

const winnerSelectionRadioStyle = { display: 'block', height: '30px', lineHeight: '30px', };

const winnerCountErrorMsg = 'Your survey must have at least 1 winner';
const winnerCountNotIntErrorMsg = 'There can be only an even number of winners';
const randomNAFterMTimeTimeErrorMsg = 'Your survey must last at least 1 hour';

const questionValidationSchema = Yup.object().shape({
  questionText: Yup.string().trim().required('Write text for the question or delete the question')
});

const validationSchema = Yup.object().shape({
  title: Yup.string().trim().required('Your survey must have a title'),
  description: Yup.string().trim().required('Your survey must have a description'),
  surveyType: Yup.string().oneOf(['free', 'paid']),

  winnerSelection: Yup.string().required(),
  
  firstNCount: Yup.number()
    .when('surveyType', {
      is: 'free',
      then: Yup.number().notRequired(),
      otherwise: Yup.number()
        .when('winnerSelection', {
          is: WinnerSelection.FirstN,
          then: Yup.number().min(1, winnerCountErrorMsg)
            .typeError(winnerCountErrorMsg).required(winnerCountErrorMsg)
            .integer(winnerCountNotIntErrorMsg),
          otherwise: Yup.number().notRequired()
        }),
    }),

  randomNAfterTimeCount: Yup.number()
    .when('surveyType', {
      is: 'free',
      then: Yup.number().notRequired(),
      otherwise: Yup.number()
        .when('winnerSelection', {
          is: WinnerSelection.RandomNAfterTime,
          then: Yup.number().min(1, winnerCountErrorMsg)
            .typeError(winnerCountErrorMsg).required(winnerCountErrorMsg)
            .integer(winnerCountNotIntErrorMsg),
          otherwise: Yup.number().notRequired()
        })
    }),

  randomNAfterTimeLength: Yup.number()
    .when('surveyType', {
      is: 'free',
      then: Yup.number().notRequired(),
      otherwise: Yup.number()
        .when('winnerSelection', {
          is: WinnerSelection.RandomNAfterTime,
          then: Yup.number().min(1, randomNAFterMTimeTimeErrorMsg).typeError(randomNAFterMTimeTimeErrorMsg).required(randomNAFterMTimeTimeErrorMsg),
          otherwise: Yup.number().notRequired()
        })
    }),

  randomNAfterTimeUnits: Yup.string()
    .when('surveyType', {
      is: 'free',
      then: Yup.string().notRequired(),
      otherwise: Yup.string()
        .when('winnerSelection', {
          is: WinnerSelection.RandomNAfterTime,
          then: Yup.string().trim().required(),
          otherwise: Yup.string().notRequired()
        })
    }),
  
  totalReward: Yup.number()
    .when('surveyType', {
      is: 'free',
      then: Yup.number().notRequired(),
      otherwise: Yup.number().positive('Reward must be a positive number').typeError('Reward must be a positive number')
        .required('Total reward is required')
    }),

  radixAddress: Yup.string()
    .when('surveyType', {
      is: 'free',
      then: Yup.string().notRequired(),
      otherwise: Yup.string().length(51, 'Radix account address is 51 characters long').required('RadixDLT account address is required')
    }),

  questions: Yup.array(questionValidationSchema).min(1, 'Add at least 1 question before submitting'),
});

async function handleSubmit(values, form) {
  console.log('Form valid');
  form.setSubmitting(false);
  
  // Create cleaned up object to send to server
  const survey = {
    title: values.title,
    description: values.description,
    surveyType: values.surveyType,
  }

  if (values.surveyType === 'paid') {
    survey.winnerSelection = values.winnerSelection;
    survey.radixAddress = values.radixAddress;
    survey.totalReward = values.totalReward;
    switch (values.winnerSelection) {
      case WinnerSelection.FirstN:
        survey.firstNCount = values.firstNCount;
        break;
      case WinnerSelection.RandomNAfterTime:
        survey.randomNAfterTimeCount = values.randomNAfterTimeCount;
        survey.randomNAfterTimeLength = values.randomNAfterTimeLength;
        survey.randomNAfterTimeUnits = values.randomNAfterTimeUnits;
        break;
      case WinnerSelection.RandomNAfterMParticipants:
        
        break;
      default:
        break;
    }
  }

  // Filter out undefined questions
  survey.questions = values.questions.filter(x => x).map(q => {
    const question = {
      questionText: q.questionText,
      type: q.type
    };

    // Get associated answer choices
    if (q.type === 'radio' || q.type === 'checkbox') {
      question.answerChoices = values.answers.filter(x => x.questionId === q.id).map(a => {
        return {
          answerText: a.answerText
        };
      });
    }
    return question;
  });

  // Post survey to server
  const apiEndpoint = process.env.REACT_APP_API_ENDPOINT || window.location.origin;
  console.debug('postSurvey() request:', survey);
  try {
    const response = await request(`${apiEndpoint}/api/surveys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(survey)
    });
    console.debug('postSurvey() success', response);
  }
  catch (error) {
    console.error('postSurvey() error', error);
  }
}

function NewSurveyContainer() {
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema}
            onSubmit={handleSubmit}
            render={NewSurveyForm}/>
  );
}

function NewSurveyForm(form) {
  const { values, handleSubmit } = form;
  const firstNDisabled = values.winnerSelection !== WinnerSelection.FirstN;
  const randomNAfterTimeDisabled = values.winnerSelection !== WinnerSelection.RandomNAfterTime;
  return (
    <Form className="form-container" onSubmit={handleSubmit}>
      
      <FastField component={FormikInput} name="title" label="Title" required
        placeholder="Title of your survey" type="text"
      />

      <FastField component={FormikTextArea} name="description" label="Description" required
        placeholder="Description of your survey" type="text"/>

      <FastField component={FormikRadioGroup} name="surveyType" label="Survey type" required
        radioOptions={[{ value: 'paid', label: 'Paid' }, { value: 'free', label: 'Free' }]}
      />

      {values.surveyType === 'paid' &&
        // Paid survey related stuff
        <>
          <Field name="winnerSelection">
            {({ field, form }) => {
              return (
                <AntForm.Item label="Winner selection"
                              className="form-item-required"
                              help={winnerSelectionHelpText(form)}
                              validateStatus={getGroupValidateStatus(form, ['firstNCount', 'randomNAfterTimeCount', 'randomNAfterTimeLength'])}>
                  <Radio.Group name="winnerSelection" value={field.value}
                               onChange={e => { form.setFieldValue(field.name, e.target.value); form.setFieldTouched(field.name, true); }}>

                    <Radio value={WinnerSelection.FirstN} style={winnerSelectionRadioStyle}>
                      <Text>First</Text>
                      
                      <Field name="firstNCount">
                        {({ field, form }) => {
                          return (
                            <InputNumber name={field.name} size="small" style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                              value={field.value}
                              onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name, true); }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              disabled={firstNDisabled}/>
                          );
                        }}
                      </Field>
                      <Text>to submit answers</Text>
                    </Radio>

                    <Radio value={WinnerSelection.RandomNAfterTime} style={winnerSelectionRadioStyle}>
                      <Text>Randomly selected</Text>

                      <Field name="randomNAfterTimeCount">
                        {({ field, form }) => {
                          return (
                            <InputNumber name={field.name} size="small" style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                              value={field.value}
                              onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name, true); }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              disabled={randomNAfterTimeDisabled}/>
                          );
                        }}
                      </Field>

                      <Text>people to submit answers in</Text>
                      
                      <Field name="randomNAfterTimeLength">
                        {({ field, form }) => {
                          return (
                            <InputNumber name={field.name} size="small" style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                              value={field.value}
                              onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name, true); }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              disabled={randomNAfterTimeDisabled}/>
                          );
                        }}
                      </Field>
                      
                      <Field name="randomNAfterTimeUnits">
                        {({ field, form }) => {
                          return (
                            <Select name={field.name} value={field.value} size="small" style={{ width: '11ch' }}
                                    disabled={randomNAfterTimeDisabled}>
                              <Option value="hours">Hours</Option>
                              <Option value="days">Days</Option>
                              <Option value="weeks">Weeks</Option>
                            </Select>
                          );
                        }}
                      </Field>
                    </Radio>

                  </Radio.Group>
                </AntForm.Item>
              );
            }}
          </Field>


          <Field name="totalReward">
            {({ field, form }) => {
              return (
                <AntForm.Item label="Total reward" name={field.name}
                              className="form-item-required"
                            help={form.touched.totalReward && form.errors.totalReward}
                            validateStatus={getValidateStatus(form, field.name)}>
                  <InputNumber value={field.value}
                              onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name); }}
                              onBlur={() => form.setFieldTouched(field.name)}/>
                  <OnePersonReward values={form.values} />
                </AntForm.Item>
              );
            }}
          </Field>


          <FastField component={FormikInput} name="radixAddress" label="Your RadixDLT account address" required
                placeholder="Your Radix wallet address"
                type="text" style={{ fontFamily: 'monospace' }} />
          
          <Paragraph>Transfer <b>{values.totalReward || 0}</b> tokens to <Text code>9g7MxcyYrXAFpMMMnPZD74etUAdd7kiRufpkxeuf921haFgAiNs</Text> account</Paragraph>
        </>
      }

      <FieldArray name="questions" component={QuestionList} />
      <br/><br/><br/>

      <Button type="primary" htmlType="submit" loading={false}
              style={{ margin: 'auto' }}>Create survey</Button>
    </Form>
  );
}

function getValidateStatus(form, fieldName) {
  const error = form.errors[fieldName];
  const touched = form.touched[fieldName];
  return error && touched ? 'error' : 'success';
}

function winnerSelectionHelpText({ errors, touched, values }) {
  switch (values.winnerSelection) {
    case WinnerSelection.FirstN: {
      return errors.firstNCount && touched.firstNCount ? errors.firstNCount : false;
    }
    case WinnerSelection.RandomNAfterTime: {
      const fields = ['randomNAfterTimeCount', 'randomNAfterTimeLength'];
      return fields.reduce((acc, field) => {
        const error = errors[field] && touched[field] ? errors[field] : '';
        if (error)
          return acc ? acc + ' and ' + error[0].toLowerCase() + error.substr(1) : error;
        return acc;
      }, '');
    }
    case WinnerSelection.RandomNAfterMParticipants:
    default: {
      break;
    }
  }
}

function getGroupValidateStatus(form, fieldNames) {
  return fieldNames.some(fieldName => {
    const hasError = form.errors[fieldName];
    const touched = form.touched[fieldName];
    return hasError && touched;
  }) ? 'error' : 'success';
}


function OnePersonReward({ values }) {
  let winnerCount = values[`${values.winnerSelection}Count`];
  const onePersonWins = values.totalReward / winnerCount || 0;
  const onePersonWinsRounded = Number.isFinite(onePersonWins) && onePersonWins > 0
    ? Math.round(onePersonWins * 100) / 100 : 0;
  return (
    <Text style={{ marginLeft: '2ch' }}>One person would be winning <b>{onePersonWinsRounded}</b> tokens.</Text>
  )
}



export default NewSurveyContainer;
