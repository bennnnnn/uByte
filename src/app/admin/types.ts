import type { AdminRevenueStats } from "@/lib/db";

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak_days: number;
  created_at: string;
  last_active_at: string | null;
  is_admin: number;
  banned: boolean;
  completed_count: number;
  bookmark_count: number;
  plan: string;
}

export interface TutorialAnalytics {
  slug: string;
  completed_count: number;
  thumbs_up: number;
  thumbs_down: number;
}

export interface AuditEntry {
  id: number;
  action: string;
  admin_name: string | null;
  target_name: string | null;
  created_at: string;
}

export interface StepStat {
  step_index: number;
  pass_count: number;
  fail_count: number;
}

export interface SubscriptionEventRow {
  id: number;
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  plan: string;
  amount_cents: number;
  event_type: string;
  created_at: string;
}

export interface PracticeStat {
  problem_slug: string;
  solved_count: number;
  attempt_count: number;
}

export interface ExamStatRow {
  lang: string;
  question_count: number;
  attempt_count: number;
  passed_count: number;
  certificates_count: number;
}

export interface ExamStats {
  questionsByLang: ExamStatRow[];
  totalQuestions: number;
  totalAttempts: number;
  passedAttempts: number;
  certificatesIssued: number;
  passRatePercent: number;
}

export type Tab = "users" | "analytics" | "revenue" | "audit" | "exams" | "banner";
export type RevenuePeriod = "7days" | "month" | "year";

export const TAB_LABELS: Record<Tab, string> = {
  users: "Users",
  analytics: "Analytics",
  revenue: "Revenue",
  audit: "Audit log",
  exams: "Practice exams",
  banner: "Site banner",
};

export type { AdminRevenueStats };
