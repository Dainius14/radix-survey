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
  description: string;
  resultsVisibility: ResultsVisibility;
  resultsPassword: string;
  resultsPrice: number;
  surveyType: SurveyType;
  winnerSelection: WinnerSelection;
  totalReward: number;
  firstNCount: number;
  published: number;
  radixAddress: string;
  questions: Question[];
}

export enum ResultsVisibility {
  Public = 'public',
  Private = 'private',
  PrivateForSale = 'privateForSale'
}

export enum SurveyType {
  Free = 'free',
  Paid = 'paid'
}

export enum WinnerSelection {
  FirstN = 'firstN',
  RandomNAfterTime = 'randomNAfterTime',
  RandomNAfterMParticipants = 'randomNAfterMParticipants',
}

export interface Question {
  questionText: string;
  type: string;
  // required: boolean;
  answerChoices: AnswerChoice[];
}

export interface AnswerChoice {
  answerText: string;
}

export interface Response extends AppData {
  surveyId: string;
  userRadixAddress: string;
  answers: {};
}
