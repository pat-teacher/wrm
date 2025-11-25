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


/***/ }),

/***/ "./WebResources/src/entities/CustodianBankAssessmentManagement.entity.ts":
/*!*******************************************************************************!*\
  !*** ./WebResources/src/entities/CustodianBankAssessmentManagement.entity.ts ***!
  \*******************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CUSTODIANBANKASSESSMENTMANAGEMENT: () => (/* binding */ CUSTODIANBANKASSESSMENTMANAGEMENT)
/* harmony export */ });
const CUSTODIANBANKASSESSMENTMANAGEMENT = {
    entity: "mhwrmb_custodianbankassessmentmanagement",
    fields: {
        pk: "mhwrmb_custodianbankassessmentmanagementId",
        ownerid: "ownerid",
        businessunit: "mhwrmb_genfinfo_mh_businessunitid",
    }
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
/*!*************************************************************************!*\
  !*** ./WebResources/src/form/custodianbankassessmentmanagement.form.ts ***!
  \*************************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   onLoad: () => (/* binding */ onLoad),
/* harmony export */   onOwnerLookupRefresh: () => (/* binding */ onOwnerLookupRefresh)
/* harmony export */ });
/* harmony import */ var _entities_CustodianBankAssessmentManagement_entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../entities/CustodianBankAssessmentManagement.entity */ "./WebResources/src/entities/CustodianBankAssessmentManagement.entity.ts");
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/crm.core */ "./WebResources/src/core/crm.core.ts");


async function onLoad(executionContext) {
    const fc = executionContext.getFormContext();
    // Configure owner lookup (also reusable for onChange)
    configureOwnerLookup(fc);
}
/**
 * Configure owner lookup to show only Teams and default to current user's teams.
 * Can be reused from onLoad and from field onChange handlers if needed.
 */
function configureOwnerLookup(fc) {
    try {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.LookupViewHelper.setEntityTypes(fc, _entities_CustodianBankAssessmentManagement_entity__WEBPACK_IMPORTED_MODULE_0__.CUSTODIANBANKASSESSMENTMANAGEMENT.fields.ownerid, ["team"]);
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.LookupViewHelper.addOwnerTeamViewForCurrentUser(fc, _entities_CustodianBankAssessmentManagement_entity__WEBPACK_IMPORTED_MODULE_0__.CUSTODIANBANKASSESSMENTMANAGEMENT.fields.ownerid);
    }
    catch { /* ignore */ }
}
/** Optional exported onChange handler to re-apply owner lookup configuration */
function onOwnerLookupRefresh(executionContext) {
    const fc = executionContext.getFormContext();
    configureOwnerLookup(fc);
}

})();

(window.WRM = window.WRM || {}).custodianbankassessmentmanagement_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9kaWFuYmFua2Fzc2Vzc21lbnRtYW5hZ2VtZW50X2Zvcm0uanMiLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLCtCQUErQjtBQUN4QixNQUFNLFNBQVMsR0FBRztJQUNyQixTQUFTLEVBQUUsQ0FBQztJQUNaLE1BQU0sRUFBRSxDQUFDO0lBQ1QsTUFBTSxFQUFFLENBQUM7SUFDVCxRQUFRLEVBQUUsQ0FBQztJQUNYLFFBQVEsRUFBRSxDQUFDO0lBQ1gsV0FBVyxFQUFFLENBQUM7SUFDZCxRQUFRLEVBQUUsQ0FBQztDQUNMLENBQUM7QUFJSixNQUFNLGNBQWMsR0FBRztJQUMxQixHQUFHLENBQUMsRUFBTzs7UUFDUCxPQUFPLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRSwwQ0FBRSxXQUFXLGtEQUFJLG1DQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDMUQsQ0FBQztJQUNELFlBQVksQ0FBQyxJQUFjO1FBQ3ZCLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDdkUsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFjO1FBQ3JCLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDcEcsQ0FBQztDQUNKLENBQUM7QUEwQ0YseUJBQXlCO0FBQ2xCLE1BQU0sSUFBSTtJQUNiLE1BQU0sS0FBSyxHQUFHO1FBQ1YsT0FBUSxNQUFjLENBQUMsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxvRUFBb0U7SUFDcEUsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFXO1FBQzNCLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJ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QTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnlHO0FBQ3JEO0FBRTdDLEtBQUssVUFBVSxNQUFNLENBQUMsZ0JBQXlDO0lBQ2xFLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzdDLHNEQUFzRDtJQUN0RCxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxFQUFtQjtJQUM3QyxJQUFJLENBQUM7UUFDRCw0REFBZ0IsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLGlIQUFpQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLDREQUFnQixDQUFDLDhCQUE4QixDQUFDLEVBQUUsRUFBRSxpSEFBaUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUcsQ0FBQztJQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxnRkFBZ0Y7QUFDekUsU0FBUyxvQkFBb0IsQ0FBQyxnQkFBeUM7SUFDMUUsTUFBTSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDN0Msb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0IsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQ3VzdG9kaWFuQmFua0Fzc2Vzc21lbnRNYW5hZ2VtZW50LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9mb3JtL2N1c3RvZGlhbmJhbmthc3Nlc3NtZW50bWFuYWdlbWVudC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vID09PT0gRm9ybVR5cGUgQ29uc3RhbnRzID09PT1cclxuZXhwb3J0IGNvbnN0IEZPUk1fVFlQRSA9IHtcclxuICAgIFVuZGVmaW5lZDogMCxcclxuICAgIENyZWF0ZTogMSxcclxuICAgIFVwZGF0ZTogMixcclxuICAgIFJlYWRPbmx5OiAzLFxyXG4gICAgRGlzYWJsZWQ6IDQsXHJcbiAgICBRdWlja0NyZWF0ZTogNSxcclxuICAgIEJ1bGtFZGl0OiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgRm9ybVR5cGUgPSB0eXBlb2YgRk9STV9UWVBFW2tleW9mIHR5cGVvZiBGT1JNX1RZUEVdO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZvcm1UeXBlSGVscGVyID0ge1xyXG4gICAgZ2V0KGZjOiBhbnkpOiBGb3JtVHlwZSB8IDAge1xyXG4gICAgICAgIHJldHVybiBmYz8udWk/LmdldEZvcm1UeXBlPy4oKSA/PyBGT1JNX1RZUEUuVW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIGlzQ3JlYXRlTGlrZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH0sXHJcbiAgICBpc0VkaXRhYmxlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlVwZGF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyUmVmIHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIiB8IFwidGVhbVwiO1xyXG4gICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gVHlwZXMgc2hhcmVkIGFjcm9zcyBlbmdpbmUgJiBlbnRpdGllcyAtLS0tXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCIgfCBcIm5vdG51bGxcIjsgLy8gYWxpYXNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcclxuICAgIC8qKiBMb2dpY2FsIG5hbWUgKHN1cHBvcnRzIGRvdC1ub3RhdGlvbiBmb3IgbG9va3VwIHByb2plY3Rpb25zOiBlLmcuLCBcInByaW1hcnljb250YWN0aWQubmFtZVwiKS4gKi9cclxuICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKiogT3B0aW9uYWwgdmFsdWUgZm9yIGNvbXBhcmlzb25zIChvbWl0dGVkIGZvciBudWxsLW9wZXJhdG9ycykuICovXHJcbiAgICB2YWx1ZT86IHVua25vd247XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgbWFuZGF0b3J5Pzogc3RyaW5nW107XHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gQU5ELWNvbmp1bmN0aW9uOyBlbXB0eS91bmRlZmluZWQg4oeSIHJ1bGUgYWx3YXlzIG1hdGNoZXNcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdD86IHN0cmluZ1tdO1xyXG4gICAgcnVsZXM/OiBSdWxlW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVzaW5lc3NVbml0Q29uZmlnIHtcclxuICAgIHZlcnNpb246IG51bWJlcjtcclxuICAgIGVudGl0aWVzOiBSZWNvcmQ8c3RyaW5nLCBFbnRpdHlDb25maWc+O1xyXG59XHJcblxyXG4vKiogTGlnaHR3ZWlnaHQgY29tcGFyYWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxvb2t1cCAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgaWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICBuYW1lOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBDb3JlIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcbiAgICBzdGF0aWMgZ2V0IFhybSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkuWHJtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBMb3dlcmNhc2UsIHN0cmlwIGJyYWNlczsgcmV0dXJucyBlbXB0eSBzdHJpbmcgaWYgZmFsc3kgaW5wdXQuICovXHJcbiAgICBzdGF0aWMgc2FuaXRpemVHdWlkKGlkPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKGlkIHx8IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdW5pcXVlPFQ+KGFycjogVFtdKTogVFtdIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFRoaW4gV2ViIEFQSSB3cmFwcGVyIC0tLS1cclxuZXhwb3J0IGNsYXNzIEFwaUNsaWVudCB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5JZCA9IFV0aWwuc2FuaXRpemVHdWlkKGlkKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lLCBjbGVhbklkLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGZldGNoWG1sKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGZldGNoWG1sOiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgP2ZldGNoWG1sPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGZldGNoWG1sLnRyaW0oKSl9YDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCB1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBleGVjdXRlKHJlcXVlc3Q6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBhc3NvY2lhdGVNYW55VG9NYW55KFxyXG4gICAgICAgIHBhcmVudEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRJZDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0aW9uc2hpcFNjaGVtYU5hbWU6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkRW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRJZHM6IHN0cmluZ1tdXHJcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCByZXEgPSB7XHJcbiAgICAgICAgICAgIHRhcmdldDogeyBlbnRpdHlUeXBlOiBwYXJlbnRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocGFyZW50SWQpIH0sXHJcbiAgICAgICAgICAgIHJlbGF0ZWRFbnRpdGllczogcmVsYXRlZElkcy5tYXAoKHJpZCkgPT4gKHsgZW50aXR5VHlwZTogcmVsYXRlZEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChyaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0gYXMgYW55O1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEFwaUNsaWVudC5leGVjdXRlKHJlcSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBBc3NvY2lhdGlvbiBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gRm9ybSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIEZvcm1Db250cm9sSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRDdXJyZW50SWQoZmM6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkUmF3ID0gZmM/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSYXcgPyBVdGlsLnNhbml0aXplR3VpZChpZFJhdykgOiBudWxsO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldExvb2t1cElkKGZjOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB2ID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZSk/LmdldFZhbHVlPy4oKTtcclxuICAgICAgICByZXR1cm4gdiAmJiB2Lmxlbmd0aCA/IFV0aWwuc2FuaXRpemVHdWlkKHZbMF0uaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEaXNhYmxlIG9yIGVuYWJsZSBhbGwgZGlzYWJsZWFibGUgY29udHJvbHMgaW5zaWRlIGEgdGFiIHNlY3Rpb24gKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZEFsbENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjb250cm9sOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkgeyBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBPcHRpb25hbDogc3BlY2lhbCBoYW5kbGluZyBmb3Igc3ViZ3JpZHMsIHdoaWNoIGRvIG5vdCBzdXBwb3J0IHNldERpc2FibGVkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgLyoqICAgXHJcbiAgICogZGUvYWN0aXZhdGUgb25seSB0aGUgc3BlY2lmaWVkIGNvbnRyb2xzIChieSBuYW1lKSBpbiBhIHNlY3Rpb24uICAgXHJcbiAgICogRG9lcyBub3RoaW5nIGlmIHRoZSBsaXN0IGlzIGVtcHR5IG9yIGNvbnRyb2xzIGFyZSBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgY29udHJvbE5hbWVzOiByZWFkb25seSBzdHJpbmdbXSxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjb250cm9sTmFtZXMpIHx8IGNvbnRyb2xOYW1lcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgY29udHJvbE5hbWVzXHJcbiAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IEZvcm1Db250cm9sSGVscGVyLmZpbmRDb250cm9sSW5TZWN0aW9uKHNlY3Rpb24sIG5hbWUpKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChjKTogYyBpcyBYcm0uQ29udHJvbHMuQ29udHJvbCA9PiBCb29sZWFuKGMpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoY29udHJvbCkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbCwgZGlzYWJsZWQpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQ29udHJvbEluU2VjdGlvbihcclxuICAgICAgICBzZWN0aW9uOiBYcm0uQ29udHJvbHMuU2VjdGlvbixcclxuICAgICAgICBuYW1lOiBzdHJpbmdcclxuICAgICk6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICAvLyBwcmltYXJ5OiBkaXJlY3QgcGVyIE5hbWVcclxuICAgICAgICBjb25zdCBkaXJlY3QgPSBzZWN0aW9uLmNvbnRyb2xzLmdldD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChkaXJlY3QpIHJldHVybiBkaXJlY3Q7XHJcblxyXG4gICAgICAgIC8vIEZhbGxiYWNrOiBzZWFyY2ggYnkgZ2V0TmFtZSgpIG92ZXIgdGhlIGNvbGxlY3Rpb25cclxuICAgICAgICBsZXQgZm91bmQ6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYy5nZXROYW1lPy4oKSA9PT0gbmFtZSkgZm91bmQgPSBjO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIVZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIGlmIGRpZmZlcmVudFxyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY29udHJvbC5nZXREaXNhYmxlZD8uKCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gXCJib29sZWFuXCIgJiYgY3VycmVudCA9PT0gZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIC8qIG5vLW9wICovXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEhlbHBlciB7XHJcbiAgICBzdGF0aWMgdHJ5UmVmcmVzaFN1YmdyaWQoZmM6IGFueSwgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBmYz8uZ2V0Q29udHJvbD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChncmlkPy5yZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBncmlkLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmYz8udWk/LnJlZnJlc2hSaWJib24/LigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFZpc2liaWxpdHkgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBhIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBkaXNhYmxlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0RGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTZXRzIHJlcXVpcmVkIGxldmVsIG9uIGFuIGF0dHJpYnV0ZS9jb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0UmVxdWlyZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgaXNSZXF1aXJlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChhdHRyPy5zZXRSZXF1aXJlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyLnNldFJlcXVpcmVkTGV2ZWwoaXNSZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUNvbnRyb2xIZWxwZXIuZ2V0TG9va3VwSWQoZmMsIGxvb2t1cEF0dHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gISFjdXJyZW50ICYmIFV0aWwuc2FuaXRpemVHdWlkKGN1cnJlbnQpID09PSBVdGlsLnNhbml0aXplR3VpZCh0YXJnZXRJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFR5cGUgZ3VhcmQ6IGNvbnRyb2wgc3VwcG9ydHMgc2V0RGlzYWJsZWQgKi9cclxuICAgIHN0YXRpYyBpc0Rpc2FibGVhYmxlKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sKTogY29udHJvbCBpcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sIHtcclxuICAgICAgICByZXR1cm4gXCJzZXREaXNhYmxlZFwiIGluIGNvbnRyb2wgJiYgdHlwZW9mIChjb250cm9sIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wpLnNldERpc2FibGVkID09PSBcImZ1bmN0aW9uXCI7XHJcbiAgICB9ICAgIFxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBkaWFsb2cgaGVscGVyIC0tLS1cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBSZXN1bHQge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZztcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBEaWFsb2dIZWxwZXIge1xyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHJpYnV0ZTogc3RyaW5nLFxyXG4gICAgICAgIGlkczogc3RyaW5nW10sXHJcbiAgICAgICAgb3B0aW9ucz86IFBhcnRpYWw8eyBhbGxvd011bHRpU2VsZWN0OiBib29sZWFuOyBkaXNhYmxlTXJ1OiBib29sZWFuOyBkZWZhdWx0Vmlld0lkOiBzdHJpbmcgfT5cclxuICAgICk6IFByb21pc2U8TG9va3VwUmVzdWx0W10+IHtcclxuICAgICAgICBjb25zdCBpblZhbHVlcyA9IGlkc1xyXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gYDx2YWx1ZSB1aXR5cGU9XCIke2VudGl0eUxvZ2ljYWx9XCI+eyR7VXRpbC5zYW5pdGl6ZUd1aWQoaWQpfX08L3ZhbHVlPmApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJYbWwgPSBgXHJcbiAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtpZEF0dHJpYnV0ZX1cIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAke2luVmFsdWVzfVxyXG4gICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgIDwvZmlsdGVyPmAudHJpbSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb29rdXBPcHRpb25zOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGFsbG93TXVsdGlTZWxlY3Q6IG9wdGlvbnM/LmFsbG93TXVsdGlTZWxlY3QgPz8gdHJ1ZSxcclxuICAgICAgICAgICAgZGVmYXVsdEVudGl0eVR5cGU6IGVudGl0eUxvZ2ljYWwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGVzOiBbZW50aXR5TG9naWNhbF0sXHJcbiAgICAgICAgICAgIGZpbHRlcnM6IFt7IGVudGl0eUxvZ2ljYWxOYW1lOiBlbnRpdHlMb2dpY2FsLCBmaWx0ZXJYbWwgfV0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNcnU6IG9wdGlvbnM/LmRpc2FibGVNcnUgPz8gdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8uZGVmYXVsdFZpZXdJZCkgbG9va3VwT3B0aW9ucy5kZWZhdWx0Vmlld0lkID0gb3B0aW9ucy5kZWZhdWx0Vmlld0lkO1xyXG5cclxuICAgICAgICByZXR1cm4gKGF3YWl0IFV0aWwuWHJtLlV0aWxpdHkubG9va3VwT2JqZWN0cyhsb29rdXBPcHRpb25zKSkgYXMgTG9va3VwUmVzdWx0W107XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gR2VuZXJpYyBsb29rdXAgT0RhdGEgc2VydmljZSAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRGaXJzdElkQnlGaWx0ZXIoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIG9kYXRhRmlsdGVyOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBgPyRzZWxlY3Q9JHtpZEF0dHJ9JiRmaWx0ZXI9JHtvZGF0YUZpbHRlcn1gO1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWwsIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IHJlcz8uZW50aXRpZXM/LlswXTtcclxuICAgICAgICBjb25zdCBpZCA9IHJvdz8uW2lkQXR0cl0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGdldElkQnlFcXVhbGl0eShcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgYXR0cjogc3RyaW5nLFxyXG4gICAgICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBsaXQgPSB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgIDogU3RyaW5nKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXJzdElkQnlGaWx0ZXIoZW50aXR5TG9naWNhbCwgaWRBdHRyLCBgKCR7YXR0cn0gZXEgJHtsaXR9KWApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRm9ybVdhaXQge1xyXG4gICAgc3RhdGljIHdhaXRGb3JMb29rdXBWYWx1ZShmYzogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHRpbWVvdXRNcyA9IDYwMDApOiBQcm9taXNlPFhybS5Mb29rdXBWYWx1ZSB8IG51bGw+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGVOYW1lKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghYXR0cikgcmV0dXJuIHJlc29sdmUobnVsbCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBub3cgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICBpZiAobm93Py5pZCkgcmV0dXJuIHJlc29sdmUobm93KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7IHRyeSB7IGF0dHIucmVtb3ZlT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfSB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbkNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkb25lKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgICAgIGlmICh2Py5pZCkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKHYpOyB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0cnkgeyBhdHRyLmFkZE9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChvbkNoYW5nZSwgMCk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgaWYgKCFkb25lKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUobnVsbCk7IH0gfSwgdGltZW91dE1zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE93bmVySGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRPd25lckF0dHJpYnV0ZShmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiAoZmM/LmdldEF0dHJpYnV0ZT8uKG93bmVyQXR0ck5hbWUpID8/IG51bGwpIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IE93bmVyUmVmIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpPy5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICBpZiAoIXY/LmlkIHx8ICF2LmVudGl0eVR5cGUpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiB7IGlkOiBVdGlsLnNhbml0aXplR3VpZCh2LmlkKSwgZW50aXR5VHlwZTogdi5lbnRpdHlUeXBlIGFzIGFueSwgbmFtZTogdi5uYW1lID8/IG51bGwgfTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2V0T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nLCBvd25lcjogT3duZXJSZWYpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk7XHJcbiAgICAgICAgaWYgKCFhdHRyKSByZXR1cm47XHJcbiAgICAgICAgYXR0ci5zZXRWYWx1ZShbe1xyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQob3duZXIuaWQpLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlOiBvd25lci5lbnRpdHlUeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiBvd25lci5uYW1lID8/IHVuZGVmaW5lZFxyXG4gICAgICAgIH0gYXMgYW55XSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGlzU2FtZU93bmVyKGE/OiBPd25lclJlZiB8IG51bGwsIGI/OiBPd25lclJlZiB8IG51bGwpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gYS5lbnRpdHlUeXBlID09PSBiLmVudGl0eVR5cGUgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoYS5pZCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKGIuaWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJpYyBzZXJ2aWNlOiBMb2FkIG93bmVyIChVc2VyIG9yIFRlYW0pIGZvciBhbnkgcmVjb3JkICovXHJcbmV4cG9ydCBjbGFzcyBPd25lclNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldE93bmVyUmVmKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWNvcmRJZDogc3RyaW5nLFxyXG4gICAgICAgIG93bmVyQXR0ck5hbWUgPSBcIm93bmVyaWRcIlxyXG4gICAgKTogUHJvbWlzZTxPd25lclJlZiB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKHJlY29yZElkKTtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gRm9yIHBvbHltb3JwaGljIG93bmVyIGxvb2t1cHMsIGV4cGFuZCBkZWRpY2F0ZWQgbmF2IHByb3BzIHRvIGF2b2lkIHByb3BlcnR5LW5vdC1mb3VuZCBlcnJvcnNcclxuICAgICAgICBjb25zdCBleHBhbmQgPSBgPyRzZWxlY3Q9JHtvd25lckF0dHJOYW1lfSYkZXhwYW5kPW93bmluZ3VzZXIoJHNlbGVjdD1zeXN0ZW11c2VyaWQsZnVsbG5hbWUpLG93bmluZ3RlYW0oJHNlbGVjdD10ZWFtaWQsbmFtZSlgO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsLCBpZCwgZXhwYW5kKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXNlciA9IHJlYz8uW1wib3duaW5ndXNlclwiXTtcclxuICAgICAgICBpZiAodXNlcj8uc3lzdGVtdXNlcmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodXNlci5zeXN0ZW11c2VyaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLmZ1bGxuYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlYW0gPSByZWM/LltcIm93bmluZ3RlYW1cIl07XHJcbiAgICAgICAgaWYgKHRlYW0/LnRlYW1pZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHRlYW0udGVhbWlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwidGVhbVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdGVhbS5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogU2VjdXJpdHktcmVsYXRlZCBoZWxwZXJzICovXHJcbmV4cG9ydCBjbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xyXG4gICAgICAgIC8qKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBpZCBmcm9tIFhybSBjb250ZXh0ICovXHJcbiAgICAgICAgc3RhdGljIGdldEN1cnJlbnRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuWHJtPy5VdGlsaXR5Py5nZXRHbG9iYWxDb250ZXh0Py4oKT8udXNlclNldHRpbmdzPy51c2VySWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybnMgcm9sZSBuYW1lcyBvZiB0aGUgY3VycmVudCB1c2VyICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGdldEN1cnJlbnRVc2VyUm9sZXMoKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W10+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuZ2V0Q3VycmVudFVzZXJJZCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1c2VySWQpIHJldHVybiBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGZXRjaFhNTCBvdmVyIHN5c3RlbXVzZXJyb2xlcyAoTjpOKSB0byByb2xlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgICAgIDxmZXRjaCB2ZXJzaW9uPVwiMS4wXCIgZGlzdGluY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwicm9sZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJyb2xlaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2Vycm9sZXNcIiBmcm9tPVwicm9sZWlkXCIgdG89XCJyb2xlaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJcIiBmcm9tPVwic3lzdGVtdXNlcmlkXCIgdG89XCJzeXN0ZW11c2VyaWRcIiBhbGlhcz1cInVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7dXNlcklkfVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9mZXRjaD5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5mZXRjaFhtbChcInJvbGVcIiwgZmV0Y2hYbWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXMuZW50aXRpZXMgfHwgW10pLm1hcCgoZSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKGVbXCJyb2xlaWRcIl0gPz8gZVtcIl9yb2xlaWRfdmFsdWVcIl0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlW1wibmFtZVwiXSBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICB9KSkuZmlsdGVyKHIgPT4gISFyLmlkICYmICEhci5uYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDaGVja3MgaWYgY3VycmVudCB1c2VyIGhhcyBvbmUgb2YgdGhlIHByb3ZpZGVkIHJvbGUgbmFtZXMgKGNhc2UtaW5zZW5zaXRpdmUpICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGhhc0N1cnJlbnRVc2VyUm9sZSguLi5yb2xlTmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3YW50ZWQgPSBuZXcgU2V0KHJvbGVOYW1lcy5tYXAobiA9PiBuLnRyaW0oKS50b0xvd2VyQ2FzZSgpKS5maWx0ZXIoQm9vbGVhbikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhbnRlZC5zaXplID09PSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb2xlcyA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudFVzZXJSb2xlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvbGVzLnNvbWUociA9PiB3YW50ZWQuaGFzKHIubmFtZS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBjb250cm9sIHZpZXcgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBWaWV3SGVscGVyIHtcclxuICAgIC8qKiBSZXN0cmljdCBhIGxvb2t1cCBjb250cm9sIHRvIHNwZWNpZmljIGVudGl0eSB0eXBlcyAqL1xyXG4gICAgc3RhdGljIHNldEVudGl0eVR5cGVzKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGVudGl0eVR5cGVzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjdHJsPy5zZXRFbnRpdHlUeXBlcz8uKGVudGl0eVR5cGVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkIGEgY3VzdG9tIHZpZXcgdG8gYSBsb29rdXAgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIGFkZEN1c3RvbVZpZXcoXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICBjb250cm9sTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGVudGl0eU5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3RGlzcGxheU5hbWU6IHN0cmluZyxcclxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nLFxyXG4gICAgICAgIGxheW91dFhtbDogc3RyaW5nLFxyXG4gICAgICAgIHNldEFzRGVmYXVsdDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWN0cmw/LmFkZEN1c3RvbVZpZXcpIHJldHVybjtcclxuICAgICAgICAgICAgY3RybC5hZGRDdXN0b21WaWV3KHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbC50cmltKCksIGxheW91dFhtbC50cmltKCksIHNldEFzRGVmYXVsdCk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZHMgYSBjdXN0b20gdmlldyBmb3Igb3duZXIgbG9va3VwIHRvIHNob3cgb25seSB0ZWFtcyB0aGUgY3VycmVudCB1c2VyIGJlbG9uZ3MgdG8uICovXHJcbiAgICBzdGF0aWMgYWRkT3duZXJUZWFtVmlld0ZvckN1cnJlbnRVc2VyKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcgPSBcIm93bmVyaWRcIik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBcInRlYW1cIjtcclxuICAgICAgICBjb25zdCB2aWV3RGlzcGxheU5hbWUgPSBcIk93bmVyVGVhbUxvb2t1cFZpZXdcIjtcclxuICAgICAgICBjb25zdCB2aWV3SWQgPSBcInswMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDF9XCI7XHJcblxyXG4gICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICA8ZmV0Y2g+XHJcbiAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJ0ZWFtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiYnVzaW5lc3N1bml0aWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwibmV2X293bmVydGVhbTJzeXN0ZW11c2VyXCIgZnJvbT1cInRlYW1pZFwiIHRvPVwidGVhbWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxLXVzZXJpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgPC9mZXRjaD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBjb25zdCBsYXlvdXRYbWwgPSBgXHJcbiAgICAgICAgICAgIDxncmlkIG5hbWU9J3Jlc3VsdHNldCcgb2JqZWN0PScxJyBqdW1wPSd0ZWFtaWQnIHNlbGVjdD0nMScgaWNvbj0nMScgcHJldmlldz0nMSc+XHJcbiAgICAgICAgICAgICAgICA8cm93IG5hbWU9J3Jlc3VsdCcgaWQ9J3RlYW1pZCc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nbmFtZScgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSdidXNpbmVzc3VuaXRpZCcgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgIDwvcm93PlxyXG4gICAgICAgICAgICA8L2dyaWQ+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgTG9va3VwVmlld0hlbHBlci5hZGRDdXN0b21WaWV3KGZjLCBjb250cm9sTmFtZSwgdmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLCBsYXlvdXRYbWwsIHRydWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmllbGRWYWxpZGF0b3Ige1xyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZXMgYSBudW1lcmljIHRleHQgZmllbGQgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlxyXG4gICAgICogQ2FuIGJlIHVzZWQgZm9yIE9uQ2hhbmdlIGV2ZW50cyBhbmQgb3B0aW9uYWxseSByZWNlaXZlcyB0aGUgYXR0cmlidXRlIG5hbWUgYXMgYSBwYXJhbWV0ZXIuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB2YWxpZGF0ZUJpZ051bWJlcihcclxuICAgICAgICBleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCxcclxuICAgICAgICBhdHRyaWJ1dGVOYW1lPzogc3RyaW5nXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKSBhcyBYcm0uRm9ybUNvbnRleHQ7XHJcblxyXG4gICAgICAgIC8vIElmIG5vIGF0dHJpYnV0ZSBuYW1lIGlzIHByb3ZpZGVkIOKGkiB1c2UgZXZlbnQgc291cmNlXHJcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGVOYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U291cmNlID0gZXhlY3V0aW9uQ29udGV4dC5nZXRFdmVudFNvdXJjZSgpIGFzIFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZTtcclxuICAgICAgICAgICAgaWYgKCFldmVudFNvdXJjZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lID0gZXZlbnRTb3VyY2UuZ2V0TmFtZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSBmb3JtQ29udGV4dC5nZXRDb250cm9sKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w7XHJcblxyXG4gICAgICAgIGlmICghYXR0cmlidXRlIHx8ICFjb250cm9sKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbklkID0gYCR7YXR0cmlidXRlTmFtZX1fQmlnTnVtYmVyRXJyb3JgO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IGF0dHJpYnV0ZS5nZXRWYWx1ZSgpIGFzIHN0cmluZyB8IG51bGw7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBmaWVsZCBpcyB0cnVseSBlbXB0eSAobnVsbCkg4oaSIGNsZWFyIGVycm9yIGFuZCBleGl0XHJcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24obm90aWZpY2F0aW9uSWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBLZWVwIG9yaWdpbmFsIHN0cmluZywgYnV0IHdvcmsgb24gYSBjb3B5XHJcbiAgICAgICAgY29uc3QgcmF3ID0gdmFsdWUudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgZW50ZXJlZCBvbmx5IHdoaXRlc3BhY2Ug4oaSIHRyZWF0IGFzIGludmFsaWRcclxuICAgICAgICBpZiAocmF3LnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIGEgbnVtZXJpYyB2YWx1ZSB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXCIsXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYWxsIHdoaXRlc3BhY2UgZm9yIHZhbGlkYXRpb24gLyBzdG9yYWdlXHJcbiAgICAgICAgY29uc3QgZGlnaXRzT25seSA9IHJhdy5yZXBsYWNlKC9cXHMrL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAvLyBWYWxpZGF0aW9uOiBvbmx5IGRpZ2l0cywgbWF4LiAxMiBjaGFyYWN0ZXJzXHJcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkezEsMTJ9JC8udGVzdChkaWdpdHNPbmx5KTtcclxuXHJcbiAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24oXHJcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSBlbnRlciBhIG51bWVyaWMgdmFsdWUgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlwiLFxyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVmFsaWQg4oaSIGNsZWFyIG5vdGlmaWNhdGlvbiBhbmQgc3RvcmUgcmF3IHZhbHVlIHdpdGhvdXQgc3BhY2VzXHJcbiAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbihub3RpZmljYXRpb25JZCk7XHJcbiAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKGRpZ2l0c09ubHkpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjb25zdCBDVVNUT0RJQU5CQU5LQVNTRVNTTUVOVE1BTkFHRU1FTlQgPSB7XHJcbiAgICBlbnRpdHk6IFwibWh3cm1iX2N1c3RvZGlhbmJhbmthc3Nlc3NtZW50bWFuYWdlbWVudFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwibWh3cm1iX2N1c3RvZGlhbmJhbmthc3Nlc3NtZW50bWFuYWdlbWVudElkXCIsICAgICAgICBcclxuICAgICAgICBvd25lcmlkOiBcIm93bmVyaWRcIixcclxuICAgICAgICBidXNpbmVzc3VuaXQ6IFwibWh3cm1iX2dlbmZpbmZvX21oX2J1c2luZXNzdW5pdGlkXCIsICAgICAgICBcclxuICAgIH1cclxufSBhcyBjb25zdDsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IENVU1RPRElBTkJBTktBU1NFU1NNRU5UTUFOQUdFTUVOVCB9IGZyb20gXCIuLi9lbnRpdGllcy9DdXN0b2RpYW5CYW5rQXNzZXNzbWVudE1hbmFnZW1lbnQuZW50aXR5XCI7XHJcbmltcG9ydCB7IExvb2t1cFZpZXdIZWxwZXIgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uTG9hZChleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICAvLyBDb25maWd1cmUgb3duZXIgbG9va3VwIChhbHNvIHJldXNhYmxlIGZvciBvbkNoYW5nZSlcclxuICAgIGNvbmZpZ3VyZU93bmVyTG9va3VwKGZjKTsgICAgICAgIFxyXG59XHJcblxyXG4vKipcclxuICogQ29uZmlndXJlIG93bmVyIGxvb2t1cCB0byBzaG93IG9ubHkgVGVhbXMgYW5kIGRlZmF1bHQgdG8gY3VycmVudCB1c2VyJ3MgdGVhbXMuXHJcbiAqIENhbiBiZSByZXVzZWQgZnJvbSBvbkxvYWQgYW5kIGZyb20gZmllbGQgb25DaGFuZ2UgaGFuZGxlcnMgaWYgbmVlZGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gY29uZmlndXJlT3duZXJMb29rdXAoZmM6IFhybS5Gb3JtQ29udGV4dCk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLnNldEVudGl0eVR5cGVzKGZjLCBDVVNUT0RJQU5CQU5LQVNTRVNTTUVOVE1BTkFHRU1FTlQuZmllbGRzLm93bmVyaWQsIFtcInRlYW1cIl0pO1xyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuYWRkT3duZXJUZWFtVmlld0ZvckN1cnJlbnRVc2VyKGZjLCBDVVNUT0RJQU5CQU5LQVNTRVNTTUVOVE1BTkFHRU1FTlQuZmllbGRzLm93bmVyaWQpO1xyXG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbn1cclxuXHJcbi8qKiBPcHRpb25hbCBleHBvcnRlZCBvbkNoYW5nZSBoYW5kbGVyIHRvIHJlLWFwcGx5IG93bmVyIGxvb2t1cCBjb25maWd1cmF0aW9uICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvbk93bmVyTG9va3VwUmVmcmVzaChleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCk6IHZvaWQge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICBjb25maWd1cmVPd25lckxvb2t1cChmYyk7XHJcbn1cclxuXHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==