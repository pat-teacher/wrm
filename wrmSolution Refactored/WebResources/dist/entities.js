/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
        ambcustOriginTypeId: "ambcust_origintypeid",
        statecode: "statecode"
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
/*!********************************************!*\
  !*** ./WebResources/src/entities/index.ts ***!
  \********************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACCOUNT: () => (/* reexport safe */ _Account_entity__WEBPACK_IMPORTED_MODULE_1__.ACCOUNT),
/* harmony export */   BUSINESSUNITLOCATION: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.BUSINESSUNITLOCATION),
/* harmony export */   CONTACT: () => (/* reexport safe */ _Contact_entity__WEBPACK_IMPORTED_MODULE_6__.CONTACT),
/* harmony export */   ORIGINTYPE: () => (/* reexport safe */ _OriginType_entity__WEBPACK_IMPORTED_MODULE_4__.ORIGINTYPE),
/* harmony export */   PORTFOLIORELATIONSHIP: () => (/* reexport safe */ _PortfolioRelationship_entity__WEBPACK_IMPORTED_MODULE_2__.PORTFOLIORELATIONSHIP),
/* harmony export */   PORTFOLIORELATIONSHIPTYPE: () => (/* reexport safe */ _PortfolioRelationshipType_entity__WEBPACK_IMPORTED_MODULE_3__.PORTFOLIORELATIONSHIPTYPE),
/* harmony export */   RISKSUMMARYANDAPPROVAL: () => (/* reexport safe */ _RiskSummaryAndApproval_entity__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL),
/* harmony export */   listConditionFields: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.listConditionFields),
/* harmony export */   parseBusinessUnitConfig: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.parseBusinessUnitConfig)
/* harmony export */ });
/* harmony import */ var _RiskSummaryAndApproval_entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RiskSummaryAndApproval.entity */ "./WebResources/src/entities/RiskSummaryAndApproval.entity.ts");
/* harmony import */ var _Account_entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Account.entity */ "./WebResources/src/entities/Account.entity.ts");
/* harmony import */ var _PortfolioRelationship_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PortfolioRelationship.entity */ "./WebResources/src/entities/PortfolioRelationship.entity.ts");
/* harmony import */ var _PortfolioRelationshipType_entity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PortfolioRelationshipType.entity */ "./WebResources/src/entities/PortfolioRelationshipType.entity.ts");
/* harmony import */ var _OriginType_entity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./OriginType.entity */ "./WebResources/src/entities/OriginType.entity.ts");
/* harmony import */ var _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MandatoryConfig.entity */ "./WebResources/src/entities/MandatoryConfig.entity.ts");
/* harmony import */ var _Contact_entity__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Contact.entity */ "./WebResources/src/entities/Contact.entity.ts");
// Barrel file � b�ndelt alle Entity-Objekte








})();

(window.WRM = window.WRM || {}).entities = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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STtBQUNmO0FBQ0s7QUFDUiIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0FjY291bnQuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL01hbmRhdG9yeUNvbmZpZy5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvT3JpZ2luVHlwZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9SaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0Zm9saW8uZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBBQ0NPVU5UID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb2lkXCIsXHJcbiAgICAgICAgYW1iY3VzdF9sb2NhdGlvbmlkOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJpbXBvcnQgdHlwZSB7IEJ1c2luZXNzVW5pdENvbmZpZywgRW50aXR5Q29uZmlnIH0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBCVVNJTkVTU1VOSVRMT0NBVElPTiA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X2xvY2F0aW9uXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgICAgICBtYW5kYXRvcnlDb25maWdKc29uOiBcIm1od3JtYl9tYW5kYXRvcnljb25maWdqc29uXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqIFNhZmUgcGFyc2U7IHJldHVybnMgbnVsbCBpZiBpbnZhbGlkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdXNpbmVzc1VuaXRDb25maWcoanNvblRleHQ6IHN0cmluZyB8IG51bGwpOiBCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsIHtcclxuICAgIGlmICghanNvblRleHQpIHJldHVybiBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyBCdXNpbmVzc1VuaXRDb25maWc7XHJcbiAgICAgICAgaWYgKCFwYXJzZWQgfHwgdHlwZW9mIHBhcnNlZCAhPT0gXCJvYmplY3RcIiB8fCAhcGFyc2VkLmVudGl0aWVzKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gcGFyc2VkO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBDb2xsZWN0IGJhc2UgYXR0cmlidXRlIG5hbWVzIHVzZWQgaW4gY29uZGl0aW9ucyAoZm9yIGF1dG8gT25DaGFuZ2Ugd2lyaW5nKS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RDb25kaXRpb25GaWVsZHMoZW50aXR5Q29uZmlnPzogRW50aXR5Q29uZmlnKTogc3RyaW5nW10ge1xyXG4gICAgaWYgKCFlbnRpdHlDb25maWc/LnJ1bGVzPy5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IGZpZWxkcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgZm9yIChjb25zdCByIG9mIGVudGl0eUNvbmZpZy5ydWxlcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgYyBvZiByLmNvbmRpdGlvbiA/PyBbXSkge1xyXG4gICAgICAgICAgICBpZiAoIWMuZmllbGQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBiaW5kIG9uIHRoZSBiYXNlIGF0dHJpYnV0ZSAoYmVmb3JlIHByb2plY3Rpb24gbGlrZSAubmFtZSlcclxuICAgICAgICAgICAgZmllbGRzLmFkZChjLmZpZWxkLnNwbGl0KFwiLlwiLCAxKVswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oZmllbGRzKTtcclxufSIsIi8vIE9yaWdpblR5cGUuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBPUklHSU5UWVBFID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3Rfb3JpZ2ludHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIixcclxuICAgICAgICB0eXBlTmFtZUNvZGU6IFwibWh3cm1iX3R5cGVuYW1lY29kZVwiLFxyXG4gICAgfSxcclxuICAgIHZhbHVlczoge1xyXG4gICAgICAgIEFDQ09VTlRfT1BFTklORzogXCJBQ0NPVU5UX09QRU5JTkdcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcG9ydGZvbGlvSWQ6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1iX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1iX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIHR5cGVJZDogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgICAgIG5hbWU6IFwid3JtYl9uYW1lXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIE5BTUVfUFJJTkNJUEFMOiBcIlByaW5jaXBhbFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwgPSB7XHJcbiAgICBlbnRpdHk6IFwid3Jtcl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxpZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1yX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1yX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIGFtYmN1c3RPcmlnaW5UeXBlSWQ6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIixcclxuICAgICAgICBzdGF0ZWNvZGU6IFwic3RhdGVjb2RlXCJcclxuICAgIH0sXHJcbiAgICBjb250cm9sczoge1xyXG4gICAgICAgIHN1YmdyaWRBY2NvdW50czogXCJ3cm1fc3ViZ3JpZF9hY2NvdW50c1wiLFxyXG4gICAgfSxcclxuICAgIHJlbGF0aW9uc2hpcHM6IHtcclxuICAgICAgICBwb3J0Zm9saW9zOiB7XHJcbiAgICAgICAgICAgIHNjaGVtYTogXCJtaHdybWJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbDJwb3J0Zm9saW9cIixcclxuICAgICAgICAgICAgbmF2OiBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGFiczoge1xyXG4gICAgICAgIE1BSU46IFwiVEFCX01BSU5cIixcclxuICAgICAgICBSRVZJRVc6IFwiVEFCX1JFVklFV1wiLFxyXG4gICAgfSxcclxuICAgIHNlY3Rpb25zOiB7XHJcbiAgICAgICAgQVBQUk9WQUw6IFwiU0VDX0FQUFJPVkFMXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIC8vIEJlaXNwaWVsOiBTVEFUVVNfQVBQUk9WRUQ6IDEwMDAwMDAwMVxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIvLyBCYXJyZWwgZmlsZSDvv70gYu+/vW5kZWx0IGFsbGUgRW50aXR5LU9iamVrdGVcclxuZXhwb3J0ICogZnJvbSBcIi4vUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQWNjb3VudC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9PcmlnaW5UeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9NYW5kYXRvcnlDb25maWcuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NvbnRhY3QuZW50aXR5XCI7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==