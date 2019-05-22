import React, { useState } from 'react';
import { FormikInput, FormikTextArea, FormikInputPassword, FormikInputNumber, } from './AntField';
import { Button, Typography, Form as AntForm, InputNumber, Radio, Select, Modal, Tooltip, Icon, message } from 'antd';
import { Formik, Form, Field, FastField, FieldArray } from 'formik';
import * as Yup from 'yup';
import '../../styles/RequiredAsteriskAfter.css';
import '../../styles/AntFormItemLabelHeight.css';
import '../../styles/AntFormItemNoBottomMargin.css';
import QuestionList from './QuestionList';
import QRReaderButton from '../QRReaderButton';
import { WinnerSelection, ResponseVisibility, SurveyVisibility, SurveyType } from '../../constants';
import { request } from '../../utilities';
import QRCode from 'qrcode.react';
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
  const randomNAfterMParticipantsDisabled = values.winnerSelection !== WinnerSelection.RandomNAfterMParticipants;
  return (
    <Form className="form-container">
      
      <Title level={3}>Create a new survey</Title>
      <Title level={4} style={formCategoryStyle}>General information about your survey</Title>
      <FastField component={FormikInput} name="title" label="Title" required
        placeholder="Title of your survey" type="text" />

      <FastField component={FormikTextArea} name="description" label="Description" required
        placeholder="Description of your survey" type="text" />

      <Title level={4} style={formCategoryStyle}>Survey options</Title>

      <Field name="surveyVisibility">
        {({ field, form }) => {
          return (
            <AntForm.Item label="Survey visibility" className="form-item-required form-item-no-bottom-margin">
              <Radio.Group value={field.value}
                onChange={e => { form.setFieldValue(field.name, e.target.value); form.setFieldTouched(field.name, true); }}>

                <Radio value={SurveyVisibility.Public}>
                  <Text>Public</Text>&nbsp;
                  <Tooltip title={<><u>Everyone</u> will be able to see the survey in survey list and participate in it</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>
                <Radio value={SurveyVisibility.Private}>
                  <Text>Private</Text>&nbsp;
                    <Tooltip title={<><u>Only people with a link</u> to the survey will able to see the survey and participate in it</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>

              </Radio.Group>
            </AntForm.Item>
          );
        }}
      </Field>

      <Field name="responseVisibility">
        {({ field, form }) => {
          return (
            <AntForm.Item label="Response visibility" className="form-item-required form-item-no-bottom-margin">
              <Radio.Group value={field.value}
                onChange={e => { form.setFieldValue(field.name, e.target.value); form.setFieldTouched(field.name, true); }}>

                <Radio value={ResponseVisibility.Public}>
                  <Text>Public</Text>&nbsp;
                  <Tooltip title={<><u>Everyone</u> will be able to see the responses</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>
                <Radio value={ResponseVisibility.Private}>
                  <Text>Private</Text>&nbsp;
                    <Tooltip title={<><u>Only you</u> will able to see the responses with your password</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>
                <Radio value={ResponseVisibility.PrivateForSale}>
                  <Text>Private and for sale</Text>&nbsp;
                  <Tooltip title={<><u>You</u> will be able to see the responses with your password and <u>other people</u> will
                    be able to buy some of the responses for your specified price</>}>
                    <Icon type="question-circle-o" />
                  </Tooltip>
                </Radio>

              </Radio.Group>
            </AntForm.Item>
          );
        }}
      </Field>

      {values.responseVisibility !== ResponseVisibility.Public &&
        <>
          <FastField component={FormikInputPassword} name="responsePassword" label="Password" required
            placeholder="Password to access results of your survey" type="password" />

          {values.responseVisibility === ResponseVisibility.PrivateForSale &&
            <>
              <FastField
                component={FormikInputNumber}
                name="responsePrice"
                label={<>
                  Price for one answer&nbsp;
                  <Tooltip title="This is the price the person buying answers of your survey will pay for one answer">
                    <Icon type="question-circle-o" style={{ verticalAlign: 'initial' }} />
                  </Tooltip>
                </>} required />
              
              <FastField component={FormikInput} name="payToRadixAddress" label="Your RadixDLT account address where you want to receive tokens for answers" required
              placeholder="Your Radix wallet address" type="text" />
              <QRReaderButton onScan={(v) => form.setFieldValue('payToRadixAddress', v)} text="You can also click here to scan QR code of your wallet" />
            </>
          }
        </>
      }

      <Field name="surveyType">
        {({ field, form }) => {
          return (
            <AntForm.Item label="Survey type" className="form-item-required form-item-no-bottom-margin">
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
          <Title level={4} style={formCategoryStyle}>Paid survey options</Title>
          <Field name="winnerSelection">
            {({ field, form }) => {
              return (
                <AntForm.Item label="Winner selection"
                              className="form-item-required"
                              help={winnerSelectionHelpText(form)}
                              validateStatus={getGroupValidateStatus(form, ['firstNCount', 'randomNAfterTimeCount', 'randomNAfterTimeLength', 'randomNAfterMNCount', 'randomNAfterMMCount'])}>
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

                    <Radio value={WinnerSelection.RandomNAfterMParticipants} style={winnerSelectionRadioStyle}>
                      <Text>Randomly selected</Text>

                      <Field name="randomNAfterMNCount">
                        {({ field, form }) => {
                          return (
                            <InputNumber name={field.name} size="small" style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                              value={field.value}
                              onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name, true); }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              disabled={randomNAfterMParticipantsDisabled}/>
                          );
                        }}
                      </Field>

                      <Text>people after</Text>
                      
                      <Field name="randomNAfterMMCount">
                        {({ field, form }) => {
                          return (
                            <InputNumber name={field.name} size="small" style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                              value={field.value}
                              onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name, true); }}
                              onBlur={() => form.setFieldTouched(field.name, true)}
                              disabled={randomNAfterMParticipantsDisabled}/>
                          );
                        }}
                      </Field>
                      
                      <Text>total answers are submitted</Text>
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
                                    onChange={v => { form.setFieldValue(field.name, v); form.setFieldTouched(field.name, true); }}
                                    onBlur={() => form.setFieldTouched(field.name, true)}
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

          
          <FastField component={FormikInput} name="payFromRadixAddress" label="Your RadixDLT account address from which you will be transferring tokens for the survey" required
                placeholder="Your Radix wallet address" type="text" />
          <QRReaderButton onScan={(v) => form.setFieldValue('payFromRadixAddress', v)} text="You can also click here to scan QR code of your wallet" />
          <Paragraph>
            <Text strong>How to create a paid survey?</Text>
            <ol style={{ marginLeft: -5 }}>
              <li><Text>Enter your Radix wallet address above.</Text></li>
              <li><Text>Complete this survey and submit it.</Text></li>
              <li><Text>Transfer <Text strong>{values.totalReward || 0} Rads</Text> to out wallet, which you can find below.</Text></li>
              <li><Text>Wait to be redirected to your survey or find a link to your survey in your RadixDLT messages.</Text></li>
            </ol>
          </Paragraph>
          
          <div style={{ textAlign: 'center' }}>Our wallet address is <Text code copyable>9g7MxcyYrXAFpMMMnPZD74etUAdd7kiRufpkxeuf921haFgAiNs</Text></div>
          <QRCode value="9g7MxcyYrXAFpMMMnPZD74etUAdd7kiRufpkxeuf921haFgAiNs" style={{ margin: '8px auto', display: 'block' }}/>
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
    case WinnerSelection.RandomNAfterMParticipants: {
      const fields = ['randomNAfterMNCount', 'randomNAfterMMCount'];
      return fields.reduce((acc, field) => {
        const error = errors[field] && touched[field] ? errors[field] : '';
        if (error)
          return acc ? acc + ' and ' + error[0].toLowerCase() + error.substr(1) : error;
        return acc;
      }, '');
    }
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


async function handleSubmit(values, form, history) {
  console.log(values, form)
  // Create cleaned up object to send to server
  const survey = {
    title: values.title,
    description: values.description,
    surveyVisibility: values.surveyVisibility,
    responseVisibility: values.responseVisibility,
    surveyType: values.surveyType
  }

  if (values.responseVisibility !== ResponseVisibility.Public) {
    survey.responsePassword = values.responsePassword;

    if (values.responseVisibility === ResponseVisibility.PrivateForSale) {
      survey.responsePrice = values.responsePrice;
      survey.payToRadixAddress = values.payToRadixAddress;
    }
  }

  if (values.surveyType === SurveyType.Paid) {
    survey.winnerSelection = values.winnerSelection;
    survey.payFromRadixAddress = values.payFromRadixAddress;
    survey.totalReward = values.totalReward;

    switch (values.winnerSelection) {

      case WinnerSelection.FirstN:
        survey.winnerCount = values.firstNCount;
        break;

      case WinnerSelection.RandomNAfterTime:
        survey.winnerCount = values.randomNAfterTimeCount;
        survey.winnerSelectionTimeLength = values.randomNAfterTimeLength;
        survey.winnerSelectionTimeUnits = values.randomNAfterTimeUnits;
        break;

      case WinnerSelection.RandomNAfterMParticipants:
        survey.winnerCount = values.randomNAfterMNCount;
        survey.requiredParticipantCount = values.randomNAfterMMCount;
        break;

      default:
        break;
    }
  }

  // Filter out undefined questions
  survey.questions = values.questions.filter(x => x).map(q => {
    const question = {
      questionText: q.questionText,
      type: q.type,
      required: q.required
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
  
  surveyVisibility: 'public',

  surveyType: 'free',

  responseVisibility: ResponseVisibility.Public,
  responsePassword: '',
  responsePrice: 0,

  winnerSelection: WinnerSelection.FirstN,
  
  firstNCount: 0,
  
  randomNAfterMNCount: 0,
  randomNAfterMMCount: 0,

  randomNAfterTimeCount: 0,
  randomNAfterTimeLength: 0,
  randomNAfterTimeUnits: 'hours',
  
  totalReward: 0,
  payFromRadixAddress: '',
  payToRadixAddress: '',

  questions: [],
  answers: [],
};
const questionValidationSchema = Yup.object().shape({
  questionText: Yup.string().trim().required('Write text for the question or delete the question')
});

/* eslint-disable no-template-curly-in-string */
// const winnerCountTypeErrorMsg = 'Winner count must be a positive whole number';
const winnerCountRequiredErrorMsg = 'Winner count is required';
const winnerCountMinErrorMsg = 'There must be at least ${min} winner';
const winnerCountMaxErrorMsg = 'There cannot be more than ${max} winners';
const winnerCountNotIntErrorMsg = 'There can be only a whole number of winners';

const requiredParticipantCountRequiredErrorMsg = 'Required participant count is required';
const requiredParticipantCountMinErrorMsg = 'There must be at least ${min} required participant';
const requiredParticipantCountMaxErrorMsg = 'There cannot be more than ${max} required participants';
const requiredParticipantCountNotIntErrorMsg = 'There can be only a whole number of required participant';

const randomNAFterMTimeTimeRequiredErrorMsg = 'Winner selection time is required';
const randomNAFterMTimeTimeMinErrorMsg = 'Winner selection time must last at least 1 hour';
const randomNAFterMTimeTimeMaxErrorMsg = 'Winner selection time cannot last more than ${max} ${units}';
const randomNAFterMTimeTimeNotIntErrorMsg = 'Winner selection time must be a whole number';


const validationSchema = Yup.object().shape({
  title: Yup.string().trim().required('Your survey must have a title').max(80),
  description: Yup.string().trim().required('Your survey must have a description').max(500),

  surveyVisibility: Yup.string().required(),
  responseVisibility: Yup.string().required(),
  surveyType: Yup.string().required(),


  responsePassword: Yup.string().when('responseVisibility', (responseVisibility, schema) => responseVisibility !== ResponseVisibility.Public ?
    schema.required('Enter a password or make responses public').max(50, 'Password cannot be longer than ${max} symbols') :
    schema.notRequired()),

  responsePrice: Yup.number().when('responseVisibility', (responseVisibility, schema) => responseVisibility === ResponseVisibility.PrivateForSale ?
    schema.required('Enter a price or choose another visibility option').positive('Price must be bigger than 0').max(10000, 'Price cannot be bigger than ${max} Rads') :
    schema.notRequired()),


  winnerSelection: Yup.string().when('surveyType', (surveyType, schema) => surveyType === SurveyType.Paid ?
    schema.required() :
    schema.notRequired()),
  
  firstNCount: Yup.number().when(['surveyType', 'winnerSelection'], (surveyType, winnerSelection, schema) => {
    if (surveyType === SurveyType.Free || winnerSelection !== WinnerSelection.FirstN) 
      return schema.notRequired();
    return schema.typeError(winnerCountRequiredErrorMsg).min(1, winnerCountMinErrorMsg).max(9999, winnerCountMaxErrorMsg)
            .required(winnerCountRequiredErrorMsg).integer(winnerCountNotIntErrorMsg);
  }),


  randomNAfterMNCount: Yup.number().when(['surveyType', 'winnerSelection'], (surveyType, winnerSelection, schema) => {
    if (surveyType === SurveyType.Free || winnerSelection !== WinnerSelection.RandomNAfterMParticipants) 
      return schema.notRequired();
    return schema.typeError(winnerCountRequiredErrorMsg).min(1, winnerCountMinErrorMsg).max(9999, winnerCountMaxErrorMsg)
            .required(winnerCountRequiredErrorMsg).integer(winnerCountNotIntErrorMsg);
  }),
  randomNAfterMMCount: Yup.number().when(['surveyType', 'winnerSelection'], (surveyType, winnerSelection, schema) => {
    if (surveyType === SurveyType.Free || winnerSelection !== WinnerSelection.RandomNAfterMParticipants) 
      return schema.notRequired();
    return schema.typeError(requiredParticipantCountRequiredErrorMsg).min(1, requiredParticipantCountMinErrorMsg).max(9999, requiredParticipantCountMaxErrorMsg)
            .required(requiredParticipantCountRequiredErrorMsg).integer(requiredParticipantCountNotIntErrorMsg);
  }),



  randomNAfterTimeCount: Yup.number().when(['surveyType', 'winnerSelection'], (surveyType, winnerSelection, schema) => {
    if (surveyType === SurveyType.Free || winnerSelection !== WinnerSelection.RandomNAfterTime) 
      return schema.notRequired();
    return schema.typeError(winnerCountRequiredErrorMsg).min(1, winnerCountMinErrorMsg).max(9999, winnerCountMaxErrorMsg)
            .required(winnerCountRequiredErrorMsg).integer(winnerCountNotIntErrorMsg);
  }),
  randomNAfterTimeLength: Yup.number().when(['surveyType', 'winnerSelection' ,'randomNAfterTimeUnits'], (surveyType, winnerSelection, randomNAfterTimeUnits, schema) => {
    if (surveyType === SurveyType.Free || winnerSelection !== WinnerSelection.RandomNAfterTime) 
      return schema.notRequired();
    
    let max = 0;
    if (randomNAfterTimeUnits === 'hours') max = 24 * 7 * 4;
    if (randomNAfterTimeUnits === 'days') max = 4 * 7;
    if (randomNAfterTimeUnits === 'weeks') max = 4;
    const maxErrorMsg = randomNAFterMTimeTimeMaxErrorMsg.replace('${max}', max).replace('${units}', randomNAfterTimeUnits.toLowerCase());
    
    return schema.typeError(randomNAFterMTimeTimeRequiredErrorMsg).min(1, randomNAFterMTimeTimeMinErrorMsg).max(max, maxErrorMsg)
            .required(randomNAFterMTimeTimeRequiredErrorMsg).integer(randomNAFterMTimeTimeNotIntErrorMsg);
  }),
  randomNAfterTimeUnits: Yup.string().when(['surveyType', 'winnerSelection'], (surveyType, winnerSelection, schema) => {
    if (surveyType === SurveyType.Free || winnerSelection !== WinnerSelection.RandomNAfterTime) 
      return schema.notRequired();
    return schema.required();
  }),


  
  totalReward: Yup.number()
    .when('surveyType', {
      is: 'free',
      then: Yup.number().notRequired(),
      otherwise: Yup.number().positive('Reward must be a positive number').typeError('Reward must be a positive number')
        .required('Total reward is required')
    }),

    payFromRadixAddress: Yup.string().when('surveyType', (surveyType, schema) => {
      if (surveyType === SurveyType.Free) 
        return schema.notRequired();
      return schema.length(51, 'Radix account address is 51 characters long').required('RadixDLT account address is required')
    }),


    payToRadixAddress: Yup.string().when('responseVisibility', (responseVisibility, schema) => {
      if (responseVisibility !== ResponseVisibility.PrivateForSale) 
        return schema.notRequired();
      return schema.length(51, 'Radix account address is 51 characters long').required('RadixDLT account address is required')
    }),

  questions: Yup.array(questionValidationSchema).min(1, 'Add at least 1 question before submitting'),
});

export default NewSurveyContainer;
