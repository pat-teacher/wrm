import { INTERNALTASK } from "../../entities/InternalTask.entity";
import { INTERNALTASKTYPE } from "../../entities/InternalTaskType.entity";
import { APPCONFIG } from "../../entities/AppConfig.entity";
import { Util } from "../../core/crm.core";
import { CREATE_INTERNAL_TASK } from "./createInternalTask.constants";
import type {
    CreateInternalTaskAvailability,
    CreateInternalTaskConfig,
    CreateInternalTaskDialogData,
    CreateInternalTaskSource,
    CreateInternalTaskSourceEntity,
    InternalTaskTypeOption,
} from "./createInternalTask.types";

const EMPTY_CONFIG: CreateInternalTaskConfig = { version: 1, taskTypes: [] };

let createInternalTaskConfigCache: CreateInternalTaskConfig | null = null;

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
            webresourceName: CREATE_INTERNAL_TASK.dialogWebResourceName,
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

export function hasAnyRole(roleNames?: readonly string[], userRoleNames = getCurrentUserRoleNames()): boolean {
    if (!roleNames?.length) return true;
    const available = new Set(userRoleNames.map((name) => name.trim().toLowerCase()));
    return roleNames.some((name) => available.has(name.trim().toLowerCase()));
}

function isAllowedForSource(option: InternalTaskTypeOption, sourceEntity?: CreateInternalTaskSourceEntity): boolean {
    if (!sourceEntity || !option.sourceEntities?.length) return true;
    return option.sourceEntities.includes(sourceEntity);
}

function normalizeConfigOption(raw: any): InternalTaskTypeOption | null {
    if (!raw || typeof raw !== "object") return null;
    const key = String(raw.key ?? "").trim();
    const label = String(raw.label ?? "").trim();
    const taskTypeCodeName = String(raw.taskTypeCodeName ?? "").trim();
    if (!key || !label || !taskTypeCodeName) return null;

    const allowedRoles = Array.isArray(raw.allowedRoles)
        ? raw.allowedRoles.map((role: unknown) => String(role).trim()).filter(Boolean)
        : undefined;

    const sourceEntities = Array.isArray(raw.sourceEntities)
        ? raw.sourceEntities.filter(isSupportedSourceEntity)
        : undefined;

    return {
        key,
        label,
        taskTypeCodeName,
        allowedRoles,
        sourceEntities,
        enabled: raw.enabled !== false,
    };
}

function parseCreateInternalTaskConfig(jsonText: string | null | undefined): CreateInternalTaskConfig {
    if (!jsonText) return EMPTY_CONFIG;
    try {
        const parsed = JSON.parse(jsonText) as Partial<CreateInternalTaskConfig>;
        const taskTypes = Array.isArray(parsed.taskTypes)
            ? parsed.taskTypes.map(normalizeConfigOption).filter((item): item is InternalTaskTypeOption => Boolean(item))
            : [];
        return {
            version: typeof parsed.version === "number" ? parsed.version : 1,
            taskTypes,
        };
    } catch {
        return EMPTY_CONFIG;
    }
}

export async function loadCreateInternalTaskConfig(forceRefresh = false): Promise<CreateInternalTaskConfig> {
    if (!forceRefresh && createInternalTaskConfigCache) return createInternalTaskConfigCache;

    const key = CREATE_INTERNAL_TASK.configKey.replace(/'/g, "''");
    const options = [
        `?$select=${APPCONFIG.fields.json}`,
        `&$filter=${APPCONFIG.fields.key} eq '${key}'`,
        "&$top=1",
    ].join("");

    try {
        const result = await getXrm().WebApi.retrieveMultipleRecords(APPCONFIG.entity, options);
        const jsonText = result?.entities?.[0]?.[APPCONFIG.fields.json] as string | null | undefined;
        createInternalTaskConfigCache = parseCreateInternalTaskConfig(jsonText);
        return createInternalTaskConfigCache;
    } catch {
        createInternalTaskConfigCache = EMPTY_CONFIG;
        return createInternalTaskConfigCache;
    }
}

export async function getAllowedInternalTaskTypeOptions(sourceEntity?: CreateInternalTaskSourceEntity): Promise<InternalTaskTypeOption[]> {
    const config = await loadCreateInternalTaskConfig();
    const userRoleNames = getCurrentUserRoleNames();
    return config.taskTypes.filter((option) =>
        option.enabled !== false &&
        isAllowedForSource(option, sourceEntity) &&
        hasAnyRole(option.allowedRoles, userRoleNames)
    );
}

export async function canCreateAnyInternalTask(sourceEntity?: CreateInternalTaskSourceEntity): Promise<boolean> {
    return (await getAllowedInternalTaskTypeOptions(sourceEntity)).length > 0;
}

export async function getCreateInternalTaskAvailability(
    sourceEntity?: CreateInternalTaskSourceEntity
): Promise<CreateInternalTaskAvailability> {
    const config = await loadCreateInternalTaskConfig();
    if (!config.taskTypes.length) {
        return { canCreate: false, reason: "missing_config" };
    }

    const enabledOptions = config.taskTypes.filter((option) => option.enabled !== false);
    if (!enabledOptions.length) {
        return { canCreate: false, reason: "no_enabled_task_types" };
    }

    const sourceOptions = enabledOptions.filter((option) => isAllowedForSource(option, sourceEntity));
    if (!sourceOptions.length) {
        return { canCreate: false, reason: "no_source_match" };
    }

    const userRoleNames = getCurrentUserRoleNames();
    const roleOptions = sourceOptions.filter((option) => hasAnyRole(option.allowedRoles, userRoleNames));
    if (!roleOptions.length) {
        return { canCreate: false, reason: "no_role_match" };
    }

    return { canCreate: true };
}

export async function resolveInternalTaskTypeByCodeName(typeCodeName: string): Promise<{ id: string; name: string } | null> {
    const escaped = typeCodeName.replace(/'/g, "''");
    const options = [
        `?$select=${INTERNALTASKTYPE.fields.pk},${INTERNALTASKTYPE.fields.name},${INTERNALTASKTYPE.fields.internaltasktypecodename}`,
        `&$filter=${INTERNALTASKTYPE.fields.internaltasktypecodename} eq '${escaped}'`,
    ].join("");
    const result = await getXrm().WebApi.retrieveMultipleRecords(INTERNALTASKTYPE.entity, options);
    const row = result?.entities?.[0];
    const id = Util.sanitizeGuid(row?.[INTERNALTASKTYPE.fields.pk]);
    if (!id) return null;
    return { id, name: row?.[INTERNALTASKTYPE.fields.name] ?? typeCodeName };
}

function getSourceLookupField(entityName: CreateInternalTaskSourceEntity): string {
    switch (entityName) {
        case "contact":
            return INTERNALTASK.fields.contactid;
        case "account":
            return INTERNALTASK.fields.companyid;
        case "wrmb_portfolio":
            return INTERNALTASK.fields.portfolioid;
        default:
            throw new Error(`Unsupported source entity '${entityName}'.`);
    }
}

function buildInternalTaskFormParameters(
    source: CreateInternalTaskSource,
    taskType: { id: string; name: string }
): Record<string, string> {
    const sourceLookupField = getSourceLookupField(source.entityName);
    return {
        [sourceLookupField]: source.id,
        [`${sourceLookupField}name`]: source.name ?? "",
        [`${sourceLookupField}type`]: source.entityName,
        [INTERNALTASK.fields.internalTaskType]: taskType.id,
        [`${INTERNALTASK.fields.internalTaskType}name`]: taskType.name,
        [`${INTERNALTASK.fields.internalTaskType}type`]: INTERNALTASKTYPE.entity,
    };
}

export async function openInternalTaskCreateForm(
    source: CreateInternalTaskSource,
    option: InternalTaskTypeOption
): Promise<void> {
    if (!hasAnyRole(option.allowedRoles)) {
        await getXrm().Navigation.openAlertDialog({ text: "You do not have permission to create this Internal Task type." });
        return;
    }

    const taskType = await resolveInternalTaskTypeByCodeName(option.taskTypeCodeName);
    if (!taskType) {
        await getXrm().Navigation.openAlertDialog({ text: `Internal Task Type '${option.taskTypeCodeName}' was not found.` });
        return;
    }

    await getXrm().Navigation.openForm(
        {
            entityName: INTERNALTASK.entity,
            openInNewWindow: true,
        },
        buildInternalTaskFormParameters(source, taskType)
    );
}
