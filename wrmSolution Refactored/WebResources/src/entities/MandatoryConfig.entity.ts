import type { BusinessUnitConfig, EntityConfig } from "../core/crm.core";

export const BUSINESSUNITLOCATION = {
    entity: "ambcust_location",
    fields: {
        pk: "ambcust_locationid",
        mandatoryConfigJson: "mhwrmb_mandatoryconfigjson",
    },
} as const;

/** Safe parse; returns null if invalid. */
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

/** Collect base attribute names used in conditions (for auto OnChange wiring). */
export function listConditionFields(entityConfig?: EntityConfig): string[] {
    if (!entityConfig?.rules?.length) return [];
    const fields = new Set<string>();
    for (const r of entityConfig.rules) {
        for (const c of r.condition ?? []) {
            if (!c.field) continue;
            // bind on the base attribute (before projection like .name)
            fields.add(c.field.split(".", 1)[0]);
        }
    }
    return Array.from(fields);
}