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
  "analytics",    // View tutorial analytics
  "banner",       // Manage site-wide announcement banner
  "blog",         // Create and edit blog posts
  "messages",     // View contact messages
  "reports",      // Moderate reported discussion comments
] as const;

export type AdminPermission = (typeof ALL_PERMISSIONS)[number];

/**
 * Effective permission list for an admin row (matches GET /api/admin/me).
 * Super admins (role super or legacy null) get every permission.
 */
export function getEffectiveAdminPermissions(admin: {
  admin_role: string | null;
  admin_permissions: string | null;
}): AdminPermission[] {
  const isSuperAdmin = admin.admin_role === "super" || admin.admin_role === null;
  if (isSuperAdmin) return [...ALL_PERMISSIONS];
  if (admin.admin_permissions) {
    try {
      const parsed = JSON.parse(admin.admin_permissions) as unknown;
      return Array.isArray(parsed)
        ? (parsed as string[]).filter((p): p is AdminPermission =>
            ALL_PERMISSIONS.includes(p as AdminPermission),
          )
        : [...DEFAULT_LIMITED_PERMISSIONS];
    } catch {
      return [...DEFAULT_LIMITED_PERMISSIONS];
    }
  }
  return [...DEFAULT_LIMITED_PERMISSIONS];
}

/** Permissions available to limited admins when no custom list is set. */
export const DEFAULT_LIMITED_PERMISSIONS: AdminPermission[] = [
  "analytics",
  "banner",
  "blog",
  "messages",
  "reports",
];

/** Human-readable labels for each permission. */
export const PERMISSION_LABELS: Record<AdminPermission, string> = {
  users:       "Users — view, ban, delete, change plan",
  revenue:     "Revenue & billing",
  growth:      "Growth metrics & funnel",
  audit:       "Audit log",
  admins:      "Admin management",
  settings:    "Site settings",
  analytics:   "Tutorial analytics",
  banner:      "Site-wide banner",
  blog:        "Blog editor",
  messages:    "Contact messages",
  reports:     "Discussion reports",
};

/** Tab → permission mapping (what permission a tab requires). */
export const TAB_PERMISSION: Record<string, AdminPermission> = {
  users:           "users",
  analytics:       "analytics",
  revenue:         "revenue",
  growth:          "growth",
  audit:           "audit",
  banner:          "banner",
  blog:            "blog",
  messages:        "messages",
  reports:         "reports",
  admins:          "admins",
  "site-settings": "settings",
};

/** Pre-built permission presets for common sub-admin roles. */
export const PERMISSION_PRESETS: { id: string; label: string; permissions: AdminPermission[] }[] = [
  {
    id: "content",
    label: "Content editor",
    permissions: ["analytics", "banner", "blog", "messages", "reports"],
  },
  {
    id: "moderator",
    label: "Moderator",
    permissions: ["reports", "messages"],
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
