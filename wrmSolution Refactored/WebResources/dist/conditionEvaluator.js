/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./WebResources/src/core/crm.core.ts":
/*!*******************************************!*\
  !*** ./WebResources/src/core/crm.core.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApiClient: () => (/* binding */ ApiClient),
/* harmony export */   FormHelper: () => (/* binding */ FormHelper),
/* harmony export */   GridHelper: () => (/* binding */ GridHelper),
/* harmony export */   LookupDialogHelper: () => (/* binding */ LookupDialogHelper),
/* harmony export */   LookupService: () => (/* binding */ LookupService),
/* harmony export */   Util: () => (/* binding */ Util),
/* harmony export */   VisibilityHelper: () => (/* binding */ VisibilityHelper)
/* harmony export */ });
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
class FormHelper {
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
            const current = FormHelper.getLookupId(fc, lookupAttr);
            return !!current && Util.sanitizeGuid(current) === Util.sanitizeGuid(targetId);
        });
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
/*!******************************************************!*\
  !*** ./WebResources/src/core/condition.evaluator.ts ***!
  \******************************************************/
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

})();

(window.WRM = window.WRM || {}).conditionEvaluator = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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R0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzFCLElBQUksQ0FBQyxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztvQkFBRSxPQUFPLElBQUksQ0FBQztZQUN6RSxDQUFDO2lCQUFNLElBQUksa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksSUFBSSxLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7b0JBQUUsT0FBTyxJQUFJLENBQUM7WUFDdEcsQ0FBQztpQkFBTSxJQUFJLFdBQVcsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsT0FBTyxJQUFJLENBQUM7WUFDaEIsQ0FBQztRQUNMLENBQUM7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRUQsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jb25kaXRpb24uZXZhbHVhdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIC0tLS0gVHlwZXMgc2hhcmVkIGFjcm9zcyBlbmdpbmUgJiBlbnRpdGllcyAtLS0tXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCIgfCBcIm5vdG51bGxcIjsgLy8gYWxpYXNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcclxuICAgIC8qKiBMb2dpY2FsIG5hbWUgKHN1cHBvcnRzIGRvdC1ub3RhdGlvbiBmb3IgbG9va3VwIHByb2plY3Rpb25zOiBlLmcuLCBcInByaW1hcnljb250YWN0aWQubmFtZVwiKS4gKi9cclxuICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKiogT3B0aW9uYWwgdmFsdWUgZm9yIGNvbXBhcmlzb25zIChvbWl0dGVkIGZvciBudWxsLW9wZXJhdG9ycykuICovXHJcbiAgICB2YWx1ZT86IHVua25vd247XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgbWFuZGF0b3J5Pzogc3RyaW5nW107XHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gQU5ELWNvbmp1bmN0aW9uOyBlbXB0eS91bmRlZmluZWQg4oeSIHJ1bGUgYWx3YXlzIG1hdGNoZXNcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdD86IHN0cmluZ1tdO1xyXG4gICAgcnVsZXM/OiBSdWxlW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVzaW5lc3NVbml0Q29uZmlnIHtcclxuICAgIHZlcnNpb246IG51bWJlcjtcclxuICAgIGVudGl0aWVzOiBSZWNvcmQ8c3RyaW5nLCBFbnRpdHlDb25maWc+O1xyXG59XHJcblxyXG4vKiogTGlnaHR3ZWlnaHQgY29tcGFyYWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxvb2t1cCAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgaWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICBuYW1lOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBDb3JlIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcbiAgICBzdGF0aWMgZ2V0IFhybSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkuWHJtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBMb3dlcmNhc2UsIHN0cmlwIGJyYWNlczsgcmV0dXJucyBlbXB0eSBzdHJpbmcgaWYgZmFsc3kgaW5wdXQuICovXHJcbiAgICBzdGF0aWMgc2FuaXRpemVHdWlkKGlkPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKGlkIHx8IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdW5pcXVlPFQ+KGFycjogVFtdKTogVFtdIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFRoaW4gV2ViIEFQSSB3cmFwcGVyIC0tLS1cclxuZXhwb3J0IGNsYXNzIEFwaUNsaWVudCB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5JZCA9IFV0aWwuc2FuaXRpemVHdWlkKGlkKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lLCBjbGVhbklkLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGZldGNoWG1sKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGZldGNoWG1sOiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgP2ZldGNoWG1sPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGZldGNoWG1sLnRyaW0oKSl9YDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCB1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBleGVjdXRlKHJlcXVlc3Q6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBhc3NvY2lhdGVNYW55VG9NYW55KFxyXG4gICAgICAgIHBhcmVudEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRJZDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0aW9uc2hpcFNjaGVtYU5hbWU6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkRW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRJZHM6IHN0cmluZ1tdXHJcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCByZXEgPSB7XHJcbiAgICAgICAgICAgIHRhcmdldDogeyBlbnRpdHlUeXBlOiBwYXJlbnRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocGFyZW50SWQpIH0sXHJcbiAgICAgICAgICAgIHJlbGF0ZWRFbnRpdGllczogcmVsYXRlZElkcy5tYXAoKHJpZCkgPT4gKHsgZW50aXR5VHlwZTogcmVsYXRlZEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChyaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0gYXMgYW55O1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEFwaUNsaWVudC5leGVjdXRlKHJlcSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBBc3NvY2lhdGlvbiBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gRm9ybSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIEZvcm1IZWxwZXIge1xyXG4gICAgc3RhdGljIGdldEN1cnJlbnRJZChmYzogYW55KTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWRSYXcgPSBmYz8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJhdyA/IFV0aWwuc2FuaXRpemVHdWlkKGlkUmF3KSA6IG51bGw7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdyaWQucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVmlzaWJpbGl0eSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTZXRzIHJlcXVpcmVkIGxldmVsIG9uIGFuIGF0dHJpYnV0ZS9jb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0UmVxdWlyZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgaXNSZXF1aXJlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChhdHRyPy5zZXRSZXF1aXJlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyLnNldFJlcXVpcmVkTGV2ZWwoaXNSZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgZGlhbG9nIGhlbHBlciAtLS0tXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nIH0+XHJcbiAgICApOiBQcm9taXNlPExvb2t1cFJlc3VsdFtdPiB7XHJcbiAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBpZHNcclxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IGA8dmFsdWUgdWl0eXBlPVwiJHtlbnRpdHlMb2dpY2FsfVwiPnske1V0aWwuc2FuaXRpemVHdWlkKGlkKX19PC92YWx1ZT5gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyWG1sID0gYFxyXG4gICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7aWRBdHRyaWJ1dGV9XCIgb3BlcmF0b3I9XCJpblwiPlxyXG4gICAgICAgICAgJHtpblZhbHVlc31cclxuICAgICAgICA8L2NvbmRpdGlvbj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN0YXRlY29kZVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIjBcIiAvPlxyXG4gICAgICA8L2ZpbHRlcj5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9va3VwT3B0aW9uczogYW55ID0ge1xyXG4gICAgICAgICAgICBhbGxvd011bHRpU2VsZWN0OiBvcHRpb25zPy5hbGxvd011bHRpU2VsZWN0ID8/IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHRFbnRpdHlUeXBlOiBlbnRpdHlMb2dpY2FsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlczogW2VudGl0eUxvZ2ljYWxdLFxyXG4gICAgICAgICAgICBmaWx0ZXJzOiBbeyBlbnRpdHlMb2dpY2FsTmFtZTogZW50aXR5TG9naWNhbCwgZmlsdGVyWG1sIH1dLFxyXG4gICAgICAgICAgICBkaXNhYmxlTXJ1OiBvcHRpb25zPy5kaXNhYmxlTXJ1ID8/IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LmRlZmF1bHRWaWV3SWQpIGxvb2t1cE9wdGlvbnMuZGVmYXVsdFZpZXdJZCA9IG9wdGlvbnMuZGVmYXVsdFZpZXdJZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCBVdGlsLlhybS5VdGlsaXR5Lmxvb2t1cE9iamVjdHMobG9va3VwT3B0aW9ucykpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEdlbmVyaWMgbG9va3VwIE9EYXRhIHNlcnZpY2UgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRJZEJ5RXF1YWxpdHkoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIGF0dHI6IHN0cmluZyxcclxuICAgICAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhblxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgbGl0ID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCA6IFN0cmluZyh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RJZEJ5RmlsdGVyKGVudGl0eUxvZ2ljYWwsIGlkQXR0ciwgYCgke2F0dHJ9IGVxICR7bGl0fSlgKTtcclxuICAgIH1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQ29uZGl0aW9uLCBMb29rdXBDb21wYXJhYmxlLCBPcGVyYXRvciwgVXRpbCB9IGZyb20gXCIuLi9jb3JlL2NybS5jb3JlXCI7XHJcblxyXG5mdW5jdGlvbiBpc011bHRpU2VsZWN0QXJyYXkodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBBcnJheTxudW1iZXIgfCBzdHJpbmc+IHtcclxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHYgPT09IFwic3RyaW5nXCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0xvb2t1cENvbXBhcmFibGUodjogdW5rbm93bik6IHYgaXMgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICByZXR1cm4gISF2ICYmIHR5cGVvZiB2ID09PSBcIm9iamVjdFwiICYmIChcImlkXCIgaW4gKHYgYXMgYW55KSB8fCBcIm5hbWVcIiBpbiAodiBhcyBhbnkpIHx8IFwiZW50aXR5VHlwZVwiIGluICh2IGFzIGFueSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b0d1aWRPck51bGwodmFsdWU6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGNvbnN0IHMgPSBTdHJpbmcodmFsdWUgPz8gXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17MTJ9JC8udGVzdChzKSA/IHMgOiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc051bGxpc2hPckVtcHR5KHY6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgIGlmICh2ID09IG51bGwpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKSByZXR1cm4gdi50cmltKCkgPT09IFwiXCI7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkgcmV0dXJuIHYubGVuZ3RoID09PSAwO1xyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZSh2KSkgcmV0dXJuICF2LmlkICYmICF2Lm5hbWU7IC8vIGJvdGggZW1wdHlcclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplU2NhbGFyKHg6IHVua25vd24pOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbCh4KTtcclxuICAgIGlmIChnKSByZXR1cm4gYGd1aWQ6JHtnfWA7XHJcbiAgICBjb25zdCBuID0gTnVtYmVyKHgpO1xyXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4obikpIHJldHVybiBgbnVtOiR7bn1gO1xyXG4gICAgaWYgKHR5cGVvZiB4ID09PSBcImJvb2xlYW5cIikgcmV0dXJuIGBib29sOiR7eH1gO1xyXG4gICAgcmV0dXJuIGBzdHI6JHtTdHJpbmcoeCA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpfWA7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0xvb2t1cEFycmF5KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgWHJtLkxvb2t1cFZhbHVlW10ge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSAmJlxyXG4gICAgICAgIHZhbHVlLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICB0eXBlb2YgdmFsdWVbMF0gPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICB2YWx1ZVswXSAhPT0gbnVsbCAmJlxyXG4gICAgICAgIFwiaWRcIiBpbiAodmFsdWVbMF0gYXMgb2JqZWN0KSAmJlxyXG4gICAgICAgIHR5cGVvZiAodmFsdWVbMF0gYXMgWHJtLkxvb2t1cFZhbHVlKS5pZCA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufVxyXG4vKiogUmVhZCBhIHZhbHVlIGZyb20gdGhlIGZvcm07IHN1cHBvcnRzIGxvb2t1cCBwcm9qZWN0aW9ucyB2aWEgZG90LW5vdGF0aW9uLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZEF0dHJpYnV0ZVZhbHVlKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGZpZWxkUGF0aDogc3RyaW5nKTogdW5rbm93biB7XHJcbiAgICBjb25zdCBbbG9naWNhbE5hbWUsIHByb2plY3Rpb25dID0gZmllbGRQYXRoLnNwbGl0KFwiLlwiLCAyKTtcclxuICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShsb2dpY2FsTmFtZSk7XHJcbiAgICBpZiAoIWF0dHJpYnV0ZSB8fCB0eXBlb2YgYXR0cmlidXRlLmdldFZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybiB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3QgcmF3ID0gYXR0cmlidXRlLmdldFZhbHVlKCk7XHJcblxyXG4gICAgLy8gTG9va3VwIC8gUGFydHlsaXN0XHJcbiAgICBpZiAoaXNMb29rdXBBcnJheShyYXcpKSB7XHJcbiAgICAgICAgY29uc3QgbHYgPSByYXdbMF0gYXMgWHJtLkxvb2t1cFZhbHVlICYgeyBlbnRpdHlUeXBlPzogc3RyaW5nIH07XHJcbiAgICAgICAgY29uc3Qgb2JqOiBMb29rdXBDb21wYXJhYmxlID0ge1xyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQobHYuaWQpLFxyXG4gICAgICAgICAgICBuYW1lOiBsdi5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IGx2LmVudGl0eVR5cGUgPz8gbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAocHJvamVjdGlvbikge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHByb2plY3Rpb24udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImlkXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5pZDtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJuYW1lXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5uYW1lO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImVudGl0eXR5cGVcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmVudGl0eVR5cGU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iajsgLy8gZGVmYXVsdDogb2JqZWN0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTXVsdGktU2VsZWN0IE9wdGlvblNldFxyXG4gICAgaWYgKGlzTXVsdGlTZWxlY3RBcnJheShyYXcpKSByZXR1cm4gcmF3O1xyXG5cclxuICAgIC8vIFByaW1pdGl2ZVxyXG4gICAgcmV0dXJuIHJhdyBhcyB1bmtub3duO1xyXG59XHJcblxyXG4vKiogRXZhbHVhdGUgc2luZ2xlIGNvbmRpdGlvbiBhZ2FpbnN0IGFjdHVhbCB2YWx1ZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlQ29uZGl0aW9uKGFjdHVhbDogdW5rbm93biwgY29uZGl0aW9uOiBDb25kaXRpb24pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG9wID0gKGNvbmRpdGlvbi5vcGVyYXRvciB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpIGFzIE9wZXJhdG9yO1xyXG4gICAgY29uc3QgdmFsID0gKGNvbmRpdGlvbiBhcyB7IHZhbHVlPzogdW5rbm93biB9KS52YWx1ZTtcclxuXHJcbiAgICBzd2l0Y2ggKG9wKSB7XHJcbiAgICAgICAgY2FzZSBcImVxXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbHNTbWFydChhY3R1YWwsIHZhbCk7XHJcbiAgICAgICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhZXF1YWxzU21hcnQoYWN0dWFsLCB2YWwpO1xyXG4gICAgICAgIGNhc2UgXCJpblwiOlxyXG4gICAgICAgICAgICByZXR1cm4gaW5TbWFydChhY3R1YWwsIHZhbCk7XHJcbiAgICAgICAgY2FzZSBcImlzbnVsbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gaXNOdWxsaXNoT3JFbXB0eShhY3R1YWwpO1xyXG4gICAgICAgIGNhc2UgXCJpc25vdG51bGxcIjpcclxuICAgICAgICBjYXNlIFwibm90bnVsbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gIWlzTnVsbGlzaE9yRW1wdHkoYWN0dWFsKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsc1NtYXJ0KGE6IHVua25vd24sIGI6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUoYSkpIHtcclxuICAgICAgICBpZiAoYiA9PSBudWxsKSByZXR1cm4gaXNOdWxsaXNoT3JFbXB0eShhKTtcclxuICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbChiKTtcclxuICAgICAgICAgICAgaWYgKGcpIHJldHVybiAoYS5pZCA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBnOyAvLyBHVUlEID8gY29tcGFyZSBJRFxyXG4gICAgICAgICAgICByZXR1cm4gKGEubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBiLnRvTG93ZXJDYXNlKCk7IC8vIGVsc2UgY29tcGFyZSBuYW1lXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUoYikpIHtcclxuICAgICAgICAgICAgaWYgKGEuaWQgJiYgYi5pZCkgcmV0dXJuIGEuaWQudG9Mb3dlckNhc2UoKSA9PT0gYi5pZC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gKGEubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSAoYi5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSB7XHJcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGFzID0gbmV3IFNldChhLm1hcCgoeCkgPT4gbm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICAgICAgcmV0dXJuIGIuZXZlcnkoKHgpID0+IGFzLmhhcyhub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuYSA9IE51bWJlcihhKTtcclxuICAgIGNvbnN0IG5iID0gTnVtYmVyKGIpO1xyXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4obmEpICYmICFOdW1iZXIuaXNOYU4obmIpKSByZXR1cm4gbmEgPT09IG5iO1xyXG5cclxuICAgIGlmICh0eXBlb2YgYSA9PT0gXCJib29sZWFuXCIgfHwgdHlwZW9mIGIgPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyhhKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nKGEgPz8gXCJcIikudG9Mb3dlckNhc2UoKSA9PT0gU3RyaW5nKGIgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5TbWFydChhY3R1YWw6IHVua25vd24sIGNhbmRpZGF0ZUxpc3Q6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShjYW5kaWRhdGVMaXN0KSkgcmV0dXJuIGVxdWFsc1NtYXJ0KGFjdHVhbCwgY2FuZGlkYXRlTGlzdCk7XHJcblxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYWN0dWFsKSkge1xyXG4gICAgICAgIGNvbnN0IGNhbmQgPSBuZXcgU2V0KGNhbmRpZGF0ZUxpc3QubWFwKCh4KSA9PiBub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgICAgICByZXR1cm4gYWN0dWFsLnNvbWUoKHgpID0+IGNhbmQuaGFzKG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUoYWN0dWFsKSkge1xyXG4gICAgICAgIGNvbnN0IGlkID0gKGFjdHVhbC5pZCA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSAoYWN0dWFsLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IHYgb2YgY2FuZGlkYXRlTGlzdCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSB0b0d1aWRPck51bGwodik7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGcgJiYgaWQgPT09IGcpIHx8ICghZyAmJiBuYW1lID09PSB2LnRvTG93ZXJDYXNlKCkpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0xvb2t1cENvbXBhcmFibGUodikpIHtcclxuICAgICAgICAgICAgICAgIGlmICgodi5pZCAmJiBpZCA9PT0gdi5pZC50b0xvd2VyQ2FzZSgpKSB8fCAodi5uYW1lICYmIG5hbWUgPT09IHYubmFtZS50b0xvd2VyQ2FzZSgpKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXF1YWxzU21hcnQoYWN0dWFsLCB2KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYW5kaWRhdGVMaXN0LnNvbWUoKHYpID0+IGVxdWFsc1NtYXJ0KGFjdHVhbCwgdikpO1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9