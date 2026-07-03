export type CreateInternalTaskSourceEntity = "contact" | "account" | "wrmb_portfolio";

export interface CreateInternalTaskSource {
    id: string;
    entityName: CreateInternalTaskSourceEntity;
    name?: string | null;
}

export interface InternalTaskTypeOption {
    key: string;
    label: string;
    taskTypeCodeName: string;
    allowedRoles?: readonly string[];
    sourceEntities?: readonly CreateInternalTaskSourceEntity[];
    enabled?: boolean;
}

export interface CreateInternalTaskDialogData extends CreateInternalTaskSource {
    menuKey?: string;
}

export interface CreateInternalTaskConfig {
    version: number;
    taskTypes: InternalTaskTypeOption[];
}
