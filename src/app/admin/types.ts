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
  admin_role: string | null;
  admin_permissions: string | null;
  banned: boolean;
  completed_count: number;
  bookmark_count: number;
  plan: string;
  email_verified: number;
  admin_slug: string | null;
}

export interface AdminMe {
  id: number;
  name: string;
  email: string;
  isSuperAdmin: boolean;
  permissions: string[];
  adminSlug: string | null;
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

export type Tab = "users" | "analytics" | "growth" | "audit" | "banner" | "blog" | "messages" | "reports" | "admins" | "site-settings";
export type RevenuePeriod = "7days" | "month" | "year";

export const TAB_LABELS: Record<Tab, string> = {
  users:           "Users",
  analytics:       "Analytics",
  growth:          "Growth",
  audit:           "Audit log",
  banner:          "Site banner",
  blog:            "Blog editor",
  messages:        "Messages",
  reports:         "Reports",
  admins:          "Admins",
  "site-settings": "Site settings",
};

/** @deprecated Use permission-constants.ts + AdminMe.permissions instead. */
export const LIMITED_ADMIN_TABS: Tab[] = [
  "analytics", "banner", "blog", "messages", "reports",
];

export type { AdminRevenueStats };
