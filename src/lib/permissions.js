export const ROLES = {
  CITIZEN: "CITIZEN",
  OFFICER: "GOVERNMENT OFFICER",
  ADMIN: "ADMINISTRATOR",
};

export const ROLE_PERMISSIONS = {
  [ROLES.CITIZEN]: [
    "submit-rti",
    "track-applications",
    "view-profile",
    "file-appeal",
  ],
  [ROLES.OFFICER]: [
    "view-assigned-applications",
    "review-rti",
    "update-status",
    "generate-response-drafts",
    "approve-response",
    "semantic-search",
  ],
  [ROLES.ADMIN]: [
    "manage-users",
    "manage-officers",
    "manage-departments",
    "analytics",
    "audit-logs",
    "system-settings",
  ],
};

export function hasAccess(userRole, permission) {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) ?? false;
}
