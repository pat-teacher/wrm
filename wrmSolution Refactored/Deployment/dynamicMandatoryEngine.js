/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./WebResources/src/core/condition.evaluator.ts":
/*!******************************************************!*\
  !*** ./WebResources/src/core/condition.evaluator.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   evaluateCondition: () => (/* binding */ evaluateCondition),
/* harmony export */   isLookupArray: () => (/* binding */ isLookupArray),
/* harmony export */   readAttributeValue: () => (/* binding */ readAttributeValue)
/* harmony export */ });
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../core/crm.core */ "./WebResources/src/core/crm.core.ts");

function isMultiSelectArray(value) {
    return Array.isArray(value) && value.every((v) => typeof v === "number" || typeof v === "string");
}
function isLookupComparable(v) {
    return !!v && typeof v === "object" && ("id" in v || "name" in v || "entityType" in v);
}
function toGuidOrNull(value) {
    const s = String(value !== null && value !== void 0 ? value : "").replace(/[{}]/g, "").toLowerCase();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s) ? s : null;
}
function isNullishOrEmpty(v) {
    if (v == null)
        return true;
    if (typeof v === "string")
        return v.trim() === "";
    if (Array.isArray(v))
        return v.length === 0;
    if (isLookupComparable(v))
        return !v.id && !v.name; // both empty
    return false;
}
function normalizeScalar(x) {
    const g = toGuidOrNull(x);
    if (g)
        return `guid:${g}`;
    const n = Number(x);
    if (!Number.isNaN(n))
        return `num:${n}`;
    if (typeof x === "boolean")
        return `bool:${x}`;
    return `str:${String(x !== null && x !== void 0 ? x : "").toLowerCase()}`;
}
function isLookupArray(value) {
    return (Array.isArray(value) &&
        value.length > 0 &&
        typeof value[0] === "object" &&
        value[0] !== null &&
        "id" in value[0] &&
        typeof value[0].id === "string");
}
/** Read a value from the form; supports lookup projections via dot-notation. */
function readAttributeValue(formContext, fieldPath) {
    var _a, _b;
    const [logicalName, projection] = fieldPath.split(".", 2);
    const attribute = formContext.getAttribute(logicalName);
    if (!attribute || typeof attribute.getValue !== "function")
        return undefined;
    const raw = attribute.getValue();
    // Lookup / Partylist
    if (isLookupArray(raw)) {
        const lv = raw[0];
        const obj = {
            id: _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.Util.sanitizeGuid(lv.id),
            name: (_a = lv.name) !== null && _a !== void 0 ? _a : null,
            entityType: (_b = lv.entityType) !== null && _b !== void 0 ? _b : null,
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
    if (isMultiSelectArray(raw))
        return raw;
    // Primitive
    return raw;
}
/** Evaluate single condition against actual value. */
function evaluateCondition(actual, condition) {
    const op = (condition.operator || "").toLowerCase();
    const val = condition.value;
    switch (op) {
        case "eq":
            return equalsSmart(actual, val);
        case "ne":
            return !equalsSmart(actual, val);
        case "in":
            return inSmart(actual, val);
        case "not in":
        case "notin":
        case "not_in":
            return !inSmart(actual, val);
        case "isnull":
            return isNullishOrEmpty(actual);
        case "isnotnull":
        case "notnull":
            return !isNullishOrEmpty(actual);
        default:
            return false;
    }
}
function equalsSmart(a, b) {
    var _a, _b, _c, _d;
    if (isLookupComparable(a)) {
        if (b == null)
            return isNullishOrEmpty(a);
        if (typeof b === "string") {
            const g = toGuidOrNull(b);
            if (g)
                return ((_a = a.id) !== null && _a !== void 0 ? _a : "").toLowerCase() === g; // GUID ? compare ID
            return ((_b = a.name) !== null && _b !== void 0 ? _b : "").toLowerCase() === b.toLowerCase(); // else compare name
        }
        if (isLookupComparable(b)) {
            if (a.id && b.id)
                return a.id.toLowerCase() === b.id.toLowerCase();
            return ((_c = a.name) !== null && _c !== void 0 ? _c : "").toLowerCase() === ((_d = b.name) !== null && _d !== void 0 ? _d : "").toLowerCase();
        }
        return false;
    }
    if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length !== b.length)
            return false;
        const as = new Set(a.map((x) => normalizeScalar(x)));
        return b.every((x) => as.has(normalizeScalar(x)));
    }
    const na = Number(a);
    const nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb))
        return na === nb;
    if (typeof a === "boolean" || typeof b === "boolean") {
        return String(a).toLowerCase() === String(b).toLowerCase();
    }
    return String(a !== null && a !== void 0 ? a : "").toLowerCase() === String(b !== null && b !== void 0 ? b : "").toLowerCase();
}
function inSmart(actual, candidateList) {
    var _a, _b;
    if (!Array.isArray(candidateList))
        return equalsSmart(actual, candidateList);
    if (Array.isArray(actual)) {
        const cand = new Set(candidateList.map((x) => normalizeScalar(x)));
        return actual.some((x) => cand.has(normalizeScalar(x)));
    }
    if (isLookupComparable(actual)) {
        const id = ((_a = actual.id) !== null && _a !== void 0 ? _a : "").toLowerCase();
        const name = ((_b = actual.name) !== null && _b !== void 0 ? _b : "").toLowerCase();
        for (const v of candidateList) {
            if (typeof v === "string") {
                const g = toGuidOrNull(v);
                if ((g && id === g) || (!g && name === v.toLowerCase()))
                    return true;
            }
            else if (isLookupComparable(v)) {
                if ((v.id && id === v.id.toLowerCase()) || (v.name && name === v.name.toLowerCase()))
                    return true;
            }
            else if (equalsSmart(actual, v)) {
                return true;
            }
        }
        return false;
    }
    return candidateList.some((v) => equalsSmart(actual, v));
}


/***/ }),

/***/ "./WebResources/src/core/crm.core.ts":
/*!*******************************************!*\
  !*** ./WebResources/src/core/crm.core.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApiClient: () => (/* binding */ ApiClient),
/* harmony export */   FORM_TYPE: () => (/* binding */ FORM_TYPE),
/* harmony export */   FieldValidator: () => (/* binding */ FieldValidator),
/* harmony export */   FormControlHelper: () => (/* binding */ FormControlHelper),
/* harmony export */   FormTypeHelper: () => (/* binding */ FormTypeHelper),
/* harmony export */   FormWait: () => (/* binding */ FormWait),
/* harmony export */   GridHelper: () => (/* binding */ GridHelper),
/* harmony export */   LookupDialogHelper: () => (/* binding */ LookupDialogHelper),
/* harmony export */   LookupService: () => (/* binding */ LookupService),
/* harmony export */   LookupViewHelper: () => (/* binding */ LookupViewHelper),
/* harmony export */   OwnerHelper: () => (/* binding */ OwnerHelper),
/* harmony export */   OwnerService: () => (/* binding */ OwnerService),
/* harmony export */   SecurityService: () => (/* binding */ SecurityService),
/* harmony export */   Util: () => (/* binding */ Util),
/* harmony export */   VisibilityHelper: () => (/* binding */ VisibilityHelper)
/* harmony export */ });
// ==== FormType Constants ====
const FORM_TYPE = {
    Undefined: 0,
    Create: 1,
    Update: 2,
    ReadOnly: 3,
    Disabled: 4,
    QuickCreate: 5,
    BulkEdit: 6,
};
const FormTypeHelper = {
    get(fc) {
        var _a, _b, _c;
        return (_c = (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _a === void 0 ? void 0 : _a.getFormType) === null || _b === void 0 ? void 0 : _b.call(_a)) !== null && _c !== void 0 ? _c : FORM_TYPE.Undefined;
    },
    isCreateLike(type) {
        return type === FORM_TYPE.Create || type === FORM_TYPE.QuickCreate;
    },
    isEditable(type) {
        return type === FORM_TYPE.Create || type === FORM_TYPE.Update || type === FORM_TYPE.QuickCreate;
    }
};
// ---- Core helpers ----
class Util {
    static get Xrm() {
        return window.Xrm;
    }
    /** Lowercase, strip braces; returns empty string if falsy input. */
    static sanitizeGuid(id) {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    }
    static unique(arr) {
        return Array.from(new Set(arr));
    }
}
// ---- Thin Web API wrapper ----
class ApiClient {
    static async retrieveRecord(entityLogicalName, id, options) {
        const cleanId = Util.sanitizeGuid(id);
        return await Util.Xrm.WebApi.retrieveRecord(entityLogicalName, cleanId, options);
    }
    static async retrieveMultiple(entityLogicalName, options) {
        return await Util.Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, options);
    }
    static async fetchXml(entityLogicalName, fetchXml) {
        const url = `?fetchXml=${encodeURIComponent(fetchXml.trim())}`;
        return await Util.Xrm.WebApi.retrieveMultipleRecords(entityLogicalName, url);
    }
    static async execute(request) {
        return await Util.Xrm.WebApi.online.execute(request);
    }
    static async associateManyToMany(parentEntityLogical, parentId, relationshipSchemaName, relatedEntityLogical, relatedIds) {
        const req = {
            target: { entityType: parentEntityLogical, id: Util.sanitizeGuid(parentId) },
            relatedEntities: relatedIds.map((rid) => ({ entityType: relatedEntityLogical, id: Util.sanitizeGuid(rid) })),
            relationship: relationshipSchemaName,
            getMetadata: function () {
                return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" };
            },
        };
        const response = await ApiClient.execute(req);
        if (!response.ok)
            throw new Error(`Association failed: ${response.status} ${response.statusText}`);
    }
}
// ---- Form helpers ----
class FormControlHelper {
    static getCurrentId(fc) {
        var _a, _b, _c;
        try {
            const idRaw = (_c = (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.data) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.getId) === null || _c === void 0 ? void 0 : _c.call(_b);
            return idRaw ? Util.sanitizeGuid(idRaw) : null;
        }
        catch {
            return null;
        }
    }
    static getLookupId(fc, attribute) {
        var _a, _b, _c;
        const v = (_c = (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, attribute)) === null || _b === void 0 ? void 0 : _b.getValue) === null || _c === void 0 ? void 0 : _c.call(_b);
        return v && v.length ? Util.sanitizeGuid(v[0].id) : undefined;
    }
    /** Disable or enable all disableable controls inside a tab section */
    static setDisabledAllControlsInSection(fc, tabName, sectionName, disabled = true) {
        var _a, _b, _c, _d, _e;
        const tab = (_c = (_b = (_a = fc.ui) === null || _a === void 0 ? void 0 : _a.tabs) === null || _b === void 0 ? void 0 : _b.get) === null || _c === void 0 ? void 0 : _c.call(_b, tabName);
        if (!tab)
            return;
        const section = (_e = (_d = tab.sections) === null || _d === void 0 ? void 0 : _d.get) === null || _e === void 0 ? void 0 : _e.call(_d, sectionName);
        if (!section)
            return;
        try {
            section.controls.forEach((control) => {
                if (VisibilityHelper.isDisableable(control)) {
                    try {
                        control.setDisabled(disabled);
                    }
                    catch { /* ignore */ }
                }
                // Optional: special handling for subgrids, which do not support setDisabled
            });
        }
        catch { /* ignore */ }
    }
    /**
    * de/activate only the specified controls (by name) in a section.
    * Does nothing if the list is empty or controls are not found.
    */
    static setDisabledNamedControlsInSection(fc, tabName, sectionName, controlNames, disabled = true) {
        var _a, _b, _c, _d, _e;
        if (!Array.isArray(controlNames) || controlNames.length === 0)
            return;
        const tab = (_c = (_b = (_a = fc.ui) === null || _a === void 0 ? void 0 : _a.tabs) === null || _b === void 0 ? void 0 : _b.get) === null || _c === void 0 ? void 0 : _c.call(_b, tabName);
        if (!tab)
            return;
        const section = (_e = (_d = tab.sections) === null || _d === void 0 ? void 0 : _d.get) === null || _e === void 0 ? void 0 : _e.call(_d, sectionName);
        if (!section)
            return;
        controlNames
            .map((name) => FormControlHelper.findControlInSection(section, name))
            .filter((c) => Boolean(c))
            .forEach((control) => FormControlHelper.setDisabledIfAllowed(control, disabled));
    }
    static findControlInSection(section, name) {
        var _a, _b;
        // primary: direct per Name
        const direct = (_b = (_a = section.controls).get) === null || _b === void 0 ? void 0 : _b.call(_a, name);
        if (direct)
            return direct;
        // Fallback: search by getName() over the collection
        let found;
        section.controls.forEach((c) => {
            var _a;
            if (((_a = c.getName) === null || _a === void 0 ? void 0 : _a.call(c)) === name)
                found = c;
        });
        return found;
    }
    static setDisabledIfAllowed(control, disabled) {
        var _a;
        if (!VisibilityHelper.isDisableable(control))
            return;
        try {
            // only change if different
            const current = (_a = control.getDisabled) === null || _a === void 0 ? void 0 : _a.call(control);
            if (typeof current === "boolean" && current === disabled)
                return;
            control.setDisabled(disabled);
        }
        catch {
            /* no-op */
        }
    }
}
class GridHelper {
    static tryRefreshSubgrid(fc, name) {
        var _a, _b, _c;
        if (!name)
            return;
        const grid = (_a = fc === null || fc === void 0 ? void 0 : fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, name);
        if (grid === null || grid === void 0 ? void 0 : grid.refresh) {
            try {
                grid.refresh();
            }
            catch {
                /* ignore */
            }
        }
        else {
            try {
                (_c = (_b = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _b === void 0 ? void 0 : _b.refreshRibbon) === null || _c === void 0 ? void 0 : _c.call(_b);
            }
            catch {
                /* ignore */
            }
        }
    }
}
// ---- Visibility helpers ----
class VisibilityHelper {
    static setVisible(fc, controlName, visible) {
        var _a;
        const ctrl = (_a = fc === null || fc === void 0 ? void 0 : fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
        if (ctrl === null || ctrl === void 0 ? void 0 : ctrl.setVisible) {
            try {
                ctrl.setVisible(visible);
            }
            catch {
                /* ignore */
            }
        }
    }
    /** Enables or disables a control */
    static setDisabled(fc, controlName, disabled) {
        var _a;
        const ctrl = (_a = fc === null || fc === void 0 ? void 0 : fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
        if (ctrl === null || ctrl === void 0 ? void 0 : ctrl.setDisabled) {
            try {
                ctrl.setDisabled(disabled);
            }
            catch {
                /* ignore */
            }
        }
    }
    /** Sets required level on an attribute/control */
    static setRequired(fc, controlName, isRequired) {
        var _a;
        const attr = (_a = fc === null || fc === void 0 ? void 0 : fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
        if (attr === null || attr === void 0 ? void 0 : attr.setRequiredLevel) {
            try {
                attr.setRequiredLevel(isRequired ? "required" : "none");
            }
            catch {
                /* ignore */
            }
        }
    }
    static showIf(fc, controlName, predicate) {
        const show = !!predicate();
        VisibilityHelper.setVisible(fc, controlName, show);
        return show;
    }
    static showIfLookupEquals(fc, lookupAttr, targetId, controlName) {
        return VisibilityHelper.showIf(fc, controlName, () => {
            const current = FormControlHelper.getLookupId(fc, lookupAttr);
            return !!current && Util.sanitizeGuid(current) === Util.sanitizeGuid(targetId);
        });
    }
    /** Type guard: control supports setDisabled */
    static isDisableable(control) {
        return "setDisabled" in control && typeof control.setDisabled === "function";
    }
}
class LookupDialogHelper {
    static async openWithIdList(entityLogical, idAttribute, ids, options) {
        var _a, _b;
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
        const lookupOptions = {
            allowMultiSelect: (_a = options === null || options === void 0 ? void 0 : options.allowMultiSelect) !== null && _a !== void 0 ? _a : true,
            defaultEntityType: entityLogical,
            entityTypes: [entityLogical],
            filters: [{ entityLogicalName: entityLogical, filterXml }],
            disableMru: (_b = options === null || options === void 0 ? void 0 : options.disableMru) !== null && _b !== void 0 ? _b : true,
        };
        if (options === null || options === void 0 ? void 0 : options.defaultViewId)
            lookupOptions.defaultViewId = options.defaultViewId;
        return (await Util.Xrm.Utility.lookupObjects(lookupOptions));
    }
}
// ---- Generic lookup OData service ----
class LookupService {
    static async getFirstIdByFilter(entityLogical, idAttr, odataFilter) {
        var _a;
        const options = `?$select=${idAttr}&$filter=${odataFilter}`;
        const res = await ApiClient.retrieveMultiple(entityLogical, options);
        const row = (_a = res === null || res === void 0 ? void 0 : res.entities) === null || _a === void 0 ? void 0 : _a[0];
        const id = row === null || row === void 0 ? void 0 : row[idAttr];
        return id ? Util.sanitizeGuid(id) : null;
    }
    static async getIdByEquality(entityLogical, idAttr, attr, value) {
        const lit = typeof value === "string" ? `'${value.replace(/'/g, "''")}'` : String(value);
        return this.getFirstIdByFilter(entityLogical, idAttr, `(${attr} eq ${lit})`);
    }
}
class FormWait {
    static waitForLookupValue(fc, attributeName, timeoutMs = 6000) {
        return new Promise((resolve) => {
            var _a, _b, _c;
            const attr = (_a = fc === null || fc === void 0 ? void 0 : fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, attributeName);
            if (!attr)
                return resolve(null);
            const now = (_c = (_b = attr.getValue) === null || _b === void 0 ? void 0 : _b.call(attr)) === null || _c === void 0 ? void 0 : _c[0];
            if (now === null || now === void 0 ? void 0 : now.id)
                return resolve(now);
            let done = false;
            const cleanup = () => { try {
                attr.removeOnChange(onChange);
            }
            catch { } };
            const onChange = () => {
                var _a, _b;
                if (done)
                    return;
                const v = (_b = (_a = attr.getValue) === null || _a === void 0 ? void 0 : _a.call(attr)) === null || _b === void 0 ? void 0 : _b[0];
                if (v === null || v === void 0 ? void 0 : v.id) {
                    done = true;
                    cleanup();
                    resolve(v);
                }
            };
            try {
                attr.addOnChange(onChange);
            }
            catch { }
            setTimeout(onChange, 0);
            setTimeout(() => { if (!done) {
                done = true;
                cleanup();
                resolve(null);
            } }, timeoutMs);
        });
    }
}
class OwnerHelper {
    static getOwnerAttribute(fc, ownerAttrName) {
        var _a, _b;
        return ((_b = (_a = fc === null || fc === void 0 ? void 0 : fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, ownerAttrName)) !== null && _b !== void 0 ? _b : null);
    }
    static getCurrentOwner(fc, ownerAttrName) {
        var _a, _b, _c, _d;
        const v = (_c = (_b = (_a = this.getOwnerAttribute(fc, ownerAttrName)) === null || _a === void 0 ? void 0 : _a.getValue) === null || _b === void 0 ? void 0 : _b.call(_a)) === null || _c === void 0 ? void 0 : _c[0];
        if (!(v === null || v === void 0 ? void 0 : v.id) || !v.entityType)
            return null;
        return { id: Util.sanitizeGuid(v.id), entityType: v.entityType, name: (_d = v.name) !== null && _d !== void 0 ? _d : null };
    }
    static setOwner(fc, ownerAttrName, owner) {
        var _a;
        const attr = this.getOwnerAttribute(fc, ownerAttrName);
        if (!attr)
            return;
        attr.setValue([{
                id: Util.sanitizeGuid(owner.id),
                entityType: owner.entityType,
                name: (_a = owner.name) !== null && _a !== void 0 ? _a : undefined
            }]);
    }
    static isSameOwner(a, b) {
        if (!a || !b)
            return false;
        return a.entityType === b.entityType && Util.sanitizeGuid(a.id) === Util.sanitizeGuid(b.id);
    }
}
/** Generic service: Load owner (User or Team) for any record */
class OwnerService {
    static async getOwnerRef(entityLogical, recordId, ownerAttrName = "ownerid") {
        var _a, _b;
        const id = Util.sanitizeGuid(recordId);
        if (!id)
            return null;
        // For polymorphic owner lookups, expand dedicated nav props to avoid property-not-found errors
        const expand = `?$select=${ownerAttrName}&$expand=owninguser($select=systemuserid,fullname),owningteam($select=teamid,name)`;
        const rec = await ApiClient.retrieveRecord(entityLogical, id, expand);
        const user = rec === null || rec === void 0 ? void 0 : rec["owninguser"];
        if (user === null || user === void 0 ? void 0 : user.systemuserid) {
            return {
                id: Util.sanitizeGuid(user.systemuserid),
                entityType: "systemuser",
                name: (_a = user.fullname) !== null && _a !== void 0 ? _a : null,
            };
        }
        const team = rec === null || rec === void 0 ? void 0 : rec["owningteam"];
        if (team === null || team === void 0 ? void 0 : team.teamid) {
            return {
                id: Util.sanitizeGuid(team.teamid),
                entityType: "team",
                name: (_b = team.name) !== null && _b !== void 0 ? _b : null,
            };
        }
        return null;
    }
}
/** Security-related helpers */
class SecurityService {
    /** Returns current user id from Xrm context */
    static getCurrentUserId() {
        var _a, _b, _c, _d, _e;
        try {
            const id = (_e = (_d = (_c = (_b = (_a = Util.Xrm) === null || _a === void 0 ? void 0 : _a.Utility) === null || _b === void 0 ? void 0 : _b.getGlobalContext) === null || _c === void 0 ? void 0 : _c.call(_b)) === null || _d === void 0 ? void 0 : _d.userSettings) === null || _e === void 0 ? void 0 : _e.userId;
            return id ? Util.sanitizeGuid(id) : null;
        }
        catch {
            return null;
        }
    }
    /** Returns role names of the current user */
    static async getCurrentUserRoles() {
        const userId = this.getCurrentUserId();
        if (!userId)
            return [];
        // FetchXML over systemuserroles (N:N) to role
        const fetchXml = `
                <fetch version="1.0" distinct="true">
                    <entity name="role">
                        <attribute name="roleid" />
                        <attribute name="name" />
                        <link-entity name="systemuserroles" from="roleid" to="roleid" intersect="true">
                            <link-entity name="systemuser" from="systemuserid" to="systemuserid" alias="u">
                                <filter>
                                    <condition attribute="systemuserid" operator="eq" value="${userId}" />
                                </filter>
                            </link-entity>
                        </link-entity>
                    </entity>
                </fetch>`.trim();
        const res = await ApiClient.fetchXml("role", fetchXml);
        return (res.entities || []).map((e) => {
            var _a;
            return ({
                id: Util.sanitizeGuid((_a = e["roleid"]) !== null && _a !== void 0 ? _a : e["_roleid_value"]),
                name: e["name"],
            });
        }).filter(r => !!r.id && !!r.name);
    }
    /** Checks if current user has one of the provided role names (case-insensitive) */
    static async hasCurrentUserRole(...roleNames) {
        const wanted = new Set(roleNames.map(n => n.trim().toLowerCase()).filter(Boolean));
        if (wanted.size === 0)
            return false;
        const roles = await this.getCurrentUserRoles();
        return roles.some(r => wanted.has(r.name.toLowerCase()));
    }
}
// ---- Lookup control view helpers ----
class LookupViewHelper {
    /** Restrict a lookup control to specific entity types */
    static setEntityTypes(fc, controlName, entityTypes) {
        var _a, _b;
        try {
            const ctrl = (_a = fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
            (_b = ctrl === null || ctrl === void 0 ? void 0 : ctrl.setEntityTypes) === null || _b === void 0 ? void 0 : _b.call(ctrl, entityTypes);
        }
        catch { /* ignore */ }
    }
    /** Add a custom view to a lookup control */
    static addCustomView(fc, controlName, viewId, entityName, viewDisplayName, fetchXml, layoutXml, setAsDefault = true) {
        var _a;
        try {
            const ctrl = (_a = fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
            if (!(ctrl === null || ctrl === void 0 ? void 0 : ctrl.addCustomView))
                return;
            ctrl.addCustomView(viewId, entityName, viewDisplayName, fetchXml.trim(), layoutXml.trim(), setAsDefault);
        }
        catch { /* ignore */ }
    }
    /** Adds a custom view for owner lookup to show only teams the current user belongs to. */
    static addOwnerTeamViewForCurrentUser(fc, controlName = "ownerid") {
        const entityName = "team";
        const viewDisplayName = "OwnerTeamLookupView";
        const viewId = "{00000000-0000-0000-0000-000000000001}";
        const fetchXml = `
            <fetch>
                <entity name="team">
                    <attribute name="name" />
                    <attribute name="businessunitid" />
                    <link-entity name="nev_ownerteam2systemuser" from="teamid" to="teamid" intersect="true">
                        <filter>
                            <condition attribute="systemuserid" operator="eq-userid" />
                        </filter>
                    </link-entity>
                </entity>
            </fetch>
        `;
        const layoutXml = `
            <grid name='resultset' object='1' jump='teamid' select='1' icon='1' preview='1'>
                <row name='result' id='teamid'>
                    <cell name='name' width='150' />
                    <cell name='businessunitid' width='150' />
                </row>
            </grid>
        `;
        LookupViewHelper.addCustomView(fc, controlName, viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);
    }
}
class FieldValidator {
    /**
     * Validates a numeric text field with a maximum of 12 digits.
     * Can be used for OnChange events and optionally receives the attribute name as a parameter.
     */
    static validateBigNumber(executionContext, attributeName) {
        const formContext = executionContext.getFormContext();
        // If no attribute name is provided → use event source
        if (!attributeName) {
            const eventSource = executionContext.getEventSource();
            if (!eventSource)
                return;
            attributeName = eventSource.getName();
        }
        const attribute = formContext.getAttribute(attributeName);
        const control = formContext.getControl(attributeName);
        if (!attribute || !control)
            return;
        const notificationId = `${attributeName}_BigNumberError`;
        let value = attribute.getValue();
        // If the field is truly empty (null) → clear error and exit
        if (value === null) {
            control.clearNotification(notificationId);
            return;
        }
        // Keep original string, but work on a copy
        const raw = value.toString();
        // If the user entered only whitespace → treat as invalid
        if (raw.trim().length === 0) {
            attribute.setValue(null);
            control.setNotification("Please enter a numeric value with a maximum of 12 digits.", notificationId);
            return;
        }
        // Remove all whitespace for validation / storage
        const digitsOnly = raw.replace(/\s+/g, "");
        // Validation: only digits, max. 12 characters
        const isValid = /^\d{1,12}$/.test(digitsOnly);
        if (!isValid) {
            attribute.setValue(null);
            control.setNotification("Please enter a numeric value with a maximum of 12 digits.", notificationId);
            return;
        }
        // Valid → clear notification and store raw value without spaces
        control.clearNotification(notificationId);
        attribute.setValue(digitsOnly);
    }
}


/***/ }),

/***/ "./WebResources/src/entities/Account.entity.ts":
/*!*****************************************************!*\
  !*** ./WebResources/src/entities/Account.entity.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACCOUNT: () => (/* binding */ ACCOUNT)
/* harmony export */ });
// Portfolio.entity.ts
const ACCOUNT = {
    entity: "wrmb_portfolio",
    fields: {
        pk: "wrmb_portfolioid",
        ambcust_locationid: "ambcust_locationid",
        ambcust_accountstatusreason: "ambcust_accountstatusreason",
    },
    options: {
        IN_OPENING: 858090001
    },
};


/***/ }),

/***/ "./WebResources/src/entities/Company.entity.ts":
/*!*****************************************************!*\
  !*** ./WebResources/src/entities/Company.entity.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COMPANY: () => (/* binding */ COMPANY)
/* harmony export */ });
const COMPANY = {
    entity: "account",
    fields: {
        pk: "accountid",
        nev_businessunit: "nev_businessunit",
        ownerid: "ownerid",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/Contact.entity.ts":
/*!*****************************************************!*\
  !*** ./WebResources/src/entities/Contact.entity.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CONTACT: () => (/* binding */ CONTACT)
/* harmony export */ });
const CONTACT = {
    entity: "contact",
    fields: {
        pk: "contactid",
        nev_businessunitid: "nev_businessunitid",
        ownerid: "ownerid",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/MandatoryConfig.entity.ts":
/*!*************************************************************!*\
  !*** ./WebResources/src/entities/MandatoryConfig.entity.ts ***!
  \*************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BUSINESSUNITLOCATION: () => (/* binding */ BUSINESSUNITLOCATION),
/* harmony export */   listConditionFields: () => (/* binding */ listConditionFields),
/* harmony export */   parseBusinessUnitConfig: () => (/* binding */ parseBusinessUnitConfig)
/* harmony export */ });
const BUSINESSUNITLOCATION = {
    entity: "ambcust_location",
    fields: {
        pk: "ambcust_locationid",
        mandatoryConfigJson: "mhwrmb_mandatoryconfigjson",
    },
};
/** Safe parse; returns null if invalid. */
function parseBusinessUnitConfig(jsonText) {
    if (!jsonText)
        return null;
    try {
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed !== "object" || !parsed.entities)
            return null;
        return parsed;
    }
    catch {
        return null;
    }
}
/** Collect base attribute names used in conditions (for auto OnChange wiring). */
function listConditionFields(entityConfig) {
    var _a, _b;
    if (!((_a = entityConfig === null || entityConfig === void 0 ? void 0 : entityConfig.rules) === null || _a === void 0 ? void 0 : _a.length))
        return [];
    const fields = new Set();
    for (const r of entityConfig.rules) {
        for (const c of (_b = r.condition) !== null && _b !== void 0 ? _b : []) {
            if (!c.field)
                continue;
            // bind on the base attribute (before projection like .name)
            fields.add(c.field.split(".", 1)[0]);
        }
    }
    return Array.from(fields);
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************************************************************************!*\
  !*** ./WebResources/src/features/dynamicMandatory/dynamicMandatoryEngine.ts ***!
  \******************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   applyDynamicMandatoryRules: () => (/* binding */ applyDynamicMandatoryRules),
/* harmony export */   initializeDynamicMandatoryFields: () => (/* binding */ initializeDynamicMandatoryFields)
/* harmony export */ });
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../core/crm.core */ "./WebResources/src/core/crm.core.ts");
/* harmony import */ var _core_condition_evaluator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/condition.evaluator */ "./WebResources/src/core/condition.evaluator.ts");
/* harmony import */ var _entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../entities/MandatoryConfig.entity */ "./WebResources/src/entities/MandatoryConfig.entity.ts");
/* harmony import */ var _entities_Contact_entity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../entities/Contact.entity */ "./WebResources/src/entities/Contact.entity.ts");
/* harmony import */ var _entities_Company_entity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../../entities/Company.entity */ "./WebResources/src/entities/Company.entity.ts");
/* harmony import */ var _entities_Account_entity__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../../entities/Account.entity */ "./WebResources/src/entities/Account.entity.ts");






const wiredOnChangeAttributes = new WeakMap();
const lastAppliedEntityConfig = new WeakMap();
async function initializeDynamicMandatoryFields(executionContext) {
    const formContext = executionContext.getFormContext();
    if (isQuickCreateForm(formContext))
        return;
    wireBusinessUnitLookupOnChange(formContext);
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config);
}
async function applyDynamicMandatoryRules(executionContext) {
    const formContext = executionContext.getFormContext();
    if (isQuickCreateForm(formContext))
        return;
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
}
function isQuickCreateForm(formContext) {
    var _a, _b, _c;
    const formType = (_b = (_a = formContext.ui) === null || _a === void 0 ? void 0 : _a.getFormType) === null || _b === void 0 ? void 0 : _b.call(_a);
    if (formType === _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.FORM_TYPE.QuickCreate)
        return true;
    const formSelector = (_c = formContext.ui) === null || _c === void 0 ? void 0 : _c.formSelector;
    return formType === _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.FORM_TYPE.Create && (!formSelector || typeof formSelector.getCurrentItem !== "function");
}
async function loadBusinessUnitConfig(formContext) {
    var _a;
    const businessUnitAttribute = getBusinessUnitAttributeForForm(formContext);
    const attr = businessUnitAttribute ? formContext.getAttribute(businessUnitAttribute) : undefined;
    const val = (_a = attr === null || attr === void 0 ? void 0 : attr.getValue) === null || _a === void 0 ? void 0 : _a.call(attr);
    const locationId = (0,_core_condition_evaluator__WEBPACK_IMPORTED_MODULE_1__.isLookupArray)(val) ? _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.Util.sanitizeGuid(val[0].id) : null;
    if (!locationId) {
        return null;
    }
    try {
        const fieldLogical = _entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.BUSINESSUNITLOCATION.fields.mandatoryConfigJson;
        const rec = await _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.ApiClient.retrieveRecord(_entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.BUSINESSUNITLOCATION.entity, locationId, `?$select=${fieldLogical}`);
        const jsonText = rec[fieldLogical];
        return (0,_entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.parseBusinessUnitConfig)(jsonText);
    }
    catch {
        return null;
    }
}
function applyConfigMerged(formContext, config) {
    var _a, _b, _c;
    const previousEntityConfig = lastAppliedEntityConfig.get(formContext);
    if (!(config === null || config === void 0 ? void 0 : config.entities)) {
        if (previousEntityConfig) {
            resetPotentialMandatory(formContext, previousEntityConfig);
            lastAppliedEntityConfig.delete(formContext);
        }
        return;
    }
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName];
    if (!entityConfig) {
        if (previousEntityConfig) {
            resetPotentialMandatory(formContext, previousEntityConfig);
            lastAppliedEntityConfig.delete(formContext);
        }
        return;
    }
    // 1) Reset: clear required flag for all fields that could be marked mandatory by defaults or any rule
    if (previousEntityConfig)
        resetPotentialMandatory(formContext, previousEntityConfig);
    resetPotentialMandatory(formContext, entityConfig);
    lastAppliedEntityConfig.set(formContext, entityConfig);
    // 2) Evaluate rules and merge resulting mandatory fields
    const merged = [];
    for (const rule of (_a = entityConfig.rules) !== null && _a !== void 0 ? _a : []) {
        if (ruleMatches(formContext, rule.condition)) {
            for (const field of (_b = rule.mandatory) !== null && _b !== void 0 ? _b : []) {
                if (!merged.includes(field))
                    merged.push(field);
            }
        }
    }
    const requiredFields = merged.length ? merged : (_c = entityConfig.default) !== null && _c !== void 0 ? _c : [];
    requiredFields.forEach(fieldLogical => _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.VisibilityHelper.setRequired(formContext, fieldLogical, true));
}
// Clears required flag on all fields that could be marked mandatory by defaults or any rule for a given entity config
function resetPotentialMandatory(formContext, entityConfig) {
    var _a, _b, _c;
    const potentialMandatory = new Set();
    for (const f of (_a = entityConfig.default) !== null && _a !== void 0 ? _a : [])
        potentialMandatory.add(f);
    for (const rule of (_b = entityConfig.rules) !== null && _b !== void 0 ? _b : []) {
        for (const f of (_c = rule.mandatory) !== null && _c !== void 0 ? _c : [])
            potentialMandatory.add(f);
    }
    potentialMandatory.forEach(fieldLogical => _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.VisibilityHelper.setRequired(formContext, fieldLogical, false));
}
function ruleMatches(formContext, conditions) {
    if (!conditions || conditions.length === 0)
        return true;
    for (const condition of conditions) {
        const actual = (0,_core_condition_evaluator__WEBPACK_IMPORTED_MODULE_1__.readAttributeValue)(formContext, condition.field);
        if (!(0,_core_condition_evaluator__WEBPACK_IMPORTED_MODULE_1__.evaluateCondition)(actual, condition))
            return false;
    }
    return true;
}
function autoWireOnChange(formContext, config) {
    if (!(config === null || config === void 0 ? void 0 : config.entities))
        return;
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName];
    const fields = (0,_entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.listConditionFields)(entityConfig);
    for (const attributeName of fields) {
        wireAttributeOnChange(formContext, attributeName, (ctx) => applyDynamicMandatoryRules(ctx));
    }
}
function wireBusinessUnitLookupOnChange(formContext) {
    const businessUnitAttribute = getBusinessUnitAttributeForForm(formContext);
    if (!businessUnitAttribute)
        return;
    wireAttributeOnChange(formContext, businessUnitAttribute, async (ctx) => {
        const currentFormContext = ctx.getFormContext();
        const config = await loadBusinessUnitConfig(currentFormContext);
        applyConfigMerged(currentFormContext, config);
        autoWireOnChange(currentFormContext, config);
    });
}
function wireAttributeOnChange(formContext, attributeName, handler) {
    let wiredAttributes = wiredOnChangeAttributes.get(formContext);
    if (!wiredAttributes) {
        wiredAttributes = new Set();
        wiredOnChangeAttributes.set(formContext, wiredAttributes);
    }
    if (wiredAttributes.has(attributeName))
        return;
    const attribute = formContext.getAttribute(attributeName);
    if (!attribute)
        return;
    try {
        attribute.addOnChange(handler);
        wiredAttributes.add(attributeName);
    }
    catch {
        // ignore
    }
}
// Resolves the correct business-unit/location lookup attribute based on the current form's entity
function getBusinessUnitAttributeForForm(formContext) {
    var _a, _b, _c;
    try {
        const entityName = (_c = (_b = (_a = formContext === null || formContext === void 0 ? void 0 : formContext.data) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.getEntityName) === null || _c === void 0 ? void 0 : _c.call(_b);
        switch (entityName) {
            case _entities_Contact_entity__WEBPACK_IMPORTED_MODULE_3__.CONTACT.entity:
                return _entities_Contact_entity__WEBPACK_IMPORTED_MODULE_3__.CONTACT.fields.nev_businessunitid; // contact
            case _entities_Company_entity__WEBPACK_IMPORTED_MODULE_4__.COMPANY.entity:
                return _entities_Company_entity__WEBPACK_IMPORTED_MODULE_4__.COMPANY.fields.nev_businessunit; // account (nev_businessunit)
            case _entities_Account_entity__WEBPACK_IMPORTED_MODULE_5__.ACCOUNT.entity:
                return _entities_Account_entity__WEBPACK_IMPORTED_MODULE_5__.ACCOUNT.fields.ambcust_locationid; // portfolio
            default:
                return undefined;
        }
    }
    catch {
        return undefined;
    }
}

})();

(window.WRM = window.WRM || {}).dynamicMandatoryEngine = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHluYW1pY01hbmRhdG9yeUVuZ2luZS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7OztBQUErRTtBQUUvRSxTQUFTLGtCQUFrQixDQUFDLEtBQWM7SUFDdEMsT0FBTyxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLENBQUMsQ0FBQztBQUN0RyxDQUFDO0FBRUQsU0FBUyxrQkFBa0IsQ0FBQyxDQUFVO0lBQ2xDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFJLElBQUssQ0FBUyxJQUFJLE1BQU0sSUFBSyxDQUFTLElBQUksWUFBWSxJQUFLLENBQVMsQ0FBQyxDQUFDO0FBQ3RILENBQUM7QUFFRCxTQUFTLFlBQVksQ0FBQyxLQUFjO0lBQ2hDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLGFBQUwsS0FBSyxjQUFMLEtBQUssR0FBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2pFLE9BQU8sZ0VBQWdFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztBQUMvRixDQUFDO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxDQUFVO0lBQ2hDLElBQUksQ0FBQyxJQUFJLElBQUk7UUFBRSxPQUFPLElBQUksQ0FBQztJQUMzQixJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVE7UUFBRSxPQUFPLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDbEQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7SUFDNUMsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxhQUFhO0lBQ2pFLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFFRCxTQUFTLGVBQWUsQ0FBQyxDQUFVO0lBQy9CLE1BQU0sQ0FBQyxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMxQixJQUFJLENBQUM7UUFBRSxPQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUM7SUFDMUIsTUFBTSxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3BCLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUFFLE9BQU8sT0FBTyxDQUFDLEVBQUUsQ0FBQztJQUN4QyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQVM7UUFBRSxPQUFPLFFBQVEsQ0FBQyxFQUFFLENBQUM7SUFDL0MsT0FBTyxPQUFPLE1BQU0sQ0FBQyxDQUFDLGFBQUQsQ0FBQyxjQUFELENBQUMsR0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDO0FBQ2xELENBQUM7QUFFTSxTQUFTLGFBQWEsQ0FBQyxLQUFjO0lBQ3hDLE9BQU8sQ0FDSCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUNwQixLQUFLLENBQUMsTUFBTSxHQUFHLENBQUM7UUFDaEIsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssUUFBUTtRQUM1QixLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSTtRQUNqQixJQUFJLElBQUssS0FBSyxDQUFDLENBQUMsQ0FBWTtRQUM1QixPQUFRLEtBQUssQ0FBQyxDQUFDLENBQXFCLENBQUMsRUFBRSxLQUFLLFFBQVEsQ0FDdkQsQ0FBQztBQUNOLENBQUM7QUFDRCxnRkFBZ0Y7QUFDekUsU0FBUyxrQkFBa0IsQ0FBQyxXQUE0QixFQUFFLFNBQWlCOztJQUM5RSxNQUFNLENBQUMsV0FBVyxFQUFFLFVBQVUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQzFELE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDeEQsSUFBSSxDQUFDLFNBQVMsSUFBSSxPQUFPLFNBQVMsQ0FBQyxRQUFRLEtBQUssVUFBVTtRQUFFLE9BQU8sU0FBUyxDQUFDO0lBRTdFLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQUUsQ0FBQztJQUVqQyxxQkFBcUI7SUFDckIsSUFBSSxhQUFhLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNyQixNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUE4QyxDQUFDO1FBQy9ELE1BQU0sR0FBRyxHQUFxQjtZQUMxQixFQUFFLEVBQUUsZ0RBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztZQUM1QixJQUFJLEVBQUUsUUFBRSxDQUFDLElBQUksbUNBQUksSUFBSTtZQUNyQixVQUFVLEVBQUUsUUFBRSxDQUFDLFVBQVUsbUNBQUksSUFBSTtTQUNwQyxDQUFDO1FBRUYsSUFBSSxVQUFVLEVBQUUsQ0FBQztZQUNiLFFBQVEsVUFBVSxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7Z0JBQy9CLEtBQUssSUFBSTtvQkFDTCxPQUFPLEdBQUcsQ0FBQyxFQUFFLENBQUM7Z0JBQ2xCLEtBQUssTUFBTTtvQkFDUCxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7Z0JBQ3BCLEtBQUssWUFBWTtvQkFDYixPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUM7Z0JBQzFCO29CQUNJLE9BQU8sR0FBRyxDQUFDO1lBQ25CLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxHQUFHLENBQUMsQ0FBQyxrQkFBa0I7SUFDbEMsQ0FBQztJQUVELHlCQUF5QjtJQUN6QixJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztRQUFFLE9BQU8sR0FBRyxDQUFDO0lBRXhDLFlBQVk7SUFDWixPQUFPLEdBQWMsQ0FBQztBQUMxQixDQUFDO0FBRUQsc0RBQXNEO0FBQy9DLFNBQVMsaUJBQWlCLENBQUMsTUFBZSxFQUFFLFNBQW9CO0lBQ25FLE1BQU0sRUFBRSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQWMsQ0FBQztJQUNoRSxNQUFNLEdBQUcsR0FBSSxTQUFpQyxDQUFDLEtBQUssQ0FBQztJQUVyRCxRQUFRLEVBQUUsRUFBRSxDQUFDO1FBQ1QsS0FBSyxJQUFJO1lBQ0wsT0FBTyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3BDLEtBQUssSUFBSTtZQUNMLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3JDLEtBQUssSUFBSTtZQUNMLE9BQU8sT0FBTyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNoQyxLQUFLLFFBQVEsQ0FBQztRQUNkLEtBQUssT0FBTyxDQUFDO1FBQ2IsS0FBSyxRQUFRO1lBQ1QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakMsS0FBSyxRQUFRO1lBQ1QsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNwQyxLQUFLLFdBQVcsQ0FBQztRQUNqQixLQUFLLFNBQVM7WUFDVixPQUFPLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDckM7WUFDSSxPQUFPLEtBQUssQ0FBQztJQUNyQixDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLENBQVUsRUFBRSxDQUFVOztJQUN2QyxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDeEIsSUFBSSxDQUFDLElBQUksSUFBSTtZQUFFLE9BQU8sZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDMUMsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQztZQUN4QixNQUFNLENBQUMsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsSUFBSSxDQUFDO2dCQUFFLE9BQU8sQ0FBQyxPQUFDLENBQUMsRUFBRSxtQ0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxvQkFBb0I7WUFDcEUsT0FBTyxDQUFDLE9BQUMsQ0FBQyxJQUFJLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLG9CQUFvQjtRQUNqRixDQUFDO1FBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1lBQ3hCLElBQUksQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsRUFBRTtnQkFBRSxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNuRSxPQUFPLENBQUMsT0FBQyxDQUFDLElBQUksbUNBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssQ0FBQyxPQUFDLENBQUMsSUFBSSxtQ0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUN6RSxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsQ0FBQyxNQUFNO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDeEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNyRCxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0lBRUQsTUFBTSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3JCLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO1FBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxDQUFDO0lBRTdELElBQUksT0FBTyxDQUFDLEtBQUssU0FBUyxJQUFJLE9BQU8sQ0FBQyxLQUFLLFNBQVMsRUFBRSxDQUFDO1FBQ25ELE9BQU8sTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMvRCxDQUFDO0lBRUQsT0FBTyxNQUFNLENBQUMsQ0FBQyxhQUFELENBQUMsY0FBRCxDQUFDLEdBQUksRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLEtBQUssTUFBTSxDQUFDLENBQUMsYUFBRCxDQUFDLGNBQUQsQ0FBQyxHQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNFLENBQUM7QUFFRCxTQUFTLE9BQU8sQ0FBQyxNQUFlLEVBQUUsYUFBc0I7O0lBQ3BELElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztRQUFFLE9BQU8sV0FBVyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsQ0FBQztJQUU3RSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQztRQUN4QixNQUFNLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ25FLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVELENBQUM7SUFFRCxJQUFJLGtCQUFrQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUM7UUFDN0IsTUFBTSxFQUFFLEdBQUcsQ0FBQyxZQUFNLENBQUMsRUFBRSxtQ0FBSSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUMzQyxNQUFNLElBQUksR0FBRyxDQUFDLFlBQU0sQ0FBQyxJQUFJLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQy9DLEtBQUssTUFBTSxDQUFDLElBQUksYUFBYSxFQUFFLENBQUM7WUFDNUIsSUFBSSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQUUsQ0FBQztnQkFDeEIsTUFBTSxDQUFDLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUMxQixJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDekUsQ0FBQztpQkFBTSxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3RHLENBQUM7aUJBQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDcEtELCtCQUErQjtBQUN4QixNQUFNLFNBQVMsR0FBRztJQUNyQixTQUFTLEVBQUUsQ0FBQztJQUNaLE1BQU0sRUFBRSxDQUFDO0lBQ1QsTUFBTSxFQUFFLENBQUM7SUFDVCxRQUFRLEVBQUUsQ0FBQztJQUNYLFFBQVEsRUFBRSxDQUFDO0lBQ1gsV0FBVyxFQUFFLENBQUM7SUFDZCxRQUFRLEVBQUUsQ0FBQztDQUNMLENBQUM7QUFJSixNQUFNLGNBQWMsR0FBRztJQUMxQixHQUFHLENBQUMsRUFBTzs7UUFDUCxPQUFPLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRSwwQ0FBRSxXQUFXLGtEQUFJLG1DQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDMUQsQ0FBQztJQUNELFlBQVksQ0FBQyxJQUFjO1FBQ3ZCLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDdkUsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFjO1FBQ3JCLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDcEcsQ0FBQztDQUNKLENBQUM7QUEwQ0YseUJBQXlCO0FBQ2xCLE1BQU0sSUFBSTtJQUNiLE1BQU0sS0FBSyxHQUFHO1FBQ1YsT0FBUSxNQUFjLENBQUMsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxvRUFBb0U7SUFDcEUsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFXO1FBQzNCLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBSSxHQUFRO1FBQ3JCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDSjtBQUVELGlDQUFpQztBQUMxQixNQUFNLFNBQVM7SUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsaUJBQXlCLEVBQUUsRUFBVSxFQUFFLE9BQWdCO1FBQy9FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsaUJBQXlCLEVBQUUsT0FBZ0I7UUFDckUsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBeUIsRUFBRSxRQUFnQjtRQUM3RCxNQUFNLEdBQUcsR0FBRyxhQUFhLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDL0QsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFZO1FBQzdCLE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUM1QixtQkFBMkIsRUFDM0IsUUFBZ0IsRUFDaEIsc0JBQThCLEVBQzlCLG9CQUE0QixFQUM1QixVQUFvQjtRQUVwQixNQUFNLEdBQUcsR0FBRztZQUNSLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM1RSxlQUFlLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUcsWUFBWSxFQUFFLHNCQUFzQjtZQUNwQyxXQUFXLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsQ0FBQztZQUN0RyxDQUFDO1NBQ0csQ0FBQztRQUVULE1BQU0sUUFBUSxHQUFHLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7Q0FDSjtBQUVELHlCQUF5QjtBQUNsQixNQUFNLGlCQUFpQjtJQUMxQixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQU87O1FBQ3ZCLElBQUksQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsSUFBSSwwQ0FBRSxNQUFNLDBDQUFFLEtBQUssa0RBQUksQ0FBQztZQUMxQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25ELENBQUM7UUFBQyxNQUFNLENBQUM7WUFDTCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBTyxFQUFFLFNBQWlCOztRQUN6QyxNQUFNLENBQUMsR0FBRyxvQkFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsU0FBUyxDQUFDLDBDQUFFLFFBQVEsa0RBQUksQ0FBQztRQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsTUFBTSxDQUFDLCtCQUErQixDQUNsQyxFQUFtQixFQUNuQixPQUFlLEVBQ2YsV0FBbUIsRUFDbkIsV0FBb0IsSUFBSTs7UUFFeEIsTUFBTSxHQUFHLEdBQUcsb0JBQUUsQ0FBQyxFQUFFLDBDQUFFLElBQUksMENBQUUsR0FBRyxtREFBRyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU87UUFDakIsTUFBTSxPQUFPLEdBQUcsZUFBRyxDQUFDLFFBQVEsMENBQUUsR0FBRyxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFDckIsSUFBSSxDQUFDO1lBQ0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDMUMsSUFBSSxDQUFDO3dCQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDakUsQ0FBQztnQkFDRCw0RUFBNEU7WUFDaEYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVGOzs7TUFHRTtJQUNELE1BQU0sQ0FBQyxpQ0FBaUMsQ0FDcEMsRUFBbUIsRUFDbkIsT0FBZSxFQUNmLFdBQW1CLEVBQ25CLFlBQStCLEVBQy9CLFdBQW9CLElBQUk7O1FBRXhCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFFdEUsTUFBTSxHQUFHLEdBQUcsb0JBQUUsQ0FBQyxFQUFFLDBDQUFFLElBQUksMENBQUUsR0FBRyxtREFBRyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU87UUFFakIsTUFBTSxPQUFPLEdBQUcsZUFBRyxDQUFDLFFBQVEsMENBQUUsR0FBRyxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFckIsWUFBWTthQUNQLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBNkIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFTyxNQUFNLENBQUMsb0JBQW9CLENBQy9CLE9BQTZCLEVBQzdCLElBQVk7O1FBRVosMkJBQTJCO1FBQzNCLE1BQU0sTUFBTSxHQUFHLG1CQUFPLENBQUMsUUFBUSxFQUFDLEdBQUcsbURBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxNQUFNO1lBQUUsT0FBTyxNQUFNLENBQUM7UUFFMUIsb0RBQW9EO1FBQ3BELElBQUksS0FBdUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFOztZQUMzQixJQUFJLFFBQUMsQ0FBQyxPQUFPLGlEQUFJLE1BQUssSUFBSTtnQkFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVPLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUE2QixFQUFFLFFBQWlCOztRQUNoRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUFFLE9BQU87UUFDckQsSUFBSSxDQUFDO1lBQ0QsMkJBQTJCO1lBQzNCLE1BQU0sT0FBTyxHQUFHLGFBQU8sQ0FBQyxXQUFXLHVEQUFJLENBQUM7WUFDeEMsSUFBSSxPQUFPLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLFFBQVE7Z0JBQUUsT0FBTztZQUNqRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFBQyxNQUFNLENBQUM7WUFDTCxXQUFXO1FBQ2YsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQUVNLE1BQU0sVUFBVTtJQUNuQixNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBTyxFQUFFLElBQWE7O1FBQzNDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTztRQUNsQixNQUFNLElBQUksR0FBRyxRQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsVUFBVSxtREFBRyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25CLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDSixJQUFJLENBQUM7Z0JBQ0QsY0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLEVBQUUsMENBQUUsYUFBYSxrREFBSSxDQUFDO1lBQzlCLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQUVELCtCQUErQjtBQUN4QixNQUFNLGdCQUFnQjtJQUN6QixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxXQUFtQixFQUFFLE9BQWdCOztRQUM1RCxNQUFNLElBQUksR0FBRyxRQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsVUFBVSxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxVQUFVLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNMLFlBQVk7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsb0NBQW9DO0lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBTyxFQUFFLFdBQW1CLEVBQUUsUUFBaUI7O1FBQzlELE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxVQUFVLG1EQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9CLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFPLEVBQUUsV0FBbUIsRUFBRSxVQUFtQjs7UUFDaEUsTUFBTSxJQUFJLEdBQUcsUUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNMLFlBQVk7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFPLEVBQUUsV0FBbUIsRUFBRSxTQUF3QjtRQUNoRSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0IsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFPLEVBQUUsVUFBa0IsRUFBRSxRQUFnQixFQUFFLFdBQW1CO1FBQ3hGLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFO1lBQ2pELE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCwrQ0FBK0M7SUFDL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUE2QjtRQUM5QyxPQUFPLGFBQWEsSUFBSSxPQUFPLElBQUksT0FBUSxPQUF3QyxDQUFDLFdBQVcsS0FBSyxVQUFVLENBQUM7SUFDbkgsQ0FBQztDQUNKO0FBU00sTUFBTSxrQkFBa0I7SUFDM0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQ3ZCLGFBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLEdBQWEsRUFDYixPQUE0Rjs7UUFFNUYsTUFBTSxRQUFRLEdBQUcsR0FBRzthQUNmLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsa0JBQWtCLGFBQWEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7YUFDbEYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWQsTUFBTSxTQUFTLEdBQUc7O2dDQUVNLFdBQVc7WUFDL0IsUUFBUTs7O2dCQUdKLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFaEIsTUFBTSxhQUFhLEdBQVE7WUFDdkIsZ0JBQWdCLEVBQUUsYUFBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGdCQUFnQixtQ0FBSSxJQUFJO1lBQ25ELGlCQUFpQixFQUFFLGFBQWE7WUFDaEMsV0FBVyxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzFELFVBQVUsRUFBRSxhQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsVUFBVSxtQ0FBSSxJQUFJO1NBQzFDLENBQUM7UUFFRixJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxhQUFhO1lBQUUsYUFBYSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRWhGLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBbUIsQ0FBQztJQUNuRixDQUFDO0NBQ0o7QUFFRCx5Q0FBeUM7QUFDbEMsTUFBTSxhQUFhO0lBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQzNCLGFBQXFCLEVBQ3JCLE1BQWMsRUFDZCxXQUFtQjs7UUFFbkIsTUFBTSxPQUFPLEdBQUcsWUFBWSxNQUFNLFlBQVksV0FBVyxFQUFFLENBQUM7UUFDNUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sR0FBRyxHQUFHLFNBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxRQUFRLDBDQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRyxNQUFNLENBQXVCLENBQUM7UUFDL0MsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQ3hCLGFBQXFCLEVBQ3JCLE1BQWMsRUFDZCxJQUFZLEVBQ1osS0FBZ0M7UUFFaEMsTUFBTSxHQUFHLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLElBQUksSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDakYsQ0FBQztDQUNKO0FBRU0sTUFBTSxRQUFRO0lBQ2pCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFPLEVBQUUsYUFBcUIsRUFBRSxTQUFTLEdBQUcsSUFBSTtRQUN0RSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7O1lBQzNCLE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxZQUFZLG1EQUFHLGFBQWEsQ0FBK0MsQ0FBQztZQUM3RixJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoQyxNQUFNLEdBQUcsR0FBRyxnQkFBSSxDQUFDLFFBQVEsb0RBQUksMENBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsRUFBRTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7WUFDakIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7O2dCQUNsQixJQUFJLElBQUk7b0JBQUUsT0FBTztnQkFDakIsTUFBTSxDQUFDLEdBQUcsZ0JBQUksQ0FBQyxRQUFRLG9EQUFJLDBDQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxFQUFFLEVBQUUsQ0FBQztvQkFBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUFDLE9BQU8sRUFBRSxDQUFDO29CQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQztZQUVGLElBQUksQ0FBQztnQkFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDN0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV4QixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUVNLE1BQU0sV0FBVztJQUNwQixNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBTyxFQUFFLGFBQXFCOztRQUNuRCxPQUFPLENBQUMsY0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsYUFBYSxDQUFDLG1DQUFJLElBQUksQ0FBUSxDQUFDO0lBQzlELENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQU8sRUFBRSxhQUFxQjs7UUFDakQsTUFBTSxDQUFDLEdBQUcsc0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLDBDQUFFLFFBQVEsa0RBQUksMENBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLEVBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxFQUFFLEtBQUksQ0FBQyxDQUFDLENBQUMsVUFBVTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFpQixFQUFFLElBQUksRUFBRSxPQUFDLENBQUMsSUFBSSxtQ0FBSSxJQUFJLEVBQUUsQ0FBQztJQUNsRyxDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFPLEVBQUUsYUFBcUIsRUFBRSxLQUFlOztRQUMzRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTztRQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dCQUM1QixJQUFJLEVBQUUsV0FBSyxDQUFDLElBQUksbUNBQUksU0FBUzthQUN6QixDQUFDLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQW1CLEVBQUUsQ0FBbUI7UUFDdkQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMzQixPQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoRyxDQUFDO0NBQ0o7QUFFRCxnRUFBZ0U7QUFDekQsTUFBTSxZQUFZO0lBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUNwQixhQUFxQixFQUNyQixRQUFnQixFQUNoQixhQUFhLEdBQUcsU0FBUzs7UUFFekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXJCLCtGQUErRjtRQUMvRixNQUFNLE1BQU0sR0FBRyxZQUFZLGFBQWEsb0ZBQW9GLENBQUM7UUFDN0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFdEUsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFlBQVksRUFBRSxDQUFDO1lBQ3JCLE9BQU87Z0JBQ0gsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDeEMsVUFBVSxFQUFFLFlBQVk7Z0JBQ3hCLElBQUksRUFBRSxVQUFJLENBQUMsUUFBUSxtQ0FBSSxJQUFJO2FBQzlCLENBQUM7UUFDTixDQUFDO1FBQ0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNsQyxVQUFVLEVBQUUsTUFBTTtnQkFDbEIsSUFBSSxFQUFFLFVBQUksQ0FBQyxJQUFJLG1DQUFJLElBQUk7YUFDMUIsQ0FBQztRQUNOLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFFRCwrQkFBK0I7QUFDeEIsTUFBTSxlQUFlO0lBQ3BCLCtDQUErQztJQUMvQyxNQUFNLENBQUMsZ0JBQWdCOztRQUNmLElBQUksQ0FBQztZQUNHLE1BQU0sRUFBRSxHQUFHLGtDQUFJLENBQUMsR0FBRywwQ0FBRSxPQUFPLDBDQUFFLGdCQUFnQixrREFBSSwwQ0FBRSxZQUFZLDBDQUFFLE1BQTRCLENBQUM7WUFDL0YsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNqRCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDcEIsQ0FBQztJQUNULENBQUM7SUFFRCw2Q0FBNkM7SUFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUI7UUFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUV2Qiw4Q0FBOEM7UUFDOUMsTUFBTSxRQUFRLEdBQUc7Ozs7Ozs7OytGQVE4RCxNQUFNOzs7Ozt5QkFLNUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQixNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFOztZQUFDLFFBQUM7Z0JBQ2hDLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQUMsQ0FBQyxRQUFRLENBQUMsbUNBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBVzthQUNoQyxDQUFDO1NBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELG1GQUFtRjtJQUNuRixNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsU0FBbUI7UUFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FDUjtBQUVELHdDQUF3QztBQUNqQyxNQUFNLGdCQUFnQjtJQUN6Qix5REFBeUQ7SUFDekQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFtQixFQUFFLFdBQW1CLEVBQUUsV0FBcUI7O1FBQ2pGLElBQUksQ0FBQztZQUNELE1BQU0sSUFBSSxHQUFHLFFBQUUsQ0FBQyxVQUFVLG1EQUFHLFdBQVcsQ0FBMkMsQ0FBQztZQUNwRixVQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsY0FBYyxxREFBRyxXQUFXLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxNQUFNLENBQUMsYUFBYSxDQUNoQixFQUFtQixFQUNuQixXQUFtQixFQUNuQixNQUFjLEVBQ2QsVUFBa0IsRUFDbEIsZUFBdUIsRUFDdkIsUUFBZ0IsRUFDaEIsU0FBaUIsRUFDakIsZUFBd0IsSUFBSTs7UUFFNUIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsUUFBRSxDQUFDLFVBQVUsbURBQUcsV0FBVyxDQUEyQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxLQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsYUFBYTtnQkFBRSxPQUFPO1lBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELDBGQUEwRjtJQUMxRixNQUFNLENBQUMsOEJBQThCLENBQUMsRUFBbUIsRUFBRSxjQUFzQixTQUFTO1FBQ3RGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUMxQixNQUFNLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyx3Q0FBd0MsQ0FBQztRQUV4RCxNQUFNLFFBQVEsR0FBRzs7Ozs7Ozs7Ozs7O1NBWWhCLENBQUM7UUFFRixNQUFNLFNBQVMsR0FBRzs7Ozs7OztTQU9qQixDQUFDO1FBRUYsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwSCxDQUFDO0NBQ0o7QUFFTSxNQUFNLGNBQWM7SUFDdkI7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLGlCQUFpQixDQUNwQixnQkFBeUMsRUFDekMsYUFBc0I7UUFFdEIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFxQixDQUFDO1FBRXpFLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDakIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUE4QixDQUFDO1lBQ2xGLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU87WUFDekIsYUFBYSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBaUMsQ0FBQztRQUV0RixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFbkMsTUFBTSxjQUFjLEdBQUcsR0FBRyxhQUFhLGlCQUFpQixDQUFDO1FBQ3pELElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQW1CLENBQUM7UUFFbEQsNERBQTREO1FBQzVELElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxQyxPQUFPO1FBQ1gsQ0FBQztRQUVELDJDQUEyQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFN0IseURBQXlEO1FBQ3pELElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQixTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxlQUFlLENBQ25CLDJEQUEyRCxFQUMzRCxjQUFjLENBQ2pCLENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELGlEQUFpRDtRQUNqRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUzQyw4Q0FBOEM7UUFDOUMsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDWCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxlQUFlLENBQ25CLDJEQUEyRCxFQUMzRCxjQUFjLENBQ2pCLENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELGdFQUFnRTtRQUNoRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDMUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7OztBQ3RtQkQsc0JBQXNCO0FBQ2YsTUFBTSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFLGdCQUFnQjtJQUN4QixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsa0JBQWtCO1FBQ3RCLGtCQUFrQixFQUFFLG9CQUFvQjtRQUN4QywyQkFBMkIsRUFBRSw2QkFBNkI7S0FDN0Q7SUFDRCxPQUFPLEVBQUU7UUFDTCxVQUFVLEVBQUUsU0FBUztLQUN4QjtDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ1hKLE1BQU0sT0FBTyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE1BQU0sRUFBRTtRQUNKLEVBQUUsRUFBRSxXQUFXO1FBQ2YsZ0JBQWdCLEVBQUUsa0JBQWtCO1FBQ3BDLE9BQU8sRUFBRSxTQUFTO0tBQ3JCO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDUEosTUFBTSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFLFNBQVM7SUFDakIsTUFBTSxFQUFFO1FBQ0osRUFBRSxFQUFFLFdBQVc7UUFDZixrQkFBa0IsRUFBRSxvQkFBb0I7UUFDeEMsT0FBTyxFQUFFLFNBQVM7S0FDckI7Q0FDSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ0xKLE1BQU0sb0JBQW9CLEdBQUc7SUFDaEMsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsb0JBQW9CO1FBQ3hCLG1CQUFtQixFQUFFLDRCQUE0QjtLQUNwRDtDQUNLLENBQUM7QUFFWCwyQ0FBMkM7QUFDcEMsU0FBUyx1QkFBdUIsQ0FBQyxRQUF1QjtJQUMzRCxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQzNCLElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUF1QixDQUFDO1FBQzFELElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMzRSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ0wsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztBQUNMLENBQUM7QUFFRCxrRkFBa0Y7QUFDM0UsU0FBUyxtQkFBbUIsQ0FBQyxZQUEyQjs7SUFDM0QsSUFBSSxDQUFDLG1CQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsS0FBSywwQ0FBRSxNQUFNO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDNUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUNqQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLFlBQVksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNqQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLE9BQUMsQ0FBQyxTQUFTLG1DQUFJLEVBQUUsRUFBRSxDQUFDO1lBQ2hDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSztnQkFBRSxTQUFTO1lBQ3ZCLDREQUE0RDtZQUM1RCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3pDLENBQUM7SUFDTCxDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLENBQUM7Ozs7Ozs7VUNsQ0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNMbUY7QUFDbUI7QUFDcUI7QUFDbkU7QUFDQTtBQUNBO0FBR3hELE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxPQUFPLEVBQWdDLENBQUM7QUFDNUUsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLE9BQU8sRUFBaUMsQ0FBQztBQUV0RSxLQUFLLFVBQVUsZ0NBQWdDLENBQUMsZ0JBQXlDO0lBQzVGLE1BQU0sV0FBVyxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQ3RELElBQUksaUJBQWlCLENBQUMsV0FBVyxDQUFDO1FBQUUsT0FBTztJQUUzQyw4QkFBOEIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUM1QyxNQUFNLE1BQU0sR0FBRyxNQUFNLHNCQUFzQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3pELGlCQUFpQixDQUFDLFdBQVcsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2QyxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDMUMsQ0FBQztBQUVNLEtBQUssVUFBVSwwQkFBMEIsQ0FBQyxnQkFBeUM7SUFDdEYsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDdEQsSUFBSSxpQkFBaUIsQ0FBQyxXQUFXLENBQUM7UUFBRSxPQUFPO0lBRTNDLE1BQU0sTUFBTSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDekQsaUJBQWlCLENBQUMsV0FBVyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzNDLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFdBQTRCOztJQUNuRCxNQUFNLFFBQVEsR0FBRyx1QkFBVyxDQUFDLEVBQUUsMENBQUUsV0FBVyxrREFBSSxDQUFDO0lBQ2pELElBQUksUUFBUSxLQUFLLHFEQUFTLENBQUMsV0FBVztRQUFFLE9BQU8sSUFBSSxDQUFDO0lBRXBELE1BQU0sWUFBWSxHQUFHLGlCQUFXLENBQUMsRUFBRSwwQ0FBRSxZQUFZLENBQUM7SUFDbEQsT0FBTyxRQUFRLEtBQUsscURBQVMsQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLFlBQVksSUFBSSxPQUFPLFlBQVksQ0FBQyxjQUFjLEtBQUssVUFBVSxDQUFDLENBQUM7QUFDakgsQ0FBQztBQUVELEtBQUssVUFBVSxzQkFBc0IsQ0FBQyxXQUE0Qjs7SUFDOUQsTUFBTSxxQkFBcUIsR0FBRywrQkFBK0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUMzRSxNQUFNLElBQUksR0FBRyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLFlBQVksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDakcsTUFBTSxHQUFHLEdBQUcsVUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFFBQVEsb0RBQUksQ0FBQztJQUMvQixNQUFNLFVBQVUsR0FBRyx3RUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxnREFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUU1RSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDZCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsSUFBSSxDQUFDO1FBQ0QsTUFBTSxZQUFZLEdBQUcsa0ZBQW9CLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDO1FBQ3JFLE1BQU0sR0FBRyxHQUFHLE1BQU0scURBQVMsQ0FBQyxjQUFjLENBQUMsa0ZBQW9CLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxZQUFZLFlBQVksRUFBRSxDQUFDLENBQUM7UUFDaEgsTUFBTSxRQUFRLEdBQUksR0FBK0IsQ0FBQyxZQUFZLENBQWtCLENBQUM7UUFDakYsT0FBTyx5RkFBdUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ0wsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztBQUNMLENBQUM7QUFFRCxTQUFTLGlCQUFpQixDQUFDLFdBQTRCLEVBQUUsTUFBaUM7O0lBQ3RGLE1BQU0sb0JBQW9CLEdBQUcsdUJBQXVCLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3RFLElBQUksQ0FBQyxPQUFNLGFBQU4sTUFBTSx1QkFBTixNQUFNLENBQUUsUUFBUSxHQUFFLENBQUM7UUFDcEIsSUFBSSxvQkFBb0IsRUFBRSxDQUFDO1lBQ3ZCLHVCQUF1QixDQUFDLFdBQVcsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO1lBQzNELHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUNoRCxDQUFDO1FBQ0QsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLGlCQUFpQixHQUFHLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ2xFLE1BQU0sWUFBWSxHQUE2QixNQUFNLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDbEYsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ2hCLElBQUksb0JBQW9CLEVBQUUsQ0FBQztZQUN2Qix1QkFBdUIsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CLENBQUMsQ0FBQztZQUMzRCx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDaEQsQ0FBQztRQUNELE9BQU87SUFDWCxDQUFDO0lBRUQsc0dBQXNHO0lBQ3RHLElBQUksb0JBQW9CO1FBQUUsdUJBQXVCLENBQUMsV0FBVyxFQUFFLG9CQUFvQixDQUFDLENBQUM7SUFDckYsdUJBQXVCLENBQUMsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ25ELHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxDQUFDLENBQUM7SUFFdkQseURBQXlEO0lBQ3pELE1BQU0sTUFBTSxHQUFhLEVBQUUsQ0FBQztJQUM1QixLQUFLLE1BQU0sSUFBSSxJQUFJLGtCQUFZLENBQUMsS0FBSyxtQ0FBSSxFQUFFLEVBQUUsQ0FBQztRQUMxQyxJQUFJLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDM0MsS0FBSyxNQUFNLEtBQUssSUFBSSxVQUFJLENBQUMsU0FBUyxtQ0FBSSxFQUFFLEVBQUUsQ0FBQztnQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO29CQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDcEQsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxjQUFjLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxrQkFBWSxDQUFDLE9BQU8sbUNBQUksRUFBRSxDQUFDO0lBQzNFLGNBQWMsQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsV0FBVyxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQzFHLENBQUM7QUFFRCxzSEFBc0g7QUFDdEgsU0FBUyx1QkFBdUIsQ0FBQyxXQUE0QixFQUFFLFlBQTBCOztJQUNyRixNQUFNLGtCQUFrQixHQUFHLElBQUksR0FBRyxFQUFVLENBQUM7SUFDN0MsS0FBSyxNQUFNLENBQUMsSUFBSSxrQkFBWSxDQUFDLE9BQU8sbUNBQUksRUFBRTtRQUFFLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN0RSxLQUFLLE1BQU0sSUFBSSxJQUFJLGtCQUFZLENBQUMsS0FBSyxtQ0FBSSxFQUFFLEVBQUUsQ0FBQztRQUMxQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLFVBQUksQ0FBQyxTQUFTLG1DQUFJLEVBQUU7WUFBRSxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDcEUsQ0FBQztJQUNELGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLDREQUFnQixDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDL0csQ0FBQztBQUVELFNBQVMsV0FBVyxDQUFDLFdBQTRCLEVBQUUsVUFBd0I7SUFDdkUsSUFBSSxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsTUFBTSxLQUFLLENBQUM7UUFBRSxPQUFPLElBQUksQ0FBQztJQUN4RCxLQUFLLE1BQU0sU0FBUyxJQUFJLFVBQVUsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sTUFBTSxHQUFHLDZFQUFrQixDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEUsSUFBSSxDQUFDLDRFQUFpQixDQUFDLE1BQU0sRUFBRSxTQUFTLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztJQUM1RCxDQUFDO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsV0FBNEIsRUFBRSxNQUFpQztJQUNyRixJQUFJLENBQUMsT0FBTSxhQUFOLE1BQU0sdUJBQU4sTUFBTSxDQUFFLFFBQVE7UUFBRSxPQUFPO0lBQzlCLE1BQU0saUJBQWlCLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDbEUsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBNkIsQ0FBQztJQUNwRixNQUFNLE1BQU0sR0FBRyxxRkFBbUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNqRCxLQUFLLE1BQU0sYUFBYSxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ2pDLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxhQUFhLEVBQUUsQ0FBQyxHQUE0QixFQUFFLEVBQUUsQ0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3pILENBQUM7QUFDTCxDQUFDO0FBRUQsU0FBUyw4QkFBOEIsQ0FBQyxXQUE0QjtJQUNoRSxNQUFNLHFCQUFxQixHQUFHLCtCQUErQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzNFLElBQUksQ0FBQyxxQkFBcUI7UUFBRSxPQUFPO0lBRW5DLHFCQUFxQixDQUFDLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxLQUFLLEVBQUUsR0FBNEIsRUFBRSxFQUFFO1FBQzdGLE1BQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDLGNBQWMsRUFBRSxDQUFDO1FBQ2hELE1BQU0sTUFBTSxHQUFHLE1BQU0sc0JBQXNCLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUNoRSxpQkFBaUIsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUM5QyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNqRCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUMxQixXQUE0QixFQUM1QixhQUFxQixFQUNyQixPQUErRDtJQUUvRCxJQUFJLGVBQWUsR0FBRyx1QkFBdUIsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDL0QsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ25CLGVBQWUsR0FBRyxJQUFJLEdBQUcsRUFBVSxDQUFDO1FBQ3BDLHVCQUF1QixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELElBQUksZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7UUFBRSxPQUFPO0lBRS9DLE1BQU0sU0FBUyxHQUFHLFdBQVcsQ0FBQyxZQUFZLENBQUMsYUFBYSxDQUFDLENBQUM7SUFDMUQsSUFBSSxDQUFDLFNBQVM7UUFBRSxPQUFPO0lBRXZCLElBQUksQ0FBQztRQUNELFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDL0IsZUFBZSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ0wsU0FBUztJQUNiLENBQUM7QUFDTCxDQUFDO0FBRUQsa0dBQWtHO0FBQ2xHLFNBQVMsK0JBQStCLENBQUMsV0FBNEI7O0lBQ2pFLElBQUksQ0FBQztRQUNELE1BQU0sVUFBVSxHQUFHLDZCQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsSUFBSSwwQ0FBRSxNQUFNLDBDQUFFLGFBQWEsa0RBQUksQ0FBQztRQUNoRSxRQUFRLFVBQVUsRUFBRSxDQUFDO1lBQ2pCLEtBQUssNkRBQU8sQ0FBQyxNQUFNO2dCQUNmLE9BQU8sNkRBQU8sQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVO1lBQ3hELEtBQUssNkRBQU8sQ0FBQyxNQUFNO2dCQUNmLE9BQU8sNkRBQU8sQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyw2QkFBNkI7WUFDekUsS0FBSyw2REFBTyxDQUFDLE1BQU07Z0JBQ2YsT0FBTyw2REFBTyxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDLFlBQVk7WUFDMUQ7Z0JBQ0ksT0FBTyxTQUFTLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFBQyxNQUFNLENBQUM7UUFDTCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY29uZGl0aW9uLmV2YWx1YXRvci50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NybS5jb3JlLnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0FjY291bnQuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0NvbXBhbnkuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL01hbmRhdG9yeUNvbmZpZy5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZmVhdHVyZXMvZHluYW1pY01hbmRhdG9yeS9keW5hbWljTWFuZGF0b3J5RW5naW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmRpdGlvbiwgTG9va3VwQ29tcGFyYWJsZSwgT3BlcmF0b3IsIFV0aWwgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZnVuY3Rpb24gaXNNdWx0aVNlbGVjdEFycmF5KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgQXJyYXk8bnVtYmVyIHwgc3RyaW5nPiB7XHJcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNMb29rdXBDb21wYXJhYmxlKHY6IHVua25vd24pOiB2IGlzIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgcmV0dXJuICEhdiAmJiB0eXBlb2YgdiA9PT0gXCJvYmplY3RcIiAmJiAoXCJpZFwiIGluICh2IGFzIGFueSkgfHwgXCJuYW1lXCIgaW4gKHYgYXMgYW55KSB8fCBcImVudGl0eVR5cGVcIiBpbiAodiBhcyBhbnkpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdG9HdWlkT3JOdWxsKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBjb25zdCBzID0gU3RyaW5nKHZhbHVlID8/IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezEyfSQvLnRlc3QocykgPyBzIDogbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNOdWxsaXNoT3JFbXB0eSh2OiB1bmtub3duKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHYudHJpbSgpID09PSBcIlwiO1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHJldHVybiB2Lmxlbmd0aCA9PT0gMDtcclxuICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUodikpIHJldHVybiAhdi5pZCAmJiAhdi5uYW1lOyAvLyBib3RoIGVtcHR5XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVNjYWxhcih4OiB1bmtub3duKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGcgPSB0b0d1aWRPck51bGwoeCk7XHJcbiAgICBpZiAoZykgcmV0dXJuIGBndWlkOiR7Z31gO1xyXG4gICAgY29uc3QgbiA9IE51bWJlcih4KTtcclxuICAgIGlmICghTnVtYmVyLmlzTmFOKG4pKSByZXR1cm4gYG51bToke259YDtcclxuICAgIGlmICh0eXBlb2YgeCA9PT0gXCJib29sZWFuXCIpIHJldHVybiBgYm9vbDoke3h9YDtcclxuICAgIHJldHVybiBgc3RyOiR7U3RyaW5nKHggPz8gXCJcIikudG9Mb3dlckNhc2UoKX1gO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNMb29rdXBBcnJheSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFhybS5Mb29rdXBWYWx1ZVtdIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcclxuICAgICAgICB2YWx1ZS5sZW5ndGggPiAwICYmXHJcbiAgICAgICAgdHlwZW9mIHZhbHVlWzBdID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgdmFsdWVbMF0gIT09IG51bGwgJiZcclxuICAgICAgICBcImlkXCIgaW4gKHZhbHVlWzBdIGFzIG9iamVjdCkgJiZcclxuICAgICAgICB0eXBlb2YgKHZhbHVlWzBdIGFzIFhybS5Mb29rdXBWYWx1ZSkuaWQgPT09IFwic3RyaW5nXCJcclxuICAgICk7XHJcbn1cclxuLyoqIFJlYWQgYSB2YWx1ZSBmcm9tIHRoZSBmb3JtOyBzdXBwb3J0cyBsb29rdXAgcHJvamVjdGlvbnMgdmlhIGRvdC1ub3RhdGlvbi4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRBdHRyaWJ1dGVWYWx1ZShmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LCBmaWVsZFBhdGg6IHN0cmluZyk6IHVua25vd24ge1xyXG4gICAgY29uc3QgW2xvZ2ljYWxOYW1lLCBwcm9qZWN0aW9uXSA9IGZpZWxkUGF0aC5zcGxpdChcIi5cIiwgMik7XHJcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUobG9naWNhbE5hbWUpO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUgfHwgdHlwZW9mIGF0dHJpYnV0ZS5nZXRWYWx1ZSAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IHJhdyA9IGF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xyXG5cclxuICAgIC8vIExvb2t1cCAvIFBhcnR5bGlzdFxyXG4gICAgaWYgKGlzTG9va3VwQXJyYXkocmF3KSkge1xyXG4gICAgICAgIGNvbnN0IGx2ID0gcmF3WzBdIGFzIFhybS5Mb29rdXBWYWx1ZSAmIHsgZW50aXR5VHlwZT86IHN0cmluZyB9O1xyXG4gICAgICAgIGNvbnN0IG9iajogTG9va3VwQ29tcGFyYWJsZSA9IHtcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKGx2LmlkKSxcclxuICAgICAgICAgICAgbmFtZTogbHYubmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlOiBsdi5lbnRpdHlUeXBlID8/IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHByb2plY3Rpb24pIHtcclxuICAgICAgICAgICAgc3dpdGNoIChwcm9qZWN0aW9uLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJpZFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouaWQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwibmFtZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubmFtZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJlbnRpdHl0eXBlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5lbnRpdHlUeXBlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmo7IC8vIGRlZmF1bHQ6IG9iamVjdFxyXG4gICAgfVxyXG5cclxuICAgIC8vIE11bHRpLVNlbGVjdCBPcHRpb25TZXRcclxuICAgIGlmIChpc011bHRpU2VsZWN0QXJyYXkocmF3KSkgcmV0dXJuIHJhdztcclxuXHJcbiAgICAvLyBQcmltaXRpdmVcclxuICAgIHJldHVybiByYXcgYXMgdW5rbm93bjtcclxufVxyXG5cclxuLyoqIEV2YWx1YXRlIHNpbmdsZSBjb25kaXRpb24gYWdhaW5zdCBhY3R1YWwgdmFsdWUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUNvbmRpdGlvbihhY3R1YWw6IHVua25vd24sIGNvbmRpdGlvbjogQ29uZGl0aW9uKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBvcCA9IChjb25kaXRpb24ub3BlcmF0b3IgfHwgXCJcIikudG9Mb3dlckNhc2UoKSBhcyBPcGVyYXRvcjtcclxuICAgIGNvbnN0IHZhbCA9IChjb25kaXRpb24gYXMgeyB2YWx1ZT86IHVua25vd24gfSkudmFsdWU7XHJcblxyXG4gICAgc3dpdGNoIChvcCkge1xyXG4gICAgICAgIGNhc2UgXCJlcVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzU21hcnQoYWN0dWFsLCB2YWwpO1xyXG4gICAgICAgIGNhc2UgXCJuZVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gIWVxdWFsc1NtYXJ0KGFjdHVhbCwgdmFsKTtcclxuICAgICAgICBjYXNlIFwiaW5cIjpcbiAgICAgICAgICAgIHJldHVybiBpblNtYXJ0KGFjdHVhbCwgdmFsKTtcbiAgICAgICAgY2FzZSBcIm5vdCBpblwiOlxuICAgICAgICBjYXNlIFwibm90aW5cIjpcbiAgICAgICAgY2FzZSBcIm5vdF9pblwiOlxuICAgICAgICAgICAgcmV0dXJuICFpblNtYXJ0KGFjdHVhbCwgdmFsKTtcbiAgICAgICAgY2FzZSBcImlzbnVsbFwiOlxuICAgICAgICAgICAgcmV0dXJuIGlzTnVsbGlzaE9yRW1wdHkoYWN0dWFsKTtcbiAgICAgICAgY2FzZSBcImlzbm90bnVsbFwiOlxyXG4gICAgICAgIGNhc2UgXCJub3RudWxsXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhaXNOdWxsaXNoT3JFbXB0eShhY3R1YWwpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxzU21hcnQoYTogdW5rbm93biwgYjogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShhKSkge1xyXG4gICAgICAgIGlmIChiID09IG51bGwpIHJldHVybiBpc051bGxpc2hPckVtcHR5KGEpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBjb25zdCBnID0gdG9HdWlkT3JOdWxsKGIpO1xyXG4gICAgICAgICAgICBpZiAoZykgcmV0dXJuIChhLmlkID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IGc7IC8vIEdVSUQgPyBjb21wYXJlIElEXHJcbiAgICAgICAgICAgIHJldHVybiAoYS5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IGIudG9Mb3dlckNhc2UoKTsgLy8gZWxzZSBjb21wYXJlIG5hbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShiKSkge1xyXG4gICAgICAgICAgICBpZiAoYS5pZCAmJiBiLmlkKSByZXR1cm4gYS5pZC50b0xvd2VyQ2FzZSgpID09PSBiLmlkLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiAoYS5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IChiLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGEpICYmIEFycmF5LmlzQXJyYXkoYikpIHtcclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgYXMgPSBuZXcgU2V0KGEubWFwKCh4KSA9PiBub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgICAgICByZXR1cm4gYi5ldmVyeSgoeCkgPT4gYXMuaGFzKG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5hID0gTnVtYmVyKGEpO1xyXG4gICAgY29uc3QgbmIgPSBOdW1iZXIoYik7XHJcbiAgICBpZiAoIU51bWJlci5pc05hTihuYSkgJiYgIU51bWJlci5pc05hTihuYikpIHJldHVybiBuYSA9PT0gbmI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBhID09PSBcImJvb2xlYW5cIiB8fCB0eXBlb2YgYiA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICByZXR1cm4gU3RyaW5nKGEpLnRvTG93ZXJDYXNlKCkgPT09IFN0cmluZyhiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmcoYSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYiA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpblNtYXJ0KGFjdHVhbDogdW5rbm93biwgY2FuZGlkYXRlTGlzdDogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNhbmRpZGF0ZUxpc3QpKSByZXR1cm4gZXF1YWxzU21hcnQoYWN0dWFsLCBjYW5kaWRhdGVMaXN0KTtcclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhY3R1YWwpKSB7XHJcbiAgICAgICAgY29uc3QgY2FuZCA9IG5ldyBTZXQoY2FuZGlkYXRlTGlzdC5tYXAoKHgpID0+IG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgICAgIHJldHVybiBhY3R1YWwuc29tZSgoeCkgPT4gY2FuZC5oYXMobm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShhY3R1YWwpKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSAoYWN0dWFsLmlkID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IChhY3R1YWwubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgdiBvZiBjYW5kaWRhdGVMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbCh2KTtcclxuICAgICAgICAgICAgICAgIGlmICgoZyAmJiBpZCA9PT0gZykgfHwgKCFnICYmIG5hbWUgPT09IHYudG9Mb3dlckNhc2UoKSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9va3VwQ29tcGFyYWJsZSh2KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh2LmlkICYmIGlkID09PSB2LmlkLnRvTG93ZXJDYXNlKCkpIHx8ICh2Lm5hbWUgJiYgbmFtZSA9PT0gdi5uYW1lLnRvTG93ZXJDYXNlKCkpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcXVhbHNTbWFydChhY3R1YWwsIHYpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZUxpc3Quc29tZSgodikgPT4gZXF1YWxzU21hcnQoYWN0dWFsLCB2KSk7XHJcbn1cbiIsIi8vID09PT0gRm9ybVR5cGUgQ29uc3RhbnRzID09PT1cclxuZXhwb3J0IGNvbnN0IEZPUk1fVFlQRSA9IHtcclxuICAgIFVuZGVmaW5lZDogMCxcclxuICAgIENyZWF0ZTogMSxcclxuICAgIFVwZGF0ZTogMixcclxuICAgIFJlYWRPbmx5OiAzLFxyXG4gICAgRGlzYWJsZWQ6IDQsXHJcbiAgICBRdWlja0NyZWF0ZTogNSxcclxuICAgIEJ1bGtFZGl0OiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgRm9ybVR5cGUgPSB0eXBlb2YgRk9STV9UWVBFW2tleW9mIHR5cGVvZiBGT1JNX1RZUEVdO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZvcm1UeXBlSGVscGVyID0ge1xyXG4gICAgZ2V0KGZjOiBhbnkpOiBGb3JtVHlwZSB8IDAge1xyXG4gICAgICAgIHJldHVybiBmYz8udWk/LmdldEZvcm1UeXBlPy4oKSA/PyBGT1JNX1RZUEUuVW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIGlzQ3JlYXRlTGlrZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH0sXHJcbiAgICBpc0VkaXRhYmxlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlVwZGF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyUmVmIHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIiB8IFwidGVhbVwiO1xyXG4gICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gVHlwZXMgc2hhcmVkIGFjcm9zcyBlbmdpbmUgJiBlbnRpdGllcyAtLS0tXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJub3QgaW5cIiB8IFwibm90aW5cIiB8IFwibm90X2luXCIgfCBcImlzbnVsbFwiIHwgXCJpc25vdG51bGxcIiB8IFwibm90bnVsbFwiOyAvLyBhbGlhc2VzXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xyXG4gICAgLyoqIExvZ2ljYWwgbmFtZSAoc3VwcG9ydHMgZG90LW5vdGF0aW9uIGZvciBsb29rdXAgcHJvamVjdGlvbnM6IGUuZy4sIFwicHJpbWFyeWNvbnRhY3RpZC5uYW1lXCIpLiAqL1xyXG4gICAgZmllbGQ6IHN0cmluZztcclxuICAgIG9wZXJhdG9yOiBPcGVyYXRvcjtcclxuICAgIC8qKiBPcHRpb25hbCB2YWx1ZSBmb3IgY29tcGFyaXNvbnMgKG9taXR0ZWQgZm9yIG51bGwtb3BlcmF0b3JzKS4gKi9cclxuICAgIHZhbHVlPzogdW5rbm93bjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSdWxlIHtcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk/OiBzdHJpbmdbXTtcclxuICAgIGNvbmRpdGlvbj86IENvbmRpdGlvbltdOyAvLyBBTkQtY29uanVuY3Rpb247IGVtcHR5L3VuZGVmaW5lZCDih5IgcnVsZSBhbHdheXMgbWF0Y2hlc1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNvbmZpZyB7XHJcbiAgICBkZWZhdWx0Pzogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbi8qKiBMaWdodHdlaWdodCBjb21wYXJhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9va3VwICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICBpZDogc3RyaW5nIHwgbnVsbDtcclxuICAgIG5hbWU6IHN0cmluZyB8IG51bGw7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIENvcmUgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5Ycm07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIExvd2VyY2FzZSwgc3RyaXAgYnJhY2VzOyByZXR1cm5zIGVtcHR5IHN0cmluZyBpZiBmYWxzeSBpbnB1dC4gKi9cclxuICAgIHN0YXRpYyBzYW5pdGl6ZUd1aWQoaWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bmlxdWU8VD4oYXJyOiBUW10pOiBUW10ge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVGhpbiBXZWIgQVBJIHdyYXBwZXIgLS0tLVxyXG5leHBvcnQgY2xhc3MgQXBpQ2xpZW50IHtcclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBjbGVhbklkID0gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWUsIGNsZWFuSWQsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hYbWwoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgZmV0Y2hYbWw6IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGA/ZmV0Y2hYbWw9JHtlbmNvZGVVUklDb21wb25lbnQoZmV0Y2hYbWwudHJpbSgpKX1gO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGV4ZWN1dGUocmVxdWVzdDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgcGFyZW50RW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudElkOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRpb25zaGlwU2NoZW1hTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZElkczogc3RyaW5nW11cclxuICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHJlcSA9IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiB7IGVudGl0eVR5cGU6IHBhcmVudEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChwYXJlbnRJZCkgfSxcclxuICAgICAgICAgICAgcmVsYXRlZEVudGl0aWVzOiByZWxhdGVkSWRzLm1hcCgocmlkKSA9PiAoeyBlbnRpdHlUeXBlOiByZWxhdGVkRW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHJpZCkgfSkpLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXA6IHJlbGF0aW9uc2hpcFNjaGVtYU5hbWUsXHJcbiAgICAgICAgICAgIGdldE1ldGFkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBib3VuZFBhcmFtZXRlcjogbnVsbCwgcGFyYW1ldGVyVHlwZXM6IHt9LCBvcGVyYXRpb25UeXBlOiAyLCBvcGVyYXRpb25OYW1lOiBcIkFzc29jaWF0ZVwiIH07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBGb3JtIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgRm9ybUNvbnRyb2xIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldEN1cnJlbnRJZChmYzogYW55KTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWRSYXcgPSBmYz8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJhdyA/IFV0aWwuc2FuaXRpemVHdWlkKGlkUmF3KSA6IG51bGw7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERpc2FibGUgb3IgZW5hYmxlIGFsbCBkaXNhYmxlYWJsZSBjb250cm9scyBpbnNpZGUgYSB0YWIgc2VjdGlvbiAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkQWxsQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2w6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsOiBzcGVjaWFsIGhhbmRsaW5nIGZvciBzdWJncmlkcywgd2hpY2ggZG8gbm90IHN1cHBvcnQgc2V0RGlzYWJsZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAvKiogICBcclxuICAgKiBkZS9hY3RpdmF0ZSBvbmx5IHRoZSBzcGVjaWZpZWQgY29udHJvbHMgKGJ5IG5hbWUpIGluIGEgc2VjdGlvbi4gICBcclxuICAgKiBEb2VzIG5vdGhpbmcgaWYgdGhlIGxpc3QgaXMgZW1wdHkgb3IgY29udHJvbHMgYXJlIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBjb250cm9sTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRyb2xOYW1lcykgfHwgY29udHJvbE5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250cm9sTmFtZXNcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuZmluZENvbnRyb2xJblNlY3Rpb24oc2VjdGlvbiwgbmFtZSkpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGMpOiBjIGlzIFhybS5Db250cm9scy5Db250cm9sID0+IEJvb2xlYW4oYykpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChjb250cm9sKSA9PiBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sLCBkaXNhYmxlZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRDb250cm9sSW5TZWN0aW9uKFxyXG4gICAgICAgIHNlY3Rpb246IFhybS5Db250cm9scy5TZWN0aW9uLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgKTogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIC8vIHByaW1hcnk6IGRpcmVjdCBwZXIgTmFtZVxyXG4gICAgICAgIGNvbnN0IGRpcmVjdCA9IHNlY3Rpb24uY29udHJvbHMuZ2V0Py4obmFtZSk7XHJcbiAgICAgICAgaWYgKGRpcmVjdCkgcmV0dXJuIGRpcmVjdDtcclxuXHJcbiAgICAgICAgLy8gRmFsbGJhY2s6IHNlYXJjaCBieSBnZXROYW1lKCkgb3ZlciB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgIGxldCBmb3VuZDogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjLmdldE5hbWU/LigpID09PSBuYW1lKSBmb3VuZCA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sLCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2UgaWYgZGlmZmVyZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjb250cm9sLmdldERpc2FibGVkPy4oKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSBcImJvb2xlYW5cIiAmJiBjdXJyZW50ID09PSBkaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgLyogbm8tb3AgKi9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdyaWQucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVmlzaWJpbGl0eSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGEgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGRpc2FibGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXREaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgcmVxdWlyZWQgbGV2ZWwgb24gYW4gYXR0cmlidXRlL2NvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF0dHIuc2V0UmVxdWlyZWRMZXZlbChpc1JlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWYoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgcHJlZGljYXRlOiAoKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdyA9ICEhcHJlZGljYXRlKCk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBjb250cm9sTmFtZSwgc2hvdyk7XHJcbiAgICAgICAgcmV0dXJuIHNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZkxvb2t1cEVxdWFscyhmYzogYW55LCBsb29rdXBBdHRyOiBzdHJpbmcsIHRhcmdldElkOiBzdHJpbmcsIGNvbnRyb2xOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gVmlzaWJpbGl0eUhlbHBlci5zaG93SWYoZmMsIGNvbnRyb2xOYW1lLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogVHlwZSBndWFyZDogY29udHJvbCBzdXBwb3J0cyBzZXREaXNhYmxlZCAqL1xyXG4gICAgc3RhdGljIGlzRGlzYWJsZWFibGUoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wpOiBjb250cm9sIGlzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wge1xyXG4gICAgICAgIHJldHVybiBcInNldERpc2FibGVkXCIgaW4gY29udHJvbCAmJiB0eXBlb2YgKGNvbnRyb2wgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCkuc2V0RGlzYWJsZWQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGb3JtV2FpdCB7XHJcbiAgICBzdGF0aWMgd2FpdEZvckxvb2t1cFZhbHVlKGZjOiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgdGltZW91dE1zID0gNjAwMCk6IFByb21pc2U8WHJtLkxvb2t1cFZhbHVlIHwgbnVsbD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFhdHRyKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgIGlmIChub3c/LmlkKSByZXR1cm4gcmVzb2x2ZShub3cpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHsgdHJ5IHsgYXR0ci5yZW1vdmVPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9IH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHY/LmlkKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUodik7IH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7IGF0dHIuYWRkT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KG9uQ2hhbmdlLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBpZiAoIWRvbmUpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZShudWxsKTsgfSB9LCB0aW1lb3V0TXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT3duZXJIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldE93bmVyQXR0cmlidXRlKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIChmYz8uZ2V0QXR0cmlidXRlPy4ob3duZXJBdHRyTmFtZSkgPz8gbnVsbCkgYXMgYW55O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRDdXJyZW50T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogT3duZXJSZWYgfCBudWxsIHtcclxuICAgICAgICBjb25zdCB2ID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk/LmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgIGlmICghdj8uaWQgfHwgIXYuZW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHsgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHYuaWQpLCBlbnRpdHlUeXBlOiB2LmVudGl0eVR5cGUgYXMgYW55LCBuYW1lOiB2Lm5hbWUgPz8gbnVsbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzZXRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcsIG93bmVyOiBPd25lclJlZik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgICAgICBpZiAoIWF0dHIpIHJldHVybjtcclxuICAgICAgICBhdHRyLnNldFZhbHVlKFt7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChvd25lci5pZCksXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IG93bmVyLmVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IG93bmVyLm5hbWUgPz8gdW5kZWZpbmVkXHJcbiAgICAgICAgfSBhcyBhbnldKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaXNTYW1lT3duZXIoYT86IE93bmVyUmVmIHwgbnVsbCwgYj86IE93bmVyUmVmIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBhLmVudGl0eVR5cGUgPT09IGIuZW50aXR5VHlwZSAmJiBVdGlsLnNhbml0aXplR3VpZChhLmlkKSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQoYi5pZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmljIHNlcnZpY2U6IExvYWQgb3duZXIgKFVzZXIgb3IgVGVhbSkgZm9yIGFueSByZWNvcmQgKi9cclxuZXhwb3J0IGNsYXNzIE93bmVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0T3duZXJSZWYoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlY29yZElkOiBzdHJpbmcsXHJcbiAgICAgICAgb3duZXJBdHRyTmFtZSA9IFwib3duZXJpZFwiXHJcbiAgICApOiBQcm9taXNlPE93bmVyUmVmIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocmVjb3JkSWQpO1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyBGb3IgcG9seW1vcnBoaWMgb3duZXIgbG9va3VwcywgZXhwYW5kIGRlZGljYXRlZCBuYXYgcHJvcHMgdG8gYXZvaWQgcHJvcGVydHktbm90LWZvdW5kIGVycm9yc1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZCA9IGA/JHNlbGVjdD0ke293bmVyQXR0ck5hbWV9JiRleHBhbmQ9b3duaW5ndXNlcigkc2VsZWN0PXN5c3RlbXVzZXJpZCxmdWxsbmFtZSksb3duaW5ndGVhbSgkc2VsZWN0PXRlYW1pZCxuYW1lKWA7XHJcbiAgICAgICAgY29uc3QgcmVjID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWwsIGlkLCBleHBhbmQpO1xyXG5cclxuICAgICAgICBjb25zdCB1c2VyID0gcmVjPy5bXCJvd25pbmd1c2VyXCJdO1xyXG4gICAgICAgIGlmICh1c2VyPy5zeXN0ZW11c2VyaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh1c2VyLnN5c3RlbXVzZXJpZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIuZnVsbG5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVhbSA9IHJlYz8uW1wib3duaW5ndGVhbVwiXTtcclxuICAgICAgICBpZiAodGVhbT8udGVhbWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodGVhbS50ZWFtaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJ0ZWFtXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWFtLm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBTZWN1cml0eS1yZWxhdGVkIGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5U2VydmljZSB7XHJcbiAgICAgICAgLyoqIFJldHVybnMgY3VycmVudCB1c2VyIGlkIGZyb20gWHJtIGNvbnRleHQgKi9cclxuICAgICAgICBzdGF0aWMgZ2V0Q3VycmVudFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5Ycm0/LlV0aWxpdHk/LmdldEdsb2JhbENvbnRleHQ/LigpPy51c2VyU2V0dGluZ3M/LnVzZXJJZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJucyByb2xlIG5hbWVzIG9mIHRoZSBjdXJyZW50IHVzZXIgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgZ2V0Q3VycmVudFVzZXJSb2xlcygpOiBQcm9taXNlPHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRDdXJyZW50VXNlcklkKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZCkgcmV0dXJuIFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZldGNoWE1MIG92ZXIgc3lzdGVtdXNlcnJvbGVzIChOOk4pIHRvIHJvbGVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICAgICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJyb2xlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cInJvbGVpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJyb2xlc1wiIGZyb209XCJyb2xlaWRcIiB0bz1cInJvbGVpZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlclwiIGZyb209XCJzeXN0ZW11c2VyaWRcIiB0bz1cInN5c3RlbXVzZXJpZFwiIGFsaWFzPVwidVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHt1c2VySWR9XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LmZldGNoWG1sKFwicm9sZVwiLCBmZXRjaFhtbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHJlcy5lbnRpdGllcyB8fCBbXSkubWFwKChlKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoZVtcInJvbGVpZFwiXSA/PyBlW1wiX3JvbGVpZF92YWx1ZVwiXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVbXCJuYW1lXCJdIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgIH0pKS5maWx0ZXIociA9PiAhIXIuaWQgJiYgISFyLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoZWNrcyBpZiBjdXJyZW50IHVzZXIgaGFzIG9uZSBvZiB0aGUgcHJvdmlkZWQgcm9sZSBuYW1lcyAoY2FzZS1pbnNlbnNpdGl2ZSkgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgaGFzQ3VycmVudFVzZXJSb2xlKC4uLnJvbGVOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdhbnRlZCA9IG5ldyBTZXQocm9sZU5hbWVzLm1hcChuID0+IG4udHJpbSgpLnRvTG93ZXJDYXNlKCkpLmZpbHRlcihCb29sZWFuKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2FudGVkLnNpemUgPT09IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50VXNlclJvbGVzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9sZXMuc29tZShyID0+IHdhbnRlZC5oYXMoci5uYW1lLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGNvbnRyb2wgdmlldyBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFZpZXdIZWxwZXIge1xyXG4gICAgLyoqIFJlc3RyaWN0IGEgbG9va3VwIGNvbnRyb2wgdG8gc3BlY2lmaWMgZW50aXR5IHR5cGVzICovXHJcbiAgICBzdGF0aWMgc2V0RW50aXR5VHlwZXMoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZywgZW50aXR5VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGN0cmw/LnNldEVudGl0eVR5cGVzPy4oZW50aXR5VHlwZXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGQgYSBjdXN0b20gdmlldyB0byBhIGxvb2t1cCBjb250cm9sICovXHJcbiAgICBzdGF0aWMgYWRkQ3VzdG9tVmlldyhcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIGNvbnRyb2xOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZW50aXR5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdEaXNwbGF5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGZldGNoWG1sOiBzdHJpbmcsXHJcbiAgICAgICAgbGF5b3V0WG1sOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0QXNEZWZhdWx0OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghY3RybD8uYWRkQ3VzdG9tVmlldykgcmV0dXJuO1xyXG4gICAgICAgICAgICBjdHJsLmFkZEN1c3RvbVZpZXcodmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLnRyaW0oKSwgbGF5b3V0WG1sLnRyaW0oKSwgc2V0QXNEZWZhdWx0KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkcyBhIGN1c3RvbSB2aWV3IGZvciBvd25lciBsb29rdXAgdG8gc2hvdyBvbmx5IHRlYW1zIHRoZSBjdXJyZW50IHVzZXIgYmVsb25ncyB0by4gKi9cclxuICAgIHN0YXRpYyBhZGRPd25lclRlYW1WaWV3Rm9yQ3VycmVudFVzZXIoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZyA9IFwib3duZXJpZFwiKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZW50aXR5TmFtZSA9IFwidGVhbVwiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdEaXNwbGF5TmFtZSA9IFwiT3duZXJUZWFtTG9va3VwVmlld1wiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJZCA9IFwiezAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMX1cIjtcclxuXHJcbiAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgIDxmZXRjaD5cclxuICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInRlYW1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJidXNpbmVzc3VuaXRpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJuZXZfb3duZXJ0ZWFtMnN5c3RlbXVzZXJcIiBmcm9tPVwidGVhbWlkXCIgdG89XCJ0ZWFtaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXEtdXNlcmlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICA8L2ZldGNoPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxheW91dFhtbCA9IGBcclxuICAgICAgICAgICAgPGdyaWQgbmFtZT0ncmVzdWx0c2V0JyBvYmplY3Q9JzEnIGp1bXA9J3RlYW1pZCcgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cclxuICAgICAgICAgICAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0ndGVhbWlkJz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSduYW1lJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J2J1c2luZXNzdW5pdGlkJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgPC9yb3c+XHJcbiAgICAgICAgICAgIDwvZ3JpZD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLmFkZEN1c3RvbVZpZXcoZmMsIGNvbnRyb2xOYW1lLCB2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwsIGxheW91dFhtbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWVsZFZhbGlkYXRvciB7XHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlcyBhIG51bWVyaWMgdGV4dCBmaWVsZCB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXHJcbiAgICAgKiBDYW4gYmUgdXNlZCBmb3IgT25DaGFuZ2UgZXZlbnRzIGFuZCBvcHRpb25hbGx5IHJlY2VpdmVzIHRoZSBhdHRyaWJ1dGUgbmFtZSBhcyBhIHBhcmFtZXRlci5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHZhbGlkYXRlQmlnTnVtYmVyKFxyXG4gICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0LFxyXG4gICAgICAgIGF0dHJpYnV0ZU5hbWU/OiBzdHJpbmdcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpIGFzIFhybS5Gb3JtQ29udGV4dDtcclxuXHJcbiAgICAgICAgLy8gSWYgbm8gYXR0cmlidXRlIG5hbWUgaXMgcHJvdmlkZWQg4oaSIHVzZSBldmVudCBzb3VyY2VcclxuICAgICAgICBpZiAoIWF0dHJpYnV0ZU5hbWUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRTb3VyY2UgPSBleGVjdXRpb25Db250ZXh0LmdldEV2ZW50U291cmNlKCkgYXMgWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50U291cmNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPSBldmVudFNvdXJjZS5nZXROYW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XHJcbiAgICAgICAgY29uc3QgY29udHJvbCA9IGZvcm1Db250ZXh0LmdldENvbnRyb2woYXR0cmlidXRlTmFtZSkgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbDtcclxuXHJcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGUgfHwgIWNvbnRyb2wpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uSWQgPSBgJHthdHRyaWJ1dGVOYW1lfV9CaWdOdW1iZXJFcnJvcmA7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gYXR0cmlidXRlLmdldFZhbHVlKCkgYXMgc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGZpZWxkIGlzIHRydWx5IGVtcHR5IChudWxsKSDihpIgY2xlYXIgZXJyb3IgYW5kIGV4aXRcclxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbihub3RpZmljYXRpb25JZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEtlZXAgb3JpZ2luYWwgc3RyaW5nLCBidXQgd29yayBvbiBhIGNvcHlcclxuICAgICAgICBjb25zdCByYXcgPSB2YWx1ZS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdXNlciBlbnRlcmVkIG9ubHkgd2hpdGVzcGFjZSDihpIgdHJlYXQgYXMgaW52YWxpZFxyXG4gICAgICAgIGlmIChyYXcudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0Tm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgYSBudW1lcmljIHZhbHVlIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cIixcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgd2hpdGVzcGFjZSBmb3IgdmFsaWRhdGlvbiAvIHN0b3JhZ2VcclxuICAgICAgICBjb25zdCBkaWdpdHNPbmx5ID0gcmF3LnJlcGxhY2UoL1xccysvZywgXCJcIik7XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRpb246IG9ubHkgZGlnaXRzLCBtYXguIDEyIGNoYXJhY3RlcnNcclxuICAgICAgICBjb25zdCBpc1ZhbGlkID0gL15cXGR7MSwxMn0kLy50ZXN0KGRpZ2l0c09ubHkpO1xyXG5cclxuICAgICAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIGEgbnVtZXJpYyB2YWx1ZSB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXCIsXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWYWxpZCDihpIgY2xlYXIgbm90aWZpY2F0aW9uIGFuZCBzdG9yZSByYXcgdmFsdWUgd2l0aG91dCBzcGFjZXNcclxuICAgICAgICBjb250cm9sLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbklkKTtcclxuICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUoZGlnaXRzT25seSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gUG9ydGZvbGlvLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgQUNDT1VOVCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb1wiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGFtYmN1c3RfbG9jYXRpb25pZDogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgICAgICBhbWJjdXN0X2FjY291bnRzdGF0dXNyZWFzb246IFwiYW1iY3VzdF9hY2NvdW50c3RhdHVzcmVhc29uXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIElOX09QRU5JTkc6IDg1ODA5MDAwMVxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiZXhwb3J0IGNvbnN0IENPTVBBTlkgPSB7XHJcbiAgICBlbnRpdHk6IFwiYWNjb3VudFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiYWNjb3VudGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdDogXCJuZXZfYnVzaW5lc3N1bml0XCIsXHJcbiAgICAgICAgb3duZXJpZDogXCJvd25lcmlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0OyIsImV4cG9ydCBjb25zdCBDT05UQUNUID0ge1xyXG4gICAgZW50aXR5OiBcImNvbnRhY3RcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImNvbnRhY3RpZFwiLFxyXG4gICAgICAgIG5ldl9idXNpbmVzc3VuaXRpZDogXCJuZXZfYnVzaW5lc3N1bml0aWRcIixcclxuICAgICAgICBvd25lcmlkOiBcIm93bmVyaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7IiwiaW1wb3J0IHR5cGUgeyBCdXNpbmVzc1VuaXRDb25maWcsIEVudGl0eUNvbmZpZyB9IGZyb20gXCIuLi9jb3JlL2NybS5jb3JlXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQlVTSU5FU1NVTklUTE9DQVRJT04gPSB7XHJcbiAgICBlbnRpdHk6IFwiYW1iY3VzdF9sb2NhdGlvblwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiYW1iY3VzdF9sb2NhdGlvbmlkXCIsXHJcbiAgICAgICAgbWFuZGF0b3J5Q29uZmlnSnNvbjogXCJtaHdybWJfbWFuZGF0b3J5Y29uZmlnanNvblwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuXHJcbi8qKiBTYWZlIHBhcnNlOyByZXR1cm5zIG51bGwgaWYgaW52YWxpZC4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQnVzaW5lc3NVbml0Q29uZmlnKGpzb25UZXh0OiBzdHJpbmcgfCBudWxsKTogQnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbCB7XHJcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm4gbnVsbDtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uVGV4dCkgYXMgQnVzaW5lc3NVbml0Q29uZmlnO1xyXG4gICAgICAgIGlmICghcGFyc2VkIHx8IHR5cGVvZiBwYXJzZWQgIT09IFwib2JqZWN0XCIgfHwgIXBhcnNlZC5lbnRpdGllcykgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogQ29sbGVjdCBiYXNlIGF0dHJpYnV0ZSBuYW1lcyB1c2VkIGluIGNvbmRpdGlvbnMgKGZvciBhdXRvIE9uQ2hhbmdlIHdpcmluZykuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsaXN0Q29uZGl0aW9uRmllbGRzKGVudGl0eUNvbmZpZz86IEVudGl0eUNvbmZpZyk6IHN0cmluZ1tdIHtcclxuICAgIGlmICghZW50aXR5Q29uZmlnPy5ydWxlcz8ubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgICBjb25zdCBmaWVsZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIGZvciAoY29uc3QgciBvZiBlbnRpdHlDb25maWcucnVsZXMpIHtcclxuICAgICAgICBmb3IgKGNvbnN0IGMgb2Ygci5jb25kaXRpb24gPz8gW10pIHtcclxuICAgICAgICAgICAgaWYgKCFjLmZpZWxkKSBjb250aW51ZTtcclxuICAgICAgICAgICAgLy8gYmluZCBvbiB0aGUgYmFzZSBhdHRyaWJ1dGUgKGJlZm9yZSBwcm9qZWN0aW9uIGxpa2UgLm5hbWUpXHJcbiAgICAgICAgICAgIGZpZWxkcy5hZGQoYy5maWVsZC5zcGxpdChcIi5cIiwgMSlbMF0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiBBcnJheS5mcm9tKGZpZWxkcyk7XHJcbn0iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB0eXBlIHsgQnVzaW5lc3NVbml0Q29uZmlnLCBDb25kaXRpb24sIEVudGl0eUNvbmZpZyB9IGZyb20gXCIuLi8uLi9jb3JlL2NybS5jb3JlXCI7XG5pbXBvcnQgeyBBcGlDbGllbnQsIEZPUk1fVFlQRSwgVXRpbCwgVmlzaWJpbGl0eUhlbHBlciB9IGZyb20gXCIuLi8uLi9jb3JlL2NybS5jb3JlXCI7XG5pbXBvcnQgeyBldmFsdWF0ZUNvbmRpdGlvbiwgcmVhZEF0dHJpYnV0ZVZhbHVlLCBpc0xvb2t1cEFycmF5IH0gZnJvbSBcIi4uLy4uL2NvcmUvY29uZGl0aW9uLmV2YWx1YXRvclwiO1xyXG5pbXBvcnQgeyBCVVNJTkVTU1VOSVRMT0NBVElPTiwgcGFyc2VCdXNpbmVzc1VuaXRDb25maWcsIGxpc3RDb25kaXRpb25GaWVsZHMgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eVwiO1xyXG5pbXBvcnQgeyBDT05UQUNUIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5XCI7XHJcbmltcG9ydCB7IENPTVBBTlkgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvQ29tcGFueS5lbnRpdHlcIjtcclxuaW1wb3J0IHsgQUNDT1VOVCB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9BY2NvdW50LmVudGl0eVwiO1xyXG5cclxuXHJcbmNvbnN0IHdpcmVkT25DaGFuZ2VBdHRyaWJ1dGVzID0gbmV3IFdlYWtNYXA8WHJtLkZvcm1Db250ZXh0LCBTZXQ8c3RyaW5nPj4oKTtcbmNvbnN0IGxhc3RBcHBsaWVkRW50aXR5Q29uZmlnID0gbmV3IFdlYWtNYXA8WHJtLkZvcm1Db250ZXh0LCBFbnRpdHlDb25maWc+KCk7XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplRHluYW1pY01hbmRhdG9yeUZpZWxkcyhleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xuICAgIGlmIChpc1F1aWNrQ3JlYXRlRm9ybShmb3JtQ29udGV4dCkpIHJldHVybjtcblxuICAgIHdpcmVCdXNpbmVzc1VuaXRMb29rdXBPbkNoYW5nZShmb3JtQ29udGV4dCk7XG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgbG9hZEJ1c2luZXNzVW5pdENvbmZpZyhmb3JtQ29udGV4dCk7XG4gICAgYXBwbHlDb25maWdNZXJnZWQoZm9ybUNvbnRleHQsIGNvbmZpZyk7XG4gICAgYXV0b1dpcmVPbkNoYW5nZShmb3JtQ29udGV4dCwgY29uZmlnKTtcbn1cblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYXBwbHlEeW5hbWljTWFuZGF0b3J5UnVsZXMoZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcbiAgICBpZiAoaXNRdWlja0NyZWF0ZUZvcm0oZm9ybUNvbnRleHQpKSByZXR1cm47XG5cbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCBsb2FkQnVzaW5lc3NVbml0Q29uZmlnKGZvcm1Db250ZXh0KTtcbiAgICBhcHBseUNvbmZpZ01lcmdlZChmb3JtQ29udGV4dCwgY29uZmlnKTtcbn1cblxuZnVuY3Rpb24gaXNRdWlja0NyZWF0ZUZvcm0oZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGZvcm1UeXBlID0gZm9ybUNvbnRleHQudWk/LmdldEZvcm1UeXBlPy4oKTtcbiAgICBpZiAoZm9ybVR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZSkgcmV0dXJuIHRydWU7XG5cbiAgICBjb25zdCBmb3JtU2VsZWN0b3IgPSBmb3JtQ29udGV4dC51aT8uZm9ybVNlbGVjdG9yO1xuICAgIHJldHVybiBmb3JtVHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSAmJiAoIWZvcm1TZWxlY3RvciB8fCB0eXBlb2YgZm9ybVNlbGVjdG9yLmdldEN1cnJlbnRJdGVtICE9PSBcImZ1bmN0aW9uXCIpO1xufVxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRCdXNpbmVzc1VuaXRDb25maWcoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCk6IFByb21pc2U8QnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbD4ge1xyXG4gICAgY29uc3QgYnVzaW5lc3NVbml0QXR0cmlidXRlID0gZ2V0QnVzaW5lc3NVbml0QXR0cmlidXRlRm9yRm9ybShmb3JtQ29udGV4dCk7XHJcbiAgICBjb25zdCBhdHRyID0gYnVzaW5lc3NVbml0QXR0cmlidXRlID8gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGJ1c2luZXNzVW5pdEF0dHJpYnV0ZSkgOiB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCB2YWwgPSBhdHRyPy5nZXRWYWx1ZT8uKCk7XG4gICAgY29uc3QgbG9jYXRpb25JZCA9IGlzTG9va3VwQXJyYXkodmFsKSA/IFV0aWwuc2FuaXRpemVHdWlkKHZhbFswXS5pZCkgOiBudWxsO1xuXG4gICAgaWYgKCFsb2NhdGlvbklkKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZmllbGRMb2dpY2FsID0gQlVTSU5FU1NVTklUTE9DQVRJT04uZmllbGRzLm1hbmRhdG9yeUNvbmZpZ0pzb247XHJcbiAgICAgICAgY29uc3QgcmVjID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlUmVjb3JkKEJVU0lORVNTVU5JVExPQ0FUSU9OLmVudGl0eSwgbG9jYXRpb25JZCwgYD8kc2VsZWN0PSR7ZmllbGRMb2dpY2FsfWApO1xuICAgICAgICBjb25zdCBqc29uVGV4dCA9IChyZWMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkTG9naWNhbF0gYXMgc3RyaW5nIHwgbnVsbDtcbiAgICAgICAgcmV0dXJuIHBhcnNlQnVzaW5lc3NVbml0Q29uZmlnKGpzb25UZXh0KTtcbiAgICB9IGNhdGNoIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufVxuXHJcbmZ1bmN0aW9uIGFwcGx5Q29uZmlnTWVyZ2VkKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGNvbmZpZzogQnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbCk6IHZvaWQge1xuICAgIGNvbnN0IHByZXZpb3VzRW50aXR5Q29uZmlnID0gbGFzdEFwcGxpZWRFbnRpdHlDb25maWcuZ2V0KGZvcm1Db250ZXh0KTtcbiAgICBpZiAoIWNvbmZpZz8uZW50aXRpZXMpIHtcbiAgICAgICAgaWYgKHByZXZpb3VzRW50aXR5Q29uZmlnKSB7XG4gICAgICAgICAgICByZXNldFBvdGVudGlhbE1hbmRhdG9yeShmb3JtQ29udGV4dCwgcHJldmlvdXNFbnRpdHlDb25maWcpO1xuICAgICAgICAgICAgbGFzdEFwcGxpZWRFbnRpdHlDb25maWcuZGVsZXRlKGZvcm1Db250ZXh0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZW50aXR5TG9naWNhbE5hbWUgPSBmb3JtQ29udGV4dC5kYXRhLmVudGl0eS5nZXRFbnRpdHlOYW1lKCk7XG4gICAgY29uc3QgZW50aXR5Q29uZmlnOiBFbnRpdHlDb25maWcgfCB1bmRlZmluZWQgPSBjb25maWcuZW50aXRpZXNbZW50aXR5TG9naWNhbE5hbWVdO1xuICAgIGlmICghZW50aXR5Q29uZmlnKSB7XG4gICAgICAgIGlmIChwcmV2aW91c0VudGl0eUNvbmZpZykge1xuICAgICAgICAgICAgcmVzZXRQb3RlbnRpYWxNYW5kYXRvcnkoZm9ybUNvbnRleHQsIHByZXZpb3VzRW50aXR5Q29uZmlnKTtcbiAgICAgICAgICAgIGxhc3RBcHBsaWVkRW50aXR5Q29uZmlnLmRlbGV0ZShmb3JtQ29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIDEpIFJlc2V0OiBjbGVhciByZXF1aXJlZCBmbGFnIGZvciBhbGwgZmllbGRzIHRoYXQgY291bGQgYmUgbWFya2VkIG1hbmRhdG9yeSBieSBkZWZhdWx0cyBvciBhbnkgcnVsZVxuICAgIGlmIChwcmV2aW91c0VudGl0eUNvbmZpZykgcmVzZXRQb3RlbnRpYWxNYW5kYXRvcnkoZm9ybUNvbnRleHQsIHByZXZpb3VzRW50aXR5Q29uZmlnKTtcbiAgICByZXNldFBvdGVudGlhbE1hbmRhdG9yeShmb3JtQ29udGV4dCwgZW50aXR5Q29uZmlnKTtcbiAgICBsYXN0QXBwbGllZEVudGl0eUNvbmZpZy5zZXQoZm9ybUNvbnRleHQsIGVudGl0eUNvbmZpZyk7XG5cbiAgICAvLyAyKSBFdmFsdWF0ZSBydWxlcyBhbmQgbWVyZ2UgcmVzdWx0aW5nIG1hbmRhdG9yeSBmaWVsZHNcbiAgICBjb25zdCBtZXJnZWQ6IHN0cmluZ1tdID0gW107XG4gICAgZm9yIChjb25zdCBydWxlIG9mIGVudGl0eUNvbmZpZy5ydWxlcyA/PyBbXSkge1xyXG4gICAgICAgIGlmIChydWxlTWF0Y2hlcyhmb3JtQ29udGV4dCwgcnVsZS5jb25kaXRpb24pKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgcnVsZS5tYW5kYXRvcnkgPz8gW10pIHtcclxuICAgICAgICAgICAgICAgIGlmICghbWVyZ2VkLmluY2x1ZGVzKGZpZWxkKSkgbWVyZ2VkLnB1c2goZmllbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gbWVyZ2VkLmxlbmd0aCA/IG1lcmdlZCA6IGVudGl0eUNvbmZpZy5kZWZhdWx0ID8/IFtdO1xyXG4gICAgcmVxdWlyZWRGaWVsZHMuZm9yRWFjaChmaWVsZExvZ2ljYWwgPT4gVmlzaWJpbGl0eUhlbHBlci5zZXRSZXF1aXJlZChmb3JtQ29udGV4dCwgZmllbGRMb2dpY2FsLCB0cnVlKSk7XHJcbn1cclxuXHJcbi8vIENsZWFycyByZXF1aXJlZCBmbGFnIG9uIGFsbCBmaWVsZHMgdGhhdCBjb3VsZCBiZSBtYXJrZWQgbWFuZGF0b3J5IGJ5IGRlZmF1bHRzIG9yIGFueSBydWxlIGZvciBhIGdpdmVuIGVudGl0eSBjb25maWdcclxuZnVuY3Rpb24gcmVzZXRQb3RlbnRpYWxNYW5kYXRvcnkoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgZW50aXR5Q29uZmlnOiBFbnRpdHlDb25maWcpOiB2b2lkIHtcclxuICAgIGNvbnN0IHBvdGVudGlhbE1hbmRhdG9yeSA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgZm9yIChjb25zdCBmIG9mIGVudGl0eUNvbmZpZy5kZWZhdWx0ID8/IFtdKSBwb3RlbnRpYWxNYW5kYXRvcnkuYWRkKGYpO1xyXG4gICAgZm9yIChjb25zdCBydWxlIG9mIGVudGl0eUNvbmZpZy5ydWxlcyA/PyBbXSkge1xyXG4gICAgICAgIGZvciAoY29uc3QgZiBvZiBydWxlLm1hbmRhdG9yeSA/PyBbXSkgcG90ZW50aWFsTWFuZGF0b3J5LmFkZChmKTtcclxuICAgIH1cclxuICAgIHBvdGVudGlhbE1hbmRhdG9yeS5mb3JFYWNoKGZpZWxkTG9naWNhbCA9PiBWaXNpYmlsaXR5SGVscGVyLnNldFJlcXVpcmVkKGZvcm1Db250ZXh0LCBmaWVsZExvZ2ljYWwsIGZhbHNlKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHJ1bGVNYXRjaGVzKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGNvbmRpdGlvbnM/OiBDb25kaXRpb25bXSk6IGJvb2xlYW4ge1xuICAgIGlmICghY29uZGl0aW9ucyB8fCBjb25kaXRpb25zLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHRydWU7XG4gICAgZm9yIChjb25zdCBjb25kaXRpb24gb2YgY29uZGl0aW9ucykge1xuICAgICAgICBjb25zdCBhY3R1YWwgPSByZWFkQXR0cmlidXRlVmFsdWUoZm9ybUNvbnRleHQsIGNvbmRpdGlvbi5maWVsZCk7XG4gICAgICAgIGlmICghZXZhbHVhdGVDb25kaXRpb24oYWN0dWFsLCBjb25kaXRpb24pKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBhdXRvV2lyZU9uQ2hhbmdlKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGNvbmZpZzogQnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbCk6IHZvaWQge1xuICAgIGlmICghY29uZmlnPy5lbnRpdGllcykgcmV0dXJuO1xuICAgIGNvbnN0IGVudGl0eUxvZ2ljYWxOYW1lID0gZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5TmFtZSgpO1xuICAgIGNvbnN0IGVudGl0eUNvbmZpZyA9IGNvbmZpZy5lbnRpdGllc1tlbnRpdHlMb2dpY2FsTmFtZV0gYXMgRW50aXR5Q29uZmlnIHwgdW5kZWZpbmVkO1xuICAgIGNvbnN0IGZpZWxkcyA9IGxpc3RDb25kaXRpb25GaWVsZHMoZW50aXR5Q29uZmlnKTtcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgZmllbGRzKSB7XG4gICAgICAgIHdpcmVBdHRyaWJ1dGVPbkNoYW5nZShmb3JtQ29udGV4dCwgYXR0cmlidXRlTmFtZSwgKGN0eDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpID0+IGFwcGx5RHluYW1pY01hbmRhdG9yeVJ1bGVzKGN0eCkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gd2lyZUJ1c2luZXNzVW5pdExvb2t1cE9uQ2hhbmdlKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQpOiB2b2lkIHtcbiAgICBjb25zdCBidXNpbmVzc1VuaXRBdHRyaWJ1dGUgPSBnZXRCdXNpbmVzc1VuaXRBdHRyaWJ1dGVGb3JGb3JtKGZvcm1Db250ZXh0KTtcbiAgICBpZiAoIWJ1c2luZXNzVW5pdEF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgd2lyZUF0dHJpYnV0ZU9uQ2hhbmdlKGZvcm1Db250ZXh0LCBidXNpbmVzc1VuaXRBdHRyaWJ1dGUsIGFzeW5jIChjdHg6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KSA9PiB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRGb3JtQ29udGV4dCA9IGN0eC5nZXRGb3JtQ29udGV4dCgpO1xuICAgICAgICBjb25zdCBjb25maWcgPSBhd2FpdCBsb2FkQnVzaW5lc3NVbml0Q29uZmlnKGN1cnJlbnRGb3JtQ29udGV4dCk7XG4gICAgICAgIGFwcGx5Q29uZmlnTWVyZ2VkKGN1cnJlbnRGb3JtQ29udGV4dCwgY29uZmlnKTtcbiAgICAgICAgYXV0b1dpcmVPbkNoYW5nZShjdXJyZW50Rm9ybUNvbnRleHQsIGNvbmZpZyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHdpcmVBdHRyaWJ1dGVPbkNoYW5nZShcbiAgICBmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LFxuICAgIGF0dHJpYnV0ZU5hbWU6IHN0cmluZyxcbiAgICBoYW5kbGVyOiAoY3R4OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkgPT4gdm9pZCB8IFByb21pc2U8dm9pZD5cbik6IHZvaWQge1xuICAgIGxldCB3aXJlZEF0dHJpYnV0ZXMgPSB3aXJlZE9uQ2hhbmdlQXR0cmlidXRlcy5nZXQoZm9ybUNvbnRleHQpO1xuICAgIGlmICghd2lyZWRBdHRyaWJ1dGVzKSB7XG4gICAgICAgIHdpcmVkQXR0cmlidXRlcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICAgICAgICB3aXJlZE9uQ2hhbmdlQXR0cmlidXRlcy5zZXQoZm9ybUNvbnRleHQsIHdpcmVkQXR0cmlidXRlcyk7XG4gICAgfVxuXG4gICAgaWYgKHdpcmVkQXR0cmlidXRlcy5oYXMoYXR0cmlidXRlTmFtZSkpIHJldHVybjtcblxuICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcbiAgICBpZiAoIWF0dHJpYnV0ZSkgcmV0dXJuO1xuXG4gICAgdHJ5IHtcbiAgICAgICAgYXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xuICAgICAgICB3aXJlZEF0dHJpYnV0ZXMuYWRkKGF0dHJpYnV0ZU5hbWUpO1xuICAgIH0gY2F0Y2gge1xuICAgICAgICAvLyBpZ25vcmVcbiAgICB9XG59XG5cbi8vIFJlc29sdmVzIHRoZSBjb3JyZWN0IGJ1c2luZXNzLXVuaXQvbG9jYXRpb24gbG9va3VwIGF0dHJpYnV0ZSBiYXNlZCBvbiB0aGUgY3VycmVudCBmb3JtJ3MgZW50aXR5XG5mdW5jdGlvbiBnZXRCdXNpbmVzc1VuaXRBdHRyaWJ1dGVGb3JGb3JtKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBmb3JtQ29udGV4dD8uZGF0YT8uZW50aXR5Py5nZXRFbnRpdHlOYW1lPy4oKTtcbiAgICAgICAgc3dpdGNoIChlbnRpdHlOYW1lKSB7XG4gICAgICAgICAgICBjYXNlIENPTlRBQ1QuZW50aXR5OlxuICAgICAgICAgICAgICAgIHJldHVybiBDT05UQUNULmZpZWxkcy5uZXZfYnVzaW5lc3N1bml0aWQ7IC8vIGNvbnRhY3RcbiAgICAgICAgICAgIGNhc2UgQ09NUEFOWS5lbnRpdHk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIENPTVBBTlkuZmllbGRzLm5ldl9idXNpbmVzc3VuaXQ7IC8vIGFjY291bnQgKG5ldl9idXNpbmVzc3VuaXQpXG4gICAgICAgICAgICBjYXNlIEFDQ09VTlQuZW50aXR5OlxuICAgICAgICAgICAgICAgIHJldHVybiBBQ0NPVU5ULmZpZWxkcy5hbWJjdXN0X2xvY2F0aW9uaWQ7IC8vIHBvcnRmb2xpb1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufVxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9