import React from 'react';
import { FormikInput, FormikTextArea, FormikInputPassword, FormikInputNumber, } from './AntField';
import { Button, Typography, Form as AntForm, InputNumber, Radio, Select, Modal, Tooltip, Icon, message } from 'antd';
import { Formik, Form, Field, FastField, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/AntFormItemLabelHeight.css';
import QuestionList from './QuestionList';
import { WinnerSelection, ResultsVisibility } from '../../constants';
import { request } from '../../utilities';
const { Text, Paragraph, Title } = Typography;
const { Option } = Select;



const winnerSelectionRadioStyle = { display: 'block', height: '30px', lineHeight: '30px', };
const formCategoryStyle = { marginBottom: 0 };


function NewSurveyContainer({ history }) {
  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema}
            onSubmit={(values, form) => showConfirm(values, form, history)}
            render={formikProps => <NewSurveyForm {...formikProps} history={history} /> }/>
  );
}

function NewSurveyForm({ values, ...form }) {
  const firstNDisabled = values.winnerSelection !== WinnerSelection.FirstN;
  const randomNAfterTimeDisabled = values.winnerSelection !== WinnerSelection.RandomNAfterTime;
  return (
    <Form className="form-container">
      
      <Title level={3}>Create a new survey</Title>
      <Title level={4} style={formCategoryStyle}>General information about your survey</Title>
      <FastField component={FormikInput} name="title" label="Title" required
        placeholder="Title of your survey" type="text" />

      <FastField component={FormikTextArea} name="description" label="Description" required
        placeholder="Description of your survey" type="text" />


      <Title level={4} style={formCategoryStyle}>Results visibility</Title>

      <Field name="resultsVisibility">
        {({ field, form }) => {
          return (
            <AntForm.Item label="Results visibility" className="form-item-required">
              <Radio.Group value={field.value}
                onChange={e => { form.setFieldValue(field.name, e.target.value); form.setFieldTouched(field.name, true); }}>

                <Radio value={ResultsVisibility.Public}>
                  <Text>Public</Text>&nbsp;
                  <Tooltip title={<><u>Everyone</u> will be able to see the answers</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>
                <Radio value={ResultsVisibility.Private}>
                  <Text>Private</Text>&nbsp;
                    <Tooltip title={<><u>Only you</u> will able to see the answers with your password</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>
                <Radio value={ResultsVisibility.PrivateForSale}>
                  <Text>Private and for sale</Text>&nbsp;
                  <Tooltip title={<><u>You</u> will be able to see the answers with your password and <u>other people</u> will
                    be able to buy some of the answers for your specified price</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>

              </Radio.Group>
            </AntForm.Item>
          );
        }}
      </Field>

      {values.resultsVisibility !== ResultsVisibility.Public &&
        <>
          <FastField component={FormikInputPassword} name="resultsPassword" label="Password" required
            placeholder="Password to access results of your survey" type="password" />

          {values.resultsVisibility === ResultsVisibility.PrivateForSale &&
            <FastField component={FormikInputNumber} name="resultsPrice"
              label={<>
                <Text>Price for one answer</Text>&nbsp;
                <Tooltip title="This is the price the person buying answers of your survey will pay for one answer">
                  <Icon type="question-circle-o" style={{ verticalAlign: 'initial' }} />
                </Tooltip>
              </>} required />
          }
        </>
      }

      
      <Title level={4} style={formCategoryStyle}>Survey options</Title>

      <Field name="surveyType">
        {({ field, form }) => {
          return (
            <AntForm.Item label="Survey type" className="form-item-required">
              <Radio.Group value={field.value}
                onChange={e => { form.setFieldValue(field.name, e.target.value); form.setFieldTouched(field.name, true); }}>

                <Radio value="free">
                  <Text>Free</Text>&nbsp;
                  <Tooltip title={<><u>You will not have to pay</u> for the survey to be published
                    and survey <u>participants will not be rewarded</u></>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>

                <Radio value="paid">
                  <Text>Paid</Text>&nbsp;
                  <Tooltip title={<><u>You will have to pay</u> for the survey to be published
                    and survey <u>participants will be rewarded</u> specified amount of tokens</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>

              </Radio.Group>
            </AntForm.Item>
          );
        }}
      </Field>



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

      <Title level={4} style={formCategoryStyle}>Questions</Title>
      <FieldArray name="questions" component={QuestionList} />
      <br/><br/><br/>

      <Button type="primary" htmlType="submit" loading={form.isSubmitting}
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

function showConfirm(values, form, history) {
  if (!form.errors) {
    Modal.confirm({
      title: 'Do you want to create this survey?',
      content: 'Once you create the survey - there\'s no way back. Surveys are not editable. Double check if everything is correct.',
      okText: 'Create',
      cancelText: 'Cancel',
      onOk() {
        handleSubmit(values, form, history);
        
      },
      onCancel() {
        form.setSubmitting(false);
      }
    });
  }
}


async function handleSubmit(values, form, history) {
  console.log(values, form)
  // Create cleaned up object to send to server
  const survey = {
    title: values.title,
    description: values.description,
    surveyType: values.surveyType,
    resultsVisibility: values.resultsVisibility,
  }

  if (values.resultsVisibility !== ResultsVisibility.Public) {
    survey.resultsPassword = values.resultsPassword;

    if (values.resultsVisibility === ResultsVisibility.PrivateForSale) {
      survey.resultsPrice = values.resultsPrice;
    }
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
    form.setSubmitting(false);
    history.push('/surveys/' + response.id);
    message.config({ top: 50 });
    message.success('Survey created successfully!', 5);
  }
  catch (error) {
    console.error('postSurvey() error', error);
    form.setSubmitting(false);
  }
}

const initialValues = {
  title: '',
  description: '',
  surveyType: 'free',

  resultsVisibility: ResultsVisibility.Public,
  resultsPassword: '',
  resultsPrice: 0,

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
const questionValidationSchema = Yup.object().shape({
  questionText: Yup.string().trim().required('Write text for the question or delete the question')
});

const winnerCountErrorMsg = 'Your survey must have at least 1 winner';
const winnerCountNotIntErrorMsg = 'There can be only an even number of winners';
const randomNAFterMTimeTimeErrorMsg = 'Your survey must last at least 1 hour';


const validationSchema = Yup.object().shape({
  title: Yup.string().trim().required('Your survey must have a title').max(80),
  description: Yup.string().trim().required('Your survey must have a description').max(500),
  resultsVisibility: Yup.string().required(),
  resultsPassword: Yup.string()
    .when('resultsVisibility', {
      is: ResultsVisibility.Public,
      then: Yup.string().notRequired(),
      otherwise: Yup.string().required('Enter a password or make results public')
    }),
  resultsPrice: Yup.number()
    .when('resultsVisibility', {
      is: ResultsVisibility.PrivateForSale,
      then: Yup.number().required('Enter a price or choose another visibility option').positive('Enter a price or choose another visibility option'),
      otherwise: Yup.number().notRequired(),
    }),

  surveyType: Yup.string().required(),

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

export default NewSurveyContainer;
