export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[] | null; // For checkbox questions
  correctAnswers?: (string | boolean)[] | null; // For boolean, input, and checkbox
  required: boolean;
}

export interface Quiz {
  id?: string;
  title: string;
  questions?: Question[];
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    questions: number;
  };
}

export interface QuizFormData {
  title: string;
  questions: Question[];
}

export interface QuizListItem {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count: {
    questions: number;
  };
}

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  BOOLEAN: 'True/False',
  INPUT: 'Text Input',
  CHECKBOX: 'Multiple Choice',
};

export const QUESTION_TYPE_DESCRIPTIONS: Record<QuestionType, string> = {
  BOOLEAN: 'A question with True or False answer options',
  INPUT: 'A question requiring a short text answer',
  CHECKBOX:
    'A question with multiple answer options where multiple can be correct',
};
