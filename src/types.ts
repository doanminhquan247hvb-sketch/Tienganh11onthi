export type QuestionType =
  | 'multiple_choice'
  | 'word_form'
  | 'tenses'
  | 'pronunciation'
  | 'stress'
  | 'grammar'
  | 'vocabulary'
  | 'error_identification'
  | 'sentence_transformation'
  | 'sentence_ordering'
  | 'reading'
  | 'consultation'
  | 'tense_form'
  | 'modal_verb_order'
  | 'cloze';

export type EducationalLevel = 'THCS' | 'THPT';

export type GradeLevel = 6 | 7 | 8 | 9 | 10 | 11 | 12;

export type BookSeries = 'Global Success' | 'Friends Plus' | 'i-Learn Smart World' | 'Chung';

export type ExamCategoryMode = 'multiple_choice' | 'word_form' | 'tenses' | 'combined';

export interface Question {
  id: string;
  grade?: GradeLevel;
  level?: EducationalLevel;
  bookSeries?: BookSeries;
  unit: number;
  topic: string;
  questionType: QuestionType;
  question: string; // The prompt text with blank '_______'
  options: string[]; // ['A. ...', 'B. ...', 'C. ...', 'D. ...'] for multiple choice
  correctAnswer: string; // For MCQ: 'A' | 'B' | 'C' | 'D'. For fill-in/WF/Tenses: text
  acceptableAnswers?: string[]; // Alternative correct variants e.g. ["organize", "organise"]
  targetWord?: string; // Root word in brackets e.g. "CARE", "DEVELOP", "PLEASE", "SAFE"
  tenseName?: string; // e.g. "Present Perfect", "Past Continuous"
  signalWords?: string; // e.g. "since 2020", "at 8 PM yesterday", "every morning"
  difficulty?: 'basic' | 'medium' | 'advanced';
  points?: number;
  expectedTextAnswer?: string;
  explanationEn?: string;
  explanationVi: string;
  passage?: string; // For reading comprehension questions
  sectionTitle?: string;
  createdAt?: number;
}

export interface WordFormEntry {
  id: string;
  baseWord: string;
  vietnameseMeaning: string;
  noun: { words: string[]; meaningVi: string };
  verb: { words: string[]; meaningVi: string };
  adjective: { words: string[]; meaningVi: string };
  adverb: { words: string[]; meaningVi: string };
  collocations: string[];
  sampleSentence: string;
  boardOrder?: number;
}

export type EloTier = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'B2+';

export interface EloChangeResult {
  oldElo: number;
  newElo: number;
  delta: number;
  oldTier: EloTier;
  newTier: EloTier;
  tierNameVi: string;
  score: number;
}

export interface ExamConfig {
  id: string;
  examCode?: string;
  title: string;
  semester: '1' | '2';
  grade?: GradeLevel;
  bookSeries?: BookSeries;
  mode?: ExamCategoryMode;
  examType: 'midterm' | 'final' | 'unit_test' | 'topic' | 'custom_ai' | 'word_form_test' | 'standard_test';
  units: number[];
  difficulty: 'basic' | 'medium' | 'advanced';
  durationMinutes: number | null; // null for untimed
  questionCount: number;
  description: string;
  allowRepeatedQuestions?: boolean;
}

export interface QuestionGradingDetail {
  questionId: string;
  question: Question;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  scoreAwarded: number;
  maxScore: number;
  charErrors?: number;
  penalty?: number;
  feedbackVi: string;
}

export interface UserExamSubmission {
  id: string;
  examId: string;
  examCode?: string;
  examTitle: string;
  mode?: ExamCategoryMode;
  grade?: GradeLevel;
  timestamp: number;
  durationSecondsSpent: number;
  totalQuestions: number;
  correctCount: number;
  scoreOutOf10: number;
  answers: { [questionId: string]: string };
  questions: Question[];
  gradingDetails?: QuestionGradingDetail[];
  categoryBreakdown: {
    [key in QuestionType]?: { correct: number; total: number; pointsEarned?: number; maxPoints?: number };
  };
  unitBreakdown: {
    [unit: number]: { correct: number; total: number };
  };
  eloChange?: EloChangeResult;
}

export interface Flashcard {
  id: string;
  unit: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  vietnameseMeaning: string;
  exampleEn: string;
  exampleVi: string;
  collocations?: string[];
}

export interface UnitInfo {
  number: number;
  title: string;
  vietnameseTitle: string;
  semester: 1 | 2;
  grammarFocus: string;
  grammarDescription: string;
  vocabularyTopics: string[];
}

export interface EloHistoryEntry {
  timestamp: number;
  oldElo: number;
  newElo: number;
  delta: number;
  score: number;
  examTitle: string;
  examCode?: string;
  tier: EloTier;
}

export interface StudentProfile {
  id: string;
  name: string;
  grade: string;
  selectedGradeLevel?: GradeLevel;
  selectedBookSeries?: BookSeries;
  targetScore: number;
  pairingCode: string;
  createdAt: number;
  completedTestsCount: number;
  totalStudyMinutes: number;
  averageScore: number;
  weakTopics: string[];
  strongTopics: string[];
  elo: number; // Initial: 1300, min 0, max 2000
  eloHistory: EloHistoryEntry[];
}

export interface RemediationPlan {
  summary: string;
  weakTopics: string[];
  studyTips: string[];
  schedule: Array<{ day: string; focus: string; action: string }>;
  practiceQuestions: Question[];
}
