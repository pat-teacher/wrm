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
/*!****************************************************!*\
  !*** ./WebResources/src/form/kyc_approval.form.ts ***!
  \****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAllowedAccounts: () => (/* binding */ addAllowedAccounts),
/* harmony export */   onLoad: () => (/* binding */ onLoad)
/* harmony export */ });
/* harmony import */ var _entities_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../entities/index */ "./WebResources/src/entities/index.ts");
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/crm.core */ "./WebResources/src/core/crm.core.ts");
// Hinweis: Keine TS-Namespaces. Nur die beiden Handler werden exportiert.


/**
 * FORM onLoad
 */
async function onLoad(executionContext) {
    var _a, _b, _c, _d;
    const fc = (_b = (_a = executionContext.getFormContext) === null || _a === void 0 ? void 0 : _a.call(executionContext)) !== null && _b !== void 0 ? _b : executionContext;
    try {
        await toggleAccountsSubgridForOriginType(fc);
        // OnChange-Handler für OriginTypeId hinzufügen
        (_d = (_c = fc.getAttribute) === null || _c === void 0 ? void 0 : _c.call(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.ambcustOriginTypeId)) === null || _d === void 0 ? void 0 : _d.addOnChange(async () => {
            await toggleAccountsSubgridForOriginType(fc);
        });
    }
    catch {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.setVisible(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts, false);
    }
}
/**
 * Ribbon-Command: Accounts hinzufügen (Associate in N:N)
 */
async function addAllowedAccounts(primaryControl) {
    var _a, _b, _c, _d;
    const fc = primaryControl;
    const xrm = (_a = window.Xrm) !== null && _a !== void 0 ? _a : _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.Xrm;
    const currentId = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.FormHelper.getCurrentId(fc);
    if (!currentId) {
        await xrm.Navigation.openAlertDialog({ text: "Please save the record first." });
        return;
    }
    const contactId = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.FormHelper.getLookupId(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.contactId);
    const companyId = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.FormHelper.getLookupId(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.companyId);
    if (!contactId && !companyId) {
        await xrm.Navigation.openAlertDialog({ text: "Please set either a Contact or a Company first." });
        return;
    }
    try {
        const candidateIds = await fetchCandidatePortfolioIds(contactId, companyId);
        if (candidateIds.length === 0) {
            await xrm.Navigation.openAlertDialog({ text: "No matching accounts found for the selected Contact/Company." });
            return;
        }
        const alreadyLinked = await getAlreadyLinkedPortfolioIds(currentId);
        const candidatesToOffer = candidateIds.filter(id => !alreadyLinked.has(_core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(id)));
        if (candidatesToOffer.length === 0) {
            await xrm.Navigation.openAlertDialog({ text: "All candidate accounts are already linked to this record." });
            return;
        }
        const selectedIds = await openCandidatePicker(fc, candidatesToOffer);
        if (selectedIds.length === 0)
            return;
        await associateSelectedPortfolios(currentId, selectedIds);
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.GridHelper.tryRefreshSubgrid(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts);
    }
    catch (err) {
        await ((_c = (_b = xrm.Navigation).openErrorDialog) === null || _c === void 0 ? void 0 : _c.call(_b, { message: (_d = err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : String(err) }));
    }
}
/* ---------------------------------- */
/*           helper functions         */
/* ---------------------------------- */
async function toggleAccountsSubgridForOriginType(fc) {
    const accountOpeningId = await getAccountOpeningId();
    if (!accountOpeningId) {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.setVisible(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts, false);
        return;
    }
    _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.showIfLookupEquals(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.ambcustOriginTypeId, accountOpeningId, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts);
}
async function getAccountOpeningId() {
    return _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.LookupService.getIdByEquality(_entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.entity, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.fields.pk, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.fields.typeNameCode, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.values.ACCOUNT_OPENING);
}
async function fetchCandidatePortfolioIds(contactId, companyId) {
    const orBlock = [
        contactId
            ? `<condition attribute="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.contactId}" operator="eq" value="${_core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(contactId)}" />`
            : "",
        companyId
            ? `<condition attribute="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.companyId}" operator="eq" value="${_core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(companyId)}" />`
            : "",
    ]
        .filter(Boolean)
        .join("");
    const fetchXml = `
    <fetch version="1.0" distinct="true">
      <entity name="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.entity}">
        <attribute name="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.portfolioId}" />
        <filter type="and">
          <filter type="or">
            ${orBlock}
          </filter>
        </filter>
        <link-entity name="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.entity}"
                     from="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.fields.pk}"
                     to="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.typeId}" alias="reltype">
          <filter>
            <condition attribute="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.fields.name}"
                       operator="eq"
                       value="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.options.NAME_PRINCIPAL}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>`.trim();
    const res = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.fetchXml(_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.entity, fetchXml);
    const ids = new Set();
    for (const e of res.entities) {
        const id = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(e[`_${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.portfolioId}_value`]) ||
            _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(e[_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.portfolioId]);
        if (id)
            ids.add(id);
    }
    return Array.from(ids);
}
async function getAlreadyLinkedPortfolioIds(mainId) {
    const expand = `?$expand=${_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.relationships.portfolios.nav}($select=${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIO.fields.pk})`;
    const rec = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.retrieveRecord(_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.entity, mainId, expand);
    const list = ((rec === null || rec === void 0 ? void 0 : rec[_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.relationships.portfolios.nav]) || []);
    return new Set(list.map(row => _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(row[_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIO.fields.pk])));
}
async function openCandidatePicker(fc, candidateIds) {
    var _a, _b, _c, _d;
    (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _a === void 0 ? void 0 : _a.setFormNotification) === null || _b === void 0 ? void 0 : _b.call(_a, "Showing accounts that match the selected Contact/Company. Already linked items are hidden.", "INFO", "account-filter-context");
    const selection = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.LookupDialogHelper.openWithIdList(_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIO.entity, _entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIO.fields.pk, candidateIds, { allowMultiSelect: true, disableMru: true });
    (_d = (_c = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _c === void 0 ? void 0 : _c.clearFormNotification) === null || _d === void 0 ? void 0 : _d.call(_c, "account-filter-context");
    if (!selection || selection.length === 0)
        return [];
    return _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.unique(selection.map(s => _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(s.id)));
}
async function associateSelectedPortfolios(mainId, selectedIds) {
    if (!selectedIds.length)
        return;
    await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.associateManyToMany(_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.entity, mainId, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.relationships.portfolios.schema, _entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIO.entity, selectedIds);
}

})();

(window.WRM = window.WRM || {}).kyc_approval_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoia3ljX2FwcHJvdmFsX2Zvcm0uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxxRkFBcUY7QUFFckYsbUJBQW1CO0FBQ1osTUFBTSxJQUFJO0lBQ2IsTUFBTSxLQUFLLEdBQUcsS0FBVSxPQUFRLE1BQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBRXJELE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBVztRQUMzQixPQUFPLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sQ0FBQyxNQUFNLENBQUksR0FBUTtRQUNyQixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUNwQyxDQUFDO0NBQ0o7QUFFRCwyQkFBMkI7QUFDcEIsTUFBTSxTQUFTO0lBQ2xCLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDLGlCQUF5QixFQUFFLEVBQVUsRUFBRSxPQUFnQjtRQUMvRSxNQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxjQUFjLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLGdCQUFnQixDQUFDLGlCQUF5QixFQUFFLE9BQWdCO1FBQ3JFLE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsaUJBQXlCLEVBQUUsUUFBZ0I7UUFDN0QsTUFBTSxHQUFHLEdBQUcsYUFBYSxrQkFBa0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQy9ELE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBWTtRQUM3QixPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUIsQ0FDNUIsbUJBQTJCLEVBQzNCLFFBQWdCLEVBQ2hCLHNCQUE4QixFQUM5QixvQkFBNEIsRUFDNUIsVUFBb0I7UUFFcEIsTUFBTSxHQUFHLEdBQUc7WUFDUixNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsbUJBQW1CLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDNUUsZUFBZSxFQUFFLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUN4RyxZQUFZLEVBQUUsc0JBQXNCO1lBQ3BDLFdBQVcsRUFBRTtnQkFDVCxPQUFPLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQ3RHLENBQUM7U0FDRyxDQUFDO1FBRVQsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDdkcsQ0FBQztDQUNKO0FBRUQsbUJBQW1CO0FBQ1osTUFBTSxVQUFVO0lBQ25CLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBTzs7UUFDdkIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsb0JBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxJQUFJLDBDQUFFLE1BQU0sMENBQUUsS0FBSyxrREFBSSxDQUFDO1lBQzFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkQsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUFDLE9BQU8sSUFBSSxDQUFDO1FBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFPLEVBQUUsU0FBaUI7O1FBQ3pDLE1BQU0sQ0FBQyxHQUFHLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsWUFBWSxtREFBRyxTQUFTLENBQUMsMENBQUUsUUFBUSxrREFBSSxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDbEUsQ0FBQztDQUNKO0FBRU0sTUFBTSxVQUFVO0lBQ25CLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFPLEVBQUUsSUFBYTs7UUFDM0MsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPO1FBQ2xCLE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxVQUFVLG1EQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLE9BQU8sRUFBRSxDQUFDO1lBQUMsSUFBSSxDQUFDO2dCQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztZQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUFDLENBQUM7YUFDaEUsQ0FBQztZQUFDLElBQUksQ0FBQztnQkFBQyxjQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRSwwQ0FBRSxhQUFhLGtEQUFJLENBQUM7WUFBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFBQyxDQUFDO0lBQ3RFLENBQUM7Q0FDSjtBQUVELHlCQUF5QjtBQUNsQixNQUFNLGdCQUFnQjtJQUN6QixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxXQUFtQixFQUFFLE9BQWdCOztRQUM1RCxNQUFNLElBQUksR0FBRyxRQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsVUFBVSxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxVQUFVLEVBQUUsQ0FBQztZQUFDLElBQUksQ0FBQztnQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQUMsQ0FBQztJQUN0RixDQUFDO0lBRUQsaURBQWlEO0lBQ2pELE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBTyxFQUFFLFdBQW1CLEVBQUUsVUFBbUI7O1FBQ2hFLE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxZQUFZLG1EQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQzdDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLGdCQUFnQixFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDO2dCQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDM0YsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQU8sRUFBRSxXQUFtQixFQUFFLFNBQXdCO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQU8sRUFBRSxVQUFrQixFQUFFLFFBQWdCLEVBQUUsV0FBbUI7UUFDeEYsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUU7WUFDakQsTUFBTSxPQUFPLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDdkQsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQVNNLE1BQU0sa0JBQWtCO0lBQzNCLE1BQU0sQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUN2QixhQUFxQixFQUNyQixXQUFtQixFQUNuQixHQUFhLEVBQ2IsT0FBNkY7O1FBRTdGLE1BQU0sUUFBUSxHQUFHLEdBQUc7YUFDZixHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxrQkFBa0IsYUFBYSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQzthQUNoRixJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFZCxNQUFNLFNBQVMsR0FBRzs7Z0NBRU0sV0FBVztZQUMvQixRQUFROzs7Z0JBR0osQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVoQixNQUFNLGFBQWEsR0FBUTtZQUN2QixnQkFBZ0IsRUFBRSxhQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZ0JBQWdCLG1DQUFJLElBQUk7WUFDbkQsaUJBQWlCLEVBQUUsYUFBYTtZQUNoQyxXQUFXLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDNUIsT0FBTyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDMUQsVUFBVSxFQUFFLGFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxVQUFVLG1DQUFJLElBQUk7U0FDMUMsQ0FBQztRQUVGLElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGFBQWE7WUFBRSxhQUFhLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFFaEYsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQW1CLENBQUM7SUFDakYsQ0FBQztDQUNKO0FBRUQscUNBQXFDO0FBQzlCLE1BQU0sYUFBYTtJQUN0QixnRkFBZ0Y7SUFDaEYsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FDM0IsYUFBcUIsRUFDckIsTUFBYyxFQUNkLFdBQW1CLENBQUMsMkJBQTJCOzs7UUFFL0MsTUFBTSxPQUFPLEdBQUcsWUFBWSxNQUFNLFlBQVksV0FBVyxFQUFFLENBQUM7UUFDNUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sR0FBRyxHQUFHLFNBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxRQUFRLDBDQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRyxNQUFNLENBQXVCLENBQUM7UUFDL0MsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRUQsK0NBQStDO0lBQy9DLE1BQU0sQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUN4QixhQUFxQixFQUNyQixNQUFjLEVBQ2QsSUFBWSxFQUNaLEtBQWdDO1FBRWhDLE1BQU0sR0FBRyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDekYsT0FBTyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLE1BQU0sRUFBRSxJQUFJLElBQUksT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7O0FDOUtNLE1BQU0sT0FBTyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE1BQU0sRUFBRTtRQUNKLEVBQUUsRUFBRSxXQUFXO1FBQ2Ysa0JBQWtCLEVBQUUsb0JBQW9CO0tBQzNDO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNOWCxxQ0FBcUM7QUFDckMsNkVBQTZFO0FBRXRFLE1BQU0sb0JBQW9CLEdBQUc7SUFDaEMsTUFBTSxFQUFFLGtCQUFrQjtJQUMxQixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsb0JBQW9CO1FBQ3hCLG1CQUFtQixFQUFFLDRCQUE0QjtLQUNwRDtDQUNLLENBQUM7QUFnQ0osU0FBUyx1QkFBdUIsQ0FBQyxRQUF1QjtJQUMzRCxJQUFJLENBQUMsUUFBUTtRQUFFLE9BQU8sSUFBSSxDQUFDO0lBQzNCLElBQUksQ0FBQztRQUNELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUF1QixDQUFDO1FBQzFELElBQUksQ0FBQyxNQUFNLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxJQUFJLENBQUMsTUFBTSxDQUFDLFFBQVE7WUFBRSxPQUFPLElBQUksQ0FBQztRQUMzRSxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQUMsTUFBTSxDQUFDO1FBQ0wsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztBQUNMLENBQUM7QUFFRCw4RkFBOEY7QUFDdkYsU0FBUyxtQkFBbUIsQ0FBQyxZQUEyQjs7SUFDM0QsSUFBSSxDQUFDLG1CQUFZLGFBQVosWUFBWSx1QkFBWixZQUFZLENBQUUsS0FBSywwQ0FBRSxNQUFNO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDNUMsTUFBTSxNQUFNLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBQyxRQUFDLFVBQUksQ0FBQyxTQUFTLG1DQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBQyxDQUFDO0lBQzVGLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ3ZDLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3pERCx1QkFBdUI7QUFDaEIsTUFBTSxVQUFVLEdBQUc7SUFDdEIsTUFBTSxFQUFFLG9CQUFvQjtJQUM1QixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsc0JBQXNCO1FBQzFCLFlBQVksRUFBRSxxQkFBcUI7S0FDdEM7SUFDRCxNQUFNLEVBQUU7UUFDSixlQUFlLEVBQUUsaUJBQWlCO0tBQ3JDO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDVlgsc0JBQXNCO0FBQ2YsTUFBTSxTQUFTLEdBQUc7SUFDckIsTUFBTSxFQUFFLGdCQUFnQjtJQUN4QixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsa0JBQWtCO0tBQ3pCO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDTlgsa0NBQWtDO0FBQzNCLE1BQU0scUJBQXFCLEdBQUc7SUFDakMsTUFBTSxFQUFFLDRCQUE0QjtJQUNwQyxNQUFNLEVBQUU7UUFDSixXQUFXLEVBQUUsa0JBQWtCO1FBQy9CLFNBQVMsRUFBRSxnQkFBZ0I7UUFDM0IsU0FBUyxFQUFFLGdCQUFnQjtRQUMzQixNQUFNLEVBQUUsa0NBQWtDO0tBQzdDO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDVFgsc0NBQXNDO0FBQy9CLE1BQU0seUJBQXlCLEdBQUc7SUFDckMsTUFBTSxFQUFFLGdDQUFnQztJQUN4QyxNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsa0NBQWtDO1FBQ3RDLElBQUksRUFBRSxXQUFXO0tBQ3BCO0lBQ0QsT0FBTyxFQUFFO1FBQ0wsY0FBYyxFQUFFLFdBQVc7S0FDOUI7Q0FDSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNWWCxtQ0FBbUM7QUFDNUIsTUFBTSxzQkFBc0IsR0FBRztJQUNsQyxNQUFNLEVBQUUsNkJBQTZCO0lBQ3JDLE1BQU0sRUFBRTtRQUNKLEVBQUUsRUFBRSwrQkFBK0I7UUFDbkMsU0FBUyxFQUFFLGdCQUFnQjtRQUMzQixTQUFTLEVBQUUsZ0JBQWdCO1FBQzNCLG1CQUFtQixFQUFFLHNCQUFzQjtLQUM5QztJQUNELFFBQVEsRUFBRTtRQUNOLGVBQWUsRUFBRSxzQkFBc0I7S0FDMUM7SUFDRCxhQUFhLEVBQUU7UUFDWCxVQUFVLEVBQUU7WUFDUixNQUFNLEVBQUUseUNBQXlDO1lBQ2pELEdBQUcsRUFBRSx5Q0FBeUM7U0FDakQ7S0FDSjtJQUNELElBQUksRUFBRTtRQUNGLElBQUksRUFBRSxVQUFVO1FBQ2hCLE1BQU0sRUFBRSxZQUFZO0tBQ3ZCO0lBQ0QsUUFBUSxFQUFFO1FBQ04sUUFBUSxFQUFFLGNBQWM7S0FDM0I7SUFDRCxPQUFPLEVBQUU7SUFDTCx1Q0FBdUM7S0FDMUM7Q0FDSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUM1QlgsNENBQTRDO0FBQ0k7QUFDYjtBQUNZO0FBQ0k7QUFDZjtBQUNLO0FBQ1I7Ozs7Ozs7VUNQakM7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQSxFOzs7OztXQ1BBLHdGOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RCxFOzs7Ozs7Ozs7Ozs7Ozs7OztBQ05BLDBFQUEwRTtBQVEvQztBQVVEO0FBRTFCOztHQUVHO0FBQ0ksS0FBSyxVQUFVLE1BQU0sQ0FBQyxnQkFBcUI7O0lBQzlDLE1BQU0sRUFBRSxHQUFHLDRCQUFnQixDQUFDLGNBQWMsZ0VBQUksbUNBQUksZ0JBQWdCLENBQUM7SUFDbkUsSUFBSSxDQUFDO1FBQ0QsTUFBTSxrQ0FBa0MsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUM3QywrQ0FBK0M7UUFDL0MsY0FBRSxDQUFDLFlBQVksbURBQUcsbUVBQXNCLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLDBDQUFFLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUN6RixNQUFNLGtDQUFrQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2pELENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNMLDREQUFnQixDQUFDLFVBQVUsQ0FBQyxFQUFFLEVBQUUsbUVBQXNCLENBQUMsUUFBUSxDQUFDLGVBQWUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1RixDQUFDO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0ksS0FBSyxVQUFVLGtCQUFrQixDQUFDLGNBQW1COztJQUN4RCxNQUFNLEVBQUUsR0FBRyxjQUFjLENBQUM7SUFDMUIsTUFBTSxHQUFHLEdBQUcsTUFBQyxNQUFjLENBQUMsR0FBRyxtQ0FBSSxnREFBSSxDQUFDLEdBQUcsQ0FBQztJQUU1QyxNQUFNLFNBQVMsR0FBRyxzREFBVSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUM5QyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDYixNQUFNLEdBQUcsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLEVBQUUsSUFBSSxFQUFFLCtCQUErQixFQUFFLENBQUMsQ0FBQztRQUNoRixPQUFPO0lBQ1gsQ0FBQztJQUVELE1BQU0sU0FBUyxHQUFHLHNEQUFVLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxtRUFBc0IsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDdEYsTUFBTSxTQUFTLEdBQUcsc0RBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLG1FQUFzQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUV0RixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0IsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSxpREFBaUQsRUFBRSxDQUFDLENBQUM7UUFDbEcsT0FBTztJQUNYLENBQUM7SUFFRCxJQUFJLENBQUM7UUFDRCxNQUFNLFlBQVksR0FBRyxNQUFNLDBCQUEwQixDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUM1RSxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDNUIsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSw4REFBOEQsRUFBRSxDQUFDLENBQUM7WUFDL0csT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLGFBQWEsR0FBRyxNQUFNLDRCQUE0QixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3BFLE1BQU0saUJBQWlCLEdBQUcsWUFBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxnREFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0YsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDakMsTUFBTSxHQUFHLENBQUMsVUFBVSxDQUFDLGVBQWUsQ0FBQyxFQUFFLElBQUksRUFBRSwyREFBMkQsRUFBRSxDQUFDLENBQUM7WUFDNUcsT0FBTztRQUNYLENBQUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxNQUFNLG1CQUFtQixDQUFDLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3JFLElBQUksV0FBVyxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUVyQyxNQUFNLDJCQUEyQixDQUFDLFNBQVMsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUUxRCxzREFBVSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxtRUFBc0IsQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLENBQUM7SUFDdEYsQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDaEIsTUFBTSxnQkFBRyxDQUFDLFVBQVUsRUFBQyxlQUFlLG1EQUFHLEVBQUUsT0FBTyxFQUFFLFNBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxPQUFPLG1DQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUM7SUFDckYsQ0FBQztBQUNMLENBQUM7QUFFRCx3Q0FBd0M7QUFDeEMsd0NBQXdDO0FBQ3hDLHdDQUF3QztBQUV4QyxLQUFLLFVBQVUsa0NBQWtDLENBQUMsRUFBTztJQUNyRCxNQUFNLGdCQUFnQixHQUFHLE1BQU0sbUJBQW1CLEVBQUUsQ0FBQztJQUNyRCxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUNwQiw0REFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLG1FQUFzQixDQUFDLFFBQVEsQ0FBQyxlQUFlLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDeEYsT0FBTztJQUNYLENBQUM7SUFFRCw0REFBZ0IsQ0FBQyxrQkFBa0IsQ0FDL0IsRUFBRSxFQUNGLG1FQUFzQixDQUFDLE1BQU0sQ0FBQyxtQkFBbUIsRUFDakQsZ0JBQWdCLEVBQ2hCLG1FQUFzQixDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQ2xELENBQUM7QUFDTixDQUFDO0FBRUQsS0FBSyxVQUFVLG1CQUFtQjtJQUM5QixPQUFPLHlEQUFhLENBQUMsZUFBZSxDQUNoQyx1REFBVSxDQUFDLE1BQU0sRUFDakIsdURBQVUsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUNwQix1REFBVSxDQUFDLE1BQU0sQ0FBQyxZQUFZLEVBQzlCLHVEQUFVLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FDcEMsQ0FBQztBQUNOLENBQUM7QUFFRCxLQUFLLFVBQVUsMEJBQTBCLENBQUMsU0FBa0IsRUFBRSxTQUFrQjtJQUM1RSxNQUFNLE9BQU8sR0FBRztRQUNaLFNBQVM7WUFDTCxDQUFDLENBQUMseUJBQXlCLGtFQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFTLDBCQUEwQixnREFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTTtZQUM3SCxDQUFDLENBQUMsRUFBRTtRQUNSLFNBQVM7WUFDTCxDQUFDLENBQUMseUJBQXlCLGtFQUFxQixDQUFDLE1BQU0sQ0FBQyxTQUFTLDBCQUEwQixnREFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsTUFBTTtZQUM3SCxDQUFDLENBQUMsRUFBRTtLQUNYO1NBQ0ksTUFBTSxDQUFDLE9BQU8sQ0FBQztTQUNmLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVkLE1BQU0sUUFBUSxHQUFHOztzQkFFQyxrRUFBcUIsQ0FBQyxNQUFNOzJCQUN2QixrRUFBcUIsQ0FBQyxNQUFNLENBQUMsV0FBVzs7O2NBR3JELE9BQU87Ozs2QkFHUSxzRUFBeUIsQ0FBQyxNQUFNOzZCQUNoQyxzRUFBeUIsQ0FBQyxNQUFNLENBQUMsRUFBRTsyQkFDckMsa0VBQXFCLENBQUMsTUFBTSxDQUFDLE1BQU07O29DQUUxQixzRUFBeUIsQ0FBQyxNQUFNLENBQUMsSUFBSTs7Z0NBRXpDLHNFQUF5QixDQUFDLE9BQU8sQ0FBQyxjQUFjOzs7O2FBSW5FLENBQUMsSUFBSSxFQUFFLENBQUM7SUFFakIsTUFBTSxHQUFHLEdBQUcsTUFBTSxxREFBUyxDQUFDLFFBQVEsQ0FBQyxrRUFBcUIsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDN0UsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLEVBQVUsQ0FBQztJQUM5QixLQUFLLE1BQU0sQ0FBQyxJQUFJLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUMzQixNQUFNLEVBQUUsR0FDSixnREFBSSxDQUFDLFlBQVksQ0FBRSxDQUFTLENBQUMsSUFBSSxrRUFBcUIsQ0FBQyxNQUFNLENBQUMsV0FBVyxRQUFRLENBQUMsQ0FBQztZQUNuRixnREFBSSxDQUFDLFlBQVksQ0FBRSxDQUFTLENBQUMsa0VBQXFCLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7UUFDNUUsSUFBSSxFQUFFO1lBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ0QsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNCLENBQUM7QUFFRCxLQUFLLFVBQVUsNEJBQTRCLENBQUMsTUFBYztJQUN0RCxNQUFNLE1BQU0sR0FBRyxZQUFZLG1FQUFzQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxZQUFZLHNEQUFTLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDO0lBQ2pILE1BQU0sR0FBRyxHQUFHLE1BQU0scURBQVMsQ0FBQyxjQUFjLENBQUMsbUVBQXNCLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUMxRixNQUFNLElBQUksR0FBRyxDQUFDLElBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRyxtRUFBc0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxLQUFJLEVBQUUsQ0FBZSxDQUFDO0lBQzlGLE9BQU8sSUFBSSxHQUFHLENBQVMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLGdEQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxzREFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUN6RixDQUFDO0FBRUQsS0FBSyxVQUFVLG1CQUFtQixDQUFDLEVBQU8sRUFBRSxZQUFzQjs7SUFDOUQsY0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLEVBQUUsMENBQUUsbUJBQW1CLG1EQUN2Qiw0RkFBNEYsRUFDNUYsTUFBTSxFQUNOLHdCQUF3QixDQUMzQixDQUFDO0lBRUYsTUFBTSxTQUFTLEdBQUcsTUFBTSw4REFBa0IsQ0FBQyxjQUFjLENBQ3JELHNEQUFTLENBQUMsTUFBTSxFQUNoQixzREFBUyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQ25CLFlBQVksRUFDWixFQUFFLGdCQUFnQixFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLENBQy9DLENBQUM7SUFFRixjQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRSwwQ0FBRSxxQkFBcUIsbURBQUcsd0JBQXdCLENBQUMsQ0FBQztJQUUxRCxJQUFJLENBQUMsU0FBUyxJQUFJLFNBQVMsQ0FBQyxNQUFNLEtBQUssQ0FBQztRQUFFLE9BQU8sRUFBRSxDQUFDO0lBQ3BELE9BQU8sZ0RBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLGdEQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDcEUsQ0FBQztBQUVELEtBQUssVUFBVSwyQkFBMkIsQ0FBQyxNQUFjLEVBQUUsV0FBcUI7SUFDNUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxNQUFNO1FBQUUsT0FBTztJQUNoQyxNQUFNLHFEQUFTLENBQUMsbUJBQW1CLENBQy9CLG1FQUFzQixDQUFDLE1BQU0sRUFDN0IsTUFBTSxFQUNOLG1FQUFzQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUN0RCxzREFBUyxDQUFDLE1BQU0sRUFDaEIsV0FBVyxDQUNkLENBQUM7QUFDTixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jcm0uY29yZS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db250YWN0LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9NYW5kYXRvcnlDb25maWcuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL09yaWdpblR5cGUuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1BvcnRmb2xpby5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9SaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9pbmRleC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9mb3JtL2t5Y19hcHByb3ZhbC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIGNybS5jb3JlLnRzIO+/vSBHZW5lcmljIENvcmUgVXRpbGl0aWVzICYgU2VydmljZXMgKGtlaW5lIEFiaO+/vW5naWdrZWl0ZW4genUgRW50aXRpZXMpXHJcblxyXG4vKiogQ29yZSBoZWxwZXJzICovXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7IHJldHVybiAod2luZG93IGFzIGFueSkuWHJtOyB9XHJcblxyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFRoaW4gV2ViIEFQSSB3cmFwcGVyICovXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKGlkID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEZvcm0gaGVscGVycyAqL1xyXG5leHBvcnQgY2xhc3MgRm9ybUhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHsgdHJ5IHsgZ3JpZC5yZWZyZXNoKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfSB9XHJcbiAgICAgICAgZWxzZSB7IHRyeSB7IGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfSB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBWaXNpYmlsaXR5IGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkgeyB0cnkgeyBjdHJsLnNldFZpc2libGUodmlzaWJsZSk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfSB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHp0IGRhcyBQZmxpY2h0ZmVsZC1GbGFnIGbDvHIgZWluIENvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHsgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIExvb2t1cCBkaWFsb2cgaGVscGVyICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nOyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoaWQgPT4gYDx2YWx1ZSB1aXR5cGU9XCIke2VudGl0eUxvZ2ljYWx9XCI+eyR7VXRpbC5zYW5pdGl6ZUd1aWQoaWQpfX08L3ZhbHVlPmApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJYbWwgPSBgXHJcbiAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtpZEF0dHJpYnV0ZX1cIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAke2luVmFsdWVzfVxyXG4gICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgIDwvZmlsdGVyPmAudHJpbSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb29rdXBPcHRpb25zOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGFsbG93TXVsdGlTZWxlY3Q6IG9wdGlvbnM/LmFsbG93TXVsdGlTZWxlY3QgPz8gdHJ1ZSxcclxuICAgICAgICAgICAgZGVmYXVsdEVudGl0eVR5cGU6IGVudGl0eUxvZ2ljYWwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGVzOiBbZW50aXR5TG9naWNhbF0sXHJcbiAgICAgICAgICAgIGZpbHRlcnM6IFt7IGVudGl0eUxvZ2ljYWxOYW1lOiBlbnRpdHlMb2dpY2FsLCBmaWx0ZXJYbWwgfV0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNcnU6IG9wdGlvbnM/LmRpc2FibGVNcnUgPz8gdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8uZGVmYXVsdFZpZXdJZCkgbG9va3VwT3B0aW9ucy5kZWZhdWx0Vmlld0lkID0gb3B0aW9ucy5kZWZhdWx0Vmlld0lkO1xyXG5cclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJpYyBsb29rdXAgc2VydmljZSAoT0RhdGEpICovXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBTZXJ2aWNlIHtcclxuICAgIC8qKiBSZXR1cm5zIGZpcnN0IHJlY29yZCBpZCAoc2FuaXRpemVkKSBtYXRjaGluZyBhIHJhdyBPRGF0YSBmaWx0ZXIsIG9yIG51bGwuICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nIC8vIGUuZy4gXCIoc3RhdHVzY29kZSBlcSAxKVwiXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBDb252ZW5pZW5jZTogZXF1YWxpdHkgb24gYSBzaW5nbGUgY29sdW1uICovXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgfVxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBlbnRpdGllcy9NYW5kYXRvcnlDb25maWcuZW50aXR5LnRzXHJcbi8vIFplbnRyYWxlIERlZmluaXRpb24gZGVzIEJ1c2luZXNzLVVuaXQtSlNPTi1GZWxkcywgRG9t77+9bmVudHlwZW4gdW5kIFBhcnNlci5cclxuXHJcbmV4cG9ydCBjb25zdCBCVVNJTkVTU1VOSVRMT0NBVElPTiA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X2xvY2F0aW9uXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgICAgICBtYW5kYXRvcnlDb25maWdKc29uOiBcIm1od3JtYl9tYW5kYXRvcnljb25maWdqc29uXCJcclxuICAgIH1cclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCI7XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICBmaWVsZDogc3RyaW5nOyAgICAgICAgICAgLy8gbG9naWNhbCBuYW1lICh6LiBCLiBcImN1c3RvbWVydHlwZWNvZGVcIiwgXCJwcmltYXJ5Y29udGFjdGlkXCIpXHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKipcclxuICAgICAqIEVyd2FydGV0ZXIgV2VydDpcclxuICAgICAqIC0gc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhbiB8IG51bGxcclxuICAgICAqIC0gR1VJRCAoei4gQi4gXCJhMWIyYzNkNC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDBcIilcclxuICAgICAqIC0gQXJyYXkgZu+/vXIgXCJpblwiOiAoc3RyaW5nW10gfCBudW1iZXJbXSB8IEdVSURbXSlcclxuICAgICAqL1xyXG4gICAgdmFsdWU/OiBhbnk7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk6IHN0cmluZ1tdOyAgICAgLy8gbG9naWNhbCBuYW1lcyBkZXIgRmVsZGVyLCBkaWUgcmVxdWlyZWQgd2VyZGVuXHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gVU5ELXZlcmtu77+9cGZ0OyBsZWVyL3VuZGVmaW5lZCA/IGdpbHQgaW1tZXJcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdDogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCk6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIEJ1c2luZXNzVW5pdENvbmZpZztcclxuICAgICAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiIHx8ICFwYXJzZWQuZW50aXRpZXMpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIExpZWZlcnQgYWxsZSBBdHRyaWJ1dG5hbWVuLCBkaWUgaW4gQ29uZGl0aW9ucyB2b3Jrb21tZW4gKGbvv71yIG9wdGlvbmFsZXMgQXV0by1PbkNoYW5nZSkuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBsaXN0Q29uZGl0aW9uRmllbGRzKGVudGl0eUNvbmZpZz86IEVudGl0eUNvbmZpZyk6IHN0cmluZ1tdIHtcclxuICAgIGlmICghZW50aXR5Q29uZmlnPy5ydWxlcz8ubGVuZ3RoKSByZXR1cm4gW107XHJcbiAgICBjb25zdCBmaWVsZHMgPSBlbnRpdHlDb25maWcucnVsZXMuZmxhdE1hcChydWxlID0+IChydWxlLmNvbmRpdGlvbiA/PyBbXSkubWFwKGMgPT4gYy5maWVsZCkpO1xyXG4gICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChmaWVsZHMpKTtcclxufVxyXG4iLCIvLyBPcmlnaW5UeXBlLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgT1JJR0lOVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X29yaWdpbnR5cGVcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3Rfb3JpZ2ludHlwZWlkXCIsXHJcbiAgICAgICAgdHlwZU5hbWVDb2RlOiBcIm1od3JtYl90eXBlbmFtZWNvZGVcIixcclxuICAgIH0sXHJcbiAgICB2YWx1ZXM6IHtcclxuICAgICAgICBBQ0NPVU5UX09QRU5JTkc6IFwiQUNDT1VOVF9PUEVOSU5HXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBQb3J0Zm9saW8uZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBQT1JURk9MSU8gPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybWJfcG9ydGZvbGlvaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcG9ydGZvbGlvSWQ6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1iX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1iX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIHR5cGVJZDogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgICAgIG5hbWU6IFwid3JtYl9uYW1lXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIE5BTUVfUFJJTkNJUEFMOiBcIlByaW5jaXBhbFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwgPSB7XHJcbiAgICBlbnRpdHk6IFwid3Jtcl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxpZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1yX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1yX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIGFtYmN1c3RPcmlnaW5UeXBlSWQ6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xzOiB7XHJcbiAgICAgICAgc3ViZ3JpZEFjY291bnRzOiBcIndybV9zdWJncmlkX2FjY291bnRzXCIsXHJcbiAgICB9LFxyXG4gICAgcmVsYXRpb25zaGlwczoge1xyXG4gICAgICAgIHBvcnRmb2xpb3M6IHtcclxuICAgICAgICAgICAgc2NoZW1hOiBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiLFxyXG4gICAgICAgICAgICBuYXY6IFwibWh3cm1iX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWwycG9ydGZvbGlvXCIsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB0YWJzOiB7XHJcbiAgICAgICAgTUFJTjogXCJUQUJfTUFJTlwiLFxyXG4gICAgICAgIFJFVklFVzogXCJUQUJfUkVWSUVXXCIsXHJcbiAgICB9LFxyXG4gICAgc2VjdGlvbnM6IHtcclxuICAgICAgICBBUFBST1ZBTDogXCJTRUNfQVBQUk9WQUxcIixcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgLy8gQmVpc3BpZWw6IFNUQVRVU19BUFBST1ZFRDogMTAwMDAwMDAxXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBCYXJyZWwgZmlsZSDvv70gYu+/vW5kZWx0IGFsbGUgRW50aXR5LU9iamVrdGVcclxuZXhwb3J0ICogZnJvbSBcIi4vUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXAuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BvcnRmb2xpb1JlbGF0aW9uc2hpcFR5cGUuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL09yaWdpblR5cGUuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL01hbmRhdG9yeUNvbmZpZy5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQ29udGFjdC5lbnRpdHlcIjtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBIaW53ZWlzOiBLZWluZSBUUy1OYW1lc3BhY2VzLiBOdXIgZGllIGJlaWRlbiBIYW5kbGVyIHdlcmRlbiBleHBvcnRpZXJ0LlxyXG5cclxuaW1wb3J0IHtcclxuICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwsXHJcbiAgICBQT1JURk9MSU8sXHJcbiAgICBQT1JURk9MSU9SRUxBVElPTlNISVAsXHJcbiAgICBQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLFxyXG4gICAgT1JJR0lOVFlQRSxcclxufSBmcm9tIFwiLi4vZW50aXRpZXMvaW5kZXhcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBVdGlsLFxyXG4gICAgQXBpQ2xpZW50LFxyXG4gICAgRm9ybUhlbHBlcixcclxuICAgIEdyaWRIZWxwZXIsXHJcbiAgICBWaXNpYmlsaXR5SGVscGVyLFxyXG4gICAgTG9va3VwRGlhbG9nSGVscGVyLFxyXG4gICAgTG9va3VwU2VydmljZSxcclxufSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuLyoqXHJcbiAqIEZPUk0gb25Mb2FkXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25Mb2FkKGV4ZWN1dGlvbkNvbnRleHQ6IGFueSkge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0Py4oKSA/PyBleGVjdXRpb25Db250ZXh0O1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCB0b2dnbGVBY2NvdW50c1N1YmdyaWRGb3JPcmlnaW5UeXBlKGZjKTtcclxuICAgICAgICAvLyBPbkNoYW5nZS1IYW5kbGVyIGbDvHIgT3JpZ2luVHlwZUlkIGhpbnp1ZsO8Z2VuXHJcbiAgICAgICAgZmMuZ2V0QXR0cmlidXRlPy4oUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuYW1iY3VzdE9yaWdpblR5cGVJZCk/LmFkZE9uQ2hhbmdlKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdG9nZ2xlQWNjb3VudHNTdWJncmlkRm9yT3JpZ2luVHlwZShmYyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzLCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSaWJib24tQ29tbWFuZDogQWNjb3VudHMgaGluenVmw7xnZW4gKEFzc29jaWF0ZSBpbiBOOk4pXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQWxsb3dlZEFjY291bnRzKHByaW1hcnlDb250cm9sOiBhbnkpIHtcclxuICAgIGNvbnN0IGZjID0gcHJpbWFyeUNvbnRyb2w7XHJcbiAgICBjb25zdCB4cm0gPSAod2luZG93IGFzIGFueSkuWHJtID8/IFV0aWwuWHJtO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRJZCA9IEZvcm1IZWxwZXIuZ2V0Q3VycmVudElkKGZjKTtcclxuICAgIGlmICghY3VycmVudElkKSB7XHJcbiAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJQbGVhc2Ugc2F2ZSB0aGUgcmVjb3JkIGZpcnN0LlwiIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjb250YWN0SWQgPSBGb3JtSGVscGVyLmdldExvb2t1cElkKGZjLCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmZpZWxkcy5jb250YWN0SWQpO1xyXG4gICAgY29uc3QgY29tcGFueUlkID0gRm9ybUhlbHBlci5nZXRMb29rdXBJZChmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuY29tcGFueUlkKTtcclxuXHJcbiAgICBpZiAoIWNvbnRhY3RJZCAmJiAhY29tcGFueUlkKSB7XHJcbiAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJQbGVhc2Ugc2V0IGVpdGhlciBhIENvbnRhY3Qgb3IgYSBDb21wYW55IGZpcnN0LlwiIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZUlkcyA9IGF3YWl0IGZldGNoQ2FuZGlkYXRlUG9ydGZvbGlvSWRzKGNvbnRhY3RJZCwgY29tcGFueUlkKTtcclxuICAgICAgICBpZiAoY2FuZGlkYXRlSWRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIk5vIG1hdGNoaW5nIGFjY291bnRzIGZvdW5kIGZvciB0aGUgc2VsZWN0ZWQgQ29udGFjdC9Db21wYW55LlwiIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhbHJlYWR5TGlua2VkID0gYXdhaXQgZ2V0QWxyZWFkeUxpbmtlZFBvcnRmb2xpb0lkcyhjdXJyZW50SWQpO1xyXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXNUb09mZmVyID0gY2FuZGlkYXRlSWRzLmZpbHRlcihpZCA9PiAhYWxyZWFkeUxpbmtlZC5oYXMoVXRpbC5zYW5pdGl6ZUd1aWQoaWQpKSk7XHJcbiAgICAgICAgaWYgKGNhbmRpZGF0ZXNUb09mZmVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIkFsbCBjYW5kaWRhdGUgYWNjb3VudHMgYXJlIGFscmVhZHkgbGlua2VkIHRvIHRoaXMgcmVjb3JkLlwiIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZElkcyA9IGF3YWl0IG9wZW5DYW5kaWRhdGVQaWNrZXIoZmMsIGNhbmRpZGF0ZXNUb09mZmVyKTtcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJZHMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGF3YWl0IGFzc29jaWF0ZVNlbGVjdGVkUG9ydGZvbGlvcyhjdXJyZW50SWQsIHNlbGVjdGVkSWRzKTtcclxuXHJcbiAgICAgICAgR3JpZEhlbHBlci50cnlSZWZyZXNoU3ViZ3JpZChmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5jb250cm9scy5zdWJncmlkQWNjb3VudHMpO1xyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuRXJyb3JEaWFsb2c/Lih7IG1lc3NhZ2U6IGVycj8ubWVzc2FnZSA/PyBTdHJpbmcoZXJyKSB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xyXG4vKiAgICAgICAgICAgaGVscGVyIGZ1bmN0aW9ucyAgICAgICAgICovXHJcbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZUFjY291bnRzU3ViZ3JpZEZvck9yaWdpblR5cGUoZmM6IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgYWNjb3VudE9wZW5pbmdJZCA9IGF3YWl0IGdldEFjY291bnRPcGVuaW5nSWQoKTtcclxuICAgIGlmICghYWNjb3VudE9wZW5pbmdJZCkge1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5jb250cm9scy5zdWJncmlkQWNjb3VudHMsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgVmlzaWJpbGl0eUhlbHBlci5zaG93SWZMb29rdXBFcXVhbHMoXHJcbiAgICAgICAgZmMsXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuYW1iY3VzdE9yaWdpblR5cGVJZCxcclxuICAgICAgICBhY2NvdW50T3BlbmluZ0lkLFxyXG4gICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzXHJcbiAgICApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRBY2NvdW50T3BlbmluZ0lkKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgcmV0dXJuIExvb2t1cFNlcnZpY2UuZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIE9SSUdJTlRZUEUuZW50aXR5LFxyXG4gICAgICAgIE9SSUdJTlRZUEUuZmllbGRzLnBrLFxyXG4gICAgICAgIE9SSUdJTlRZUEUuZmllbGRzLnR5cGVOYW1lQ29kZSxcclxuICAgICAgICBPUklHSU5UWVBFLnZhbHVlcy5BQ0NPVU5UX09QRU5JTkdcclxuICAgICk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQ2FuZGlkYXRlUG9ydGZvbGlvSWRzKGNvbnRhY3RJZD86IHN0cmluZywgY29tcGFueUlkPzogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgY29uc3Qgb3JCbG9jayA9IFtcclxuICAgICAgICBjb250YWN0SWRcclxuICAgICAgICAgICAgPyBgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMuY29udGFjdElkfVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7VXRpbC5zYW5pdGl6ZUd1aWQoY29udGFjdElkKX1cIiAvPmBcclxuICAgICAgICAgICAgOiBcIlwiLFxyXG4gICAgICAgIGNvbXBhbnlJZFxyXG4gICAgICAgICAgICA/IGA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5jb21wYW55SWR9XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHtVdGlsLnNhbml0aXplR3VpZChjb21wYW55SWQpfVwiIC8+YFxyXG4gICAgICAgICAgICA6IFwiXCIsXHJcbiAgICBdXHJcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKVxyXG4gICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgPGVudGl0eSBuYW1lPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZW50aXR5fVwiPlxyXG4gICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5wb3J0Zm9saW9JZH1cIiAvPlxyXG4gICAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgICAgPGZpbHRlciB0eXBlPVwib3JcIj5cclxuICAgICAgICAgICAgJHtvckJsb2NrfVxyXG4gICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUuZW50aXR5fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgIGZyb209XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUuZmllbGRzLnBrfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgIHRvPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLnR5cGVJZH1cIiBhbGlhcz1cInJlbHR5cGVcIj5cclxuICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLmZpZWxkcy5uYW1lfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3I9XCJlcVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUub3B0aW9ucy5OQU1FX1BSSU5DSVBBTH1cIiAvPlxyXG4gICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgPC9lbnRpdHk+XHJcbiAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5mZXRjaFhtbChQT1JURk9MSU9SRUxBVElPTlNISVAuZW50aXR5LCBmZXRjaFhtbCk7XHJcbiAgICBjb25zdCBpZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIGZvciAoY29uc3QgZSBvZiByZXMuZW50aXRpZXMpIHtcclxuICAgICAgICBjb25zdCBpZCA9XHJcbiAgICAgICAgICAgIFV0aWwuc2FuaXRpemVHdWlkKChlIGFzIGFueSlbYF8ke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMucG9ydGZvbGlvSWR9X3ZhbHVlYF0pIHx8XHJcbiAgICAgICAgICAgIFV0aWwuc2FuaXRpemVHdWlkKChlIGFzIGFueSlbUE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5wb3J0Zm9saW9JZF0pO1xyXG4gICAgICAgIGlmIChpZCkgaWRzLmFkZChpZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShpZHMpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRBbHJlYWR5TGlua2VkUG9ydGZvbGlvSWRzKG1haW5JZDogc3RyaW5nKTogUHJvbWlzZTxTZXQ8c3RyaW5nPj4ge1xyXG4gICAgY29uc3QgZXhwYW5kID0gYD8kZXhwYW5kPSR7UklTS1NVTU1BUllBTkRBUFBST1ZBTC5yZWxhdGlvbnNoaXBzLnBvcnRmb2xpb3MubmF2fSgkc2VsZWN0PSR7UE9SVEZPTElPLmZpZWxkcy5wa30pYDtcclxuICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmVudGl0eSwgbWFpbklkLCBleHBhbmQpO1xyXG4gICAgY29uc3QgbGlzdCA9IChyZWM/LltSSVNLU1VNTUFSWUFOREFQUFJPVkFMLnJlbGF0aW9uc2hpcHMucG9ydGZvbGlvcy5uYXZdIHx8IFtdKSBhcyBBcnJheTxhbnk+O1xyXG4gICAgcmV0dXJuIG5ldyBTZXQ8c3RyaW5nPihsaXN0Lm1hcChyb3cgPT4gVXRpbC5zYW5pdGl6ZUd1aWQocm93W1BPUlRGT0xJTy5maWVsZHMucGtdKSkpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBvcGVuQ2FuZGlkYXRlUGlja2VyKGZjOiBhbnksIGNhbmRpZGF0ZUlkczogc3RyaW5nW10pOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcbiAgICBmYz8udWk/LnNldEZvcm1Ob3RpZmljYXRpb24/LihcclxuICAgICAgICBcIlNob3dpbmcgYWNjb3VudHMgdGhhdCBtYXRjaCB0aGUgc2VsZWN0ZWQgQ29udGFjdC9Db21wYW55LiBBbHJlYWR5IGxpbmtlZCBpdGVtcyBhcmUgaGlkZGVuLlwiLFxyXG4gICAgICAgIFwiSU5GT1wiLFxyXG4gICAgICAgIFwiYWNjb3VudC1maWx0ZXItY29udGV4dFwiXHJcbiAgICApO1xyXG5cclxuICAgIGNvbnN0IHNlbGVjdGlvbiA9IGF3YWl0IExvb2t1cERpYWxvZ0hlbHBlci5vcGVuV2l0aElkTGlzdChcclxuICAgICAgICBQT1JURk9MSU8uZW50aXR5LFxyXG4gICAgICAgIFBPUlRGT0xJTy5maWVsZHMucGssXHJcbiAgICAgICAgY2FuZGlkYXRlSWRzLFxyXG4gICAgICAgIHsgYWxsb3dNdWx0aVNlbGVjdDogdHJ1ZSwgZGlzYWJsZU1ydTogdHJ1ZSB9XHJcbiAgICApO1xyXG5cclxuICAgIGZjPy51aT8uY2xlYXJGb3JtTm90aWZpY2F0aW9uPy4oXCJhY2NvdW50LWZpbHRlci1jb250ZXh0XCIpO1xyXG5cclxuICAgIGlmICghc2VsZWN0aW9uIHx8IHNlbGVjdGlvbi5sZW5ndGggPT09IDApIHJldHVybiBbXTtcclxuICAgIHJldHVybiBVdGlsLnVuaXF1ZShzZWxlY3Rpb24ubWFwKHMgPT4gVXRpbC5zYW5pdGl6ZUd1aWQocy5pZCkpKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYXNzb2NpYXRlU2VsZWN0ZWRQb3J0Zm9saW9zKG1haW5JZDogc3RyaW5nLCBzZWxlY3RlZElkczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghc2VsZWN0ZWRJZHMubGVuZ3RoKSByZXR1cm47XHJcbiAgICBhd2FpdCBBcGlDbGllbnQuYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmVudGl0eSxcclxuICAgICAgICBtYWluSWQsXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5yZWxhdGlvbnNoaXBzLnBvcnRmb2xpb3Muc2NoZW1hLFxyXG4gICAgICAgIFBPUlRGT0xJTy5lbnRpdHksXHJcbiAgICAgICAgc2VsZWN0ZWRJZHNcclxuICAgICk7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9