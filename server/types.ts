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
  published: number;
  title: string;
  description: string;
  surveyVisibility: SurveyVisibility;
  resultsVisibility: ResultsVisibility;
  resultsPassword: string;
  resultsPasswordHashed: string;
  resultPrice: number;
  winnerSelection: WinnerSelection;
  totalReward: number;
  winnerCount: number;
  requiredParticipantCount: number;
  winnerSelectionTimeLength: number;
  winnerSelectionTimeUnits: string;
  radixAddress: string;
  questions: Question[];
}

export enum ResultsVisibility {
  Public = 'public',
  Private = 'private',
  PrivateForSale = 'privateForSale'
}

export enum SurveyVisibility {
  Public = 'public',
  Private = 'private',
}

export enum WinnerSelection {
  Free = 'free',
  FirstN = 'firstN',
  RandomNAfterTime = 'randomNAfterTime',
  RandomNAfterMParticipants = 'randomNAfterMParticipants',
}

export interface Question {
  questionText: string;
  type: string;
  required: boolean;
  answerChoices: AnswerChoice[];
}

export interface AnswerChoice {
  answerText: string;
}

export interface Response extends AppData {
  surveyId: string;
  radixAddress: string;
  answers: {};
}
