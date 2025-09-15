// entities/MandatoryConfig.entity.ts
// Zentrale Definition des Business-Unit-JSON-Felds, Dom�nentypen und Parser.

export const BUSINESSUNITLOCATION = {
    entity: "ambcust_location",
    fields: {
        pk: "ambcust_locationid",
        mandatoryConfigJson: "mhwrmb_mandatoryconfigjson"
    }
} as const;

export type Operator = "eq" | "ne" | "in" | "isnull" | "isnotnull";

export interface Condition {
    field: string;           // logical name (z. B. "customertypecode", "primarycontactid")
    operator: Operator;
    /**
     * Erwarteter Wert:
     * - string | number | boolean | null
     * - GUID (z. B. "a1b2c3d4-0000-0000-0000-000000000000")
     * - Array f�r "in": (string[] | number[] | GUID[])
     */
    value?: any;
}

export interface Rule {
    name: string;
    mandatory: string[];     // logical names der Felder, die required werden
    condition?: Condition[]; // UND-verkn�pft; leer/undefined ? gilt immer
}

export interface EntityConfig {
    default: string[];
    rules?: Rule[];
}

export interface BusinessUnitConfig {
    version: number;
    entities: Record<string, EntityConfig>;
}

export function parseBusinessUnitConfig(jsonText: string | null): BusinessUnitConfig | null {
    if (!jsonText) return null;
    try {
        const parsed = JSON.parse(jsonText) as BusinessUnitConfig;
        if (!parsed || typeof parsed !== "object" || !parsed.entities) return null;
        return parsed;
    } catch {
        return null;
    }
}

/** Liefert alle Attributnamen, die in Conditions vorkommen (f�r optionales Auto-OnChange). */
export function listConditionFields(entityConfig?: EntityConfig): string[] {
    if (!entityConfig?.rules?.length) return [];
    const fields = entityConfig.rules.flatMap(rule => (rule.condition ?? []).map(c => c.field));
    return Array.from(new Set(fields));
}
