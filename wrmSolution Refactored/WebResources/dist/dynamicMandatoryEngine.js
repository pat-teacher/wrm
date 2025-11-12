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






const businessUnitConfigCache = new Map();
async function initializeDynamicMandatoryFields(executionContext) {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config);
}
async function applyDynamicMandatoryRules(executionContext) {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
}
async function loadBusinessUnitConfig(formContext) {
    var _a, _b;
    const businessUnitAttribute = getBusinessUnitAttributeForForm(formContext);
    const attr = businessUnitAttribute ? formContext.getAttribute(businessUnitAttribute) : undefined;
    const val = (_a = attr === null || attr === void 0 ? void 0 : attr.getValue) === null || _a === void 0 ? void 0 : _a.call(attr);
    const locationId = (0,_core_condition_evaluator__WEBPACK_IMPORTED_MODULE_1__.isLookupArray)(val) ? _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.Util.sanitizeGuid(val[0].id) : null;
    const cacheKey = locationId ? `location:${locationId}` : "location:null";
    if (businessUnitConfigCache.has(cacheKey))
        return (_b = businessUnitConfigCache.get(cacheKey)) !== null && _b !== void 0 ? _b : null;
    if (!locationId) {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }
    try {
        const fieldLogical = _entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.BUSINESSUNITLOCATION.fields.mandatoryConfigJson;
        const rec = await _core_crm_core__WEBPACK_IMPORTED_MODULE_0__.ApiClient.retrieveRecord(_entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.BUSINESSUNITLOCATION.entity, locationId, `?$select=${fieldLogical}`);
        const jsonText = rec[fieldLogical];
        const parsed = (0,_entities_MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_2__.parseBusinessUnitConfig)(jsonText);
        businessUnitConfigCache.set(cacheKey, parsed);
        return parsed;
    }
    catch {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }
}
function applyConfigMerged(formContext, config) {
    var _a, _b, _c;
    if (!(config === null || config === void 0 ? void 0 : config.entities))
        return;
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName];
    if (!entityConfig)
        return;
    // 1) Reset: clear required flag for all fields that could be marked mandatory by defaults or any rule
    resetPotentialMandatory(formContext, entityConfig);
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
        const attribute = formContext.getAttribute(attributeName);
        if (!attribute)
            continue;
        const handler = (ctx) => applyDynamicMandatoryRules(ctx);
        try {
            attribute.addOnChange(handler);
        }
        catch {
            // ignore
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxDQUFDLFlBQVk7WUFDMUQ7Z0JBQ0ksT0FBTyxTQUFTLENBQUM7UUFDekIsQ0FBQztJQUNMLENBQUM7SUFBQyxNQUFNLENBQUM7UUFDTCxPQUFPLFNBQVMsQ0FBQztJQUNyQixDQUFDO0FBQ0wsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY29uZGl0aW9uLmV2YWx1YXRvci50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NybS5jb3JlLnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0FjY291bnQuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0NvbXBhbnkuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL01hbmRhdG9yeUNvbmZpZy5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZmVhdHVyZXMvZHluYW1pY01hbmRhdG9yeS9keW5hbWljTWFuZGF0b3J5RW5naW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmRpdGlvbiwgTG9va3VwQ29tcGFyYWJsZSwgT3BlcmF0b3IsIFV0aWwgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZnVuY3Rpb24gaXNNdWx0aVNlbGVjdEFycmF5KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgQXJyYXk8bnVtYmVyIHwgc3RyaW5nPiB7XHJcbiAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUuZXZlcnkoKHYpID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNMb29rdXBDb21wYXJhYmxlKHY6IHVua25vd24pOiB2IGlzIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgcmV0dXJuICEhdiAmJiB0eXBlb2YgdiA9PT0gXCJvYmplY3RcIiAmJiAoXCJpZFwiIGluICh2IGFzIGFueSkgfHwgXCJuYW1lXCIgaW4gKHYgYXMgYW55KSB8fCBcImVudGl0eVR5cGVcIiBpbiAodiBhcyBhbnkpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gdG9HdWlkT3JOdWxsKHZhbHVlOiB1bmtub3duKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICBjb25zdCBzID0gU3RyaW5nKHZhbHVlID8/IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIHJldHVybiAvXlswLTlhLWZdezh9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezR9LVswLTlhLWZdezEyfSQvLnRlc3QocykgPyBzIDogbnVsbDtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNOdWxsaXNoT3JFbXB0eSh2OiB1bmtub3duKTogYm9vbGVhbiB7XHJcbiAgICBpZiAodiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcclxuICAgIGlmICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikgcmV0dXJuIHYudHJpbSgpID09PSBcIlwiO1xyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkodikpIHJldHVybiB2Lmxlbmd0aCA9PT0gMDtcclxuICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUodikpIHJldHVybiAhdi5pZCAmJiAhdi5uYW1lOyAvLyBib3RoIGVtcHR5XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZVNjYWxhcih4OiB1bmtub3duKTogc3RyaW5nIHtcclxuICAgIGNvbnN0IGcgPSB0b0d1aWRPck51bGwoeCk7XHJcbiAgICBpZiAoZykgcmV0dXJuIGBndWlkOiR7Z31gO1xyXG4gICAgY29uc3QgbiA9IE51bWJlcih4KTtcclxuICAgIGlmICghTnVtYmVyLmlzTmFOKG4pKSByZXR1cm4gYG51bToke259YDtcclxuICAgIGlmICh0eXBlb2YgeCA9PT0gXCJib29sZWFuXCIpIHJldHVybiBgYm9vbDoke3h9YDtcclxuICAgIHJldHVybiBgc3RyOiR7U3RyaW5nKHggPz8gXCJcIikudG9Mb3dlckNhc2UoKX1gO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNMb29rdXBBcnJheSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFhybS5Mb29rdXBWYWx1ZVtdIHtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSkgJiZcclxuICAgICAgICB2YWx1ZS5sZW5ndGggPiAwICYmXHJcbiAgICAgICAgdHlwZW9mIHZhbHVlWzBdID09PSBcIm9iamVjdFwiICYmXHJcbiAgICAgICAgdmFsdWVbMF0gIT09IG51bGwgJiZcclxuICAgICAgICBcImlkXCIgaW4gKHZhbHVlWzBdIGFzIG9iamVjdCkgJiZcclxuICAgICAgICB0eXBlb2YgKHZhbHVlWzBdIGFzIFhybS5Mb29rdXBWYWx1ZSkuaWQgPT09IFwic3RyaW5nXCJcclxuICAgICk7XHJcbn1cclxuLyoqIFJlYWQgYSB2YWx1ZSBmcm9tIHRoZSBmb3JtOyBzdXBwb3J0cyBsb29rdXAgcHJvamVjdGlvbnMgdmlhIGRvdC1ub3RhdGlvbi4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRBdHRyaWJ1dGVWYWx1ZShmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LCBmaWVsZFBhdGg6IHN0cmluZyk6IHVua25vd24ge1xyXG4gICAgY29uc3QgW2xvZ2ljYWxOYW1lLCBwcm9qZWN0aW9uXSA9IGZpZWxkUGF0aC5zcGxpdChcIi5cIiwgMik7XHJcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUobG9naWNhbE5hbWUpO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUgfHwgdHlwZW9mIGF0dHJpYnV0ZS5nZXRWYWx1ZSAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IHJhdyA9IGF0dHJpYnV0ZS5nZXRWYWx1ZSgpO1xyXG5cclxuICAgIC8vIExvb2t1cCAvIFBhcnR5bGlzdFxyXG4gICAgaWYgKGlzTG9va3VwQXJyYXkocmF3KSkge1xyXG4gICAgICAgIGNvbnN0IGx2ID0gcmF3WzBdIGFzIFhybS5Mb29rdXBWYWx1ZSAmIHsgZW50aXR5VHlwZT86IHN0cmluZyB9O1xyXG4gICAgICAgIGNvbnN0IG9iajogTG9va3VwQ29tcGFyYWJsZSA9IHtcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKGx2LmlkKSxcclxuICAgICAgICAgICAgbmFtZTogbHYubmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlOiBsdi5lbnRpdHlUeXBlID8/IG51bGwsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKHByb2plY3Rpb24pIHtcclxuICAgICAgICAgICAgc3dpdGNoIChwcm9qZWN0aW9uLnRvTG93ZXJDYXNlKCkpIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJpZFwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouaWQ7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwibmFtZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmoubmFtZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJlbnRpdHl0eXBlXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5lbnRpdHlUeXBlO1xyXG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBvYmo7IC8vIGRlZmF1bHQ6IG9iamVjdFxyXG4gICAgfVxyXG5cclxuICAgIC8vIE11bHRpLVNlbGVjdCBPcHRpb25TZXRcclxuICAgIGlmIChpc011bHRpU2VsZWN0QXJyYXkocmF3KSkgcmV0dXJuIHJhdztcclxuXHJcbiAgICAvLyBQcmltaXRpdmVcclxuICAgIHJldHVybiByYXcgYXMgdW5rbm93bjtcclxufVxyXG5cclxuLyoqIEV2YWx1YXRlIHNpbmdsZSBjb25kaXRpb24gYWdhaW5zdCBhY3R1YWwgdmFsdWUuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBldmFsdWF0ZUNvbmRpdGlvbihhY3R1YWw6IHVua25vd24sIGNvbmRpdGlvbjogQ29uZGl0aW9uKTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBvcCA9IChjb25kaXRpb24ub3BlcmF0b3IgfHwgXCJcIikudG9Mb3dlckNhc2UoKSBhcyBPcGVyYXRvcjtcclxuICAgIGNvbnN0IHZhbCA9IChjb25kaXRpb24gYXMgeyB2YWx1ZT86IHVua25vd24gfSkudmFsdWU7XHJcblxyXG4gICAgc3dpdGNoIChvcCkge1xyXG4gICAgICAgIGNhc2UgXCJlcVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzU21hcnQoYWN0dWFsLCB2YWwpO1xyXG4gICAgICAgIGNhc2UgXCJuZVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gIWVxdWFsc1NtYXJ0KGFjdHVhbCwgdmFsKTtcclxuICAgICAgICBjYXNlIFwiaW5cIjpcclxuICAgICAgICAgICAgcmV0dXJuIGluU21hcnQoYWN0dWFsLCB2YWwpO1xyXG4gICAgICAgIGNhc2UgXCJpc251bGxcIjpcclxuICAgICAgICAgICAgcmV0dXJuIGlzTnVsbGlzaE9yRW1wdHkoYWN0dWFsKTtcclxuICAgICAgICBjYXNlIFwiaXNub3RudWxsXCI6XHJcbiAgICAgICAgY2FzZSBcIm5vdG51bGxcIjpcclxuICAgICAgICAgICAgcmV0dXJuICFpc051bGxpc2hPckVtcHR5KGFjdHVhbCk7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBlcXVhbHNTbWFydChhOiB1bmtub3duLCBiOiB1bmtub3duKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoaXNMb29rdXBDb21wYXJhYmxlKGEpKSB7XHJcbiAgICAgICAgaWYgKGIgPT0gbnVsbCkgcmV0dXJuIGlzTnVsbGlzaE9yRW1wdHkoYSk7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBiID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGcgPSB0b0d1aWRPck51bGwoYik7XHJcbiAgICAgICAgICAgIGlmIChnKSByZXR1cm4gKGEuaWQgPz8gXCJcIikudG9Mb3dlckNhc2UoKSA9PT0gZzsgLy8gR1VJRCA/IGNvbXBhcmUgSURcclxuICAgICAgICAgICAgcmV0dXJuIChhLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKSA9PT0gYi50b0xvd2VyQ2FzZSgpOyAvLyBlbHNlIGNvbXBhcmUgbmFtZVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoaXNMb29rdXBDb21wYXJhYmxlKGIpKSB7XHJcbiAgICAgICAgICAgIGlmIChhLmlkICYmIGIuaWQpIHJldHVybiBhLmlkLnRvTG93ZXJDYXNlKCkgPT09IGIuaWQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgcmV0dXJuIChhLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKSA9PT0gKGIubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYSkgJiYgQXJyYXkuaXNBcnJheShiKSkge1xyXG4gICAgICAgIGlmIChhLmxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcclxuICAgICAgICBjb25zdCBhcyA9IG5ldyBTZXQoYS5tYXAoKHgpID0+IG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgICAgIHJldHVybiBiLmV2ZXJ5KCh4KSA9PiBhcy5oYXMobm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbmEgPSBOdW1iZXIoYSk7XHJcbiAgICBjb25zdCBuYiA9IE51bWJlcihiKTtcclxuICAgIGlmICghTnVtYmVyLmlzTmFOKG5hKSAmJiAhTnVtYmVyLmlzTmFOKG5iKSkgcmV0dXJuIG5hID09PSBuYjtcclxuXHJcbiAgICBpZiAodHlwZW9mIGEgPT09IFwiYm9vbGVhblwiIHx8IHR5cGVvZiBiID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgIHJldHVybiBTdHJpbmcoYSkudG9Mb3dlckNhc2UoKSA9PT0gU3RyaW5nKGIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFN0cmluZyhhID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IFN0cmluZyhiID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluU21hcnQoYWN0dWFsOiB1bmtub3duLCBjYW5kaWRhdGVMaXN0OiB1bmtub3duKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoY2FuZGlkYXRlTGlzdCkpIHJldHVybiBlcXVhbHNTbWFydChhY3R1YWwsIGNhbmRpZGF0ZUxpc3QpO1xyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGFjdHVhbCkpIHtcclxuICAgICAgICBjb25zdCBjYW5kID0gbmV3IFNldChjYW5kaWRhdGVMaXN0Lm1hcCgoeCkgPT4gbm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICAgICAgcmV0dXJuIGFjdHVhbC5zb21lKCh4KSA9PiBjYW5kLmhhcyhub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoaXNMb29rdXBDb21wYXJhYmxlKGFjdHVhbCkpIHtcclxuICAgICAgICBjb25zdCBpZCA9IChhY3R1YWwuaWQgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBuYW1lID0gKGFjdHVhbC5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgZm9yIChjb25zdCB2IG9mIGNhbmRpZGF0ZUxpc3QpIHtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBnID0gdG9HdWlkT3JOdWxsKHYpO1xyXG4gICAgICAgICAgICAgICAgaWYgKChnICYmIGlkID09PSBnKSB8fCAoIWcgJiYgbmFtZSA9PT0gdi50b0xvd2VyQ2FzZSgpKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNMb29rdXBDb21wYXJhYmxlKHYpKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoKHYuaWQgJiYgaWQgPT09IHYuaWQudG9Mb3dlckNhc2UoKSkgfHwgKHYubmFtZSAmJiBuYW1lID09PSB2Lm5hbWUudG9Mb3dlckNhc2UoKSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGVxdWFsc1NtYXJ0KGFjdHVhbCwgdikpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gY2FuZGlkYXRlTGlzdC5zb21lKCh2KSA9PiBlcXVhbHNTbWFydChhY3R1YWwsIHYpKTtcclxufSIsIi8vID09PT0gRm9ybVR5cGUgQ29uc3RhbnRzID09PT1cclxuZXhwb3J0IGNvbnN0IEZPUk1fVFlQRSA9IHtcclxuICAgIFVuZGVmaW5lZDogMCxcclxuICAgIENyZWF0ZTogMSxcclxuICAgIFVwZGF0ZTogMixcclxuICAgIFJlYWRPbmx5OiAzLFxyXG4gICAgRGlzYWJsZWQ6IDQsXHJcbiAgICBRdWlja0NyZWF0ZTogNSxcclxuICAgIEJ1bGtFZGl0OiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgRm9ybVR5cGUgPSB0eXBlb2YgRk9STV9UWVBFW2tleW9mIHR5cGVvZiBGT1JNX1RZUEVdO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZvcm1UeXBlSGVscGVyID0ge1xyXG4gICAgZ2V0KGZjOiBhbnkpOiBGb3JtVHlwZSB8IDAge1xyXG4gICAgICAgIHJldHVybiBmYz8udWk/LmdldEZvcm1UeXBlPy4oKSA/PyBGT1JNX1RZUEUuVW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIGlzQ3JlYXRlTGlrZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH0sXHJcbiAgICBpc0VkaXRhYmxlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlVwZGF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyUmVmIHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIiB8IFwidGVhbVwiO1xyXG4gICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gVHlwZXMgc2hhcmVkIGFjcm9zcyBlbmdpbmUgJiBlbnRpdGllcyAtLS0tXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCIgfCBcIm5vdG51bGxcIjsgLy8gYWxpYXNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcclxuICAgIC8qKiBMb2dpY2FsIG5hbWUgKHN1cHBvcnRzIGRvdC1ub3RhdGlvbiBmb3IgbG9va3VwIHByb2plY3Rpb25zOiBlLmcuLCBcInByaW1hcnljb250YWN0aWQubmFtZVwiKS4gKi9cclxuICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKiogT3B0aW9uYWwgdmFsdWUgZm9yIGNvbXBhcmlzb25zIChvbWl0dGVkIGZvciBudWxsLW9wZXJhdG9ycykuICovXHJcbiAgICB2YWx1ZT86IHVua25vd247XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgbWFuZGF0b3J5Pzogc3RyaW5nW107XHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gQU5ELWNvbmp1bmN0aW9uOyBlbXB0eS91bmRlZmluZWQg4oeSIHJ1bGUgYWx3YXlzIG1hdGNoZXNcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdD86IHN0cmluZ1tdO1xyXG4gICAgcnVsZXM/OiBSdWxlW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVzaW5lc3NVbml0Q29uZmlnIHtcclxuICAgIHZlcnNpb246IG51bWJlcjtcclxuICAgIGVudGl0aWVzOiBSZWNvcmQ8c3RyaW5nLCBFbnRpdHlDb25maWc+O1xyXG59XHJcblxyXG4vKiogTGlnaHR3ZWlnaHQgY29tcGFyYWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxvb2t1cCAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgaWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICBuYW1lOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBDb3JlIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcbiAgICBzdGF0aWMgZ2V0IFhybSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkuWHJtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBMb3dlcmNhc2UsIHN0cmlwIGJyYWNlczsgcmV0dXJucyBlbXB0eSBzdHJpbmcgaWYgZmFsc3kgaW5wdXQuICovXHJcbiAgICBzdGF0aWMgc2FuaXRpemVHdWlkKGlkPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKGlkIHx8IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdW5pcXVlPFQ+KGFycjogVFtdKTogVFtdIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFRoaW4gV2ViIEFQSSB3cmFwcGVyIC0tLS1cclxuZXhwb3J0IGNsYXNzIEFwaUNsaWVudCB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5JZCA9IFV0aWwuc2FuaXRpemVHdWlkKGlkKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lLCBjbGVhbklkLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGZldGNoWG1sKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGZldGNoWG1sOiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgP2ZldGNoWG1sPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGZldGNoWG1sLnRyaW0oKSl9YDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCB1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBleGVjdXRlKHJlcXVlc3Q6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBhc3NvY2lhdGVNYW55VG9NYW55KFxyXG4gICAgICAgIHBhcmVudEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRJZDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0aW9uc2hpcFNjaGVtYU5hbWU6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkRW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRJZHM6IHN0cmluZ1tdXHJcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCByZXEgPSB7XHJcbiAgICAgICAgICAgIHRhcmdldDogeyBlbnRpdHlUeXBlOiBwYXJlbnRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocGFyZW50SWQpIH0sXHJcbiAgICAgICAgICAgIHJlbGF0ZWRFbnRpdGllczogcmVsYXRlZElkcy5tYXAoKHJpZCkgPT4gKHsgZW50aXR5VHlwZTogcmVsYXRlZEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChyaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0gYXMgYW55O1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEFwaUNsaWVudC5leGVjdXRlKHJlcSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBBc3NvY2lhdGlvbiBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gRm9ybSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIEZvcm1Db250cm9sSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRDdXJyZW50SWQoZmM6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkUmF3ID0gZmM/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSYXcgPyBVdGlsLnNhbml0aXplR3VpZChpZFJhdykgOiBudWxsO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldExvb2t1cElkKGZjOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB2ID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZSk/LmdldFZhbHVlPy4oKTtcclxuICAgICAgICByZXR1cm4gdiAmJiB2Lmxlbmd0aCA/IFV0aWwuc2FuaXRpemVHdWlkKHZbMF0uaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEaXNhYmxlIG9yIGVuYWJsZSBhbGwgZGlzYWJsZWFibGUgY29udHJvbHMgaW5zaWRlIGEgdGFiIHNlY3Rpb24gKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZEFsbENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjb250cm9sOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkgeyBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBPcHRpb25hbDogc3BlY2lhbCBoYW5kbGluZyBmb3Igc3ViZ3JpZHMsIHdoaWNoIGRvIG5vdCBzdXBwb3J0IHNldERpc2FibGVkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgLyoqICAgXHJcbiAgICogZGUvYWN0aXZhdGUgb25seSB0aGUgc3BlY2lmaWVkIGNvbnRyb2xzIChieSBuYW1lKSBpbiBhIHNlY3Rpb24uICAgXHJcbiAgICogRG9lcyBub3RoaW5nIGlmIHRoZSBsaXN0IGlzIGVtcHR5IG9yIGNvbnRyb2xzIGFyZSBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgY29udHJvbE5hbWVzOiByZWFkb25seSBzdHJpbmdbXSxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjb250cm9sTmFtZXMpIHx8IGNvbnRyb2xOYW1lcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgY29udHJvbE5hbWVzXHJcbiAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IEZvcm1Db250cm9sSGVscGVyLmZpbmRDb250cm9sSW5TZWN0aW9uKHNlY3Rpb24sIG5hbWUpKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChjKTogYyBpcyBYcm0uQ29udHJvbHMuQ29udHJvbCA9PiBCb29sZWFuKGMpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoY29udHJvbCkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbCwgZGlzYWJsZWQpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQ29udHJvbEluU2VjdGlvbihcclxuICAgICAgICBzZWN0aW9uOiBYcm0uQ29udHJvbHMuU2VjdGlvbixcclxuICAgICAgICBuYW1lOiBzdHJpbmdcclxuICAgICk6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICAvLyBwcmltYXJ5OiBkaXJlY3QgcGVyIE5hbWVcclxuICAgICAgICBjb25zdCBkaXJlY3QgPSBzZWN0aW9uLmNvbnRyb2xzLmdldD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChkaXJlY3QpIHJldHVybiBkaXJlY3Q7XHJcblxyXG4gICAgICAgIC8vIEZhbGxiYWNrOiBzZWFyY2ggYnkgZ2V0TmFtZSgpIG92ZXIgdGhlIGNvbGxlY3Rpb25cclxuICAgICAgICBsZXQgZm91bmQ6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYy5nZXROYW1lPy4oKSA9PT0gbmFtZSkgZm91bmQgPSBjO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIVZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIGlmIGRpZmZlcmVudFxyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY29udHJvbC5nZXREaXNhYmxlZD8uKCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gXCJib29sZWFuXCIgJiYgY3VycmVudCA9PT0gZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIC8qIG5vLW9wICovXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEhlbHBlciB7XHJcbiAgICBzdGF0aWMgdHJ5UmVmcmVzaFN1YmdyaWQoZmM6IGFueSwgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBmYz8uZ2V0Q29udHJvbD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChncmlkPy5yZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBncmlkLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmYz8udWk/LnJlZnJlc2hSaWJib24/LigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFZpc2liaWxpdHkgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBhIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBkaXNhYmxlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0RGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTZXRzIHJlcXVpcmVkIGxldmVsIG9uIGFuIGF0dHJpYnV0ZS9jb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0UmVxdWlyZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgaXNSZXF1aXJlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChhdHRyPy5zZXRSZXF1aXJlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyLnNldFJlcXVpcmVkTGV2ZWwoaXNSZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUNvbnRyb2xIZWxwZXIuZ2V0TG9va3VwSWQoZmMsIGxvb2t1cEF0dHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gISFjdXJyZW50ICYmIFV0aWwuc2FuaXRpemVHdWlkKGN1cnJlbnQpID09PSBVdGlsLnNhbml0aXplR3VpZCh0YXJnZXRJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFR5cGUgZ3VhcmQ6IGNvbnRyb2wgc3VwcG9ydHMgc2V0RGlzYWJsZWQgKi9cclxuICAgIHN0YXRpYyBpc0Rpc2FibGVhYmxlKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sKTogY29udHJvbCBpcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sIHtcclxuICAgICAgICByZXR1cm4gXCJzZXREaXNhYmxlZFwiIGluIGNvbnRyb2wgJiYgdHlwZW9mIChjb250cm9sIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wpLnNldERpc2FibGVkID09PSBcImZ1bmN0aW9uXCI7XHJcbiAgICB9ICAgIFxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBkaWFsb2cgaGVscGVyIC0tLS1cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBSZXN1bHQge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZztcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBEaWFsb2dIZWxwZXIge1xyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHJpYnV0ZTogc3RyaW5nLFxyXG4gICAgICAgIGlkczogc3RyaW5nW10sXHJcbiAgICAgICAgb3B0aW9ucz86IFBhcnRpYWw8eyBhbGxvd011bHRpU2VsZWN0OiBib29sZWFuOyBkaXNhYmxlTXJ1OiBib29sZWFuOyBkZWZhdWx0Vmlld0lkOiBzdHJpbmcgfT5cclxuICAgICk6IFByb21pc2U8TG9va3VwUmVzdWx0W10+IHtcclxuICAgICAgICBjb25zdCBpblZhbHVlcyA9IGlkc1xyXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gYDx2YWx1ZSB1aXR5cGU9XCIke2VudGl0eUxvZ2ljYWx9XCI+eyR7VXRpbC5zYW5pdGl6ZUd1aWQoaWQpfX08L3ZhbHVlPmApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJYbWwgPSBgXHJcbiAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtpZEF0dHJpYnV0ZX1cIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAke2luVmFsdWVzfVxyXG4gICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgIDwvZmlsdGVyPmAudHJpbSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb29rdXBPcHRpb25zOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGFsbG93TXVsdGlTZWxlY3Q6IG9wdGlvbnM/LmFsbG93TXVsdGlTZWxlY3QgPz8gdHJ1ZSxcclxuICAgICAgICAgICAgZGVmYXVsdEVudGl0eVR5cGU6IGVudGl0eUxvZ2ljYWwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGVzOiBbZW50aXR5TG9naWNhbF0sXHJcbiAgICAgICAgICAgIGZpbHRlcnM6IFt7IGVudGl0eUxvZ2ljYWxOYW1lOiBlbnRpdHlMb2dpY2FsLCBmaWx0ZXJYbWwgfV0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNcnU6IG9wdGlvbnM/LmRpc2FibGVNcnUgPz8gdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8uZGVmYXVsdFZpZXdJZCkgbG9va3VwT3B0aW9ucy5kZWZhdWx0Vmlld0lkID0gb3B0aW9ucy5kZWZhdWx0Vmlld0lkO1xyXG5cclxuICAgICAgICByZXR1cm4gKGF3YWl0IFV0aWwuWHJtLlV0aWxpdHkubG9va3VwT2JqZWN0cyhsb29rdXBPcHRpb25zKSkgYXMgTG9va3VwUmVzdWx0W107XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gR2VuZXJpYyBsb29rdXAgT0RhdGEgc2VydmljZSAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRGaXJzdElkQnlGaWx0ZXIoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIG9kYXRhRmlsdGVyOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBgPyRzZWxlY3Q9JHtpZEF0dHJ9JiRmaWx0ZXI9JHtvZGF0YUZpbHRlcn1gO1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWwsIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IHJlcz8uZW50aXRpZXM/LlswXTtcclxuICAgICAgICBjb25zdCBpZCA9IHJvdz8uW2lkQXR0cl0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGdldElkQnlFcXVhbGl0eShcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgYXR0cjogc3RyaW5nLFxyXG4gICAgICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBsaXQgPSB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgIDogU3RyaW5nKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXJzdElkQnlGaWx0ZXIoZW50aXR5TG9naWNhbCwgaWRBdHRyLCBgKCR7YXR0cn0gZXEgJHtsaXR9KWApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRm9ybVdhaXQge1xyXG4gICAgc3RhdGljIHdhaXRGb3JMb29rdXBWYWx1ZShmYzogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHRpbWVvdXRNcyA9IDYwMDApOiBQcm9taXNlPFhybS5Mb29rdXBWYWx1ZSB8IG51bGw+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGVOYW1lKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghYXR0cikgcmV0dXJuIHJlc29sdmUobnVsbCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBub3cgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICBpZiAobm93Py5pZCkgcmV0dXJuIHJlc29sdmUobm93KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7IHRyeSB7IGF0dHIucmVtb3ZlT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfSB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbkNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkb25lKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgICAgIGlmICh2Py5pZCkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKHYpOyB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0cnkgeyBhdHRyLmFkZE9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChvbkNoYW5nZSwgMCk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgaWYgKCFkb25lKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUobnVsbCk7IH0gfSwgdGltZW91dE1zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE93bmVySGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRPd25lckF0dHJpYnV0ZShmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiAoZmM/LmdldEF0dHJpYnV0ZT8uKG93bmVyQXR0ck5hbWUpID8/IG51bGwpIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IE93bmVyUmVmIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpPy5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICBpZiAoIXY/LmlkIHx8ICF2LmVudGl0eVR5cGUpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiB7IGlkOiBVdGlsLnNhbml0aXplR3VpZCh2LmlkKSwgZW50aXR5VHlwZTogdi5lbnRpdHlUeXBlIGFzIGFueSwgbmFtZTogdi5uYW1lID8/IG51bGwgfTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2V0T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nLCBvd25lcjogT3duZXJSZWYpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk7XHJcbiAgICAgICAgaWYgKCFhdHRyKSByZXR1cm47XHJcbiAgICAgICAgYXR0ci5zZXRWYWx1ZShbe1xyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQob3duZXIuaWQpLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlOiBvd25lci5lbnRpdHlUeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiBvd25lci5uYW1lID8/IHVuZGVmaW5lZFxyXG4gICAgICAgIH0gYXMgYW55XSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGlzU2FtZU93bmVyKGE/OiBPd25lclJlZiB8IG51bGwsIGI/OiBPd25lclJlZiB8IG51bGwpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gYS5lbnRpdHlUeXBlID09PSBiLmVudGl0eVR5cGUgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoYS5pZCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKGIuaWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJpYyBzZXJ2aWNlOiBMb2FkIG93bmVyIChVc2VyIG9yIFRlYW0pIGZvciBhbnkgcmVjb3JkICovXHJcbmV4cG9ydCBjbGFzcyBPd25lclNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldE93bmVyUmVmKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWNvcmRJZDogc3RyaW5nLFxyXG4gICAgICAgIG93bmVyQXR0ck5hbWUgPSBcIm93bmVyaWRcIlxyXG4gICAgKTogUHJvbWlzZTxPd25lclJlZiB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKHJlY29yZElkKTtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gRm9yIHBvbHltb3JwaGljIG93bmVyIGxvb2t1cHMsIGV4cGFuZCBkZWRpY2F0ZWQgbmF2IHByb3BzIHRvIGF2b2lkIHByb3BlcnR5LW5vdC1mb3VuZCBlcnJvcnNcclxuICAgICAgICBjb25zdCBleHBhbmQgPSBgPyRzZWxlY3Q9JHtvd25lckF0dHJOYW1lfSYkZXhwYW5kPW93bmluZ3VzZXIoJHNlbGVjdD1zeXN0ZW11c2VyaWQsZnVsbG5hbWUpLG93bmluZ3RlYW0oJHNlbGVjdD10ZWFtaWQsbmFtZSlgO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsLCBpZCwgZXhwYW5kKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXNlciA9IHJlYz8uW1wib3duaW5ndXNlclwiXTtcclxuICAgICAgICBpZiAodXNlcj8uc3lzdGVtdXNlcmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodXNlci5zeXN0ZW11c2VyaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLmZ1bGxuYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlYW0gPSByZWM/LltcIm93bmluZ3RlYW1cIl07XHJcbiAgICAgICAgaWYgKHRlYW0/LnRlYW1pZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHRlYW0udGVhbWlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwidGVhbVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdGVhbS5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogU2VjdXJpdHktcmVsYXRlZCBoZWxwZXJzICovXHJcbmV4cG9ydCBjbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xyXG4gICAgICAgIC8qKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBpZCBmcm9tIFhybSBjb250ZXh0ICovXHJcbiAgICAgICAgc3RhdGljIGdldEN1cnJlbnRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuWHJtPy5VdGlsaXR5Py5nZXRHbG9iYWxDb250ZXh0Py4oKT8udXNlclNldHRpbmdzPy51c2VySWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybnMgcm9sZSBuYW1lcyBvZiB0aGUgY3VycmVudCB1c2VyICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGdldEN1cnJlbnRVc2VyUm9sZXMoKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W10+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuZ2V0Q3VycmVudFVzZXJJZCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1c2VySWQpIHJldHVybiBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGZXRjaFhNTCBvdmVyIHN5c3RlbXVzZXJyb2xlcyAoTjpOKSB0byByb2xlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgICAgIDxmZXRjaCB2ZXJzaW9uPVwiMS4wXCIgZGlzdGluY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwicm9sZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJyb2xlaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2Vycm9sZXNcIiBmcm9tPVwicm9sZWlkXCIgdG89XCJyb2xlaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJcIiBmcm9tPVwic3lzdGVtdXNlcmlkXCIgdG89XCJzeXN0ZW11c2VyaWRcIiBhbGlhcz1cInVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7dXNlcklkfVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9mZXRjaD5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5mZXRjaFhtbChcInJvbGVcIiwgZmV0Y2hYbWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXMuZW50aXRpZXMgfHwgW10pLm1hcCgoZSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKGVbXCJyb2xlaWRcIl0gPz8gZVtcIl9yb2xlaWRfdmFsdWVcIl0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlW1wibmFtZVwiXSBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICB9KSkuZmlsdGVyKHIgPT4gISFyLmlkICYmICEhci5uYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDaGVja3MgaWYgY3VycmVudCB1c2VyIGhhcyBvbmUgb2YgdGhlIHByb3ZpZGVkIHJvbGUgbmFtZXMgKGNhc2UtaW5zZW5zaXRpdmUpICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGhhc0N1cnJlbnRVc2VyUm9sZSguLi5yb2xlTmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3YW50ZWQgPSBuZXcgU2V0KHJvbGVOYW1lcy5tYXAobiA9PiBuLnRyaW0oKS50b0xvd2VyQ2FzZSgpKS5maWx0ZXIoQm9vbGVhbikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhbnRlZC5zaXplID09PSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb2xlcyA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudFVzZXJSb2xlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvbGVzLnNvbWUociA9PiB3YW50ZWQuaGFzKHIubmFtZS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBjb250cm9sIHZpZXcgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBWaWV3SGVscGVyIHtcclxuICAgIC8qKiBSZXN0cmljdCBhIGxvb2t1cCBjb250cm9sIHRvIHNwZWNpZmljIGVudGl0eSB0eXBlcyAqL1xyXG4gICAgc3RhdGljIHNldEVudGl0eVR5cGVzKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGVudGl0eVR5cGVzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjdHJsPy5zZXRFbnRpdHlUeXBlcz8uKGVudGl0eVR5cGVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkIGEgY3VzdG9tIHZpZXcgdG8gYSBsb29rdXAgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIGFkZEN1c3RvbVZpZXcoXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICBjb250cm9sTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGVudGl0eU5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3RGlzcGxheU5hbWU6IHN0cmluZyxcclxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nLFxyXG4gICAgICAgIGxheW91dFhtbDogc3RyaW5nLFxyXG4gICAgICAgIHNldEFzRGVmYXVsdDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWN0cmw/LmFkZEN1c3RvbVZpZXcpIHJldHVybjtcclxuICAgICAgICAgICAgY3RybC5hZGRDdXN0b21WaWV3KHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbC50cmltKCksIGxheW91dFhtbC50cmltKCksIHNldEFzRGVmYXVsdCk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZHMgYSBjdXN0b20gdmlldyBmb3Igb3duZXIgbG9va3VwIHRvIHNob3cgb25seSB0ZWFtcyB0aGUgY3VycmVudCB1c2VyIGJlbG9uZ3MgdG8uICovXHJcbiAgICBzdGF0aWMgYWRkT3duZXJUZWFtVmlld0ZvckN1cnJlbnRVc2VyKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcgPSBcIm93bmVyaWRcIik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBcInRlYW1cIjtcclxuICAgICAgICBjb25zdCB2aWV3RGlzcGxheU5hbWUgPSBcIk93bmVyVGVhbUxvb2t1cFZpZXdcIjtcclxuICAgICAgICBjb25zdCB2aWV3SWQgPSBcInswMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDF9XCI7XHJcblxyXG4gICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICA8ZmV0Y2g+XHJcbiAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJ0ZWFtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiYnVzaW5lc3N1bml0aWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwibmV2X293bmVydGVhbTJzeXN0ZW11c2VyXCIgZnJvbT1cInRlYW1pZFwiIHRvPVwidGVhbWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxLXVzZXJpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgPC9mZXRjaD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBjb25zdCBsYXlvdXRYbWwgPSBgXHJcbiAgICAgICAgICAgIDxncmlkIG5hbWU9J3Jlc3VsdHNldCcgb2JqZWN0PScxJyBqdW1wPSd0ZWFtaWQnIHNlbGVjdD0nMScgaWNvbj0nMScgcHJldmlldz0nMSc+XHJcbiAgICAgICAgICAgICAgICA8cm93IG5hbWU9J3Jlc3VsdCcgaWQ9J3RlYW1pZCc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nbmFtZScgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSdidXNpbmVzc3VuaXRpZCcgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgIDwvcm93PlxyXG4gICAgICAgICAgICA8L2dyaWQ+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgTG9va3VwVmlld0hlbHBlci5hZGRDdXN0b21WaWV3KGZjLCBjb250cm9sTmFtZSwgdmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLCBsYXlvdXRYbWwsIHRydWUpO1xyXG4gICAgfVxyXG59IiwiLy8gUG9ydGZvbGlvLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgQUNDT1VOVCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb1wiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGFtYmN1c3RfbG9jYXRpb25pZDogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsImV4cG9ydCBjb25zdCBDT01QQU5ZID0ge1xyXG4gICAgZW50aXR5OiBcImFjY291bnRcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFjY291bnRpZFwiLFxyXG4gICAgICAgIG5ldl9idXNpbmVzc3VuaXQ6IFwibmV2X2J1c2luZXNzdW5pdFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJleHBvcnQgY29uc3QgQ09OVEFDVCA9IHtcclxuICAgIGVudGl0eTogXCJjb250YWN0XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJjb250YWN0aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0aWQ6IFwibmV2X2J1c2luZXNzdW5pdGlkXCIsXHJcbiAgICAgICAgb3duZXJpZDogXCJvd25lcmlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0OyIsImltcG9ydCB0eXBlIHsgQnVzaW5lc3NVbml0Q29uZmlnLCBFbnRpdHlDb25maWcgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJVU0lORVNTVU5JVExPQ0FUSU9OID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3RfbG9jYXRpb25cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgICAgIG1hbmRhdG9yeUNvbmZpZ0pzb246IFwibWh3cm1iX21hbmRhdG9yeWNvbmZpZ2pzb25cIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vKiogU2FmZSBwYXJzZTsgcmV0dXJucyBudWxsIGlmIGludmFsaWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCk6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIEJ1c2luZXNzVW5pdENvbmZpZztcclxuICAgICAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiIHx8ICFwYXJzZWQuZW50aXRpZXMpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIENvbGxlY3QgYmFzZSBhdHRyaWJ1dGUgbmFtZXMgdXNlZCBpbiBjb25kaXRpb25zIChmb3IgYXV0byBPbkNoYW5nZSB3aXJpbmcpLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGlzdENvbmRpdGlvbkZpZWxkcyhlbnRpdHlDb25maWc/OiBFbnRpdHlDb25maWcpOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoIWVudGl0eUNvbmZpZz8ucnVsZXM/Lmxlbmd0aCkgcmV0dXJuIFtdO1xyXG4gICAgY29uc3QgZmllbGRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IHIgb2YgZW50aXR5Q29uZmlnLnJ1bGVzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIHIuY29uZGl0aW9uID8/IFtdKSB7XHJcbiAgICAgICAgICAgIGlmICghYy5maWVsZCkgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGJpbmQgb24gdGhlIGJhc2UgYXR0cmlidXRlIChiZWZvcmUgcHJvamVjdGlvbiBsaWtlIC5uYW1lKVxyXG4gICAgICAgICAgICBmaWVsZHMuYWRkKGMuZmllbGQuc3BsaXQoXCIuXCIsIDEpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShmaWVsZHMpO1xyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgdHlwZSB7IEJ1c2luZXNzVW5pdENvbmZpZywgQ29uZGl0aW9uLCBFbnRpdHlDb25maWcgfSBmcm9tIFwiLi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQsIFV0aWwsIFZpc2liaWxpdHlIZWxwZXIgfSBmcm9tIFwiLi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBldmFsdWF0ZUNvbmRpdGlvbiwgcmVhZEF0dHJpYnV0ZVZhbHVlLCBpc0xvb2t1cEFycmF5IH0gZnJvbSBcIi4uLy4uL2NvcmUvY29uZGl0aW9uLmV2YWx1YXRvclwiO1xyXG5pbXBvcnQgeyBCVVNJTkVTU1VOSVRMT0NBVElPTiwgcGFyc2VCdXNpbmVzc1VuaXRDb25maWcsIGxpc3RDb25kaXRpb25GaWVsZHMgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eVwiO1xyXG5pbXBvcnQgeyBDT05UQUNUIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5XCI7XHJcbmltcG9ydCB7IENPTVBBTlkgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvQ29tcGFueS5lbnRpdHlcIjtcclxuaW1wb3J0IHsgQUNDT1VOVCB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9BY2NvdW50LmVudGl0eVwiO1xyXG5cclxuXHJcbmNvbnN0IGJ1c2luZXNzVW5pdENvbmZpZ0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGw+KCk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUR5bmFtaWNNYW5kYXRvcnlGaWVsZHMoZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgbG9hZEJ1c2luZXNzVW5pdENvbmZpZyhmb3JtQ29udGV4dCk7XHJcbiAgICBhcHBseUNvbmZpZ01lcmdlZChmb3JtQ29udGV4dCwgY29uZmlnKTtcclxuICAgIGF1dG9XaXJlT25DaGFuZ2UoZm9ybUNvbnRleHQsIGNvbmZpZyk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhcHBseUR5bmFtaWNNYW5kYXRvcnlSdWxlcyhleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZm9ybUNvbnRleHQgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCBsb2FkQnVzaW5lc3NVbml0Q29uZmlnKGZvcm1Db250ZXh0KTtcclxuICAgIGFwcGx5Q29uZmlnTWVyZ2VkKGZvcm1Db250ZXh0LCBjb25maWcpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBsb2FkQnVzaW5lc3NVbml0Q29uZmlnKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQpOiBQcm9taXNlPEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGw+IHtcclxuICAgIGNvbnN0IGJ1c2luZXNzVW5pdEF0dHJpYnV0ZSA9IGdldEJ1c2luZXNzVW5pdEF0dHJpYnV0ZUZvckZvcm0oZm9ybUNvbnRleHQpO1xyXG4gICAgY29uc3QgYXR0ciA9IGJ1c2luZXNzVW5pdEF0dHJpYnV0ZSA/IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShidXNpbmVzc1VuaXRBdHRyaWJ1dGUpIDogdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgdmFsID0gYXR0cj8uZ2V0VmFsdWU/LigpO1xyXG4gICAgY29uc3QgbG9jYXRpb25JZCA9IGlzTG9va3VwQXJyYXkodmFsKSA/IFV0aWwuc2FuaXRpemVHdWlkKHZhbFswXS5pZCkgOiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGNhY2hlS2V5ID0gbG9jYXRpb25JZCA/IGBsb2NhdGlvbjoke2xvY2F0aW9uSWR9YCA6IFwibG9jYXRpb246bnVsbFwiO1xyXG4gICAgaWYgKGJ1c2luZXNzVW5pdENvbmZpZ0NhY2hlLmhhcyhjYWNoZUtleSkpIHJldHVybiBidXNpbmVzc1VuaXRDb25maWdDYWNoZS5nZXQoY2FjaGVLZXkpID8/IG51bGw7XHJcblxyXG4gICAgaWYgKCFsb2NhdGlvbklkKSB7XHJcbiAgICAgICAgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGZpZWxkTG9naWNhbCA9IEJVU0lORVNTVU5JVExPQ0FUSU9OLmZpZWxkcy5tYW5kYXRvcnlDb25maWdKc29uO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChCVVNJTkVTU1VOSVRMT0NBVElPTi5lbnRpdHksIGxvY2F0aW9uSWQsIGA/JHNlbGVjdD0ke2ZpZWxkTG9naWNhbH1gKTtcclxuICAgICAgICBjb25zdCBqc29uVGV4dCA9IChyZWMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkTG9naWNhbF0gYXMgc3RyaW5nIHwgbnVsbDtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dCk7XHJcbiAgICAgICAgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUuc2V0KGNhY2hlS2V5LCBwYXJzZWQpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICBidXNpbmVzc1VuaXRDb25maWdDYWNoZS5zZXQoY2FjaGVLZXksIG51bGwpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUNvbmZpZ01lcmdlZChmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LCBjb25maWc6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwpOiB2b2lkIHtcclxuICAgIGlmICghY29uZmlnPy5lbnRpdGllcykgcmV0dXJuO1xyXG4gICAgY29uc3QgZW50aXR5TG9naWNhbE5hbWUgPSBmb3JtQ29udGV4dC5kYXRhLmVudGl0eS5nZXRFbnRpdHlOYW1lKCk7XHJcbiAgICBjb25zdCBlbnRpdHlDb25maWc6IEVudGl0eUNvbmZpZyB8IHVuZGVmaW5lZCA9IGNvbmZpZy5lbnRpdGllc1tlbnRpdHlMb2dpY2FsTmFtZV07XHJcbiAgICBpZiAoIWVudGl0eUNvbmZpZykgcmV0dXJuO1xyXG5cclxuICAgIC8vIDEpIFJlc2V0OiBjbGVhciByZXF1aXJlZCBmbGFnIGZvciBhbGwgZmllbGRzIHRoYXQgY291bGQgYmUgbWFya2VkIG1hbmRhdG9yeSBieSBkZWZhdWx0cyBvciBhbnkgcnVsZVxyXG4gICAgcmVzZXRQb3RlbnRpYWxNYW5kYXRvcnkoZm9ybUNvbnRleHQsIGVudGl0eUNvbmZpZyk7XHJcblxyXG4gICAgLy8gMikgRXZhbHVhdGUgcnVsZXMgYW5kIG1lcmdlIHJlc3VsdGluZyBtYW5kYXRvcnkgZmllbGRzXHJcbiAgICBjb25zdCBtZXJnZWQ6IHN0cmluZ1tdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgZW50aXR5Q29uZmlnLnJ1bGVzID8/IFtdKSB7XHJcbiAgICAgICAgaWYgKHJ1bGVNYXRjaGVzKGZvcm1Db250ZXh0LCBydWxlLmNvbmRpdGlvbikpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBydWxlLm1hbmRhdG9yeSA/PyBbXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtZXJnZWQuaW5jbHVkZXMoZmllbGQpKSBtZXJnZWQucHVzaChmaWVsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBtZXJnZWQubGVuZ3RoID8gbWVyZ2VkIDogZW50aXR5Q29uZmlnLmRlZmF1bHQgPz8gW107XHJcbiAgICByZXF1aXJlZEZpZWxkcy5mb3JFYWNoKGZpZWxkTG9naWNhbCA9PiBWaXNpYmlsaXR5SGVscGVyLnNldFJlcXVpcmVkKGZvcm1Db250ZXh0LCBmaWVsZExvZ2ljYWwsIHRydWUpKTtcclxufVxyXG5cclxuLy8gQ2xlYXJzIHJlcXVpcmVkIGZsYWcgb24gYWxsIGZpZWxkcyB0aGF0IGNvdWxkIGJlIG1hcmtlZCBtYW5kYXRvcnkgYnkgZGVmYXVsdHMgb3IgYW55IHJ1bGUgZm9yIGEgZ2l2ZW4gZW50aXR5IGNvbmZpZ1xyXG5mdW5jdGlvbiByZXNldFBvdGVudGlhbE1hbmRhdG9yeShmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LCBlbnRpdHlDb25maWc6IEVudGl0eUNvbmZpZyk6IHZvaWQge1xyXG4gICAgY29uc3QgcG90ZW50aWFsTWFuZGF0b3J5ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGYgb2YgZW50aXR5Q29uZmlnLmRlZmF1bHQgPz8gW10pIHBvdGVudGlhbE1hbmRhdG9yeS5hZGQoZik7XHJcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgZW50aXR5Q29uZmlnLnJ1bGVzID8/IFtdKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIHJ1bGUubWFuZGF0b3J5ID8/IFtdKSBwb3RlbnRpYWxNYW5kYXRvcnkuYWRkKGYpO1xyXG4gICAgfVxyXG4gICAgcG90ZW50aWFsTWFuZGF0b3J5LmZvckVhY2goZmllbGRMb2dpY2FsID0+IFZpc2liaWxpdHlIZWxwZXIuc2V0UmVxdWlyZWQoZm9ybUNvbnRleHQsIGZpZWxkTG9naWNhbCwgZmFsc2UpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcnVsZU1hdGNoZXMoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgY29uZGl0aW9ucz86IENvbmRpdGlvbltdKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIWNvbmRpdGlvbnMgfHwgY29uZGl0aW9ucy5sZW5ndGggPT09IDApIHJldHVybiB0cnVlO1xyXG4gICAgZm9yIChjb25zdCBjb25kaXRpb24gb2YgY29uZGl0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IGFjdHVhbCA9IHJlYWRBdHRyaWJ1dGVWYWx1ZShmb3JtQ29udGV4dCwgY29uZGl0aW9uLmZpZWxkKTtcclxuICAgICAgICBpZiAoIWV2YWx1YXRlQ29uZGl0aW9uKGFjdHVhbCwgY29uZGl0aW9uKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGF1dG9XaXJlT25DaGFuZ2UoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgY29uZmlnOiBCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsKTogdm9pZCB7XHJcbiAgICBpZiAoIWNvbmZpZz8uZW50aXRpZXMpIHJldHVybjtcclxuICAgIGNvbnN0IGVudGl0eUxvZ2ljYWxOYW1lID0gZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5TmFtZSgpO1xyXG4gICAgY29uc3QgZW50aXR5Q29uZmlnID0gY29uZmlnLmVudGl0aWVzW2VudGl0eUxvZ2ljYWxOYW1lXSBhcyBFbnRpdHlDb25maWcgfCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBmaWVsZHMgPSBsaXN0Q29uZGl0aW9uRmllbGRzKGVudGl0eUNvbmZpZyk7XHJcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cmlidXRlKSBjb250aW51ZTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gKGN0eDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpID0+IGFwcGx5RHluYW1pY01hbmRhdG9yeVJ1bGVzKGN0eCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvLyBpZ25vcmVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIFJlc29sdmVzIHRoZSBjb3JyZWN0IGJ1c2luZXNzLXVuaXQvbG9jYXRpb24gbG9va3VwIGF0dHJpYnV0ZSBiYXNlZCBvbiB0aGUgY3VycmVudCBmb3JtJ3MgZW50aXR5XHJcbmZ1bmN0aW9uIGdldEJ1c2luZXNzVW5pdEF0dHJpYnV0ZUZvckZvcm0oZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBmb3JtQ29udGV4dD8uZGF0YT8uZW50aXR5Py5nZXRFbnRpdHlOYW1lPy4oKTtcclxuICAgICAgICBzd2l0Y2ggKGVudGl0eU5hbWUpIHtcclxuICAgICAgICAgICAgY2FzZSBDT05UQUNULmVudGl0eTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBDT05UQUNULmZpZWxkcy5uZXZfYnVzaW5lc3N1bml0aWQ7IC8vIGNvbnRhY3RcclxuICAgICAgICAgICAgY2FzZSBDT01QQU5ZLmVudGl0eTpcclxuICAgICAgICAgICAgICAgIHJldHVybiBDT01QQU5ZLmZpZWxkcy5uZXZfYnVzaW5lc3N1bml0OyAvLyBhY2NvdW50IChuZXZfYnVzaW5lc3N1bml0KVxyXG4gICAgICAgICAgICBjYXNlIEFDQ09VTlQuZW50aXR5OlxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIEFDQ09VTlQuZmllbGRzLmFtYmN1c3RfbG9jYXRpb25pZDsgLy8gcG9ydGZvbGlvXHJcbiAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=