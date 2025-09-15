// ---- Types shared across engine & entities ----
export type Operator = "eq" | "ne" | "in" | "isnull" | "isnotnull" | "notnull"; // alias

export interface Condition {
    /** Logical name (supports dot-notation for lookup projections: e.g., "primarycontactid.name"). */
    field: string;
    operator: Operator;
    /** Optional value for comparisons (omitted for null-operators). */
    value?: unknown;
}

export interface Rule {
    name?: string;
    mandatory?: string[];
    condition?: Condition[]; // AND-conjunction; empty/undefined ⇒ rule always matches
}

export interface EntityConfig {
    default?: string[];
    rules?: Rule[];
}

export interface BusinessUnitConfig {
    version: number;
    entities: Record<string, EntityConfig>;
}

/** Lightweight comparable representation of a lookup */
export interface LookupComparable {
    id: string | null;
    name: string | null;
    entityType: string | null;
}

// ---- Core helpers ----
export class Util {
    static get Xrm(): any {
        return (window as any).Xrm;
    }

    /** Lowercase, strip braces; returns empty string if falsy input. */
    static sanitizeGuid(id?: string): string {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    }

    static unique<T>(arr: T[]): T[] {
        return Array.from(new Set(arr));
    }
}

// ---- Thin Web API wrapper ----
export class ApiClient {
    static async retrieveRecord(entityLogicalName: string, id: string, options?: string): Promise<any> {
        const cleanId = Util.sanitizeGuid(id);
        return await Util.Xrm.WebApi.retrieveRecord(entityLogicalName, cleanId, options);
    }

    static async retrieveMultiple(entityLogicalName: string, options?: string): Promise<{ entities: any[] }> {
        return await Util.Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, options);
    }

    static async fetchXml(entityLogicalName: string, fetchXml: string): Promise<{ entities: any[] }> {
        const url = `?fetchXml=${encodeURIComponent(fetchXml.trim())}`;
        return await Util.Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, url);
    }

    static async execute(request: any): Promise<Response> {
        return await Util.Xrm.WebApi.online.execute(request);
    }

    static async associateManyToMany(
        parentEntityLogical: string,
        parentId: string,
        relationshipSchemaName: string,
        relatedEntityLogical: string,
        relatedIds: string[]
    ): Promise<void> {
        const req = {
            target: { entityType: parentEntityLogical, id: Util.sanitizeGuid(parentId) },
            relatedEntities: relatedIds.map((rid) => ({ entityType: relatedEntityLogical, id: Util.sanitizeGuid(rid) })),
            relationship: relationshipSchemaName,
            getMetadata: function () {
                return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" };
            },
        } as any;

        const response = await ApiClient.execute(req);
        if (!response.ok) throw new Error(`Association failed: ${response.status} ${response.statusText}`);
    }
}

// ---- Form helpers ----
export class FormHelper {
    static getCurrentId(fc: any): string | null {
        try {
            const idRaw = fc?.data?.entity?.getId?.();
            return idRaw ? Util.sanitizeGuid(idRaw) : null;
        } catch {
            return null;
        }
    }

    static getLookupId(fc: any, attribute: string): string | undefined {
        const v = fc?.getAttribute?.(attribute)?.getValue?.();
        return v && v.length ? Util.sanitizeGuid(v[0].id) : undefined;
    }
}

export class GridHelper {
    static tryRefreshSubgrid(fc: any, name?: string) {
        if (!name) return;
        const grid = fc?.getControl?.(name);
        if (grid?.refresh) {
            try {
                grid.refresh();
            } catch {
                /* ignore */
            }
        } else {
            try {
                fc?.ui?.refreshRibbon?.();
            } catch {
                /* ignore */
            }
        }
    }
}

// ---- Visibility helpers ----
export class VisibilityHelper {
    static setVisible(fc: any, controlName: string, visible: boolean) {
        const ctrl = fc?.getControl?.(controlName);
        if (ctrl?.setVisible) {
            try {
                ctrl.setVisible(visible);
            } catch {
                /* ignore */
            }
        }
    }

    /** Sets required level on an attribute/control */
    static setRequired(fc: any, controlName: string, isRequired: boolean) {
        const attr = fc?.getAttribute?.(controlName);
        if (attr?.setRequiredLevel) {
            try {
                attr.setRequiredLevel(isRequired ? "required" : "none");
            } catch {
                /* ignore */
            }
        }
    }

    static showIf(fc: any, controlName: string, predicate: () => boolean) {
        const show = !!predicate();
        VisibilityHelper.setVisible(fc, controlName, show);
        return show;
    }

    static showIfLookupEquals(fc: any, lookupAttr: string, targetId: string, controlName: string) {
        return VisibilityHelper.showIf(fc, controlName, () => {
            const current = FormHelper.getLookupId(fc, lookupAttr);
            return !!current && Util.sanitizeGuid(current) === Util.sanitizeGuid(targetId);
        });
    }
}

// ---- Lookup dialog helper ----
export interface LookupResult {
    id: string;
    entityType: string;
    name?: string;
}

export class LookupDialogHelper {
    static async openWithIdList(
        entityLogical: string,
        idAttribute: string,
        ids: string[],
        options?: Partial<{ allowMultiSelect: boolean; disableMru: boolean; defaultViewId: string }>
    ): Promise<LookupResult[]> {
        const inValues = ids
            .map((id) => `<value uitype="${entityLogical}">{${Util.sanitizeGuid(id)}}</value>`)
            .join("");

        const filterXml = `
      <filter type="and">
        <condition attribute="${idAttribute}" operator="in">
          ${inValues}
        </condition>
        <condition attribute="statecode" operator="eq" value="0" />
      </filter>`.trim();

        const lookupOptions: any = {
            allowMultiSelect: options?.allowMultiSelect ?? true,
            defaultEntityType: entityLogical,
            entityTypes: [entityLogical],
            filters: [{ entityLogicalName: entityLogical, filterXml }],
            disableMru: options?.disableMru ?? true,
        };

        if (options?.defaultViewId) lookupOptions.defaultViewId = options.defaultViewId;

        return (await Util.Xrm.Utility.lookupObjects(lookupOptions)) as LookupResult[];
    }
}

// ---- Generic lookup OData service ----
export class LookupService {
    static async getFirstIdByFilter(
        entityLogical: string,
        idAttr: string,
        odataFilter: string
    ): Promise<string | null> {
        const options = `?$select=${idAttr}&$filter=${odataFilter}`;
        const res = await ApiClient.retrieveMultiple(entityLogical, options);
        const row = res?.entities?.[0];
        const id = row?.[idAttr] as string | undefined;
        return id ? Util.sanitizeGuid(id) : null;
    }

    static async getIdByEquality(
        entityLogical: string,
        idAttr: string,
        attr: string,
        value: string | number | boolean
    ): Promise<string | null> {
        const lit = typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : String(value);
        return this.getFirstIdByFilter(entityLogical, idAttr, `(${attr} eq ${lit})`);
    }
}