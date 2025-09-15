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
    const attr = formContext.getAttribute(_entities_Contact_entity__WEBPACK_IMPORTED_MODULE_3__.CONTACT.fields.nev_businessunitid);
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

})();

(window.WRM = window.WRM || {}).dynamicMandatoryEngine = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxDQUFDO1FBQzFELElBQUksQ0FBQyxTQUFTO1lBQUUsU0FBUztRQUN6QixNQUFNLE9BQU8sR0FBRyxDQUFDLEdBQTRCLEVBQUUsRUFBRSxDQUFDLDBCQUEwQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xGLElBQUksQ0FBQztZQUNELFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbkMsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNMLFNBQVM7UUFDYixDQUFDO0lBQ0wsQ0FBQztBQUNMLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NvbmRpdGlvbi5ldmFsdWF0b3IudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jcm0uY29yZS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db250YWN0LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9NYW5kYXRvcnlDb25maWcuZW50aXR5LnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2ZlYXR1cmVzL2R5bmFtaWNNYW5kYXRvcnkvZHluYW1pY01hbmRhdG9yeUVuZ2luZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25kaXRpb24sIExvb2t1cENvbXBhcmFibGUsIE9wZXJhdG9yLCBVdGlsIH0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbmZ1bmN0aW9uIGlzTXVsdGlTZWxlY3RBcnJheSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEFycmF5PG51bWJlciB8IHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTG9va3VwQ29tcGFyYWJsZSh2OiB1bmtub3duKTogdiBpcyBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIHJldHVybiAhIXYgJiYgdHlwZW9mIHYgPT09IFwib2JqZWN0XCIgJiYgKFwiaWRcIiBpbiAodiBhcyBhbnkpIHx8IFwibmFtZVwiIGluICh2IGFzIGFueSkgfHwgXCJlbnRpdHlUeXBlXCIgaW4gKHYgYXMgYW55KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvR3VpZE9yTnVsbCh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xyXG4gICAgY29uc3QgcyA9IFN0cmluZyh2YWx1ZSA/PyBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gL15bMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMC05YS1mXXs0fS1bMC05YS1mXXs0fS1bMC05YS1mXXsxMn0kLy50ZXN0KHMpID8gcyA6IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTnVsbGlzaE9yRW1wdHkodjogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHYgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcbiAgICBpZiAodHlwZW9mIHYgPT09IFwic3RyaW5nXCIpIHJldHVybiB2LnRyaW0oKSA9PT0gXCJcIjtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSByZXR1cm4gdi5sZW5ndGggPT09IDA7XHJcbiAgICBpZiAoaXNMb29rdXBDb21wYXJhYmxlKHYpKSByZXR1cm4gIXYuaWQgJiYgIXYubmFtZTsgLy8gYm90aCBlbXB0eVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVTY2FsYXIoeDogdW5rbm93bik6IHN0cmluZyB7XHJcbiAgICBjb25zdCBnID0gdG9HdWlkT3JOdWxsKHgpO1xyXG4gICAgaWYgKGcpIHJldHVybiBgZ3VpZDoke2d9YDtcclxuICAgIGNvbnN0IG4gPSBOdW1iZXIoeCk7XHJcbiAgICBpZiAoIU51bWJlci5pc05hTihuKSkgcmV0dXJuIGBudW06JHtufWA7XHJcbiAgICBpZiAodHlwZW9mIHggPT09IFwiYm9vbGVhblwiKSByZXR1cm4gYGJvb2w6JHt4fWA7XHJcbiAgICByZXR1cm4gYHN0cjoke1N0cmluZyh4ID8/IFwiXCIpLnRvTG93ZXJDYXNlKCl9YDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9va3VwQXJyYXkodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBYcm0uTG9va3VwVmFsdWVbXSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpICYmXHJcbiAgICAgICAgdmFsdWUubGVuZ3RoID4gMCAmJlxyXG4gICAgICAgIHR5cGVvZiB2YWx1ZVswXSA9PT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgIHZhbHVlWzBdICE9PSBudWxsICYmXHJcbiAgICAgICAgXCJpZFwiIGluICh2YWx1ZVswXSBhcyBvYmplY3QpICYmXHJcbiAgICAgICAgdHlwZW9mICh2YWx1ZVswXSBhcyBYcm0uTG9va3VwVmFsdWUpLmlkID09PSBcInN0cmluZ1wiXHJcbiAgICApO1xyXG59XHJcbi8qKiBSZWFkIGEgdmFsdWUgZnJvbSB0aGUgZm9ybTsgc3VwcG9ydHMgbG9va3VwIHByb2plY3Rpb25zIHZpYSBkb3Qtbm90YXRpb24uICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkQXR0cmlidXRlVmFsdWUoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgZmllbGRQYXRoOiBzdHJpbmcpOiB1bmtub3duIHtcclxuICAgIGNvbnN0IFtsb2dpY2FsTmFtZSwgcHJvamVjdGlvbl0gPSBmaWVsZFBhdGguc3BsaXQoXCIuXCIsIDIpO1xyXG4gICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGxvZ2ljYWxOYW1lKTtcclxuICAgIGlmICghYXR0cmlidXRlIHx8IHR5cGVvZiBhdHRyaWJ1dGUuZ2V0VmFsdWUgIT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCByYXcgPSBhdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcclxuXHJcbiAgICAvLyBMb29rdXAgLyBQYXJ0eWxpc3RcclxuICAgIGlmIChpc0xvb2t1cEFycmF5KHJhdykpIHtcclxuICAgICAgICBjb25zdCBsdiA9IHJhd1swXSBhcyBYcm0uTG9va3VwVmFsdWUgJiB7IGVudGl0eVR5cGU/OiBzdHJpbmcgfTtcclxuICAgICAgICBjb25zdCBvYmo6IExvb2t1cENvbXBhcmFibGUgPSB7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChsdi5pZCksXHJcbiAgICAgICAgICAgIG5hbWU6IGx2Lm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTogbHYuZW50aXR5VHlwZSA/PyBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChwcm9qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAocHJvamVjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiaWRcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmlkO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm5hbWVcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZW50aXR5dHlwZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouZW50aXR5VHlwZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqOyAvLyBkZWZhdWx0OiBvYmplY3RcclxuICAgIH1cclxuXHJcbiAgICAvLyBNdWx0aS1TZWxlY3QgT3B0aW9uU2V0XHJcbiAgICBpZiAoaXNNdWx0aVNlbGVjdEFycmF5KHJhdykpIHJldHVybiByYXc7XHJcblxyXG4gICAgLy8gUHJpbWl0aXZlXHJcbiAgICByZXR1cm4gcmF3IGFzIHVua25vd247XHJcbn1cclxuXHJcbi8qKiBFdmFsdWF0ZSBzaW5nbGUgY29uZGl0aW9uIGFnYWluc3QgYWN0dWFsIHZhbHVlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVDb25kaXRpb24oYWN0dWFsOiB1bmtub3duLCBjb25kaXRpb246IENvbmRpdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgb3AgPSAoY29uZGl0aW9uLm9wZXJhdG9yIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkgYXMgT3BlcmF0b3I7XHJcbiAgICBjb25zdCB2YWwgPSAoY29uZGl0aW9uIGFzIHsgdmFsdWU/OiB1bmtub3duIH0pLnZhbHVlO1xyXG5cclxuICAgIHN3aXRjaCAob3ApIHtcclxuICAgICAgICBjYXNlIFwiZXFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsc1NtYXJ0KGFjdHVhbCwgdmFsKTtcclxuICAgICAgICBjYXNlIFwibmVcIjpcclxuICAgICAgICAgICAgcmV0dXJuICFlcXVhbHNTbWFydChhY3R1YWwsIHZhbCk7XHJcbiAgICAgICAgY2FzZSBcImluXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBpblNtYXJ0KGFjdHVhbCwgdmFsKTtcclxuICAgICAgICBjYXNlIFwiaXNudWxsXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBpc051bGxpc2hPckVtcHR5KGFjdHVhbCk7XHJcbiAgICAgICAgY2FzZSBcImlzbm90bnVsbFwiOlxyXG4gICAgICAgIGNhc2UgXCJub3RudWxsXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhaXNOdWxsaXNoT3JFbXB0eShhY3R1YWwpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxzU21hcnQoYTogdW5rbm93biwgYjogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShhKSkge1xyXG4gICAgICAgIGlmIChiID09IG51bGwpIHJldHVybiBpc051bGxpc2hPckVtcHR5KGEpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBjb25zdCBnID0gdG9HdWlkT3JOdWxsKGIpO1xyXG4gICAgICAgICAgICBpZiAoZykgcmV0dXJuIChhLmlkID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IGc7IC8vIEdVSUQgPyBjb21wYXJlIElEXHJcbiAgICAgICAgICAgIHJldHVybiAoYS5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IGIudG9Mb3dlckNhc2UoKTsgLy8gZWxzZSBjb21wYXJlIG5hbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShiKSkge1xyXG4gICAgICAgICAgICBpZiAoYS5pZCAmJiBiLmlkKSByZXR1cm4gYS5pZC50b0xvd2VyQ2FzZSgpID09PSBiLmlkLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiAoYS5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IChiLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGEpICYmIEFycmF5LmlzQXJyYXkoYikpIHtcclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgYXMgPSBuZXcgU2V0KGEubWFwKCh4KSA9PiBub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgICAgICByZXR1cm4gYi5ldmVyeSgoeCkgPT4gYXMuaGFzKG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5hID0gTnVtYmVyKGEpO1xyXG4gICAgY29uc3QgbmIgPSBOdW1iZXIoYik7XHJcbiAgICBpZiAoIU51bWJlci5pc05hTihuYSkgJiYgIU51bWJlci5pc05hTihuYikpIHJldHVybiBuYSA9PT0gbmI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBhID09PSBcImJvb2xlYW5cIiB8fCB0eXBlb2YgYiA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICByZXR1cm4gU3RyaW5nKGEpLnRvTG93ZXJDYXNlKCkgPT09IFN0cmluZyhiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmcoYSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYiA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpblNtYXJ0KGFjdHVhbDogdW5rbm93biwgY2FuZGlkYXRlTGlzdDogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNhbmRpZGF0ZUxpc3QpKSByZXR1cm4gZXF1YWxzU21hcnQoYWN0dWFsLCBjYW5kaWRhdGVMaXN0KTtcclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhY3R1YWwpKSB7XHJcbiAgICAgICAgY29uc3QgY2FuZCA9IG5ldyBTZXQoY2FuZGlkYXRlTGlzdC5tYXAoKHgpID0+IG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgICAgIHJldHVybiBhY3R1YWwuc29tZSgoeCkgPT4gY2FuZC5oYXMobm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShhY3R1YWwpKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSAoYWN0dWFsLmlkID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IChhY3R1YWwubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgdiBvZiBjYW5kaWRhdGVMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbCh2KTtcclxuICAgICAgICAgICAgICAgIGlmICgoZyAmJiBpZCA9PT0gZykgfHwgKCFnICYmIG5hbWUgPT09IHYudG9Mb3dlckNhc2UoKSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9va3VwQ29tcGFyYWJsZSh2KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh2LmlkICYmIGlkID09PSB2LmlkLnRvTG93ZXJDYXNlKCkpIHx8ICh2Lm5hbWUgJiYgbmFtZSA9PT0gdi5uYW1lLnRvTG93ZXJDYXNlKCkpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcXVhbHNTbWFydChhY3R1YWwsIHYpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZUxpc3Quc29tZSgodikgPT4gZXF1YWxzU21hcnQoYWN0dWFsLCB2KSk7XHJcbn0iLCIvLyAtLS0tIFR5cGVzIHNoYXJlZCBhY3Jvc3MgZW5naW5lICYgZW50aXRpZXMgLS0tLVxyXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9IFwiZXFcIiB8IFwibmVcIiB8IFwiaW5cIiB8IFwiaXNudWxsXCIgfCBcImlzbm90bnVsbFwiIHwgXCJub3RudWxsXCI7IC8vIGFsaWFzXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICAvKiogTG9naWNhbCBuYW1lIChzdXBwb3J0cyBkb3Qtbm90YXRpb24gZm9yIGxvb2t1cCBwcm9qZWN0aW9uczogZS5nLiwgXCJwcmltYXJ5Y29udGFjdGlkLm5hbWVcIikuICovXHJcbiAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgb3BlcmF0b3I6IE9wZXJhdG9yO1xyXG4gICAgLyoqIE9wdGlvbmFsIHZhbHVlIGZvciBjb21wYXJpc29ucyAob21pdHRlZCBmb3IgbnVsbC1vcGVyYXRvcnMpLiAqL1xyXG4gICAgdmFsdWU/OiB1bmtub3duO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJ1bGUge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIG1hbmRhdG9yeT86IHN0cmluZ1tdO1xyXG4gICAgY29uZGl0aW9uPzogQ29uZGl0aW9uW107IC8vIEFORC1jb25qdW5jdGlvbjsgZW1wdHkvdW5kZWZpbmVkIOKHkiBydWxlIGFsd2F5cyBtYXRjaGVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q29uZmlnIHtcclxuICAgIGRlZmF1bHQ/OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuLyoqIExpZ2h0d2VpZ2h0IGNvbXBhcmFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsb29rdXAgKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIGlkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gQ29yZSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG4gICAgc3RhdGljIGdldCBYcm0oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogTG93ZXJjYXNlLCBzdHJpcCBicmFjZXM7IHJldHVybnMgZW1wdHkgc3RyaW5nIGlmIGZhbHN5IGlucHV0LiAqL1xyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBUaGluIFdlYiBBUEkgd3JhcHBlciAtLS0tXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKChyaWQpID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocmlkKSB9KSksXHJcbiAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwU2NoZW1hTmFtZSxcclxuICAgICAgICAgICAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGJvdW5kUGFyYW1ldGVyOiBudWxsLCBwYXJhbWV0ZXJUeXBlczoge30sIG9wZXJhdGlvblR5cGU6IDIsIG9wZXJhdGlvbk5hbWU6IFwiQXNzb2NpYXRlXCIgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9IGFzIGFueTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBBcGlDbGllbnQuZXhlY3V0ZShyZXEpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEZvcm0gaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBGb3JtSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRDdXJyZW50SWQoZmM6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkUmF3ID0gZmM/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSYXcgPyBVdGlsLnNhbml0aXplR3VpZChpZFJhdykgOiBudWxsO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldExvb2t1cElkKGZjOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB2ID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZSk/LmdldFZhbHVlPy4oKTtcclxuICAgICAgICByZXR1cm4gdiAmJiB2Lmxlbmd0aCA/IFV0aWwuc2FuaXRpemVHdWlkKHZbMF0uaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEhlbHBlciB7XHJcbiAgICBzdGF0aWMgdHJ5UmVmcmVzaFN1YmdyaWQoZmM6IGFueSwgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBmYz8uZ2V0Q29udHJvbD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChncmlkPy5yZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBncmlkLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmYz8udWk/LnJlZnJlc2hSaWJib24/LigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFZpc2liaWxpdHkgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyByZXF1aXJlZCBsZXZlbCBvbiBhbiBhdHRyaWJ1dGUvY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldFJlcXVpcmVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGlzUmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cj8uc2V0UmVxdWlyZWRMZXZlbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZihmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzaG93ID0gISFwcmVkaWNhdGUoKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIGNvbnRyb2xOYW1lLCBzaG93KTtcclxuICAgICAgICByZXR1cm4gc2hvdztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmTG9va3VwRXF1YWxzKGZjOiBhbnksIGxvb2t1cEF0dHI6IHN0cmluZywgdGFyZ2V0SWQ6IHN0cmluZywgY29udHJvbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5SGVscGVyLnNob3dJZihmYywgY29udHJvbE5hbWUsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IEZvcm1IZWxwZXIuZ2V0TG9va3VwSWQoZmMsIGxvb2t1cEF0dHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gISFjdXJyZW50ICYmIFV0aWwuc2FuaXRpemVHdWlkKGN1cnJlbnQpID09PSBVdGlsLnNhbml0aXplR3VpZCh0YXJnZXRJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgQ09OVEFDVCA9IHtcclxuICAgIGVudGl0eTogXCJjb250YWN0XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJjb250YWN0aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0aWQ6IFwibmV2X2J1c2luZXNzdW5pdGlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0OyIsImltcG9ydCB0eXBlIHsgQnVzaW5lc3NVbml0Q29uZmlnLCBFbnRpdHlDb25maWcgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJVU0lORVNTVU5JVExPQ0FUSU9OID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3RfbG9jYXRpb25cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgICAgIG1hbmRhdG9yeUNvbmZpZ0pzb246IFwibWh3cm1iX21hbmRhdG9yeWNvbmZpZ2pzb25cIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vKiogU2FmZSBwYXJzZTsgcmV0dXJucyBudWxsIGlmIGludmFsaWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCk6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIEJ1c2luZXNzVW5pdENvbmZpZztcclxuICAgICAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiIHx8ICFwYXJzZWQuZW50aXRpZXMpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIENvbGxlY3QgYmFzZSBhdHRyaWJ1dGUgbmFtZXMgdXNlZCBpbiBjb25kaXRpb25zIChmb3IgYXV0byBPbkNoYW5nZSB3aXJpbmcpLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGlzdENvbmRpdGlvbkZpZWxkcyhlbnRpdHlDb25maWc/OiBFbnRpdHlDb25maWcpOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoIWVudGl0eUNvbmZpZz8ucnVsZXM/Lmxlbmd0aCkgcmV0dXJuIFtdO1xyXG4gICAgY29uc3QgZmllbGRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IHIgb2YgZW50aXR5Q29uZmlnLnJ1bGVzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIHIuY29uZGl0aW9uID8/IFtdKSB7XHJcbiAgICAgICAgICAgIGlmICghYy5maWVsZCkgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGJpbmQgb24gdGhlIGJhc2UgYXR0cmlidXRlIChiZWZvcmUgcHJvamVjdGlvbiBsaWtlIC5uYW1lKVxyXG4gICAgICAgICAgICBmaWVsZHMuYWRkKGMuZmllbGQuc3BsaXQoXCIuXCIsIDEpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShmaWVsZHMpO1xyXG59IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgdHlwZSB7IEJ1c2luZXNzVW5pdENvbmZpZywgQ29uZGl0aW9uLCBFbnRpdHlDb25maWcgfSBmcm9tIFwiLi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBBcGlDbGllbnQsIFV0aWwsIFZpc2liaWxpdHlIZWxwZXIgfSBmcm9tIFwiLi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBldmFsdWF0ZUNvbmRpdGlvbiwgcmVhZEF0dHJpYnV0ZVZhbHVlLCBpc0xvb2t1cEFycmF5IH0gZnJvbSBcIi4uLy4uL2NvcmUvY29uZGl0aW9uLmV2YWx1YXRvclwiO1xyXG5pbXBvcnQgeyBCVVNJTkVTU1VOSVRMT0NBVElPTiwgcGFyc2VCdXNpbmVzc1VuaXRDb25maWcsIGxpc3RDb25kaXRpb25GaWVsZHMgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eVwiO1xyXG5pbXBvcnQgeyBDT05UQUNUIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5XCI7XHJcblxyXG5cclxuY29uc3QgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUgPSBuZXcgTWFwPHN0cmluZywgQnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbD4oKTtcclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplRHluYW1pY01hbmRhdG9yeUZpZWxkcyhleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgZm9ybUNvbnRleHQgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCBsb2FkQnVzaW5lc3NVbml0Q29uZmlnKGZvcm1Db250ZXh0KTtcclxuICAgIGFwcGx5Q29uZmlnTWVyZ2VkKGZvcm1Db250ZXh0LCBjb25maWcpO1xyXG4gICAgYXV0b1dpcmVPbkNoYW5nZShmb3JtQ29udGV4dCwgY29uZmlnKTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcGx5RHluYW1pY01hbmRhdG9yeVJ1bGVzKGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGxvYWRCdXNpbmVzc1VuaXRDb25maWcoZm9ybUNvbnRleHQpO1xyXG4gICAgYXBwbHlDb25maWdNZXJnZWQoZm9ybUNvbnRleHQsIGNvbmZpZyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGxvYWRCdXNpbmVzc1VuaXRDb25maWcoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCk6IFByb21pc2U8QnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbD4ge1xyXG4gICAgY29uc3QgYXR0ciA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShDT05UQUNULmZpZWxkcy5uZXZfYnVzaW5lc3N1bml0aWQpO1xyXG4gICAgY29uc3QgdmFsID0gYXR0cj8uZ2V0VmFsdWU/LigpO1xyXG4gICAgY29uc3QgbG9jYXRpb25JZCA9IGlzTG9va3VwQXJyYXkodmFsKSA/IFV0aWwuc2FuaXRpemVHdWlkKHZhbFswXS5pZCkgOiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGNhY2hlS2V5ID0gbG9jYXRpb25JZCA/IGBsb2NhdGlvbjoke2xvY2F0aW9uSWR9YCA6IFwibG9jYXRpb246bnVsbFwiO1xyXG4gICAgaWYgKGJ1c2luZXNzVW5pdENvbmZpZ0NhY2hlLmhhcyhjYWNoZUtleSkpIHJldHVybiBidXNpbmVzc1VuaXRDb25maWdDYWNoZS5nZXQoY2FjaGVLZXkpID8/IG51bGw7XHJcblxyXG4gICAgaWYgKCFsb2NhdGlvbklkKSB7XHJcbiAgICAgICAgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGZpZWxkTG9naWNhbCA9IEJVU0lORVNTVU5JVExPQ0FUSU9OLmZpZWxkcy5tYW5kYXRvcnlDb25maWdKc29uO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChCVVNJTkVTU1VOSVRMT0NBVElPTi5lbnRpdHksIGxvY2F0aW9uSWQsIGA/JHNlbGVjdD0ke2ZpZWxkTG9naWNhbH1gKTtcclxuICAgICAgICBjb25zdCBqc29uVGV4dCA9IChyZWMgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4pW2ZpZWxkTG9naWNhbF0gYXMgc3RyaW5nIHwgbnVsbDtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dCk7XHJcbiAgICAgICAgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUuc2V0KGNhY2hlS2V5LCBwYXJzZWQpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICBidXNpbmVzc1VuaXRDb25maWdDYWNoZS5zZXQoY2FjaGVLZXksIG51bGwpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBhcHBseUNvbmZpZ01lcmdlZChmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LCBjb25maWc6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwpOiB2b2lkIHtcclxuICAgIGlmICghY29uZmlnPy5lbnRpdGllcykgcmV0dXJuO1xyXG4gICAgY29uc3QgZW50aXR5TG9naWNhbE5hbWUgPSBmb3JtQ29udGV4dC5kYXRhLmVudGl0eS5nZXRFbnRpdHlOYW1lKCk7XHJcbiAgICBjb25zdCBlbnRpdHlDb25maWc6IEVudGl0eUNvbmZpZyB8IHVuZGVmaW5lZCA9IGNvbmZpZy5lbnRpdGllc1tlbnRpdHlMb2dpY2FsTmFtZV07XHJcbiAgICBpZiAoIWVudGl0eUNvbmZpZykgcmV0dXJuO1xyXG5cclxuICAgIC8vIDEpIFJlc2V0OiBjbGVhciByZXF1aXJlZCBmbGFnIGZvciBhbGwgZmllbGRzIHRoYXQgY291bGQgYmUgbWFya2VkIG1hbmRhdG9yeSBieSBkZWZhdWx0cyBvciBhbnkgcnVsZVxyXG4gICAgcmVzZXRQb3RlbnRpYWxNYW5kYXRvcnkoZm9ybUNvbnRleHQsIGVudGl0eUNvbmZpZyk7XHJcblxyXG4gICAgLy8gMikgRXZhbHVhdGUgcnVsZXMgYW5kIG1lcmdlIHJlc3VsdGluZyBtYW5kYXRvcnkgZmllbGRzXHJcbiAgICBjb25zdCBtZXJnZWQ6IHN0cmluZ1tdID0gW107XHJcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgZW50aXR5Q29uZmlnLnJ1bGVzID8/IFtdKSB7XHJcbiAgICAgICAgaWYgKHJ1bGVNYXRjaGVzKGZvcm1Db250ZXh0LCBydWxlLmNvbmRpdGlvbikpIHtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBmaWVsZCBvZiBydWxlLm1hbmRhdG9yeSA/PyBbXSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCFtZXJnZWQuaW5jbHVkZXMoZmllbGQpKSBtZXJnZWQucHVzaChmaWVsZCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgcmVxdWlyZWRGaWVsZHMgPSBtZXJnZWQubGVuZ3RoID8gbWVyZ2VkIDogZW50aXR5Q29uZmlnLmRlZmF1bHQgPz8gW107XHJcbiAgICByZXF1aXJlZEZpZWxkcy5mb3JFYWNoKGZpZWxkTG9naWNhbCA9PiBWaXNpYmlsaXR5SGVscGVyLnNldFJlcXVpcmVkKGZvcm1Db250ZXh0LCBmaWVsZExvZ2ljYWwsIHRydWUpKTtcclxufVxyXG5cclxuLy8gQ2xlYXJzIHJlcXVpcmVkIGZsYWcgb24gYWxsIGZpZWxkcyB0aGF0IGNvdWxkIGJlIG1hcmtlZCBtYW5kYXRvcnkgYnkgZGVmYXVsdHMgb3IgYW55IHJ1bGUgZm9yIGEgZ2l2ZW4gZW50aXR5IGNvbmZpZ1xyXG5mdW5jdGlvbiByZXNldFBvdGVudGlhbE1hbmRhdG9yeShmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LCBlbnRpdHlDb25maWc6IEVudGl0eUNvbmZpZyk6IHZvaWQge1xyXG4gICAgY29uc3QgcG90ZW50aWFsTWFuZGF0b3J5ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGYgb2YgZW50aXR5Q29uZmlnLmRlZmF1bHQgPz8gW10pIHBvdGVudGlhbE1hbmRhdG9yeS5hZGQoZik7XHJcbiAgICBmb3IgKGNvbnN0IHJ1bGUgb2YgZW50aXR5Q29uZmlnLnJ1bGVzID8/IFtdKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBmIG9mIHJ1bGUubWFuZGF0b3J5ID8/IFtdKSBwb3RlbnRpYWxNYW5kYXRvcnkuYWRkKGYpO1xyXG4gICAgfVxyXG4gICAgcG90ZW50aWFsTWFuZGF0b3J5LmZvckVhY2goZmllbGRMb2dpY2FsID0+IFZpc2liaWxpdHlIZWxwZXIuc2V0UmVxdWlyZWQoZm9ybUNvbnRleHQsIGZpZWxkTG9naWNhbCwgZmFsc2UpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gcnVsZU1hdGNoZXMoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgY29uZGl0aW9ucz86IENvbmRpdGlvbltdKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIWNvbmRpdGlvbnMgfHwgY29uZGl0aW9ucy5sZW5ndGggPT09IDApIHJldHVybiB0cnVlO1xyXG4gICAgZm9yIChjb25zdCBjb25kaXRpb24gb2YgY29uZGl0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IGFjdHVhbCA9IHJlYWRBdHRyaWJ1dGVWYWx1ZShmb3JtQ29udGV4dCwgY29uZGl0aW9uLmZpZWxkKTtcclxuICAgICAgICBpZiAoIWV2YWx1YXRlQ29uZGl0aW9uKGFjdHVhbCwgY29uZGl0aW9uKSkgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGF1dG9XaXJlT25DaGFuZ2UoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgY29uZmlnOiBCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsKTogdm9pZCB7XHJcbiAgICBpZiAoIWNvbmZpZz8uZW50aXRpZXMpIHJldHVybjtcclxuICAgIGNvbnN0IGVudGl0eUxvZ2ljYWxOYW1lID0gZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5TmFtZSgpO1xyXG4gICAgY29uc3QgZW50aXR5Q29uZmlnID0gY29uZmlnLmVudGl0aWVzW2VudGl0eUxvZ2ljYWxOYW1lXSBhcyBFbnRpdHlDb25maWcgfCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBmaWVsZHMgPSBsaXN0Q29uZGl0aW9uRmllbGRzKGVudGl0eUNvbmZpZyk7XHJcbiAgICBmb3IgKGNvbnN0IGF0dHJpYnV0ZU5hbWUgb2YgZmllbGRzKSB7XHJcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cmlidXRlKSBjb250aW51ZTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gKGN0eDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpID0+IGFwcGx5RHluYW1pY01hbmRhdG9yeVJ1bGVzKGN0eCk7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvLyBpZ25vcmVcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=