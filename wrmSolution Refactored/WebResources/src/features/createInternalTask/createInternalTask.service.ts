import { INTERNALTASK } from "../../entities/InternalTask.entity";
import { INTERNALTASKTYPE } from "../../entities/InternalTaskType.entity";
import { Util } from "../../core/crm.core";
import { SECURITY_ROLES, type SecurityRoleName } from "../../core/SecurityRoles";
import type {
    CreateInternalTaskDialogData,
    CreateInternalTaskSource,
    CreateInternalTaskSourceEntity,
    InternalTaskTypeOption,
} from "./createInternalTask.types";

const DIALOG_WEBRESOURCE_NAME = "wrm_/dialogs/createInternalTaskDialog.html";

export const INTERNAL_TASK_TYPE_OPTIONS: readonly InternalTaskTypeOption[] = [
    {
        key: "review",
        label: "Review",
        taskTypeName: "Review",
        allowedRoles: [SECURITY_ROLES.WRM_INTERNAL_TASK_CREATE],
    },
    {
        key: "follow_up",
        label: "Follow up",
        taskTypeName: "Follow up",
        allowedRoles: [SECURITY_ROLES.WRM_INTERNAL_TASK_CREATE],
    },
    {
        key: "approval",
        label: "Approval",
        taskTypeName: "Approval",
        allowedRoles: [SECURITY_ROLES.WRM_INTERNAL_TASK_APPROVAL],
    },
] as const;

export function getXrm(): any {
    return (window as any).Xrm ?? (window.parent as any)?.Xrm;
}

export function isSupportedSourceEntity(entityName: string): entityName is CreateInternalTaskSourceEntity {
    return entityName === "contact" || entityName === "account" || entityName === "wrmb_portfolio";
}

export function getSourceFromForm(formContext: Xrm.FormContext): CreateInternalTaskSource | null {
    const entityName = formContext?.data?.entity?.getEntityName?.();
    const id = Util.sanitizeGuid(formContext?.data?.entity?.getId?.());
    if (!entityName || !id || !isSupportedSourceEntity(entityName)) return null;

    return {
        id,
        entityName,
        name: formContext?.data?.entity?.getPrimaryAttributeValue?.() ?? null,
    };
}

export function encodeDialogData(source: CreateInternalTaskSource): string {
    return encodeURIComponent(JSON.stringify(source));
}

export function parseDialogData(search: string = window.location.search): CreateInternalTaskDialogData | null {
    const params = new URLSearchParams(search);
    const raw = params.get("data");
    if (!raw) return null;

    try {
        const parsed = JSON.parse(decodeURIComponent(raw)) as CreateInternalTaskDialogData;
        if (!parsed?.id || !isSupportedSourceEntity(parsed.entityName)) return null;
        return {
            ...parsed,
            id: Util.sanitizeGuid(parsed.id),
            name: parsed.name ?? null,
        };
    } catch {
        return null;
    }
}

export async function openCreateInternalTaskDialog(source: CreateInternalTaskSource): Promise<void> {
    await getXrm().Navigation.navigateTo(
        {
            pageType: "webresource",
            webresourceName: DIALOG_WEBRESOURCE_NAME,
            data: encodeDialogData(source),
        },
        {
            target: 2,
            position: 1,
            width: { value: 500, unit: "px" },
            height: { value: 320, unit: "px" },
            title: "Create Internal Task",
        }
    );
}

export function getCurrentUserRoleNames(): string[] {
    const roles = getXrm()?.Utility?.getGlobalContext?.()?.userSettings?.roles;
    const names: string[] = [];
    try {
        roles?.forEach?.((role: { name?: string }) => {
            if (role?.name) names.push(role.name);
        });
    } catch {
        return names;
    }
    return names;
}

export function hasAnyRole(roleNames: readonly SecurityRoleName[], userRoleNames = getCurrentUserRoleNames()): boolean {
    if (!roleNames.length) return true;
    const available = new Set(userRoleNames.map((name) => name.trim().toLowerCase()));
    return roleNames.some((name) => available.has(name.trim().toLowerCase()));
}

export function getAllowedInternalTaskTypeOptions(): InternalTaskTypeOption[] {
    const userRoleNames = getCurrentUserRoleNames();
    return INTERNAL_TASK_TYPE_OPTIONS.filter((option) => hasAnyRole(option.allowedRoles, userRoleNames));
}

export function canCreateAnyInternalTask(): boolean {
    return getAllowedInternalTaskTypeOptions().length > 0;
}

export async function resolveInternalTaskTypeByName(typeName: string): Promise<{ id: string; name: string } | null> {
    const escaped = typeName.replace(/'/g, "''");
    const options = `?$select=${INTERNALTASKTYPE.fields.pk},${INTERNALTASKTYPE.fields.name}&$filter=${INTERNALTASKTYPE.fields.name} eq '${escaped}'`;
    const result = await getXrm().WebApi.retrieveMultipleRecords(INTERNALTASKTYPE.entity, options);
    const row = result?.entities?.[0];
    const id = Util.sanitizeGuid(row?.[INTERNALTASKTYPE.fields.pk]);
    if (!id) return null;
    return { id, name: row?.[INTERNALTASKTYPE.fields.name] ?? typeName };
}

export async function openInternalTaskCreateForm(
    source: CreateInternalTaskSource,
    option: InternalTaskTypeOption
): Promise<void> {
    if (!hasAnyRole(option.allowedRoles)) {
        await getXrm().Navigation.openAlertDialog({ text: "You do not have permission to create this Internal Task type." });
        return;
    }

    const taskType = await resolveInternalTaskTypeByName(option.taskTypeName);
    if (!taskType) {
        await getXrm().Navigation.openAlertDialog({ text: `Internal Task Type '${option.taskTypeName}' was not found.` });
        return;
    }

    await getXrm().Navigation.openForm(
        {
            entityName: INTERNALTASK.entity,
            openInNewWindow: true,
        },
        {
            [INTERNALTASK.fields.source]: source.id,
            [`${INTERNALTASK.fields.source}name`]: source.name ?? "",
            [`${INTERNALTASK.fields.source}type`]: source.entityName,
            [INTERNALTASK.fields.internalTaskType]: taskType.id,
            [`${INTERNALTASK.fields.internalTaskType}name`]: taskType.name,
            [`${INTERNALTASK.fields.internalTaskType}type`]: INTERNALTASKTYPE.entity,
        }
    );
}

