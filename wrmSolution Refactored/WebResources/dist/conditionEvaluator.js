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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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TyxJQUFJLENBQUM7WUFDekUsQ0FBQztpQkFBTSxJQUFJLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQy9CLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLElBQUksS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO29CQUFFLE9BQU8sSUFBSSxDQUFDO1lBQ3RHLENBQUM7aUJBQU0sSUFBSSxXQUFXLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUM7Z0JBQ2hDLE9BQU8sSUFBSSxDQUFDO1lBQ2hCLENBQUM7UUFDTCxDQUFDO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVELE9BQU8sYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzdELENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NybS5jb3JlLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY29uZGl0aW9uLmV2YWx1YXRvci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyA9PT09IEZvcm1UeXBlIENvbnN0YW50cyA9PT09XHJcbmV4cG9ydCBjb25zdCBGT1JNX1RZUEUgPSB7XHJcbiAgICBVbmRlZmluZWQ6IDAsXHJcbiAgICBDcmVhdGU6IDEsXHJcbiAgICBVcGRhdGU6IDIsXHJcbiAgICBSZWFkT25seTogMyxcclxuICAgIERpc2FibGVkOiA0LFxyXG4gICAgUXVpY2tDcmVhdGU6IDUsXHJcbiAgICBCdWxrRWRpdDogNixcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIEZvcm1UeXBlID0gdHlwZW9mIEZPUk1fVFlQRVtrZXlvZiB0eXBlb2YgRk9STV9UWVBFXTtcclxuXHJcbmV4cG9ydCBjb25zdCBGb3JtVHlwZUhlbHBlciA9IHtcclxuICAgIGdldChmYzogYW55KTogRm9ybVR5cGUgfCAwIHtcclxuICAgICAgICByZXR1cm4gZmM/LnVpPy5nZXRGb3JtVHlwZT8uKCkgPz8gRk9STV9UWVBFLlVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBpc0NyZWF0ZUxpa2UodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9LFxyXG4gICAgaXNFZGl0YWJsZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5VcGRhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPd25lclJlZiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIgfCBcInRlYW1cIjtcclxuICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIFR5cGVzIHNoYXJlZCBhY3Jvc3MgZW5naW5lICYgZW50aXRpZXMgLS0tLVxyXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9IFwiZXFcIiB8IFwibmVcIiB8IFwiaW5cIiB8IFwiaXNudWxsXCIgfCBcImlzbm90bnVsbFwiIHwgXCJub3RudWxsXCI7IC8vIGFsaWFzXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICAvKiogTG9naWNhbCBuYW1lIChzdXBwb3J0cyBkb3Qtbm90YXRpb24gZm9yIGxvb2t1cCBwcm9qZWN0aW9uczogZS5nLiwgXCJwcmltYXJ5Y29udGFjdGlkLm5hbWVcIikuICovXHJcbiAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgb3BlcmF0b3I6IE9wZXJhdG9yO1xyXG4gICAgLyoqIE9wdGlvbmFsIHZhbHVlIGZvciBjb21wYXJpc29ucyAob21pdHRlZCBmb3IgbnVsbC1vcGVyYXRvcnMpLiAqL1xyXG4gICAgdmFsdWU/OiB1bmtub3duO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJ1bGUge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIG1hbmRhdG9yeT86IHN0cmluZ1tdO1xyXG4gICAgY29uZGl0aW9uPzogQ29uZGl0aW9uW107IC8vIEFORC1jb25qdW5jdGlvbjsgZW1wdHkvdW5kZWZpbmVkIOKHkiBydWxlIGFsd2F5cyBtYXRjaGVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q29uZmlnIHtcclxuICAgIGRlZmF1bHQ/OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuLyoqIExpZ2h0d2VpZ2h0IGNvbXBhcmFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsb29rdXAgKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIGlkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gQ29yZSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG4gICAgc3RhdGljIGdldCBYcm0oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogTG93ZXJjYXNlLCBzdHJpcCBicmFjZXM7IHJldHVybnMgZW1wdHkgc3RyaW5nIGlmIGZhbHN5IGlucHV0LiAqL1xyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBUaGluIFdlYiBBUEkgd3JhcHBlciAtLS0tXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKChyaWQpID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocmlkKSB9KSksXHJcbiAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwU2NoZW1hTmFtZSxcclxuICAgICAgICAgICAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGJvdW5kUGFyYW1ldGVyOiBudWxsLCBwYXJhbWV0ZXJUeXBlczoge30sIG9wZXJhdGlvblR5cGU6IDIsIG9wZXJhdGlvbk5hbWU6IFwiQXNzb2NpYXRlXCIgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9IGFzIGFueTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBBcGlDbGllbnQuZXhlY3V0ZShyZXEpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEZvcm0gaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBGb3JtQ29udHJvbEhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRMb29rdXBJZChmYzogYW55LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgY29uc3QgdiA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGUpPy5nZXRWYWx1ZT8uKCk7XHJcbiAgICAgICAgcmV0dXJuIHYgJiYgdi5sZW5ndGggPyBVdGlsLnNhbml0aXplR3VpZCh2WzBdLmlkKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGlzYWJsZSBvciBlbmFibGUgYWxsIGRpc2FibGVhYmxlIGNvbnRyb2xzIGluc2lkZSBhIHRhYiBzZWN0aW9uICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWRBbGxDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoY29udHJvbDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHsgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gT3B0aW9uYWw6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHN1YmdyaWRzLCB3aGljaCBkbyBub3Qgc3VwcG9ydCBzZXREaXNhYmxlZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgIC8qKiAgIFxyXG4gICAqIGRlL2FjdGl2YXRlIG9ubHkgdGhlIHNwZWNpZmllZCBjb250cm9scyAoYnkgbmFtZSkgaW4gYSBzZWN0aW9uLiAgIFxyXG4gICAqIERvZXMgbm90aGluZyBpZiB0aGUgbGlzdCBpcyBlbXB0eSBvciBjb250cm9scyBhcmUgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGNvbnRyb2xOYW1lczogcmVhZG9ubHkgc3RyaW5nW10sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29udHJvbE5hbWVzKSB8fCBjb250cm9sTmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnRyb2xOYW1lc1xyXG4gICAgICAgICAgICAubWFwKChuYW1lKSA9PiBGb3JtQ29udHJvbEhlbHBlci5maW5kQ29udHJvbEluU2VjdGlvbihzZWN0aW9uLCBuYW1lKSlcclxuICAgICAgICAgICAgLmZpbHRlcigoYyk6IGMgaXMgWHJtLkNvbnRyb2xzLkNvbnRyb2wgPT4gQm9vbGVhbihjKSlcclxuICAgICAgICAgICAgLmZvckVhY2goKGNvbnRyb2wpID0+IEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2wsIGRpc2FibGVkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZENvbnRyb2xJblNlY3Rpb24oXHJcbiAgICAgICAgc2VjdGlvbjogWHJtLkNvbnRyb2xzLlNlY3Rpb24sXHJcbiAgICAgICAgbmFtZTogc3RyaW5nXHJcbiAgICApOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgLy8gcHJpbWFyeTogZGlyZWN0IHBlciBOYW1lXHJcbiAgICAgICAgY29uc3QgZGlyZWN0ID0gc2VjdGlvbi5jb250cm9scy5nZXQ/LihuYW1lKTtcclxuICAgICAgICBpZiAoZGlyZWN0KSByZXR1cm4gZGlyZWN0O1xyXG5cclxuICAgICAgICAvLyBGYWxsYmFjazogc2VhcmNoIGJ5IGdldE5hbWUoKSBvdmVyIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgICAgbGV0IGZvdW5kOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGMpID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuZ2V0TmFtZT8uKCkgPT09IG5hbWUpIGZvdW5kID0gYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wsIGRpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IGNoYW5nZSBpZiBkaWZmZXJlbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IGNvbnRyb2wuZ2V0RGlzYWJsZWQ/LigpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09IFwiYm9vbGVhblwiICYmIGN1cnJlbnQgPT09IGRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvKiBuby1vcCAqL1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWRIZWxwZXIge1xyXG4gICAgc3RhdGljIHRyeVJlZnJlc2hTdWJncmlkKGZjOiBhbnksIG5hbWU/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBncmlkID0gZmM/LmdldENvbnRyb2w/LihuYW1lKTtcclxuICAgICAgICBpZiAoZ3JpZD8ucmVmcmVzaCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ3JpZC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZmM/LnVpPy5yZWZyZXNoUmliYm9uPy4oKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBWaXNpYmlsaXR5IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVmlzaWJpbGl0eUhlbHBlciB7XHJcbiAgICBzdGF0aWMgc2V0VmlzaWJsZShmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXRWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFZpc2libGUodmlzaWJsZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgYSBjb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgZGlzYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldERpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyByZXF1aXJlZCBsZXZlbCBvbiBhbiBhdHRyaWJ1dGUvY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldFJlcXVpcmVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGlzUmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cj8uc2V0UmVxdWlyZWRMZXZlbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZihmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzaG93ID0gISFwcmVkaWNhdGUoKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIGNvbnRyb2xOYW1lLCBzaG93KTtcclxuICAgICAgICByZXR1cm4gc2hvdztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmTG9va3VwRXF1YWxzKGZjOiBhbnksIGxvb2t1cEF0dHI6IHN0cmluZywgdGFyZ2V0SWQ6IHN0cmluZywgY29udHJvbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5SGVscGVyLnNob3dJZihmYywgY29udHJvbE5hbWUsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IEZvcm1Db250cm9sSGVscGVyLmdldExvb2t1cElkKGZjLCBsb29rdXBBdHRyKTtcclxuICAgICAgICAgICAgcmV0dXJuICEhY3VycmVudCAmJiBVdGlsLnNhbml0aXplR3VpZChjdXJyZW50KSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQodGFyZ2V0SWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBUeXBlIGd1YXJkOiBjb250cm9sIHN1cHBvcnRzIHNldERpc2FibGVkICovXHJcbiAgICBzdGF0aWMgaXNEaXNhYmxlYWJsZShjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCk6IGNvbnRyb2wgaXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCB7XHJcbiAgICAgICAgcmV0dXJuIFwic2V0RGlzYWJsZWRcIiBpbiBjb250cm9sICYmIHR5cGVvZiAoY29udHJvbCBhcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sKS5zZXREaXNhYmxlZCA9PT0gXCJmdW5jdGlvblwiO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgZGlhbG9nIGhlbHBlciAtLS0tXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nIH0+XHJcbiAgICApOiBQcm9taXNlPExvb2t1cFJlc3VsdFtdPiB7XHJcbiAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBpZHNcclxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IGA8dmFsdWUgdWl0eXBlPVwiJHtlbnRpdHlMb2dpY2FsfVwiPnske1V0aWwuc2FuaXRpemVHdWlkKGlkKX19PC92YWx1ZT5gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyWG1sID0gYFxyXG4gICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7aWRBdHRyaWJ1dGV9XCIgb3BlcmF0b3I9XCJpblwiPlxyXG4gICAgICAgICAgJHtpblZhbHVlc31cclxuICAgICAgICA8L2NvbmRpdGlvbj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN0YXRlY29kZVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIjBcIiAvPlxyXG4gICAgICA8L2ZpbHRlcj5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9va3VwT3B0aW9uczogYW55ID0ge1xyXG4gICAgICAgICAgICBhbGxvd011bHRpU2VsZWN0OiBvcHRpb25zPy5hbGxvd011bHRpU2VsZWN0ID8/IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHRFbnRpdHlUeXBlOiBlbnRpdHlMb2dpY2FsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlczogW2VudGl0eUxvZ2ljYWxdLFxyXG4gICAgICAgICAgICBmaWx0ZXJzOiBbeyBlbnRpdHlMb2dpY2FsTmFtZTogZW50aXR5TG9naWNhbCwgZmlsdGVyWG1sIH1dLFxyXG4gICAgICAgICAgICBkaXNhYmxlTXJ1OiBvcHRpb25zPy5kaXNhYmxlTXJ1ID8/IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LmRlZmF1bHRWaWV3SWQpIGxvb2t1cE9wdGlvbnMuZGVmYXVsdFZpZXdJZCA9IG9wdGlvbnMuZGVmYXVsdFZpZXdJZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCBVdGlsLlhybS5VdGlsaXR5Lmxvb2t1cE9iamVjdHMobG9va3VwT3B0aW9ucykpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEdlbmVyaWMgbG9va3VwIE9EYXRhIHNlcnZpY2UgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRJZEJ5RXF1YWxpdHkoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIGF0dHI6IHN0cmluZyxcclxuICAgICAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhblxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgbGl0ID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCA6IFN0cmluZyh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RJZEJ5RmlsdGVyKGVudGl0eUxvZ2ljYWwsIGlkQXR0ciwgYCgke2F0dHJ9IGVxICR7bGl0fSlgKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm1XYWl0IHtcclxuICAgIHN0YXRpYyB3YWl0Rm9yTG9va3VwVmFsdWUoZmM6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCB0aW1lb3V0TXMgPSA2MDAwKTogUHJvbWlzZTxYcm0uTG9va3VwVmFsdWUgfCBudWxsPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlTmFtZSkgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWF0dHIpIHJldHVybiByZXNvbHZlKG51bGwpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgaWYgKG5vdz8uaWQpIHJldHVybiByZXNvbHZlKG5vdyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZG9uZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4geyB0cnkgeyBhdHRyLnJlbW92ZU9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH0gfTtcclxuICAgICAgICAgICAgY29uc3Qgb25DaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgICAgICBpZiAodj8uaWQpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZSh2KTsgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdHJ5IHsgYXR0ci5hZGRPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQob25DaGFuZ2UsIDApO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGlmICghZG9uZSkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKG51bGwpOyB9IH0sIHRpbWVvdXRNcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBPd25lckhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0T3duZXJBdHRyaWJ1dGUoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gKGZjPy5nZXRBdHRyaWJ1dGU/Lihvd25lckF0dHJOYW1lKSA/PyBudWxsKSBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEN1cnJlbnRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBPd25lclJlZiB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKT8uZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgaWYgKCF2Py5pZCB8fCAhdi5lbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4geyBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodi5pZCksIGVudGl0eVR5cGU6IHYuZW50aXR5VHlwZSBhcyBhbnksIG5hbWU6IHYubmFtZSA/PyBudWxsIH07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNldE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZywgb3duZXI6IE93bmVyUmVmKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cikgcmV0dXJuO1xyXG4gICAgICAgIGF0dHIuc2V0VmFsdWUoW3tcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKG93bmVyLmlkKSxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTogb3duZXIuZW50aXR5VHlwZSxcclxuICAgICAgICAgICAgbmFtZTogb3duZXIubmFtZSA/PyB1bmRlZmluZWRcclxuICAgICAgICB9IGFzIGFueV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpc1NhbWVPd25lcihhPzogT3duZXJSZWYgfCBudWxsLCBiPzogT3duZXJSZWYgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGEuZW50aXR5VHlwZSA9PT0gYi5lbnRpdHlUeXBlICYmIFV0aWwuc2FuaXRpemVHdWlkKGEuaWQpID09PSBVdGlsLnNhbml0aXplR3VpZChiLmlkKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEdlbmVyaWMgc2VydmljZTogTG9hZCBvd25lciAoVXNlciBvciBUZWFtKSBmb3IgYW55IHJlY29yZCAqL1xyXG5leHBvcnQgY2xhc3MgT3duZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRPd25lclJlZihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVjb3JkSWQ6IHN0cmluZyxcclxuICAgICAgICBvd25lckF0dHJOYW1lID0gXCJvd25lcmlkXCJcclxuICAgICk6IFByb21pc2U8T3duZXJSZWYgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBVdGlsLnNhbml0aXplR3VpZChyZWNvcmRJZCk7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIC8vIEZvciBwb2x5bW9ycGhpYyBvd25lciBsb29rdXBzLCBleHBhbmQgZGVkaWNhdGVkIG5hdiBwcm9wcyB0byBhdm9pZCBwcm9wZXJ0eS1ub3QtZm91bmQgZXJyb3JzXHJcbiAgICAgICAgY29uc3QgZXhwYW5kID0gYD8kc2VsZWN0PSR7b3duZXJBdHRyTmFtZX0mJGV4cGFuZD1vd25pbmd1c2VyKCRzZWxlY3Q9c3lzdGVtdXNlcmlkLGZ1bGxuYW1lKSxvd25pbmd0ZWFtKCRzZWxlY3Q9dGVhbWlkLG5hbWUpYDtcclxuICAgICAgICBjb25zdCByZWMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbCwgaWQsIGV4cGFuZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSByZWM/LltcIm93bmluZ3VzZXJcIl07XHJcbiAgICAgICAgaWYgKHVzZXI/LnN5c3RlbXVzZXJpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHVzZXIuc3lzdGVtdXNlcmlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdXNlci5mdWxsbmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZWFtID0gcmVjPy5bXCJvd25pbmd0ZWFtXCJdO1xyXG4gICAgICAgIGlmICh0ZWFtPy50ZWFtaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh0ZWFtLnRlYW1pZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInRlYW1cIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRlYW0ubmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFNlY3VyaXR5LXJlbGF0ZWQgaGVscGVycyAqL1xyXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlTZXJ2aWNlIHtcclxuICAgICAgICAvKiogUmV0dXJucyBjdXJyZW50IHVzZXIgaWQgZnJvbSBYcm0gY29udGV4dCAqL1xyXG4gICAgICAgIHN0YXRpYyBnZXRDdXJyZW50VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBVdGlsLlhybT8uVXRpbGl0eT8uZ2V0R2xvYmFsQ29udGV4dD8uKCk/LnVzZXJTZXR0aW5ncz8udXNlcklkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm5zIHJvbGUgbmFtZXMgb2YgdGhlIGN1cnJlbnQgdXNlciAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBnZXRDdXJyZW50VXNlclJvbGVzKCk6IFByb21pc2U8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldEN1cnJlbnRVc2VySWQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdXNlcklkKSByZXR1cm4gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRmV0Y2hYTUwgb3ZlciBzeXN0ZW11c2Vycm9sZXMgKE46TikgdG8gcm9sZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZmV0Y2ggdmVyc2lvbj1cIjEuMFwiIGRpc3RpbmN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInJvbGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwicm9sZWlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlcnJvbGVzXCIgZnJvbT1cInJvbGVpZFwiIHRvPVwicm9sZWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2VyXCIgZnJvbT1cInN5c3RlbXVzZXJpZFwiIHRvPVwic3lzdGVtdXNlcmlkXCIgYWxpYXM9XCJ1XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke3VzZXJJZH1cIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZmV0Y2g+YC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQuZmV0Y2hYbWwoXCJyb2xlXCIsIGZldGNoWG1sKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAocmVzLmVudGl0aWVzIHx8IFtdKS5tYXAoKGUpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChlW1wicm9sZWlkXCJdID8/IGVbXCJfcm9sZWlkX3ZhbHVlXCJdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZVtcIm5hbWVcIl0gYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgfSkpLmZpbHRlcihyID0+ICEhci5pZCAmJiAhIXIubmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2hlY2tzIGlmIGN1cnJlbnQgdXNlciBoYXMgb25lIG9mIHRoZSBwcm92aWRlZCByb2xlIG5hbWVzIChjYXNlLWluc2Vuc2l0aXZlKSAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBoYXNDdXJyZW50VXNlclJvbGUoLi4ucm9sZU5hbWVzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2FudGVkID0gbmV3IFNldChyb2xlTmFtZXMubWFwKG4gPT4gbi50cmltKCkudG9Mb3dlckNhc2UoKSkuZmlsdGVyKEJvb2xlYW4pKTtcclxuICAgICAgICAgICAgICAgIGlmICh3YW50ZWQuc2l6ZSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRVc2VyUm9sZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByb2xlcy5zb21lKHIgPT4gd2FudGVkLmhhcyhyLm5hbWUudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgY29udHJvbCB2aWV3IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwVmlld0hlbHBlciB7XHJcbiAgICAvKiogUmVzdHJpY3QgYSBsb29rdXAgY29udHJvbCB0byBzcGVjaWZpYyBlbnRpdHkgdHlwZXMgKi9cclxuICAgIHN0YXRpYyBzZXRFbnRpdHlUeXBlcyhmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nLCBlbnRpdHlUeXBlczogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY3RybD8uc2V0RW50aXR5VHlwZXM/LihlbnRpdHlUeXBlcyk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZCBhIGN1c3RvbSB2aWV3IHRvIGEgbG9va3VwIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBhZGRDdXN0b21WaWV3KFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgY29udHJvbE5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBlbnRpdHlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0Rpc3BsYXlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZmV0Y2hYbWw6IHN0cmluZyxcclxuICAgICAgICBsYXlvdXRYbWw6IHN0cmluZyxcclxuICAgICAgICBzZXRBc0RlZmF1bHQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFjdHJsPy5hZGRDdXN0b21WaWV3KSByZXR1cm47XHJcbiAgICAgICAgICAgIGN0cmwuYWRkQ3VzdG9tVmlldyh2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwudHJpbSgpLCBsYXlvdXRYbWwudHJpbSgpLCBzZXRBc0RlZmF1bHQpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGRzIGEgY3VzdG9tIHZpZXcgZm9yIG93bmVyIGxvb2t1cCB0byBzaG93IG9ubHkgdGVhbXMgdGhlIGN1cnJlbnQgdXNlciBiZWxvbmdzIHRvLiAqL1xyXG4gICAgc3RhdGljIGFkZE93bmVyVGVhbVZpZXdGb3JDdXJyZW50VXNlcihmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nID0gXCJvd25lcmlkXCIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gXCJ0ZWFtXCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0Rpc3BsYXlOYW1lID0gXCJPd25lclRlYW1Mb29rdXBWaWV3XCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0lkID0gXCJ7MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxfVwiO1xyXG5cclxuICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgPGZldGNoPlxyXG4gICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwidGVhbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImJ1c2luZXNzdW5pdGlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cIm5ldl9vd25lcnRlYW0yc3lzdGVtdXNlclwiIGZyb209XCJ0ZWFtaWRcIiB0bz1cInRlYW1pZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcS11c2VyaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgIDwvZmV0Y2g+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgY29uc3QgbGF5b3V0WG1sID0gYFxyXG4gICAgICAgICAgICA8Z3JpZCBuYW1lPSdyZXN1bHRzZXQnIG9iamVjdD0nMScganVtcD0ndGVhbWlkJyBzZWxlY3Q9JzEnIGljb249JzEnIHByZXZpZXc9JzEnPlxyXG4gICAgICAgICAgICAgICAgPHJvdyBuYW1lPSdyZXN1bHQnIGlkPSd0ZWFtaWQnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J25hbWUnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nYnVzaW5lc3N1bml0aWQnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICA8L3Jvdz5cclxuICAgICAgICAgICAgPC9ncmlkPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuYWRkQ3VzdG9tVmlldyhmYywgY29udHJvbE5hbWUsIHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbCwgbGF5b3V0WG1sLCB0cnVlKTtcclxuICAgIH1cclxufSIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgQ29uZGl0aW9uLCBMb29rdXBDb21wYXJhYmxlLCBPcGVyYXRvciwgVXRpbCB9IGZyb20gXCIuLi9jb3JlL2NybS5jb3JlXCI7XHJcblxyXG5mdW5jdGlvbiBpc011bHRpU2VsZWN0QXJyYXkodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBBcnJheTxudW1iZXIgfCBzdHJpbmc+IHtcclxuICAgIHJldHVybiBBcnJheS5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZS5ldmVyeSgodikgPT4gdHlwZW9mIHYgPT09IFwibnVtYmVyXCIgfHwgdHlwZW9mIHYgPT09IFwic3RyaW5nXCIpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0xvb2t1cENvbXBhcmFibGUodjogdW5rbm93bik6IHYgaXMgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICByZXR1cm4gISF2ICYmIHR5cGVvZiB2ID09PSBcIm9iamVjdFwiICYmIChcImlkXCIgaW4gKHYgYXMgYW55KSB8fCBcIm5hbWVcIiBpbiAodiBhcyBhbnkpIHx8IFwiZW50aXR5VHlwZVwiIGluICh2IGFzIGFueSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiB0b0d1aWRPck51bGwodmFsdWU6IHVua25vd24pOiBzdHJpbmcgfCBudWxsIHtcclxuICAgIGNvbnN0IHMgPSBTdHJpbmcodmFsdWUgPz8gXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgcmV0dXJuIC9eWzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17NH0tWzAtOWEtZl17MTJ9JC8udGVzdChzKSA/IHMgOiBudWxsO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc051bGxpc2hPckVtcHR5KHY6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgIGlmICh2ID09IG51bGwpIHJldHVybiB0cnVlO1xyXG4gICAgaWYgKHR5cGVvZiB2ID09PSBcInN0cmluZ1wiKSByZXR1cm4gdi50cmltKCkgPT09IFwiXCI7XHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2KSkgcmV0dXJuIHYubGVuZ3RoID09PSAwO1xyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZSh2KSkgcmV0dXJuICF2LmlkICYmICF2Lm5hbWU7IC8vIGJvdGggZW1wdHlcclxuICAgIHJldHVybiBmYWxzZTtcclxufVxyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplU2NhbGFyKHg6IHVua25vd24pOiBzdHJpbmcge1xyXG4gICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbCh4KTtcclxuICAgIGlmIChnKSByZXR1cm4gYGd1aWQ6JHtnfWA7XHJcbiAgICBjb25zdCBuID0gTnVtYmVyKHgpO1xyXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4obikpIHJldHVybiBgbnVtOiR7bn1gO1xyXG4gICAgaWYgKHR5cGVvZiB4ID09PSBcImJvb2xlYW5cIikgcmV0dXJuIGBib29sOiR7eH1gO1xyXG4gICAgcmV0dXJuIGBzdHI6JHtTdHJpbmcoeCA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpfWA7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc0xvb2t1cEFycmF5KHZhbHVlOiB1bmtub3duKTogdmFsdWUgaXMgWHJtLkxvb2t1cFZhbHVlW10ge1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSAmJlxyXG4gICAgICAgIHZhbHVlLmxlbmd0aCA+IDAgJiZcclxuICAgICAgICB0eXBlb2YgdmFsdWVbMF0gPT09IFwib2JqZWN0XCIgJiZcclxuICAgICAgICB2YWx1ZVswXSAhPT0gbnVsbCAmJlxyXG4gICAgICAgIFwiaWRcIiBpbiAodmFsdWVbMF0gYXMgb2JqZWN0KSAmJlxyXG4gICAgICAgIHR5cGVvZiAodmFsdWVbMF0gYXMgWHJtLkxvb2t1cFZhbHVlKS5pZCA9PT0gXCJzdHJpbmdcIlxyXG4gICAgKTtcclxufVxyXG4vKiogUmVhZCBhIHZhbHVlIGZyb20gdGhlIGZvcm07IHN1cHBvcnRzIGxvb2t1cCBwcm9qZWN0aW9ucyB2aWEgZG90LW5vdGF0aW9uLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcmVhZEF0dHJpYnV0ZVZhbHVlKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQsIGZpZWxkUGF0aDogc3RyaW5nKTogdW5rbm93biB7XHJcbiAgICBjb25zdCBbbG9naWNhbE5hbWUsIHByb2plY3Rpb25dID0gZmllbGRQYXRoLnNwbGl0KFwiLlwiLCAyKTtcclxuICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShsb2dpY2FsTmFtZSk7XHJcbiAgICBpZiAoIWF0dHJpYnV0ZSB8fCB0eXBlb2YgYXR0cmlidXRlLmdldFZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHJldHVybiB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3QgcmF3ID0gYXR0cmlidXRlLmdldFZhbHVlKCk7XHJcblxyXG4gICAgLy8gTG9va3VwIC8gUGFydHlsaXN0XHJcbiAgICBpZiAoaXNMb29rdXBBcnJheShyYXcpKSB7XHJcbiAgICAgICAgY29uc3QgbHYgPSByYXdbMF0gYXMgWHJtLkxvb2t1cFZhbHVlICYgeyBlbnRpdHlUeXBlPzogc3RyaW5nIH07XHJcbiAgICAgICAgY29uc3Qgb2JqOiBMb29rdXBDb21wYXJhYmxlID0ge1xyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQobHYuaWQpLFxyXG4gICAgICAgICAgICBuYW1lOiBsdi5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IGx2LmVudGl0eVR5cGUgPz8gbnVsbCxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAocHJvamVjdGlvbikge1xyXG4gICAgICAgICAgICBzd2l0Y2ggKHByb2plY3Rpb24udG9Mb3dlckNhc2UoKSkge1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImlkXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5pZDtcclxuICAgICAgICAgICAgICAgIGNhc2UgXCJuYW1lXCI6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iai5uYW1lO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcImVudGl0eXR5cGVcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmVudGl0eVR5cGU7XHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmo7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG9iajsgLy8gZGVmYXVsdDogb2JqZWN0XHJcbiAgICB9XHJcblxyXG4gICAgLy8gTXVsdGktU2VsZWN0IE9wdGlvblNldFxyXG4gICAgaWYgKGlzTXVsdGlTZWxlY3RBcnJheShyYXcpKSByZXR1cm4gcmF3O1xyXG5cclxuICAgIC8vIFByaW1pdGl2ZVxyXG4gICAgcmV0dXJuIHJhdyBhcyB1bmtub3duO1xyXG59XHJcblxyXG4vKiogRXZhbHVhdGUgc2luZ2xlIGNvbmRpdGlvbiBhZ2FpbnN0IGFjdHVhbCB2YWx1ZS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlQ29uZGl0aW9uKGFjdHVhbDogdW5rbm93biwgY29uZGl0aW9uOiBDb25kaXRpb24pOiBib29sZWFuIHtcclxuICAgIGNvbnN0IG9wID0gKGNvbmRpdGlvbi5vcGVyYXRvciB8fCBcIlwiKS50b0xvd2VyQ2FzZSgpIGFzIE9wZXJhdG9yO1xyXG4gICAgY29uc3QgdmFsID0gKGNvbmRpdGlvbiBhcyB7IHZhbHVlPzogdW5rbm93biB9KS52YWx1ZTtcclxuXHJcbiAgICBzd2l0Y2ggKG9wKSB7XHJcbiAgICAgICAgY2FzZSBcImVxXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBlcXVhbHNTbWFydChhY3R1YWwsIHZhbCk7XHJcbiAgICAgICAgY2FzZSBcIm5lXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhZXF1YWxzU21hcnQoYWN0dWFsLCB2YWwpO1xyXG4gICAgICAgIGNhc2UgXCJpblwiOlxyXG4gICAgICAgICAgICByZXR1cm4gaW5TbWFydChhY3R1YWwsIHZhbCk7XHJcbiAgICAgICAgY2FzZSBcImlzbnVsbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gaXNOdWxsaXNoT3JFbXB0eShhY3R1YWwpO1xyXG4gICAgICAgIGNhc2UgXCJpc25vdG51bGxcIjpcclxuICAgICAgICBjYXNlIFwibm90bnVsbFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gIWlzTnVsbGlzaE9yRW1wdHkoYWN0dWFsKTtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGVxdWFsc1NtYXJ0KGE6IHVua25vd24sIGI6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUoYSkpIHtcclxuICAgICAgICBpZiAoYiA9PSBudWxsKSByZXR1cm4gaXNOdWxsaXNoT3JFbXB0eShhKTtcclxuICAgICAgICBpZiAodHlwZW9mIGIgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbChiKTtcclxuICAgICAgICAgICAgaWYgKGcpIHJldHVybiAoYS5pZCA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBnOyAvLyBHVUlEID8gY29tcGFyZSBJRFxyXG4gICAgICAgICAgICByZXR1cm4gKGEubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBiLnRvTG93ZXJDYXNlKCk7IC8vIGVsc2UgY29tcGFyZSBuYW1lXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUoYikpIHtcclxuICAgICAgICAgICAgaWYgKGEuaWQgJiYgYi5pZCkgcmV0dXJuIGEuaWQudG9Mb3dlckNhc2UoKSA9PT0gYi5pZC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICByZXR1cm4gKGEubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSAoYi5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhKSAmJiBBcnJheS5pc0FycmF5KGIpKSB7XHJcbiAgICAgICAgaWYgKGEubGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGFzID0gbmV3IFNldChhLm1hcCgoeCkgPT4gbm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICAgICAgcmV0dXJuIGIuZXZlcnkoKHgpID0+IGFzLmhhcyhub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBuYSA9IE51bWJlcihhKTtcclxuICAgIGNvbnN0IG5iID0gTnVtYmVyKGIpO1xyXG4gICAgaWYgKCFOdW1iZXIuaXNOYU4obmEpICYmICFOdW1iZXIuaXNOYU4obmIpKSByZXR1cm4gbmEgPT09IG5iO1xyXG5cclxuICAgIGlmICh0eXBlb2YgYSA9PT0gXCJib29sZWFuXCIgfHwgdHlwZW9mIGIgPT09IFwiYm9vbGVhblwiKSB7XHJcbiAgICAgICAgcmV0dXJuIFN0cmluZyhhKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gU3RyaW5nKGEgPz8gXCJcIikudG9Mb3dlckNhc2UoKSA9PT0gU3RyaW5nKGIgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaW5TbWFydChhY3R1YWw6IHVua25vd24sIGNhbmRpZGF0ZUxpc3Q6IHVua25vd24pOiBib29sZWFuIHtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShjYW5kaWRhdGVMaXN0KSkgcmV0dXJuIGVxdWFsc1NtYXJ0KGFjdHVhbCwgY2FuZGlkYXRlTGlzdCk7XHJcblxyXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYWN0dWFsKSkge1xyXG4gICAgICAgIGNvbnN0IGNhbmQgPSBuZXcgU2V0KGNhbmRpZGF0ZUxpc3QubWFwKCh4KSA9PiBub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgICAgICByZXR1cm4gYWN0dWFsLnNvbWUoKHgpID0+IGNhbmQuaGFzKG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChpc0xvb2t1cENvbXBhcmFibGUoYWN0dWFsKSkge1xyXG4gICAgICAgIGNvbnN0IGlkID0gKGFjdHVhbC5pZCA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSAoYWN0dWFsLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBmb3IgKGNvbnN0IHYgb2YgY2FuZGlkYXRlTGlzdCkge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIHYgPT09IFwic3RyaW5nXCIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSB0b0d1aWRPck51bGwodik7XHJcbiAgICAgICAgICAgICAgICBpZiAoKGcgJiYgaWQgPT09IGcpIHx8ICghZyAmJiBuYW1lID09PSB2LnRvTG93ZXJDYXNlKCkpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpc0xvb2t1cENvbXBhcmFibGUodikpIHtcclxuICAgICAgICAgICAgICAgIGlmICgodi5pZCAmJiBpZCA9PT0gdi5pZC50b0xvd2VyQ2FzZSgpKSB8fCAodi5uYW1lICYmIG5hbWUgPT09IHYubmFtZS50b0xvd2VyQ2FzZSgpKSkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXF1YWxzU21hcnQoYWN0dWFsLCB2KSkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBjYW5kaWRhdGVMaXN0LnNvbWUoKHYpID0+IGVxdWFsc1NtYXJ0KGFjdHVhbCwgdikpO1xyXG59Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9