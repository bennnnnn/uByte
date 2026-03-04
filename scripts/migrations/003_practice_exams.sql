-- Practice exams (MCQ): questions, attempts, answers, certificates
-- Run after 002. Safe to run multiple times (IF NOT EXISTS).

-- Question bank per language (prompt, choices as JSON array, correct index, explanation after submit)
CREATE TABLE IF NOT EXISTS exam_questions (
  id BIGSERIAL PRIMARY KEY,
  lang TEXT NOT NULL,
  prompt TEXT NOT NULL,
  choices_json JSONB NOT NULL,
  correct_index INT NOT NULL,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exam_questions_lang ON exam_questions(lang);

-- Each exam attempt: user, language, 40 question ids (order), choices order per question, timestamps, score, passed
CREATE TABLE IF NOT EXISTS exam_attempts (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  question_ids_json JSONB NOT NULL,
  choices_order_json JSONB NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  score INT,
  passed BOOLEAN
);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_lang ON exam_attempts(user_id, lang);

-- Answers given in an attempt (attempt_id, question_id, chosen_index)
CREATE TABLE IF NOT EXISTS exam_answers (
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  question_id BIGINT NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
  chosen_index INT NOT NULL,
  PRIMARY KEY (attempt_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_answers(attempt_id);

-- Certificate record (no PDF stored; generate on demand from this)
CREATE TABLE IF NOT EXISTS exam_certificates (
  id UUID PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lang TEXT NOT NULL,
  attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
  passed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_exam_certificates_user ON exam_certificates(user_id);
