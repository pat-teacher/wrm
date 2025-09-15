/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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








})();

(window.WRM = window.WRM || {}).entities = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Q29udGFjdC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9PcmlnaW5UeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW8uZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1BvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvaW5kZXgudHMiXSwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJpbXBvcnQgdHlwZSB7IEJ1c2luZXNzVW5pdENvbmZpZywgRW50aXR5Q29uZmlnIH0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBCVVNJTkVTU1VOSVRMT0NBVElPTiA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X2xvY2F0aW9uXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgICAgICBtYW5kYXRvcnlDb25maWdKc29uOiBcIm1od3JtYl9tYW5kYXRvcnljb25maWdqc29uXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqIFNhZmUgcGFyc2U7IHJldHVybnMgbnVsbCBpZiBpbnZhbGlkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdXNpbmVzc1VuaXRDb25maWcoanNvblRleHQ6IHN0cmluZyB8IG51bGwpOiBCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsIHtcclxuICAgIGlmICghanNvblRleHQpIHJldHVybiBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyBCdXNpbmVzc1VuaXRDb25maWc7XHJcbiAgICAgICAgaWYgKCFwYXJzZWQgfHwgdHlwZW9mIHBhcnNlZCAhPT0gXCJvYmplY3RcIiB8fCAhcGFyc2VkLmVudGl0aWVzKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gcGFyc2VkO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBDb2xsZWN0IGJhc2UgYXR0cmlidXRlIG5hbWVzIHVzZWQgaW4gY29uZGl0aW9ucyAoZm9yIGF1dG8gT25DaGFuZ2Ugd2lyaW5nKS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RDb25kaXRpb25GaWVsZHMoZW50aXR5Q29uZmlnPzogRW50aXR5Q29uZmlnKTogc3RyaW5nW10ge1xyXG4gICAgaWYgKCFlbnRpdHlDb25maWc/LnJ1bGVzPy5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IGZpZWxkcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgZm9yIChjb25zdCByIG9mIGVudGl0eUNvbmZpZy5ydWxlcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgYyBvZiByLmNvbmRpdGlvbiA/PyBbXSkge1xyXG4gICAgICAgICAgICBpZiAoIWMuZmllbGQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBiaW5kIG9uIHRoZSBiYXNlIGF0dHJpYnV0ZSAoYmVmb3JlIHByb2plY3Rpb24gbGlrZSAubmFtZSlcclxuICAgICAgICAgICAgZmllbGRzLmFkZChjLmZpZWxkLnNwbGl0KFwiLlwiLCAxKVswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oZmllbGRzKTtcclxufSIsIi8vIE9yaWdpblR5cGUuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBPUklHSU5UWVBFID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3Rfb3JpZ2ludHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIixcclxuICAgICAgICB0eXBlTmFtZUNvZGU6IFwibWh3cm1iX3R5cGVuYW1lY29kZVwiLFxyXG4gICAgfSxcclxuICAgIHZhbHVlczoge1xyXG4gICAgICAgIEFDQ09VTlRfT1BFTklORzogXCJBQ0NPVU5UX09QRU5JTkdcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpby5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJTyA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb1wiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwb3J0Zm9saW9JZDogXCJ3cm1iX3BvcnRmb2xpb2lkXCIsXHJcbiAgICAgICAgY29udGFjdElkOiBcIndybWJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueUlkOiBcIndybWJfY29tcGFueWlkXCIsXHJcbiAgICAgICAgdHlwZUlkOiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBQb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCIsXHJcbiAgICAgICAgbmFtZTogXCJ3cm1iX25hbWVcIixcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgTkFNRV9QUklOQ0lQQUw6IFwiUHJpbmNpcGFsXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBSaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUklTS1NVTU1BUllBTkRBUFBST1ZBTCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybXJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbGlkXCIsXHJcbiAgICAgICAgY29udGFjdElkOiBcIndybXJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueUlkOiBcIndybXJfY29tcGFueWlkXCIsXHJcbiAgICAgICAgYW1iY3VzdE9yaWdpblR5cGVJZDogXCJhbWJjdXN0X29yaWdpbnR5cGVpZFwiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbHM6IHtcclxuICAgICAgICBzdWJncmlkQWNjb3VudHM6IFwid3JtX3N1YmdyaWRfYWNjb3VudHNcIixcclxuICAgIH0sXHJcbiAgICByZWxhdGlvbnNoaXBzOiB7XHJcbiAgICAgICAgcG9ydGZvbGlvczoge1xyXG4gICAgICAgICAgICBzY2hlbWE6IFwibWh3cm1iX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWwycG9ydGZvbGlvXCIsXHJcbiAgICAgICAgICAgIG5hdjogXCJtaHdybWJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbDJwb3J0Zm9saW9cIixcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHRhYnM6IHtcclxuICAgICAgICBNQUlOOiBcIlRBQl9NQUlOXCIsXHJcbiAgICAgICAgUkVWSUVXOiBcIlRBQl9SRVZJRVdcIixcclxuICAgIH0sXHJcbiAgICBzZWN0aW9uczoge1xyXG4gICAgICAgIEFQUFJPVkFMOiBcIlNFQ19BUFBST1ZBTFwiLFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAvLyBCZWlzcGllbDogU1RBVFVTX0FQUFJPVkVEOiAxMDAwMDAwMDFcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gQmFycmVsIGZpbGUg77+9IGLvv71uZGVsdCBhbGxlIEVudGl0eS1PYmpla3RlXHJcbmV4cG9ydCAqIGZyb20gXCIuL1Jpc2tTdW1tYXJ5QW5kQXBwcm92YWwuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BvcnRmb2xpby5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9PcmlnaW5UeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9NYW5kYXRvcnlDb25maWcuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NvbnRhY3QuZW50aXR5XCI7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==