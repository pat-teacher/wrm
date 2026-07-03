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

export interface CreateInternalTaskAvailability {
    canCreate: boolean;
    reason?: "missing_config" | "no_enabled_task_types" | "no_source_match" | "no_role_match";
}
