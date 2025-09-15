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
// crm.core.ts � Generic Core Utilities & Services (keine Abh�ngigkeiten zu Entities)
/** Core helpers */
class Util {
    static get Xrm() { return window.Xrm; }
    static sanitizeGuid(id) {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    }
    static unique(arr) {
        return Array.from(new Set(arr));
    }
}
/** Thin Web API wrapper */
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
            relatedEntities: relatedIds.map(id => ({ entityType: relatedEntityLogical, id: Util.sanitizeGuid(id) })),
            relationship: relationshipSchemaName,
            getMetadata: function () {
                return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" };
            }
        };
        const response = await ApiClient.execute(req);
        if (!response.ok)
            throw new Error(`Association failed: ${response.status} ${response.statusText}`);
    }
}
/** Form helpers */
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
            catch { /* ignore */ }
        }
        else {
            try {
                (_c = (_b = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _b === void 0 ? void 0 : _b.refreshRibbon) === null || _c === void 0 ? void 0 : _c.call(_b);
            }
            catch { /* ignore */ }
        }
    }
}
/** Visibility helpers */
class VisibilityHelper {
    static setVisible(fc, controlName, visible) {
        var _a;
        const ctrl = (_a = fc === null || fc === void 0 ? void 0 : fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
        if (ctrl === null || ctrl === void 0 ? void 0 : ctrl.setVisible) {
            try {
                ctrl.setVisible(visible);
            }
            catch { /* ignore */ }
        }
    }
    /** Setzt das Pflichtfeld-Flag für ein Control */
    static setRequired(fc, controlName, isRequired) {
        var _a;
        const attr = (_a = fc === null || fc === void 0 ? void 0 : fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
        if (attr === null || attr === void 0 ? void 0 : attr.setRequiredLevel) {
            try {
                attr.setRequiredLevel(isRequired ? "required" : "none");
            }
            catch { /* ignore */ }
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
            .map(id => `<value uitype="${entityLogical}">{${Util.sanitizeGuid(id)}}</value>`)
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
        return await Util.Xrm.Utility.lookupObjects(lookupOptions);
    }
}
/** Generic lookup service (OData) */
class LookupService {
    /** Returns first record id (sanitized) matching a raw OData filter, or null. */
    static async getFirstIdByFilter(entityLogical, idAttr, odataFilter // e.g. "(statuscode eq 1)"
    ) {
        var _a;
        const options = `?$select=${idAttr}&$filter=${odataFilter}`;
        const res = await ApiClient.retrieveMultiple(entityLogical, options);
        const row = (_a = res === null || res === void 0 ? void 0 : res.entities) === null || _a === void 0 ? void 0 : _a[0];
        const id = row === null || row === void 0 ? void 0 : row[idAttr];
        return id ? Util.sanitizeGuid(id) : null;
    }
    /** Convenience: equality on a single column */
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
    }
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
// entities/MandatoryConfig.entity.ts
// Zentrale Definition des Business-Unit-JSON-Felds, Dom�nentypen und Parser.
const BUSINESSUNITLOCATION = {
    entity: "ambcust_location",
    fields: {
        pk: "ambcust_locationid",
        mandatoryConfigJson: "mhwrmb_mandatoryconfigjson"
    }
};
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
/** Liefert alle Attributnamen, die in Conditions vorkommen (f�r optionales Auto-OnChange). */
function listConditionFields(entityConfig) {
    var _a;
    if (!((_a = entityConfig === null || entityConfig === void 0 ? void 0 : entityConfig.rules) === null || _a === void 0 ? void 0 : _a.length))
        return [];
    const fields = entityConfig.rules.flatMap(rule => { var _a; return ((_a = rule.condition) !== null && _a !== void 0 ? _a : []).map(c => c.field); });
    return Array.from(new Set(fields));
}


/***/ }),

/***/ "./WebResources/src/entities/OriginType.entity.ts":
/*!********************************************************!*\
  !*** ./WebResources/src/entities/OriginType.entity.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ORIGINTYPE: () => (/* binding */ ORIGINTYPE)
/* harmony export */ });
// OriginType.entity.ts
const ORIGINTYPE = {
    entity: "ambcust_origintype",
    fields: {
        pk: "ambcust_origintypeid",
        typeNameCode: "mhwrmb_typenamecode",
    },
    values: {
        ACCOUNT_OPENING: "ACCOUNT_OPENING",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/Portfolio.entity.ts":
/*!*******************************************************!*\
  !*** ./WebResources/src/entities/Portfolio.entity.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PORTFOLIO: () => (/* binding */ PORTFOLIO)
/* harmony export */ });
// Portfolio.entity.ts
const PORTFOLIO = {
    entity: "wrmb_portfolio",
    fields: {
        pk: "wrmb_portfolioid",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/PortfolioRelationship.entity.ts":
/*!*******************************************************************!*\
  !*** ./WebResources/src/entities/PortfolioRelationship.entity.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PORTFOLIORELATIONSHIP: () => (/* binding */ PORTFOLIORELATIONSHIP)
/* harmony export */ });
// PortfolioRelationship.entity.ts
const PORTFOLIORELATIONSHIP = {
    entity: "wrmb_portfoliorelationship",
    fields: {
        portfolioId: "wrmb_portfolioid",
        contactId: "wrmb_contactid",
        companyId: "wrmb_companyid",
        typeId: "wrmb_portfoliorelationshiptypeid",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/PortfolioRelationshipType.entity.ts":
/*!***********************************************************************!*\
  !*** ./WebResources/src/entities/PortfolioRelationshipType.entity.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PORTFOLIORELATIONSHIPTYPE: () => (/* binding */ PORTFOLIORELATIONSHIPTYPE)
/* harmony export */ });
// PortfolioRelationshipType.entity.ts
const PORTFOLIORELATIONSHIPTYPE = {
    entity: "wrmb_portfoliorelationshiptype",
    fields: {
        pk: "wrmb_portfoliorelationshiptypeid",
        name: "wrmb_name",
    },
    options: {
        NAME_PRINCIPAL: "Principal",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/RiskSummaryAndApproval.entity.ts":
/*!********************************************************************!*\
  !*** ./WebResources/src/entities/RiskSummaryAndApproval.entity.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   RISKSUMMARYANDAPPROVAL: () => (/* binding */ RISKSUMMARYANDAPPROVAL)
/* harmony export */ });
// RiskSummaryAndApproval.entity.ts
const RISKSUMMARYANDAPPROVAL = {
    entity: "wrmr_risksummaryandapproval",
    fields: {
        pk: "wrmr_risksummaryandapprovalid",
        contactId: "wrmr_contactid",
        companyId: "wrmr_companyid",
        ambcustOriginTypeId: "ambcust_origintypeid"
    },
    controls: {
        subgridAccounts: "wrm_subgrid_accounts",
    },
    relationships: {
        portfolios: {
            schema: "mhwrmb_risksummaryandapproval2portfolio",
            nav: "mhwrmb_risksummaryandapproval2portfolio",
        },
    },
    tabs: {
        MAIN: "TAB_MAIN",
        REVIEW: "TAB_REVIEW",
    },
    sections: {
        APPROVAL: "SEC_APPROVAL",
    },
    options: {
    // Beispiel: STATUS_APPROVED: 100000001
    },
};


/***/ }),

/***/ "./WebResources/src/entities/index.ts":
/*!********************************************!*\
  !*** ./WebResources/src/entities/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BUSINESSUNITLOCATION: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.BUSINESSUNITLOCATION),
/* harmony export */   CONTACT: () => (/* reexport safe */ _Contact_entity__WEBPACK_IMPORTED_MODULE_6__.CONTACT),
/* harmony export */   ORIGINTYPE: () => (/* reexport safe */ _OriginType_entity__WEBPACK_IMPORTED_MODULE_4__.ORIGINTYPE),
/* harmony export */   PORTFOLIO: () => (/* reexport safe */ _Portfolio_entity__WEBPACK_IMPORTED_MODULE_1__.PORTFOLIO),
/* harmony export */   PORTFOLIORELATIONSHIP: () => (/* reexport safe */ _PortfolioRelationship_entity__WEBPACK_IMPORTED_MODULE_2__.PORTFOLIORELATIONSHIP),
/* harmony export */   PORTFOLIORELATIONSHIPTYPE: () => (/* reexport safe */ _PortfolioRelationshipType_entity__WEBPACK_IMPORTED_MODULE_3__.PORTFOLIORELATIONSHIPTYPE),
/* harmony export */   RISKSUMMARYANDAPPROVAL: () => (/* reexport safe */ _RiskSummaryAndApproval_entity__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL),
/* harmony export */   listConditionFields: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.listConditionFields),
/* harmony export */   parseBusinessUnitConfig: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.parseBusinessUnitConfig)
/* harmony export */ });
/* harmony import */ var _RiskSummaryAndApproval_entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RiskSummaryAndApproval.entity */ "./WebResources/src/entities/RiskSummaryAndApproval.entity.ts");
/* harmony import */ var _Portfolio_entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Portfolio.entity */ "./WebResources/src/entities/Portfolio.entity.ts");
/* harmony import */ var _PortfolioRelationship_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PortfolioRelationship.entity */ "./WebResources/src/entities/PortfolioRelationship.entity.ts");
/* harmony import */ var _PortfolioRelationshipType_entity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PortfolioRelationshipType.entity */ "./WebResources/src/entities/PortfolioRelationshipType.entity.ts");
/* harmony import */ var _OriginType_entity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./OriginType.entity */ "./WebResources/src/entities/OriginType.entity.ts");
/* harmony import */ var _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MandatoryConfig.entity */ "./WebResources/src/entities/MandatoryConfig.entity.ts");
/* harmony import */ var _Contact_entity__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Contact.entity */ "./WebResources/src/entities/Contact.entity.ts");
// Barrel file � b�ndelt alle Entity-Objekte









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
/* harmony import */ var _entities_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../entities/index */ "./WebResources/src/entities/index.ts");
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../core/crm.core */ "./WebResources/src/core/crm.core.ts");
// features/dynamic-mandatory/wrm_dynamicMandatory.ts
// Engine: Liest die Business-Unit-Config und setzt dynamische Pflichtfelder (Merge-Strategie).


const businessUnitConfigCache = new Map();
async function initializeDynamicMandatoryFields(executionContext) {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
    autoWireOnChange(formContext, config); // Komfort: OnChange automatisch an alle Condition-Felder binden
}
async function applyDynamicMandatoryRules(executionContext) {
    const formContext = executionContext.getFormContext();
    const config = await loadBusinessUnitConfig(formContext);
    applyConfigMerged(formContext, config);
}
// -------------------- Laden & Caching --------------------
async function loadBusinessUnitConfig(formContext) {
    var _a;
    // Read current location from the active contact record via CONTACT.fields.nev_businessunitid
    const attr = formContext.getAttribute(_entities_index__WEBPACK_IMPORTED_MODULE_0__.CONTACT.fields.nev_businessunitid);
    const val = (_a = attr === null || attr === void 0 ? void 0 : attr.getValue) === null || _a === void 0 ? void 0 : _a.call(attr);
    const locationId = isLookupArray(val) ? _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(val[0].id) : null;
    const cacheKey = locationId ? `location:${locationId}` : "location:null";
    const cached = businessUnitConfigCache.get(cacheKey);
    if (cached !== undefined)
        return cached;
    if (!locationId) {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }
    try {
        // Read JSON from custom table using entity constants
        const fieldLogical = _entities_index__WEBPACK_IMPORTED_MODULE_0__.BUSINESSUNITLOCATION.fields.mandatoryConfigJson;
        const location = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.retrieveRecord(_entities_index__WEBPACK_IMPORTED_MODULE_0__.BUSINESSUNITLOCATION.entity, locationId, `?$select=${fieldLogical}`);
        const jsonText = location[fieldLogical];
        const parsed = (0,_entities_index__WEBPACK_IMPORTED_MODULE_0__.parseBusinessUnitConfig)(jsonText);
        businessUnitConfigCache.set(cacheKey, parsed);
        return parsed;
    }
    catch {
        businessUnitConfigCache.set(cacheKey, null);
        return null;
    }
}
// -------------------- Anwenden (Merge-Strategie) --------------------
function applyConfigMerged(formContext, config) {
    var _a, _b, _c;
    if (!(config === null || config === void 0 ? void 0 : config.entities))
        return;
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName];
    if (!entityConfig)
        return;
    const merged = [];
    for (const rule of (_a = entityConfig.rules) !== null && _a !== void 0 ? _a : []) {
        if (ruleMatches(formContext, rule.condition)) {
            for (const field of (_b = rule.mandatory) !== null && _b !== void 0 ? _b : []) {
                if (!merged.includes(field))
                    merged.push(field);
            }
        }
    }
    const requiredFields = merged.length ? merged : ((_c = entityConfig.default) !== null && _c !== void 0 ? _c : []);
    requiredFields.forEach(fieldLogical => _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.setRequired(formContext, fieldLogical, true));
}
// -------------------- Evaluierung --------------------
function ruleMatches(formContext, conditions) {
    if (!conditions || conditions.length === 0)
        return true;
    for (const condition of conditions) {
        const actual = readAttributeValue(formContext, condition.field);
        if (!evaluateCondition(actual, condition))
            return false;
    }
    return true;
}
// ---- Type Guards f?r robuste Typ-Sicherheit ----
function isLookupArray(value) {
    return Array.isArray(value)
        && value.length > 0
        && typeof value[0] === "object"
        && value[0] !== null
        && "id" in value[0]
        && typeof value[0].id === "string";
}
function isMultiSelectArray(value) {
    // Multi-Select Option Set liefert number[] (manchmal string[])
    return Array.isArray(value) && value.every(v => typeof v === "number" || typeof v === "string");
}
// ---- Sicherer Read (fix f?r TS2339) ----
function readAttributeValue(formContext, logicalName) {
    const attribute = formContext.getAttribute(logicalName);
    if (!attribute || typeof attribute.getValue !== "function")
        return undefined;
    const value = attribute.getValue();
    // Lookup / Partylist ? GUID der ersten Auswahl (sanitized)
    if (isLookupArray(value)) {
        return _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(value[0].id);
    }
    // Multi-Select Option Set ? number[]/string[]
    if (isMultiSelectArray(value)) {
        return value;
    }
    // Sonst: number | string | boolean | Date | null | undefined
    return value;
}
function evaluateCondition(actual, condition) {
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
function equalsLoose(a, b) {
    // GUIDs (case-insensitive, ohne Klammern)
    const ga = toGuidOrNull(a);
    const gb = toGuidOrNull(b);
    if (ga && gb)
        return ga === gb;
    // Zahlen (OptionSet-Codes)
    const na = Number(a), nb = Number(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb))
        return na === nb;
    // Boolean
    if (typeof a === "boolean" || typeof b === "boolean") {
        return String(a).toLowerCase() === String(b).toLowerCase();
    }
    // Strings (case-insensitive)
    return String(a !== null && a !== void 0 ? a : "").toLowerCase() === String(b !== null && b !== void 0 ? b : "").toLowerCase();
}
function toGuidOrNull(value) {
    if (!value)
        return null;
    const s = String(value).replace(/[{}]/g, "").toLowerCase();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(s) ? s : null;
}
// -------------------- Komfort: Auto-OnChange --------------------
function autoWireOnChange(formContext, config) {
    if (!(config === null || config === void 0 ? void 0 : config.entities))
        return;
    const entityLogicalName = formContext.data.entity.getEntityName();
    const entityConfig = config.entities[entityLogicalName];
    const fields = (0,_entities_index__WEBPACK_IMPORTED_MODULE_0__.listConditionFields)(entityConfig);
    fields.forEach(attributeName => {
        const attribute = formContext.getAttribute(attributeName);
        if (!attribute)
            return;
        const handler = (ctx) => applyDynamicMandatoryRules(ctx);
        try {
            attribute.addOnChange(handler);
        }
        catch { /* ignore */ }
    });
}

})();

(window.WRM = window.WRM || {}).dynamicMandatoryEngine = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q0FBQywwQkFBMEIsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsRixJQUFJLENBQUM7WUFBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQUMsQ0FBQztRQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQ2xFLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQ29udGFjdC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9PcmlnaW5UeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW8uZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1BvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZmVhdHVyZXMvZHluYW1pY01hbmRhdG9yeS9keW5hbWljTWFuZGF0b3J5RW5naW5lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGNybS5jb3JlLnRzIO+/vSBHZW5lcmljIENvcmUgVXRpbGl0aWVzICYgU2VydmljZXMgKGtlaW5lIEFiaO+/vW5naWdrZWl0ZW4genUgRW50aXRpZXMpXHJcblxyXG4vKiogQ29yZSBoZWxwZXJzICovXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7IHJldHVybiAod2luZG93IGFzIGFueSkuWHJtOyB9XHJcblxyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFRoaW4gV2ViIEFQSSB3cmFwcGVyICovXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKGlkID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEZvcm0gaGVscGVycyAqL1xyXG5leHBvcnQgY2xhc3MgRm9ybUhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHsgdHJ5IHsgZ3JpZC5yZWZyZXNoKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfSB9XHJcbiAgICAgICAgZWxzZSB7IHRyeSB7IGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfSB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBWaXNpYmlsaXR5IGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkgeyB0cnkgeyBjdHJsLnNldFZpc2libGUodmlzaWJsZSk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfSB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHp0IGRhcyBQZmxpY2h0ZmVsZC1GbGFnIGbDvHIgZWluIENvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHsgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIExvb2t1cCBkaWFsb2cgaGVscGVyICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nOyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoaWQgPT4gYDx2YWx1ZSB1aXR5cGU9XCIke2VudGl0eUxvZ2ljYWx9XCI+eyR7VXRpbC5zYW5pdGl6ZUd1aWQoaWQpfX08L3ZhbHVlPmApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJYbWwgPSBgXHJcbiAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtpZEF0dHJpYnV0ZX1cIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAke2luVmFsdWVzfVxyXG4gICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgIDwvZmlsdGVyPmAudHJpbSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb29rdXBPcHRpb25zOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGFsbG93TXVsdGlTZWxlY3Q6IG9wdGlvbnM/LmFsbG93TXVsdGlTZWxlY3QgPz8gdHJ1ZSxcclxuICAgICAgICAgICAgZGVmYXVsdEVudGl0eVR5cGU6IGVudGl0eUxvZ2ljYWwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGVzOiBbZW50aXR5TG9naWNhbF0sXHJcbiAgICAgICAgICAgIGZpbHRlcnM6IFt7IGVudGl0eUxvZ2ljYWxOYW1lOiBlbnRpdHlMb2dpY2FsLCBmaWx0ZXJYbWwgfV0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNcnU6IG9wdGlvbnM/LmRpc2FibGVNcnUgPz8gdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8uZGVmYXVsdFZpZXdJZCkgbG9va3VwT3B0aW9ucy5kZWZhdWx0Vmlld0lkID0gb3B0aW9ucy5kZWZhdWx0Vmlld0lkO1xyXG5cclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJpYyBsb29rdXAgc2VydmljZSAoT0RhdGEpICovXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBTZXJ2aWNlIHtcclxuICAgIC8qKiBSZXR1cm5zIGZpcnN0IHJlY29yZCBpZCAoc2FuaXRpemVkKSBtYXRjaGluZyBhIHJhdyBPRGF0YSBmaWx0ZXIsIG9yIG51bGwuICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nIC8vIGUuZy4gXCIoc3RhdHVzY29kZSBlcSAxKVwiXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBDb252ZW5pZW5jZTogZXF1YWxpdHkgb24gYSBzaW5nbGUgY29sdW1uICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgfVxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBlbnRpdGllcy9NYW5kYXRvcnlDb25maWcuZW50aXR5LnRzXHJcbi8vIFplbnRyYWxlIERlZmluaXRpb24gZGVzIEJ1c2luZXNzLVVuaXQtSlNPTi1GZWxkcywgRG9t77+9bmVudHlwZW4gdW5kIFBhcnNlci5cclxuXHJcbmV4cG9ydCBjb25zdCBCVVNJTkVTU1VOSVRMT0NBVElPTiA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X2xvY2F0aW9uXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgICAgICBtYW5kYXRvcnlDb25maWdKc29uOiBcIm1od3JtYl9tYW5kYXRvcnljb25maWdqc29uXCJcclxuICAgIH1cclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICBmaWVsZDogc3RyaW5nOyAgICAgICAgICAgLy8gbG9naWNhbCBuYW1lICh6LiBCLiBcImN1c3RvbWVydHlwZWNvZGVcIiwgXCJwcmltYXJ5Y29udGFjdGlkXCIpXHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKipcclxuICAgICAqIEVyd2FydGV0ZXIgV2VydDpcclxuICAgICAqIC0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGxcclxuICAgICAqIC0gR1VJRCAoei4gQi4gXCJhMWIyYzNkNC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDBcIilcclxuICAgICAqIC0gQXJyYXkgZu+/vXIgXCJpblwiOiAoc3RyaW5nW10gfCBudW1iZXJbXSB8IEdVSURbXSlcclxuICAgICAqL1xyXG4gICAgdmFsdWU/OiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk6IHN0cmluZ1tdOyAgICAgLy8gbG9naWNhbCBuYW1lcyBkZXIgRmVsZGVyLCBkaWUgcmVxdWlyZWQgd2VyZGVuXHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gVU5ELXZlcmtu77+9cGZ0OyBsZWVyL3VuZGVmaW5lZCA/IGdpbHQgaW1tZXJcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdDogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCk6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIEJ1c2luZXNzVW5pdENvbmZpZztcclxuICAgICAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiIHx8ICFwYXJzZWQuZW50aXRpZXMpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIExpZWZlcnQgYWxsZSBBdHRyaWJ1dG5hbWVuLCBkaWUgaW4gQ29uZGl0aW9ucyB2b3Jrb21tZW4gKGbvv71yIG9wdGlvbmFsZXMgQXV0by1PbkNoYW5nZSkuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsaXN0Q29uZGl0aW9uRmllbGRzKGVudGl0eUNvbmZpZz86IEVudGl0eUNvbmZpZyk6IHN0cmluZ1tdIHtcclxuICAgIGlmICghZW50aXR5Q29uZmlnPy5ydWxlcz8ubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgICBjb25zdCBmaWVsZHMgPSBlbnRpdHlDb25maWcucnVsZXMuZmxhdE1hcChydWxlID0+IChydWxlLmNvbmRpdGlvbiA/PyBbXSkubWFwKGMgPT4gYy5maWVsZCkpO1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChmaWVsZHMpKTtcclxufVxyXG4iLCIvLyBPcmlnaW5UeXBlLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgT1JJR0lOVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X29yaWdpbnR5cGVcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3Rfb3JpZ2ludHlwZWlkXCIsXHJcbiAgICAgICAgdHlwZU5hbWVDb2RlOiBcIm1od3JtYl90eXBlbmFtZWNvZGVcIixcclxuICAgIH0sXHJcbiAgICB2YWx1ZXM6IHtcclxuICAgICAgICBBQ0NPVU5UX09QRU5JTkc6IFwiQUNDT1VOVF9PUEVOSU5HXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBQb3J0Zm9saW8uZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBQT1JURk9MSU8gPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybWJfcG9ydGZvbGlvaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcG9ydGZvbGlvSWQ6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1iX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1iX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIHR5cGVJZDogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgICAgIG5hbWU6IFwid3JtYl9uYW1lXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIE5BTUVfUFJJTkNJUEFMOiBcIlByaW5jaXBhbFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwgPSB7XHJcbiAgICBlbnRpdHk6IFwid3Jtcl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxpZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1yX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1yX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIGFtYmN1c3RPcmlnaW5UeXBlSWQ6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xzOiB7XHJcbiAgICAgICAgc3ViZ3JpZEFjY291bnRzOiBcIndybV9zdWJncmlkX2FjY291bnRzXCIsXHJcbiAgICB9LFxyXG4gICAgcmVsYXRpb25zaGlwczoge1xyXG4gICAgICAgIHBvcnRmb2xpb3M6IHtcclxuICAgICAgICAgICAgc2NoZW1hOiBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiLFxyXG4gICAgICAgICAgICBuYXY6IFwibWh3cm1iX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWwycG9ydGZvbGlvXCIsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB0YWJzOiB7XHJcbiAgICAgICAgTUFJTjogXCJUQUJfTUFJTlwiLFxyXG4gICAgICAgIFJFVklFVzogXCJUQUJfUkVWSUVXXCIsXHJcbiAgICB9LFxyXG4gICAgc2VjdGlvbnM6IHtcclxuICAgICAgICBBUFBST1ZBTDogXCJTRUNfQVBQUk9WQUxcIixcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgLy8gQmVpc3BpZWw6IFNUQVRVU19BUFBST1ZFRDogMTAwMDAwMDAxXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBCYXJyZWwgZmlsZSDvv70gYu+/vW5kZWx0IGFsbGUgRW50aXR5LU9iamVrdGVcclxuZXhwb3J0ICogZnJvbSBcIi4vUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXAuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BvcnRmb2xpb1JlbGF0aW9uc2hpcFR5cGUuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL09yaWdpblR5cGUuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL01hbmRhdG9yeUNvbmZpZy5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ29udGFjdC5lbnRpdHlcIjtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBmZWF0dXJlcy9keW5hbWljLW1hbmRhdG9yeS93cm1fZHluYW1pY01hbmRhdG9yeS50c1xyXG4vLyBFbmdpbmU6IExpZXN0IGRpZSBCdXNpbmVzcy1Vbml0LUNvbmZpZyB1bmQgc2V0enQgZHluYW1pc2NoZSBQZmxpY2h0ZmVsZGVyIChNZXJnZS1TdHJhdGVnaWUpLlxyXG5cclxuaW1wb3J0IHtcclxuICAgIEJVU0lORVNTVU5JVExPQ0FUSU9OLFxyXG4gICAgQnVzaW5lc3NVbml0Q29uZmlnLFxyXG4gICAgRW50aXR5Q29uZmlnLFxyXG4gICAgQ29uZGl0aW9uLFxyXG4gICAgcGFyc2VCdXNpbmVzc1VuaXRDb25maWcsXHJcbiAgICBsaXN0Q29uZGl0aW9uRmllbGRzLFxyXG4gICAgQ09OVEFDVFxyXG59IGZyb20gXCIuLi8uLi9lbnRpdGllcy9pbmRleFwiO1xyXG5cclxuaW1wb3J0IHsgVXRpbCwgQXBpQ2xpZW50LCBWaXNpYmlsaXR5SGVscGVyIH0gZnJvbSBcIi4uLy4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbmNvbnN0IGJ1c2luZXNzVW5pdENvbmZpZ0NhY2hlID0gbmV3IE1hcDxzdHJpbmcsIEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGw+KCk7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUR5bmFtaWNNYW5kYXRvcnlGaWVsZHMoZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgbG9hZEJ1c2luZXNzVW5pdENvbmZpZyhmb3JtQ29udGV4dCk7XHJcbiAgICBhcHBseUNvbmZpZ01lcmdlZChmb3JtQ29udGV4dCwgY29uZmlnKTtcclxuICAgIGF1dG9XaXJlT25DaGFuZ2UoZm9ybUNvbnRleHQsIGNvbmZpZyk7IC8vIEtvbWZvcnQ6IE9uQ2hhbmdlIGF1dG9tYXRpc2NoIGFuIGFsbGUgQ29uZGl0aW9uLUZlbGRlciBiaW5kZW5cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFwcGx5RHluYW1pY01hbmRhdG9yeVJ1bGVzKGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGxvYWRCdXNpbmVzc1VuaXRDb25maWcoZm9ybUNvbnRleHQpO1xyXG4gICAgYXBwbHlDb25maWdNZXJnZWQoZm9ybUNvbnRleHQsIGNvbmZpZyk7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIExhZGVuICYgQ2FjaGluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gbG9hZEJ1c2luZXNzVW5pdENvbmZpZyhmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0KTogUHJvbWlzZTxCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsPiB7XHJcbiAgICAvLyBSZWFkIGN1cnJlbnQgbG9jYXRpb24gZnJvbSB0aGUgYWN0aXZlIGNvbnRhY3QgcmVjb3JkIHZpYSBDT05UQUNULmZpZWxkcy5uZXZfYnVzaW5lc3N1bml0aWRcclxuICAgIGNvbnN0IGF0dHIgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUoQ09OVEFDVC5maWVsZHMubmV2X2J1c2luZXNzdW5pdGlkKTtcclxuICAgIGNvbnN0IHZhbCA9IGF0dHI/LmdldFZhbHVlPy4oKTtcclxuICAgIGNvbnN0IGxvY2F0aW9uSWQgPSBpc0xvb2t1cEFycmF5KHZhbCkgPyBVdGlsLnNhbml0aXplR3VpZCh2YWxbMF0uaWQpIDogbnVsbDtcclxuXHJcbiAgICBjb25zdCBjYWNoZUtleSA9IGxvY2F0aW9uSWQgPyBgbG9jYXRpb246JHtsb2NhdGlvbklkfWAgOiBcImxvY2F0aW9uOm51bGxcIjtcclxuICAgIGNvbnN0IGNhY2hlZCA9IGJ1c2luZXNzVW5pdENvbmZpZ0NhY2hlLmdldChjYWNoZUtleSk7XHJcbiAgICBpZiAoY2FjaGVkICE9PSB1bmRlZmluZWQpIHJldHVybiBjYWNoZWQ7XHJcblxyXG4gICAgaWYgKCFsb2NhdGlvbklkKSB7XHJcbiAgICAgICAgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUuc2V0KGNhY2hlS2V5LCBudWxsKTtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIFJlYWQgSlNPTiBmcm9tIGN1c3RvbSB0YWJsZSB1c2luZyBlbnRpdHkgY29uc3RhbnRzXHJcbiAgICAgICAgY29uc3QgZmllbGRMb2dpY2FsID0gQlVTSU5FU1NVTklUTE9DQVRJT04uZmllbGRzLm1hbmRhdG9yeUNvbmZpZ0pzb247XHJcbiAgICAgICAgY29uc3QgbG9jYXRpb24gPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoXHJcbiAgICAgICAgICAgIEJVU0lORVNTVU5JVExPQ0FUSU9OLmVudGl0eSxcclxuICAgICAgICAgICAgbG9jYXRpb25JZCxcclxuICAgICAgICAgICAgYD8kc2VsZWN0PSR7ZmllbGRMb2dpY2FsfWBcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGpzb25UZXh0ID0gKGxvY2F0aW9uIGFzIGFueSlbZmllbGRMb2dpY2FsXSBhcyBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dCk7XHJcbiAgICAgICAgYnVzaW5lc3NVbml0Q29uZmlnQ2FjaGUuc2V0KGNhY2hlS2V5LCBwYXJzZWQpO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICBidXNpbmVzc1VuaXRDb25maWdDYWNoZS5zZXQoY2FjaGVLZXksIG51bGwpO1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gQW53ZW5kZW4gKE1lcmdlLVN0cmF0ZWdpZSkgLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIGFwcGx5Q29uZmlnTWVyZ2VkKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGNvbmZpZzogQnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbCk6IHZvaWQgeyAgICBcclxuICAgIGlmICghY29uZmlnPy5lbnRpdGllcykgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGVudGl0eUxvZ2ljYWxOYW1lID0gZm9ybUNvbnRleHQuZGF0YS5lbnRpdHkuZ2V0RW50aXR5TmFtZSgpO1xyXG4gICAgY29uc3QgZW50aXR5Q29uZmlnID0gY29uZmlnLmVudGl0aWVzW2VudGl0eUxvZ2ljYWxOYW1lXTtcclxuICAgIGlmICghZW50aXR5Q29uZmlnKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgbWVyZ2VkOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgZm9yIChjb25zdCBydWxlIG9mIGVudGl0eUNvbmZpZy5ydWxlcyA/PyBbXSkge1xyXG4gICAgICAgIGlmIChydWxlTWF0Y2hlcyhmb3JtQ29udGV4dCwgcnVsZS5jb25kaXRpb24pKSB7XHJcbiAgICAgICAgICAgIGZvciAoY29uc3QgZmllbGQgb2YgcnVsZS5tYW5kYXRvcnkgPz8gW10pIHtcclxuICAgICAgICAgICAgICAgIGlmICghbWVyZ2VkLmluY2x1ZGVzKGZpZWxkKSkgbWVyZ2VkLnB1c2goZmllbGQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHJlcXVpcmVkRmllbGRzID0gbWVyZ2VkLmxlbmd0aCA/IG1lcmdlZCA6IChlbnRpdHlDb25maWcuZGVmYXVsdCA/PyBbXSk7XHJcbiAgICByZXF1aXJlZEZpZWxkcy5mb3JFYWNoKGZpZWxkTG9naWNhbCA9PiBWaXNpYmlsaXR5SGVscGVyLnNldFJlcXVpcmVkKGZvcm1Db250ZXh0LCBmaWVsZExvZ2ljYWwsIHRydWUpKTtcclxufVxyXG5cclxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0gRXZhbHVpZXJ1bmcgLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIHJ1bGVNYXRjaGVzKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGNvbmRpdGlvbnM/OiBDb25kaXRpb25bXSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFjb25kaXRpb25zIHx8IGNvbmRpdGlvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gdHJ1ZTtcclxuICAgIGZvciAoY29uc3QgY29uZGl0aW9uIG9mIGNvbmRpdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBhY3R1YWwgPSByZWFkQXR0cmlidXRlVmFsdWUoZm9ybUNvbnRleHQsIGNvbmRpdGlvbi5maWVsZCk7XHJcbiAgICAgICAgaWYgKCFldmFsdWF0ZUNvbmRpdGlvbihhY3R1YWwsIGNvbmRpdGlvbikpIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHJldHVybiB0cnVlO1xyXG59XHJcblxyXG4vLyAtLS0tIFR5cGUgR3VhcmRzIGY/ciByb2J1c3RlIFR5cC1TaWNoZXJoZWl0IC0tLS1cclxuZnVuY3Rpb24gaXNMb29rdXBBcnJheSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIFhybS5Mb29rdXBWYWx1ZVtdIHtcclxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKVxyXG4gICAgICAgICYmIHZhbHVlLmxlbmd0aCA+IDBcclxuICAgICAgICAmJiB0eXBlb2YgdmFsdWVbMF0gPT09IFwib2JqZWN0XCJcclxuICAgICAgICAmJiB2YWx1ZVswXSAhPT0gbnVsbFxyXG4gICAgICAgICYmIFwiaWRcIiBpbiAodmFsdWVbMF0gYXMgb2JqZWN0KVxyXG4gICAgICAgICYmIHR5cGVvZiAodmFsdWVbMF0gYXMgWHJtLkxvb2t1cFZhbHVlKS5pZCA9PT0gXCJzdHJpbmdcIjtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNNdWx0aVNlbGVjdEFycmF5KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgQXJyYXk8bnVtYmVyIHwgc3RyaW5nPiB7XHJcbiAgICAvLyBNdWx0aS1TZWxlY3QgT3B0aW9uIFNldCBsaWVmZXJ0IG51bWJlcltdIChtYW5jaG1hbCBzdHJpbmdbXSlcclxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5ldmVyeSh2ID0+IHR5cGVvZiB2ID09PSBcIm51bWJlclwiIHx8IHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKTtcclxufVxyXG5cclxuLy8gLS0tLSBTaWNoZXJlciBSZWFkIChmaXggZj9yIFRTMjMzOSkgLS0tLVxyXG5mdW5jdGlvbiByZWFkQXR0cmlidXRlVmFsdWUoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgbG9naWNhbE5hbWU6IHN0cmluZyk6IGFueSB7XHJcbiAgICBjb25zdCBhdHRyaWJ1dGUgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUobG9naWNhbE5hbWUpO1xyXG4gICAgaWYgKCFhdHRyaWJ1dGUgfHwgdHlwZW9mIGF0dHJpYnV0ZS5nZXRWYWx1ZSAhPT0gXCJmdW5jdGlvblwiKSByZXR1cm4gdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IHZhbHVlID0gYXR0cmlidXRlLmdldFZhbHVlKCk7XHJcblxyXG4gICAgLy8gTG9va3VwIC8gUGFydHlsaXN0ID8gR1VJRCBkZXIgZXJzdGVuIEF1c3dhaGwgKHNhbml0aXplZClcclxuICAgIGlmIChpc0xvb2t1cEFycmF5KHZhbHVlKSkge1xyXG4gICAgICAgIHJldHVybiBVdGlsLnNhbml0aXplR3VpZCh2YWx1ZVswXS5pZCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTXVsdGktU2VsZWN0IE9wdGlvbiBTZXQgPyBudW1iZXJbXS9zdHJpbmdbXVxyXG4gICAgaWYgKGlzTXVsdGlTZWxlY3RBcnJheSh2YWx1ZSkpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU29uc3Q6IG51bWJlciB8IHN0cmluZyB8IGJvb2xlYW4gfCBEYXRlIHwgbnVsbCB8IHVuZGVmaW5lZFxyXG4gICAgcmV0dXJuIHZhbHVlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBldmFsdWF0ZUNvbmRpdGlvbihhY3R1YWw6IGFueSwgY29uZGl0aW9uOiBDb25kaXRpb24pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHsgb3BlcmF0b3IsIHZhbHVlIH0gPSBjb25kaXRpb247XHJcblxyXG4gICAgc3dpdGNoIChvcGVyYXRvcikge1xyXG4gICAgICAgIGNhc2UgXCJlcVwiOlxyXG4gICAgICAgICAgICByZXR1cm4gZXF1YWxzTG9vc2UoYWN0dWFsLCB2YWx1ZSk7XHJcbiAgICAgICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhZXF1YWxzTG9vc2UoYWN0dWFsLCB2YWx1ZSk7XHJcbiAgICAgICAgY2FzZSBcImluXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5zb21lKHYgPT4gZXF1YWxzTG9vc2UoYWN0dWFsLCB2KSk7XHJcbiAgICAgICAgY2FzZSBcImlzbnVsbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gYWN0dWFsID09IG51bGwgfHwgKHR5cGVvZiBhY3R1YWwgPT09IFwic3RyaW5nXCIgJiYgYWN0dWFsLnRyaW0oKSA9PT0gXCJcIikgfHwgKEFycmF5LmlzQXJyYXkoYWN0dWFsKSAmJiBhY3R1YWwubGVuZ3RoID09PSAwKTtcclxuICAgICAgICBjYXNlIFwiaXNub3RudWxsXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhKGFjdHVhbCA9PSBudWxsIHx8ICh0eXBlb2YgYWN0dWFsID09PSBcInN0cmluZ1wiICYmIGFjdHVhbC50cmltKCkgPT09IFwiXCIpIHx8IChBcnJheS5pc0FycmF5KGFjdHVhbCkgJiYgYWN0dWFsLmxlbmd0aCA9PT0gMCkpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxzTG9vc2UoYTogYW55LCBiOiBhbnkpOiBib29sZWFuIHtcclxuICAgIC8vIEdVSURzIChjYXNlLWluc2Vuc2l0aXZlLCBvaG5lIEtsYW1tZXJuKVxyXG4gICAgY29uc3QgZ2EgPSB0b0d1aWRPck51bGwoYSk7XHJcbiAgICBjb25zdCBnYiA9IHRvR3VpZE9yTnVsbChiKTtcclxuICAgIGlmIChnYSAmJiBnYikgcmV0dXJuIGdhID09PSBnYjtcclxuXHJcbiAgICAvLyBaYWhsZW4gKE9wdGlvblNldC1Db2RlcylcclxuICAgIGNvbnN0IG5hID0gTnVtYmVyKGEpLCBuYiA9IE51bWJlcihiKTtcclxuICAgIGlmICghTnVtYmVyLmlzTmFOKG5hKSAmJiAhTnVtYmVyLmlzTmFOKG5iKSkgcmV0dXJuIG5hID09PSBuYjtcclxuXHJcbiAgICAvLyBCb29sZWFuXHJcbiAgICBpZiAodHlwZW9mIGEgPT09IFwiYm9vbGVhblwiIHx8IHR5cGVvZiBiID09PSBcImJvb2xlYW5cIikge1xyXG4gICAgICAgIHJldHVybiBTdHJpbmcoYSkudG9Mb3dlckNhc2UoKSA9PT0gU3RyaW5nKGIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gU3RyaW5ncyAoY2FzZS1pbnNlbnNpdGl2ZSlcclxuICAgIHJldHVybiBTdHJpbmcoYSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYiA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b0d1aWRPck51bGwodmFsdWU6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgaWYgKCF2YWx1ZSkgcmV0dXJuIG51bGw7XHJcbiAgICBjb25zdCBzID0gU3RyaW5nKHZhbHVlKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gL15bMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMC05YS1mXXs0fS1bMC05YS1mXXs0fS1bMC05YS1mXXsxMn0kLy50ZXN0KHMpID8gcyA6IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tIEtvbWZvcnQ6IEF1dG8tT25DaGFuZ2UgLS0tLS0tLS0tLS0tLS0tLS0tLS1cclxuXHJcbmZ1bmN0aW9uIGF1dG9XaXJlT25DaGFuZ2UoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgY29uZmlnOiBCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsKTogdm9pZCB7XHJcbiAgICBpZiAoIWNvbmZpZz8uZW50aXRpZXMpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBlbnRpdHlMb2dpY2FsTmFtZSA9IGZvcm1Db250ZXh0LmRhdGEuZW50aXR5LmdldEVudGl0eU5hbWUoKTtcclxuICAgIGNvbnN0IGVudGl0eUNvbmZpZyA9IGNvbmZpZy5lbnRpdGllc1tlbnRpdHlMb2dpY2FsTmFtZV0gYXMgRW50aXR5Q29uZmlnIHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgZmllbGRzID0gbGlzdENvbmRpdGlvbkZpZWxkcyhlbnRpdHlDb25maWcpO1xyXG5cclxuICAgIGZpZWxkcy5mb3JFYWNoKGF0dHJpYnV0ZU5hbWUgPT4ge1xyXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcclxuICAgICAgICBpZiAoIWF0dHJpYnV0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSAoY3R4OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkgPT4gYXBwbHlEeW5hbWljTWFuZGF0b3J5UnVsZXMoY3R4KTtcclxuICAgICAgICB0cnkgeyBhdHRyaWJ1dGUuYWRkT25DaGFuZ2UoaGFuZGxlcik7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfSk7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9