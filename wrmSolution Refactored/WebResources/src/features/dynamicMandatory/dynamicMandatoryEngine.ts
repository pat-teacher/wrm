import type { BusinessUnitConfig, Condition, EntityConfig } from "../../core/crm.core";
import { ApiClient, Util, VisibilityHelper } from "../../core/crm.core";
import { evaluateCondition, readAttributeValue, isLookupArray } from "../../core/condition.evaluator";
import { BUSINESSUNITLOCATION, parseBusinessUnitConfig, listConditionFields } from "../../entities/MandatoryConfig.entity";
import { CONTACT } from "../../entities/Contact.entity";


const businessUnitConfigCache = new Map<string, BusinessUnitConfig | null>();

export async function initializeDynamicMandatoryFields(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config);
}

export async function applyDynamicMandatoryRules(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
}

async function loadBusinessUnitConfig(formContext: Xrm.FormContext): Promise<BusinessUnitConfig | null> {
    const attr = formContext.getAttribute(CONTACT.fields.nev_businessunitid);
    const val = attr?.getValue?.();
    const locationId = isLookupArray(val) ? Util.sanitizeGuid(val[0].id) : null;

    const cacheKey = locationId ? `location:${locationId}` : "location:null";
    if (businessUnitConfigCache.has(cacheKey)) return businessUnitConfigCache.get(cacheKey) ?? null;

    if (!locationId) {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }

    try {
        const fieldLogical = BUSINESSUNITLOCATION.fields.mandatoryConfigJson;
        const rec = await ApiClient.retrieveRecord(BUSINESSUNITLOCATION.entity, locationId, `?$select=${fieldLogical}`);
        const jsonText = (rec as Record<string, unknown>)[fieldLogical] as string | null;
        const parsed = parseBusinessUnitConfig(jsonText);
        businessUnitConfigCache.set(cacheKey, parsed);
        return parsed;
    } catch {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }
}

function applyConfigMerged(formContext: Xrm.FormContext, config: BusinessUnitConfig | null): void {
    if (!config?.entities) return;
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig: EntityConfig | undefined = config.entities[entityLogicalName];
    if (!entityConfig) return;

    // 1) Reset: clear required flag for all fields that could be marked mandatory by defaults or any rule
    resetPotentialMandatory(formContext, entityConfig);

    // 2) Evaluate rules and merge resulting mandatory fields
    const merged: string[] = [];
    for (const rule of entityConfig.rules ?? []) {
        if (ruleMatches(formContext, rule.condition)) {
            for (const field of rule.mandatory ?? []) {
                if (!merged.includes(field)) merged.push(field);
            }
        }
    }

    const requiredFields = merged.length ? merged : entityConfig.default ?? [];
    requiredFields.forEach(fieldLogical => VisibilityHelper.setRequired(formContext, fieldLogical, true));
}

// Clears required flag on all fields that could be marked mandatory by defaults or any rule for a given entity config
function resetPotentialMandatory(formContext: Xrm.FormContext, entityConfig: EntityConfig): void {
    const potentialMandatory = new Set<string>();
    for (const f of entityConfig.default ?? []) potentialMandatory.add(f);
    for (const rule of entityConfig.rules ?? []) {
        for (const f of rule.mandatory ?? []) potentialMandatory.add(f);
    }
    potentialMandatory.forEach(fieldLogical => VisibilityHelper.setRequired(formContext, fieldLogical, false));
}

function ruleMatches(formContext: Xrm.FormContext, conditions?: Condition[]): boolean {
    if (!conditions || conditions.length === 0) return true;
    for (const condition of conditions) {
        const actual = readAttributeValue(formContext, condition.field);
        if (!evaluateCondition(actual, condition)) return false;
    }
    return true;
}

function autoWireOnChange(formContext: Xrm.FormContext, config: BusinessUnitConfig | null): void {
    if (!config?.entities) return;
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName] as EntityConfig | undefined;
    const fields = listConditionFields(entityConfig);
    for (const attributeName of fields) {
        const attribute = formContext.getAttribute(attributeName);
        if (!attribute) continue;
        const handler = (ctx: Xrm.Events.EventContext) => applyDynamicMandatoryRules(ctx);
        try {
            attribute.addOnChange(handler);
        } catch {
            // ignore
        }
    }
}