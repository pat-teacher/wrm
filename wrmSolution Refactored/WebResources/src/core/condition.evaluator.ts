import { Condition, LookupComparable, Operator, Util } from "../core/crm.core";

function isMultiSelectArray(value: unknown): value is Array<number | string> {
    return Array.isArray(value) && value.every((v) => typeof v === "number" || typeof v === "string");
}

function isLookupComparable(v: unknown): v is LookupComparable {
    return !!v && typeof v === "object" && ("id" in (v as any) || "name" in (v as any) || "entityType" in (v as any));
}

function toGuidOrNull(value: unknown): string | null {
    const s = String(value ?? "").replace(/[{}]/g, "").toLowerCase();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s) ? s : null;
}

function isNullishOrEmpty(v: unknown): boolean {
    if (v == null) return true;
    if (typeof v === "string") return v.trim() === "";
    if (Array.isArray(v)) return v.length === 0;
    if (isLookupComparable(v)) return !v.id && !v.name; // both empty
    return false;
}

function normalizeScalar(x: unknown): string {
    const g = toGuidOrNull(x);
    if (g) return `guid:${g}`;
    const n = Number(x);
    if (!Number.isNaN(n)) return `num:${n}`;
    if (typeof x === "boolean") return `bool:${x}`;
    return `str:${String(x ?? "").toLowerCase()}`;
}

export function isLookupArray(value: unknown): value is Xrm.LookupValue[] {
    return (
        Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0] !== null &&
        "id" in (value[0] as object) &&
        typeof (value[0] as Xrm.LookupValue).id === "string"
    );
}
/** Read a value from the form; supports lookup projections via dot-notation. */
export function readAttributeValue(formContext: Xrm.FormContext, fieldPath: string): unknown {
    const [logicalName, projection] = fieldPath.split(".", 2);
    const attribute = formContext.getAttribute(logicalName);
    if (!attribute || typeof attribute.getValue !== "function") return undefined;

    const raw = attribute.getValue();

    // Lookup / Partylist
    if (isLookupArray(raw)) {
        const lv = raw[0] as Xrm.LookupValue & { entityType?: string };
        const obj: LookupComparable = {
            id: Util.sanitizeGuid(lv.id),
            name: lv.name ?? null,
            entityType: lv.entityType ?? null,
        };

        if (projection) {
            switch (projection.toLowerCase()) {
                case "id":
                    return obj.id;
                case "name":
                    return obj.name;
                case "entitytype":
                    return obj.entityType;
                default:
                    return obj;
            }
        }
        return obj; // default: object
    }

    // Multi-Select OptionSet
    if (isMultiSelectArray(raw)) return raw;

    // Primitive
    return raw as unknown;
}

/** Evaluate single condition against actual value. */
export function evaluateCondition(actual: unknown, condition: Condition): boolean {
    const op = (condition.operator || "").toLowerCase() as Operator;
    const val = (condition as { value?: unknown }).value;

    switch (op) {
        case "eq":
            return equalsSmart(actual, val);
        case "ne":
            return !equalsSmart(actual, val);
        case "in":
            return inSmart(actual, val);
        case "isnull":
            return isNullishOrEmpty(actual);
        case "isnotnull":
        case "notnull":
            return !isNullishOrEmpty(actual);
        default:
            return false;
    }
}

function equalsSmart(a: unknown, b: unknown): boolean {
    if (isLookupComparable(a)) {
        if (b == null) return isNullishOrEmpty(a);
        if (typeof b === "string") {
            const g = toGuidOrNull(b);
            if (g) return (a.id ?? "").toLowerCase() === g; // GUID ? compare ID
            return (a.name ?? "").toLowerCase() === b.toLowerCase(); // else compare name
        }
        if (isLookupComparable(b)) {
            if (a.id && b.id) return a.id.toLowerCase() === b.id.toLowerCase();
            return (a.name ?? "").toLowerCase() === (b.name ?? "").toLowerCase();
        }
        return false;
    }

    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length) return false;
        const as = new Set(a.map((x) => normalizeScalar(x)));
        return b.every((x) => as.has(normalizeScalar(x)));
    }

    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na === nb;

    if (typeof a === "boolean" || typeof b === "boolean") {
        return String(a).toLowerCase() === String(b).toLowerCase();
    }

    return String(a ?? "").toLowerCase() === String(b ?? "").toLowerCase();
}

function inSmart(actual: unknown, candidateList: unknown): boolean {
    if (!Array.isArray(candidateList)) return equalsSmart(actual, candidateList);

    if (Array.isArray(actual)) {
        const cand = new Set(candidateList.map((x) => normalizeScalar(x)));
        return actual.some((x) => cand.has(normalizeScalar(x)));
    }

    if (isLookupComparable(actual)) {
        const id = (actual.id ?? "").toLowerCase();
        const name = (actual.name ?? "").toLowerCase();
        for (const v of candidateList) {
            if (typeof v === "string") {
                const g = toGuidOrNull(v);
                if ((g && id === g) || (!g && name === v.toLowerCase())) return true;
            } else if (isLookupComparable(v)) {
                if ((v.id && id === v.id.toLowerCase()) || (v.name && name === v.name.toLowerCase())) return true;
            } else if (equalsSmart(actual, v)) {
                return true;
            }
        }
        return false;
    }

    return candidateList.some((v) => equalsSmart(actual, v));
}