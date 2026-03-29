/**
 * Shared permission constants used by both the API (admin/me) and the admin UI.
 * Keep this file free of React/Next.js imports so it can be imported in API routes.
 */

export const ALL_PERMISSIONS = [
  "users",        // View and manage users (ban, delete, change plan)
  "revenue",      // View revenue, billing, subscription events
  "growth",       // View growth metrics and funnel
  "audit",        // View admin audit log
  "admins",       // Manage admin access and permissions
  "settings",     // Change site settings
  "analytics",    // View tutorial/practice analytics
  "exams",        // Manage certifications and exam questions
  "banner",       // Manage site-wide announcement banner
  "blog",         // Create and edit blog posts
  "messages",     // View contact messages
  "interviews",   // Moderate interview submissions
  "reports",      // Moderate reported discussion comments
] as const;

export type AdminPermission = (typeof ALL_PERMISSIONS)[number];

/** Permissions available to limited admins when no custom list is set. */
export const DEFAULT_LIMITED_PERMISSIONS: AdminPermission[] = [
  "analytics",
  "exams",
  "banner",
  "blog",
  "messages",
  "interviews",
];

/** Human-readable labels for each permission. */
export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  users:       "Users — view, ban, delete, change plan",
  revenue:     "Revenue & billing",
  growth:      "Growth metrics & funnel",
  audit:       "Audit log",
  admins:      "Admin management",
  settings:    "Site settings",
  analytics:   "Tutorial & practice analytics",
  exams:       "Certifications & exams",
  banner:      "Site-wide banner",
  blog:        "Blog editor",
  messages:    "Contact messages",
  interviews:  "Interview submissions",
  reports:     "Discussion reports",
};

/** Tab → permission mapping (what permission a tab requires). */
export const TAB_PERMISSION: Record<string, AdminPermission> = {
  users:           "users",
  analytics:       "analytics",
  revenue:         "revenue",
  growth:          "growth",
  audit:           "audit",
  exams:           "exams",
  banner:          "banner",
  blog:            "blog",
  messages:        "messages",
  interviews:      "interviews",
  reports:         "reports",
  admins:          "admins",
  "site-settings": "settings",
};

/** Pre-built permission presets for common sub-admin roles. */
export const PERMISSION_PRESETS: { id: string; label: string; permissions: AdminPermission[] }[] = [
  {
    id: "content",
    label: "Content editor",
    permissions: ["analytics", "exams", "banner", "blog", "messages", "interviews"],
  },
  {
    id: "moderator",
    label: "Moderator",
    permissions: ["reports", "interviews", "messages"],
  },
  {
    id: "analyst",
    label: "Analyst",
    permissions: ["analytics", "revenue", "growth", "users"],
  },
  {
    id: "all",
    label: "Full access (super admin)",
    permissions: [...ALL_PERMISSIONS],
  },
];
