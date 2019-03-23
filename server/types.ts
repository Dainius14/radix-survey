export interface Survey {
  id: string;
  title: string;
  shortDescription: string;
  radixAddress: string;
  question: Question[];
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
