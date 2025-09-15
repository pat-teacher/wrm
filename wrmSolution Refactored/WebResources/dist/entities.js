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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW50aXRpZXMuanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7QUFBTyxNQUFNLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUUsU0FBUztJQUNqQixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsV0FBVztRQUNmLGtCQUFrQixFQUFFLG9CQUFvQjtLQUMzQztDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTlgscUNBQXFDO0FBQ3JDLDZFQUE2RTtBQUV0RSxNQUFNLG9CQUFvQixHQUFHO0lBQ2hDLE1BQU0sRUFBRSxrQkFBa0I7SUFDMUIsTUFBTSxFQUFFO1FBQ0osRUFBRSxFQUFFLG9CQUFvQjtRQUN4QixtQkFBbUIsRUFBRSw0QkFBNEI7S0FDcEQ7Q0FDSyxDQUFDO0FBZ0NKLFNBQVMsdUJBQXVCLENBQUMsUUFBdUI7SUFDM0QsSUFBSSxDQUFDLFFBQVE7UUFBRSxPQUFPLElBQUksQ0FBQztJQUMzQixJQUFJLENBQUM7UUFDRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBdUIsQ0FBQztRQUMxRCxJQUFJLENBQUMsTUFBTSxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDM0UsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNMLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7QUFDTCxDQUFDO0FBRUQsOEZBQThGO0FBQ3ZGLFNBQVMsbUJBQW1CLENBQUMsWUFBMkI7O0lBQzNELElBQUksQ0FBQyxtQkFBWSxhQUFaLFlBQVksdUJBQVosWUFBWSxDQUFFLEtBQUssMENBQUUsTUFBTTtRQUFFLE9BQU8sRUFBRSxDQUFDO0lBQzVDLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQUMsUUFBQyxVQUFJLENBQUMsU0FBUyxtQ0FBSSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUMsQ0FBQztJQUM1RixPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztBQUN2QyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUN6REQsdUJBQXVCO0FBQ2hCLE1BQU0sVUFBVSxHQUFHO0lBQ3RCLE1BQU0sRUFBRSxvQkFBb0I7SUFDNUIsTUFBTSxFQUFFO1FBQ0osRUFBRSxFQUFFLHNCQUFzQjtRQUMxQixZQUFZLEVBQUUscUJBQXFCO0tBQ3RDO0lBQ0QsTUFBTSxFQUFFO1FBQ0osZUFBZSxFQUFFLGlCQUFpQjtLQUNyQztDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ1ZYLHNCQUFzQjtBQUNmLE1BQU0sU0FBUyxHQUFHO0lBQ3JCLE1BQU0sRUFBRSxnQkFBZ0I7SUFDeEIsTUFBTSxFQUFFO1FBQ0osRUFBRSxFQUFFLGtCQUFrQjtLQUN6QjtDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ05YLGtDQUFrQztBQUMzQixNQUFNLHFCQUFxQixHQUFHO0lBQ2pDLE1BQU0sRUFBRSw0QkFBNEI7SUFDcEMsTUFBTSxFQUFFO1FBQ0osV0FBVyxFQUFFLGtCQUFrQjtRQUMvQixTQUFTLEVBQUUsZ0JBQWdCO1FBQzNCLFNBQVMsRUFBRSxnQkFBZ0I7UUFDM0IsTUFBTSxFQUFFLGtDQUFrQztLQUM3QztDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ1RYLHNDQUFzQztBQUMvQixNQUFNLHlCQUF5QixHQUFHO0lBQ3JDLE1BQU0sRUFBRSxnQ0FBZ0M7SUFDeEMsTUFBTSxFQUFFO1FBQ0osRUFBRSxFQUFFLGtDQUFrQztRQUN0QyxJQUFJLEVBQUUsV0FBVztLQUNwQjtJQUNELE9BQU8sRUFBRTtRQUNMLGNBQWMsRUFBRSxXQUFXO0tBQzlCO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDVlgsbUNBQW1DO0FBQzVCLE1BQU0sc0JBQXNCLEdBQUc7SUFDbEMsTUFBTSxFQUFFLDZCQUE2QjtJQUNyQyxNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsK0JBQStCO1FBQ25DLFNBQVMsRUFBRSxnQkFBZ0I7UUFDM0IsU0FBUyxFQUFFLGdCQUFnQjtRQUMzQixtQkFBbUIsRUFBRSxzQkFBc0I7S0FDOUM7SUFDRCxRQUFRLEVBQUU7UUFDTixlQUFlLEVBQUUsc0JBQXNCO0tBQzFDO0lBQ0QsYUFBYSxFQUFFO1FBQ1gsVUFBVSxFQUFFO1lBQ1IsTUFBTSxFQUFFLHlDQUF5QztZQUNqRCxHQUFHLEVBQUUseUNBQXlDO1NBQ2pEO0tBQ0o7SUFDRCxJQUFJLEVBQUU7UUFDRixJQUFJLEVBQUUsVUFBVTtRQUNoQixNQUFNLEVBQUUsWUFBWTtLQUN2QjtJQUNELFFBQVEsRUFBRTtRQUNOLFFBQVEsRUFBRSxjQUFjO0tBQzNCO0lBQ0QsT0FBTyxFQUFFO0lBQ0wsdUNBQXVDO0tBQzFDO0NBQ0ssQ0FBQzs7Ozs7OztVQzVCWDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTkEsNENBQTRDO0FBQ0k7QUFDYjtBQUNZO0FBQ0k7QUFDZjtBQUNLO0FBQ1IiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db250YWN0LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9NYW5kYXRvcnlDb25maWcuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL09yaWdpblR5cGUuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1BvcnRmb2xpby5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9SaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9pbmRleC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgQ09OVEFDVCA9IHtcclxuICAgIGVudGl0eTogXCJjb250YWN0XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJjb250YWN0aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0aWQ6IFwibmV2X2J1c2luZXNzdW5pdGlkXCIsXHJcbiAgICB9XHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIGVudGl0aWVzL01hbmRhdG9yeUNvbmZpZy5lbnRpdHkudHNcclxuLy8gWmVudHJhbGUgRGVmaW5pdGlvbiBkZXMgQnVzaW5lc3MtVW5pdC1KU09OLUZlbGRzLCBEb23vv71uZW50eXBlbiB1bmQgUGFyc2VyLlxyXG5cclxuZXhwb3J0IGNvbnN0IEJVU0lORVNTVU5JVExPQ0FUSU9OID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3RfbG9jYXRpb25cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgICAgIG1hbmRhdG9yeUNvbmZpZ0pzb246IFwibWh3cm1iX21hbmRhdG9yeWNvbmZpZ2pzb25cIlxyXG4gICAgfVxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgT3BlcmF0b3IgPSBcImVxXCIgfCBcIm5lXCIgfCBcImluXCIgfCBcImlzbnVsbFwiIHwgXCJpc25vdG51bGxcIjtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcclxuICAgIGZpZWxkOiBzdHJpbmc7ICAgICAgICAgICAvLyBsb2dpY2FsIG5hbWUgKHouIEIuIFwiY3VzdG9tZXJ0eXBlY29kZVwiLCBcInByaW1hcnljb250YWN0aWRcIilcclxuICAgIG9wZXJhdG9yOiBPcGVyYXRvcjtcclxuICAgIC8qKlxyXG4gICAgICogRXJ3YXJ0ZXRlciBXZXJ0OlxyXG4gICAgICogLSBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuIHwgbnVsbFxyXG4gICAgICogLSBHVUlEICh6LiBCLiBcImExYjJjM2Q0LTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMFwiKVxyXG4gICAgICogLSBBcnJheSBm77+9ciBcImluXCI6IChzdHJpbmdbXSB8IG51bWJlcltdIHwgR1VJRFtdKVxyXG4gICAgICovXHJcbiAgICB2YWx1ZT86IGFueTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSdWxlIHtcclxuICAgIG5hbWU6IHN0cmluZztcclxuICAgIG1hbmRhdG9yeTogc3RyaW5nW107ICAgICAvLyBsb2dpY2FsIG5hbWVzIGRlciBGZWxkZXIsIGRpZSByZXF1aXJlZCB3ZXJkZW5cclxuICAgIGNvbmRpdGlvbj86IENvbmRpdGlvbltdOyAvLyBVTkQtdmVya27vv71wZnQ7IGxlZXIvdW5kZWZpbmVkID8gZ2lsdCBpbW1lclxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNvbmZpZyB7XHJcbiAgICBkZWZhdWx0OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlQnVzaW5lc3NVbml0Q29uZmlnKGpzb25UZXh0OiBzdHJpbmcgfCBudWxsKTogQnVzaW5lc3NVbml0Q29uZmlnIHwgbnVsbCB7XHJcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm4gbnVsbDtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uVGV4dCkgYXMgQnVzaW5lc3NVbml0Q29uZmlnO1xyXG4gICAgICAgIGlmICghcGFyc2VkIHx8IHR5cGVvZiBwYXJzZWQgIT09IFwib2JqZWN0XCIgfHwgIXBhcnNlZC5lbnRpdGllcykgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogTGllZmVydCBhbGxlIEF0dHJpYnV0bmFtZW4sIGRpZSBpbiBDb25kaXRpb25zIHZvcmtvbW1lbiAoZu+/vXIgb3B0aW9uYWxlcyBBdXRvLU9uQ2hhbmdlKS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RDb25kaXRpb25GaWVsZHMoZW50aXR5Q29uZmlnPzogRW50aXR5Q29uZmlnKTogc3RyaW5nW10ge1xyXG4gICAgaWYgKCFlbnRpdHlDb25maWc/LnJ1bGVzPy5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IGZpZWxkcyA9IGVudGl0eUNvbmZpZy5ydWxlcy5mbGF0TWFwKHJ1bGUgPT4gKHJ1bGUuY29uZGl0aW9uID8/IFtdKS5tYXAoYyA9PiBjLmZpZWxkKSk7XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGZpZWxkcykpO1xyXG59XHJcbiIsIi8vIE9yaWdpblR5cGUuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBPUklHSU5UWVBFID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3Rfb3JpZ2ludHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIixcclxuICAgICAgICB0eXBlTmFtZUNvZGU6IFwibWh3cm1iX3R5cGVuYW1lY29kZVwiLFxyXG4gICAgfSxcclxuICAgIHZhbHVlczoge1xyXG4gICAgICAgIEFDQ09VTlRfT1BFTklORzogXCJBQ0NPVU5UX09QRU5JTkdcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpby5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJTyA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb1wiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwb3J0Zm9saW9JZDogXCJ3cm1iX3BvcnRmb2xpb2lkXCIsXHJcbiAgICAgICAgY29udGFjdElkOiBcIndybWJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueUlkOiBcIndybWJfY29tcGFueWlkXCIsXHJcbiAgICAgICAgdHlwZUlkOiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBQb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCIsXHJcbiAgICAgICAgbmFtZTogXCJ3cm1iX25hbWVcIixcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgTkFNRV9QUklOQ0lQQUw6IFwiUHJpbmNpcGFsXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBSaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUklTS1NVTU1BUllBTkRBUFBST1ZBTCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybXJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbGlkXCIsXHJcbiAgICAgICAgY29udGFjdElkOiBcIndybXJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueUlkOiBcIndybXJfY29tcGFueWlkXCIsXHJcbiAgICAgICAgYW1iY3VzdE9yaWdpblR5cGVJZDogXCJhbWJjdXN0X29yaWdpbnR5cGVpZFwiXHJcbiAgICB9LFxyXG4gICAgY29udHJvbHM6IHtcclxuICAgICAgICBzdWJncmlkQWNjb3VudHM6IFwid3JtX3N1YmdyaWRfYWNjb3VudHNcIixcclxuICAgIH0sXHJcbiAgICByZWxhdGlvbnNoaXBzOiB7XHJcbiAgICAgICAgcG9ydGZvbGlvczoge1xyXG4gICAgICAgICAgICBzY2hlbWE6IFwibWh3cm1iX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWwycG9ydGZvbGlvXCIsXHJcbiAgICAgICAgICAgIG5hdjogXCJtaHdybWJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbDJwb3J0Zm9saW9cIixcclxuICAgICAgICB9LFxyXG4gICAgfSxcclxuICAgIHRhYnM6IHtcclxuICAgICAgICBNQUlOOiBcIlRBQl9NQUlOXCIsXHJcbiAgICAgICAgUkVWSUVXOiBcIlRBQl9SRVZJRVdcIixcclxuICAgIH0sXHJcbiAgICBzZWN0aW9uczoge1xyXG4gICAgICAgIEFQUFJPVkFMOiBcIlNFQ19BUFBST1ZBTFwiLFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHtcclxuICAgICAgICAvLyBCZWlzcGllbDogU1RBVFVTX0FQUFJPVkVEOiAxMDAwMDAwMDFcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gQmFycmVsIGZpbGUg77+9IGLvv71uZGVsdCBhbGxlIEVudGl0eS1PYmpla3RlXHJcbmV4cG9ydCAqIGZyb20gXCIuL1Jpc2tTdW1tYXJ5QW5kQXBwcm92YWwuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BvcnRmb2xpby5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9PcmlnaW5UeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9NYW5kYXRvcnlDb25maWcuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NvbnRhY3QuZW50aXR5XCI7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==