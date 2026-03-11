export interface Profile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  theme: string;
  xp: number;
  streak_days: number;
  longest_streak: number;
  created_at: string;
  last_active_at: string | null;
  is_google: boolean;
  email_verified: number;
  is_admin: number;
  plan: string;
  subscription_expires_at?: string | null;
  email_marketing?: boolean;
}

export interface LangProgress {
  lang: string;
  name: string;
  icon: string;
  /** Completed lessons (steps) */
  completed: number;
  /** Total lessons (steps) */
  total: number;
  /** Number of tutorials (MDX files) completed */
  completedTutorials?: number;
}

export interface Stats {
  xp: number;
  streak_days: number;
  longest_streak: number;
  completed_count: number;
  total_tutorials: number;
  activity_count: number;
  created_at: string;
  last_active_at: string | null;
  byLanguage?: LangProgress[];
}

export interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
}

export interface Achievement {
  badge_key: string;
  unlocked_at: string;
}

export interface Bookmark {
  id: number;
  tutorial_slug: string;
  snippet: string;
  note: string;
  language: string;
  created_at: string;
}

export interface ActivityItem {
  id: number;
  action: string;
  detail: string;
  created_at: string;
}

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}
