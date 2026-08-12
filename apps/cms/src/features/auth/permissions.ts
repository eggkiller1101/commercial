export const ADMIN_ROLES = {
  contentEditor: "内容编辑",
  salesSpecialist: "销售专员",
  superAdmin: "超级管理员"
} as const;

export type AdminRole = (typeof ADMIN_ROLES)[keyof typeof ADMIN_ROLES];

export type Permission =
  | "manage_content"
  | "manage_inquiries"
  | "manage_users";

export const DEFAULT_ADMIN_ROLE: AdminRole = ADMIN_ROLES.superAdmin;

const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  [ADMIN_ROLES.superAdmin]: [
    "manage_content",
    "manage_inquiries",
    "manage_users"
  ],
  [ADMIN_ROLES.contentEditor]: ["manage_content"],
  [ADMIN_ROLES.salesSpecialist]: ["manage_inquiries"]
};

const ROLE_LABELS = Object.values(ADMIN_ROLES) as AdminRole[];

export function normalizeAdminRole(roleName?: string | null): AdminRole {
  if (ROLE_LABELS.includes(roleName as AdminRole)) {
    return roleName as AdminRole;
  }

  return DEFAULT_ADMIN_ROLE;
}

export function hasPermission(
  roleName: string | null | undefined,
  permission: Permission
) {
  const role = normalizeAdminRole(roleName);

  return ROLE_PERMISSIONS[role].includes(permission);
}

export function canAccessDashboardPath(
  roleName: string | null | undefined,
  pathname: string
) {
  if (pathname.startsWith("/dashboard/account")) {
    return true;
  }

  if (pathname.startsWith("/dashboard/inquiries")) {
    return hasPermission(roleName, "manage_inquiries");
  }

  if (
    pathname.startsWith("/dashboard/products") ||
    pathname.startsWith("/dashboard/categories") ||
    pathname.startsWith("/dashboard/documents") ||
    pathname.startsWith("/dashboard/news") ||
    pathname.startsWith("/dashboard/cases")
  ) {
    return hasPermission(roleName, "manage_content");
  }

  return true;
}

export function getDefaultDashboardPath(roleName?: string | null) {
  if (hasPermission(roleName, "manage_content")) {
    return "/dashboard/products";
  }

  if (hasPermission(roleName, "manage_inquiries")) {
    return "/dashboard/inquiries";
  }

  return "/dashboard/account/password";
}
