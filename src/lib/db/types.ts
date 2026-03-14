export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  google_id: string | null;
  avatar: string;
  bio: string;
  theme: string;
  xp: number;
  streak_days: number;
  longest_streak: number;
  streak_last_date: string | null;
  last_active_at: string | null;
  created_at: string;
  is_admin: number;
  admin_role: string | null;
  email_verified: number;
  email_verification_token: string | null;
  email_verification_expires_at?: string | null;
  failed_login_attempts: number;
  locked_until: string | null;
  token_version: number;
  streak_freezes: number;
  plan: string;
  paddle_customer_id: string | null;
  subscription_expires_at?: string | null;
  onboarding_goal?: string | null;
  email_marketing: number;
}

export interface LeaderboardEntry {
  id: number;
  name: string;
  avatar: string;
  xp: number;
  streak_days: number;
  completed_count: number;
  problems_solved: number;
}

export interface Rating {
  tutorial_slug: string;
  thumbs_up: number;
  thumbs_down: number;
  user_vote: number | null;
}

export interface PlaygroundSnippet {
  share_id: string;
  code: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  action: string;
  detail: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  message: string;
  link?: string | null;
  read: boolean;
  created_at: string;
}

export interface Bookmark {
  id: number;
  user_id: number;
  tutorial_slug: string;
  snippet: string;
  note: string;
  created_at: string;
}

export interface Achievement {
  badge_key: string;
  unlocked_at: string;
}

export interface PasswordResetToken {
  id: number;
  user_id: number;
  token: string;
  expires_at: string;
  used: number;
  created_at: string;
}

export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak_days: number;
  created_at: string;
  last_active_at: string | null;
  is_admin: number;
  admin_role: string | null;
  banned: boolean;
  completed_count: number;
  bookmark_count: number;
  plan: string;
}

export interface AdminTutorialRow {
  slug: string;
  completed_count: number;
  thumbs_up: number;
  thumbs_down: number;
}

export interface TutorialMessage {
  id: number;
  tutorial_slug: string;
  user_id: number | null;
  user_name: string;
  is_ai: boolean;
  content: string;
  created_at: string;
}

export interface AdminRevenueStats {
  proSubscribers: number;
  monthlySubscribers: number;
  yearlySubscribers: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  revenueThisYear?: number;
  revenueByDay: { date: string; revenue: number }[];
  revenueByPeriod?: { date: string; revenue: number }[];
}
