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

/***/ "./WebResources/src/entities/AppConfig.entity.ts":
/*!*******************************************************!*\
  !*** ./WebResources/src/entities/AppConfig.entity.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   APPCONFIG: () => (/* binding */ APPCONFIG)
/* harmony export */ });
const APPCONFIG = {
    entity: "nev_config",
    fields: {
        pk: "nev_configid",
        key: "nev_Key",
        json: "nev_Value_nText",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/InternalTask.entity.ts":
/*!**********************************************************!*\
  !*** ./WebResources/src/entities/InternalTask.entity.ts ***!
  \**********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   INTERNALTASK: () => (/* binding */ INTERNALTASK)
/* harmony export */ });
const INTERNALTASK = {
    entity: "nev_internaltask",
    fields: {
        pk: "nev_internaltaskid",
        subject: "nev_subject",
        contactid: "nev_contactid",
        companyid: "nev_companyid",
        portfolioid: "nev_portfolioid",
        internalTaskType: "nev_internaltasktype",
    },
};


/***/ }),

/***/ "./WebResources/src/entities/InternalTaskType.entity.ts":
/*!**************************************************************!*\
  !*** ./WebResources/src/entities/InternalTaskType.entity.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   INTERNALTASKTYPE: () => (/* binding */ INTERNALTASKTYPE)
/* harmony export */ });
const INTERNALTASKTYPE = {
    entity: "nev_internaltasktype",
    fields: {
        pk: "nev_internaltasktypeid",
        name: "nev_name",
        internaltasktypecodename: "nev_internaltasktypecodename"
    },
};


/***/ }),

/***/ "./WebResources/src/features/createInternalTask/createInternalTask.constants.ts":
/*!**************************************************************************************!*\
  !*** ./WebResources/src/features/createInternalTask/createInternalTask.constants.ts ***!
  \**************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CREATE_INTERNAL_TASK: () => (/* binding */ CREATE_INTERNAL_TASK)
/* harmony export */ });
const CREATE_INTERNAL_TASK = {
    configKey: "idInternalTaskDialogConfig",
    dialogWebResourceName: "mhwrmb_createInternalTaskDialog.html",
};


/***/ }),

/***/ "./WebResources/src/features/createInternalTask/createInternalTask.service.ts":
/*!************************************************************************************!*\
  !*** ./WebResources/src/features/createInternalTask/createInternalTask.service.ts ***!
  \************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canCreateAnyInternalTask: () => (/* binding */ canCreateAnyInternalTask),
/* harmony export */   encodeDialogData: () => (/* binding */ encodeDialogData),
/* harmony export */   getAllowedInternalTaskTypeOptions: () => (/* binding */ getAllowedInternalTaskTypeOptions),
/* harmony export */   getCreateInternalTaskAvailability: () => (/* binding */ getCreateInternalTaskAvailability),
/* harmony export */   getCurrentUserRoleNames: () => (/* binding */ getCurrentUserRoleNames),
/* harmony export */   getSourceFromForm: () => (/* binding */ getSourceFromForm),
/* harmony export */   getXrm: () => (/* binding */ getXrm),
/* harmony export */   hasAnyRole: () => (/* binding */ hasAnyRole),
/* harmony export */   isSupportedSourceEntity: () => (/* binding */ isSupportedSourceEntity),
/* harmony export */   loadCreateInternalTaskConfig: () => (/* binding */ loadCreateInternalTaskConfig),
/* harmony export */   openCreateInternalTaskDialog: () => (/* binding */ openCreateInternalTaskDialog),
/* harmony export */   openInternalTaskCreateForm: () => (/* binding */ openInternalTaskCreateForm),
/* harmony export */   parseDialogData: () => (/* binding */ parseDialogData),
/* harmony export */   resolveInternalTaskTypeByCodeName: () => (/* binding */ resolveInternalTaskTypeByCodeName)
/* harmony export */ });
/* harmony import */ var _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../../entities/InternalTask.entity */ "./WebResources/src/entities/InternalTask.entity.ts");
/* harmony import */ var _entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../entities/InternalTaskType.entity */ "./WebResources/src/entities/InternalTaskType.entity.ts");
/* harmony import */ var _entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../entities/AppConfig.entity */ "./WebResources/src/entities/AppConfig.entity.ts");
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../core/crm.core */ "./WebResources/src/core/crm.core.ts");
/* harmony import */ var _createInternalTask_constants__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./createInternalTask.constants */ "./WebResources/src/features/createInternalTask/createInternalTask.constants.ts");





const EMPTY_CONFIG = { version: 1, taskTypes: [] };
let createInternalTaskConfigCache = null;
function getXrm() {
    var _a, _b;
    return (_a = window.Xrm) !== null && _a !== void 0 ? _a : (_b = window.parent) === null || _b === void 0 ? void 0 : _b.Xrm;
}
function isSupportedSourceEntity(entityName) {
    return entityName === "contact" || entityName === "account" || entityName === "wrmb_portfolio";
}
function getSourceFromForm(formContext) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    const entityName = (_c = (_b = (_a = formContext === null || formContext === void 0 ? void 0 : formContext.data) === null || _a === void 0 ? void 0 : _a.entity) === null || _b === void 0 ? void 0 : _b.getEntityName) === null || _c === void 0 ? void 0 : _c.call(_b);
    const id = _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.Util.sanitizeGuid((_f = (_e = (_d = formContext === null || formContext === void 0 ? void 0 : formContext.data) === null || _d === void 0 ? void 0 : _d.entity) === null || _e === void 0 ? void 0 : _e.getId) === null || _f === void 0 ? void 0 : _f.call(_e));
    if (!entityName || !id || !isSupportedSourceEntity(entityName))
        return null;
    return {
        id,
        entityName,
        name: (_k = (_j = (_h = (_g = formContext === null || formContext === void 0 ? void 0 : formContext.data) === null || _g === void 0 ? void 0 : _g.entity) === null || _h === void 0 ? void 0 : _h.getPrimaryAttributeValue) === null || _j === void 0 ? void 0 : _j.call(_h)) !== null && _k !== void 0 ? _k : null,
    };
}
function encodeDialogData(source) {
    return encodeURIComponent(JSON.stringify(source));
}
function parseDialogData(search = window.location.search) {
    var _a;
    const params = new URLSearchParams(search);
    const raw = params.get("data");
    if (!raw)
        return null;
    try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (!(parsed === null || parsed === void 0 ? void 0 : parsed.id) || !isSupportedSourceEntity(parsed.entityName))
            return null;
        return {
            ...parsed,
            id: _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.Util.sanitizeGuid(parsed.id),
            name: (_a = parsed.name) !== null && _a !== void 0 ? _a : null,
        };
    }
    catch {
        return null;
    }
}
async function openCreateInternalTaskDialog(source) {
    await getXrm().Navigation.navigateTo({
        pageType: "webresource",
        webresourceName: _createInternalTask_constants__WEBPACK_IMPORTED_MODULE_4__.CREATE_INTERNAL_TASK.dialogWebResourceName,
        data: encodeDialogData(source),
    }, {
        target: 2,
        position: 1,
        width: { value: 500, unit: "px" },
        height: { value: 320, unit: "px" },
        title: "Create Internal Task",
    });
}
function getCurrentUserRoleNames() {
    var _a, _b, _c, _d, _e, _f;
    const roles = (_e = (_d = (_c = (_b = (_a = getXrm()) === null || _a === void 0 ? void 0 : _a.Utility) === null || _b === void 0 ? void 0 : _b.getGlobalContext) === null || _c === void 0 ? void 0 : _c.call(_b)) === null || _d === void 0 ? void 0 : _d.userSettings) === null || _e === void 0 ? void 0 : _e.roles;
    const names = [];
    try {
        (_f = roles === null || roles === void 0 ? void 0 : roles.forEach) === null || _f === void 0 ? void 0 : _f.call(roles, (role) => {
            if (role === null || role === void 0 ? void 0 : role.name)
                names.push(role.name);
        });
    }
    catch {
        return names;
    }
    return names;
}
function hasAnyRole(roleNames, userRoleNames = getCurrentUserRoleNames()) {
    if (!(roleNames === null || roleNames === void 0 ? void 0 : roleNames.length))
        return true;
    const available = new Set(userRoleNames.map((name) => name.trim().toLowerCase()));
    return roleNames.some((name) => available.has(name.trim().toLowerCase()));
}
function isAllowedForSource(option, sourceEntity) {
    var _a;
    if (!sourceEntity || !((_a = option.sourceEntities) === null || _a === void 0 ? void 0 : _a.length))
        return true;
    return option.sourceEntities.includes(sourceEntity);
}
function normalizeConfigOption(raw) {
    var _a, _b, _c;
    if (!raw || typeof raw !== "object")
        return null;
    const key = String((_a = raw.key) !== null && _a !== void 0 ? _a : "").trim();
    const label = String((_b = raw.label) !== null && _b !== void 0 ? _b : "").trim();
    const taskTypeCodeName = String((_c = raw.taskTypeCodeName) !== null && _c !== void 0 ? _c : "").trim();
    if (!key || !label || !taskTypeCodeName)
        return null;
    const allowedRoles = Array.isArray(raw.allowedRoles)
        ? raw.allowedRoles.map((role) => String(role).trim()).filter(Boolean)
        : undefined;
    const sourceEntities = Array.isArray(raw.sourceEntities)
        ? raw.sourceEntities.filter(isSupportedSourceEntity)
        : undefined;
    return {
        key,
        label,
        taskTypeCodeName,
        allowedRoles,
        sourceEntities,
        enabled: raw.enabled !== false,
    };
}
function parseCreateInternalTaskConfig(jsonText) {
    if (!jsonText)
        return EMPTY_CONFIG;
    try {
        const parsed = JSON.parse(jsonText);
        const taskTypes = Array.isArray(parsed.taskTypes)
            ? parsed.taskTypes.map(normalizeConfigOption).filter((item) => Boolean(item))
            : [];
        return {
            version: typeof parsed.version === "number" ? parsed.version : 1,
            taskTypes,
        };
    }
    catch {
        return EMPTY_CONFIG;
    }
}
async function loadCreateInternalTaskConfig(forceRefresh = false) {
    var _a, _b;
    if (!forceRefresh && createInternalTaskConfigCache)
        return createInternalTaskConfigCache;
    const key = _createInternalTask_constants__WEBPACK_IMPORTED_MODULE_4__.CREATE_INTERNAL_TASK.configKey.replace(/'/g, "''");
    const options = [
        `?$select=${_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.fields.json}`,
        `&$filter=${_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.fields.key} eq '${key}'`,
        "&$top=1",
    ].join("");
    try {
        const result = await getXrm().WebApi.retrieveMultipleRecords(_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.entity, options);
        const jsonText = (_b = (_a = result === null || result === void 0 ? void 0 : result.entities) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b[_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.fields.json];
        createInternalTaskConfigCache = parseCreateInternalTaskConfig(jsonText);
        return createInternalTaskConfigCache;
    }
    catch {
        createInternalTaskConfigCache = EMPTY_CONFIG;
        return createInternalTaskConfigCache;
    }
}
async function getAllowedInternalTaskTypeOptions(sourceEntity) {
    const config = await loadCreateInternalTaskConfig();
    const userRoleNames = getCurrentUserRoleNames();
    return config.taskTypes.filter((option) => option.enabled !== false &&
        isAllowedForSource(option, sourceEntity) &&
        hasAnyRole(option.allowedRoles, userRoleNames));
}
async function canCreateAnyInternalTask(sourceEntity) {
    return (await getAllowedInternalTaskTypeOptions(sourceEntity)).length > 0;
}
async function getCreateInternalTaskAvailability(sourceEntity) {
    const config = await loadCreateInternalTaskConfig();
    if (!config.taskTypes.length) {
        return { canCreate: false, reason: "missing_config" };
    }
    const enabledOptions = config.taskTypes.filter((option) => option.enabled !== false);
    if (!enabledOptions.length) {
        return { canCreate: false, reason: "no_enabled_task_types" };
    }
    const sourceOptions = enabledOptions.filter((option) => isAllowedForSource(option, sourceEntity));
    if (!sourceOptions.length) {
        return { canCreate: false, reason: "no_source_match" };
    }
    const userRoleNames = getCurrentUserRoleNames();
    const roleOptions = sourceOptions.filter((option) => hasAnyRole(option.allowedRoles, userRoleNames));
    if (!roleOptions.length) {
        return { canCreate: false, reason: "no_role_match" };
    }
    return { canCreate: true };
}
async function resolveInternalTaskTypeByCodeName(typeCodeName) {
    var _a, _b;
    const escaped = typeCodeName.replace(/'/g, "''");
    const options = [
        `?$select=${_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.fields.pk},${_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.fields.name},${_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.fields.internaltasktypecodename}`,
        `&$filter=${_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.fields.internaltasktypecodename} eq '${escaped}'`,
    ].join("");
    const result = await getXrm().WebApi.retrieveMultipleRecords(_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.entity, options);
    const row = (_a = result === null || result === void 0 ? void 0 : result.entities) === null || _a === void 0 ? void 0 : _a[0];
    const id = _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.Util.sanitizeGuid(row === null || row === void 0 ? void 0 : row[_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.fields.pk]);
    if (!id)
        return null;
    return { id, name: (_b = row === null || row === void 0 ? void 0 : row[_entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.fields.name]) !== null && _b !== void 0 ? _b : typeCodeName };
}
function getSourceLookupField(entityName) {
    switch (entityName) {
        case "contact":
            return _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.contactid;
        case "account":
            return _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.companyid;
        case "wrmb_portfolio":
            return _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.portfolioid;
        default:
            throw new Error(`Unsupported source entity '${entityName}'.`);
    }
}
function buildInternalTaskFormParameters(source, taskType) {
    var _a;
    const sourceLookupField = getSourceLookupField(source.entityName);
    return {
        [sourceLookupField]: source.id,
        [`${sourceLookupField}name`]: (_a = source.name) !== null && _a !== void 0 ? _a : "",
        [`${sourceLookupField}type`]: source.entityName,
        [_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.internalTaskType]: taskType.id,
        [`${_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.internalTaskType}name`]: taskType.name,
        [`${_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.internalTaskType}type`]: _entities_InternalTaskType_entity__WEBPACK_IMPORTED_MODULE_1__.INTERNALTASKTYPE.entity,
    };
}
async function openInternalTaskCreateForm(source, option) {
    if (!hasAnyRole(option.allowedRoles)) {
        await getXrm().Navigation.openAlertDialog({ text: "You do not have permission to create this Internal Task type." });
        return;
    }
    const taskType = await resolveInternalTaskTypeByCodeName(option.taskTypeCodeName);
    if (!taskType) {
        await getXrm().Navigation.openAlertDialog({ text: `Internal Task Type '${option.taskTypeCodeName}' was not found.` });
        return;
    }
    await getXrm().Navigation.openForm({
        entityName: _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.entity,
        openInNewWindow: true,
    }, buildInternalTaskFormParameters(source, taskType));
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
/*!*****************************************************************!*\
  !*** ./WebResources/src/commands/createInternalTask.command.ts ***!
  \*****************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   canCreateInternalTask: () => (/* binding */ canCreateInternalTask),
/* harmony export */   openDialog: () => (/* binding */ openDialog)
/* harmony export */ });
/* harmony import */ var _features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../features/createInternalTask/createInternalTask.service */ "./WebResources/src/features/createInternalTask/createInternalTask.service.ts");

function getAvailabilityMessage(reason) {
    switch (reason) {
        case "missing_config":
            return "Create Internal Task configuration was not found or contains no valid task types.";
        case "no_enabled_task_types":
            return "Create Internal Task has no enabled task types.";
        case "no_source_match":
            return "Create Internal Task has no task types configured for this source record type.";
        case "no_role_match":
            return "You do not have permission to create Internal Tasks.";
        default:
            return "Create Internal Task is not available.";
    }
}
async function openDialog(primaryControl) {
    const source = (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.getSourceFromForm)(primaryControl);
    if (!source) {
        await (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.getXrm)().Navigation.openAlertDialog({
            text: "Please save the record before creating an Internal Task.",
        });
        return;
    }
    const availability = await (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.getCreateInternalTaskAvailability)(source.entityName);
    if (!availability.canCreate) {
        await (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.getXrm)().Navigation.openAlertDialog({
            text: getAvailabilityMessage(availability.reason),
        });
        return;
    }
    await (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.openCreateInternalTaskDialog)(source);
}
function canCreateInternalTask() {
    return true;
}

})();

(window.WRM = window.WRM || {}).createInternalTaskCommand = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QyxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNoRixJQUFJLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxDQUFDO1FBQzFCLE1BQU0sK0ZBQU0sRUFBRSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7WUFDdEMsSUFBSSxFQUFFLHNCQUFzQixDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUM7U0FDcEQsQ0FBQyxDQUFDO1FBQ0gsT0FBTztJQUNYLENBQUM7SUFFRCxNQUFNLHFIQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQy9DLENBQUM7QUFFTSxTQUFTLHFCQUFxQjtJQUNqQyxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jcm0uY29yZS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9BcHBDb25maWcuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0ludGVybmFsVGFzay5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvSW50ZXJuYWxUYXNrVHlwZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZmVhdHVyZXMvY3JlYXRlSW50ZXJuYWxUYXNrL2NyZWF0ZUludGVybmFsVGFzay5jb25zdGFudHMudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZmVhdHVyZXMvY3JlYXRlSW50ZXJuYWxUYXNrL2NyZWF0ZUludGVybmFsVGFzay5zZXJ2aWNlLnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvbW1hbmRzL2NyZWF0ZUludGVybmFsVGFzay5jb21tYW5kLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vID09PT0gRm9ybVR5cGUgQ29uc3RhbnRzID09PT1cclxuZXhwb3J0IGNvbnN0IEZPUk1fVFlQRSA9IHtcclxuICAgIFVuZGVmaW5lZDogMCxcclxuICAgIENyZWF0ZTogMSxcclxuICAgIFVwZGF0ZTogMixcclxuICAgIFJlYWRPbmx5OiAzLFxyXG4gICAgRGlzYWJsZWQ6IDQsXHJcbiAgICBRdWlja0NyZWF0ZTogNSxcclxuICAgIEJ1bGtFZGl0OiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgRm9ybVR5cGUgPSB0eXBlb2YgRk9STV9UWVBFW2tleW9mIHR5cGVvZiBGT1JNX1RZUEVdO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZvcm1UeXBlSGVscGVyID0ge1xyXG4gICAgZ2V0KGZjOiBhbnkpOiBGb3JtVHlwZSB8IDAge1xyXG4gICAgICAgIHJldHVybiBmYz8udWk/LmdldEZvcm1UeXBlPy4oKSA/PyBGT1JNX1RZUEUuVW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIGlzQ3JlYXRlTGlrZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH0sXHJcbiAgICBpc0VkaXRhYmxlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlVwZGF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyUmVmIHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIiB8IFwidGVhbVwiO1xyXG4gICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gVHlwZXMgc2hhcmVkIGFjcm9zcyBlbmdpbmUgJiBlbnRpdGllcyAtLS0tXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCIgfCBcIm5vdG51bGxcIjsgLy8gYWxpYXNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcclxuICAgIC8qKiBMb2dpY2FsIG5hbWUgKHN1cHBvcnRzIGRvdC1ub3RhdGlvbiBmb3IgbG9va3VwIHByb2plY3Rpb25zOiBlLmcuLCBcInByaW1hcnljb250YWN0aWQubmFtZVwiKS4gKi9cclxuICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKiogT3B0aW9uYWwgdmFsdWUgZm9yIGNvbXBhcmlzb25zIChvbWl0dGVkIGZvciBudWxsLW9wZXJhdG9ycykuICovXHJcbiAgICB2YWx1ZT86IHVua25vd247XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgbWFuZGF0b3J5Pzogc3RyaW5nW107XHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gQU5ELWNvbmp1bmN0aW9uOyBlbXB0eS91bmRlZmluZWQg4oeSIHJ1bGUgYWx3YXlzIG1hdGNoZXNcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdD86IHN0cmluZ1tdO1xyXG4gICAgcnVsZXM/OiBSdWxlW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVzaW5lc3NVbml0Q29uZmlnIHtcclxuICAgIHZlcnNpb246IG51bWJlcjtcclxuICAgIGVudGl0aWVzOiBSZWNvcmQ8c3RyaW5nLCBFbnRpdHlDb25maWc+O1xyXG59XHJcblxyXG4vKiogTGlnaHR3ZWlnaHQgY29tcGFyYWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxvb2t1cCAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgaWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICBuYW1lOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBDb3JlIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcbiAgICBzdGF0aWMgZ2V0IFhybSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkuWHJtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBMb3dlcmNhc2UsIHN0cmlwIGJyYWNlczsgcmV0dXJucyBlbXB0eSBzdHJpbmcgaWYgZmFsc3kgaW5wdXQuICovXHJcbiAgICBzdGF0aWMgc2FuaXRpemVHdWlkKGlkPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKGlkIHx8IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdW5pcXVlPFQ+KGFycjogVFtdKTogVFtdIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFRoaW4gV2ViIEFQSSB3cmFwcGVyIC0tLS1cclxuZXhwb3J0IGNsYXNzIEFwaUNsaWVudCB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5JZCA9IFV0aWwuc2FuaXRpemVHdWlkKGlkKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lLCBjbGVhbklkLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGZldGNoWG1sKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGZldGNoWG1sOiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgP2ZldGNoWG1sPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGZldGNoWG1sLnRyaW0oKSl9YDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCB1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBleGVjdXRlKHJlcXVlc3Q6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBhc3NvY2lhdGVNYW55VG9NYW55KFxyXG4gICAgICAgIHBhcmVudEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRJZDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0aW9uc2hpcFNjaGVtYU5hbWU6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkRW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRJZHM6IHN0cmluZ1tdXHJcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCByZXEgPSB7XHJcbiAgICAgICAgICAgIHRhcmdldDogeyBlbnRpdHlUeXBlOiBwYXJlbnRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocGFyZW50SWQpIH0sXHJcbiAgICAgICAgICAgIHJlbGF0ZWRFbnRpdGllczogcmVsYXRlZElkcy5tYXAoKHJpZCkgPT4gKHsgZW50aXR5VHlwZTogcmVsYXRlZEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChyaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0gYXMgYW55O1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEFwaUNsaWVudC5leGVjdXRlKHJlcSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBBc3NvY2lhdGlvbiBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gRm9ybSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIEZvcm1Db250cm9sSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRDdXJyZW50SWQoZmM6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkUmF3ID0gZmM/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSYXcgPyBVdGlsLnNhbml0aXplR3VpZChpZFJhdykgOiBudWxsO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldExvb2t1cElkKGZjOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB2ID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZSk/LmdldFZhbHVlPy4oKTtcclxuICAgICAgICByZXR1cm4gdiAmJiB2Lmxlbmd0aCA/IFV0aWwuc2FuaXRpemVHdWlkKHZbMF0uaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEaXNhYmxlIG9yIGVuYWJsZSBhbGwgZGlzYWJsZWFibGUgY29udHJvbHMgaW5zaWRlIGEgdGFiIHNlY3Rpb24gKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZEFsbENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjb250cm9sOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkgeyBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBPcHRpb25hbDogc3BlY2lhbCBoYW5kbGluZyBmb3Igc3ViZ3JpZHMsIHdoaWNoIGRvIG5vdCBzdXBwb3J0IHNldERpc2FibGVkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgLyoqICAgXHJcbiAgICogZGUvYWN0aXZhdGUgb25seSB0aGUgc3BlY2lmaWVkIGNvbnRyb2xzIChieSBuYW1lKSBpbiBhIHNlY3Rpb24uICAgXHJcbiAgICogRG9lcyBub3RoaW5nIGlmIHRoZSBsaXN0IGlzIGVtcHR5IG9yIGNvbnRyb2xzIGFyZSBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgY29udHJvbE5hbWVzOiByZWFkb25seSBzdHJpbmdbXSxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjb250cm9sTmFtZXMpIHx8IGNvbnRyb2xOYW1lcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgY29udHJvbE5hbWVzXHJcbiAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IEZvcm1Db250cm9sSGVscGVyLmZpbmRDb250cm9sSW5TZWN0aW9uKHNlY3Rpb24sIG5hbWUpKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChjKTogYyBpcyBYcm0uQ29udHJvbHMuQ29udHJvbCA9PiBCb29sZWFuKGMpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoY29udHJvbCkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbCwgZGlzYWJsZWQpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQ29udHJvbEluU2VjdGlvbihcclxuICAgICAgICBzZWN0aW9uOiBYcm0uQ29udHJvbHMuU2VjdGlvbixcclxuICAgICAgICBuYW1lOiBzdHJpbmdcclxuICAgICk6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICAvLyBwcmltYXJ5OiBkaXJlY3QgcGVyIE5hbWVcclxuICAgICAgICBjb25zdCBkaXJlY3QgPSBzZWN0aW9uLmNvbnRyb2xzLmdldD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChkaXJlY3QpIHJldHVybiBkaXJlY3Q7XHJcblxyXG4gICAgICAgIC8vIEZhbGxiYWNrOiBzZWFyY2ggYnkgZ2V0TmFtZSgpIG92ZXIgdGhlIGNvbGxlY3Rpb25cclxuICAgICAgICBsZXQgZm91bmQ6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYy5nZXROYW1lPy4oKSA9PT0gbmFtZSkgZm91bmQgPSBjO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIVZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIGlmIGRpZmZlcmVudFxyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY29udHJvbC5nZXREaXNhYmxlZD8uKCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gXCJib29sZWFuXCIgJiYgY3VycmVudCA9PT0gZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIC8qIG5vLW9wICovXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEhlbHBlciB7XHJcbiAgICBzdGF0aWMgdHJ5UmVmcmVzaFN1YmdyaWQoZmM6IGFueSwgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBmYz8uZ2V0Q29udHJvbD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChncmlkPy5yZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBncmlkLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmYz8udWk/LnJlZnJlc2hSaWJib24/LigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFZpc2liaWxpdHkgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBhIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBkaXNhYmxlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0RGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTZXRzIHJlcXVpcmVkIGxldmVsIG9uIGFuIGF0dHJpYnV0ZS9jb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0UmVxdWlyZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgaXNSZXF1aXJlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChhdHRyPy5zZXRSZXF1aXJlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyLnNldFJlcXVpcmVkTGV2ZWwoaXNSZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUNvbnRyb2xIZWxwZXIuZ2V0TG9va3VwSWQoZmMsIGxvb2t1cEF0dHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gISFjdXJyZW50ICYmIFV0aWwuc2FuaXRpemVHdWlkKGN1cnJlbnQpID09PSBVdGlsLnNhbml0aXplR3VpZCh0YXJnZXRJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFR5cGUgZ3VhcmQ6IGNvbnRyb2wgc3VwcG9ydHMgc2V0RGlzYWJsZWQgKi9cclxuICAgIHN0YXRpYyBpc0Rpc2FibGVhYmxlKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sKTogY29udHJvbCBpcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sIHtcclxuICAgICAgICByZXR1cm4gXCJzZXREaXNhYmxlZFwiIGluIGNvbnRyb2wgJiYgdHlwZW9mIChjb250cm9sIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wpLnNldERpc2FibGVkID09PSBcImZ1bmN0aW9uXCI7XHJcbiAgICB9ICAgIFxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBkaWFsb2cgaGVscGVyIC0tLS1cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBSZXN1bHQge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZztcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBEaWFsb2dIZWxwZXIge1xyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHJpYnV0ZTogc3RyaW5nLFxyXG4gICAgICAgIGlkczogc3RyaW5nW10sXHJcbiAgICAgICAgb3B0aW9ucz86IFBhcnRpYWw8eyBhbGxvd011bHRpU2VsZWN0OiBib29sZWFuOyBkaXNhYmxlTXJ1OiBib29sZWFuOyBkZWZhdWx0Vmlld0lkOiBzdHJpbmcgfT5cclxuICAgICk6IFByb21pc2U8TG9va3VwUmVzdWx0W10+IHtcclxuICAgICAgICBjb25zdCBpblZhbHVlcyA9IGlkc1xyXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gYDx2YWx1ZSB1aXR5cGU9XCIke2VudGl0eUxvZ2ljYWx9XCI+eyR7VXRpbC5zYW5pdGl6ZUd1aWQoaWQpfX08L3ZhbHVlPmApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJYbWwgPSBgXHJcbiAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtpZEF0dHJpYnV0ZX1cIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAke2luVmFsdWVzfVxyXG4gICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgIDwvZmlsdGVyPmAudHJpbSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb29rdXBPcHRpb25zOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGFsbG93TXVsdGlTZWxlY3Q6IG9wdGlvbnM/LmFsbG93TXVsdGlTZWxlY3QgPz8gdHJ1ZSxcclxuICAgICAgICAgICAgZGVmYXVsdEVudGl0eVR5cGU6IGVudGl0eUxvZ2ljYWwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGVzOiBbZW50aXR5TG9naWNhbF0sXHJcbiAgICAgICAgICAgIGZpbHRlcnM6IFt7IGVudGl0eUxvZ2ljYWxOYW1lOiBlbnRpdHlMb2dpY2FsLCBmaWx0ZXJYbWwgfV0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNcnU6IG9wdGlvbnM/LmRpc2FibGVNcnUgPz8gdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8uZGVmYXVsdFZpZXdJZCkgbG9va3VwT3B0aW9ucy5kZWZhdWx0Vmlld0lkID0gb3B0aW9ucy5kZWZhdWx0Vmlld0lkO1xyXG5cclxuICAgICAgICByZXR1cm4gKGF3YWl0IFV0aWwuWHJtLlV0aWxpdHkubG9va3VwT2JqZWN0cyhsb29rdXBPcHRpb25zKSkgYXMgTG9va3VwUmVzdWx0W107XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gR2VuZXJpYyBsb29rdXAgT0RhdGEgc2VydmljZSAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRGaXJzdElkQnlGaWx0ZXIoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIG9kYXRhRmlsdGVyOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBgPyRzZWxlY3Q9JHtpZEF0dHJ9JiRmaWx0ZXI9JHtvZGF0YUZpbHRlcn1gO1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWwsIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IHJlcz8uZW50aXRpZXM/LlswXTtcclxuICAgICAgICBjb25zdCBpZCA9IHJvdz8uW2lkQXR0cl0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGdldElkQnlFcXVhbGl0eShcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgYXR0cjogc3RyaW5nLFxyXG4gICAgICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBsaXQgPSB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgIDogU3RyaW5nKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXJzdElkQnlGaWx0ZXIoZW50aXR5TG9naWNhbCwgaWRBdHRyLCBgKCR7YXR0cn0gZXEgJHtsaXR9KWApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRm9ybVdhaXQge1xyXG4gICAgc3RhdGljIHdhaXRGb3JMb29rdXBWYWx1ZShmYzogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHRpbWVvdXRNcyA9IDYwMDApOiBQcm9taXNlPFhybS5Mb29rdXBWYWx1ZSB8IG51bGw+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGVOYW1lKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghYXR0cikgcmV0dXJuIHJlc29sdmUobnVsbCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBub3cgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICBpZiAobm93Py5pZCkgcmV0dXJuIHJlc29sdmUobm93KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7IHRyeSB7IGF0dHIucmVtb3ZlT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfSB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbkNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkb25lKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgICAgIGlmICh2Py5pZCkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKHYpOyB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0cnkgeyBhdHRyLmFkZE9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChvbkNoYW5nZSwgMCk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgaWYgKCFkb25lKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUobnVsbCk7IH0gfSwgdGltZW91dE1zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE93bmVySGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRPd25lckF0dHJpYnV0ZShmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiAoZmM/LmdldEF0dHJpYnV0ZT8uKG93bmVyQXR0ck5hbWUpID8/IG51bGwpIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IE93bmVyUmVmIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpPy5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICBpZiAoIXY/LmlkIHx8ICF2LmVudGl0eVR5cGUpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiB7IGlkOiBVdGlsLnNhbml0aXplR3VpZCh2LmlkKSwgZW50aXR5VHlwZTogdi5lbnRpdHlUeXBlIGFzIGFueSwgbmFtZTogdi5uYW1lID8/IG51bGwgfTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2V0T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nLCBvd25lcjogT3duZXJSZWYpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk7XHJcbiAgICAgICAgaWYgKCFhdHRyKSByZXR1cm47XHJcbiAgICAgICAgYXR0ci5zZXRWYWx1ZShbe1xyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQob3duZXIuaWQpLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlOiBvd25lci5lbnRpdHlUeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiBvd25lci5uYW1lID8/IHVuZGVmaW5lZFxyXG4gICAgICAgIH0gYXMgYW55XSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGlzU2FtZU93bmVyKGE/OiBPd25lclJlZiB8IG51bGwsIGI/OiBPd25lclJlZiB8IG51bGwpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gYS5lbnRpdHlUeXBlID09PSBiLmVudGl0eVR5cGUgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoYS5pZCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKGIuaWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJpYyBzZXJ2aWNlOiBMb2FkIG93bmVyIChVc2VyIG9yIFRlYW0pIGZvciBhbnkgcmVjb3JkICovXHJcbmV4cG9ydCBjbGFzcyBPd25lclNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldE93bmVyUmVmKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWNvcmRJZDogc3RyaW5nLFxyXG4gICAgICAgIG93bmVyQXR0ck5hbWUgPSBcIm93bmVyaWRcIlxyXG4gICAgKTogUHJvbWlzZTxPd25lclJlZiB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKHJlY29yZElkKTtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gRm9yIHBvbHltb3JwaGljIG93bmVyIGxvb2t1cHMsIGV4cGFuZCBkZWRpY2F0ZWQgbmF2IHByb3BzIHRvIGF2b2lkIHByb3BlcnR5LW5vdC1mb3VuZCBlcnJvcnNcclxuICAgICAgICBjb25zdCBleHBhbmQgPSBgPyRzZWxlY3Q9JHtvd25lckF0dHJOYW1lfSYkZXhwYW5kPW93bmluZ3VzZXIoJHNlbGVjdD1zeXN0ZW11c2VyaWQsZnVsbG5hbWUpLG93bmluZ3RlYW0oJHNlbGVjdD10ZWFtaWQsbmFtZSlgO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsLCBpZCwgZXhwYW5kKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXNlciA9IHJlYz8uW1wib3duaW5ndXNlclwiXTtcclxuICAgICAgICBpZiAodXNlcj8uc3lzdGVtdXNlcmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodXNlci5zeXN0ZW11c2VyaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLmZ1bGxuYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlYW0gPSByZWM/LltcIm93bmluZ3RlYW1cIl07XHJcbiAgICAgICAgaWYgKHRlYW0/LnRlYW1pZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHRlYW0udGVhbWlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwidGVhbVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdGVhbS5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogU2VjdXJpdHktcmVsYXRlZCBoZWxwZXJzICovXHJcbmV4cG9ydCBjbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xyXG4gICAgICAgIC8qKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBpZCBmcm9tIFhybSBjb250ZXh0ICovXHJcbiAgICAgICAgc3RhdGljIGdldEN1cnJlbnRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuWHJtPy5VdGlsaXR5Py5nZXRHbG9iYWxDb250ZXh0Py4oKT8udXNlclNldHRpbmdzPy51c2VySWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybnMgcm9sZSBuYW1lcyBvZiB0aGUgY3VycmVudCB1c2VyICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGdldEN1cnJlbnRVc2VyUm9sZXMoKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W10+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuZ2V0Q3VycmVudFVzZXJJZCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1c2VySWQpIHJldHVybiBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGZXRjaFhNTCBvdmVyIHN5c3RlbXVzZXJyb2xlcyAoTjpOKSB0byByb2xlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgICAgIDxmZXRjaCB2ZXJzaW9uPVwiMS4wXCIgZGlzdGluY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwicm9sZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJyb2xlaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2Vycm9sZXNcIiBmcm9tPVwicm9sZWlkXCIgdG89XCJyb2xlaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJcIiBmcm9tPVwic3lzdGVtdXNlcmlkXCIgdG89XCJzeXN0ZW11c2VyaWRcIiBhbGlhcz1cInVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7dXNlcklkfVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9mZXRjaD5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5mZXRjaFhtbChcInJvbGVcIiwgZmV0Y2hYbWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXMuZW50aXRpZXMgfHwgW10pLm1hcCgoZSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKGVbXCJyb2xlaWRcIl0gPz8gZVtcIl9yb2xlaWRfdmFsdWVcIl0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlW1wibmFtZVwiXSBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICB9KSkuZmlsdGVyKHIgPT4gISFyLmlkICYmICEhci5uYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDaGVja3MgaWYgY3VycmVudCB1c2VyIGhhcyBvbmUgb2YgdGhlIHByb3ZpZGVkIHJvbGUgbmFtZXMgKGNhc2UtaW5zZW5zaXRpdmUpICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGhhc0N1cnJlbnRVc2VyUm9sZSguLi5yb2xlTmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3YW50ZWQgPSBuZXcgU2V0KHJvbGVOYW1lcy5tYXAobiA9PiBuLnRyaW0oKS50b0xvd2VyQ2FzZSgpKS5maWx0ZXIoQm9vbGVhbikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhbnRlZC5zaXplID09PSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb2xlcyA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudFVzZXJSb2xlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvbGVzLnNvbWUociA9PiB3YW50ZWQuaGFzKHIubmFtZS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBjb250cm9sIHZpZXcgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBWaWV3SGVscGVyIHtcclxuICAgIC8qKiBSZXN0cmljdCBhIGxvb2t1cCBjb250cm9sIHRvIHNwZWNpZmljIGVudGl0eSB0eXBlcyAqL1xyXG4gICAgc3RhdGljIHNldEVudGl0eVR5cGVzKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGVudGl0eVR5cGVzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjdHJsPy5zZXRFbnRpdHlUeXBlcz8uKGVudGl0eVR5cGVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkIGEgY3VzdG9tIHZpZXcgdG8gYSBsb29rdXAgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIGFkZEN1c3RvbVZpZXcoXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICBjb250cm9sTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGVudGl0eU5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3RGlzcGxheU5hbWU6IHN0cmluZyxcclxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nLFxyXG4gICAgICAgIGxheW91dFhtbDogc3RyaW5nLFxyXG4gICAgICAgIHNldEFzRGVmYXVsdDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWN0cmw/LmFkZEN1c3RvbVZpZXcpIHJldHVybjtcclxuICAgICAgICAgICAgY3RybC5hZGRDdXN0b21WaWV3KHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbC50cmltKCksIGxheW91dFhtbC50cmltKCksIHNldEFzRGVmYXVsdCk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZHMgYSBjdXN0b20gdmlldyBmb3Igb3duZXIgbG9va3VwIHRvIHNob3cgb25seSB0ZWFtcyB0aGUgY3VycmVudCB1c2VyIGJlbG9uZ3MgdG8uICovXHJcbiAgICBzdGF0aWMgYWRkT3duZXJUZWFtVmlld0ZvckN1cnJlbnRVc2VyKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcgPSBcIm93bmVyaWRcIik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBcInRlYW1cIjtcclxuICAgICAgICBjb25zdCB2aWV3RGlzcGxheU5hbWUgPSBcIk93bmVyVGVhbUxvb2t1cFZpZXdcIjtcclxuICAgICAgICBjb25zdCB2aWV3SWQgPSBcInswMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDF9XCI7XHJcblxyXG4gICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICA8ZmV0Y2g+XHJcbiAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJ0ZWFtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiYnVzaW5lc3N1bml0aWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwibmV2X293bmVydGVhbTJzeXN0ZW11c2VyXCIgZnJvbT1cInRlYW1pZFwiIHRvPVwidGVhbWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxLXVzZXJpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgPC9mZXRjaD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBjb25zdCBsYXlvdXRYbWwgPSBgXHJcbiAgICAgICAgICAgIDxncmlkIG5hbWU9J3Jlc3VsdHNldCcgb2JqZWN0PScxJyBqdW1wPSd0ZWFtaWQnIHNlbGVjdD0nMScgaWNvbj0nMScgcHJldmlldz0nMSc+XHJcbiAgICAgICAgICAgICAgICA8cm93IG5hbWU9J3Jlc3VsdCcgaWQ9J3RlYW1pZCc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nbmFtZScgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSdidXNpbmVzc3VuaXRpZCcgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgIDwvcm93PlxyXG4gICAgICAgICAgICA8L2dyaWQ+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgTG9va3VwVmlld0hlbHBlci5hZGRDdXN0b21WaWV3KGZjLCBjb250cm9sTmFtZSwgdmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLCBsYXlvdXRYbWwsIHRydWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmllbGRWYWxpZGF0b3Ige1xyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZXMgYSBudW1lcmljIHRleHQgZmllbGQgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlxyXG4gICAgICogQ2FuIGJlIHVzZWQgZm9yIE9uQ2hhbmdlIGV2ZW50cyBhbmQgb3B0aW9uYWxseSByZWNlaXZlcyB0aGUgYXR0cmlidXRlIG5hbWUgYXMgYSBwYXJhbWV0ZXIuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB2YWxpZGF0ZUJpZ051bWJlcihcclxuICAgICAgICBleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCxcclxuICAgICAgICBhdHRyaWJ1dGVOYW1lPzogc3RyaW5nXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKSBhcyBYcm0uRm9ybUNvbnRleHQ7XHJcblxyXG4gICAgICAgIC8vIElmIG5vIGF0dHJpYnV0ZSBuYW1lIGlzIHByb3ZpZGVkIOKGkiB1c2UgZXZlbnQgc291cmNlXHJcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGVOYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U291cmNlID0gZXhlY3V0aW9uQ29udGV4dC5nZXRFdmVudFNvdXJjZSgpIGFzIFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZTtcclxuICAgICAgICAgICAgaWYgKCFldmVudFNvdXJjZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lID0gZXZlbnRTb3VyY2UuZ2V0TmFtZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSBmb3JtQ29udGV4dC5nZXRDb250cm9sKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w7XHJcblxyXG4gICAgICAgIGlmICghYXR0cmlidXRlIHx8ICFjb250cm9sKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbklkID0gYCR7YXR0cmlidXRlTmFtZX1fQmlnTnVtYmVyRXJyb3JgO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IGF0dHJpYnV0ZS5nZXRWYWx1ZSgpIGFzIHN0cmluZyB8IG51bGw7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBmaWVsZCBpcyB0cnVseSBlbXB0eSAobnVsbCkg4oaSIGNsZWFyIGVycm9yIGFuZCBleGl0XHJcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24obm90aWZpY2F0aW9uSWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBLZWVwIG9yaWdpbmFsIHN0cmluZywgYnV0IHdvcmsgb24gYSBjb3B5XHJcbiAgICAgICAgY29uc3QgcmF3ID0gdmFsdWUudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgZW50ZXJlZCBvbmx5IHdoaXRlc3BhY2Ug4oaSIHRyZWF0IGFzIGludmFsaWRcclxuICAgICAgICBpZiAocmF3LnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIGEgbnVtZXJpYyB2YWx1ZSB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXCIsXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYWxsIHdoaXRlc3BhY2UgZm9yIHZhbGlkYXRpb24gLyBzdG9yYWdlXHJcbiAgICAgICAgY29uc3QgZGlnaXRzT25seSA9IHJhdy5yZXBsYWNlKC9cXHMrL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAvLyBWYWxpZGF0aW9uOiBvbmx5IGRpZ2l0cywgbWF4LiAxMiBjaGFyYWN0ZXJzXHJcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkezEsMTJ9JC8udGVzdChkaWdpdHNPbmx5KTtcclxuXHJcbiAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24oXHJcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSBlbnRlciBhIG51bWVyaWMgdmFsdWUgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlwiLFxyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVmFsaWQg4oaSIGNsZWFyIG5vdGlmaWNhdGlvbiBhbmQgc3RvcmUgcmF3IHZhbHVlIHdpdGhvdXQgc3BhY2VzXHJcbiAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbihub3RpZmljYXRpb25JZCk7XHJcbiAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKGRpZ2l0c09ubHkpO1xyXG4gICAgfVxyXG59XHJcbiIsImV4cG9ydCBjb25zdCBBUFBDT05GSUcgPSB7XHJcbiAgICBlbnRpdHk6IFwibmV2X2NvbmZpZ1wiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwibmV2X2NvbmZpZ2lkXCIsXHJcbiAgICAgICAga2V5OiBcIm5ldl9LZXlcIixcbiAgICAgICAganNvbjogXCJuZXZfVmFsdWVfblRleHRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsImV4cG9ydCBjb25zdCBJTlRFUk5BTFRBU0sgPSB7XHJcbiAgICBlbnRpdHk6IFwibmV2X2ludGVybmFsdGFza1wiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwibmV2X2ludGVybmFsdGFza2lkXCIsXHJcbiAgICAgICAgc3ViamVjdDogXCJuZXZfc3ViamVjdFwiLFxyXG4gICAgICAgIGNvbnRhY3RpZDogXCJuZXZfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueWlkOiBcIm5ldl9jb21wYW55aWRcIixcclxuICAgICAgICBwb3J0Zm9saW9pZDogXCJuZXZfcG9ydGZvbGlvaWRcIixcclxuICAgICAgICBpbnRlcm5hbFRhc2tUeXBlOiBcIm5ldl9pbnRlcm5hbHRhc2t0eXBlXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuIiwiZXhwb3J0IGNvbnN0IElOVEVSTkFMVEFTS1RZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwibmV2X2ludGVybmFsdGFza3R5cGVcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIm5ldl9pbnRlcm5hbHRhc2t0eXBlaWRcIixcclxuICAgICAgICBuYW1lOiBcIm5ldl9uYW1lXCIsXHJcbiAgICAgICAgaW50ZXJuYWx0YXNrdHlwZWNvZGVuYW1lOiBcIm5ldl9pbnRlcm5hbHRhc2t0eXBlY29kZW5hbWVcIlxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuXHJcbiIsImV4cG9ydCBjb25zdCBDUkVBVEVfSU5URVJOQUxfVEFTSyA9IHtcbiAgICBjb25maWdLZXk6IFwiaWRJbnRlcm5hbFRhc2tEaWFsb2dDb25maWdcIixcbiAgICBkaWFsb2dXZWJSZXNvdXJjZU5hbWU6IFwibWh3cm1iX2NyZWF0ZUludGVybmFsVGFza0RpYWxvZy5odG1sXCIsXG59IGFzIGNvbnN0O1xuXG4iLCJpbXBvcnQgeyBJTlRFUk5BTFRBU0sgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvSW50ZXJuYWxUYXNrLmVudGl0eVwiO1xyXG5pbXBvcnQgeyBJTlRFUk5BTFRBU0tUWVBFIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL0ludGVybmFsVGFza1R5cGUuZW50aXR5XCI7XHJcbmltcG9ydCB7IEFQUENPTkZJRyB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9BcHBDb25maWcuZW50aXR5XCI7XHJcbmltcG9ydCB7IFV0aWwgfSBmcm9tIFwiLi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBDUkVBVEVfSU5URVJOQUxfVEFTSyB9IGZyb20gXCIuL2NyZWF0ZUludGVybmFsVGFzay5jb25zdGFudHNcIjtcclxuaW1wb3J0IHR5cGUge1xuICAgIENyZWF0ZUludGVybmFsVGFza0F2YWlsYWJpbGl0eSxcbiAgICBDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcsXG4gICAgQ3JlYXRlSW50ZXJuYWxUYXNrRGlhbG9nRGF0YSxcbiAgICBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2UsXG4gICAgQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5LFxyXG4gICAgSW50ZXJuYWxUYXNrVHlwZU9wdGlvbixcclxufSBmcm9tIFwiLi9jcmVhdGVJbnRlcm5hbFRhc2sudHlwZXNcIjtcclxuXHJcbmNvbnN0IEVNUFRZX0NPTkZJRzogQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnID0geyB2ZXJzaW9uOiAxLCB0YXNrVHlwZXM6IFtdIH07XHJcblxyXG5sZXQgY3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnQ2FjaGU6IENyZWF0ZUludGVybmFsVGFza0NvbmZpZyB8IG51bGwgPSBudWxsO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFhybSgpOiBhbnkge1xyXG4gICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5Ycm0gPz8gKHdpbmRvdy5wYXJlbnQgYXMgYW55KT8uWHJtO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaXNTdXBwb3J0ZWRTb3VyY2VFbnRpdHkoZW50aXR5TmFtZTogc3RyaW5nKTogZW50aXR5TmFtZSBpcyBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHkge1xyXG4gICAgcmV0dXJuIGVudGl0eU5hbWUgPT09IFwiY29udGFjdFwiIHx8IGVudGl0eU5hbWUgPT09IFwiYWNjb3VudFwiIHx8IGVudGl0eU5hbWUgPT09IFwid3JtYl9wb3J0Zm9saW9cIjtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFNvdXJjZUZyb21Gb3JtKGZvcm1Db250ZXh0OiBYcm0uRm9ybUNvbnRleHQpOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2UgfCBudWxsIHtcclxuICAgIGNvbnN0IGVudGl0eU5hbWUgPSBmb3JtQ29udGV4dD8uZGF0YT8uZW50aXR5Py5nZXRFbnRpdHlOYW1lPy4oKTtcclxuICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQoZm9ybUNvbnRleHQ/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpKTtcclxuICAgIGlmICghZW50aXR5TmFtZSB8fCAhaWQgfHwgIWlzU3VwcG9ydGVkU291cmNlRW50aXR5KGVudGl0eU5hbWUpKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkLFxyXG4gICAgICAgIGVudGl0eU5hbWUsXHJcbiAgICAgICAgbmFtZTogZm9ybUNvbnRleHQ/LmRhdGE/LmVudGl0eT8uZ2V0UHJpbWFyeUF0dHJpYnV0ZVZhbHVlPy4oKSA/PyBudWxsLFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGVuY29kZURpYWxvZ0RhdGEoc291cmNlOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2UpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudChKU09OLnN0cmluZ2lmeShzb3VyY2UpKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlRGlhbG9nRGF0YShzZWFyY2g6IHN0cmluZyA9IHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpOiBDcmVhdGVJbnRlcm5hbFRhc2tEaWFsb2dEYXRhIHwgbnVsbCB7XHJcbiAgICBjb25zdCBwYXJhbXMgPSBuZXcgVVJMU2VhcmNoUGFyYW1zKHNlYXJjaCk7XHJcbiAgICBjb25zdCByYXcgPSBwYXJhbXMuZ2V0KFwiZGF0YVwiKTtcclxuICAgIGlmICghcmF3KSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoZGVjb2RlVVJJQ29tcG9uZW50KHJhdykpIGFzIENyZWF0ZUludGVybmFsVGFza0RpYWxvZ0RhdGE7XHJcbiAgICAgICAgaWYgKCFwYXJzZWQ/LmlkIHx8ICFpc1N1cHBvcnRlZFNvdXJjZUVudGl0eShwYXJzZWQuZW50aXR5TmFtZSkpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIC4uLnBhcnNlZCxcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcnNlZC5pZCksXHJcbiAgICAgICAgICAgIG5hbWU6IHBhcnNlZC5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgfTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbkNyZWF0ZUludGVybmFsVGFza0RpYWxvZyhzb3VyY2U6IENyZWF0ZUludGVybmFsVGFza1NvdXJjZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgYXdhaXQgZ2V0WHJtKCkuTmF2aWdhdGlvbi5uYXZpZ2F0ZVRvKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgcGFnZVR5cGU6IFwid2VicmVzb3VyY2VcIixcclxuICAgICAgICAgICAgd2VicmVzb3VyY2VOYW1lOiBDUkVBVEVfSU5URVJOQUxfVEFTSy5kaWFsb2dXZWJSZXNvdXJjZU5hbWUsXHJcbiAgICAgICAgICAgIGRhdGE6IGVuY29kZURpYWxvZ0RhdGEoc291cmNlKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgdGFyZ2V0OiAyLFxyXG4gICAgICAgICAgICBwb3NpdGlvbjogMSxcclxuICAgICAgICAgICAgd2lkdGg6IHsgdmFsdWU6IDUwMCwgdW5pdDogXCJweFwiIH0sXHJcbiAgICAgICAgICAgIGhlaWdodDogeyB2YWx1ZTogMzIwLCB1bml0OiBcInB4XCIgfSxcclxuICAgICAgICAgICAgdGl0bGU6IFwiQ3JlYXRlIEludGVybmFsIFRhc2tcIixcclxuICAgICAgICB9XHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q3VycmVudFVzZXJSb2xlTmFtZXMoKTogc3RyaW5nW10ge1xyXG4gICAgY29uc3Qgcm9sZXMgPSBnZXRYcm0oKT8uVXRpbGl0eT8uZ2V0R2xvYmFsQ29udGV4dD8uKCk/LnVzZXJTZXR0aW5ncz8ucm9sZXM7XHJcbiAgICBjb25zdCBuYW1lczogc3RyaW5nW10gPSBbXTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgcm9sZXM/LmZvckVhY2g/Ligocm9sZTogeyBuYW1lPzogc3RyaW5nIH0pID0+IHtcclxuICAgICAgICAgICAgaWYgKHJvbGU/Lm5hbWUpIG5hbWVzLnB1c2gocm9sZS5uYW1lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBuYW1lcztcclxuICAgIH1cclxuICAgIHJldHVybiBuYW1lcztcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGhhc0FueVJvbGUocm9sZU5hbWVzPzogcmVhZG9ubHkgc3RyaW5nW10sIHVzZXJSb2xlTmFtZXMgPSBnZXRDdXJyZW50VXNlclJvbGVOYW1lcygpKTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXJvbGVOYW1lcz8ubGVuZ3RoKSByZXR1cm4gdHJ1ZTtcclxuICAgIGNvbnN0IGF2YWlsYWJsZSA9IG5ldyBTZXQodXNlclJvbGVOYW1lcy5tYXAoKG5hbWUpID0+IG5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgIHJldHVybiByb2xlTmFtZXMuc29tZSgobmFtZSkgPT4gYXZhaWxhYmxlLmhhcyhuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpKSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGlzQWxsb3dlZEZvclNvdXJjZShvcHRpb246IEludGVybmFsVGFza1R5cGVPcHRpb24sIHNvdXJjZUVudGl0eT86IENyZWF0ZUludGVybmFsVGFza1NvdXJjZUVudGl0eSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFzb3VyY2VFbnRpdHkgfHwgIW9wdGlvbi5zb3VyY2VFbnRpdGllcz8ubGVuZ3RoKSByZXR1cm4gdHJ1ZTtcclxuICAgIHJldHVybiBvcHRpb24uc291cmNlRW50aXRpZXMuaW5jbHVkZXMoc291cmNlRW50aXR5KTtcclxufVxyXG5cclxuZnVuY3Rpb24gbm9ybWFsaXplQ29uZmlnT3B0aW9uKHJhdzogYW55KTogSW50ZXJuYWxUYXNrVHlwZU9wdGlvbiB8IG51bGwge1xyXG4gICAgaWYgKCFyYXcgfHwgdHlwZW9mIHJhdyAhPT0gXCJvYmplY3RcIikgcmV0dXJuIG51bGw7XHJcbiAgICBjb25zdCBrZXkgPSBTdHJpbmcocmF3LmtleSA/PyBcIlwiKS50cmltKCk7XHJcbiAgICBjb25zdCBsYWJlbCA9IFN0cmluZyhyYXcubGFiZWwgPz8gXCJcIikudHJpbSgpO1xyXG4gICAgY29uc3QgdGFza1R5cGVDb2RlTmFtZSA9IFN0cmluZyhyYXcudGFza1R5cGVDb2RlTmFtZSA/PyBcIlwiKS50cmltKCk7XHJcbiAgICBpZiAoIWtleSB8fCAhbGFiZWwgfHwgIXRhc2tUeXBlQ29kZU5hbWUpIHJldHVybiBudWxsO1xyXG5cclxuICAgIGNvbnN0IGFsbG93ZWRSb2xlcyA9IEFycmF5LmlzQXJyYXkocmF3LmFsbG93ZWRSb2xlcylcclxuICAgICAgICA/IHJhdy5hbGxvd2VkUm9sZXMubWFwKChyb2xlOiB1bmtub3duKSA9PiBTdHJpbmcocm9sZSkudHJpbSgpKS5maWx0ZXIoQm9vbGVhbilcclxuICAgICAgICA6IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCBzb3VyY2VFbnRpdGllcyA9IEFycmF5LmlzQXJyYXkocmF3LnNvdXJjZUVudGl0aWVzKVxyXG4gICAgICAgID8gcmF3LnNvdXJjZUVudGl0aWVzLmZpbHRlcihpc1N1cHBvcnRlZFNvdXJjZUVudGl0eSlcclxuICAgICAgICA6IHVuZGVmaW5lZDtcclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGtleSxcclxuICAgICAgICBsYWJlbCxcclxuICAgICAgICB0YXNrVHlwZUNvZGVOYW1lLFxyXG4gICAgICAgIGFsbG93ZWRSb2xlcyxcclxuICAgICAgICBzb3VyY2VFbnRpdGllcyxcclxuICAgICAgICBlbmFibGVkOiByYXcuZW5hYmxlZCAhPT0gZmFsc2UsXHJcbiAgICB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBwYXJzZUNyZWF0ZUludGVybmFsVGFza0NvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZCk6IENyZWF0ZUludGVybmFsVGFza0NvbmZpZyB7XHJcbiAgICBpZiAoIWpzb25UZXh0KSByZXR1cm4gRU1QVFlfQ09ORklHO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyBQYXJ0aWFsPENyZWF0ZUludGVybmFsVGFza0NvbmZpZz47XHJcbiAgICAgICAgY29uc3QgdGFza1R5cGVzID0gQXJyYXkuaXNBcnJheShwYXJzZWQudGFza1R5cGVzKVxyXG4gICAgICAgICAgICA/IHBhcnNlZC50YXNrVHlwZXMubWFwKG5vcm1hbGl6ZUNvbmZpZ09wdGlvbikuZmlsdGVyKChpdGVtKTogaXRlbSBpcyBJbnRlcm5hbFRhc2tUeXBlT3B0aW9uID0+IEJvb2xlYW4oaXRlbSkpXHJcbiAgICAgICAgICAgIDogW107XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgdmVyc2lvbjogdHlwZW9mIHBhcnNlZC52ZXJzaW9uID09PSBcIm51bWJlclwiID8gcGFyc2VkLnZlcnNpb24gOiAxLFxyXG4gICAgICAgICAgICB0YXNrVHlwZXMsXHJcbiAgICAgICAgfTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIHJldHVybiBFTVBUWV9DT05GSUc7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBsb2FkQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnKGZvcmNlUmVmcmVzaCA9IGZhbHNlKTogUHJvbWlzZTxDcmVhdGVJbnRlcm5hbFRhc2tDb25maWc+IHtcclxuICAgIGlmICghZm9yY2VSZWZyZXNoICYmIGNyZWF0ZUludGVybmFsVGFza0NvbmZpZ0NhY2hlKSByZXR1cm4gY3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnQ2FjaGU7XHJcblxyXG4gICAgY29uc3Qga2V5ID0gQ1JFQVRFX0lOVEVSTkFMX1RBU0suY29uZmlnS2V5LnJlcGxhY2UoLycvZywgXCInJ1wiKTtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgYD8kc2VsZWN0PSR7QVBQQ09ORklHLmZpZWxkcy5qc29ufWAsXHJcbiAgICAgICAgYCYkZmlsdGVyPSR7QVBQQ09ORklHLmZpZWxkcy5rZXl9IGVxICcke2tleX0nYCxcclxuICAgICAgICBcIiYkdG9wPTFcIixcclxuICAgIF0uam9pbihcIlwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldFhybSgpLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhBUFBDT05GSUcuZW50aXR5LCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCBqc29uVGV4dCA9IHJlc3VsdD8uZW50aXRpZXM/LlswXT8uW0FQUENPTkZJRy5maWVsZHMuanNvbl0gYXMgc3RyaW5nIHwgbnVsbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICBjcmVhdGVJbnRlcm5hbFRhc2tDb25maWdDYWNoZSA9IHBhcnNlQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnKGpzb25UZXh0KTtcclxuICAgICAgICByZXR1cm4gY3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnQ2FjaGU7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICBjcmVhdGVJbnRlcm5hbFRhc2tDb25maWdDYWNoZSA9IEVNUFRZX0NPTkZJRztcclxuICAgICAgICByZXR1cm4gY3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnQ2FjaGU7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxvd2VkSW50ZXJuYWxUYXNrVHlwZU9wdGlvbnMoc291cmNlRW50aXR5PzogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5KTogUHJvbWlzZTxJbnRlcm5hbFRhc2tUeXBlT3B0aW9uW10+IHtcbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCBsb2FkQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnKCk7XG4gICAgY29uc3QgdXNlclJvbGVOYW1lcyA9IGdldEN1cnJlbnRVc2VyUm9sZU5hbWVzKCk7XG4gICAgcmV0dXJuIGNvbmZpZy50YXNrVHlwZXMuZmlsdGVyKChvcHRpb24pID0+XG4gICAgICAgIG9wdGlvbi5lbmFibGVkICE9PSBmYWxzZSAmJlxyXG4gICAgICAgIGlzQWxsb3dlZEZvclNvdXJjZShvcHRpb24sIHNvdXJjZUVudGl0eSkgJiZcclxuICAgICAgICBoYXNBbnlSb2xlKG9wdGlvbi5hbGxvd2VkUm9sZXMsIHVzZXJSb2xlTmFtZXMpXHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuQ3JlYXRlQW55SW50ZXJuYWxUYXNrKHNvdXJjZUVudGl0eT86IENyZWF0ZUludGVybmFsVGFza1NvdXJjZUVudGl0eSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0QWxsb3dlZEludGVybmFsVGFza1R5cGVPcHRpb25zKHNvdXJjZUVudGl0eSkpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDcmVhdGVJbnRlcm5hbFRhc2tBdmFpbGFiaWxpdHkoXG4gICAgc291cmNlRW50aXR5PzogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5XG4pOiBQcm9taXNlPENyZWF0ZUludGVybmFsVGFza0F2YWlsYWJpbGl0eT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGxvYWRDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcoKTtcbiAgICBpZiAoIWNvbmZpZy50YXNrVHlwZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJtaXNzaW5nX2NvbmZpZ1wiIH07XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZE9wdGlvbnMgPSBjb25maWcudGFza1R5cGVzLmZpbHRlcigob3B0aW9uKSA9PiBvcHRpb24uZW5hYmxlZCAhPT0gZmFsc2UpO1xuICAgIGlmICghZW5hYmxlZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJub19lbmFibGVkX3Rhc2tfdHlwZXNcIiB9O1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZU9wdGlvbnMgPSBlbmFibGVkT3B0aW9ucy5maWx0ZXIoKG9wdGlvbikgPT4gaXNBbGxvd2VkRm9yU291cmNlKG9wdGlvbiwgc291cmNlRW50aXR5KSk7XG4gICAgaWYgKCFzb3VyY2VPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4geyBjYW5DcmVhdGU6IGZhbHNlLCByZWFzb246IFwibm9fc291cmNlX21hdGNoXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyUm9sZU5hbWVzID0gZ2V0Q3VycmVudFVzZXJSb2xlTmFtZXMoKTtcbiAgICBjb25zdCByb2xlT3B0aW9ucyA9IHNvdXJjZU9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+IGhhc0FueVJvbGUob3B0aW9uLmFsbG93ZWRSb2xlcywgdXNlclJvbGVOYW1lcykpO1xuICAgIGlmICghcm9sZU9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJub19yb2xlX21hdGNoXCIgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBjYW5DcmVhdGU6IHRydWUgfTtcbn1cblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUludGVybmFsVGFza1R5cGVCeUNvZGVOYW1lKHR5cGVDb2RlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9IHwgbnVsbD4ge1xyXG4gICAgY29uc3QgZXNjYXBlZCA9IHR5cGVDb2RlTmFtZS5yZXBsYWNlKC8nL2csIFwiJydcIik7XHJcbiAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIGA/JHNlbGVjdD0ke0lOVEVSTkFMVEFTS1RZUEUuZmllbGRzLnBrfSwke0lOVEVSTkFMVEFTS1RZUEUuZmllbGRzLm5hbWV9LCR7SU5URVJOQUxUQVNLVFlQRS5maWVsZHMuaW50ZXJuYWx0YXNrdHlwZWNvZGVuYW1lfWAsXHJcbiAgICAgICAgYCYkZmlsdGVyPSR7SU5URVJOQUxUQVNLVFlQRS5maWVsZHMuaW50ZXJuYWx0YXNrdHlwZWNvZGVuYW1lfSBlcSAnJHtlc2NhcGVkfSdgLFxyXG4gICAgXS5qb2luKFwiXCIpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0WHJtKCkuV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKElOVEVSTkFMVEFTS1RZUEUuZW50aXR5LCBvcHRpb25zKTtcclxuICAgIGNvbnN0IHJvdyA9IHJlc3VsdD8uZW50aXRpZXM/LlswXTtcclxuICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocm93Py5bSU5URVJOQUxUQVNLVFlQRS5maWVsZHMucGtdKTtcclxuICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG4gICAgcmV0dXJuIHsgaWQsIG5hbWU6IHJvdz8uW0lOVEVSTkFMVEFTS1RZUEUuZmllbGRzLm5hbWVdID8/IHR5cGVDb2RlTmFtZSB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTb3VyY2VMb29rdXBGaWVsZChlbnRpdHlOYW1lOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHkpOiBzdHJpbmcge1xyXG4gICAgc3dpdGNoIChlbnRpdHlOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcImNvbnRhY3RcIjpcclxuICAgICAgICAgICAgcmV0dXJuIElOVEVSTkFMVEFTSy5maWVsZHMuY29udGFjdGlkO1xyXG4gICAgICAgIGNhc2UgXCJhY2NvdW50XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBJTlRFUk5BTFRBU0suZmllbGRzLmNvbXBhbnlpZDtcclxuICAgICAgICBjYXNlIFwid3JtYl9wb3J0Zm9saW9cIjpcclxuICAgICAgICAgICAgcmV0dXJuIElOVEVSTkFMVEFTSy5maWVsZHMucG9ydGZvbGlvaWQ7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzb3VyY2UgZW50aXR5ICcke2VudGl0eU5hbWV9Jy5gKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRJbnRlcm5hbFRhc2tGb3JtUGFyYW1ldGVycyhcclxuICAgIHNvdXJjZTogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlLFxyXG4gICAgdGFza1R5cGU6IHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1cclxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XHJcbiAgICBjb25zdCBzb3VyY2VMb29rdXBGaWVsZCA9IGdldFNvdXJjZUxvb2t1cEZpZWxkKHNvdXJjZS5lbnRpdHlOYW1lKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgW3NvdXJjZUxvb2t1cEZpZWxkXTogc291cmNlLmlkLFxyXG4gICAgICAgIFtgJHtzb3VyY2VMb29rdXBGaWVsZH1uYW1lYF06IHNvdXJjZS5uYW1lID8/IFwiXCIsXHJcbiAgICAgICAgW2Ake3NvdXJjZUxvb2t1cEZpZWxkfXR5cGVgXTogc291cmNlLmVudGl0eU5hbWUsXHJcbiAgICAgICAgW0lOVEVSTkFMVEFTSy5maWVsZHMuaW50ZXJuYWxUYXNrVHlwZV06IHRhc2tUeXBlLmlkLFxyXG4gICAgICAgIFtgJHtJTlRFUk5BTFRBU0suZmllbGRzLmludGVybmFsVGFza1R5cGV9bmFtZWBdOiB0YXNrVHlwZS5uYW1lLFxyXG4gICAgICAgIFtgJHtJTlRFUk5BTFRBU0suZmllbGRzLmludGVybmFsVGFza1R5cGV9dHlwZWBdOiBJTlRFUk5BTFRBU0tUWVBFLmVudGl0eSxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuSW50ZXJuYWxUYXNrQ3JlYXRlRm9ybShcclxuICAgIHNvdXJjZTogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlLFxyXG4gICAgb3B0aW9uOiBJbnRlcm5hbFRhc2tUeXBlT3B0aW9uXHJcbik6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKCFoYXNBbnlSb2xlKG9wdGlvbi5hbGxvd2VkUm9sZXMpKSB7XHJcbiAgICAgICAgYXdhaXQgZ2V0WHJtKCkuTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGNyZWF0ZSB0aGlzIEludGVybmFsIFRhc2sgdHlwZS5cIiB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGFza1R5cGUgPSBhd2FpdCByZXNvbHZlSW50ZXJuYWxUYXNrVHlwZUJ5Q29kZU5hbWUob3B0aW9uLnRhc2tUeXBlQ29kZU5hbWUpO1xyXG4gICAgaWYgKCF0YXNrVHlwZSkge1xyXG4gICAgICAgIGF3YWl0IGdldFhybSgpLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogYEludGVybmFsIFRhc2sgVHlwZSAnJHtvcHRpb24udGFza1R5cGVDb2RlTmFtZX0nIHdhcyBub3QgZm91bmQuYCB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgZ2V0WHJtKCkuTmF2aWdhdGlvbi5vcGVuRm9ybShcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVudGl0eU5hbWU6IElOVEVSTkFMVEFTSy5lbnRpdHksXHJcbiAgICAgICAgICAgIG9wZW5Jbk5ld1dpbmRvdzogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ1aWxkSW50ZXJuYWxUYXNrRm9ybVBhcmFtZXRlcnMoc291cmNlLCB0YXNrVHlwZSlcclxuICAgICk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQge1xuICAgIGdldENyZWF0ZUludGVybmFsVGFza0F2YWlsYWJpbGl0eSxcbiAgICBnZXRTb3VyY2VGcm9tRm9ybSxcbiAgICBnZXRYcm0sXG4gICAgb3BlbkNyZWF0ZUludGVybmFsVGFza0RpYWxvZyxcbn0gZnJvbSBcIi4uL2ZlYXR1cmVzL2NyZWF0ZUludGVybmFsVGFzay9jcmVhdGVJbnRlcm5hbFRhc2suc2VydmljZVwiO1xuXG5mdW5jdGlvbiBnZXRBdmFpbGFiaWxpdHlNZXNzYWdlKHJlYXNvbj86IHN0cmluZyk6IHN0cmluZyB7XG4gICAgc3dpdGNoIChyZWFzb24pIHtcbiAgICAgICAgY2FzZSBcIm1pc3NpbmdfY29uZmlnXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJDcmVhdGUgSW50ZXJuYWwgVGFzayBjb25maWd1cmF0aW9uIHdhcyBub3QgZm91bmQgb3IgY29udGFpbnMgbm8gdmFsaWQgdGFzayB0eXBlcy5cIjtcbiAgICAgICAgY2FzZSBcIm5vX2VuYWJsZWRfdGFza190eXBlc1wiOlxuICAgICAgICAgICAgcmV0dXJuIFwiQ3JlYXRlIEludGVybmFsIFRhc2sgaGFzIG5vIGVuYWJsZWQgdGFzayB0eXBlcy5cIjtcbiAgICAgICAgY2FzZSBcIm5vX3NvdXJjZV9tYXRjaFwiOlxuICAgICAgICAgICAgcmV0dXJuIFwiQ3JlYXRlIEludGVybmFsIFRhc2sgaGFzIG5vIHRhc2sgdHlwZXMgY29uZmlndXJlZCBmb3IgdGhpcyBzb3VyY2UgcmVjb3JkIHR5cGUuXCI7XG4gICAgICAgIGNhc2UgXCJub19yb2xlX21hdGNoXCI6XG4gICAgICAgICAgICByZXR1cm4gXCJZb3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byBjcmVhdGUgSW50ZXJuYWwgVGFza3MuXCI7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gXCJDcmVhdGUgSW50ZXJuYWwgVGFzayBpcyBub3QgYXZhaWxhYmxlLlwiO1xuICAgIH1cbn1cblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb3BlbkRpYWxvZyhwcmltYXJ5Q29udHJvbDogWHJtLkZvcm1Db250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBzb3VyY2UgPSBnZXRTb3VyY2VGcm9tRm9ybShwcmltYXJ5Q29udHJvbCk7XHJcbiAgICBpZiAoIXNvdXJjZSkge1xyXG4gICAgICAgIGF3YWl0IGdldFhybSgpLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHtcclxuICAgICAgICAgICAgdGV4dDogXCJQbGVhc2Ugc2F2ZSB0aGUgcmVjb3JkIGJlZm9yZSBjcmVhdGluZyBhbiBJbnRlcm5hbCBUYXNrLlwiLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBhdmFpbGFiaWxpdHkgPSBhd2FpdCBnZXRDcmVhdGVJbnRlcm5hbFRhc2tBdmFpbGFiaWxpdHkoc291cmNlLmVudGl0eU5hbWUpO1xuICAgIGlmICghYXZhaWxhYmlsaXR5LmNhbkNyZWF0ZSkge1xuICAgICAgICBhd2FpdCBnZXRYcm0oKS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7XG4gICAgICAgICAgICB0ZXh0OiBnZXRBdmFpbGFiaWxpdHlNZXNzYWdlKGF2YWlsYWJpbGl0eS5yZWFzb24pLFxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxyXG4gICAgYXdhaXQgb3BlbkNyZWF0ZUludGVybmFsVGFza0RpYWxvZyhzb3VyY2UpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gY2FuQ3JlYXRlSW50ZXJuYWxUYXNrKCk6IGJvb2xlYW4ge1xyXG4gICAgcmV0dXJuIHRydWU7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9