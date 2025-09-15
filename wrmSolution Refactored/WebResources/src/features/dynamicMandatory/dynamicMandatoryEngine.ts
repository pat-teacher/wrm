// features/dynamic-mandatory/wrm_dynamicMandatory.ts
// Engine: Liest die Business-Unit-Config und setzt dynamische Pflichtfelder (Merge-Strategie).

import {
    BUSINESSUNITLOCATION,
    BusinessUnitConfig,
    EntityConfig,
    Condition,
    parseBusinessUnitConfig,
    listConditionFields,
    CONTACT
} from "../../entities/index";

import { Util, ApiClient, VisibilityHelper } from "../../core/crm.core";

const businessUnitConfigCache = new Map<string, BusinessUnitConfig | null>();

export async function initializeDynamicMandatoryFields(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config); // Komfort: OnChange automatisch an alle Condition-Felder binden
}

export async function applyDynamicMandatoryRules(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
}

// -------------------- Laden & Caching --------------------

async function loadBusinessUnitConfig(formContext: Xrm.FormContext): Promise<BusinessUnitConfig | null> {
    // Read current location from the active contact record via CONTACT.fields.nev_businessunitid
    const attr = formContext.getAttribute(CONTACT.fields.nev_businessunitid);
    const val = attr?.getValue?.();
    const locationId = isLookupArray(val) ? Util.sanitizeGuid(val[0].id) : null;

    const cacheKey = locationId ? `location:${locationId}` : "location:null";
    const cached = businessUnitConfigCache.get(cacheKey);
    if (cached !== undefined) return cached;

    if (!locationId) {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }

    try {
        // Read JSON from custom table using entity constants
        const fieldLogical = BUSINESSUNITLOCATION.fields.mandatoryConfigJson;
        const location = await ApiClient.retrieveRecord(
            BUSINESSUNITLOCATION.entity,
            locationId,
            `?$select=${fieldLogical}`
        );
        const jsonText = (location as any)[fieldLogical] as string | null;

        const parsed = parseBusinessUnitConfig(jsonText);
        businessUnitConfigCache.set(cacheKey, parsed);
        return parsed;
    } catch {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }
}


// -------------------- Anwenden (Merge-Strategie) --------------------

function applyConfigMerged(formContext: Xrm.FormContext, config: BusinessUnitConfig | null): void {    
    if (!config?.entities) return;

    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName];
    if (!entityConfig) return;

    const merged: string[] = [];
    for (const rule of entityConfig.rules ?? []) {
        if (ruleMatches(formContext, rule.condition)) {
            for (const field of rule.mandatory ?? []) {
                if (!merged.includes(field)) merged.push(field);
            }
        }
    }

    const requiredFields = merged.length ? merged : (entityConfig.default ?? []);
    requiredFields.forEach(fieldLogical => VisibilityHelper.setRequired(formContext, fieldLogical, true));
}

// -------------------- Evaluierung --------------------

function ruleMatches(formContext: Xrm.FormContext, conditions?: Condition[]): boolean {
    if (!conditions || conditions.length === 0) return true;
    for (const condition of conditions) {
        const actual = readAttributeValue(formContext, condition.field);
        if (!evaluateCondition(actual, condition)) return false;
    }
    return true;
}

// ---- Type Guards f?r robuste Typ-Sicherheit ----
function isLookupArray(value: unknown): value is Xrm.LookupValue[] {
    return Array.isArray(value)
        && value.length > 0
        && typeof value[0] === "object"
        && value[0] !== null
        && "id" in (value[0] as object)
        && typeof (value[0] as Xrm.LookupValue).id === "string";
}

function isMultiSelectArray(value: unknown): value is Array<number | string> {
    // Multi-Select Option Set liefert number[] (manchmal string[])
    return Array.isArray(value) && value.every(v => typeof v === "number" || typeof v === "string");
}

// ---- Sicherer Read (fix f?r TS2339) ----
function readAttributeValue(formContext: Xrm.FormContext, logicalName: string): any {
    const attribute = formContext.getAttribute(logicalName);
    if (!attribute || typeof attribute.getValue !== "function") return undefined;

    const value = attribute.getValue();

    // Lookup / Partylist ? GUID der ersten Auswahl (sanitized)
    if (isLookupArray(value)) {
        return Util.sanitizeGuid(value[0].id);
    }

    // Multi-Select Option Set ? number[]/string[]
    if (isMultiSelectArray(value)) {
        return value;
    }

    // Sonst: number | string | boolean | Date | null | undefined
    return value;
}

function evaluateCondition(actual: any, condition: Condition): boolean {
    const { operator, value } = condition;

    switch (operator) {
        case "eq":
            return equalsLoose(actual, value);
        case "ne":
            return !equalsLoose(actual, value);
        case "in":
            return Array.isArray(value) && value.some(v => equalsLoose(actual, v));
        case "isnull":
            return actual == null || (typeof actual === "string" && actual.trim() === "") || (Array.isArray(actual) && actual.length === 0);
        case "isnotnull":
            return !(actual == null || (typeof actual === "string" && actual.trim() === "") || (Array.isArray(actual) && actual.length === 0));
        default:
            return false;
    }
}

function equalsLoose(a: any, b: any): boolean {
    // GUIDs (case-insensitive, ohne Klammern)
    const ga = toGuidOrNull(a);
    const gb = toGuidOrNull(b);
    if (ga && gb) return ga === gb;

    // Zahlen (OptionSet-Codes)
    const na = Number(a), nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;

    // Boolean
    if (typeof a === "boolean" || typeof b === "boolean") {
        return String(a).toLowerCase() === String(b).toLowerCase();
    }

    // Strings (case-insensitive)
    return String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();
}

function toGuidOrNull(value: any): string | null {
    if (!value) return null;
    const s = String(value).replace(/[{}]/g, "").toLowerCase();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s) ? s : null;
}

// -------------------- Komfort: Auto-OnChange --------------------

function autoWireOnChange(formContext: Xrm.FormContext, config: BusinessUnitConfig | null): void {
    if (!config?.entities) return;

    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName] as EntityConfig | undefined;
    const fields = listConditionFields(entityConfig);

    fields.forEach(attributeName => {
        const attribute = formContext.getAttribute(attributeName);
        if (!attribute) return;
        const handler = (ctx: Xrm.Events.EventContext) => applyDynamicMandatoryRules(ctx);
        try { attribute.addOnChange(handler); } catch { /* ignore */ }
    });
}
