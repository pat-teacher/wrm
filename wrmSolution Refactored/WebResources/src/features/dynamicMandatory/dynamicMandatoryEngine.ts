import type { BusinessUnitConfig, Condition, EntityConfig } from "../../core/crm.core";
import { ApiClient, FORM_TYPE, Util, VisibilityHelper } from "../../core/crm.core";
import { evaluateCondition, readAttributeValue, isLookupArray } from "../../core/condition.evaluator";
import { BUSINESSUNITLOCATION, parseBusinessUnitConfig, listConditionFields } from "../../entities/MandatoryConfig.entity";
import { CONTACT } from "../../entities/Contact.entity";
import { COMPANY } from "../../entities/Company.entity";
import { ACCOUNT } from "../../entities/Account.entity";


const wiredOnChangeAttributes = new WeakMap<Xrm.FormContext, Set<string>>();
const lastAppliedEntityConfig = new WeakMap<Xrm.FormContext, EntityConfig>();

export async function initializeDynamicMandatoryFields(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    if (isQuickCreateForm(formContext)) return;

    wireBusinessUnitLookupOnChange(formContext);
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config);
}

export async function applyDynamicMandatoryRules(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    if (isQuickCreateForm(formContext)) return;

    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
}

function isQuickCreateForm(formContext: Xrm.FormContext): boolean {
    const formType = formContext.ui?.getFormType?.();
    if (formType === FORM_TYPE.QuickCreate) return true;

    const formSelector = formContext.ui?.formSelector;
    return formType === FORM_TYPE.Create && (!formSelector || typeof formSelector.getCurrentItem !== "function");
}

async function loadBusinessUnitConfig(formContext: Xrm.FormContext): Promise<BusinessUnitConfig | null> {
    const businessUnitAttribute = getBusinessUnitAttributeForForm(formContext);
    const attr = businessUnitAttribute ? formContext.getAttribute(businessUnitAttribute) : undefined;
    const val = attr?.getValue?.();
    const locationId = isLookupArray(val) ? Util.sanitizeGuid(val[0].id) : null;

    if (!locationId) {
        return null;
    }

    try {
        const fieldLogical = BUSINESSUNITLOCATION.fields.mandatoryConfigJson;
        const rec = await ApiClient.retrieveRecord(BUSINESSUNITLOCATION.entity, locationId, `?$select=${fieldLogical}`);
        const jsonText = (rec as Record<string, unknown>)[fieldLogical] as string | null;
        return parseBusinessUnitConfig(jsonText);
    } catch {
        return null;
    }
}

function applyConfigMerged(formContext: Xrm.FormContext, config: BusinessUnitConfig | null): void {
    const previousEntityConfig = lastAppliedEntityConfig.get(formContext);
    if (!config?.entities) {
        if (previousEntityConfig) {
            resetPotentialMandatory(formContext, previousEntityConfig);
            lastAppliedEntityConfig.delete(formContext);
        }
        return;
    }

    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig: EntityConfig | undefined = config.entities[entityLogicalName];
    if (!entityConfig) {
        if (previousEntityConfig) {
            resetPotentialMandatory(formContext, previousEntityConfig);
            lastAppliedEntityConfig.delete(formContext);
        }
        return;
    }

    // 1) Reset: clear required flag for all fields that could be marked mandatory by defaults or any rule
    if (previousEntityConfig) resetPotentialMandatory(formContext, previousEntityConfig);
    resetPotentialMandatory(formContext, entityConfig);
    lastAppliedEntityConfig.set(formContext, entityConfig);

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
        wireAttributeOnChange(formContext, attributeName, (ctx: Xrm.Events.EventContext) => applyDynamicMandatoryRules(ctx));
    }
}

function wireBusinessUnitLookupOnChange(formContext: Xrm.FormContext): void {
    const businessUnitAttribute = getBusinessUnitAttributeForForm(formContext);
    if (!businessUnitAttribute) return;

    wireAttributeOnChange(formContext, businessUnitAttribute, async (ctx: Xrm.Events.EventContext) => {
        const currentFormContext = ctx.getFormContext();
        const config = await loadBusinessUnitConfig(currentFormContext);
        applyConfigMerged(currentFormContext, config);
        autoWireOnChange(currentFormContext, config);
    });
}

function wireAttributeOnChange(
    formContext: Xrm.FormContext,
    attributeName: string,
    handler: (ctx: Xrm.Events.EventContext) => void | Promise<void>
): void {
    let wiredAttributes = wiredOnChangeAttributes.get(formContext);
    if (!wiredAttributes) {
        wiredAttributes = new Set<string>();
        wiredOnChangeAttributes.set(formContext, wiredAttributes);
    }

    if (wiredAttributes.has(attributeName)) return;

    const attribute = formContext.getAttribute(attributeName);
    if (!attribute) return;

    try {
        attribute.addOnChange(handler);
        wiredAttributes.add(attributeName);
    } catch {
        // ignore
    }
}

// Resolves the correct business-unit/location lookup attribute based on the current form's entity
function getBusinessUnitAttributeForForm(formContext: Xrm.FormContext): string | undefined {
    try {
        const entityName = formContext?.data?.entity?.getEntityName?.();
        switch (entityName) {
            case CONTACT.entity:
                return CONTACT.fields.nev_businessunitid; // contact
            case COMPANY.entity:
                return COMPANY.fields.nev_businessunit; // account (nev_businessunit)
            case ACCOUNT.entity:
                return ACCOUNT.fields.ambcust_locationid; // portfolio
            default:
                return undefined;
        }
    } catch {
        return undefined;
    }
}
