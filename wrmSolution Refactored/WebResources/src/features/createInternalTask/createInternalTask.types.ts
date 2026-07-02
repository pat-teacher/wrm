import type { SecurityRoleName } from "../../core/SecurityRoles";

export type CreateInternalTaskSourceEntity = "contact" | "account" | "wrmb_portfolio";

export interface CreateInternalTaskSource {
    id: string;
    entityName: CreateInternalTaskSourceEntity;
    name?: string | null;
}

export interface InternalTaskTypeOption {
    key: string;
    label: string;
    taskTypeName: string;
    allowedRoles: readonly SecurityRoleName[];
}

export interface CreateInternalTaskDialogData extends CreateInternalTaskSource {
    menuKey?: string;
}

