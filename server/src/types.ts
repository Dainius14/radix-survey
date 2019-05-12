export interface Survey {
  id: string;
  created: number;
  published: number;
  title: string;
  description: string;
  surveyVisibility: SurveyVisibility;
  resultsVisibility: ResultsVisibility;
  surveyType: SurveyType;
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

  firstResponse: number | null;
  lastResponse: number | null;
  totalResponses: number;
  responses: Response[];
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
export enum SurveyType {
  Free = 'free',
  Paid = 'paid',
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

export interface Response {
  id: string;
  created: number;
  surveyId: string;
  radixAddress: string;
  answers: {};
}
