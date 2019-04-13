import React from "react";
import { DatePicker, Form, Input, TimePicker, Select, Radio, InputNumber } from "antd";
import '../../styles/RequiredAsteriskAfter.css';

const FormItem = Form.Item;
const { Option } = Select;

const CreateAntField = AntComponent => ({
  field,
  form,
  hasFeedback,
  label,
  selectOptions,
  radioOptions,
  type,
  required,
  ...props
}) => {
  const touched = form.touched[field.name];
  const error = form.errors[field.name];
  const showError = error && touched;

  const onInputChange = ({ target: { value } }) => form.setFieldValue(field.name, value);
  const onChange = value => form.setFieldValue(field.name, value);
  const onBlur = () => form.setFieldTouched(field.name, true);

  return (
    <FormItem className={required ? 'form-item-required' : ''}
              label={label}
              hasFeedback={hasFeedback && touched}
              help={showError ? error : false}
              validateStatus={showError ? "error" : "success"} >
      <AntComponent
        {...field}
        {...props}
        onBlur={onBlur}
        onChange={(type || radioOptions) ? onInputChange : onChange}
      >
        {(selectOptions &&
          selectOptions.map(({value, label}) => <Option key={value} value={value}>{label}</Option>))
        || (radioOptions &&
          radioOptions.map(({value, label}) => <Radio key={value} value={value}>{label}</Radio>))}
      </AntComponent>
    </FormItem>
  );
};



export const FormikSelect = CreateAntField(Select);
export const FormikDatePicker = CreateAntField(DatePicker);
export const FormikInput = CreateAntField(Input);
export const FormikInputNumber = CreateAntField(InputNumber);
export const FormikTextArea = CreateAntField(Input.TextArea);
export const FormikTimePicker = CreateAntField(TimePicker);
export const FormikRadioGroup = CreateAntField(Radio.Group);
