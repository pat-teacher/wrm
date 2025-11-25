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
/* harmony export */   FieldValidator: () => (/* binding */ FieldValidator),
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
class FieldValidator {
    /**
     * Validates a numeric text field with a maximum of 12 digits.
     * Can be used for OnChange events and optionally receives the attribute name as a parameter.
     */
    static validateBigNumber(executionContext, attributeName) {
        const formContext = executionContext.getFormContext();
        // If no attribute name is provided → use event source
        if (!attributeName) {
            const eventSource = executionContext.getEventSource();
            if (!eventSource)
                return;
            attributeName = eventSource.getName();
        }
        const attribute = formContext.getAttribute(attributeName);
        const control = formContext.getControl(attributeName);
        if (!attribute || !control)
            return;
        const notificationId = `${attributeName}_BigNumberError`;
        let value = attribute.getValue();
        // If the field is truly empty (null) → clear error and exit
        if (value === null) {
            control.clearNotification(notificationId);
            return;
        }
        // Keep original string, but work on a copy
        const raw = value.toString();
        // If the user entered only whitespace → treat as invalid
        if (raw.trim().length === 0) {
            attribute.setValue(null);
            control.setNotification("Please enter a numeric value with a maximum of 12 digits.", notificationId);
            return;
        }
        // Remove all whitespace for validation / storage
        const digitsOnly = raw.replace(/\s+/g, "");
        // Validation: only digits, max. 12 characters
        const isValid = /^\d{1,12}$/.test(digitsOnly);
        if (!isValid) {
            attribute.setValue(null);
            control.setNotification("Please enter a numeric value with a maximum of 12 digits.", notificationId);
            return;
        }
        // Valid → clear notification and store raw value without spaces
        control.clearNotification(notificationId);
        attribute.setValue(digitsOnly);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jcm0uY29yZS50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NvbmRpdGlvbi5ldmFsdWF0b3IudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gPT09PSBGb3JtVHlwZSBDb25zdGFudHMgPT09PVxyXG5leHBvcnQgY29uc3QgRk9STV9UWVBFID0ge1xyXG4gICAgVW5kZWZpbmVkOiAwLFxyXG4gICAgQ3JlYXRlOiAxLFxyXG4gICAgVXBkYXRlOiAyLFxyXG4gICAgUmVhZE9ubHk6IDMsXHJcbiAgICBEaXNhYmxlZDogNCxcclxuICAgIFF1aWNrQ3JlYXRlOiA1LFxyXG4gICAgQnVsa0VkaXQ6IDYsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgdHlwZSBGb3JtVHlwZSA9IHR5cGVvZiBGT1JNX1RZUEVba2V5b2YgdHlwZW9mIEZPUk1fVFlQRV07XHJcblxyXG5leHBvcnQgY29uc3QgRm9ybVR5cGVIZWxwZXIgPSB7XHJcbiAgICBnZXQoZmM6IGFueSk6IEZvcm1UeXBlIHwgMCB7XHJcbiAgICAgICAgcmV0dXJuIGZjPy51aT8uZ2V0Rm9ybVR5cGU/LigpID8/IEZPUk1fVFlQRS5VbmRlZmluZWQ7XHJcbiAgICB9LFxyXG4gICAgaXNDcmVhdGVMaWtlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfSxcclxuICAgIGlzRWRpdGFibGUodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuVXBkYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3duZXJSZWYge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiIHwgXCJ0ZWFtXCI7XHJcbiAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBUeXBlcyBzaGFyZWQgYWNyb3NzIGVuZ2luZSAmIGVudGl0aWVzIC0tLS1cclxuZXhwb3J0IHR5cGUgT3BlcmF0b3IgPSBcImVxXCIgfCBcIm5lXCIgfCBcImluXCIgfCBcImlzbnVsbFwiIHwgXCJpc25vdG51bGxcIiB8IFwibm90bnVsbFwiOyAvLyBhbGlhc1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xyXG4gICAgLyoqIExvZ2ljYWwgbmFtZSAoc3VwcG9ydHMgZG90LW5vdGF0aW9uIGZvciBsb29rdXAgcHJvamVjdGlvbnM6IGUuZy4sIFwicHJpbWFyeWNvbnRhY3RpZC5uYW1lXCIpLiAqL1xyXG4gICAgZmllbGQ6IHN0cmluZztcclxuICAgIG9wZXJhdG9yOiBPcGVyYXRvcjtcclxuICAgIC8qKiBPcHRpb25hbCB2YWx1ZSBmb3IgY29tcGFyaXNvbnMgKG9taXR0ZWQgZm9yIG51bGwtb3BlcmF0b3JzKS4gKi9cclxuICAgIHZhbHVlPzogdW5rbm93bjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSdWxlIHtcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk/OiBzdHJpbmdbXTtcclxuICAgIGNvbmRpdGlvbj86IENvbmRpdGlvbltdOyAvLyBBTkQtY29uanVuY3Rpb247IGVtcHR5L3VuZGVmaW5lZCDih5IgcnVsZSBhbHdheXMgbWF0Y2hlc1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNvbmZpZyB7XHJcbiAgICBkZWZhdWx0Pzogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbi8qKiBMaWdodHdlaWdodCBjb21wYXJhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9va3VwICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICBpZDogc3RyaW5nIHwgbnVsbDtcclxuICAgIG5hbWU6IHN0cmluZyB8IG51bGw7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIENvcmUgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5Ycm07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIExvd2VyY2FzZSwgc3RyaXAgYnJhY2VzOyByZXR1cm5zIGVtcHR5IHN0cmluZyBpZiBmYWxzeSBpbnB1dC4gKi9cclxuICAgIHN0YXRpYyBzYW5pdGl6ZUd1aWQoaWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bmlxdWU8VD4oYXJyOiBUW10pOiBUW10ge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVGhpbiBXZWIgQVBJIHdyYXBwZXIgLS0tLVxyXG5leHBvcnQgY2xhc3MgQXBpQ2xpZW50IHtcclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBjbGVhbklkID0gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWUsIGNsZWFuSWQsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hYbWwoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgZmV0Y2hYbWw6IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGA/ZmV0Y2hYbWw9JHtlbmNvZGVVUklDb21wb25lbnQoZmV0Y2hYbWwudHJpbSgpKX1gO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGV4ZWN1dGUocmVxdWVzdDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgcGFyZW50RW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudElkOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRpb25zaGlwU2NoZW1hTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZElkczogc3RyaW5nW11cclxuICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHJlcSA9IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiB7IGVudGl0eVR5cGU6IHBhcmVudEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChwYXJlbnRJZCkgfSxcclxuICAgICAgICAgICAgcmVsYXRlZEVudGl0aWVzOiByZWxhdGVkSWRzLm1hcCgocmlkKSA9PiAoeyBlbnRpdHlUeXBlOiByZWxhdGVkRW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHJpZCkgfSkpLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXA6IHJlbGF0aW9uc2hpcFNjaGVtYU5hbWUsXHJcbiAgICAgICAgICAgIGdldE1ldGFkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBib3VuZFBhcmFtZXRlcjogbnVsbCwgcGFyYW1ldGVyVHlwZXM6IHt9LCBvcGVyYXRpb25UeXBlOiAyLCBvcGVyYXRpb25OYW1lOiBcIkFzc29jaWF0ZVwiIH07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBGb3JtIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgRm9ybUNvbnRyb2xIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldEN1cnJlbnRJZChmYzogYW55KTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWRSYXcgPSBmYz8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJhdyA/IFV0aWwuc2FuaXRpemVHdWlkKGlkUmF3KSA6IG51bGw7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERpc2FibGUgb3IgZW5hYmxlIGFsbCBkaXNhYmxlYWJsZSBjb250cm9scyBpbnNpZGUgYSB0YWIgc2VjdGlvbiAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkQWxsQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2w6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsOiBzcGVjaWFsIGhhbmRsaW5nIGZvciBzdWJncmlkcywgd2hpY2ggZG8gbm90IHN1cHBvcnQgc2V0RGlzYWJsZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAvKiogICBcclxuICAgKiBkZS9hY3RpdmF0ZSBvbmx5IHRoZSBzcGVjaWZpZWQgY29udHJvbHMgKGJ5IG5hbWUpIGluIGEgc2VjdGlvbi4gICBcclxuICAgKiBEb2VzIG5vdGhpbmcgaWYgdGhlIGxpc3QgaXMgZW1wdHkgb3IgY29udHJvbHMgYXJlIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBjb250cm9sTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRyb2xOYW1lcykgfHwgY29udHJvbE5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250cm9sTmFtZXNcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuZmluZENvbnRyb2xJblNlY3Rpb24oc2VjdGlvbiwgbmFtZSkpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGMpOiBjIGlzIFhybS5Db250cm9scy5Db250cm9sID0+IEJvb2xlYW4oYykpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChjb250cm9sKSA9PiBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sLCBkaXNhYmxlZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRDb250cm9sSW5TZWN0aW9uKFxyXG4gICAgICAgIHNlY3Rpb246IFhybS5Db250cm9scy5TZWN0aW9uLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgKTogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIC8vIHByaW1hcnk6IGRpcmVjdCBwZXIgTmFtZVxyXG4gICAgICAgIGNvbnN0IGRpcmVjdCA9IHNlY3Rpb24uY29udHJvbHMuZ2V0Py4obmFtZSk7XHJcbiAgICAgICAgaWYgKGRpcmVjdCkgcmV0dXJuIGRpcmVjdDtcclxuXHJcbiAgICAgICAgLy8gRmFsbGJhY2s6IHNlYXJjaCBieSBnZXROYW1lKCkgb3ZlciB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgIGxldCBmb3VuZDogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjLmdldE5hbWU/LigpID09PSBuYW1lKSBmb3VuZCA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sLCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2UgaWYgZGlmZmVyZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjb250cm9sLmdldERpc2FibGVkPy4oKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSBcImJvb2xlYW5cIiAmJiBjdXJyZW50ID09PSBkaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgLyogbm8tb3AgKi9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdyaWQucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVmlzaWJpbGl0eSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGEgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGRpc2FibGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXREaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgcmVxdWlyZWQgbGV2ZWwgb24gYW4gYXR0cmlidXRlL2NvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF0dHIuc2V0UmVxdWlyZWRMZXZlbChpc1JlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWYoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgcHJlZGljYXRlOiAoKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdyA9ICEhcHJlZGljYXRlKCk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBjb250cm9sTmFtZSwgc2hvdyk7XHJcbiAgICAgICAgcmV0dXJuIHNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZkxvb2t1cEVxdWFscyhmYzogYW55LCBsb29rdXBBdHRyOiBzdHJpbmcsIHRhcmdldElkOiBzdHJpbmcsIGNvbnRyb2xOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gVmlzaWJpbGl0eUhlbHBlci5zaG93SWYoZmMsIGNvbnRyb2xOYW1lLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogVHlwZSBndWFyZDogY29udHJvbCBzdXBwb3J0cyBzZXREaXNhYmxlZCAqL1xyXG4gICAgc3RhdGljIGlzRGlzYWJsZWFibGUoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wpOiBjb250cm9sIGlzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wge1xyXG4gICAgICAgIHJldHVybiBcInNldERpc2FibGVkXCIgaW4gY29udHJvbCAmJiB0eXBlb2YgKGNvbnRyb2wgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCkuc2V0RGlzYWJsZWQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGb3JtV2FpdCB7XHJcbiAgICBzdGF0aWMgd2FpdEZvckxvb2t1cFZhbHVlKGZjOiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgdGltZW91dE1zID0gNjAwMCk6IFByb21pc2U8WHJtLkxvb2t1cFZhbHVlIHwgbnVsbD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFhdHRyKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgIGlmIChub3c/LmlkKSByZXR1cm4gcmVzb2x2ZShub3cpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHsgdHJ5IHsgYXR0ci5yZW1vdmVPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9IH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHY/LmlkKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUodik7IH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7IGF0dHIuYWRkT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KG9uQ2hhbmdlLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBpZiAoIWRvbmUpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZShudWxsKTsgfSB9LCB0aW1lb3V0TXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT3duZXJIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldE93bmVyQXR0cmlidXRlKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIChmYz8uZ2V0QXR0cmlidXRlPy4ob3duZXJBdHRyTmFtZSkgPz8gbnVsbCkgYXMgYW55O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRDdXJyZW50T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogT3duZXJSZWYgfCBudWxsIHtcclxuICAgICAgICBjb25zdCB2ID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk/LmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgIGlmICghdj8uaWQgfHwgIXYuZW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHsgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHYuaWQpLCBlbnRpdHlUeXBlOiB2LmVudGl0eVR5cGUgYXMgYW55LCBuYW1lOiB2Lm5hbWUgPz8gbnVsbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzZXRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcsIG93bmVyOiBPd25lclJlZik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgICAgICBpZiAoIWF0dHIpIHJldHVybjtcclxuICAgICAgICBhdHRyLnNldFZhbHVlKFt7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChvd25lci5pZCksXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IG93bmVyLmVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IG93bmVyLm5hbWUgPz8gdW5kZWZpbmVkXHJcbiAgICAgICAgfSBhcyBhbnldKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaXNTYW1lT3duZXIoYT86IE93bmVyUmVmIHwgbnVsbCwgYj86IE93bmVyUmVmIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBhLmVudGl0eVR5cGUgPT09IGIuZW50aXR5VHlwZSAmJiBVdGlsLnNhbml0aXplR3VpZChhLmlkKSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQoYi5pZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmljIHNlcnZpY2U6IExvYWQgb3duZXIgKFVzZXIgb3IgVGVhbSkgZm9yIGFueSByZWNvcmQgKi9cclxuZXhwb3J0IGNsYXNzIE93bmVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0T3duZXJSZWYoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlY29yZElkOiBzdHJpbmcsXHJcbiAgICAgICAgb3duZXJBdHRyTmFtZSA9IFwib3duZXJpZFwiXHJcbiAgICApOiBQcm9taXNlPE93bmVyUmVmIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocmVjb3JkSWQpO1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyBGb3IgcG9seW1vcnBoaWMgb3duZXIgbG9va3VwcywgZXhwYW5kIGRlZGljYXRlZCBuYXYgcHJvcHMgdG8gYXZvaWQgcHJvcGVydHktbm90LWZvdW5kIGVycm9yc1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZCA9IGA/JHNlbGVjdD0ke293bmVyQXR0ck5hbWV9JiRleHBhbmQ9b3duaW5ndXNlcigkc2VsZWN0PXN5c3RlbXVzZXJpZCxmdWxsbmFtZSksb3duaW5ndGVhbSgkc2VsZWN0PXRlYW1pZCxuYW1lKWA7XHJcbiAgICAgICAgY29uc3QgcmVjID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWwsIGlkLCBleHBhbmQpO1xyXG5cclxuICAgICAgICBjb25zdCB1c2VyID0gcmVjPy5bXCJvd25pbmd1c2VyXCJdO1xyXG4gICAgICAgIGlmICh1c2VyPy5zeXN0ZW11c2VyaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh1c2VyLnN5c3RlbXVzZXJpZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIuZnVsbG5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVhbSA9IHJlYz8uW1wib3duaW5ndGVhbVwiXTtcclxuICAgICAgICBpZiAodGVhbT8udGVhbWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodGVhbS50ZWFtaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJ0ZWFtXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWFtLm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBTZWN1cml0eS1yZWxhdGVkIGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5U2VydmljZSB7XHJcbiAgICAgICAgLyoqIFJldHVybnMgY3VycmVudCB1c2VyIGlkIGZyb20gWHJtIGNvbnRleHQgKi9cclxuICAgICAgICBzdGF0aWMgZ2V0Q3VycmVudFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5Ycm0/LlV0aWxpdHk/LmdldEdsb2JhbENvbnRleHQ/LigpPy51c2VyU2V0dGluZ3M/LnVzZXJJZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJucyByb2xlIG5hbWVzIG9mIHRoZSBjdXJyZW50IHVzZXIgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgZ2V0Q3VycmVudFVzZXJSb2xlcygpOiBQcm9taXNlPHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRDdXJyZW50VXNlcklkKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZCkgcmV0dXJuIFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZldGNoWE1MIG92ZXIgc3lzdGVtdXNlcnJvbGVzIChOOk4pIHRvIHJvbGVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICAgICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJyb2xlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cInJvbGVpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJyb2xlc1wiIGZyb209XCJyb2xlaWRcIiB0bz1cInJvbGVpZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlclwiIGZyb209XCJzeXN0ZW11c2VyaWRcIiB0bz1cInN5c3RlbXVzZXJpZFwiIGFsaWFzPVwidVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHt1c2VySWR9XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LmZldGNoWG1sKFwicm9sZVwiLCBmZXRjaFhtbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHJlcy5lbnRpdGllcyB8fCBbXSkubWFwKChlKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoZVtcInJvbGVpZFwiXSA/PyBlW1wiX3JvbGVpZF92YWx1ZVwiXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVbXCJuYW1lXCJdIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgIH0pKS5maWx0ZXIociA9PiAhIXIuaWQgJiYgISFyLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoZWNrcyBpZiBjdXJyZW50IHVzZXIgaGFzIG9uZSBvZiB0aGUgcHJvdmlkZWQgcm9sZSBuYW1lcyAoY2FzZS1pbnNlbnNpdGl2ZSkgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgaGFzQ3VycmVudFVzZXJSb2xlKC4uLnJvbGVOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdhbnRlZCA9IG5ldyBTZXQocm9sZU5hbWVzLm1hcChuID0+IG4udHJpbSgpLnRvTG93ZXJDYXNlKCkpLmZpbHRlcihCb29sZWFuKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2FudGVkLnNpemUgPT09IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50VXNlclJvbGVzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9sZXMuc29tZShyID0+IHdhbnRlZC5oYXMoci5uYW1lLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGNvbnRyb2wgdmlldyBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFZpZXdIZWxwZXIge1xyXG4gICAgLyoqIFJlc3RyaWN0IGEgbG9va3VwIGNvbnRyb2wgdG8gc3BlY2lmaWMgZW50aXR5IHR5cGVzICovXHJcbiAgICBzdGF0aWMgc2V0RW50aXR5VHlwZXMoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZywgZW50aXR5VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGN0cmw/LnNldEVudGl0eVR5cGVzPy4oZW50aXR5VHlwZXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGQgYSBjdXN0b20gdmlldyB0byBhIGxvb2t1cCBjb250cm9sICovXHJcbiAgICBzdGF0aWMgYWRkQ3VzdG9tVmlldyhcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIGNvbnRyb2xOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZW50aXR5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdEaXNwbGF5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGZldGNoWG1sOiBzdHJpbmcsXHJcbiAgICAgICAgbGF5b3V0WG1sOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0QXNEZWZhdWx0OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghY3RybD8uYWRkQ3VzdG9tVmlldykgcmV0dXJuO1xyXG4gICAgICAgICAgICBjdHJsLmFkZEN1c3RvbVZpZXcodmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLnRyaW0oKSwgbGF5b3V0WG1sLnRyaW0oKSwgc2V0QXNEZWZhdWx0KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkcyBhIGN1c3RvbSB2aWV3IGZvciBvd25lciBsb29rdXAgdG8gc2hvdyBvbmx5IHRlYW1zIHRoZSBjdXJyZW50IHVzZXIgYmVsb25ncyB0by4gKi9cclxuICAgIHN0YXRpYyBhZGRPd25lclRlYW1WaWV3Rm9yQ3VycmVudFVzZXIoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZyA9IFwib3duZXJpZFwiKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZW50aXR5TmFtZSA9IFwidGVhbVwiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdEaXNwbGF5TmFtZSA9IFwiT3duZXJUZWFtTG9va3VwVmlld1wiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJZCA9IFwiezAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMX1cIjtcclxuXHJcbiAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgIDxmZXRjaD5cclxuICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInRlYW1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJidXNpbmVzc3VuaXRpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJuZXZfb3duZXJ0ZWFtMnN5c3RlbXVzZXJcIiBmcm9tPVwidGVhbWlkXCIgdG89XCJ0ZWFtaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXEtdXNlcmlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICA8L2ZldGNoPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxheW91dFhtbCA9IGBcclxuICAgICAgICAgICAgPGdyaWQgbmFtZT0ncmVzdWx0c2V0JyBvYmplY3Q9JzEnIGp1bXA9J3RlYW1pZCcgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cclxuICAgICAgICAgICAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0ndGVhbWlkJz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSduYW1lJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J2J1c2luZXNzdW5pdGlkJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgPC9yb3c+XHJcbiAgICAgICAgICAgIDwvZ3JpZD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLmFkZEN1c3RvbVZpZXcoZmMsIGNvbnRyb2xOYW1lLCB2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwsIGxheW91dFhtbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWVsZFZhbGlkYXRvciB7XHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlcyBhIG51bWVyaWMgdGV4dCBmaWVsZCB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXHJcbiAgICAgKiBDYW4gYmUgdXNlZCBmb3IgT25DaGFuZ2UgZXZlbnRzIGFuZCBvcHRpb25hbGx5IHJlY2VpdmVzIHRoZSBhdHRyaWJ1dGUgbmFtZSBhcyBhIHBhcmFtZXRlci5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHZhbGlkYXRlQmlnTnVtYmVyKFxyXG4gICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0LFxyXG4gICAgICAgIGF0dHJpYnV0ZU5hbWU/OiBzdHJpbmdcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpIGFzIFhybS5Gb3JtQ29udGV4dDtcclxuXHJcbiAgICAgICAgLy8gSWYgbm8gYXR0cmlidXRlIG5hbWUgaXMgcHJvdmlkZWQg4oaSIHVzZSBldmVudCBzb3VyY2VcclxuICAgICAgICBpZiAoIWF0dHJpYnV0ZU5hbWUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRTb3VyY2UgPSBleGVjdXRpb25Db250ZXh0LmdldEV2ZW50U291cmNlKCkgYXMgWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50U291cmNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPSBldmVudFNvdXJjZS5nZXROYW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XHJcbiAgICAgICAgY29uc3QgY29udHJvbCA9IGZvcm1Db250ZXh0LmdldENvbnRyb2woYXR0cmlidXRlTmFtZSkgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbDtcclxuXHJcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGUgfHwgIWNvbnRyb2wpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uSWQgPSBgJHthdHRyaWJ1dGVOYW1lfV9CaWdOdW1iZXJFcnJvcmA7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gYXR0cmlidXRlLmdldFZhbHVlKCkgYXMgc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGZpZWxkIGlzIHRydWx5IGVtcHR5IChudWxsKSDihpIgY2xlYXIgZXJyb3IgYW5kIGV4aXRcclxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbihub3RpZmljYXRpb25JZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEtlZXAgb3JpZ2luYWwgc3RyaW5nLCBidXQgd29yayBvbiBhIGNvcHlcclxuICAgICAgICBjb25zdCByYXcgPSB2YWx1ZS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdXNlciBlbnRlcmVkIG9ubHkgd2hpdGVzcGFjZSDihpIgdHJlYXQgYXMgaW52YWxpZFxyXG4gICAgICAgIGlmIChyYXcudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0Tm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgYSBudW1lcmljIHZhbHVlIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cIixcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgd2hpdGVzcGFjZSBmb3IgdmFsaWRhdGlvbiAvIHN0b3JhZ2VcclxuICAgICAgICBjb25zdCBkaWdpdHNPbmx5ID0gcmF3LnJlcGxhY2UoL1xccysvZywgXCJcIik7XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRpb246IG9ubHkgZGlnaXRzLCBtYXguIDEyIGNoYXJhY3RlcnNcclxuICAgICAgICBjb25zdCBpc1ZhbGlkID0gL15cXGR7MSwxMn0kLy50ZXN0KGRpZ2l0c09ubHkpO1xyXG5cclxuICAgICAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIGEgbnVtZXJpYyB2YWx1ZSB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXCIsXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWYWxpZCDihpIgY2xlYXIgbm90aWZpY2F0aW9uIGFuZCBzdG9yZSByYXcgdmFsdWUgd2l0aG91dCBzcGFjZXNcclxuICAgICAgICBjb250cm9sLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbklkKTtcclxuICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUoZGlnaXRzT25seSk7XHJcbiAgICB9XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBDb25kaXRpb24sIExvb2t1cENvbXBhcmFibGUsIE9wZXJhdG9yLCBVdGlsIH0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbmZ1bmN0aW9uIGlzTXVsdGlTZWxlY3RBcnJheSh2YWx1ZTogdW5rbm93bik6IHZhbHVlIGlzIEFycmF5PG51bWJlciB8IHN0cmluZz4ge1xyXG4gICAgcmV0dXJuIEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmV2ZXJ5KCh2KSA9PiB0eXBlb2YgdiA9PT0gXCJudW1iZXJcIiB8fCB0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIik7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTG9va3VwQ29tcGFyYWJsZSh2OiB1bmtub3duKTogdiBpcyBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIHJldHVybiAhIXYgJiYgdHlwZW9mIHYgPT09IFwib2JqZWN0XCIgJiYgKFwiaWRcIiBpbiAodiBhcyBhbnkpIHx8IFwibmFtZVwiIGluICh2IGFzIGFueSkgfHwgXCJlbnRpdHlUeXBlXCIgaW4gKHYgYXMgYW55KSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHRvR3VpZE9yTnVsbCh2YWx1ZTogdW5rbm93bik6IHN0cmluZyB8IG51bGwge1xyXG4gICAgY29uc3QgcyA9IFN0cmluZyh2YWx1ZSA/PyBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICByZXR1cm4gL15bMC05YS1mXXs4fS1bMC05YS1mXXs0fS1bMC05YS1mXXs0fS1bMC05YS1mXXs0fS1bMC05YS1mXXsxMn0kLy50ZXN0KHMpID8gcyA6IG51bGw7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzTnVsbGlzaE9yRW1wdHkodjogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKHYgPT0gbnVsbCkgcmV0dXJuIHRydWU7XHJcbiAgICBpZiAodHlwZW9mIHYgPT09IFwic3RyaW5nXCIpIHJldHVybiB2LnRyaW0oKSA9PT0gXCJcIjtcclxuICAgIGlmIChBcnJheS5pc0FycmF5KHYpKSByZXR1cm4gdi5sZW5ndGggPT09IDA7XHJcbiAgICBpZiAoaXNMb29rdXBDb21wYXJhYmxlKHYpKSByZXR1cm4gIXYuaWQgJiYgIXYubmFtZTsgLy8gYm90aCBlbXB0eVxyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVTY2FsYXIoeDogdW5rbm93bik6IHN0cmluZyB7XHJcbiAgICBjb25zdCBnID0gdG9HdWlkT3JOdWxsKHgpO1xyXG4gICAgaWYgKGcpIHJldHVybiBgZ3VpZDoke2d9YDtcclxuICAgIGNvbnN0IG4gPSBOdW1iZXIoeCk7XHJcbiAgICBpZiAoIU51bWJlci5pc05hTihuKSkgcmV0dXJuIGBudW06JHtufWA7XHJcbiAgICBpZiAodHlwZW9mIHggPT09IFwiYm9vbGVhblwiKSByZXR1cm4gYGJvb2w6JHt4fWA7XHJcbiAgICByZXR1cm4gYHN0cjoke1N0cmluZyh4ID8/IFwiXCIpLnRvTG93ZXJDYXNlKCl9YDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzTG9va3VwQXJyYXkodmFsdWU6IHVua25vd24pOiB2YWx1ZSBpcyBYcm0uTG9va3VwVmFsdWVbXSB7XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpICYmXHJcbiAgICAgICAgdmFsdWUubGVuZ3RoID4gMCAmJlxyXG4gICAgICAgIHR5cGVvZiB2YWx1ZVswXSA9PT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgIHZhbHVlWzBdICE9PSBudWxsICYmXHJcbiAgICAgICAgXCJpZFwiIGluICh2YWx1ZVswXSBhcyBvYmplY3QpICYmXHJcbiAgICAgICAgdHlwZW9mICh2YWx1ZVswXSBhcyBYcm0uTG9va3VwVmFsdWUpLmlkID09PSBcInN0cmluZ1wiXHJcbiAgICApO1xyXG59XHJcbi8qKiBSZWFkIGEgdmFsdWUgZnJvbSB0aGUgZm9ybTsgc3VwcG9ydHMgbG9va3VwIHByb2plY3Rpb25zIHZpYSBkb3Qtbm90YXRpb24uICovXHJcbmV4cG9ydCBmdW5jdGlvbiByZWFkQXR0cmlidXRlVmFsdWUoZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCwgZmllbGRQYXRoOiBzdHJpbmcpOiB1bmtub3duIHtcclxuICAgIGNvbnN0IFtsb2dpY2FsTmFtZSwgcHJvamVjdGlvbl0gPSBmaWVsZFBhdGguc3BsaXQoXCIuXCIsIDIpO1xyXG4gICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGxvZ2ljYWxOYW1lKTtcclxuICAgIGlmICghYXR0cmlidXRlIHx8IHR5cGVvZiBhdHRyaWJ1dGUuZ2V0VmFsdWUgIT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCByYXcgPSBhdHRyaWJ1dGUuZ2V0VmFsdWUoKTtcclxuXHJcbiAgICAvLyBMb29rdXAgLyBQYXJ0eWxpc3RcclxuICAgIGlmIChpc0xvb2t1cEFycmF5KHJhdykpIHtcclxuICAgICAgICBjb25zdCBsdiA9IHJhd1swXSBhcyBYcm0uTG9va3VwVmFsdWUgJiB7IGVudGl0eVR5cGU/OiBzdHJpbmcgfTtcclxuICAgICAgICBjb25zdCBvYmo6IExvb2t1cENvbXBhcmFibGUgPSB7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChsdi5pZCksXHJcbiAgICAgICAgICAgIG5hbWU6IGx2Lm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTogbHYuZW50aXR5VHlwZSA/PyBudWxsLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChwcm9qZWN0aW9uKSB7XHJcbiAgICAgICAgICAgIHN3aXRjaCAocHJvamVjdGlvbi50b0xvd2VyQ2FzZSgpKSB7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiaWRcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmlkO1xyXG4gICAgICAgICAgICAgICAgY2FzZSBcIm5hbWVcIjpcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gb2JqLm5hbWU7XHJcbiAgICAgICAgICAgICAgICBjYXNlIFwiZW50aXR5dHlwZVwiOlxyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouZW50aXR5VHlwZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9iajtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gb2JqOyAvLyBkZWZhdWx0OiBvYmplY3RcclxuICAgIH1cclxuXHJcbiAgICAvLyBNdWx0aS1TZWxlY3QgT3B0aW9uU2V0XHJcbiAgICBpZiAoaXNNdWx0aVNlbGVjdEFycmF5KHJhdykpIHJldHVybiByYXc7XHJcblxyXG4gICAgLy8gUHJpbWl0aXZlXHJcbiAgICByZXR1cm4gcmF3IGFzIHVua25vd247XHJcbn1cclxuXHJcbi8qKiBFdmFsdWF0ZSBzaW5nbGUgY29uZGl0aW9uIGFnYWluc3QgYWN0dWFsIHZhbHVlLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gZXZhbHVhdGVDb25kaXRpb24oYWN0dWFsOiB1bmtub3duLCBjb25kaXRpb246IENvbmRpdGlvbik6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgb3AgPSAoY29uZGl0aW9uLm9wZXJhdG9yIHx8IFwiXCIpLnRvTG93ZXJDYXNlKCkgYXMgT3BlcmF0b3I7XHJcbiAgICBjb25zdCB2YWwgPSAoY29uZGl0aW9uIGFzIHsgdmFsdWU/OiB1bmtub3duIH0pLnZhbHVlO1xyXG5cclxuICAgIHN3aXRjaCAob3ApIHtcclxuICAgICAgICBjYXNlIFwiZXFcIjpcclxuICAgICAgICAgICAgcmV0dXJuIGVxdWFsc1NtYXJ0KGFjdHVhbCwgdmFsKTtcclxuICAgICAgICBjYXNlIFwibmVcIjpcclxuICAgICAgICAgICAgcmV0dXJuICFlcXVhbHNTbWFydChhY3R1YWwsIHZhbCk7XHJcbiAgICAgICAgY2FzZSBcImluXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBpblNtYXJ0KGFjdHVhbCwgdmFsKTtcclxuICAgICAgICBjYXNlIFwiaXNudWxsXCI6XHJcbiAgICAgICAgICAgIHJldHVybiBpc051bGxpc2hPckVtcHR5KGFjdHVhbCk7XHJcbiAgICAgICAgY2FzZSBcImlzbm90bnVsbFwiOlxyXG4gICAgICAgIGNhc2UgXCJub3RudWxsXCI6XHJcbiAgICAgICAgICAgIHJldHVybiAhaXNOdWxsaXNoT3JFbXB0eShhY3R1YWwpO1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gZXF1YWxzU21hcnQoYTogdW5rbm93biwgYjogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShhKSkge1xyXG4gICAgICAgIGlmIChiID09IG51bGwpIHJldHVybiBpc051bGxpc2hPckVtcHR5KGEpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICBjb25zdCBnID0gdG9HdWlkT3JOdWxsKGIpO1xyXG4gICAgICAgICAgICBpZiAoZykgcmV0dXJuIChhLmlkID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IGc7IC8vIEdVSUQgPyBjb21wYXJlIElEXHJcbiAgICAgICAgICAgIHJldHVybiAoYS5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IGIudG9Mb3dlckNhc2UoKTsgLy8gZWxzZSBjb21wYXJlIG5hbWVcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShiKSkge1xyXG4gICAgICAgICAgICBpZiAoYS5pZCAmJiBiLmlkKSByZXR1cm4gYS5pZC50b0xvd2VyQ2FzZSgpID09PSBiLmlkLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICAgIHJldHVybiAoYS5uYW1lID8/IFwiXCIpLnRvTG93ZXJDYXNlKCkgPT09IChiLm5hbWUgPz8gXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChBcnJheS5pc0FycmF5KGEpICYmIEFycmF5LmlzQXJyYXkoYikpIHtcclxuICAgICAgICBpZiAoYS5sZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgY29uc3QgYXMgPSBuZXcgU2V0KGEubWFwKCh4KSA9PiBub3JtYWxpemVTY2FsYXIoeCkpKTtcclxuICAgICAgICByZXR1cm4gYi5ldmVyeSgoeCkgPT4gYXMuaGFzKG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG5hID0gTnVtYmVyKGEpO1xyXG4gICAgY29uc3QgbmIgPSBOdW1iZXIoYik7XHJcbiAgICBpZiAoIU51bWJlci5pc05hTihuYSkgJiYgIU51bWJlci5pc05hTihuYikpIHJldHVybiBuYSA9PT0gbmI7XHJcblxyXG4gICAgaWYgKHR5cGVvZiBhID09PSBcImJvb2xlYW5cIiB8fCB0eXBlb2YgYiA9PT0gXCJib29sZWFuXCIpIHtcclxuICAgICAgICByZXR1cm4gU3RyaW5nKGEpLnRvTG93ZXJDYXNlKCkgPT09IFN0cmluZyhiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBTdHJpbmcoYSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpID09PSBTdHJpbmcoYiA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpblNtYXJ0KGFjdHVhbDogdW5rbm93biwgY2FuZGlkYXRlTGlzdDogdW5rbm93bik6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFBcnJheS5pc0FycmF5KGNhbmRpZGF0ZUxpc3QpKSByZXR1cm4gZXF1YWxzU21hcnQoYWN0dWFsLCBjYW5kaWRhdGVMaXN0KTtcclxuXHJcbiAgICBpZiAoQXJyYXkuaXNBcnJheShhY3R1YWwpKSB7XHJcbiAgICAgICAgY29uc3QgY2FuZCA9IG5ldyBTZXQoY2FuZGlkYXRlTGlzdC5tYXAoKHgpID0+IG5vcm1hbGl6ZVNjYWxhcih4KSkpO1xyXG4gICAgICAgIHJldHVybiBhY3R1YWwuc29tZSgoeCkgPT4gY2FuZC5oYXMobm9ybWFsaXplU2NhbGFyKHgpKSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlzTG9va3VwQ29tcGFyYWJsZShhY3R1YWwpKSB7XHJcbiAgICAgICAgY29uc3QgaWQgPSAoYWN0dWFsLmlkID8/IFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IChhY3R1YWwubmFtZSA/PyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGZvciAoY29uc3QgdiBvZiBjYW5kaWRhdGVMaXN0KSB7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgdiA9PT0gXCJzdHJpbmdcIikge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgZyA9IHRvR3VpZE9yTnVsbCh2KTtcclxuICAgICAgICAgICAgICAgIGlmICgoZyAmJiBpZCA9PT0gZykgfHwgKCFnICYmIG5hbWUgPT09IHYudG9Mb3dlckNhc2UoKSkpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGlzTG9va3VwQ29tcGFyYWJsZSh2KSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCh2LmlkICYmIGlkID09PSB2LmlkLnRvTG93ZXJDYXNlKCkpIHx8ICh2Lm5hbWUgJiYgbmFtZSA9PT0gdi5uYW1lLnRvTG93ZXJDYXNlKCkpKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfSBlbHNlIGlmIChlcXVhbHNTbWFydChhY3R1YWwsIHYpKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIGNhbmRpZGF0ZUxpc3Quc29tZSgodikgPT4gZXF1YWxzU21hcnQoYWN0dWFsLCB2KSk7XHJcbn0iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=