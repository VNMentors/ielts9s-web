import { IELTSSkill, IELTSSource, QuestionType } from "@/lib/constants";

// ─────────────────────────── USER ───────────────────────────
export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  rank: "novice" | "scout" | "knight" | "master";
  targetBand: number;
  stats: {
    reading: Record<string, number>; // { matching: 0.8 } accuracy per type
    listening: Record<string, number>;
  };
  createdAt: Date;
}

// ─────────────────────────── TEST ───────────────────────────
export interface Question {
  id: number;
  type: QuestionType;
  text: string;
  options?: string[]; // chỉ dùng cho MCQ
}

export interface TestPart {
  partNumber: number;
  passageHtml?: string;  // Reading
  audioUrl?: string;     // Listening
  questions: Question[];
}

export interface Test {
  id: string;
  title: string;
  skill: IELTSSkill;
  source: IELTSSource;
  parts: TestPart[];
  answerKey: Record<string, string>;   // { "1": "TRUE" }
  explanations: Record<string, string>; // { "1": "Dẫn chứng..." }
  createdAt: Date;
}

// ─────────────────────────── SUBMISSION ─────────────────────
export interface Submission {
  id: string;
  userId: string;
  testId: string;
  testTitle: string;
  skill: IELTSSkill;
  answers: Record<string, string>;
  score: number;      // số câu đúng / 40
  bandScore: number;
  createdAt: Date;
}

// ─────────────────────────── LESSON ─────────────────────────
export interface Lesson {
  id: string;
  title: string;
  description: string;
  level: "novice" | "scout" | "knight" | "master";
  videoUrl: string;
  duration: number; // seconds
  order: number;
}
