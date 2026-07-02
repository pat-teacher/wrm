export const SECURITY_ROLES = {
    WRM_COMPLIANCE_OFFICER: "WRM Compliance Officer",
    WRM_INTERNAL_TASK_CREATE: "WRM Internal Task Create",
    WRM_INTERNAL_TASK_APPROVAL: "WRM Internal Task Approval",
} as const;

export type SecurityRoleName = typeof SECURITY_ROLES[keyof typeof SECURITY_ROLES];
