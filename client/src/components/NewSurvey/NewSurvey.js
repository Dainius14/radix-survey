import React from 'react';
import { connect } from 'react-redux'
import { Form, Input, InputNumber, Divider, Button, Typography, Radio, Select } from 'antd';
import * as NewSurveyActions from '../../actions/NewSurveyActions';
import NewSurveyQuestionList from './QuestionList';
import '../../styles/MultilineCode.css';
const { TextArea } = Input;
const { Text, Paragraph } = Typography;
const { Option } = Select;


function NewSurvey({ state, editSurveyProperty, postSurvey }) {
  const { title, shortDescription, question, ...surveyOptions } = state.data;

  return (
    <Form layout="vertical">
      
      <Form.Item label="Radix wallet address">
        <Input placeholder="Your Radix wallet address from which tokens will be sent"
               name="radixAddress"
               value={surveyOptions.radixAddress}
               required={true}
               onChange={(e) => editSurveyProperty(e.target.name, e.target.value)} />
      </Form.Item>

      <Form.Item label="Survey type">
        <Radio.Group name="surveyType"
                     onChange={(e) => editSurveyProperty(e.target.name, e.target.value)}
                     value={surveyOptions.surveyType}
                     required={true}>

          <Radio value={"firstN"}>
            <Text>First</Text>
            <InputNumber style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                        name="firstNCount" value={surveyOptions.firstNCount}
                        size="small"
                        min={1}
                        onChange={value => editSurveyProperty('firstNCount', value)}/>
            <Text>people to answer</Text>
          </Radio>

          <Radio value={"randomN"} disabled>
            <Text>Randomly selected</Text>
            <InputNumber style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                        disabled={surveyOptions.surveyType !== 'randomN'}
                        name="randomNCount" value={surveyOptions.randomNCount}
                        size="small"
                        min={1}
                        onChange={value => editSurveyProperty('randomNCount', value)}/>
            <Text>people to answer in</Text>
            <InputNumber style={{ marginLeft: '1ch', marginRight: '1ch', width: '8ch' }}
                        disabled={surveyOptions.surveyType !== 'randomN'}
                        name="randomNTime" value={surveyOptions.randomNTime}
                        size="small"
                        min={1}
                        onChange={value => editSurveyProperty('randomNTime', value)}/>
            <Select defaultValue="minutes" onChange={value => editSurveyProperty('randomNTimeUnits', value)}
                    disabled={surveyOptions.surveyType !== 'randomN'}
                    size="small" style={{ width: '12ch' }}>
              <Option value="minutes">minutes</Option>
              <Option value="hours">hours</Option>
              <Option value="days">days</Option>
            </Select>
          </Radio>

        </Radio.Group>
      </Form.Item>


      <Form.Item label="Reward for one person">
        <InputNumber style={{ marginLeft: '1ch', marginRight: '1ch', width: '16ch' }}
                      name="reward" value={surveyOptions.reward}
                      required={true} min={0} step={0.1}
                      onChange={value => editSurveyProperty('reward', value)} />
      </Form.Item>

      <Paragraph></Paragraph>
      <Paragraph>Transfer <b>{surveyOptions.reward * surveyOptions.randomNCount}</b> tokens to: <Text code>9g7MxcyYrXAFpMMMnPZD74etUAdd7kiRufpkxeuf921haFgAiNs</Text></Paragraph>

      <Divider />

      <Form.Item label="Title">
        <Input placeholder="Title of your survey"
               name="title"
               required={true}
               value={title}
               onChange={(event) => editSurveyProperty(event.target.name, event.target.value)} />
      </Form.Item>

      <Form.Item label="Description">
        <TextArea placeholder="Short description of your survey" rows={3}
                  name="shortDescription"
                  value={shortDescription}
                  onChange={(event) => editSurveyProperty(event.target.name, event.target.value)}
                  />
      </Form.Item>

      <Divider />

      <NewSurveyQuestionList />
      
      <Divider />

      <Button onClick={() => postSurvey(state.data)} loading={state.isPosting}>Post survey</Button>
      {state.error && <Text code className="multiline-code">{JSON.stringify(state.error, null, 4)}</Text>}

    </Form>
  );
}

function mapStateToProps(state) {
  return { state: state.newSurvey }
}

function mapDispatchToProps(dispatch) {
  return {
    editSurveyProperty: (property, value) =>
      dispatch(NewSurveyActions.editSurveyProperty(property, value)),
    postSurvey: (survey) =>
      dispatch(NewSurveyActions.postSurvey(survey))
  }
}; 

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewSurvey);
