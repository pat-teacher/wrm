/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __webpack_require__ = {};
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
/*!***************************************************************************!*\
  !*** ./WebResources/src/wrmr_risksummaryandapproval/kyc_approval.form.ts ***!
  \***************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Helpers: () => (/* binding */ Helpers),
/* harmony export */   addAllowedAccounts: () => (/* binding */ addAllowedAccounts),
/* harmony export */   onLoad: () => (/* binding */ onLoad)
/* harmony export */ });
// =====================
// REFACTORED: Classes & Helpers (no TS namespaces)
// =====================
// This file keeps the public handlers as exports (bundled by Webpack as globals),
// but organizes the logic into reusable classes for API, visibility, grid/lookup, and domain services.
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// =====================
// CONFIG (edit as needed)
// =====================
var RISKSUMMARYANDAPPROVAL_ENTITY = "wrmr_risksummaryandapproval";
var RISKSUMMARYANDAPPROVAL_ENTITY_PK = "wrmr_risksummaryandapprovalid"; // primary key logical name
var RISKSUMMARYANDAPPROVAL_ENTITY_CONTACTID = "wrmr_contactid";
var RISKSUMMARYANDAPPROVAL_ENTITY_COMPANYID = "wrmr_companyid";
var PORTFOLIO_ENTITY = "wrmb_portfolio"; // logical name (Display: Account)
var PORTFOLIO_ENTITY_PK = "wrmb_portfolioid"; // primary key of portfolio
var PORTFOLIORELATIONSHIP_ENTITY = "wrmb_portfoliorelationship";
var PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID = "wrmb_portfolioid"; // in REL_TABLE → lookup to portfolio
var PORTFOLIORELATIONSHIP_ENTITY_CONTACTID = "wrmb_contactid";
var PORTFOLIORELATIONSHIP_ENTITY_COMPANYID = "wrmb_companyid";
var PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIORELATIONSHIPTYPEID = "wrmb_portfoliorelationshiptypeid";
var PORTFOLIORELATIONSHIPTYPE_ENTITY = "wrmb_portfoliorelationshiptype";
var PORTFOLIORELATIONSHIPTYPE_ENTITY_PK = "wrmb_portfoliorelationshiptypeid";
var PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME = "wrmb_name";
var PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME_PRINCIPAL = "Principal";
// N:N Beziehung
var RISKSUMMARYANDAPPROVAL_ENTITY_N2N_RELATIONSHIP_SCHEMA = "mhwrmb_risksummaryandapproval2portfolio"; // schema name for Associate
var RISKSUMMARYANDAPPROVAL_ENTITY_N2N_NAV_COLLECTION = "mhwrmb_risksummaryandapproval2portfolio"; // collection-valued nav. name for $expand
// optional: Subgrid im Formular, das nachher refreshed werden soll
var PORTFOLIO_ENTITY_SUBGRID_NAME = "wrm_subgrid_accounts";
var RISKSUMMARYANDAPPROVAL_ENTITY_AMBCUST_ORIGINTYPEID = "ambcust_origintypeid"; // Lookup-Feld auf MAIN_ENTITY
var ORIGINTYPE_ENTITY = "ambcust_origintype"; // singulärer logischer Name
var ORIGINTYPE_ENTITY_PK = "ambcust_origintypeid"; // Primärschlüssel der Zieltabelle
var ORIGINTYPE_ENTITY_TYPENAMECODE = "mhwrmb_typenamecode"; // Spalte, nach der gefiltert wird
var ORIGINTYPE_ENTITY_TYPENAMECODE_ACCOUNT_OPENING = "ACCOUNT_OPENING"; // Zielcode
// =====================
// CORE UTILS
// =====================
var Util = /** @class */ (function () {
    function Util() {
    }
    Object.defineProperty(Util, "X", {
        get: function () { return window.Xrm; },
        enumerable: false,
        configurable: true
    });
    Util.sanitizeGuid = function (id) {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    };
    Util.unique = function (arr) { return Array.from(new Set(arr)); };
    Util.ensureArray = function (v) {
        if (!v)
            return [];
        return Array.isArray(v) ? v : [v];
    };
    return Util;
}());
// =====================
// API CLIENT (WebApi wrapper)
// =====================
var ApiClient = /** @class */ (function () {
    function ApiClient() {
    }
    ApiClient.retrieveRecord = function (entityLogicalName, id, options) {
        return __awaiter(this, void 0, void 0, function () {
            var cleanId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cleanId = Util.sanitizeGuid(id);
                        return [4 /*yield*/, Util.X.WebApi.retrieveRecord(entityLogicalName, cleanId, options)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiClient.retrieveMultiple = function (entityLogicalName, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Util.X.WebApi.retrieveMultipleRecords(entityLogicalName, options)];
                    case 1: 
                    // options like: `?$select=...&$filter=...`  (no extra '?' before $filter!)
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiClient.fetchXml = function (entityLogicalName, fetchXml) {
        return __awaiter(this, void 0, void 0, function () {
            var url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        url = "?fetchXml=".concat(encodeURIComponent(fetchXml.trim()));
                        return [4 /*yield*/, Util.X.WebApi.retrieveMultipleRecords(entityLogicalName, url)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiClient.execute = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Util.X.WebApi.online.execute(request)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiClient.associateManyToMany = function (parentEntityLogical, parentId, relationshipSchemaName, relatedEntityLogical, relatedIds) {
        return __awaiter(this, void 0, void 0, function () {
            var req, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        req = {
                            target: { entityType: parentEntityLogical, id: Util.sanitizeGuid(parentId) },
                            relatedEntities: relatedIds.map(function (id) { return ({ entityType: relatedEntityLogical, id: Util.sanitizeGuid(id) }); }),
                            relationship: relationshipSchemaName,
                            getMetadata: function () {
                                return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" };
                            }
                        };
                        return [4 /*yield*/, ApiClient.execute(req)];
                    case 1:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Association failed: ".concat(response.status, " ").concat(response.statusText));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return ApiClient;
}());
// =====================
// FORM HELPERS
// =====================
var FormHelper = /** @class */ (function () {
    function FormHelper() {
    }
    FormHelper.getCurrentId = function (fc) {
        var _a, _b, _c;
        try {
            var idRaw = (_c = (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.data) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.getId) === null || _c === void 0 ? void 0 : _c.call(_b);
            return idRaw ? Util.sanitizeGuid(idRaw) : null;
        }
        catch (_d) {
            return null;
        }
    };
    FormHelper.getLookupId = function (fc, attribute) {
        var _a, _b, _c;
        var v = (_c = (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, attribute)) === null || _b === void 0 ? void 0 : _b.getValue) === null || _c === void 0 ? void 0 : _c.call(_b);
        return v && v.length ? Util.sanitizeGuid(v[0].id) : undefined;
    };
    return FormHelper;
}());
var GridHelper = /** @class */ (function () {
    function GridHelper() {
    }
    GridHelper.tryRefreshSubgrid = function (fc, name) {
        var _a, _b, _c;
        if (!name)
            return;
        var grid = (_a = fc === null || fc === void 0 ? void 0 : fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, name);
        if (grid === null || grid === void 0 ? void 0 : grid.refresh) {
            try {
                grid.refresh();
            }
            catch ( /* ignore */_d) { /* ignore */ }
        }
        else {
            try {
                (_c = (_b = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _b === void 0 ? void 0 : _b.refreshRibbon) === null || _c === void 0 ? void 0 : _c.call(_b);
            }
            catch ( /* ignore */_e) { /* ignore */ }
        }
    };
    return GridHelper;
}());
var VisibilityHelper = /** @class */ (function () {
    function VisibilityHelper() {
    }
    /** Set visibility for a single control (field, subgrid, section control). */
    VisibilityHelper.setVisible = function (fc, controlName, visible) {
        var _a;
        var ctrl = (_a = fc === null || fc === void 0 ? void 0 : fc.getControl) === null || _a === void 0 ? void 0 : _a.call(fc, controlName);
        if (ctrl === null || ctrl === void 0 ? void 0 : ctrl.setVisible) {
            try {
                ctrl.setVisible(visible);
            }
            catch ( /* ignore */_b) { /* ignore */ }
        }
    };
    /** Show/hide multiple controls. */
    VisibilityHelper.setMany = function (fc, controlNames, visible) {
        controlNames.forEach(function (n) { return VisibilityHelper.setVisible(fc, n, visible); });
    };
    /** Show a control when a predicate returns true, otherwise hide. */
    VisibilityHelper.showIf = function (fc, controlName, predicate) {
        var show = !!predicate();
        VisibilityHelper.setVisible(fc, controlName, show);
        return show;
    };
    /** Generic: compare a lookup attribute to a target GUID (case/brace-insensitive). */
    VisibilityHelper.showIfLookupEquals = function (fc, lookupAttr, targetId, controlName) {
        return VisibilityHelper.showIf(fc, controlName, function () {
            var current = FormHelper.getLookupId(fc, lookupAttr);
            return !!current && Util.sanitizeGuid(current) === Util.sanitizeGuid(targetId);
        });
    };
    return VisibilityHelper;
}());
var LookupDialogHelper = /** @class */ (function () {
    function LookupDialogHelper() {
    }
    /** Open lookup with an IN-filter on the id attribute, limiting to a given entity. */
    LookupDialogHelper.openWithIdList = function (entityLogical, idAttribute, ids, options) {
        return __awaiter(this, void 0, void 0, function () {
            var inValues, filterXml, lookupOptions;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        inValues = ids
                            .map(function (id) { return "<value uitype=\"".concat(entityLogical, "\">{").concat(Util.sanitizeGuid(id), "}</value>"); }) // keep {} inside value
                            .join("");
                        filterXml = "\n      <filter type=\"and\">\n        <condition attribute=\"".concat(idAttribute, "\" operator=\"in\">\n          ").concat(inValues, "\n        </condition>\n        <condition attribute=\"statecode\" operator=\"eq\" value=\"0\" />\n      </filter>").trim();
                        lookupOptions = {
                            allowMultiSelect: (_a = options === null || options === void 0 ? void 0 : options.allowMultiSelect) !== null && _a !== void 0 ? _a : true,
                            defaultEntityType: entityLogical,
                            entityTypes: [entityLogical],
                            filters: [{ entityLogicalName: entityLogical, filterXml: filterXml }],
                            disableMru: (_b = options === null || options === void 0 ? void 0 : options.disableMru) !== null && _b !== void 0 ? _b : true,
                        };
                        if (options === null || options === void 0 ? void 0 : options.defaultViewId)
                            lookupOptions.defaultViewId = options.defaultViewId;
                        return [4 /*yield*/, Util.X.Utility.lookupObjects(lookupOptions)];
                    case 1: return [2 /*return*/, _c.sent()];
                }
            });
        });
    };
    return LookupDialogHelper;
}());
// =====================
// DOMAIN SERVICES
// =====================
var OriginTypeService = /** @class */ (function () {
    function OriginTypeService() {
    }
    /** Get the ID of the OriginType record by code value (e.g., 'ACCOUNT_OPENING'). */
    OriginTypeService.getIdByCode = function (entityLogical, primaryIdAttr, codeAttr, codeValue) {
        return __awaiter(this, void 0, void 0, function () {
            var options, res, row, id;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        options = "?$select=".concat(primaryIdAttr, "&$filter=(").concat(codeAttr, " eq '").concat(codeValue, "')");
                        return [4 /*yield*/, ApiClient.retrieveMultiple(entityLogical, options)];
                    case 1:
                        res = _b.sent();
                        row = (_a = res === null || res === void 0 ? void 0 : res.entities) === null || _a === void 0 ? void 0 : _a[0];
                        id = row === null || row === void 0 ? void 0 : row[primaryIdAttr];
                        return [2 /*return*/, id ? Util.sanitizeGuid(id) : null];
                }
            });
        });
    };
    return OriginTypeService;
}());
var RelationshipService = /** @class */ (function () {
    function RelationshipService() {
    }
    /**
     * Collect candidate portfolio IDs from relationship table with optional filters for contact/company
     * and forced relationship type name == 'Principal'.
     */
    RelationshipService.getCandidatePortfolioIds = function (contactId, companyId) {
        return __awaiter(this, void 0, void 0, function () {
            var orBlock, fetchXml, res, set, _i, _a, e, id;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        orBlock = [
                            contactId ? "<condition attribute=\"".concat(PORTFOLIORELATIONSHIP_ENTITY_CONTACTID, "\" operator=\"eq\" value=\"").concat(Util.sanitizeGuid(contactId), "\" />") : "",
                            companyId ? "<condition attribute=\"".concat(PORTFOLIORELATIONSHIP_ENTITY_COMPANYID, "\" operator=\"eq\" value=\"").concat(Util.sanitizeGuid(companyId), "\" />") : "",
                        ].filter(Boolean).join("");
                        fetchXml = "\n      <fetch version=\"1.0\" distinct=\"true\">\n        <entity name=\"".concat(PORTFOLIORELATIONSHIP_ENTITY, "\">\n          <attribute name=\"").concat(PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID, "\" />\n          <filter type=\"and\">\n            <filter type=\"or\">\n              ").concat(orBlock, "\n            </filter>\n          </filter>\n          <link-entity name=\"").concat(PORTFOLIORELATIONSHIPTYPE_ENTITY, "\"\n                       from=\"").concat(PORTFOLIORELATIONSHIPTYPE_ENTITY_PK, "\"\n                       to=\"").concat(PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIORELATIONSHIPTYPEID, "\" alias=\"reltype\">\n            <filter>\n              <condition attribute=\"").concat(PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME, "\" operator=\"eq\" value=\"").concat(PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME_PRINCIPAL, "\" />\n            </filter>\n          </link-entity>\n        </entity>\n      </fetch>");
                        return [4 /*yield*/, ApiClient.fetchXml(PORTFOLIORELATIONSHIP_ENTITY, fetchXml)];
                    case 1:
                        res = _b.sent();
                        set = new Set();
                        for (_i = 0, _a = res.entities; _i < _a.length; _i++) {
                            e = _a[_i];
                            id = Util.sanitizeGuid(e["_".concat(PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID, "_value")] || e[PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID]);
                            if (id)
                                set.add(id);
                        }
                        return [2 /*return*/, Array.from(set)];
                }
            });
        });
    };
    return RelationshipService;
}());
var N2NService = /** @class */ (function () {
    function N2NService() {
    }
    N2NService.getAlreadyLinkedPortfolioIds = function (mainId) {
        return __awaiter(this, void 0, void 0, function () {
            var expand, rec, list, set, _i, list_1, row, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        expand = "?$expand=".concat(RISKSUMMARYANDAPPROVAL_ENTITY_N2N_NAV_COLLECTION, "($select=").concat(PORTFOLIO_ENTITY_PK, ")");
                        return [4 /*yield*/, ApiClient.retrieveRecord(RISKSUMMARYANDAPPROVAL_ENTITY, mainId, expand)];
                    case 1:
                        rec = _a.sent();
                        list = ((rec === null || rec === void 0 ? void 0 : rec[RISKSUMMARYANDAPPROVAL_ENTITY_N2N_NAV_COLLECTION]) || []);
                        set = new Set();
                        for (_i = 0, list_1 = list; _i < list_1.length; _i++) {
                            row = list_1[_i];
                            id = Util.sanitizeGuid(row[PORTFOLIO_ENTITY_PK]);
                            if (id)
                                set.add(id);
                        }
                        return [2 /*return*/, set];
                }
            });
        });
    };
    return N2NService;
}());
var ApprovalPortfolioFlow = /** @class */ (function () {
    function ApprovalPortfolioFlow() {
    }
    ApprovalPortfolioFlow.run = function (fc, mainId, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var X, candidateIds, alreadyLinked, candidatesToOffer, selection, selectedIds, e_1, msg;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        X = Util.X;
                        return [4 /*yield*/, RelationshipService.getCandidatePortfolioIds(ctx.contactId, ctx.companyId)];
                    case 1:
                        candidateIds = _e.sent();
                        if (!(candidateIds.length === 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, X.Navigation.openAlertDialog({ text: "No matching accounts found for the selected Contact/Company." })];
                    case 2:
                        _e.sent();
                        return [2 /*return*/];
                    case 3: return [4 /*yield*/, N2NService.getAlreadyLinkedPortfolioIds(mainId)];
                    case 4:
                        alreadyLinked = _e.sent();
                        candidatesToOffer = candidateIds.filter(function (id) { return !alreadyLinked.has(Util.sanitizeGuid(id)); });
                        if (!(candidatesToOffer.length === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, X.Navigation.openAlertDialog({ text: "All candidate accounts are already linked to this record." })];
                    case 5:
                        _e.sent();
                        return [2 /*return*/];
                    case 6:
                        // 3) Open picker (filtered to those candidates)
                        (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _a === void 0 ? void 0 : _a.setFormNotification) === null || _b === void 0 ? void 0 : _b.call(_a, "Showing accounts that match the selected Contact/Company. Already linked items are hidden.", "INFO", "account-filter-context");
                        return [4 /*yield*/, LookupDialogHelper.openWithIdList(PORTFOLIO_ENTITY, PORTFOLIO_ENTITY_PK, candidatesToOffer, { allowMultiSelect: true, disableMru: true })];
                    case 7:
                        selection = _e.sent();
                        (_d = (_c = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _c === void 0 ? void 0 : _c.clearFormNotification) === null || _d === void 0 ? void 0 : _d.call(_c, "account-filter-context");
                        if (!selection || selection.length === 0)
                            return [2 /*return*/];
                        selectedIds = Util.unique(selection.map(function (s) { return Util.sanitizeGuid(s.id); }));
                        if (selectedIds.length === 0)
                            return [2 /*return*/];
                        _e.label = 8;
                    case 8:
                        _e.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, ApiClient.associateManyToMany(RISKSUMMARYANDAPPROVAL_ENTITY, mainId, RISKSUMMARYANDAPPROVAL_ENTITY_N2N_RELATIONSHIP_SCHEMA, PORTFOLIO_ENTITY, selectedIds)];
                    case 9:
                        _e.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        e_1 = _e.sent();
                        msg = String((e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1);
                        // common duplicate case when concurrent (ignore)
                        if (!/already exists/i.test(msg))
                            throw e_1;
                        return [3 /*break*/, 11];
                    case 11:
                        // 5) Refresh grid
                        GridHelper.tryRefreshSubgrid(fc, PORTFOLIO_ENTITY_SUBGRID_NAME);
                        return [2 /*return*/];
                }
            });
        });
    };
    return ApprovalPortfolioFlow;
}());
// =====================
// PUBLIC HANDLERS (exported)
// =====================
function onLoad(executionContext) {
    return __awaiter(this, void 0, void 0, function () {
        var fc, accountOpeningId, e_2;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    fc = (_b = (_a = executionContext.getFormContext) === null || _a === void 0 ? void 0 : _a.call(executionContext)) !== null && _b !== void 0 ? _b : executionContext;
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, OriginTypeService.getIdByCode(ORIGINTYPE_ENTITY, ORIGINTYPE_ENTITY_PK, ORIGINTYPE_ENTITY_TYPENAMECODE, ORIGINTYPE_ENTITY_TYPENAMECODE_ACCOUNT_OPENING)];
                case 2:
                    accountOpeningId = _c.sent();
                    if (!accountOpeningId) {
                        VisibilityHelper.setVisible(fc, PORTFOLIO_ENTITY_SUBGRID_NAME, false);
                        return [2 /*return*/];
                    }
                    // 2) Compare current lookup and toggle subgrid
                    VisibilityHelper.showIfLookupEquals(fc, RISKSUMMARYANDAPPROVAL_ENTITY_AMBCUST_ORIGINTYPEID, accountOpeningId, PORTFOLIO_ENTITY_SUBGRID_NAME);
                    return [3 /*break*/, 4];
                case 3:
                    e_2 = _c.sent();
                    VisibilityHelper.setVisible(fc, PORTFOLIO_ENTITY_SUBGRID_NAME, false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function addAllowedAccounts(primaryControl) {
    return __awaiter(this, void 0, void 0, function () {
        var fc, X, currentId, contactId, companyId, err_1;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    fc = primaryControl;
                    X = Util.X;
                    currentId = FormHelper.getCurrentId(fc);
                    if (!!currentId) return [3 /*break*/, 2];
                    return [4 /*yield*/, X.Navigation.openAlertDialog({ text: "Please save the record first." })];
                case 1:
                    _d.sent();
                    return [2 /*return*/];
                case 2:
                    contactId = FormHelper.getLookupId(fc, RISKSUMMARYANDAPPROVAL_ENTITY_CONTACTID);
                    companyId = FormHelper.getLookupId(fc, RISKSUMMARYANDAPPROVAL_ENTITY_COMPANYID);
                    if (!(!contactId && !companyId)) return [3 /*break*/, 4];
                    return [4 /*yield*/, X.Navigation.openAlertDialog({ text: "Please set either a Contact or a Company first." })];
                case 3:
                    _d.sent();
                    return [2 /*return*/];
                case 4:
                    _d.trys.push([4, 6, , 8]);
                    return [4 /*yield*/, ApprovalPortfolioFlow.run(fc, currentId, { contactId: contactId, companyId: companyId })];
                case 5:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 6:
                    err_1 = _d.sent();
                    return [4 /*yield*/, ((_b = (_a = X.Navigation).openErrorDialog) === null || _b === void 0 ? void 0 : _b.call(_a, { message: (_c = err_1 === null || err_1 === void 0 ? void 0 : err_1.message) !== null && _c !== void 0 ? _c : String(err_1) }))];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
// =====================
// OPTIONAL: Export helpers if you want to reuse outside
// (Webpack can expose these if configured; otherwise keep local.)
// =====================
var Helpers = { Util: Util, FormHelper: FormHelper, VisibilityHelper: VisibilityHelper, GridHelper: GridHelper, ApiClient: ApiClient, LookupDialogHelper: LookupDialogHelper };

(window.WRM = window.WRM || {}).kyc_approval_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFHLEVBQUUsSUFBSSxRQUFFLFVBQVUsY0FBRSxnQkFBZ0Isb0JBQUUsVUFBVSxjQUFFLFNBQVMsYUFBRSxrQkFBa0Isc0JBQUUsQ0FBQyIsInNvdXJjZXMiOlsiQzovUHJvamVrdC9NYXJxdWFyZC93cm1Tb2x1dGlvbi93ZWJwYWNrL2Jvb3RzdHJhcCIsIkM6L1Byb2pla3QvTWFycXVhcmQvd3JtU29sdXRpb24vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwiQzovUHJvamVrdC9NYXJxdWFyZC93cm1Tb2x1dGlvbi93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwiQzovUHJvamVrdC9NYXJxdWFyZC93cm1Tb2x1dGlvbi93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0IiwiQzovUHJvamVrdC9NYXJxdWFyZC93cm1Tb2x1dGlvbi9XZWJSZXNvdXJjZXMvc3JjL3dybXJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbC9reWNfYXBwcm92YWwuZm9ybS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBUaGUgcmVxdWlyZSBzY29wZVxudmFyIF9fd2VicGFja19yZXF1aXJlX18gPSB7fTtcblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vID09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBSRUZBQ1RPUkVEOiBDbGFzc2VzICYgSGVscGVycyAobm8gVFMgbmFtZXNwYWNlcylcclxuLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbi8vIFRoaXMgZmlsZSBrZWVwcyB0aGUgcHVibGljIGhhbmRsZXJzIGFzIGV4cG9ydHMgKGJ1bmRsZWQgYnkgV2VicGFjayBhcyBnbG9iYWxzKSxcclxuLy8gYnV0IG9yZ2FuaXplcyB0aGUgbG9naWMgaW50byByZXVzYWJsZSBjbGFzc2VzIGZvciBBUEksIHZpc2liaWxpdHksIGdyaWQvbG9va3VwLCBhbmQgZG9tYWluIHNlcnZpY2VzLlxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbi8vIENPTkZJRyAoZWRpdCBhcyBuZWVkZWQpXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG5jb25zdCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMX0VOVElUWSA9IFwid3Jtcl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsXCI7XHJcbmNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUxfRU5USVRZX1BLID0gXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxpZFwiOyAvLyBwcmltYXJ5IGtleSBsb2dpY2FsIG5hbWVcclxuXHJcbmNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUxfRU5USVRZX0NPTlRBQ1RJRCA9IFwid3Jtcl9jb250YWN0aWRcIjtcclxuY29uc3QgUklTS1NVTU1BUllBTkRBUFBST1ZBTF9FTlRJVFlfQ09NUEFOWUlEID0gXCJ3cm1yX2NvbXBhbnlpZFwiO1xyXG5cclxuY29uc3QgUE9SVEZPTElPX0VOVElUWSA9IFwid3JtYl9wb3J0Zm9saW9cIjsgICAgICAgICAgLy8gbG9naWNhbCBuYW1lIChEaXNwbGF5OiBBY2NvdW50KVxyXG5jb25zdCBQT1JURk9MSU9fRU5USVRZX1BLID0gXCJ3cm1iX3BvcnRmb2xpb2lkXCI7ICAgICAgICAvLyBwcmltYXJ5IGtleSBvZiBwb3J0Zm9saW9cclxuXHJcbmNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUF9FTlRJVFkgPSBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwXCI7XHJcbmNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUF9FTlRJVFlfUE9SVEZPTElPSUQgPSBcIndybWJfcG9ydGZvbGlvaWRcIjsgICAgICAgICAvLyBpbiBSRUxfVEFCTEUg4oaSIGxvb2t1cCB0byBwb3J0Zm9saW9cclxuY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQX0VOVElUWV9DT05UQUNUSUQgPSBcIndybWJfY29udGFjdGlkXCI7XHJcbmNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUF9FTlRJVFlfQ09NUEFOWUlEID0gXCJ3cm1iX2NvbXBhbnlpZFwiO1xyXG5jb25zdCBQT1JURk9MSU9SRUxBVElPTlNISVBfRU5USVRZX1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEVJRCA9IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlaWRcIjtcclxuXHJcbmNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEVfRU5USVRZID0gXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVcIjtcclxuY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQVFlQRV9FTlRJVFlfUEsgPSBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCI7XHJcbmNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEVfRU5USVRZX05BTUUgPSBcIndybWJfbmFtZVwiO1xyXG5jb25zdCBQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFX0VOVElUWV9OQU1FX1BSSU5DSVBBTCA9IFwiUHJpbmNpcGFsXCI7XHJcblxyXG4vLyBOOk4gQmV6aWVodW5nXHJcbmNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUxfRU5USVRZX04yTl9SRUxBVElPTlNISVBfU0NIRU1BID0gXCJtaHdybWJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbDJwb3J0Zm9saW9cIjsgLy8gc2NoZW1hIG5hbWUgZm9yIEFzc29jaWF0ZVxyXG5jb25zdCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMX0VOVElUWV9OMk5fTkFWX0NPTExFQ1RJT04gPSBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiOyAvLyBjb2xsZWN0aW9uLXZhbHVlZCBuYXYuIG5hbWUgZm9yICRleHBhbmRcclxuXHJcbi8vIG9wdGlvbmFsOiBTdWJncmlkIGltIEZvcm11bGFyLCBkYXMgbmFjaGhlciByZWZyZXNoZWQgd2VyZGVuIHNvbGxcclxuY29uc3QgUE9SVEZPTElPX0VOVElUWV9TVUJHUklEX05BTUUgPSBcIndybV9zdWJncmlkX2FjY291bnRzXCI7XHJcblxyXG5jb25zdCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMX0VOVElUWV9BTUJDVVNUX09SSUdJTlRZUEVJRCA9IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIjsgICAgLy8gTG9va3VwLUZlbGQgYXVmIE1BSU5fRU5USVRZXHJcbmNvbnN0IE9SSUdJTlRZUEVfRU5USVRZID0gXCJhbWJjdXN0X29yaWdpbnR5cGVcIjsgICAgICAgICAgICAgICAgLy8gc2luZ3Vsw6RyZXIgbG9naXNjaGVyIE5hbWVcclxuY29uc3QgT1JJR0lOVFlQRV9FTlRJVFlfUEsgPSBcImFtYmN1c3Rfb3JpZ2ludHlwZWlkXCI7ICAgICAgICAgICAvLyBQcmltw6Ryc2NobMO8c3NlbCBkZXIgWmllbHRhYmVsbGVcclxuY29uc3QgT1JJR0lOVFlQRV9FTlRJVFlfVFlQRU5BTUVDT0RFID0gXCJtaHdybWJfdHlwZW5hbWVjb2RlXCI7ICAgICAgICAgICAgLy8gU3BhbHRlLCBuYWNoIGRlciBnZWZpbHRlcnQgd2lyZFxyXG5jb25zdCBPUklHSU5UWVBFX0VOVElUWV9UWVBFTkFNRUNPREVfQUNDT1VOVF9PUEVOSU5HID0gXCJBQ0NPVU5UX09QRU5JTkdcIjsgICAgIC8vIFppZWxjb2RlXHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT1cclxuLy8gVFlQRVNcclxuLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbmludGVyZmFjZSBMb29rdXBSZXN1bHQge1xyXG4gICAgaWQ6IHN0cmluZzsgICAgICAgICAgIC8vIEdVSUQgKHdpdGgvd2l0aG91dCB7fSlcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZzsgICAvLyBlLmcuLCBcIndybWJfcG9ydGZvbGlvXCJcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBDT1JFIFVUSUxTXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG5jbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWCgpOiBhbnkgeyByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTsgfVxyXG5cclxuICAgIHN0YXRpYyBzYW5pdGl6ZUd1aWQoaWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bmlxdWU8VD4oYXJyOiBUW10pOiBUW10geyByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpOyB9XHJcblxyXG4gICAgc3RhdGljIGVuc3VyZUFycmF5PFQ+KHY6IFQgfCBUW10gfCBudWxsIHwgdW5kZWZpbmVkKTogVFtdIHtcclxuICAgICAgICBpZiAoIXYpIHJldHVybiBbXTtcclxuICAgICAgICByZXR1cm4gQXJyYXkuaXNBcnJheSh2KSA/IHYgOiBbdl07XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBBUEkgQ0xJRU5UIChXZWJBcGkgd3JhcHBlcilcclxuLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbmNsYXNzIEFwaUNsaWVudCB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5JZCA9IFV0aWwuc2FuaXRpemVHdWlkKGlkKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5YLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIC8vIG9wdGlvbnMgbGlrZTogYD8kc2VsZWN0PS4uLiYkZmlsdGVyPS4uLmAgIChubyBleHRyYSAnPycgYmVmb3JlICRmaWx0ZXIhKVxyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlguV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hYbWwoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgZmV0Y2hYbWw6IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGA/ZmV0Y2hYbWw9JHtlbmNvZGVVUklDb21wb25lbnQoZmV0Y2hYbWwudHJpbSgpKX1gO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlguV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCB1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBleGVjdXRlKHJlcXVlc3Q6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5YLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKGlkID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gPT09PT09PT09PT09PT09PT09PT09XHJcbi8vIEZPUk0gSEVMUEVSU1xyXG4vLyA9PT09PT09PT09PT09PT09PT09PT1cclxuY2xhc3MgRm9ybUhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHsgcmV0dXJuIG51bGw7IH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEdyaWRIZWxwZXIge1xyXG4gICAgc3RhdGljIHRyeVJlZnJlc2hTdWJncmlkKGZjOiBhbnksIG5hbWU/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBncmlkID0gZmM/LmdldENvbnRyb2w/LihuYW1lKTtcclxuICAgICAgICBpZiAoZ3JpZD8ucmVmcmVzaCkge1xyXG4gICAgICAgICAgICB0cnkgeyBncmlkLnJlZnJlc2goKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHsgZmM/LnVpPy5yZWZyZXNoUmliYm9uPy4oKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIC8qKiBTZXQgdmlzaWJpbGl0eSBmb3IgYSBzaW5nbGUgY29udHJvbCAoZmllbGQsIHN1YmdyaWQsIHNlY3Rpb24gY29udHJvbCkuICovXHJcbiAgICBzdGF0aWMgc2V0VmlzaWJsZShmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXRWaXNpYmxlKSB7IHRyeSB7IGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9IH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2hvdy9oaWRlIG11bHRpcGxlIGNvbnRyb2xzLiAqL1xyXG4gICAgc3RhdGljIHNldE1hbnkoZmM6IGFueSwgY29udHJvbE5hbWVzOiBzdHJpbmdbXSwgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnRyb2xOYW1lcy5mb3JFYWNoKG4gPT4gVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBuLCB2aXNpYmxlKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNob3cgYSBjb250cm9sIHdoZW4gYSBwcmVkaWNhdGUgcmV0dXJucyB0cnVlLCBvdGhlcndpc2UgaGlkZS4gKi9cclxuICAgIHN0YXRpYyBzaG93SWYoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgcHJlZGljYXRlOiAoKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdyA9ICEhcHJlZGljYXRlKCk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBjb250cm9sTmFtZSwgc2hvdyk7XHJcbiAgICAgICAgcmV0dXJuIHNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEdlbmVyaWM6IGNvbXBhcmUgYSBsb29rdXAgYXR0cmlidXRlIHRvIGEgdGFyZ2V0IEdVSUQgKGNhc2UvYnJhY2UtaW5zZW5zaXRpdmUpLiAqL1xyXG4gICAgc3RhdGljIHNob3dJZkxvb2t1cEVxdWFscyhmYzogYW55LCBsb29rdXBBdHRyOiBzdHJpbmcsIHRhcmdldElkOiBzdHJpbmcsIGNvbnRyb2xOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gVmlzaWJpbGl0eUhlbHBlci5zaG93SWYoZmMsIGNvbnRyb2xOYW1lLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBGb3JtSGVscGVyLmdldExvb2t1cElkKGZjLCBsb29rdXBBdHRyKTtcclxuICAgICAgICAgICAgcmV0dXJuICEhY3VycmVudCAmJiBVdGlsLnNhbml0aXplR3VpZChjdXJyZW50KSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQodGFyZ2V0SWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5jbGFzcyBMb29rdXBEaWFsb2dIZWxwZXIge1xyXG4gICAgLyoqIE9wZW4gbG9va3VwIHdpdGggYW4gSU4tZmlsdGVyIG9uIHRoZSBpZCBhdHRyaWJ1dGUsIGxpbWl0aW5nIHRvIGEgZ2l2ZW4gZW50aXR5LiAqL1xyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHJpYnV0ZTogc3RyaW5nLFxyXG4gICAgICAgIGlkczogc3RyaW5nW10sXHJcbiAgICAgICAgb3B0aW9ucz86IFBhcnRpYWw8eyBhbGxvd011bHRpU2VsZWN0OiBib29sZWFuOyBkaXNhYmxlTXJ1OiBib29sZWFuOyBkZWZhdWx0Vmlld0lkOiBzdHJpbmc7IH0+XHJcbiAgICApOiBQcm9taXNlPExvb2t1cFJlc3VsdFtdPiB7XHJcbiAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBpZHNcclxuICAgICAgICAgICAgLm1hcChpZCA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YCkgLy8ga2VlcCB7fSBpbnNpZGUgdmFsdWVcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlguVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT1cclxuLy8gRE9NQUlOIFNFUlZJQ0VTXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG5jbGFzcyBPcmlnaW5UeXBlU2VydmljZSB7XHJcbiAgICAvKiogR2V0IHRoZSBJRCBvZiB0aGUgT3JpZ2luVHlwZSByZWNvcmQgYnkgY29kZSB2YWx1ZSAoZS5nLiwgJ0FDQ09VTlRfT1BFTklORycpLiAqL1xyXG4gICAgc3RhdGljIGFzeW5jIGdldElkQnlDb2RlKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBwcmltYXJ5SWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgY29kZUF0dHI6IHN0cmluZyxcclxuICAgICAgICBjb2RlVmFsdWU6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgLy8gQ29ycmVjdCBPRGF0YSBvcHRpb25zOiBvbmUgJz8nIHByZWZpeCBvbmx5XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke3ByaW1hcnlJZEF0dHJ9JiRmaWx0ZXI9KCR7Y29kZUF0dHJ9IGVxICcke2NvZGVWYWx1ZX0nKWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5bcHJpbWFyeUlkQXR0cl0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIFJlbGF0aW9uc2hpcFNlcnZpY2Uge1xyXG4gICAgLyoqXHJcbiAgICAgKiBDb2xsZWN0IGNhbmRpZGF0ZSBwb3J0Zm9saW8gSURzIGZyb20gcmVsYXRpb25zaGlwIHRhYmxlIHdpdGggb3B0aW9uYWwgZmlsdGVycyBmb3IgY29udGFjdC9jb21wYW55XHJcbiAgICAgKiBhbmQgZm9yY2VkIHJlbGF0aW9uc2hpcCB0eXBlIG5hbWUgPT0gJ1ByaW5jaXBhbCcuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyBhc3luYyBnZXRDYW5kaWRhdGVQb3J0Zm9saW9JZHMoXHJcbiAgICAgICAgY29udGFjdElkPzogc3RyaW5nLFxyXG4gICAgICAgIGNvbXBhbnlJZD86IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgICAgIGNvbnN0IG9yQmxvY2sgPSBbXHJcbiAgICAgICAgICAgIGNvbnRhY3RJZCA/IGA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQX0VOVElUWV9DT05UQUNUSUR9XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHtVdGlsLnNhbml0aXplR3VpZChjb250YWN0SWQpfVwiIC8+YCA6IFwiXCIsXHJcbiAgICAgICAgICAgIGNvbXBhbnlJZCA/IGA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQX0VOVElUWV9DT01QQU5ZSUR9XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHtVdGlsLnNhbml0aXplR3VpZChjb21wYW55SWQpfVwiIC8+YCA6IFwiXCIsXHJcbiAgICAgICAgXS5maWx0ZXIoQm9vbGVhbikuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgIDxmZXRjaCB2ZXJzaW9uPVwiMS4wXCIgZGlzdGluY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgPGVudGl0eSBuYW1lPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBfRU5USVRZfVwiPlxyXG4gICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBfRU5USVRZX1BPUlRGT0xJT0lEfVwiIC8+XHJcbiAgICAgICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICAgICAgPGZpbHRlciB0eXBlPVwib3JcIj5cclxuICAgICAgICAgICAgICAke29yQmxvY2t9XHJcbiAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQVFlQRV9FTlRJVFl9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICBmcm9tPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFX0VOVElUWV9QS31cIlxyXG4gICAgICAgICAgICAgICAgICAgICAgIHRvPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBfRU5USVRZX1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEVJRH1cIiBhbGlhcz1cInJlbHR5cGVcIj5cclxuICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQVFlQRV9FTlRJVFlfTkFNRX1cIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEVfRU5USVRZX05BTUVfUFJJTkNJUEFMfVwiIC8+XHJcbiAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICA8L2VudGl0eT5cclxuICAgICAgPC9mZXRjaD5gO1xyXG5cclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQuZmV0Y2hYbWwoUE9SVEZPTElPUkVMQVRJT05TSElQX0VOVElUWSwgZmV0Y2hYbWwpO1xyXG4gICAgICAgIGNvbnN0IHNldCA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG5cclxuICAgICAgICBmb3IgKGNvbnN0IGUgb2YgcmVzLmVudGl0aWVzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQoKGUgYXMgYW55KVtgXyR7UE9SVEZPTElPUkVMQVRJT05TSElQX0VOVElUWV9QT1JURk9MSU9JRH1fdmFsdWVgXSB8fCAoZSBhcyBhbnkpW1BPUlRGT0xJT1JFTEFUSU9OU0hJUF9FTlRJVFlfUE9SVEZPTElPSURdKTtcclxuICAgICAgICAgICAgaWYgKGlkKSBzZXQuYWRkKGlkKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oc2V0KTtcclxuICAgIH1cclxufVxyXG5cclxuY2xhc3MgTjJOU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0QWxyZWFkeUxpbmtlZFBvcnRmb2xpb0lkcyhtYWluSWQ6IHN0cmluZyk6IFByb21pc2U8U2V0PHN0cmluZz4+IHtcclxuICAgICAgICBjb25zdCBleHBhbmQgPSBgPyRleHBhbmQ9JHtSSVNLU1VNTUFSWUFOREFQUFJPVkFMX0VOVElUWV9OMk5fTkFWX0NPTExFQ1RJT059KCRzZWxlY3Q9JHtQT1JURk9MSU9fRU5USVRZX1BLfSlgO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChSSVNLU1VNTUFSWUFOREFQUFJPVkFMX0VOVElUWSwgbWFpbklkLCBleHBhbmQpO1xyXG4gICAgICAgIGNvbnN0IGxpc3QgPSAocmVjPy5bUklTS1NVTU1BUllBTkRBUFBST1ZBTF9FTlRJVFlfTjJOX05BVl9DT0xMRUNUSU9OXSB8fCBbXSkgYXMgQXJyYXk8YW55PjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2V0ID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICAgICAgZm9yIChjb25zdCByb3cgb2YgbGlzdCkge1xyXG4gICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKHJvd1tQT1JURk9MSU9fRU5USVRZX1BLXSk7XHJcbiAgICAgICAgICAgIGlmIChpZCkgc2V0LmFkZChpZCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzZXQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbmNsYXNzIEFwcHJvdmFsUG9ydGZvbGlvRmxvdyB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcnVuKGZjOiBhbnksIG1haW5JZDogc3RyaW5nLCBjdHg6IHsgY29udGFjdElkPzogc3RyaW5nOyBjb21wYW55SWQ/OiBzdHJpbmc7IH0pIHtcclxuICAgICAgICBjb25zdCBYID0gVXRpbC5YO1xyXG5cclxuICAgICAgICAvLyAxKSBDYW5kaWRhdGVzXHJcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlSWRzID0gYXdhaXQgUmVsYXRpb25zaGlwU2VydmljZS5nZXRDYW5kaWRhdGVQb3J0Zm9saW9JZHMoY3R4LmNvbnRhY3RJZCwgY3R4LmNvbXBhbnlJZCk7XHJcbiAgICAgICAgaWYgKGNhbmRpZGF0ZUlkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXdhaXQgWC5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiTm8gbWF0Y2hpbmcgYWNjb3VudHMgZm91bmQgZm9yIHRoZSBzZWxlY3RlZCBDb250YWN0L0NvbXBhbnkuXCIgfSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIDIpIEV4Y2x1ZGUgYWxyZWFkeS1saW5rZWRcclxuICAgICAgICBjb25zdCBhbHJlYWR5TGlua2VkID0gYXdhaXQgTjJOU2VydmljZS5nZXRBbHJlYWR5TGlua2VkUG9ydGZvbGlvSWRzKG1haW5JZCk7XHJcbiAgICAgICAgY29uc3QgY2FuZGlkYXRlc1RvT2ZmZXIgPSBjYW5kaWRhdGVJZHMuZmlsdGVyKGlkID0+ICFhbHJlYWR5TGlua2VkLmhhcyhVdGlsLnNhbml0aXplR3VpZChpZCkpKTtcclxuICAgICAgICBpZiAoY2FuZGlkYXRlc1RvT2ZmZXIubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IFguTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIkFsbCBjYW5kaWRhdGUgYWNjb3VudHMgYXJlIGFscmVhZHkgbGlua2VkIHRvIHRoaXMgcmVjb3JkLlwiIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyAzKSBPcGVuIHBpY2tlciAoZmlsdGVyZWQgdG8gdGhvc2UgY2FuZGlkYXRlcylcclxuICAgICAgICBmYz8udWk/LnNldEZvcm1Ob3RpZmljYXRpb24/LihcclxuICAgICAgICAgICAgXCJTaG93aW5nIGFjY291bnRzIHRoYXQgbWF0Y2ggdGhlIHNlbGVjdGVkIENvbnRhY3QvQ29tcGFueS4gQWxyZWFkeSBsaW5rZWQgaXRlbXMgYXJlIGhpZGRlbi5cIixcclxuICAgICAgICAgICAgXCJJTkZPXCIsXHJcbiAgICAgICAgICAgIFwiYWNjb3VudC1maWx0ZXItY29udGV4dFwiXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0aW9uID0gYXdhaXQgTG9va3VwRGlhbG9nSGVscGVyLm9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgICAgICBQT1JURk9MSU9fRU5USVRZLFxyXG4gICAgICAgICAgICBQT1JURk9MSU9fRU5USVRZX1BLLFxyXG4gICAgICAgICAgICBjYW5kaWRhdGVzVG9PZmZlcixcclxuICAgICAgICAgICAgeyBhbGxvd011bHRpU2VsZWN0OiB0cnVlLCBkaXNhYmxlTXJ1OiB0cnVlIH1cclxuICAgICAgICApO1xyXG5cclxuICAgICAgICBmYz8udWk/LmNsZWFyRm9ybU5vdGlmaWNhdGlvbj8uKFwiYWNjb3VudC1maWx0ZXItY29udGV4dFwiKTtcclxuICAgICAgICBpZiAoIXNlbGVjdGlvbiB8fCBzZWxlY3Rpb24ubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHNlbGVjdGVkSWRzID0gVXRpbC51bmlxdWUoc2VsZWN0aW9uLm1hcChzID0+IFV0aWwuc2FuaXRpemVHdWlkKHMuaWQpKSk7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkSWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICAvLyA0KSBBc3NvY2lhdGVcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBBcGlDbGllbnQuYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICAgICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUxfRU5USVRZLFxyXG4gICAgICAgICAgICAgICAgbWFpbklkLFxyXG4gICAgICAgICAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTF9FTlRJVFlfTjJOX1JFTEFUSU9OU0hJUF9TQ0hFTUEsXHJcbiAgICAgICAgICAgICAgICBQT1JURk9MSU9fRU5USVRZLFxyXG4gICAgICAgICAgICAgICAgc2VsZWN0ZWRJZHNcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGNhdGNoIChlOiBhbnkpIHtcclxuICAgICAgICAgICAgY29uc3QgbXNnID0gU3RyaW5nKGU/Lm1lc3NhZ2UgfHwgZSk7XHJcbiAgICAgICAgICAgIC8vIGNvbW1vbiBkdXBsaWNhdGUgY2FzZSB3aGVuIGNvbmN1cnJlbnQgKGlnbm9yZSlcclxuICAgICAgICAgICAgaWYgKCEvYWxyZWFkeSBleGlzdHMvaS50ZXN0KG1zZykpIHRocm93IGU7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyA1KSBSZWZyZXNoIGdyaWRcclxuICAgICAgICBHcmlkSGVscGVyLnRyeVJlZnJlc2hTdWJncmlkKGZjLCBQT1JURk9MSU9fRU5USVRZX1NVQkdSSURfTkFNRSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG4vLyBQVUJMSUMgSEFORExFUlMgKGV4cG9ydGVkKVxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT1cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uTG9hZChleGVjdXRpb25Db250ZXh0OiBhbnkpIHtcclxuICAgIGNvbnN0IGZjID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dD8uKCkgPz8gZXhlY3V0aW9uQ29udGV4dDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIC8vIDEpIEdldCBHVUlEIGZvciBBQ0NPVU5UX09QRU5JTkcgb3JpZ2luIHR5cGVcclxuICAgICAgICBjb25zdCBhY2NvdW50T3BlbmluZ0lkID0gYXdhaXQgT3JpZ2luVHlwZVNlcnZpY2UuZ2V0SWRCeUNvZGUoXHJcbiAgICAgICAgICAgIE9SSUdJTlRZUEVfRU5USVRZLFxyXG4gICAgICAgICAgICBPUklHSU5UWVBFX0VOVElUWV9QSyxcclxuICAgICAgICAgICAgT1JJR0lOVFlQRV9FTlRJVFlfVFlQRU5BTUVDT0RFLFxyXG4gICAgICAgICAgICBPUklHSU5UWVBFX0VOVElUWV9UWVBFTkFNRUNPREVfQUNDT1VOVF9PUEVOSU5HXHJcbiAgICAgICAgKTtcclxuXHJcbiAgICAgICAgaWYgKCFhY2NvdW50T3BlbmluZ0lkKSB7XHJcbiAgICAgICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgUE9SVEZPTElPX0VOVElUWV9TVUJHUklEX05BTUUsIGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gMikgQ29tcGFyZSBjdXJyZW50IGxvb2t1cCBhbmQgdG9nZ2xlIHN1YmdyaWRcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNob3dJZkxvb2t1cEVxdWFscyhcclxuICAgICAgICAgICAgZmMsXHJcbiAgICAgICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUxfRU5USVRZX0FNQkNVU1RfT1JJR0lOVFlQRUlELFxyXG4gICAgICAgICAgICBhY2NvdW50T3BlbmluZ0lkLFxyXG4gICAgICAgICAgICBQT1JURk9MSU9fRU5USVRZX1NVQkdSSURfTkFNRVxyXG4gICAgICAgICk7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBQT1JURk9MSU9fRU5USVRZX1NVQkdSSURfTkFNRSwgZmFsc2UpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQWxsb3dlZEFjY291bnRzKHByaW1hcnlDb250cm9sOiBhbnkpIHtcclxuICAgIGNvbnN0IGZjID0gcHJpbWFyeUNvbnRyb2w7XHJcbiAgICBjb25zdCBYID0gVXRpbC5YO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRJZCA9IEZvcm1IZWxwZXIuZ2V0Q3VycmVudElkKGZjKTtcclxuICAgIGlmICghY3VycmVudElkKSB7IGF3YWl0IFguTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIlBsZWFzZSBzYXZlIHRoZSByZWNvcmQgZmlyc3QuXCIgfSk7IHJldHVybjsgfVxyXG5cclxuICAgIGNvbnN0IGNvbnRhY3RJZCA9IEZvcm1IZWxwZXIuZ2V0TG9va3VwSWQoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUxfRU5USVRZX0NPTlRBQ1RJRCk7XHJcbiAgICBjb25zdCBjb21wYW55SWQgPSBGb3JtSGVscGVyLmdldExvb2t1cElkKGZjLCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMX0VOVElUWV9DT01QQU5ZSUQpO1xyXG5cclxuICAgIGlmICghY29udGFjdElkICYmICFjb21wYW55SWQpIHtcclxuICAgICAgICBhd2FpdCBYLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJQbGVhc2Ugc2V0IGVpdGhlciBhIENvbnRhY3Qgb3IgYSBDb21wYW55IGZpcnN0LlwiIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IEFwcHJvdmFsUG9ydGZvbGlvRmxvdy5ydW4oZmMsIGN1cnJlbnRJZCwgeyBjb250YWN0SWQsIGNvbXBhbnlJZCB9KTtcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgYXdhaXQgWC5OYXZpZ2F0aW9uLm9wZW5FcnJvckRpYWxvZz8uKHsgbWVzc2FnZTogZXJyPy5tZXNzYWdlID8/IFN0cmluZyhlcnIpIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyA9PT09PT09PT09PT09PT09PT09PT1cclxuLy8gT1BUSU9OQUw6IEV4cG9ydCBoZWxwZXJzIGlmIHlvdSB3YW50IHRvIHJldXNlIG91dHNpZGVcclxuLy8gKFdlYnBhY2sgY2FuIGV4cG9zZSB0aGVzZSBpZiBjb25maWd1cmVkOyBvdGhlcndpc2Uga2VlcCBsb2NhbC4pXHJcbi8vID09PT09PT09PT09PT09PT09PT09PVxyXG5leHBvcnQgY29uc3QgSGVscGVycyA9IHsgVXRpbCwgRm9ybUhlbHBlciwgVmlzaWJpbGl0eUhlbHBlciwgR3JpZEhlbHBlciwgQXBpQ2xpZW50LCBMb29rdXBEaWFsb2dIZWxwZXIgfTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9