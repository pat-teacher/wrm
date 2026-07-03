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
/*!**************************************************************!*\
  !*** ./WebResources/src/dialogs/createInternalTaskDialog.ts ***!
  \**************************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../features/createInternalTask/createInternalTask.service */ "./WebResources/src/features/createInternalTask/createInternalTask.service.ts");

let dialogSource = (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.parseDialogData)();
let allowedOptions = [];
function getElement(id) {
    const element = document.getElementById(id);
    if (!element)
        throw new Error(`Missing element '${id}'.`);
    return element;
}
function setStatus(text, isError = false) {
    const status = getElement("status");
    status.textContent = text;
    status.className = isError ? "status error" : "status";
}
async function populateOptions() {
    const select = getElement("taskTypeSelect");
    select.innerHTML = "";
    allowedOptions = await (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.getAllowedInternalTaskTypeOptions)(dialogSource === null || dialogSource === void 0 ? void 0 : dialogSource.entityName);
    for (const option of allowedOptions) {
        const item = document.createElement("option");
        item.value = option.key;
        item.textContent = option.label;
        select.appendChild(item);
    }
    if (!allowedOptions.length) {
        select.disabled = true;
        getElement("createButton").disabled = true;
        setStatus("No Internal Task types are available for your security roles.", true);
    }
}
async function createSelectedTask() {
    var _a;
    if (!dialogSource) {
        setStatus("The source record context is missing.", true);
        return;
    }
    const select = getElement("taskTypeSelect");
    const option = allowedOptions.find((item) => item.key === select.value);
    if (!option) {
        setStatus("Please select an Internal Task type.", true);
        return;
    }
    try {
        getElement("createButton").disabled = true;
        setStatus("Opening Internal Task...");
        await (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.openInternalTaskCreateForm)(dialogSource, option);
        closeDialog();
    }
    catch (error) {
        getElement("createButton").disabled = false;
        setStatus((_a = error === null || error === void 0 ? void 0 : error.message) !== null && _a !== void 0 ? _a : String(error), true);
    }
}
function closeDialog() {
    var _a, _b, _c;
    try {
        (_c = (_b = (_a = (0,_features_createInternalTask_createInternalTask_service__WEBPACK_IMPORTED_MODULE_0__.getXrm)()) === null || _a === void 0 ? void 0 : _a.Navigation) === null || _b === void 0 ? void 0 : _b.navigateBack) === null || _c === void 0 ? void 0 : _c.call(_b);
    }
    catch {
        window.close();
    }
}
function init() {
    if (!dialogSource) {
        setStatus("The dialog was opened without a valid source record.", true);
        getElement("createButton").disabled = true;
        return;
    }
    getElement("sourceInfo").textContent = dialogSource.name
        ? `${dialogSource.name} (${dialogSource.entityName})`
        : dialogSource.entityName;
    void populateOptions();
    getElement("createButton").addEventListener("click", () => void createSelectedTask());
    getElement("cancelButton").addEventListener("click", closeDialog);
}
document.addEventListener("DOMContentLoaded", init);

})();

(window.WRM = window.WRM || {}).createInternalTaskDialog = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFLLGVBQWUsRUFBRSxDQUFDO0lBQ3ZCLFVBQVUsQ0FBb0IsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssa0JBQWtCLEVBQUUsQ0FBQyxDQUFDO0lBQ3pHLFVBQVUsQ0FBb0IsY0FBYyxDQUFDLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0FBQ3pGLENBQUM7QUFFRCxRQUFRLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUUsSUFBSSxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NybS5jb3JlLnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0FwcENvbmZpZy5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvSW50ZXJuYWxUYXNrLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9JbnRlcm5hbFRhc2tUeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9mZWF0dXJlcy9jcmVhdGVJbnRlcm5hbFRhc2svY3JlYXRlSW50ZXJuYWxUYXNrLmNvbnN0YW50cy50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9mZWF0dXJlcy9jcmVhdGVJbnRlcm5hbFRhc2svY3JlYXRlSW50ZXJuYWxUYXNrLnNlcnZpY2UudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZGlhbG9ncy9jcmVhdGVJbnRlcm5hbFRhc2tEaWFsb2cudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gPT09PSBGb3JtVHlwZSBDb25zdGFudHMgPT09PVxyXG5leHBvcnQgY29uc3QgRk9STV9UWVBFID0ge1xyXG4gICAgVW5kZWZpbmVkOiAwLFxyXG4gICAgQ3JlYXRlOiAxLFxyXG4gICAgVXBkYXRlOiAyLFxyXG4gICAgUmVhZE9ubHk6IDMsXHJcbiAgICBEaXNhYmxlZDogNCxcclxuICAgIFF1aWNrQ3JlYXRlOiA1LFxyXG4gICAgQnVsa0VkaXQ6IDYsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgdHlwZSBGb3JtVHlwZSA9IHR5cGVvZiBGT1JNX1RZUEVba2V5b2YgdHlwZW9mIEZPUk1fVFlQRV07XHJcblxyXG5leHBvcnQgY29uc3QgRm9ybVR5cGVIZWxwZXIgPSB7XHJcbiAgICBnZXQoZmM6IGFueSk6IEZvcm1UeXBlIHwgMCB7XHJcbiAgICAgICAgcmV0dXJuIGZjPy51aT8uZ2V0Rm9ybVR5cGU/LigpID8/IEZPUk1fVFlQRS5VbmRlZmluZWQ7XHJcbiAgICB9LFxyXG4gICAgaXNDcmVhdGVMaWtlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfSxcclxuICAgIGlzRWRpdGFibGUodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuVXBkYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3duZXJSZWYge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiIHwgXCJ0ZWFtXCI7XHJcbiAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBUeXBlcyBzaGFyZWQgYWNyb3NzIGVuZ2luZSAmIGVudGl0aWVzIC0tLS1cclxuZXhwb3J0IHR5cGUgT3BlcmF0b3IgPSBcImVxXCIgfCBcIm5lXCIgfCBcImluXCIgfCBcImlzbnVsbFwiIHwgXCJpc25vdG51bGxcIiB8IFwibm90bnVsbFwiOyAvLyBhbGlhc1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xyXG4gICAgLyoqIExvZ2ljYWwgbmFtZSAoc3VwcG9ydHMgZG90LW5vdGF0aW9uIGZvciBsb29rdXAgcHJvamVjdGlvbnM6IGUuZy4sIFwicHJpbWFyeWNvbnRhY3RpZC5uYW1lXCIpLiAqL1xyXG4gICAgZmllbGQ6IHN0cmluZztcclxuICAgIG9wZXJhdG9yOiBPcGVyYXRvcjtcclxuICAgIC8qKiBPcHRpb25hbCB2YWx1ZSBmb3IgY29tcGFyaXNvbnMgKG9taXR0ZWQgZm9yIG51bGwtb3BlcmF0b3JzKS4gKi9cclxuICAgIHZhbHVlPzogdW5rbm93bjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSdWxlIHtcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk/OiBzdHJpbmdbXTtcclxuICAgIGNvbmRpdGlvbj86IENvbmRpdGlvbltdOyAvLyBBTkQtY29uanVuY3Rpb247IGVtcHR5L3VuZGVmaW5lZCDih5IgcnVsZSBhbHdheXMgbWF0Y2hlc1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNvbmZpZyB7XHJcbiAgICBkZWZhdWx0Pzogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbi8qKiBMaWdodHdlaWdodCBjb21wYXJhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9va3VwICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICBpZDogc3RyaW5nIHwgbnVsbDtcclxuICAgIG5hbWU6IHN0cmluZyB8IG51bGw7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIENvcmUgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5Ycm07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIExvd2VyY2FzZSwgc3RyaXAgYnJhY2VzOyByZXR1cm5zIGVtcHR5IHN0cmluZyBpZiBmYWxzeSBpbnB1dC4gKi9cclxuICAgIHN0YXRpYyBzYW5pdGl6ZUd1aWQoaWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bmlxdWU8VD4oYXJyOiBUW10pOiBUW10ge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVGhpbiBXZWIgQVBJIHdyYXBwZXIgLS0tLVxyXG5leHBvcnQgY2xhc3MgQXBpQ2xpZW50IHtcclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBjbGVhbklkID0gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWUsIGNsZWFuSWQsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hYbWwoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgZmV0Y2hYbWw6IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGA/ZmV0Y2hYbWw9JHtlbmNvZGVVUklDb21wb25lbnQoZmV0Y2hYbWwudHJpbSgpKX1gO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGV4ZWN1dGUocmVxdWVzdDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgcGFyZW50RW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudElkOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRpb25zaGlwU2NoZW1hTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZElkczogc3RyaW5nW11cclxuICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHJlcSA9IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiB7IGVudGl0eVR5cGU6IHBhcmVudEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChwYXJlbnRJZCkgfSxcclxuICAgICAgICAgICAgcmVsYXRlZEVudGl0aWVzOiByZWxhdGVkSWRzLm1hcCgocmlkKSA9PiAoeyBlbnRpdHlUeXBlOiByZWxhdGVkRW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHJpZCkgfSkpLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXA6IHJlbGF0aW9uc2hpcFNjaGVtYU5hbWUsXHJcbiAgICAgICAgICAgIGdldE1ldGFkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBib3VuZFBhcmFtZXRlcjogbnVsbCwgcGFyYW1ldGVyVHlwZXM6IHt9LCBvcGVyYXRpb25UeXBlOiAyLCBvcGVyYXRpb25OYW1lOiBcIkFzc29jaWF0ZVwiIH07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBGb3JtIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgRm9ybUNvbnRyb2xIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldEN1cnJlbnRJZChmYzogYW55KTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWRSYXcgPSBmYz8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJhdyA/IFV0aWwuc2FuaXRpemVHdWlkKGlkUmF3KSA6IG51bGw7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERpc2FibGUgb3IgZW5hYmxlIGFsbCBkaXNhYmxlYWJsZSBjb250cm9scyBpbnNpZGUgYSB0YWIgc2VjdGlvbiAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkQWxsQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2w6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsOiBzcGVjaWFsIGhhbmRsaW5nIGZvciBzdWJncmlkcywgd2hpY2ggZG8gbm90IHN1cHBvcnQgc2V0RGlzYWJsZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAvKiogICBcclxuICAgKiBkZS9hY3RpdmF0ZSBvbmx5IHRoZSBzcGVjaWZpZWQgY29udHJvbHMgKGJ5IG5hbWUpIGluIGEgc2VjdGlvbi4gICBcclxuICAgKiBEb2VzIG5vdGhpbmcgaWYgdGhlIGxpc3QgaXMgZW1wdHkgb3IgY29udHJvbHMgYXJlIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBjb250cm9sTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRyb2xOYW1lcykgfHwgY29udHJvbE5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250cm9sTmFtZXNcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuZmluZENvbnRyb2xJblNlY3Rpb24oc2VjdGlvbiwgbmFtZSkpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGMpOiBjIGlzIFhybS5Db250cm9scy5Db250cm9sID0+IEJvb2xlYW4oYykpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChjb250cm9sKSA9PiBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sLCBkaXNhYmxlZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRDb250cm9sSW5TZWN0aW9uKFxyXG4gICAgICAgIHNlY3Rpb246IFhybS5Db250cm9scy5TZWN0aW9uLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgKTogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIC8vIHByaW1hcnk6IGRpcmVjdCBwZXIgTmFtZVxyXG4gICAgICAgIGNvbnN0IGRpcmVjdCA9IHNlY3Rpb24uY29udHJvbHMuZ2V0Py4obmFtZSk7XHJcbiAgICAgICAgaWYgKGRpcmVjdCkgcmV0dXJuIGRpcmVjdDtcclxuXHJcbiAgICAgICAgLy8gRmFsbGJhY2s6IHNlYXJjaCBieSBnZXROYW1lKCkgb3ZlciB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgIGxldCBmb3VuZDogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjLmdldE5hbWU/LigpID09PSBuYW1lKSBmb3VuZCA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sLCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2UgaWYgZGlmZmVyZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjb250cm9sLmdldERpc2FibGVkPy4oKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSBcImJvb2xlYW5cIiAmJiBjdXJyZW50ID09PSBkaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgLyogbm8tb3AgKi9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdyaWQucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVmlzaWJpbGl0eSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGEgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGRpc2FibGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXREaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgcmVxdWlyZWQgbGV2ZWwgb24gYW4gYXR0cmlidXRlL2NvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF0dHIuc2V0UmVxdWlyZWRMZXZlbChpc1JlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWYoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgcHJlZGljYXRlOiAoKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdyA9ICEhcHJlZGljYXRlKCk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBjb250cm9sTmFtZSwgc2hvdyk7XHJcbiAgICAgICAgcmV0dXJuIHNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZkxvb2t1cEVxdWFscyhmYzogYW55LCBsb29rdXBBdHRyOiBzdHJpbmcsIHRhcmdldElkOiBzdHJpbmcsIGNvbnRyb2xOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gVmlzaWJpbGl0eUhlbHBlci5zaG93SWYoZmMsIGNvbnRyb2xOYW1lLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogVHlwZSBndWFyZDogY29udHJvbCBzdXBwb3J0cyBzZXREaXNhYmxlZCAqL1xyXG4gICAgc3RhdGljIGlzRGlzYWJsZWFibGUoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wpOiBjb250cm9sIGlzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wge1xyXG4gICAgICAgIHJldHVybiBcInNldERpc2FibGVkXCIgaW4gY29udHJvbCAmJiB0eXBlb2YgKGNvbnRyb2wgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCkuc2V0RGlzYWJsZWQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGb3JtV2FpdCB7XHJcbiAgICBzdGF0aWMgd2FpdEZvckxvb2t1cFZhbHVlKGZjOiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgdGltZW91dE1zID0gNjAwMCk6IFByb21pc2U8WHJtLkxvb2t1cFZhbHVlIHwgbnVsbD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFhdHRyKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgIGlmIChub3c/LmlkKSByZXR1cm4gcmVzb2x2ZShub3cpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHsgdHJ5IHsgYXR0ci5yZW1vdmVPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9IH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHY/LmlkKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUodik7IH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7IGF0dHIuYWRkT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KG9uQ2hhbmdlLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBpZiAoIWRvbmUpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZShudWxsKTsgfSB9LCB0aW1lb3V0TXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT3duZXJIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldE93bmVyQXR0cmlidXRlKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIChmYz8uZ2V0QXR0cmlidXRlPy4ob3duZXJBdHRyTmFtZSkgPz8gbnVsbCkgYXMgYW55O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRDdXJyZW50T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogT3duZXJSZWYgfCBudWxsIHtcclxuICAgICAgICBjb25zdCB2ID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk/LmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgIGlmICghdj8uaWQgfHwgIXYuZW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHsgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHYuaWQpLCBlbnRpdHlUeXBlOiB2LmVudGl0eVR5cGUgYXMgYW55LCBuYW1lOiB2Lm5hbWUgPz8gbnVsbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzZXRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcsIG93bmVyOiBPd25lclJlZik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgICAgICBpZiAoIWF0dHIpIHJldHVybjtcclxuICAgICAgICBhdHRyLnNldFZhbHVlKFt7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChvd25lci5pZCksXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IG93bmVyLmVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IG93bmVyLm5hbWUgPz8gdW5kZWZpbmVkXHJcbiAgICAgICAgfSBhcyBhbnldKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaXNTYW1lT3duZXIoYT86IE93bmVyUmVmIHwgbnVsbCwgYj86IE93bmVyUmVmIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBhLmVudGl0eVR5cGUgPT09IGIuZW50aXR5VHlwZSAmJiBVdGlsLnNhbml0aXplR3VpZChhLmlkKSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQoYi5pZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmljIHNlcnZpY2U6IExvYWQgb3duZXIgKFVzZXIgb3IgVGVhbSkgZm9yIGFueSByZWNvcmQgKi9cclxuZXhwb3J0IGNsYXNzIE93bmVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0T3duZXJSZWYoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlY29yZElkOiBzdHJpbmcsXHJcbiAgICAgICAgb3duZXJBdHRyTmFtZSA9IFwib3duZXJpZFwiXHJcbiAgICApOiBQcm9taXNlPE93bmVyUmVmIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocmVjb3JkSWQpO1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyBGb3IgcG9seW1vcnBoaWMgb3duZXIgbG9va3VwcywgZXhwYW5kIGRlZGljYXRlZCBuYXYgcHJvcHMgdG8gYXZvaWQgcHJvcGVydHktbm90LWZvdW5kIGVycm9yc1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZCA9IGA/JHNlbGVjdD0ke293bmVyQXR0ck5hbWV9JiRleHBhbmQ9b3duaW5ndXNlcigkc2VsZWN0PXN5c3RlbXVzZXJpZCxmdWxsbmFtZSksb3duaW5ndGVhbSgkc2VsZWN0PXRlYW1pZCxuYW1lKWA7XHJcbiAgICAgICAgY29uc3QgcmVjID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWwsIGlkLCBleHBhbmQpO1xyXG5cclxuICAgICAgICBjb25zdCB1c2VyID0gcmVjPy5bXCJvd25pbmd1c2VyXCJdO1xyXG4gICAgICAgIGlmICh1c2VyPy5zeXN0ZW11c2VyaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh1c2VyLnN5c3RlbXVzZXJpZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIuZnVsbG5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVhbSA9IHJlYz8uW1wib3duaW5ndGVhbVwiXTtcclxuICAgICAgICBpZiAodGVhbT8udGVhbWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodGVhbS50ZWFtaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJ0ZWFtXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWFtLm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBTZWN1cml0eS1yZWxhdGVkIGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5U2VydmljZSB7XHJcbiAgICAgICAgLyoqIFJldHVybnMgY3VycmVudCB1c2VyIGlkIGZyb20gWHJtIGNvbnRleHQgKi9cclxuICAgICAgICBzdGF0aWMgZ2V0Q3VycmVudFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5Ycm0/LlV0aWxpdHk/LmdldEdsb2JhbENvbnRleHQ/LigpPy51c2VyU2V0dGluZ3M/LnVzZXJJZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJucyByb2xlIG5hbWVzIG9mIHRoZSBjdXJyZW50IHVzZXIgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgZ2V0Q3VycmVudFVzZXJSb2xlcygpOiBQcm9taXNlPHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRDdXJyZW50VXNlcklkKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZCkgcmV0dXJuIFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZldGNoWE1MIG92ZXIgc3lzdGVtdXNlcnJvbGVzIChOOk4pIHRvIHJvbGVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICAgICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJyb2xlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cInJvbGVpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJyb2xlc1wiIGZyb209XCJyb2xlaWRcIiB0bz1cInJvbGVpZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlclwiIGZyb209XCJzeXN0ZW11c2VyaWRcIiB0bz1cInN5c3RlbXVzZXJpZFwiIGFsaWFzPVwidVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHt1c2VySWR9XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LmZldGNoWG1sKFwicm9sZVwiLCBmZXRjaFhtbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHJlcy5lbnRpdGllcyB8fCBbXSkubWFwKChlKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoZVtcInJvbGVpZFwiXSA/PyBlW1wiX3JvbGVpZF92YWx1ZVwiXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVbXCJuYW1lXCJdIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgIH0pKS5maWx0ZXIociA9PiAhIXIuaWQgJiYgISFyLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoZWNrcyBpZiBjdXJyZW50IHVzZXIgaGFzIG9uZSBvZiB0aGUgcHJvdmlkZWQgcm9sZSBuYW1lcyAoY2FzZS1pbnNlbnNpdGl2ZSkgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgaGFzQ3VycmVudFVzZXJSb2xlKC4uLnJvbGVOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdhbnRlZCA9IG5ldyBTZXQocm9sZU5hbWVzLm1hcChuID0+IG4udHJpbSgpLnRvTG93ZXJDYXNlKCkpLmZpbHRlcihCb29sZWFuKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2FudGVkLnNpemUgPT09IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50VXNlclJvbGVzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9sZXMuc29tZShyID0+IHdhbnRlZC5oYXMoci5uYW1lLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGNvbnRyb2wgdmlldyBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFZpZXdIZWxwZXIge1xyXG4gICAgLyoqIFJlc3RyaWN0IGEgbG9va3VwIGNvbnRyb2wgdG8gc3BlY2lmaWMgZW50aXR5IHR5cGVzICovXHJcbiAgICBzdGF0aWMgc2V0RW50aXR5VHlwZXMoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZywgZW50aXR5VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGN0cmw/LnNldEVudGl0eVR5cGVzPy4oZW50aXR5VHlwZXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGQgYSBjdXN0b20gdmlldyB0byBhIGxvb2t1cCBjb250cm9sICovXHJcbiAgICBzdGF0aWMgYWRkQ3VzdG9tVmlldyhcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIGNvbnRyb2xOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZW50aXR5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdEaXNwbGF5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGZldGNoWG1sOiBzdHJpbmcsXHJcbiAgICAgICAgbGF5b3V0WG1sOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0QXNEZWZhdWx0OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghY3RybD8uYWRkQ3VzdG9tVmlldykgcmV0dXJuO1xyXG4gICAgICAgICAgICBjdHJsLmFkZEN1c3RvbVZpZXcodmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLnRyaW0oKSwgbGF5b3V0WG1sLnRyaW0oKSwgc2V0QXNEZWZhdWx0KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkcyBhIGN1c3RvbSB2aWV3IGZvciBvd25lciBsb29rdXAgdG8gc2hvdyBvbmx5IHRlYW1zIHRoZSBjdXJyZW50IHVzZXIgYmVsb25ncyB0by4gKi9cclxuICAgIHN0YXRpYyBhZGRPd25lclRlYW1WaWV3Rm9yQ3VycmVudFVzZXIoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZyA9IFwib3duZXJpZFwiKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZW50aXR5TmFtZSA9IFwidGVhbVwiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdEaXNwbGF5TmFtZSA9IFwiT3duZXJUZWFtTG9va3VwVmlld1wiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJZCA9IFwiezAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMX1cIjtcclxuXHJcbiAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgIDxmZXRjaD5cclxuICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInRlYW1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJidXNpbmVzc3VuaXRpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJuZXZfb3duZXJ0ZWFtMnN5c3RlbXVzZXJcIiBmcm9tPVwidGVhbWlkXCIgdG89XCJ0ZWFtaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXEtdXNlcmlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICA8L2ZldGNoPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxheW91dFhtbCA9IGBcclxuICAgICAgICAgICAgPGdyaWQgbmFtZT0ncmVzdWx0c2V0JyBvYmplY3Q9JzEnIGp1bXA9J3RlYW1pZCcgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cclxuICAgICAgICAgICAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0ndGVhbWlkJz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSduYW1lJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J2J1c2luZXNzdW5pdGlkJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgPC9yb3c+XHJcbiAgICAgICAgICAgIDwvZ3JpZD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLmFkZEN1c3RvbVZpZXcoZmMsIGNvbnRyb2xOYW1lLCB2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwsIGxheW91dFhtbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGaWVsZFZhbGlkYXRvciB7XHJcbiAgICAvKipcclxuICAgICAqIFZhbGlkYXRlcyBhIG51bWVyaWMgdGV4dCBmaWVsZCB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXHJcbiAgICAgKiBDYW4gYmUgdXNlZCBmb3IgT25DaGFuZ2UgZXZlbnRzIGFuZCBvcHRpb25hbGx5IHJlY2VpdmVzIHRoZSBhdHRyaWJ1dGUgbmFtZSBhcyBhIHBhcmFtZXRlci5cclxuICAgICAqL1xyXG4gICAgc3RhdGljIHZhbGlkYXRlQmlnTnVtYmVyKFxyXG4gICAgICAgIGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0LFxyXG4gICAgICAgIGF0dHJpYnV0ZU5hbWU/OiBzdHJpbmdcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGZvcm1Db250ZXh0ID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpIGFzIFhybS5Gb3JtQ29udGV4dDtcclxuXHJcbiAgICAgICAgLy8gSWYgbm8gYXR0cmlidXRlIG5hbWUgaXMgcHJvdmlkZWQg4oaSIHVzZSBldmVudCBzb3VyY2VcclxuICAgICAgICBpZiAoIWF0dHJpYnV0ZU5hbWUpIHtcclxuICAgICAgICAgICAgY29uc3QgZXZlbnRTb3VyY2UgPSBleGVjdXRpb25Db250ZXh0LmdldEV2ZW50U291cmNlKCkgYXMgWHJtLkF0dHJpYnV0ZXMuQXR0cmlidXRlO1xyXG4gICAgICAgICAgICBpZiAoIWV2ZW50U291cmNlKSByZXR1cm47XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPSBldmVudFNvdXJjZS5nZXROYW1lKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhdHRyaWJ1dGUgPSBmb3JtQ29udGV4dC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSk7XHJcbiAgICAgICAgY29uc3QgY29udHJvbCA9IGZvcm1Db250ZXh0LmdldENvbnRyb2woYXR0cmlidXRlTmFtZSkgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbDtcclxuXHJcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGUgfHwgIWNvbnRyb2wpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uSWQgPSBgJHthdHRyaWJ1dGVOYW1lfV9CaWdOdW1iZXJFcnJvcmA7XHJcbiAgICAgICAgbGV0IHZhbHVlID0gYXR0cmlidXRlLmdldFZhbHVlKCkgYXMgc3RyaW5nIHwgbnVsbDtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIGZpZWxkIGlzIHRydWx5IGVtcHR5IChudWxsKSDihpIgY2xlYXIgZXJyb3IgYW5kIGV4aXRcclxuICAgICAgICBpZiAodmFsdWUgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbihub3RpZmljYXRpb25JZCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEtlZXAgb3JpZ2luYWwgc3RyaW5nLCBidXQgd29yayBvbiBhIGNvcHlcclxuICAgICAgICBjb25zdCByYXcgPSB2YWx1ZS50b1N0cmluZygpO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgdXNlciBlbnRlcmVkIG9ubHkgd2hpdGVzcGFjZSDihpIgdHJlYXQgYXMgaW52YWxpZFxyXG4gICAgICAgIGlmIChyYXcudHJpbSgpLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0Tm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgYSBudW1lcmljIHZhbHVlIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cIixcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFJlbW92ZSBhbGwgd2hpdGVzcGFjZSBmb3IgdmFsaWRhdGlvbiAvIHN0b3JhZ2VcclxuICAgICAgICBjb25zdCBkaWdpdHNPbmx5ID0gcmF3LnJlcGxhY2UoL1xccysvZywgXCJcIik7XHJcblxyXG4gICAgICAgIC8vIFZhbGlkYXRpb246IG9ubHkgZGlnaXRzLCBtYXguIDEyIGNoYXJhY3RlcnNcclxuICAgICAgICBjb25zdCBpc1ZhbGlkID0gL15cXGR7MSwxMn0kLy50ZXN0KGRpZ2l0c09ubHkpO1xyXG5cclxuICAgICAgICBpZiAoIWlzVmFsaWQpIHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIGEgbnVtZXJpYyB2YWx1ZSB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXCIsXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBWYWxpZCDihpIgY2xlYXIgbm90aWZpY2F0aW9uIGFuZCBzdG9yZSByYXcgdmFsdWUgd2l0aG91dCBzcGFjZXNcclxuICAgICAgICBjb250cm9sLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbklkKTtcclxuICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUoZGlnaXRzT25seSk7XHJcbiAgICB9XHJcbn1cclxuIiwiZXhwb3J0IGNvbnN0IEFQUENPTkZJRyA9IHtcclxuICAgIGVudGl0eTogXCJuZXZfY29uZmlnXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJuZXZfY29uZmlnaWRcIixcclxuICAgICAgICBrZXk6IFwibmV2X0tleVwiLFxuICAgICAgICBqc29uOiBcIm5ldl9WYWx1ZV9uVGV4dFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiZXhwb3J0IGNvbnN0IElOVEVSTkFMVEFTSyA9IHtcclxuICAgIGVudGl0eTogXCJuZXZfaW50ZXJuYWx0YXNrXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJuZXZfaW50ZXJuYWx0YXNraWRcIixcclxuICAgICAgICBzdWJqZWN0OiBcIm5ldl9zdWJqZWN0XCIsXHJcbiAgICAgICAgY29udGFjdGlkOiBcIm5ldl9jb250YWN0aWRcIixcclxuICAgICAgICBjb21wYW55aWQ6IFwibmV2X2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIHBvcnRmb2xpb2lkOiBcIm5ldl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGludGVybmFsVGFza1R5cGU6IFwibmV2X2ludGVybmFsdGFza3R5cGVcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4iLCJleHBvcnQgY29uc3QgSU5URVJOQUxUQVNLVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJuZXZfaW50ZXJuYWx0YXNrdHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwibmV2X2ludGVybmFsdGFza3R5cGVpZFwiLFxyXG4gICAgICAgIG5hbWU6IFwibmV2X25hbWVcIixcclxuICAgICAgICBpbnRlcm5hbHRhc2t0eXBlY29kZW5hbWU6IFwibmV2X2ludGVybmFsdGFza3R5cGVjb2RlbmFtZVwiXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuIiwiZXhwb3J0IGNvbnN0IENSRUFURV9JTlRFUk5BTF9UQVNLID0ge1xuICAgIGNvbmZpZ0tleTogXCJpZEludGVybmFsVGFza0RpYWxvZ0NvbmZpZ1wiLFxuICAgIGRpYWxvZ1dlYlJlc291cmNlTmFtZTogXCJtaHdybWJfY3JlYXRlSW50ZXJuYWxUYXNrRGlhbG9nLmh0bWxcIixcbn0gYXMgY29uc3Q7XG5cbiIsImltcG9ydCB7IElOVEVSTkFMVEFTSyB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9JbnRlcm5hbFRhc2suZW50aXR5XCI7XHJcbmltcG9ydCB7IElOVEVSTkFMVEFTS1RZUEUgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvSW50ZXJuYWxUYXNrVHlwZS5lbnRpdHlcIjtcclxuaW1wb3J0IHsgQVBQQ09ORklHIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL0FwcENvbmZpZy5lbnRpdHlcIjtcclxuaW1wb3J0IHsgVXRpbCB9IGZyb20gXCIuLi8uLi9jb3JlL2NybS5jb3JlXCI7XHJcbmltcG9ydCB7IENSRUFURV9JTlRFUk5BTF9UQVNLIH0gZnJvbSBcIi4vY3JlYXRlSW50ZXJuYWxUYXNrLmNvbnN0YW50c1wiO1xyXG5pbXBvcnQgdHlwZSB7XG4gICAgQ3JlYXRlSW50ZXJuYWxUYXNrQXZhaWxhYmlsaXR5LFxuICAgIENyZWF0ZUludGVybmFsVGFza0NvbmZpZyxcbiAgICBDcmVhdGVJbnRlcm5hbFRhc2tEaWFsb2dEYXRhLFxuICAgIENyZWF0ZUludGVybmFsVGFza1NvdXJjZSxcbiAgICBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHksXHJcbiAgICBJbnRlcm5hbFRhc2tUeXBlT3B0aW9uLFxyXG59IGZyb20gXCIuL2NyZWF0ZUludGVybmFsVGFzay50eXBlc1wiO1xyXG5cclxuY29uc3QgRU1QVFlfQ09ORklHOiBDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcgPSB7IHZlcnNpb246IDEsIHRhc2tUeXBlczogW10gfTtcclxuXHJcbmxldCBjcmVhdGVJbnRlcm5hbFRhc2tDb25maWdDYWNoZTogQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnIHwgbnVsbCA9IG51bGw7XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0WHJtKCk6IGFueSB7XHJcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybSA/PyAod2luZG93LnBhcmVudCBhcyBhbnkpPy5Ycm07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBpc1N1cHBvcnRlZFNvdXJjZUVudGl0eShlbnRpdHlOYW1lOiBzdHJpbmcpOiBlbnRpdHlOYW1lIGlzIENyZWF0ZUludGVybmFsVGFza1NvdXJjZUVudGl0eSB7XHJcbiAgICByZXR1cm4gZW50aXR5TmFtZSA9PT0gXCJjb250YWN0XCIgfHwgZW50aXR5TmFtZSA9PT0gXCJhY2NvdW50XCIgfHwgZW50aXR5TmFtZSA9PT0gXCJ3cm1iX3BvcnRmb2xpb1wiO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0U291cmNlRnJvbUZvcm0oZm9ybUNvbnRleHQ6IFhybS5Gb3JtQ29udGV4dCk6IENyZWF0ZUludGVybmFsVGFza1NvdXJjZSB8IG51bGwge1xyXG4gICAgY29uc3QgZW50aXR5TmFtZSA9IGZvcm1Db250ZXh0Py5kYXRhPy5lbnRpdHk/LmdldEVudGl0eU5hbWU/LigpO1xyXG4gICAgY29uc3QgaWQgPSBVdGlsLnNhbml0aXplR3VpZChmb3JtQ29udGV4dD8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCkpO1xyXG4gICAgaWYgKCFlbnRpdHlOYW1lIHx8ICFpZCB8fCAhaXNTdXBwb3J0ZWRTb3VyY2VFbnRpdHkoZW50aXR5TmFtZSkpIHJldHVybiBudWxsO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgaWQsXHJcbiAgICAgICAgZW50aXR5TmFtZSxcclxuICAgICAgICBuYW1lOiBmb3JtQ29udGV4dD8uZGF0YT8uZW50aXR5Py5nZXRQcmltYXJ5QXR0cmlidXRlVmFsdWU/LigpID8/IG51bGwsXHJcbiAgICB9O1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlRGlhbG9nRGF0YShzb3VyY2U6IENyZWF0ZUludGVybmFsVGFza1NvdXJjZSk6IHN0cmluZyB7XHJcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KEpTT04uc3RyaW5naWZ5KHNvdXJjZSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VEaWFsb2dEYXRhKHNlYXJjaDogc3RyaW5nID0gd2luZG93LmxvY2F0aW9uLnNlYXJjaCk6IENyZWF0ZUludGVybmFsVGFza0RpYWxvZ0RhdGEgfCBudWxsIHtcclxuICAgIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMoc2VhcmNoKTtcclxuICAgIGNvbnN0IHJhdyA9IHBhcmFtcy5nZXQoXCJkYXRhXCIpO1xyXG4gICAgaWYgKCFyYXcpIHJldHVybiBudWxsO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShkZWNvZGVVUklDb21wb25lbnQocmF3KSkgYXMgQ3JlYXRlSW50ZXJuYWxUYXNrRGlhbG9nRGF0YTtcclxuICAgICAgICBpZiAoIXBhcnNlZD8uaWQgfHwgIWlzU3VwcG9ydGVkU291cmNlRW50aXR5KHBhcnNlZC5lbnRpdHlOYW1lKSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgLi4ucGFyc2VkLFxyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocGFyc2VkLmlkKSxcclxuICAgICAgICAgICAgbmFtZTogcGFyc2VkLm5hbWUgPz8gbnVsbCxcclxuICAgICAgICB9O1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBvcGVuQ3JlYXRlSW50ZXJuYWxUYXNrRGlhbG9nKHNvdXJjZTogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBhd2FpdCBnZXRYcm0oKS5OYXZpZ2F0aW9uLm5hdmlnYXRlVG8oXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICBwYWdlVHlwZTogXCJ3ZWJyZXNvdXJjZVwiLFxyXG4gICAgICAgICAgICB3ZWJyZXNvdXJjZU5hbWU6IENSRUFURV9JTlRFUk5BTF9UQVNLLmRpYWxvZ1dlYlJlc291cmNlTmFtZSxcclxuICAgICAgICAgICAgZGF0YTogZW5jb2RlRGlhbG9nRGF0YShzb3VyY2UpLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IDIsXHJcbiAgICAgICAgICAgIHBvc2l0aW9uOiAxLFxyXG4gICAgICAgICAgICB3aWR0aDogeyB2YWx1ZTogNTAwLCB1bml0OiBcInB4XCIgfSxcclxuICAgICAgICAgICAgaGVpZ2h0OiB7IHZhbHVlOiAzMjAsIHVuaXQ6IFwicHhcIiB9LFxyXG4gICAgICAgICAgICB0aXRsZTogXCJDcmVhdGUgSW50ZXJuYWwgVGFza1wiLFxyXG4gICAgICAgIH1cclxuICAgICk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDdXJyZW50VXNlclJvbGVOYW1lcygpOiBzdHJpbmdbXSB7XHJcbiAgICBjb25zdCByb2xlcyA9IGdldFhybSgpPy5VdGlsaXR5Py5nZXRHbG9iYWxDb250ZXh0Py4oKT8udXNlclNldHRpbmdzPy5yb2xlcztcclxuICAgIGNvbnN0IG5hbWVzOiBzdHJpbmdbXSA9IFtdO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICByb2xlcz8uZm9yRWFjaD8uKChyb2xlOiB7IG5hbWU/OiBzdHJpbmcgfSkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocm9sZT8ubmFtZSkgbmFtZXMucHVzaChyb2xlLm5hbWUpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG5hbWVzO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIG5hbWVzO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gaGFzQW55Um9sZShyb2xlTmFtZXM/OiByZWFkb25seSBzdHJpbmdbXSwgdXNlclJvbGVOYW1lcyA9IGdldEN1cnJlbnRVc2VyUm9sZU5hbWVzKCkpOiBib29sZWFuIHtcclxuICAgIGlmICghcm9sZU5hbWVzPy5sZW5ndGgpIHJldHVybiB0cnVlO1xyXG4gICAgY29uc3QgYXZhaWxhYmxlID0gbmV3IFNldCh1c2VyUm9sZU5hbWVzLm1hcCgobmFtZSkgPT4gbmFtZS50cmltKCkudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgcmV0dXJuIHJvbGVOYW1lcy5zb21lKChuYW1lKSA9PiBhdmFpbGFibGUuaGFzKG5hbWUudHJpbSgpLnRvTG93ZXJDYXNlKCkpKTtcclxufVxyXG5cclxuZnVuY3Rpb24gaXNBbGxvd2VkRm9yU291cmNlKG9wdGlvbjogSW50ZXJuYWxUYXNrVHlwZU9wdGlvbiwgc291cmNlRW50aXR5PzogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5KTogYm9vbGVhbiB7XHJcbiAgICBpZiAoIXNvdXJjZUVudGl0eSB8fCAhb3B0aW9uLnNvdXJjZUVudGl0aWVzPy5sZW5ndGgpIHJldHVybiB0cnVlO1xyXG4gICAgcmV0dXJuIG9wdGlvbi5zb3VyY2VFbnRpdGllcy5pbmNsdWRlcyhzb3VyY2VFbnRpdHkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBub3JtYWxpemVDb25maWdPcHRpb24ocmF3OiBhbnkpOiBJbnRlcm5hbFRhc2tUeXBlT3B0aW9uIHwgbnVsbCB7XHJcbiAgICBpZiAoIXJhdyB8fCB0eXBlb2YgcmF3ICE9PSBcIm9iamVjdFwiKSByZXR1cm4gbnVsbDtcclxuICAgIGNvbnN0IGtleSA9IFN0cmluZyhyYXcua2V5ID8/IFwiXCIpLnRyaW0oKTtcclxuICAgIGNvbnN0IGxhYmVsID0gU3RyaW5nKHJhdy5sYWJlbCA/PyBcIlwiKS50cmltKCk7XHJcbiAgICBjb25zdCB0YXNrVHlwZUNvZGVOYW1lID0gU3RyaW5nKHJhdy50YXNrVHlwZUNvZGVOYW1lID8/IFwiXCIpLnRyaW0oKTtcclxuICAgIGlmICgha2V5IHx8ICFsYWJlbCB8fCAhdGFza1R5cGVDb2RlTmFtZSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgY29uc3QgYWxsb3dlZFJvbGVzID0gQXJyYXkuaXNBcnJheShyYXcuYWxsb3dlZFJvbGVzKVxyXG4gICAgICAgID8gcmF3LmFsbG93ZWRSb2xlcy5tYXAoKHJvbGU6IHVua25vd24pID0+IFN0cmluZyhyb2xlKS50cmltKCkpLmZpbHRlcihCb29sZWFuKVxyXG4gICAgICAgIDogdW5kZWZpbmVkO1xyXG5cclxuICAgIGNvbnN0IHNvdXJjZUVudGl0aWVzID0gQXJyYXkuaXNBcnJheShyYXcuc291cmNlRW50aXRpZXMpXHJcbiAgICAgICAgPyByYXcuc291cmNlRW50aXRpZXMuZmlsdGVyKGlzU3VwcG9ydGVkU291cmNlRW50aXR5KVxyXG4gICAgICAgIDogdW5kZWZpbmVkO1xyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAga2V5LFxyXG4gICAgICAgIGxhYmVsLFxyXG4gICAgICAgIHRhc2tUeXBlQ29kZU5hbWUsXHJcbiAgICAgICAgYWxsb3dlZFJvbGVzLFxyXG4gICAgICAgIHNvdXJjZUVudGl0aWVzLFxyXG4gICAgICAgIGVuYWJsZWQ6IHJhdy5lbmFibGVkICE9PSBmYWxzZSxcclxuICAgIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHBhcnNlQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnKGpzb25UZXh0OiBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkKTogQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnIHtcclxuICAgIGlmICghanNvblRleHQpIHJldHVybiBFTVBUWV9DT05GSUc7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIFBhcnRpYWw8Q3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnPjtcclxuICAgICAgICBjb25zdCB0YXNrVHlwZXMgPSBBcnJheS5pc0FycmF5KHBhcnNlZC50YXNrVHlwZXMpXHJcbiAgICAgICAgICAgID8gcGFyc2VkLnRhc2tUeXBlcy5tYXAobm9ybWFsaXplQ29uZmlnT3B0aW9uKS5maWx0ZXIoKGl0ZW0pOiBpdGVtIGlzIEludGVybmFsVGFza1R5cGVPcHRpb24gPT4gQm9vbGVhbihpdGVtKSlcclxuICAgICAgICAgICAgOiBbXTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICB2ZXJzaW9uOiB0eXBlb2YgcGFyc2VkLnZlcnNpb24gPT09IFwibnVtYmVyXCIgPyBwYXJzZWQudmVyc2lvbiA6IDEsXHJcbiAgICAgICAgICAgIHRhc2tUeXBlcyxcclxuICAgICAgICB9O1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIEVNUFRZX0NPTkZJRztcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGxvYWRDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcoZm9yY2VSZWZyZXNoID0gZmFsc2UpOiBQcm9taXNlPENyZWF0ZUludGVybmFsVGFza0NvbmZpZz4ge1xyXG4gICAgaWYgKCFmb3JjZVJlZnJlc2ggJiYgY3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnQ2FjaGUpIHJldHVybiBjcmVhdGVJbnRlcm5hbFRhc2tDb25maWdDYWNoZTtcclxuXHJcbiAgICBjb25zdCBrZXkgPSBDUkVBVEVfSU5URVJOQUxfVEFTSy5jb25maWdLZXkucmVwbGFjZSgvJy9nLCBcIicnXCIpO1xyXG4gICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICBgPyRzZWxlY3Q9JHtBUFBDT05GSUcuZmllbGRzLmpzb259YCxcclxuICAgICAgICBgJiRmaWx0ZXI9JHtBUFBDT05GSUcuZmllbGRzLmtleX0gZXEgJyR7a2V5fSdgLFxyXG4gICAgICAgIFwiJiR0b3A9MVwiLFxyXG4gICAgXS5qb2luKFwiXCIpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0WHJtKCkuV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKEFQUENPTkZJRy5lbnRpdHksIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IGpzb25UZXh0ID0gcmVzdWx0Py5lbnRpdGllcz8uWzBdPy5bQVBQQ09ORklHLmZpZWxkcy5qc29uXSBhcyBzdHJpbmcgfCBudWxsIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNyZWF0ZUludGVybmFsVGFza0NvbmZpZ0NhY2hlID0gcGFyc2VDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcoanNvblRleHQpO1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVJbnRlcm5hbFRhc2tDb25maWdDYWNoZTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIGNyZWF0ZUludGVybmFsVGFza0NvbmZpZ0NhY2hlID0gRU1QVFlfQ09ORklHO1xyXG4gICAgICAgIHJldHVybiBjcmVhdGVJbnRlcm5hbFRhc2tDb25maWdDYWNoZTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldEFsbG93ZWRJbnRlcm5hbFRhc2tUeXBlT3B0aW9ucyhzb3VyY2VFbnRpdHk/OiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHkpOiBQcm9taXNlPEludGVybmFsVGFza1R5cGVPcHRpb25bXT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGxvYWRDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcoKTtcbiAgICBjb25zdCB1c2VyUm9sZU5hbWVzID0gZ2V0Q3VycmVudFVzZXJSb2xlTmFtZXMoKTtcbiAgICByZXR1cm4gY29uZmlnLnRhc2tUeXBlcy5maWx0ZXIoKG9wdGlvbikgPT5cbiAgICAgICAgb3B0aW9uLmVuYWJsZWQgIT09IGZhbHNlICYmXHJcbiAgICAgICAgaXNBbGxvd2VkRm9yU291cmNlKG9wdGlvbiwgc291cmNlRW50aXR5KSAmJlxyXG4gICAgICAgIGhhc0FueVJvbGUob3B0aW9uLmFsbG93ZWRSb2xlcywgdXNlclJvbGVOYW1lcylcclxuICAgICk7XHJcbn1cclxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBjYW5DcmVhdGVBbnlJbnRlcm5hbFRhc2soc291cmNlRW50aXR5PzogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIChhd2FpdCBnZXRBbGxvd2VkSW50ZXJuYWxUYXNrVHlwZU9wdGlvbnMoc291cmNlRW50aXR5KSkubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGdldENyZWF0ZUludGVybmFsVGFza0F2YWlsYWJpbGl0eShcbiAgICBzb3VyY2VFbnRpdHk/OiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHlcbik6IFByb21pc2U8Q3JlYXRlSW50ZXJuYWxUYXNrQXZhaWxhYmlsaXR5PiB7XG4gICAgY29uc3QgY29uZmlnID0gYXdhaXQgbG9hZENyZWF0ZUludGVybmFsVGFza0NvbmZpZygpO1xuICAgIGlmICghY29uZmlnLnRhc2tUeXBlcy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHsgY2FuQ3JlYXRlOiBmYWxzZSwgcmVhc29uOiBcIm1pc3NpbmdfY29uZmlnXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCBlbmFibGVkT3B0aW9ucyA9IGNvbmZpZy50YXNrVHlwZXMuZmlsdGVyKChvcHRpb24pID0+IG9wdGlvbi5lbmFibGVkICE9PSBmYWxzZSk7XG4gICAgaWYgKCFlbmFibGVkT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHsgY2FuQ3JlYXRlOiBmYWxzZSwgcmVhc29uOiBcIm5vX2VuYWJsZWRfdGFza190eXBlc1wiIH07XG4gICAgfVxuXG4gICAgY29uc3Qgc291cmNlT3B0aW9ucyA9IGVuYWJsZWRPcHRpb25zLmZpbHRlcigob3B0aW9uKSA9PiBpc0FsbG93ZWRGb3JTb3VyY2Uob3B0aW9uLCBzb3VyY2VFbnRpdHkpKTtcbiAgICBpZiAoIXNvdXJjZU9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJub19zb3VyY2VfbWF0Y2hcIiB9O1xuICAgIH1cblxuICAgIGNvbnN0IHVzZXJSb2xlTmFtZXMgPSBnZXRDdXJyZW50VXNlclJvbGVOYW1lcygpO1xuICAgIGNvbnN0IHJvbGVPcHRpb25zID0gc291cmNlT3B0aW9ucy5maWx0ZXIoKG9wdGlvbikgPT4gaGFzQW55Um9sZShvcHRpb24uYWxsb3dlZFJvbGVzLCB1c2VyUm9sZU5hbWVzKSk7XG4gICAgaWYgKCFyb2xlT3B0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIHsgY2FuQ3JlYXRlOiBmYWxzZSwgcmVhc29uOiBcIm5vX3JvbGVfbWF0Y2hcIiB9O1xuICAgIH1cblxuICAgIHJldHVybiB7IGNhbkNyZWF0ZTogdHJ1ZSB9O1xufVxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiByZXNvbHZlSW50ZXJuYWxUYXNrVHlwZUJ5Q29kZU5hbWUodHlwZUNvZGVOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH0gfCBudWxsPiB7XHJcbiAgICBjb25zdCBlc2NhcGVkID0gdHlwZUNvZGVOYW1lLnJlcGxhY2UoLycvZywgXCInJ1wiKTtcclxuICAgIGNvbnN0IG9wdGlvbnMgPSBbXHJcbiAgICAgICAgYD8kc2VsZWN0PSR7SU5URVJOQUxUQVNLVFlQRS5maWVsZHMucGt9LCR7SU5URVJOQUxUQVNLVFlQRS5maWVsZHMubmFtZX0sJHtJTlRFUk5BTFRBU0tUWVBFLmZpZWxkcy5pbnRlcm5hbHRhc2t0eXBlY29kZW5hbWV9YCxcclxuICAgICAgICBgJiRmaWx0ZXI9JHtJTlRFUk5BTFRBU0tUWVBFLmZpZWxkcy5pbnRlcm5hbHRhc2t0eXBlY29kZW5hbWV9IGVxICcke2VzY2FwZWR9J2AsXHJcbiAgICBdLmpvaW4oXCJcIik7XHJcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCBnZXRYcm0oKS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoSU5URVJOQUxUQVNLVFlQRS5lbnRpdHksIG9wdGlvbnMpO1xyXG4gICAgY29uc3Qgcm93ID0gcmVzdWx0Py5lbnRpdGllcz8uWzBdO1xyXG4gICAgY29uc3QgaWQgPSBVdGlsLnNhbml0aXplR3VpZChyb3c/LltJTlRFUk5BTFRBU0tUWVBFLmZpZWxkcy5wa10pO1xyXG4gICAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XHJcbiAgICByZXR1cm4geyBpZCwgbmFtZTogcm93Py5bSU5URVJOQUxUQVNLVFlQRS5maWVsZHMubmFtZV0gPz8gdHlwZUNvZGVOYW1lIH07XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGdldFNvdXJjZUxvb2t1cEZpZWxkKGVudGl0eU5hbWU6IENyZWF0ZUludGVybmFsVGFza1NvdXJjZUVudGl0eSk6IHN0cmluZyB7XHJcbiAgICBzd2l0Y2ggKGVudGl0eU5hbWUpIHtcclxuICAgICAgICBjYXNlIFwiY29udGFjdFwiOlxyXG4gICAgICAgICAgICByZXR1cm4gSU5URVJOQUxUQVNLLmZpZWxkcy5jb250YWN0aWQ7XHJcbiAgICAgICAgY2FzZSBcImFjY291bnRcIjpcclxuICAgICAgICAgICAgcmV0dXJuIElOVEVSTkFMVEFTSy5maWVsZHMuY29tcGFueWlkO1xyXG4gICAgICAgIGNhc2UgXCJ3cm1iX3BvcnRmb2xpb1wiOlxyXG4gICAgICAgICAgICByZXR1cm4gSU5URVJOQUxUQVNLLmZpZWxkcy5wb3J0Zm9saW9pZDtcclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIHNvdXJjZSBlbnRpdHkgJyR7ZW50aXR5TmFtZX0nLmApO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBidWlsZEludGVybmFsVGFza0Zvcm1QYXJhbWV0ZXJzKFxyXG4gICAgc291cmNlOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2UsXHJcbiAgICB0YXNrVHlwZTogeyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVxyXG4pOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+IHtcclxuICAgIGNvbnN0IHNvdXJjZUxvb2t1cEZpZWxkID0gZ2V0U291cmNlTG9va3VwRmllbGQoc291cmNlLmVudGl0eU5hbWUpO1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBbc291cmNlTG9va3VwRmllbGRdOiBzb3VyY2UuaWQsXHJcbiAgICAgICAgW2Ake3NvdXJjZUxvb2t1cEZpZWxkfW5hbWVgXTogc291cmNlLm5hbWUgPz8gXCJcIixcclxuICAgICAgICBbYCR7c291cmNlTG9va3VwRmllbGR9dHlwZWBdOiBzb3VyY2UuZW50aXR5TmFtZSxcclxuICAgICAgICBbSU5URVJOQUxUQVNLLmZpZWxkcy5pbnRlcm5hbFRhc2tUeXBlXTogdGFza1R5cGUuaWQsXHJcbiAgICAgICAgW2Ake0lOVEVSTkFMVEFTSy5maWVsZHMuaW50ZXJuYWxUYXNrVHlwZX1uYW1lYF06IHRhc2tUeXBlLm5hbWUsXHJcbiAgICAgICAgW2Ake0lOVEVSTkFMVEFTSy5maWVsZHMuaW50ZXJuYWxUYXNrVHlwZX10eXBlYF06IElOVEVSTkFMVEFTS1RZUEUuZW50aXR5LFxyXG4gICAgfTtcclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5JbnRlcm5hbFRhc2tDcmVhdGVGb3JtKFxyXG4gICAgc291cmNlOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2UsXHJcbiAgICBvcHRpb246IEludGVybmFsVGFza1R5cGVPcHRpb25cclxuKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIWhhc0FueVJvbGUob3B0aW9uLmFsbG93ZWRSb2xlcykpIHtcclxuICAgICAgICBhd2FpdCBnZXRYcm0oKS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiWW91IGRvIG5vdCBoYXZlIHBlcm1pc3Npb24gdG8gY3JlYXRlIHRoaXMgSW50ZXJuYWwgVGFzayB0eXBlLlwiIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCB0YXNrVHlwZSA9IGF3YWl0IHJlc29sdmVJbnRlcm5hbFRhc2tUeXBlQnlDb2RlTmFtZShvcHRpb24udGFza1R5cGVDb2RlTmFtZSk7XHJcbiAgICBpZiAoIXRhc2tUeXBlKSB7XHJcbiAgICAgICAgYXdhaXQgZ2V0WHJtKCkuTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBgSW50ZXJuYWwgVGFzayBUeXBlICcke29wdGlvbi50YXNrVHlwZUNvZGVOYW1lfScgd2FzIG5vdCBmb3VuZC5gIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBhd2FpdCBnZXRYcm0oKS5OYXZpZ2F0aW9uLm9wZW5Gb3JtKFxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgZW50aXR5TmFtZTogSU5URVJOQUxUQVNLLmVudGl0eSxcclxuICAgICAgICAgICAgb3BlbkluTmV3V2luZG93OiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYnVpbGRJbnRlcm5hbFRhc2tGb3JtUGFyYW1ldGVycyhzb3VyY2UsIHRhc2tUeXBlKVxyXG4gICAgKTtcclxufVxyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7XHJcbiAgICBnZXRBbGxvd2VkSW50ZXJuYWxUYXNrVHlwZU9wdGlvbnMsXHJcbiAgICBnZXRYcm0sXHJcbiAgICBvcGVuSW50ZXJuYWxUYXNrQ3JlYXRlRm9ybSxcclxuICAgIHBhcnNlRGlhbG9nRGF0YSxcclxufSBmcm9tIFwiLi4vZmVhdHVyZXMvY3JlYXRlSW50ZXJuYWxUYXNrL2NyZWF0ZUludGVybmFsVGFzay5zZXJ2aWNlXCI7XHJcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxUYXNrVHlwZU9wdGlvbiB9IGZyb20gXCIuLi9mZWF0dXJlcy9jcmVhdGVJbnRlcm5hbFRhc2svY3JlYXRlSW50ZXJuYWxUYXNrLnR5cGVzXCI7XHJcblxyXG5sZXQgZGlhbG9nU291cmNlID0gcGFyc2VEaWFsb2dEYXRhKCk7XHJcbmxldCBhbGxvd2VkT3B0aW9uczogSW50ZXJuYWxUYXNrVHlwZU9wdGlvbltdID0gW107XHJcblxyXG5mdW5jdGlvbiBnZXRFbGVtZW50PFQgZXh0ZW5kcyBIVE1MRWxlbWVudD4oaWQ6IHN0cmluZyk6IFQge1xyXG4gICAgY29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgIGlmICghZWxlbWVudCkgdGhyb3cgbmV3IEVycm9yKGBNaXNzaW5nIGVsZW1lbnQgJyR7aWR9Jy5gKTtcclxuICAgIHJldHVybiBlbGVtZW50IGFzIFQ7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHNldFN0YXR1cyh0ZXh0OiBzdHJpbmcsIGlzRXJyb3IgPSBmYWxzZSk6IHZvaWQge1xyXG4gICAgY29uc3Qgc3RhdHVzID0gZ2V0RWxlbWVudDxIVE1MRGl2RWxlbWVudD4oXCJzdGF0dXNcIik7XHJcbiAgICBzdGF0dXMudGV4dENvbnRlbnQgPSB0ZXh0O1xyXG4gICAgc3RhdHVzLmNsYXNzTmFtZSA9IGlzRXJyb3IgPyBcInN0YXR1cyBlcnJvclwiIDogXCJzdGF0dXNcIjtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gcG9wdWxhdGVPcHRpb25zKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3Qgc2VsZWN0ID0gZ2V0RWxlbWVudDxIVE1MU2VsZWN0RWxlbWVudD4oXCJ0YXNrVHlwZVNlbGVjdFwiKTtcclxuICAgIHNlbGVjdC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgIGFsbG93ZWRPcHRpb25zID0gYXdhaXQgZ2V0QWxsb3dlZEludGVybmFsVGFza1R5cGVPcHRpb25zKGRpYWxvZ1NvdXJjZT8uZW50aXR5TmFtZSk7XHJcbiAgICBmb3IgKGNvbnN0IG9wdGlvbiBvZiBhbGxvd2VkT3B0aW9ucykge1xyXG4gICAgICAgIGNvbnN0IGl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgICAgIGl0ZW0udmFsdWUgPSBvcHRpb24ua2V5O1xyXG4gICAgICAgIGl0ZW0udGV4dENvbnRlbnQgPSBvcHRpb24ubGFiZWw7XHJcbiAgICAgICAgc2VsZWN0LmFwcGVuZENoaWxkKGl0ZW0pO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghYWxsb3dlZE9wdGlvbnMubGVuZ3RoKSB7XHJcbiAgICAgICAgc2VsZWN0LmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICBnZXRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImNyZWF0ZUJ1dHRvblwiKS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgc2V0U3RhdHVzKFwiTm8gSW50ZXJuYWwgVGFzayB0eXBlcyBhcmUgYXZhaWxhYmxlIGZvciB5b3VyIHNlY3VyaXR5IHJvbGVzLlwiLCB0cnVlKTtcclxuICAgIH1cclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gY3JlYXRlU2VsZWN0ZWRUYXNrKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgaWYgKCFkaWFsb2dTb3VyY2UpIHtcclxuICAgICAgICBzZXRTdGF0dXMoXCJUaGUgc291cmNlIHJlY29yZCBjb250ZXh0IGlzIG1pc3NpbmcuXCIsIHRydWUpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBzZWxlY3QgPSBnZXRFbGVtZW50PEhUTUxTZWxlY3RFbGVtZW50PihcInRhc2tUeXBlU2VsZWN0XCIpO1xyXG4gICAgY29uc3Qgb3B0aW9uID0gYWxsb3dlZE9wdGlvbnMuZmluZCgoaXRlbSkgPT4gaXRlbS5rZXkgPT09IHNlbGVjdC52YWx1ZSk7XHJcbiAgICBpZiAoIW9wdGlvbikge1xyXG4gICAgICAgIHNldFN0YXR1cyhcIlBsZWFzZSBzZWxlY3QgYW4gSW50ZXJuYWwgVGFzayB0eXBlLlwiLCB0cnVlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBnZXRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImNyZWF0ZUJ1dHRvblwiKS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgc2V0U3RhdHVzKFwiT3BlbmluZyBJbnRlcm5hbCBUYXNrLi4uXCIpO1xyXG4gICAgICAgIGF3YWl0IG9wZW5JbnRlcm5hbFRhc2tDcmVhdGVGb3JtKGRpYWxvZ1NvdXJjZSwgb3B0aW9uKTtcclxuICAgICAgICBjbG9zZURpYWxvZygpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGdldEVsZW1lbnQ8SFRNTEJ1dHRvbkVsZW1lbnQ+KFwiY3JlYXRlQnV0dG9uXCIpLmRpc2FibGVkID0gZmFsc2U7XHJcbiAgICAgICAgc2V0U3RhdHVzKGVycm9yPy5tZXNzYWdlID8/IFN0cmluZyhlcnJvciksIHRydWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5mdW5jdGlvbiBjbG9zZURpYWxvZygpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgZ2V0WHJtKCk/Lk5hdmlnYXRpb24/Lm5hdmlnYXRlQmFjaz8uKCk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICB3aW5kb3cuY2xvc2UoKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gaW5pdCgpOiB2b2lkIHtcclxuICAgIGlmICghZGlhbG9nU291cmNlKSB7XHJcbiAgICAgICAgc2V0U3RhdHVzKFwiVGhlIGRpYWxvZyB3YXMgb3BlbmVkIHdpdGhvdXQgYSB2YWxpZCBzb3VyY2UgcmVjb3JkLlwiLCB0cnVlKTtcclxuICAgICAgICBnZXRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImNyZWF0ZUJ1dHRvblwiKS5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGdldEVsZW1lbnQ8SFRNTERpdkVsZW1lbnQ+KFwic291cmNlSW5mb1wiKS50ZXh0Q29udGVudCA9IGRpYWxvZ1NvdXJjZS5uYW1lXHJcbiAgICAgICAgPyBgJHtkaWFsb2dTb3VyY2UubmFtZX0gKCR7ZGlhbG9nU291cmNlLmVudGl0eU5hbWV9KWBcclxuICAgICAgICA6IGRpYWxvZ1NvdXJjZS5lbnRpdHlOYW1lO1xyXG5cclxuICAgIHZvaWQgcG9wdWxhdGVPcHRpb25zKCk7XHJcbiAgICBnZXRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImNyZWF0ZUJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4gdm9pZCBjcmVhdGVTZWxlY3RlZFRhc2soKSk7XHJcbiAgICBnZXRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImNhbmNlbEJ1dHRvblwiKS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xvc2VEaWFsb2cpO1xyXG59XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBpbml0KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9