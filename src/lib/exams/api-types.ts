/** API response types for practice exam flows. Use these instead of (data as any). */

export interface StartExamResponse {
  attemptId: string;
}

export interface StartExamError {
  error?: string;
  code?: "upgrade_required";
}

export interface AttemptQuestion {
  id: number;
  prompt: string;
  choices: string[];
}

export interface AttemptPayload {
  attemptId: string;
  lang: string;
  startedAt: string;
  questions: AttemptQuestion[];
}

export interface SubmitExamResponse {
  score: number;
  passed: boolean;
  certificateId: string | null;
}

export interface ExamResultResponse {
  score: number;
  passed: boolean;
  certificateId: string | null;
  totalQuestions: number;
}

export interface CertificatePayload {
  id: string;
  userId: number;
  name: string;
  lang: string;
  attemptId: string;
  passedAt: string;
}

export interface ApiErrorPayload {
  error?: string;
  code?: string;
}
