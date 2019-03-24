export interface AppData {
  id: string;
  created: number;
}

export interface Payload {
  type: AppDataType;
  data: AppData;
}

export enum AppDataType {
  Survey = 'survey',
  Answers = 'answers'
}

export interface Survey extends AppData {
  title: string;
  reward: number;
  surveyType: SurveyType;
  firstNCount: number;
  published: number;
  shortDescription: string;
  radixAddress: string;
  question: Question[];
}

export enum SurveyType {
  FirstN = 'firstN',
  RandomN = 'randomN'
}

export interface Question {
  questionText: string;
  questionType: string;
  required: boolean;
  answerChoices: AnswerChoice[];
}

export interface AnswerChoice {
  answerText: string;
}

export interface Answers extends AppData {
  surveyId: string;
  userRadixAddress: string;
  answers: {};
}
