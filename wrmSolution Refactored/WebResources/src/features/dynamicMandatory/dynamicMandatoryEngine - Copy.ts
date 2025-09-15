// features/dynamic-mandatory/wrm_dynamicMandatory.ts
// Engine: Liest die Business-Unit-Config und setzt dynamische Pflichtfelder (Merge-Strategie).

import {
    BUSINESSUNITLOCATION,
    BusinessUnitConfig,
    EntityConfig,
    Condition,
    parseBusinessUnitConfig,
    listConditionFields
} from "../../entities/index";

import { Util, ApiClient, VisibilityHelper } from "../../core/crm.core";

const businessUnitConfigCache = new Map<string, BusinessUnitConfig | null>();

export async function initializeDynamicMandatoryFields(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig();
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config); // Komfort: OnChange automatisch an alle Condition-Felder binden
}

export async function applyDynamicMandatoryRules(executionContext: Xrm.Events.EventContext): Promise<void> {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig();
    applyConfigMerged(formContext, config);
}

// -------------------- Laden & Caching --------------------

async function loadBusinessUnitConfig(): Promise<BusinessUnitConfig | null> {
    const globalContext = Util.Xrm.Utility.getGlobalContext();
    const businessUnitId = Util.sanitizeGuid(globalContext.userSettings.businessUnitId);

    const cached = businessUnitConfigCache.get(businessUnitId);
    if (cached !== undefined) return cached;

    try {
        /*const fieldLogical = BusinessUnitMandatoryConfig.fields.mandatoryConfigJson;
        const businessUnit = await ApiClient.retrieveRecord(
            BusinessUnitMandatoryConfig.entity,
            businessUnitId,
            `?$select=${fieldLogical}`
        );*/
        //const jsonText = (businessUnit as any)[fieldLogical] as string | null;
        const jsonText = "{\
        \"version\": 1,\
            \"entities\": {\
            \"account\": {\
                \"default\": [\"name\", \"telephone1\", \"emailaddress1\"],\
                    \"rules\": [\
                        {\
                            \"name\": \"prospect_account\",\
                            \"mandatory\": [\"primarycontactid\", \"address1_line1\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"customertypecode\",\
                                    \"operator\": \"eq\",\
                                    \"value\": 1\
                                },\
                                {\
                                    \"field\": \"statecode\",\
                                    \"operator\": \"eq\",\
                                    \"value\": 0\
                                }\
                            ]\
                        },\
                        {\
                            \"name\": \"vip_account\",\
                            \"mandatory\": [\"wrm_viplevel\", \"ownerid\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"wrm_isvip\",\
                                    \"operator\": \"eq\",\
                                    \"value\": true\
                                }\
                            ]\
                        },\
                        {\
                            \"name\": \"prospect_and_vip\",\
                            \"mandatory\": [\"wrm_specialflag\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"customertypecode\",\
                                    \"operator\": \"eq\",\
                                    \"value\": 1\
                                },\
                                {\
                                    \"field\": \"wrm_isvip\",\
                                    \"operator\": \"eq\",\
                                    \"value\": true\
                                }\
                            ]\
                        },\
                        {\
                            \"name\": \"specific_primary_contact\",\
                            \"mandatory\": [\"telephone1\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"primarycontactid\",\
                                    \"operator\": \"eq\",\
                                    \"value\": \"a1b2c3d4-1111-2222-3333-444455556666\"\
                                }\
                            ]\
                        }\
                    ]\
            },\
            \"contact\": {\
                \"default\": [\"lastname\", \"emailaddress1\"],\
                    \"rules\": [\
                        {\
                            \"name\": \"contact_principal\",\
                            \"mandatory\": [\"parentcustomerid\", \"mobilephone\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"wrmb_isclient\",\
                                    \"operator\": \"eq\",\
                                    \"value\": 1\
                                }\
                            ]\
                        },\
                        {\
                            \"name\": \"contact_not_principal\",\
                            \"mandatory\": [\"jobtitle\", \"telephone1\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"wrmb_isclient\",\
                                    \"operator\": \"eq\",\
                                    \"value\": 0\
                                }\
                            ]\
                        }\
                    ]\
            },\
            \"company\": {\
                \"default\": [\"wrm_companyname\", \"wrm_registrationno\"],\
                    \"rules\": [\
                        {\
                            \"name\": \"swiss_company\",\
                            \"mandatory\": [\"wrm_vatno\", \"wrm_companyaddress\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"wrm_country\",\
                                    \"operator\": \"eq\",\
                                    \"value\": \"CH\"\
                                }\
                            ]\
                        },\
                        {\
                            \"name\": \"foreign_company\",\
                            \"mandatory\": [\"wrm_country\", \"wrm_internationaltaxid\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"wrm_country\",\
                                    \"operator\": \"in\",\
                                    \"value\": [\"DE\", \"FR\", \"IT\", \"AT\", \"US\"]\
                                }\
                            ]\
                        },\
                        {\
                            \"name\": \"missing_country\",\
                            \"mandatory\": [\"wrm_country\"],\
                            \"condition\": [\
                                {\
                                    \"field\": \"wrm_country\",\
                                    \"operator\": \"isnull\"\
                                }\
                            ]\
                        }\
                    ]\
            }\
        }\
    }";
        const parsed = parseBusinessUnitConfig(jsonText);
        businessUnitConfigCache.set(businessUnitId, parsed);
        return parsed;
    } catch {
        businessUnitConfigCache.set(businessUnitId, null);
        return null;
    }
}

// -------------------- Anwenden (Merge-Strategie) --------------------

function applyConfigMerged(formContext: Xrm.FormContext, config: BusinessUnitConfig | null): void {
    // Reset: alles auf "none"
    formContext.data.entity.attributes.forEach(attribute => {
        try { attribute.setRequiredLevel("none"); } catch { /* ignore */ }
    });

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

// ---- Type Guards f�r robuste Typ-Sicherheit ----
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

// ---- Sicherer Read (fix f�r TS2339) ----
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
