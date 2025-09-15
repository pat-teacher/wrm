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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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c0IsQ0FBQyxhQUFhLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFDdEQsc0RBQVMsQ0FBQyxNQUFNLEVBQ2hCLFdBQVcsQ0FDZCxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQ29udGFjdC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9PcmlnaW5UeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW8uZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1BvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvaW5kZXgudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZm9ybS9reWNfYXBwcm92YWwuZm9ybS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyAtLS0tIFR5cGVzIHNoYXJlZCBhY3Jvc3MgZW5naW5lICYgZW50aXRpZXMgLS0tLVxyXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9IFwiZXFcIiB8IFwibmVcIiB8IFwiaW5cIiB8IFwiaXNudWxsXCIgfCBcImlzbm90bnVsbFwiIHwgXCJub3RudWxsXCI7IC8vIGFsaWFzXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICAvKiogTG9naWNhbCBuYW1lIChzdXBwb3J0cyBkb3Qtbm90YXRpb24gZm9yIGxvb2t1cCBwcm9qZWN0aW9uczogZS5nLiwgXCJwcmltYXJ5Y29udGFjdGlkLm5hbWVcIikuICovXHJcbiAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgb3BlcmF0b3I6IE9wZXJhdG9yO1xyXG4gICAgLyoqIE9wdGlvbmFsIHZhbHVlIGZvciBjb21wYXJpc29ucyAob21pdHRlZCBmb3IgbnVsbC1vcGVyYXRvcnMpLiAqL1xyXG4gICAgdmFsdWU/OiB1bmtub3duO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJ1bGUge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIG1hbmRhdG9yeT86IHN0cmluZ1tdO1xyXG4gICAgY29uZGl0aW9uPzogQ29uZGl0aW9uW107IC8vIEFORC1jb25qdW5jdGlvbjsgZW1wdHkvdW5kZWZpbmVkIOKHkiBydWxlIGFsd2F5cyBtYXRjaGVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q29uZmlnIHtcclxuICAgIGRlZmF1bHQ/OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuLyoqIExpZ2h0d2VpZ2h0IGNvbXBhcmFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsb29rdXAgKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIGlkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gQ29yZSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG4gICAgc3RhdGljIGdldCBYcm0oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogTG93ZXJjYXNlLCBzdHJpcCBicmFjZXM7IHJldHVybnMgZW1wdHkgc3RyaW5nIGlmIGZhbHN5IGlucHV0LiAqL1xyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBUaGluIFdlYiBBUEkgd3JhcHBlciAtLS0tXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKChyaWQpID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocmlkKSB9KSksXHJcbiAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwU2NoZW1hTmFtZSxcclxuICAgICAgICAgICAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGJvdW5kUGFyYW1ldGVyOiBudWxsLCBwYXJhbWV0ZXJUeXBlczoge30sIG9wZXJhdGlvblR5cGU6IDIsIG9wZXJhdGlvbk5hbWU6IFwiQXNzb2NpYXRlXCIgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9IGFzIGFueTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBBcGlDbGllbnQuZXhlY3V0ZShyZXEpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEZvcm0gaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBGb3JtSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRDdXJyZW50SWQoZmM6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkUmF3ID0gZmM/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSYXcgPyBVdGlsLnNhbml0aXplR3VpZChpZFJhdykgOiBudWxsO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldExvb2t1cElkKGZjOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB2ID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZSk/LmdldFZhbHVlPy4oKTtcclxuICAgICAgICByZXR1cm4gdiAmJiB2Lmxlbmd0aCA/IFV0aWwuc2FuaXRpemVHdWlkKHZbMF0uaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEhlbHBlciB7XHJcbiAgICBzdGF0aWMgdHJ5UmVmcmVzaFN1YmdyaWQoZmM6IGFueSwgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBmYz8uZ2V0Q29udHJvbD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChncmlkPy5yZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBncmlkLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmYz8udWk/LnJlZnJlc2hSaWJib24/LigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFZpc2liaWxpdHkgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyByZXF1aXJlZCBsZXZlbCBvbiBhbiBhdHRyaWJ1dGUvY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldFJlcXVpcmVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGlzUmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cj8uc2V0UmVxdWlyZWRMZXZlbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZihmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzaG93ID0gISFwcmVkaWNhdGUoKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIGNvbnRyb2xOYW1lLCBzaG93KTtcclxuICAgICAgICByZXR1cm4gc2hvdztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmTG9va3VwRXF1YWxzKGZjOiBhbnksIGxvb2t1cEF0dHI6IHN0cmluZywgdGFyZ2V0SWQ6IHN0cmluZywgY29udHJvbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5SGVscGVyLnNob3dJZihmYywgY29udHJvbE5hbWUsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IEZvcm1IZWxwZXIuZ2V0TG9va3VwSWQoZmMsIGxvb2t1cEF0dHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gISFjdXJyZW50ICYmIFV0aWwuc2FuaXRpemVHdWlkKGN1cnJlbnQpID09PSBVdGlsLnNhbml0aXplR3VpZCh0YXJnZXRJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgQ09OVEFDVCA9IHtcclxuICAgIGVudGl0eTogXCJjb250YWN0XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJjb250YWN0aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0aWQ6IFwibmV2X2J1c2luZXNzdW5pdGlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0OyIsImltcG9ydCB0eXBlIHsgQnVzaW5lc3NVbml0Q29uZmlnLCBFbnRpdHlDb25maWcgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJVU0lORVNTVU5JVExPQ0FUSU9OID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3RfbG9jYXRpb25cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgICAgIG1hbmRhdG9yeUNvbmZpZ0pzb246IFwibWh3cm1iX21hbmRhdG9yeWNvbmZpZ2pzb25cIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vKiogU2FmZSBwYXJzZTsgcmV0dXJucyBudWxsIGlmIGludmFsaWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCk6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIEJ1c2luZXNzVW5pdENvbmZpZztcclxuICAgICAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiIHx8ICFwYXJzZWQuZW50aXRpZXMpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIENvbGxlY3QgYmFzZSBhdHRyaWJ1dGUgbmFtZXMgdXNlZCBpbiBjb25kaXRpb25zIChmb3IgYXV0byBPbkNoYW5nZSB3aXJpbmcpLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGlzdENvbmRpdGlvbkZpZWxkcyhlbnRpdHlDb25maWc/OiBFbnRpdHlDb25maWcpOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoIWVudGl0eUNvbmZpZz8ucnVsZXM/Lmxlbmd0aCkgcmV0dXJuIFtdO1xyXG4gICAgY29uc3QgZmllbGRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IHIgb2YgZW50aXR5Q29uZmlnLnJ1bGVzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIHIuY29uZGl0aW9uID8/IFtdKSB7XHJcbiAgICAgICAgICAgIGlmICghYy5maWVsZCkgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGJpbmQgb24gdGhlIGJhc2UgYXR0cmlidXRlIChiZWZvcmUgcHJvamVjdGlvbiBsaWtlIC5uYW1lKVxyXG4gICAgICAgICAgICBmaWVsZHMuYWRkKGMuZmllbGQuc3BsaXQoXCIuXCIsIDEpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShmaWVsZHMpO1xyXG59IiwiLy8gT3JpZ2luVHlwZS5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IE9SSUdJTlRZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwiYW1iY3VzdF9vcmlnaW50eXBlXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X29yaWdpbnR5cGVpZFwiLFxyXG4gICAgICAgIHR5cGVOYW1lQ29kZTogXCJtaHdybWJfdHlwZW5hbWVjb2RlXCIsXHJcbiAgICB9LFxyXG4gICAgdmFsdWVzOiB7XHJcbiAgICAgICAgQUNDT1VOVF9PUEVOSU5HOiBcIkFDQ09VTlRfT1BFTklOR1wiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb2lkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBQb3J0Zm9saW9SZWxhdGlvbnNoaXAuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBQT1JURk9MSU9SRUxBVElPTlNISVAgPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXBcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBvcnRmb2xpb0lkOiBcIndybWJfcG9ydGZvbGlvaWRcIixcclxuICAgICAgICBjb250YWN0SWQ6IFwid3JtYl9jb250YWN0aWRcIixcclxuICAgICAgICBjb21wYW55SWQ6IFwid3JtYl9jb21wYW55aWRcIixcclxuICAgICAgICB0eXBlSWQ6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpb1JlbGF0aW9uc2hpcFR5cGUuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlaWRcIixcclxuICAgICAgICBuYW1lOiBcIndybWJfbmFtZVwiLFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICBOQU1FX1BSSU5DSVBBTDogXCJQcmluY2lwYWxcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFJpc2tTdW1tYXJ5QW5kQXBwcm92YWwuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMID0ge1xyXG4gICAgZW50aXR5OiBcIndybXJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwid3Jtcl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsaWRcIixcclxuICAgICAgICBjb250YWN0SWQ6IFwid3Jtcl9jb250YWN0aWRcIixcclxuICAgICAgICBjb21wYW55SWQ6IFwid3Jtcl9jb21wYW55aWRcIixcclxuICAgICAgICBhbWJjdXN0T3JpZ2luVHlwZUlkOiBcImFtYmN1c3Rfb3JpZ2ludHlwZWlkXCJcclxuICAgIH0sXHJcbiAgICBjb250cm9sczoge1xyXG4gICAgICAgIHN1YmdyaWRBY2NvdW50czogXCJ3cm1fc3ViZ3JpZF9hY2NvdW50c1wiLFxyXG4gICAgfSxcclxuICAgIHJlbGF0aW9uc2hpcHM6IHtcclxuICAgICAgICBwb3J0Zm9saW9zOiB7XHJcbiAgICAgICAgICAgIHNjaGVtYTogXCJtaHdybWJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbDJwb3J0Zm9saW9cIixcclxuICAgICAgICAgICAgbmF2OiBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGFiczoge1xyXG4gICAgICAgIE1BSU46IFwiVEFCX01BSU5cIixcclxuICAgICAgICBSRVZJRVc6IFwiVEFCX1JFVklFV1wiLFxyXG4gICAgfSxcclxuICAgIHNlY3Rpb25zOiB7XHJcbiAgICAgICAgQVBQUk9WQUw6IFwiU0VDX0FQUFJPVkFMXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIC8vIEJlaXNwaWVsOiBTVEFUVVNfQVBQUk9WRUQ6IDEwMDAwMDAwMVxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gQmFycmVsIGZpbGUg77+9IGLvv71uZGVsdCBhbGxlIEVudGl0eS1PYmpla3RlXHJcbmV4cG9ydCAqIGZyb20gXCIuL1Jpc2tTdW1tYXJ5QW5kQXBwcm92YWwuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BvcnRmb2xpby5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9PcmlnaW5UeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9NYW5kYXRvcnlDb25maWcuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NvbnRhY3QuZW50aXR5XCI7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gSGlud2VpczogS2VpbmUgVFMtTmFtZXNwYWNlcy4gTnVyIGRpZSBiZWlkZW4gSGFuZGxlciB3ZXJkZW4gZXhwb3J0aWVydC5cclxuXHJcbmltcG9ydCB7XHJcbiAgICBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLFxyXG4gICAgUE9SVEZPTElPLFxyXG4gICAgUE9SVEZPTElPUkVMQVRJT05TSElQLFxyXG4gICAgUE9SVEZPTElPUkVMQVRJT05TSElQVFlQRSxcclxuICAgIE9SSUdJTlRZUEUsXHJcbn0gZnJvbSBcIi4uL2VudGl0aWVzL2luZGV4XCI7XHJcblxyXG5pbXBvcnQge1xyXG4gICAgVXRpbCxcclxuICAgIEFwaUNsaWVudCxcclxuICAgIEZvcm1IZWxwZXIsXHJcbiAgICBHcmlkSGVscGVyLFxyXG4gICAgVmlzaWJpbGl0eUhlbHBlcixcclxuICAgIExvb2t1cERpYWxvZ0hlbHBlcixcclxuICAgIExvb2t1cFNlcnZpY2UsXHJcbn0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbi8qKlxyXG4gKiBGT1JNIG9uTG9hZFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uTG9hZChleGVjdXRpb25Db250ZXh0OiBhbnkpIHtcclxuICAgIGNvbnN0IGZjID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dD8uKCkgPz8gZXhlY3V0aW9uQ29udGV4dDtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgYXdhaXQgdG9nZ2xlQWNjb3VudHNTdWJncmlkRm9yT3JpZ2luVHlwZShmYyk7XHJcbiAgICAgICAgLy8gT25DaGFuZ2UtSGFuZGxlciBmw7xyIE9yaWdpblR5cGVJZCBoaW56dWbDvGdlblxyXG4gICAgICAgIGZjLmdldEF0dHJpYnV0ZT8uKFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuZmllbGRzLmFtYmN1c3RPcmlnaW5UeXBlSWQpPy5hZGRPbkNoYW5nZShhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgICAgIGF3YWl0IHRvZ2dsZUFjY291bnRzU3ViZ3JpZEZvck9yaWdpblR5cGUoZmMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmNvbnRyb2xzLnN1YmdyaWRBY2NvdW50cywgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogUmliYm9uLUNvbW1hbmQ6IEFjY291bnRzIGhpbnp1ZsO8Z2VuIChBc3NvY2lhdGUgaW4gTjpOKVxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGFkZEFsbG93ZWRBY2NvdW50cyhwcmltYXJ5Q29udHJvbDogYW55KSB7XHJcbiAgICBjb25zdCBmYyA9IHByaW1hcnlDb250cm9sO1xyXG4gICAgY29uc3QgeHJtID0gKHdpbmRvdyBhcyBhbnkpLlhybSA/PyBVdGlsLlhybTtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50SWQgPSBGb3JtSGVscGVyLmdldEN1cnJlbnRJZChmYyk7XHJcbiAgICBpZiAoIWN1cnJlbnRJZCkge1xyXG4gICAgICAgIGF3YWl0IHhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiUGxlYXNlIHNhdmUgdGhlIHJlY29yZCBmaXJzdC5cIiB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29udGFjdElkID0gRm9ybUhlbHBlci5nZXRMb29rdXBJZChmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuY29udGFjdElkKTtcclxuICAgIGNvbnN0IGNvbXBhbnlJZCA9IEZvcm1IZWxwZXIuZ2V0TG9va3VwSWQoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuZmllbGRzLmNvbXBhbnlJZCk7XHJcblxyXG4gICAgaWYgKCFjb250YWN0SWQgJiYgIWNvbXBhbnlJZCkge1xyXG4gICAgICAgIGF3YWl0IHhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiUGxlYXNlIHNldCBlaXRoZXIgYSBDb250YWN0IG9yIGEgQ29tcGFueSBmaXJzdC5cIiB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjYW5kaWRhdGVJZHMgPSBhd2FpdCBmZXRjaENhbmRpZGF0ZVBvcnRmb2xpb0lkcyhjb250YWN0SWQsIGNvbXBhbnlJZCk7XHJcbiAgICAgICAgaWYgKGNhbmRpZGF0ZUlkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJObyBtYXRjaGluZyBhY2NvdW50cyBmb3VuZCBmb3IgdGhlIHNlbGVjdGVkIENvbnRhY3QvQ29tcGFueS5cIiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWxyZWFkeUxpbmtlZCA9IGF3YWl0IGdldEFscmVhZHlMaW5rZWRQb3J0Zm9saW9JZHMoY3VycmVudElkKTtcclxuICAgICAgICBjb25zdCBjYW5kaWRhdGVzVG9PZmZlciA9IGNhbmRpZGF0ZUlkcy5maWx0ZXIoaWQgPT4gIWFscmVhZHlMaW5rZWQuaGFzKFV0aWwuc2FuaXRpemVHdWlkKGlkKSkpO1xyXG4gICAgICAgIGlmIChjYW5kaWRhdGVzVG9PZmZlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJBbGwgY2FuZGlkYXRlIGFjY291bnRzIGFyZSBhbHJlYWR5IGxpbmtlZCB0byB0aGlzIHJlY29yZC5cIiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRJZHMgPSBhd2FpdCBvcGVuQ2FuZGlkYXRlUGlja2VyKGZjLCBjYW5kaWRhdGVzVG9PZmZlcik7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkSWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBhd2FpdCBhc3NvY2lhdGVTZWxlY3RlZFBvcnRmb2xpb3MoY3VycmVudElkLCBzZWxlY3RlZElkcyk7XHJcblxyXG4gICAgICAgIEdyaWRIZWxwZXIudHJ5UmVmcmVzaFN1YmdyaWQoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzKTtcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkVycm9yRGlhbG9nPy4oeyBtZXNzYWdlOiBlcnI/Lm1lc3NhZ2UgPz8gU3RyaW5nKGVycikgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cclxuLyogICAgICAgICAgIGhlbHBlciBmdW5jdGlvbnMgICAgICAgICAqL1xyXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXHJcblxyXG5hc3luYyBmdW5jdGlvbiB0b2dnbGVBY2NvdW50c1N1YmdyaWRGb3JPcmlnaW5UeXBlKGZjOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IGFjY291bnRPcGVuaW5nSWQgPSBhd2FpdCBnZXRBY2NvdW50T3BlbmluZ0lkKCk7XHJcbiAgICBpZiAoIWFjY291bnRPcGVuaW5nSWQpIHtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzLCBmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmTG9va3VwRXF1YWxzKFxyXG4gICAgICAgIGZjLFxyXG4gICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuZmllbGRzLmFtYmN1c3RPcmlnaW5UeXBlSWQsXHJcbiAgICAgICAgYWNjb3VudE9wZW5pbmdJZCxcclxuICAgICAgICBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmNvbnRyb2xzLnN1YmdyaWRBY2NvdW50c1xyXG4gICAgKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWNjb3VudE9wZW5pbmdJZCgpOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgIHJldHVybiBMb29rdXBTZXJ2aWNlLmdldElkQnlFcXVhbGl0eShcclxuICAgICAgICBPUklHSU5UWVBFLmVudGl0eSxcclxuICAgICAgICBPUklHSU5UWVBFLmZpZWxkcy5wayxcclxuICAgICAgICBPUklHSU5UWVBFLmZpZWxkcy50eXBlTmFtZUNvZGUsXHJcbiAgICAgICAgT1JJR0lOVFlQRS52YWx1ZXMuQUNDT1VOVF9PUEVOSU5HXHJcbiAgICApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBmZXRjaENhbmRpZGF0ZVBvcnRmb2xpb0lkcyhjb250YWN0SWQ/OiBzdHJpbmcsIGNvbXBhbnlJZD86IHN0cmluZyk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgIGNvbnN0IG9yQmxvY2sgPSBbXHJcbiAgICAgICAgY29udGFjdElkXHJcbiAgICAgICAgICAgID8gYDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLmNvbnRhY3RJZH1cIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke1V0aWwuc2FuaXRpemVHdWlkKGNvbnRhY3RJZCl9XCIgLz5gXHJcbiAgICAgICAgICAgIDogXCJcIixcclxuICAgICAgICBjb21wYW55SWRcclxuICAgICAgICAgICAgPyBgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMuY29tcGFueUlkfVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7VXRpbC5zYW5pdGl6ZUd1aWQoY29tcGFueUlkKX1cIiAvPmBcclxuICAgICAgICAgICAgOiBcIlwiLFxyXG4gICAgXVxyXG4gICAgICAgIC5maWx0ZXIoQm9vbGVhbilcclxuICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgIDxmZXRjaCB2ZXJzaW9uPVwiMS4wXCIgZGlzdGluY3Q9XCJ0cnVlXCI+XHJcbiAgICAgIDxlbnRpdHkgbmFtZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmVudGl0eX1cIj5cclxuICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMucG9ydGZvbGlvSWR9XCIgLz5cclxuICAgICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICAgIDxmaWx0ZXIgdHlwZT1cIm9yXCI+XHJcbiAgICAgICAgICAgICR7b3JCbG9ja31cclxuICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLmVudGl0eX1cIlxyXG4gICAgICAgICAgICAgICAgICAgICBmcm9tPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLmZpZWxkcy5wa31cIlxyXG4gICAgICAgICAgICAgICAgICAgICB0bz1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy50eXBlSWR9XCIgYWxpYXM9XCJyZWx0eXBlXCI+XHJcbiAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQVFlQRS5maWVsZHMubmFtZX1cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIG9wZXJhdG9yPVwiZXFcIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHZhbHVlPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLm9wdGlvbnMuTkFNRV9QUklOQ0lQQUx9XCIgLz5cclxuICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgIDwvZW50aXR5PlxyXG4gICAgPC9mZXRjaD5gLnRyaW0oKTtcclxuXHJcbiAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQuZmV0Y2hYbWwoUE9SVEZPTElPUkVMQVRJT05TSElQLmVudGl0eSwgZmV0Y2hYbWwpO1xyXG4gICAgY29uc3QgaWRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IGUgb2YgcmVzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPVxyXG4gICAgICAgICAgICBVdGlsLnNhbml0aXplR3VpZCgoZSBhcyBhbnkpW2BfJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLnBvcnRmb2xpb0lkfV92YWx1ZWBdKSB8fFxyXG4gICAgICAgICAgICBVdGlsLnNhbml0aXplR3VpZCgoZSBhcyBhbnkpW1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMucG9ydGZvbGlvSWRdKTtcclxuICAgICAgICBpZiAoaWQpIGlkcy5hZGQoaWQpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oaWRzKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZ2V0QWxyZWFkeUxpbmtlZFBvcnRmb2xpb0lkcyhtYWluSWQ6IHN0cmluZyk6IFByb21pc2U8U2V0PHN0cmluZz4+IHtcclxuICAgIGNvbnN0IGV4cGFuZCA9IGA/JGV4cGFuZD0ke1JJU0tTVU1NQVJZQU5EQVBQUk9WQUwucmVsYXRpb25zaGlwcy5wb3J0Zm9saW9zLm5hdn0oJHNlbGVjdD0ke1BPUlRGT0xJTy5maWVsZHMucGt9KWA7XHJcbiAgICBjb25zdCByZWMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoUklTS1NVTU1BUllBTkRBUFBST1ZBTC5lbnRpdHksIG1haW5JZCwgZXhwYW5kKTtcclxuICAgIGNvbnN0IGxpc3QgPSAocmVjPy5bUklTS1NVTU1BUllBTkRBUFBST1ZBTC5yZWxhdGlvbnNoaXBzLnBvcnRmb2xpb3MubmF2XSB8fCBbXSkgYXMgQXJyYXk8YW55PjtcclxuICAgIHJldHVybiBuZXcgU2V0PHN0cmluZz4obGlzdC5tYXAocm93ID0+IFV0aWwuc2FuaXRpemVHdWlkKHJvd1tQT1JURk9MSU8uZmllbGRzLnBrXSkpKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gb3BlbkNhbmRpZGF0ZVBpY2tlcihmYzogYW55LCBjYW5kaWRhdGVJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgZmM/LnVpPy5zZXRGb3JtTm90aWZpY2F0aW9uPy4oXHJcbiAgICAgICAgXCJTaG93aW5nIGFjY291bnRzIHRoYXQgbWF0Y2ggdGhlIHNlbGVjdGVkIENvbnRhY3QvQ29tcGFueS4gQWxyZWFkeSBsaW5rZWQgaXRlbXMgYXJlIGhpZGRlbi5cIixcclxuICAgICAgICBcIklORk9cIixcclxuICAgICAgICBcImFjY291bnQtZmlsdGVyLWNvbnRleHRcIlxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzZWxlY3Rpb24gPSBhd2FpdCBMb29rdXBEaWFsb2dIZWxwZXIub3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgUE9SVEZPTElPLmVudGl0eSxcclxuICAgICAgICBQT1JURk9MSU8uZmllbGRzLnBrLFxyXG4gICAgICAgIGNhbmRpZGF0ZUlkcyxcclxuICAgICAgICB7IGFsbG93TXVsdGlTZWxlY3Q6IHRydWUsIGRpc2FibGVNcnU6IHRydWUgfVxyXG4gICAgKTtcclxuXHJcbiAgICBmYz8udWk/LmNsZWFyRm9ybU5vdGlmaWNhdGlvbj8uKFwiYWNjb3VudC1maWx0ZXItY29udGV4dFwiKTtcclxuXHJcbiAgICBpZiAoIXNlbGVjdGlvbiB8fCBzZWxlY3Rpb24ubGVuZ3RoID09PSAwKSByZXR1cm4gW107XHJcbiAgICByZXR1cm4gVXRpbC51bmlxdWUoc2VsZWN0aW9uLm1hcChzID0+IFV0aWwuc2FuaXRpemVHdWlkKHMuaWQpKSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFzc29jaWF0ZVNlbGVjdGVkUG9ydGZvbGlvcyhtYWluSWQ6IHN0cmluZywgc2VsZWN0ZWRJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXNlbGVjdGVkSWRzLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgYXdhaXQgQXBpQ2xpZW50LmFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5lbnRpdHksXHJcbiAgICAgICAgbWFpbklkLFxyXG4gICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwucmVsYXRpb25zaGlwcy5wb3J0Zm9saW9zLnNjaGVtYSxcclxuICAgICAgICBQT1JURk9MSU8uZW50aXR5LFxyXG4gICAgICAgIHNlbGVjdGVkSWRzXHJcbiAgICApO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==