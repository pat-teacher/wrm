export const SECURITY_ROLES = {
    WRM_COMPLIANCE_OFFICER: "WRM Compliance Officer",
} as const;

export type SecurityRoleName = typeof SECURITY_ROLES[keyof typeof SECURITY_ROLES];
