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
        key: "nev_key",
        json: "nev_value_ntext",
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
/* harmony export */   initializeInternalTaskCreateForm: () => (/* binding */ initializeInternalTaskCreateForm),
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
async function loadCreateInternalTaskConfig() {
    var _a, _b;
    const key = _createInternalTask_constants__WEBPACK_IMPORTED_MODULE_4__.CREATE_INTERNAL_TASK.configKey.replace(/'/g, "''");
    const options = [
        `?$select=${_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.fields.json}`,
        `&$filter=${_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.fields.key} eq '${key}'`,
        "&$top=1",
    ].join("");
    try {
        const result = await getXrm().WebApi.retrieveMultipleRecords(_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.entity, options);
        const jsonText = (_b = (_a = result === null || result === void 0 ? void 0 : result.entities) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b[_entities_AppConfig_entity__WEBPACK_IMPORTED_MODULE_2__.APPCONFIG.fields.json];
        return parseCreateInternalTaskConfig(jsonText);
    }
    catch {
        return EMPTY_CONFIG;
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
function getCurrentWindowFormParameters() {
    const result = {};
    const search = new URLSearchParams(window.location.search);
    search.forEach((value, key) => {
        result[key] = value;
    });
    const extraqs = search.get("extraqs");
    if (extraqs) {
        new URLSearchParams(decodeURIComponent(extraqs)).forEach((value, key) => {
            result[key] = value;
        });
    }
    return result;
}
function setLookupFromFormParameters(formContext, formParameters, fieldName) {
    var _a, _b, _c;
    const id = _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.Util.sanitizeGuid(formParameters[fieldName]);
    const entityType = formParameters[`${fieldName}type`];
    if (!id || !entityType)
        return false;
    const attribute = formContext.getAttribute(fieldName);
    if (!attribute)
        return false;
    if ((_b = (_a = attribute.getValue()) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.id)
        return false;
    attribute.setValue([{
            id,
            entityType,
            name: formParameters[`${fieldName}name`] || undefined,
        }]);
    (_c = attribute.fireOnChange) === null || _c === void 0 ? void 0 : _c.call(attribute);
    return true;
}
function getLegacyInternalTaskFunctions() {
    var _a, _b, _c, _d;
    return (_d = (_c = (_b = (_a = window.Ambit) === null || _a === void 0 ? void 0 : _a.MAH) === null || _b === void 0 ? void 0 : _b.WRM2013) === null || _c === void 0 ? void 0 : _c.JS) === null || _d === void 0 ? void 0 : _d.InternalTasksFunctions;
}
function hasCreateInternalTaskParameters(formParameters) {
    return Boolean(formParameters[_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.contactid] ||
        formParameters[_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.companyid] ||
        formParameters[_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.portfolioid] ||
        formParameters[_entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.internalTaskType]);
}
function applyInternalTaskCreateDefaultsFromCurrentParameters(executionContext) {
    const formContext = executionContext.getFormContext();
    if (!_core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormTypeHelper.isCreateLike(_core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormTypeHelper.get(formContext)))
        return false;
    const formParameters = getCurrentWindowFormParameters();
    if (!hasCreateInternalTaskParameters(formParameters))
        return false;
    let applied = false;
    applied = setLookupFromFormParameters(formContext, formParameters, _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.contactid) || applied;
    applied = setLookupFromFormParameters(formContext, formParameters, _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.companyid) || applied;
    applied = setLookupFromFormParameters(formContext, formParameters, _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.portfolioid) || applied;
    applied = setLookupFromFormParameters(formContext, formParameters, _entities_InternalTask_entity__WEBPACK_IMPORTED_MODULE_0__.INTERNALTASK.fields.internalTaskType) || applied;
    return applied;
}
function initializeInternalTaskCreateForm(executionContext) {
    applyInternalTaskCreateDefaultsFromCurrentParameters(executionContext);
    const legacy = getLegacyInternalTaskFunctions();
    if (legacy === null || legacy === void 0 ? void 0 : legacy.OnLoad) {
        legacy.OnLoad(executionContext);
    }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNELGlIQUFNLEVBQUUsMENBQUUsVUFBVSwwQ0FBRSxZQUFZLGtEQUFJLENBQUM7SUFDM0MsQ0FBQztJQUFDLE1BQU0sQ0FBQztRQUNMLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUNuQixDQUFDO0FBQ0wsQ0FBQztBQUVELFNBQVMsSUFBSTtJQUNULElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUNoQixTQUFTLENBQUMsc0RBQXNELEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDeEUsVUFBVSxDQUFvQixjQUFjLENBQUMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO1FBQzlELE9BQU87SUFDWCxDQUFDO0lBRUQsVUFBVSxDQUFpQixZQUFZLENBQUMsQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFDLElBQUk7UUFDcEUsQ0FBQyxDQUFDLEdBQUcsWUFBWSxDQUFDLElBQUksS0FBSyxZQUFZLENBQUMsVUFBVSxHQUFHO1FBQ3JELENBQUMsQ0FBQyxZQUFZLENBQUMsVUFBVSxDQUFDO0lBRTlCLEtBQUssZUFBZSxFQUFFLENBQUM7SUFDdkIsVUFBVSxDQUFvQixjQUFjLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsS0FBSyxrQkFBa0IsRUFBRSxDQUFDLENBQUM7SUFDekcsVUFBVSxDQUFvQixjQUFjLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLENBQUM7QUFDekYsQ0FBQztBQUVELFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQXBwQ29uZmlnLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9JbnRlcm5hbFRhc2suZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0ludGVybmFsVGFza1R5cGUuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2ZlYXR1cmVzL2NyZWF0ZUludGVybmFsVGFzay9jcmVhdGVJbnRlcm5hbFRhc2suY29uc3RhbnRzLnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2ZlYXR1cmVzL2NyZWF0ZUludGVybmFsVGFzay9jcmVhdGVJbnRlcm5hbFRhc2suc2VydmljZS50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9kaWFsb2dzL2NyZWF0ZUludGVybmFsVGFza0RpYWxvZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyA9PT09IEZvcm1UeXBlIENvbnN0YW50cyA9PT09XHJcbmV4cG9ydCBjb25zdCBGT1JNX1RZUEUgPSB7XHJcbiAgICBVbmRlZmluZWQ6IDAsXHJcbiAgICBDcmVhdGU6IDEsXHJcbiAgICBVcGRhdGU6IDIsXHJcbiAgICBSZWFkT25seTogMyxcclxuICAgIERpc2FibGVkOiA0LFxyXG4gICAgUXVpY2tDcmVhdGU6IDUsXHJcbiAgICBCdWxrRWRpdDogNixcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIEZvcm1UeXBlID0gdHlwZW9mIEZPUk1fVFlQRVtrZXlvZiB0eXBlb2YgRk9STV9UWVBFXTtcclxuXHJcbmV4cG9ydCBjb25zdCBGb3JtVHlwZUhlbHBlciA9IHtcclxuICAgIGdldChmYzogYW55KTogRm9ybVR5cGUgfCAwIHtcclxuICAgICAgICByZXR1cm4gZmM/LnVpPy5nZXRGb3JtVHlwZT8uKCkgPz8gRk9STV9UWVBFLlVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBpc0NyZWF0ZUxpa2UodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9LFxyXG4gICAgaXNFZGl0YWJsZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5VcGRhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPd25lclJlZiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIgfCBcInRlYW1cIjtcclxuICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIFR5cGVzIHNoYXJlZCBhY3Jvc3MgZW5naW5lICYgZW50aXRpZXMgLS0tLVxyXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9IFwiZXFcIiB8IFwibmVcIiB8IFwiaW5cIiB8IFwiaXNudWxsXCIgfCBcImlzbm90bnVsbFwiIHwgXCJub3RudWxsXCI7IC8vIGFsaWFzXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICAvKiogTG9naWNhbCBuYW1lIChzdXBwb3J0cyBkb3Qtbm90YXRpb24gZm9yIGxvb2t1cCBwcm9qZWN0aW9uczogZS5nLiwgXCJwcmltYXJ5Y29udGFjdGlkLm5hbWVcIikuICovXHJcbiAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgb3BlcmF0b3I6IE9wZXJhdG9yO1xyXG4gICAgLyoqIE9wdGlvbmFsIHZhbHVlIGZvciBjb21wYXJpc29ucyAob21pdHRlZCBmb3IgbnVsbC1vcGVyYXRvcnMpLiAqL1xyXG4gICAgdmFsdWU/OiB1bmtub3duO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJ1bGUge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIG1hbmRhdG9yeT86IHN0cmluZ1tdO1xyXG4gICAgY29uZGl0aW9uPzogQ29uZGl0aW9uW107IC8vIEFORC1jb25qdW5jdGlvbjsgZW1wdHkvdW5kZWZpbmVkIOKHkiBydWxlIGFsd2F5cyBtYXRjaGVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q29uZmlnIHtcclxuICAgIGRlZmF1bHQ/OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuLyoqIExpZ2h0d2VpZ2h0IGNvbXBhcmFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsb29rdXAgKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIGlkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gQ29yZSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG4gICAgc3RhdGljIGdldCBYcm0oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogTG93ZXJjYXNlLCBzdHJpcCBicmFjZXM7IHJldHVybnMgZW1wdHkgc3RyaW5nIGlmIGZhbHN5IGlucHV0LiAqL1xyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBUaGluIFdlYiBBUEkgd3JhcHBlciAtLS0tXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKChyaWQpID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocmlkKSB9KSksXHJcbiAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwU2NoZW1hTmFtZSxcclxuICAgICAgICAgICAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGJvdW5kUGFyYW1ldGVyOiBudWxsLCBwYXJhbWV0ZXJUeXBlczoge30sIG9wZXJhdGlvblR5cGU6IDIsIG9wZXJhdGlvbk5hbWU6IFwiQXNzb2NpYXRlXCIgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9IGFzIGFueTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBBcGlDbGllbnQuZXhlY3V0ZShyZXEpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEZvcm0gaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBGb3JtQ29udHJvbEhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRMb29rdXBJZChmYzogYW55LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgY29uc3QgdiA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGUpPy5nZXRWYWx1ZT8uKCk7XHJcbiAgICAgICAgcmV0dXJuIHYgJiYgdi5sZW5ndGggPyBVdGlsLnNhbml0aXplR3VpZCh2WzBdLmlkKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGlzYWJsZSBvciBlbmFibGUgYWxsIGRpc2FibGVhYmxlIGNvbnRyb2xzIGluc2lkZSBhIHRhYiBzZWN0aW9uICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWRBbGxDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoY29udHJvbDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHsgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gT3B0aW9uYWw6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHN1YmdyaWRzLCB3aGljaCBkbyBub3Qgc3VwcG9ydCBzZXREaXNhYmxlZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgIC8qKiAgIFxyXG4gICAqIGRlL2FjdGl2YXRlIG9ubHkgdGhlIHNwZWNpZmllZCBjb250cm9scyAoYnkgbmFtZSkgaW4gYSBzZWN0aW9uLiAgIFxyXG4gICAqIERvZXMgbm90aGluZyBpZiB0aGUgbGlzdCBpcyBlbXB0eSBvciBjb250cm9scyBhcmUgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGNvbnRyb2xOYW1lczogcmVhZG9ubHkgc3RyaW5nW10sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29udHJvbE5hbWVzKSB8fCBjb250cm9sTmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnRyb2xOYW1lc1xyXG4gICAgICAgICAgICAubWFwKChuYW1lKSA9PiBGb3JtQ29udHJvbEhlbHBlci5maW5kQ29udHJvbEluU2VjdGlvbihzZWN0aW9uLCBuYW1lKSlcclxuICAgICAgICAgICAgLmZpbHRlcigoYyk6IGMgaXMgWHJtLkNvbnRyb2xzLkNvbnRyb2wgPT4gQm9vbGVhbihjKSlcclxuICAgICAgICAgICAgLmZvckVhY2goKGNvbnRyb2wpID0+IEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2wsIGRpc2FibGVkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZENvbnRyb2xJblNlY3Rpb24oXHJcbiAgICAgICAgc2VjdGlvbjogWHJtLkNvbnRyb2xzLlNlY3Rpb24sXHJcbiAgICAgICAgbmFtZTogc3RyaW5nXHJcbiAgICApOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgLy8gcHJpbWFyeTogZGlyZWN0IHBlciBOYW1lXHJcbiAgICAgICAgY29uc3QgZGlyZWN0ID0gc2VjdGlvbi5jb250cm9scy5nZXQ/LihuYW1lKTtcclxuICAgICAgICBpZiAoZGlyZWN0KSByZXR1cm4gZGlyZWN0O1xyXG5cclxuICAgICAgICAvLyBGYWxsYmFjazogc2VhcmNoIGJ5IGdldE5hbWUoKSBvdmVyIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgICAgbGV0IGZvdW5kOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGMpID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuZ2V0TmFtZT8uKCkgPT09IG5hbWUpIGZvdW5kID0gYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wsIGRpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IGNoYW5nZSBpZiBkaWZmZXJlbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IGNvbnRyb2wuZ2V0RGlzYWJsZWQ/LigpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09IFwiYm9vbGVhblwiICYmIGN1cnJlbnQgPT09IGRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvKiBuby1vcCAqL1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWRIZWxwZXIge1xyXG4gICAgc3RhdGljIHRyeVJlZnJlc2hTdWJncmlkKGZjOiBhbnksIG5hbWU/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBncmlkID0gZmM/LmdldENvbnRyb2w/LihuYW1lKTtcclxuICAgICAgICBpZiAoZ3JpZD8ucmVmcmVzaCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ3JpZC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZmM/LnVpPy5yZWZyZXNoUmliYm9uPy4oKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBWaXNpYmlsaXR5IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVmlzaWJpbGl0eUhlbHBlciB7XHJcbiAgICBzdGF0aWMgc2V0VmlzaWJsZShmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXRWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFZpc2libGUodmlzaWJsZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgYSBjb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgZGlzYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldERpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyByZXF1aXJlZCBsZXZlbCBvbiBhbiBhdHRyaWJ1dGUvY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldFJlcXVpcmVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGlzUmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cj8uc2V0UmVxdWlyZWRMZXZlbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZihmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzaG93ID0gISFwcmVkaWNhdGUoKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIGNvbnRyb2xOYW1lLCBzaG93KTtcclxuICAgICAgICByZXR1cm4gc2hvdztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmTG9va3VwRXF1YWxzKGZjOiBhbnksIGxvb2t1cEF0dHI6IHN0cmluZywgdGFyZ2V0SWQ6IHN0cmluZywgY29udHJvbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5SGVscGVyLnNob3dJZihmYywgY29udHJvbE5hbWUsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IEZvcm1Db250cm9sSGVscGVyLmdldExvb2t1cElkKGZjLCBsb29rdXBBdHRyKTtcclxuICAgICAgICAgICAgcmV0dXJuICEhY3VycmVudCAmJiBVdGlsLnNhbml0aXplR3VpZChjdXJyZW50KSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQodGFyZ2V0SWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBUeXBlIGd1YXJkOiBjb250cm9sIHN1cHBvcnRzIHNldERpc2FibGVkICovXHJcbiAgICBzdGF0aWMgaXNEaXNhYmxlYWJsZShjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCk6IGNvbnRyb2wgaXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCB7XHJcbiAgICAgICAgcmV0dXJuIFwic2V0RGlzYWJsZWRcIiBpbiBjb250cm9sICYmIHR5cGVvZiAoY29udHJvbCBhcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sKS5zZXREaXNhYmxlZCA9PT0gXCJmdW5jdGlvblwiO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgZGlhbG9nIGhlbHBlciAtLS0tXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nIH0+XHJcbiAgICApOiBQcm9taXNlPExvb2t1cFJlc3VsdFtdPiB7XHJcbiAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBpZHNcclxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IGA8dmFsdWUgdWl0eXBlPVwiJHtlbnRpdHlMb2dpY2FsfVwiPnske1V0aWwuc2FuaXRpemVHdWlkKGlkKX19PC92YWx1ZT5gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyWG1sID0gYFxyXG4gICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7aWRBdHRyaWJ1dGV9XCIgb3BlcmF0b3I9XCJpblwiPlxyXG4gICAgICAgICAgJHtpblZhbHVlc31cclxuICAgICAgICA8L2NvbmRpdGlvbj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN0YXRlY29kZVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIjBcIiAvPlxyXG4gICAgICA8L2ZpbHRlcj5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9va3VwT3B0aW9uczogYW55ID0ge1xyXG4gICAgICAgICAgICBhbGxvd011bHRpU2VsZWN0OiBvcHRpb25zPy5hbGxvd011bHRpU2VsZWN0ID8/IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHRFbnRpdHlUeXBlOiBlbnRpdHlMb2dpY2FsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlczogW2VudGl0eUxvZ2ljYWxdLFxyXG4gICAgICAgICAgICBmaWx0ZXJzOiBbeyBlbnRpdHlMb2dpY2FsTmFtZTogZW50aXR5TG9naWNhbCwgZmlsdGVyWG1sIH1dLFxyXG4gICAgICAgICAgICBkaXNhYmxlTXJ1OiBvcHRpb25zPy5kaXNhYmxlTXJ1ID8/IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LmRlZmF1bHRWaWV3SWQpIGxvb2t1cE9wdGlvbnMuZGVmYXVsdFZpZXdJZCA9IG9wdGlvbnMuZGVmYXVsdFZpZXdJZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCBVdGlsLlhybS5VdGlsaXR5Lmxvb2t1cE9iamVjdHMobG9va3VwT3B0aW9ucykpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEdlbmVyaWMgbG9va3VwIE9EYXRhIHNlcnZpY2UgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRJZEJ5RXF1YWxpdHkoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIGF0dHI6IHN0cmluZyxcclxuICAgICAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhblxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgbGl0ID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCA6IFN0cmluZyh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RJZEJ5RmlsdGVyKGVudGl0eUxvZ2ljYWwsIGlkQXR0ciwgYCgke2F0dHJ9IGVxICR7bGl0fSlgKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm1XYWl0IHtcclxuICAgIHN0YXRpYyB3YWl0Rm9yTG9va3VwVmFsdWUoZmM6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCB0aW1lb3V0TXMgPSA2MDAwKTogUHJvbWlzZTxYcm0uTG9va3VwVmFsdWUgfCBudWxsPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlTmFtZSkgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWF0dHIpIHJldHVybiByZXNvbHZlKG51bGwpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgaWYgKG5vdz8uaWQpIHJldHVybiByZXNvbHZlKG5vdyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZG9uZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4geyB0cnkgeyBhdHRyLnJlbW92ZU9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH0gfTtcclxuICAgICAgICAgICAgY29uc3Qgb25DaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgICAgICBpZiAodj8uaWQpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZSh2KTsgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdHJ5IHsgYXR0ci5hZGRPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQob25DaGFuZ2UsIDApO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGlmICghZG9uZSkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKG51bGwpOyB9IH0sIHRpbWVvdXRNcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBPd25lckhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0T3duZXJBdHRyaWJ1dGUoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gKGZjPy5nZXRBdHRyaWJ1dGU/Lihvd25lckF0dHJOYW1lKSA/PyBudWxsKSBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEN1cnJlbnRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBPd25lclJlZiB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKT8uZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgaWYgKCF2Py5pZCB8fCAhdi5lbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4geyBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodi5pZCksIGVudGl0eVR5cGU6IHYuZW50aXR5VHlwZSBhcyBhbnksIG5hbWU6IHYubmFtZSA/PyBudWxsIH07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNldE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZywgb3duZXI6IE93bmVyUmVmKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cikgcmV0dXJuO1xyXG4gICAgICAgIGF0dHIuc2V0VmFsdWUoW3tcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKG93bmVyLmlkKSxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTogb3duZXIuZW50aXR5VHlwZSxcclxuICAgICAgICAgICAgbmFtZTogb3duZXIubmFtZSA/PyB1bmRlZmluZWRcclxuICAgICAgICB9IGFzIGFueV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpc1NhbWVPd25lcihhPzogT3duZXJSZWYgfCBudWxsLCBiPzogT3duZXJSZWYgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGEuZW50aXR5VHlwZSA9PT0gYi5lbnRpdHlUeXBlICYmIFV0aWwuc2FuaXRpemVHdWlkKGEuaWQpID09PSBVdGlsLnNhbml0aXplR3VpZChiLmlkKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEdlbmVyaWMgc2VydmljZTogTG9hZCBvd25lciAoVXNlciBvciBUZWFtKSBmb3IgYW55IHJlY29yZCAqL1xyXG5leHBvcnQgY2xhc3MgT3duZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRPd25lclJlZihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVjb3JkSWQ6IHN0cmluZyxcclxuICAgICAgICBvd25lckF0dHJOYW1lID0gXCJvd25lcmlkXCJcclxuICAgICk6IFByb21pc2U8T3duZXJSZWYgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBVdGlsLnNhbml0aXplR3VpZChyZWNvcmRJZCk7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIC8vIEZvciBwb2x5bW9ycGhpYyBvd25lciBsb29rdXBzLCBleHBhbmQgZGVkaWNhdGVkIG5hdiBwcm9wcyB0byBhdm9pZCBwcm9wZXJ0eS1ub3QtZm91bmQgZXJyb3JzXHJcbiAgICAgICAgY29uc3QgZXhwYW5kID0gYD8kc2VsZWN0PSR7b3duZXJBdHRyTmFtZX0mJGV4cGFuZD1vd25pbmd1c2VyKCRzZWxlY3Q9c3lzdGVtdXNlcmlkLGZ1bGxuYW1lKSxvd25pbmd0ZWFtKCRzZWxlY3Q9dGVhbWlkLG5hbWUpYDtcclxuICAgICAgICBjb25zdCByZWMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbCwgaWQsIGV4cGFuZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSByZWM/LltcIm93bmluZ3VzZXJcIl07XHJcbiAgICAgICAgaWYgKHVzZXI/LnN5c3RlbXVzZXJpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHVzZXIuc3lzdGVtdXNlcmlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdXNlci5mdWxsbmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZWFtID0gcmVjPy5bXCJvd25pbmd0ZWFtXCJdO1xyXG4gICAgICAgIGlmICh0ZWFtPy50ZWFtaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh0ZWFtLnRlYW1pZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInRlYW1cIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRlYW0ubmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFNlY3VyaXR5LXJlbGF0ZWQgaGVscGVycyAqL1xyXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlTZXJ2aWNlIHtcclxuICAgICAgICAvKiogUmV0dXJucyBjdXJyZW50IHVzZXIgaWQgZnJvbSBYcm0gY29udGV4dCAqL1xyXG4gICAgICAgIHN0YXRpYyBnZXRDdXJyZW50VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBVdGlsLlhybT8uVXRpbGl0eT8uZ2V0R2xvYmFsQ29udGV4dD8uKCk/LnVzZXJTZXR0aW5ncz8udXNlcklkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm5zIHJvbGUgbmFtZXMgb2YgdGhlIGN1cnJlbnQgdXNlciAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBnZXRDdXJyZW50VXNlclJvbGVzKCk6IFByb21pc2U8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldEN1cnJlbnRVc2VySWQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdXNlcklkKSByZXR1cm4gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRmV0Y2hYTUwgb3ZlciBzeXN0ZW11c2Vycm9sZXMgKE46TikgdG8gcm9sZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZmV0Y2ggdmVyc2lvbj1cIjEuMFwiIGRpc3RpbmN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInJvbGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwicm9sZWlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlcnJvbGVzXCIgZnJvbT1cInJvbGVpZFwiIHRvPVwicm9sZWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2VyXCIgZnJvbT1cInN5c3RlbXVzZXJpZFwiIHRvPVwic3lzdGVtdXNlcmlkXCIgYWxpYXM9XCJ1XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke3VzZXJJZH1cIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZmV0Y2g+YC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQuZmV0Y2hYbWwoXCJyb2xlXCIsIGZldGNoWG1sKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAocmVzLmVudGl0aWVzIHx8IFtdKS5tYXAoKGUpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChlW1wicm9sZWlkXCJdID8/IGVbXCJfcm9sZWlkX3ZhbHVlXCJdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZVtcIm5hbWVcIl0gYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgfSkpLmZpbHRlcihyID0+ICEhci5pZCAmJiAhIXIubmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2hlY2tzIGlmIGN1cnJlbnQgdXNlciBoYXMgb25lIG9mIHRoZSBwcm92aWRlZCByb2xlIG5hbWVzIChjYXNlLWluc2Vuc2l0aXZlKSAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBoYXNDdXJyZW50VXNlclJvbGUoLi4ucm9sZU5hbWVzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2FudGVkID0gbmV3IFNldChyb2xlTmFtZXMubWFwKG4gPT4gbi50cmltKCkudG9Mb3dlckNhc2UoKSkuZmlsdGVyKEJvb2xlYW4pKTtcclxuICAgICAgICAgICAgICAgIGlmICh3YW50ZWQuc2l6ZSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRVc2VyUm9sZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByb2xlcy5zb21lKHIgPT4gd2FudGVkLmhhcyhyLm5hbWUudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgY29udHJvbCB2aWV3IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwVmlld0hlbHBlciB7XHJcbiAgICAvKiogUmVzdHJpY3QgYSBsb29rdXAgY29udHJvbCB0byBzcGVjaWZpYyBlbnRpdHkgdHlwZXMgKi9cclxuICAgIHN0YXRpYyBzZXRFbnRpdHlUeXBlcyhmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nLCBlbnRpdHlUeXBlczogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY3RybD8uc2V0RW50aXR5VHlwZXM/LihlbnRpdHlUeXBlcyk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZCBhIGN1c3RvbSB2aWV3IHRvIGEgbG9va3VwIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBhZGRDdXN0b21WaWV3KFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgY29udHJvbE5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBlbnRpdHlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0Rpc3BsYXlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZmV0Y2hYbWw6IHN0cmluZyxcclxuICAgICAgICBsYXlvdXRYbWw6IHN0cmluZyxcclxuICAgICAgICBzZXRBc0RlZmF1bHQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFjdHJsPy5hZGRDdXN0b21WaWV3KSByZXR1cm47XHJcbiAgICAgICAgICAgIGN0cmwuYWRkQ3VzdG9tVmlldyh2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwudHJpbSgpLCBsYXlvdXRYbWwudHJpbSgpLCBzZXRBc0RlZmF1bHQpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGRzIGEgY3VzdG9tIHZpZXcgZm9yIG93bmVyIGxvb2t1cCB0byBzaG93IG9ubHkgdGVhbXMgdGhlIGN1cnJlbnQgdXNlciBiZWxvbmdzIHRvLiAqL1xyXG4gICAgc3RhdGljIGFkZE93bmVyVGVhbVZpZXdGb3JDdXJyZW50VXNlcihmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nID0gXCJvd25lcmlkXCIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gXCJ0ZWFtXCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0Rpc3BsYXlOYW1lID0gXCJPd25lclRlYW1Mb29rdXBWaWV3XCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0lkID0gXCJ7MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxfVwiO1xyXG5cclxuICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgPGZldGNoPlxyXG4gICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwidGVhbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImJ1c2luZXNzdW5pdGlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cIm5ldl9vd25lcnRlYW0yc3lzdGVtdXNlclwiIGZyb209XCJ0ZWFtaWRcIiB0bz1cInRlYW1pZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcS11c2VyaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgIDwvZmV0Y2g+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgY29uc3QgbGF5b3V0WG1sID0gYFxyXG4gICAgICAgICAgICA8Z3JpZCBuYW1lPSdyZXN1bHRzZXQnIG9iamVjdD0nMScganVtcD0ndGVhbWlkJyBzZWxlY3Q9JzEnIGljb249JzEnIHByZXZpZXc9JzEnPlxyXG4gICAgICAgICAgICAgICAgPHJvdyBuYW1lPSdyZXN1bHQnIGlkPSd0ZWFtaWQnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J25hbWUnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nYnVzaW5lc3N1bml0aWQnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICA8L3Jvdz5cclxuICAgICAgICAgICAgPC9ncmlkPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuYWRkQ3VzdG9tVmlldyhmYywgY29udHJvbE5hbWUsIHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbCwgbGF5b3V0WG1sLCB0cnVlKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpZWxkVmFsaWRhdG9yIHtcclxuICAgIC8qKlxyXG4gICAgICogVmFsaWRhdGVzIGEgbnVtZXJpYyB0ZXh0IGZpZWxkIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cclxuICAgICAqIENhbiBiZSB1c2VkIGZvciBPbkNoYW5nZSBldmVudHMgYW5kIG9wdGlvbmFsbHkgcmVjZWl2ZXMgdGhlIGF0dHJpYnV0ZSBuYW1lIGFzIGEgcGFyYW1ldGVyLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdmFsaWRhdGVCaWdOdW1iZXIoXHJcbiAgICAgICAgZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQsXHJcbiAgICAgICAgYXR0cmlidXRlTmFtZT86IHN0cmluZ1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZm9ybUNvbnRleHQgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCkgYXMgWHJtLkZvcm1Db250ZXh0O1xyXG5cclxuICAgICAgICAvLyBJZiBubyBhdHRyaWJ1dGUgbmFtZSBpcyBwcm92aWRlZCDihpIgdXNlIGV2ZW50IHNvdXJjZVxyXG4gICAgICAgIGlmICghYXR0cmlidXRlTmFtZSkge1xyXG4gICAgICAgICAgICBjb25zdCBldmVudFNvdXJjZSA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0RXZlbnRTb3VyY2UoKSBhcyBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGU7XHJcbiAgICAgICAgICAgIGlmICghZXZlbnRTb3VyY2UpIHJldHVybjtcclxuICAgICAgICAgICAgYXR0cmlidXRlTmFtZSA9IGV2ZW50U291cmNlLmdldE5hbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcclxuICAgICAgICBjb25zdCBjb250cm9sID0gZm9ybUNvbnRleHQuZ2V0Q29udHJvbChhdHRyaWJ1dGVOYW1lKSBhcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sO1xyXG5cclxuICAgICAgICBpZiAoIWF0dHJpYnV0ZSB8fCAhY29udHJvbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25JZCA9IGAke2F0dHJpYnV0ZU5hbWV9X0JpZ051bWJlckVycm9yYDtcclxuICAgICAgICBsZXQgdmFsdWUgPSBhdHRyaWJ1dGUuZ2V0VmFsdWUoKSBhcyBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgZmllbGQgaXMgdHJ1bHkgZW1wdHkgKG51bGwpIOKGkiBjbGVhciBlcnJvciBhbmQgZXhpdFxyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb250cm9sLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbklkKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gS2VlcCBvcmlnaW5hbCBzdHJpbmcsIGJ1dCB3b3JrIG9uIGEgY29weVxyXG4gICAgICAgIGNvbnN0IHJhdyA9IHZhbHVlLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIGVudGVyZWQgb25seSB3aGl0ZXNwYWNlIOKGkiB0cmVhdCBhcyBpbnZhbGlkXHJcbiAgICAgICAgaWYgKHJhdy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24oXHJcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSBlbnRlciBhIG51bWVyaWMgdmFsdWUgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlwiLFxyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCB3aGl0ZXNwYWNlIGZvciB2YWxpZGF0aW9uIC8gc3RvcmFnZVxyXG4gICAgICAgIGNvbnN0IGRpZ2l0c09ubHkgPSByYXcucmVwbGFjZSgvXFxzKy9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgLy8gVmFsaWRhdGlvbjogb25seSBkaWdpdHMsIG1heC4gMTIgY2hhcmFjdGVyc1xyXG4gICAgICAgIGNvbnN0IGlzVmFsaWQgPSAvXlxcZHsxLDEyfSQvLnRlc3QoZGlnaXRzT25seSk7XHJcblxyXG4gICAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0Tm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgYSBudW1lcmljIHZhbHVlIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cIixcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFZhbGlkIOKGkiBjbGVhciBub3RpZmljYXRpb24gYW5kIHN0b3JlIHJhdyB2YWx1ZSB3aXRob3V0IHNwYWNlc1xyXG4gICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24obm90aWZpY2F0aW9uSWQpO1xyXG4gICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShkaWdpdHNPbmx5KTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgQVBQQ09ORklHID0ge1xyXG4gICAgZW50aXR5OiBcIm5ldl9jb25maWdcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIm5ldl9jb25maWdpZFwiLFxyXG4gICAgICAgIGtleTogXCJuZXZfa2V5XCIsXG4gICAgICAgIGpzb246IFwibmV2X3ZhbHVlX250ZXh0XCIsXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiZXhwb3J0IGNvbnN0IElOVEVSTkFMVEFTSyA9IHtcclxuICAgIGVudGl0eTogXCJuZXZfaW50ZXJuYWx0YXNrXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJuZXZfaW50ZXJuYWx0YXNraWRcIixcclxuICAgICAgICBzdWJqZWN0OiBcIm5ldl9zdWJqZWN0XCIsXHJcbiAgICAgICAgY29udGFjdGlkOiBcIm5ldl9jb250YWN0aWRcIixcclxuICAgICAgICBjb21wYW55aWQ6IFwibmV2X2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIHBvcnRmb2xpb2lkOiBcIm5ldl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGludGVybmFsVGFza1R5cGU6IFwibmV2X2ludGVybmFsdGFza3R5cGVcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4iLCJleHBvcnQgY29uc3QgSU5URVJOQUxUQVNLVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJuZXZfaW50ZXJuYWx0YXNrdHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwibmV2X2ludGVybmFsdGFza3R5cGVpZFwiLFxyXG4gICAgICAgIG5hbWU6IFwibmV2X25hbWVcIixcclxuICAgICAgICBpbnRlcm5hbHRhc2t0eXBlY29kZW5hbWU6IFwibmV2X2ludGVybmFsdGFza3R5cGVjb2RlbmFtZVwiXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuIiwiZXhwb3J0IGNvbnN0IENSRUFURV9JTlRFUk5BTF9UQVNLID0ge1xuICAgIGNvbmZpZ0tleTogXCJpZEludGVybmFsVGFza0RpYWxvZ0NvbmZpZ1wiLFxuICAgIGRpYWxvZ1dlYlJlc291cmNlTmFtZTogXCJtaHdybWJfY3JlYXRlSW50ZXJuYWxUYXNrRGlhbG9nLmh0bWxcIixcbn0gYXMgY29uc3Q7XG5cbiIsImltcG9ydCB7IElOVEVSTkFMVEFTSyB9IGZyb20gXCIuLi8uLi9lbnRpdGllcy9JbnRlcm5hbFRhc2suZW50aXR5XCI7XHJcbmltcG9ydCB7IElOVEVSTkFMVEFTS1RZUEUgfSBmcm9tIFwiLi4vLi4vZW50aXRpZXMvSW50ZXJuYWxUYXNrVHlwZS5lbnRpdHlcIjtcclxuaW1wb3J0IHsgQVBQQ09ORklHIH0gZnJvbSBcIi4uLy4uL2VudGl0aWVzL0FwcENvbmZpZy5lbnRpdHlcIjtcclxuaW1wb3J0IHsgRm9ybVR5cGVIZWxwZXIsIFV0aWwgfSBmcm9tIFwiLi4vLi4vY29yZS9jcm0uY29yZVwiO1xuaW1wb3J0IHsgQ1JFQVRFX0lOVEVSTkFMX1RBU0sgfSBmcm9tIFwiLi9jcmVhdGVJbnRlcm5hbFRhc2suY29uc3RhbnRzXCI7XHJcbmltcG9ydCB0eXBlIHtcbiAgICBDcmVhdGVJbnRlcm5hbFRhc2tBdmFpbGFiaWxpdHksXG4gICAgQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnLFxuICAgIENyZWF0ZUludGVybmFsVGFza0RpYWxvZ0RhdGEsXG4gICAgQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlLFxuICAgIENyZWF0ZUludGVybmFsVGFza1NvdXJjZUVudGl0eSxcclxuICAgIEludGVybmFsVGFza1R5cGVPcHRpb24sXHJcbn0gZnJvbSBcIi4vY3JlYXRlSW50ZXJuYWxUYXNrLnR5cGVzXCI7XHJcblxyXG5jb25zdCBFTVBUWV9DT05GSUc6IENyZWF0ZUludGVybmFsVGFza0NvbmZpZyA9IHsgdmVyc2lvbjogMSwgdGFza1R5cGVzOiBbXSB9O1xuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRYcm0oKTogYW55IHtcclxuICAgIHJldHVybiAod2luZG93IGFzIGFueSkuWHJtID8/ICh3aW5kb3cucGFyZW50IGFzIGFueSk/LlhybTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGlzU3VwcG9ydGVkU291cmNlRW50aXR5KGVudGl0eU5hbWU6IHN0cmluZyk6IGVudGl0eU5hbWUgaXMgQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5IHtcclxuICAgIHJldHVybiBlbnRpdHlOYW1lID09PSBcImNvbnRhY3RcIiB8fCBlbnRpdHlOYW1lID09PSBcImFjY291bnRcIiB8fCBlbnRpdHlOYW1lID09PSBcIndybWJfcG9ydGZvbGlvXCI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRTb3VyY2VGcm9tRm9ybShmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0KTogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlIHwgbnVsbCB7XHJcbiAgICBjb25zdCBlbnRpdHlOYW1lID0gZm9ybUNvbnRleHQ/LmRhdGE/LmVudGl0eT8uZ2V0RW50aXR5TmFtZT8uKCk7XHJcbiAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKGZvcm1Db250ZXh0Py5kYXRhPy5lbnRpdHk/LmdldElkPy4oKSk7XHJcbiAgICBpZiAoIWVudGl0eU5hbWUgfHwgIWlkIHx8ICFpc1N1cHBvcnRlZFNvdXJjZUVudGl0eShlbnRpdHlOYW1lKSkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpZCxcclxuICAgICAgICBlbnRpdHlOYW1lLFxyXG4gICAgICAgIG5hbWU6IGZvcm1Db250ZXh0Py5kYXRhPy5lbnRpdHk/LmdldFByaW1hcnlBdHRyaWJ1dGVWYWx1ZT8uKCkgPz8gbnVsbCxcclxuICAgIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGVEaWFsb2dEYXRhKHNvdXJjZTogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlKTogc3RyaW5nIHtcclxuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoSlNPTi5zdHJpbmdpZnkoc291cmNlKSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZURpYWxvZ0RhdGEoc2VhcmNoOiBzdHJpbmcgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoKTogQ3JlYXRlSW50ZXJuYWxUYXNrRGlhbG9nRGF0YSB8IG51bGwge1xyXG4gICAgY29uc3QgcGFyYW1zID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhzZWFyY2gpO1xyXG4gICAgY29uc3QgcmF3ID0gcGFyYW1zLmdldChcImRhdGFcIik7XHJcbiAgICBpZiAoIXJhdykgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChyYXcpKSBhcyBDcmVhdGVJbnRlcm5hbFRhc2tEaWFsb2dEYXRhO1xyXG4gICAgICAgIGlmICghcGFyc2VkPy5pZCB8fCAhaXNTdXBwb3J0ZWRTb3VyY2VFbnRpdHkocGFyc2VkLmVudGl0eU5hbWUpKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5wYXJzZWQsXHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChwYXJzZWQuaWQpLFxyXG4gICAgICAgICAgICBuYW1lOiBwYXJzZWQubmFtZSA/PyBudWxsLFxyXG4gICAgICAgIH07XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5DcmVhdGVJbnRlcm5hbFRhc2tEaWFsb2coc291cmNlOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2UpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGF3YWl0IGdldFhybSgpLk5hdmlnYXRpb24ubmF2aWdhdGVUbyhcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHBhZ2VUeXBlOiBcIndlYnJlc291cmNlXCIsXHJcbiAgICAgICAgICAgIHdlYnJlc291cmNlTmFtZTogQ1JFQVRFX0lOVEVSTkFMX1RBU0suZGlhbG9nV2ViUmVzb3VyY2VOYW1lLFxyXG4gICAgICAgICAgICBkYXRhOiBlbmNvZGVEaWFsb2dEYXRhKHNvdXJjZSksXHJcbiAgICAgICAgfSxcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIHRhcmdldDogMixcclxuICAgICAgICAgICAgcG9zaXRpb246IDEsXHJcbiAgICAgICAgICAgIHdpZHRoOiB7IHZhbHVlOiA1MDAsIHVuaXQ6IFwicHhcIiB9LFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHsgdmFsdWU6IDMyMCwgdW5pdDogXCJweFwiIH0sXHJcbiAgICAgICAgICAgIHRpdGxlOiBcIkNyZWF0ZSBJbnRlcm5hbCBUYXNrXCIsXHJcbiAgICAgICAgfVxyXG4gICAgKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEN1cnJlbnRVc2VyUm9sZU5hbWVzKCk6IHN0cmluZ1tdIHtcclxuICAgIGNvbnN0IHJvbGVzID0gZ2V0WHJtKCk/LlV0aWxpdHk/LmdldEdsb2JhbENvbnRleHQ/LigpPy51c2VyU2V0dGluZ3M/LnJvbGVzO1xyXG4gICAgY29uc3QgbmFtZXM6IHN0cmluZ1tdID0gW107XHJcbiAgICB0cnkge1xyXG4gICAgICAgIHJvbGVzPy5mb3JFYWNoPy4oKHJvbGU6IHsgbmFtZT86IHN0cmluZyB9KSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChyb2xlPy5uYW1lKSBuYW1lcy5wdXNoKHJvbGUubmFtZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbmFtZXM7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbmFtZXM7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBoYXNBbnlSb2xlKHJvbGVOYW1lcz86IHJlYWRvbmx5IHN0cmluZ1tdLCB1c2VyUm9sZU5hbWVzID0gZ2V0Q3VycmVudFVzZXJSb2xlTmFtZXMoKSk6IGJvb2xlYW4ge1xyXG4gICAgaWYgKCFyb2xlTmFtZXM/Lmxlbmd0aCkgcmV0dXJuIHRydWU7XHJcbiAgICBjb25zdCBhdmFpbGFibGUgPSBuZXcgU2V0KHVzZXJSb2xlTmFtZXMubWFwKChuYW1lKSA9PiBuYW1lLnRyaW0oKS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICByZXR1cm4gcm9sZU5hbWVzLnNvbWUoKG5hbWUpID0+IGF2YWlsYWJsZS5oYXMobmFtZS50cmltKCkudG9Mb3dlckNhc2UoKSkpO1xyXG59XHJcblxyXG5mdW5jdGlvbiBpc0FsbG93ZWRGb3JTb3VyY2Uob3B0aW9uOiBJbnRlcm5hbFRhc2tUeXBlT3B0aW9uLCBzb3VyY2VFbnRpdHk/OiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHkpOiBib29sZWFuIHtcclxuICAgIGlmICghc291cmNlRW50aXR5IHx8ICFvcHRpb24uc291cmNlRW50aXRpZXM/Lmxlbmd0aCkgcmV0dXJuIHRydWU7XHJcbiAgICByZXR1cm4gb3B0aW9uLnNvdXJjZUVudGl0aWVzLmluY2x1ZGVzKHNvdXJjZUVudGl0eSk7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIG5vcm1hbGl6ZUNvbmZpZ09wdGlvbihyYXc6IGFueSk6IEludGVybmFsVGFza1R5cGVPcHRpb24gfCBudWxsIHtcclxuICAgIGlmICghcmF3IHx8IHR5cGVvZiByYXcgIT09IFwib2JqZWN0XCIpIHJldHVybiBudWxsO1xyXG4gICAgY29uc3Qga2V5ID0gU3RyaW5nKHJhdy5rZXkgPz8gXCJcIikudHJpbSgpO1xyXG4gICAgY29uc3QgbGFiZWwgPSBTdHJpbmcocmF3LmxhYmVsID8/IFwiXCIpLnRyaW0oKTtcclxuICAgIGNvbnN0IHRhc2tUeXBlQ29kZU5hbWUgPSBTdHJpbmcocmF3LnRhc2tUeXBlQ29kZU5hbWUgPz8gXCJcIikudHJpbSgpO1xyXG4gICAgaWYgKCFrZXkgfHwgIWxhYmVsIHx8ICF0YXNrVHlwZUNvZGVOYW1lKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICBjb25zdCBhbGxvd2VkUm9sZXMgPSBBcnJheS5pc0FycmF5KHJhdy5hbGxvd2VkUm9sZXMpXHJcbiAgICAgICAgPyByYXcuYWxsb3dlZFJvbGVzLm1hcCgocm9sZTogdW5rbm93bikgPT4gU3RyaW5nKHJvbGUpLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAgICAgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgY29uc3Qgc291cmNlRW50aXRpZXMgPSBBcnJheS5pc0FycmF5KHJhdy5zb3VyY2VFbnRpdGllcylcclxuICAgICAgICA/IHJhdy5zb3VyY2VFbnRpdGllcy5maWx0ZXIoaXNTdXBwb3J0ZWRTb3VyY2VFbnRpdHkpXHJcbiAgICAgICAgOiB1bmRlZmluZWQ7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBrZXksXHJcbiAgICAgICAgbGFiZWwsXHJcbiAgICAgICAgdGFza1R5cGVDb2RlTmFtZSxcclxuICAgICAgICBhbGxvd2VkUm9sZXMsXHJcbiAgICAgICAgc291cmNlRW50aXRpZXMsXHJcbiAgICAgICAgZW5hYmxlZDogcmF3LmVuYWJsZWQgIT09IGZhbHNlLFxyXG4gICAgfTtcclxufVxyXG5cclxuZnVuY3Rpb24gcGFyc2VDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcoanNvblRleHQ6IHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQpOiBDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIEVNUFRZX0NPTkZJRztcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgcGFyc2VkID0gSlNPTi5wYXJzZShqc29uVGV4dCkgYXMgUGFydGlhbDxDcmVhdGVJbnRlcm5hbFRhc2tDb25maWc+O1xyXG4gICAgICAgIGNvbnN0IHRhc2tUeXBlcyA9IEFycmF5LmlzQXJyYXkocGFyc2VkLnRhc2tUeXBlcylcclxuICAgICAgICAgICAgPyBwYXJzZWQudGFza1R5cGVzLm1hcChub3JtYWxpemVDb25maWdPcHRpb24pLmZpbHRlcigoaXRlbSk6IGl0ZW0gaXMgSW50ZXJuYWxUYXNrVHlwZU9wdGlvbiA9PiBCb29sZWFuKGl0ZW0pKVxyXG4gICAgICAgICAgICA6IFtdO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHZlcnNpb246IHR5cGVvZiBwYXJzZWQudmVyc2lvbiA9PT0gXCJudW1iZXJcIiA/IHBhcnNlZC52ZXJzaW9uIDogMSxcclxuICAgICAgICAgICAgdGFza1R5cGVzLFxyXG4gICAgICAgIH07XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gRU1QVFlfQ09ORklHO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gbG9hZENyZWF0ZUludGVybmFsVGFza0NvbmZpZygpOiBQcm9taXNlPENyZWF0ZUludGVybmFsVGFza0NvbmZpZz4ge1xuICAgIGNvbnN0IGtleSA9IENSRUFURV9JTlRFUk5BTF9UQVNLLmNvbmZpZ0tleS5yZXBsYWNlKC8nL2csIFwiJydcIik7XG4gICAgY29uc3Qgb3B0aW9ucyA9IFtcclxuICAgICAgICBgPyRzZWxlY3Q9JHtBUFBDT05GSUcuZmllbGRzLmpzb259YCxcclxuICAgICAgICBgJiRmaWx0ZXI9JHtBUFBDT05GSUcuZmllbGRzLmtleX0gZXEgJyR7a2V5fSdgLFxyXG4gICAgICAgIFwiJiR0b3A9MVwiLFxyXG4gICAgXS5qb2luKFwiXCIpO1xyXG5cclxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGdldFhybSgpLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhBUFBDT05GSUcuZW50aXR5LCBvcHRpb25zKTtcbiAgICAgICAgY29uc3QganNvblRleHQgPSByZXN1bHQ/LmVudGl0aWVzPy5bMF0/LltBUFBDT05GSUcuZmllbGRzLmpzb25dIGFzIHN0cmluZyB8IG51bGwgfCB1bmRlZmluZWQ7XG4gICAgICAgIHJldHVybiBwYXJzZUNyZWF0ZUludGVybmFsVGFza0NvbmZpZyhqc29uVGV4dCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAgIHJldHVybiBFTVBUWV9DT05GSUc7XG4gICAgfVxufVxuXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRBbGxvd2VkSW50ZXJuYWxUYXNrVHlwZU9wdGlvbnMoc291cmNlRW50aXR5PzogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5KTogUHJvbWlzZTxJbnRlcm5hbFRhc2tUeXBlT3B0aW9uW10+IHtcbiAgICBjb25zdCBjb25maWcgPSBhd2FpdCBsb2FkQ3JlYXRlSW50ZXJuYWxUYXNrQ29uZmlnKCk7XG4gICAgY29uc3QgdXNlclJvbGVOYW1lcyA9IGdldEN1cnJlbnRVc2VyUm9sZU5hbWVzKCk7XG4gICAgcmV0dXJuIGNvbmZpZy50YXNrVHlwZXMuZmlsdGVyKChvcHRpb24pID0+XG4gICAgICAgIG9wdGlvbi5lbmFibGVkICE9PSBmYWxzZSAmJlxyXG4gICAgICAgIGlzQWxsb3dlZEZvclNvdXJjZShvcHRpb24sIHNvdXJjZUVudGl0eSkgJiZcclxuICAgICAgICBoYXNBbnlSb2xlKG9wdGlvbi5hbGxvd2VkUm9sZXMsIHVzZXJSb2xlTmFtZXMpXHJcbiAgICApO1xyXG59XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gY2FuQ3JlYXRlQW55SW50ZXJuYWxUYXNrKHNvdXJjZUVudGl0eT86IENyZWF0ZUludGVybmFsVGFza1NvdXJjZUVudGl0eSk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgIHJldHVybiAoYXdhaXQgZ2V0QWxsb3dlZEludGVybmFsVGFza1R5cGVPcHRpb25zKHNvdXJjZUVudGl0eSkpLmxlbmd0aCA+IDA7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBnZXRDcmVhdGVJbnRlcm5hbFRhc2tBdmFpbGFiaWxpdHkoXG4gICAgc291cmNlRW50aXR5PzogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlRW50aXR5XG4pOiBQcm9taXNlPENyZWF0ZUludGVybmFsVGFza0F2YWlsYWJpbGl0eT4ge1xuICAgIGNvbnN0IGNvbmZpZyA9IGF3YWl0IGxvYWRDcmVhdGVJbnRlcm5hbFRhc2tDb25maWcoKTtcbiAgICBpZiAoIWNvbmZpZy50YXNrVHlwZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJtaXNzaW5nX2NvbmZpZ1wiIH07XG4gICAgfVxuXG4gICAgY29uc3QgZW5hYmxlZE9wdGlvbnMgPSBjb25maWcudGFza1R5cGVzLmZpbHRlcigob3B0aW9uKSA9PiBvcHRpb24uZW5hYmxlZCAhPT0gZmFsc2UpO1xuICAgIGlmICghZW5hYmxlZE9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJub19lbmFibGVkX3Rhc2tfdHlwZXNcIiB9O1xuICAgIH1cblxuICAgIGNvbnN0IHNvdXJjZU9wdGlvbnMgPSBlbmFibGVkT3B0aW9ucy5maWx0ZXIoKG9wdGlvbikgPT4gaXNBbGxvd2VkRm9yU291cmNlKG9wdGlvbiwgc291cmNlRW50aXR5KSk7XG4gICAgaWYgKCFzb3VyY2VPcHRpb25zLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4geyBjYW5DcmVhdGU6IGZhbHNlLCByZWFzb246IFwibm9fc291cmNlX21hdGNoXCIgfTtcbiAgICB9XG5cbiAgICBjb25zdCB1c2VyUm9sZU5hbWVzID0gZ2V0Q3VycmVudFVzZXJSb2xlTmFtZXMoKTtcbiAgICBjb25zdCByb2xlT3B0aW9ucyA9IHNvdXJjZU9wdGlvbnMuZmlsdGVyKChvcHRpb24pID0+IGhhc0FueVJvbGUob3B0aW9uLmFsbG93ZWRSb2xlcywgdXNlclJvbGVOYW1lcykpO1xuICAgIGlmICghcm9sZU9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiB7IGNhbkNyZWF0ZTogZmFsc2UsIHJlYXNvbjogXCJub19yb2xlX21hdGNoXCIgfTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBjYW5DcmVhdGU6IHRydWUgfTtcbn1cblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcmVzb2x2ZUludGVybmFsVGFza1R5cGVCeUNvZGVOYW1lKHR5cGVDb2RlTmFtZTogc3RyaW5nKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9IHwgbnVsbD4ge1xyXG4gICAgY29uc3QgZXNjYXBlZCA9IHR5cGVDb2RlTmFtZS5yZXBsYWNlKC8nL2csIFwiJydcIik7XHJcbiAgICBjb25zdCBvcHRpb25zID0gW1xyXG4gICAgICAgIGA/JHNlbGVjdD0ke0lOVEVSTkFMVEFTS1RZUEUuZmllbGRzLnBrfSwke0lOVEVSTkFMVEFTS1RZUEUuZmllbGRzLm5hbWV9LCR7SU5URVJOQUxUQVNLVFlQRS5maWVsZHMuaW50ZXJuYWx0YXNrdHlwZWNvZGVuYW1lfWAsXHJcbiAgICAgICAgYCYkZmlsdGVyPSR7SU5URVJOQUxUQVNLVFlQRS5maWVsZHMuaW50ZXJuYWx0YXNrdHlwZWNvZGVuYW1lfSBlcSAnJHtlc2NhcGVkfSdgLFxyXG4gICAgXS5qb2luKFwiXCIpO1xyXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZ2V0WHJtKCkuV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKElOVEVSTkFMVEFTS1RZUEUuZW50aXR5LCBvcHRpb25zKTtcclxuICAgIGNvbnN0IHJvdyA9IHJlc3VsdD8uZW50aXRpZXM/LlswXTtcclxuICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocm93Py5bSU5URVJOQUxUQVNLVFlQRS5maWVsZHMucGtdKTtcclxuICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG4gICAgcmV0dXJuIHsgaWQsIG5hbWU6IHJvdz8uW0lOVEVSTkFMVEFTS1RZUEUuZmllbGRzLm5hbWVdID8/IHR5cGVDb2RlTmFtZSB9O1xyXG59XHJcblxyXG5mdW5jdGlvbiBnZXRTb3VyY2VMb29rdXBGaWVsZChlbnRpdHlOYW1lOiBDcmVhdGVJbnRlcm5hbFRhc2tTb3VyY2VFbnRpdHkpOiBzdHJpbmcge1xyXG4gICAgc3dpdGNoIChlbnRpdHlOYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcImNvbnRhY3RcIjpcclxuICAgICAgICAgICAgcmV0dXJuIElOVEVSTkFMVEFTSy5maWVsZHMuY29udGFjdGlkO1xyXG4gICAgICAgIGNhc2UgXCJhY2NvdW50XCI6XHJcbiAgICAgICAgICAgIHJldHVybiBJTlRFUk5BTFRBU0suZmllbGRzLmNvbXBhbnlpZDtcclxuICAgICAgICBjYXNlIFwid3JtYl9wb3J0Zm9saW9cIjpcclxuICAgICAgICAgICAgcmV0dXJuIElOVEVSTkFMVEFTSy5maWVsZHMucG9ydGZvbGlvaWQ7XHJcbiAgICAgICAgZGVmYXVsdDpcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBzb3VyY2UgZW50aXR5ICcke2VudGl0eU5hbWV9Jy5gKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gYnVpbGRJbnRlcm5hbFRhc2tGb3JtUGFyYW1ldGVycyhcbiAgICBzb3VyY2U6IENyZWF0ZUludGVybmFsVGFza1NvdXJjZSxcbiAgICB0YXNrVHlwZTogeyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVxuKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3Qgc291cmNlTG9va3VwRmllbGQgPSBnZXRTb3VyY2VMb29rdXBGaWVsZChzb3VyY2UuZW50aXR5TmFtZSk7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIFtzb3VyY2VMb29rdXBGaWVsZF06IHNvdXJjZS5pZCxcclxuICAgICAgICBbYCR7c291cmNlTG9va3VwRmllbGR9bmFtZWBdOiBzb3VyY2UubmFtZSA/PyBcIlwiLFxyXG4gICAgICAgIFtgJHtzb3VyY2VMb29rdXBGaWVsZH10eXBlYF06IHNvdXJjZS5lbnRpdHlOYW1lLFxyXG4gICAgICAgIFtJTlRFUk5BTFRBU0suZmllbGRzLmludGVybmFsVGFza1R5cGVdOiB0YXNrVHlwZS5pZCxcclxuICAgICAgICBbYCR7SU5URVJOQUxUQVNLLmZpZWxkcy5pbnRlcm5hbFRhc2tUeXBlfW5hbWVgXTogdGFza1R5cGUubmFtZSxcclxuICAgICAgICBbYCR7SU5URVJOQUxUQVNLLmZpZWxkcy5pbnRlcm5hbFRhc2tUeXBlfXR5cGVgXTogSU5URVJOQUxUQVNLVFlQRS5lbnRpdHksXHJcbiAgICB9O1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50V2luZG93Rm9ybVBhcmFtZXRlcnMoKTogUmVjb3JkPHN0cmluZywgc3RyaW5nPiB7XG4gICAgY29uc3QgcmVzdWx0OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG4gICAgY29uc3Qgc2VhcmNoID0gbmV3IFVSTFNlYXJjaFBhcmFtcyh3aW5kb3cubG9jYXRpb24uc2VhcmNoKTtcblxuICAgIHNlYXJjaC5mb3JFYWNoKCh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfSk7XG5cbiAgICBjb25zdCBleHRyYXFzID0gc2VhcmNoLmdldChcImV4dHJhcXNcIik7XG4gICAgaWYgKGV4dHJhcXMpIHtcbiAgICAgICAgbmV3IFVSTFNlYXJjaFBhcmFtcyhkZWNvZGVVUklDb21wb25lbnQoZXh0cmFxcykpLmZvckVhY2goKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIHNldExvb2t1cEZyb21Gb3JtUGFyYW1ldGVycyhcbiAgICBmb3JtQ29udGV4dDogWHJtLkZvcm1Db250ZXh0LFxuICAgIGZvcm1QYXJhbWV0ZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+LFxuICAgIGZpZWxkTmFtZTogc3RyaW5nXG4pOiBib29sZWFuIHtcbiAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKGZvcm1QYXJhbWV0ZXJzW2ZpZWxkTmFtZV0pO1xuICAgIGNvbnN0IGVudGl0eVR5cGUgPSBmb3JtUGFyYW1ldGVyc1tgJHtmaWVsZE5hbWV9dHlwZWBdO1xuICAgIGlmICghaWQgfHwgIWVudGl0eVR5cGUpIHJldHVybiBmYWxzZTtcblxuICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZTxYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGU+KGZpZWxkTmFtZSk7XG4gICAgaWYgKCFhdHRyaWJ1dGUpIHJldHVybiBmYWxzZTtcbiAgICBpZiAoYXR0cmlidXRlLmdldFZhbHVlKCk/LlswXT8uaWQpIHJldHVybiBmYWxzZTtcblxuICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShbe1xuICAgICAgICBpZCxcbiAgICAgICAgZW50aXR5VHlwZSxcbiAgICAgICAgbmFtZTogZm9ybVBhcmFtZXRlcnNbYCR7ZmllbGROYW1lfW5hbWVgXSB8fCB1bmRlZmluZWQsXG4gICAgfV0pO1xuICAgIGF0dHJpYnV0ZS5maXJlT25DaGFuZ2U/LigpO1xuICAgIHJldHVybiB0cnVlO1xufVxuXG5mdW5jdGlvbiBnZXRMZWdhY3lJbnRlcm5hbFRhc2tGdW5jdGlvbnMoKTogYW55IHtcbiAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLkFtYml0Py5NQUg/LldSTTIwMTM/LkpTPy5JbnRlcm5hbFRhc2tzRnVuY3Rpb25zO1xufVxuXG5mdW5jdGlvbiBoYXNDcmVhdGVJbnRlcm5hbFRhc2tQYXJhbWV0ZXJzKGZvcm1QYXJhbWV0ZXJzOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+KTogYm9vbGVhbiB7XG4gICAgcmV0dXJuIEJvb2xlYW4oXG4gICAgICAgIGZvcm1QYXJhbWV0ZXJzW0lOVEVSTkFMVEFTSy5maWVsZHMuY29udGFjdGlkXSB8fFxuICAgICAgICBmb3JtUGFyYW1ldGVyc1tJTlRFUk5BTFRBU0suZmllbGRzLmNvbXBhbnlpZF0gfHxcbiAgICAgICAgZm9ybVBhcmFtZXRlcnNbSU5URVJOQUxUQVNLLmZpZWxkcy5wb3J0Zm9saW9pZF0gfHxcbiAgICAgICAgZm9ybVBhcmFtZXRlcnNbSU5URVJOQUxUQVNLLmZpZWxkcy5pbnRlcm5hbFRhc2tUeXBlXVxuICAgICk7XG59XG5cbmZ1bmN0aW9uIGFwcGx5SW50ZXJuYWxUYXNrQ3JlYXRlRGVmYXVsdHNGcm9tQ3VycmVudFBhcmFtZXRlcnMoZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiBib29sZWFuIHtcbiAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcbiAgICBpZiAoIUZvcm1UeXBlSGVscGVyLmlzQ3JlYXRlTGlrZShGb3JtVHlwZUhlbHBlci5nZXQoZm9ybUNvbnRleHQpKSkgcmV0dXJuIGZhbHNlO1xuXG4gICAgY29uc3QgZm9ybVBhcmFtZXRlcnMgPSBnZXRDdXJyZW50V2luZG93Rm9ybVBhcmFtZXRlcnMoKTtcbiAgICBpZiAoIWhhc0NyZWF0ZUludGVybmFsVGFza1BhcmFtZXRlcnMoZm9ybVBhcmFtZXRlcnMpKSByZXR1cm4gZmFsc2U7XG5cbiAgICBsZXQgYXBwbGllZCA9IGZhbHNlO1xuICAgIGFwcGxpZWQgPSBzZXRMb29rdXBGcm9tRm9ybVBhcmFtZXRlcnMoZm9ybUNvbnRleHQsIGZvcm1QYXJhbWV0ZXJzLCBJTlRFUk5BTFRBU0suZmllbGRzLmNvbnRhY3RpZCkgfHwgYXBwbGllZDtcbiAgICBhcHBsaWVkID0gc2V0TG9va3VwRnJvbUZvcm1QYXJhbWV0ZXJzKGZvcm1Db250ZXh0LCBmb3JtUGFyYW1ldGVycywgSU5URVJOQUxUQVNLLmZpZWxkcy5jb21wYW55aWQpIHx8IGFwcGxpZWQ7XG4gICAgYXBwbGllZCA9IHNldExvb2t1cEZyb21Gb3JtUGFyYW1ldGVycyhmb3JtQ29udGV4dCwgZm9ybVBhcmFtZXRlcnMsIElOVEVSTkFMVEFTSy5maWVsZHMucG9ydGZvbGlvaWQpIHx8IGFwcGxpZWQ7XG4gICAgYXBwbGllZCA9IHNldExvb2t1cEZyb21Gb3JtUGFyYW1ldGVycyhmb3JtQ29udGV4dCwgZm9ybVBhcmFtZXRlcnMsIElOVEVSTkFMVEFTSy5maWVsZHMuaW50ZXJuYWxUYXNrVHlwZSkgfHwgYXBwbGllZDtcbiAgICByZXR1cm4gYXBwbGllZDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRpYWxpemVJbnRlcm5hbFRhc2tDcmVhdGVGb3JtKGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KTogdm9pZCB7XG4gICAgYXBwbHlJbnRlcm5hbFRhc2tDcmVhdGVEZWZhdWx0c0Zyb21DdXJyZW50UGFyYW1ldGVycyhleGVjdXRpb25Db250ZXh0KTtcblxuICAgIGNvbnN0IGxlZ2FjeSA9IGdldExlZ2FjeUludGVybmFsVGFza0Z1bmN0aW9ucygpO1xuICAgIGlmIChsZWdhY3k/Lk9uTG9hZCkge1xuICAgICAgICBsZWdhY3kuT25Mb2FkKGV4ZWN1dGlvbkNvbnRleHQpO1xuICAgIH1cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9wZW5JbnRlcm5hbFRhc2tDcmVhdGVGb3JtKFxuICAgIHNvdXJjZTogQ3JlYXRlSW50ZXJuYWxUYXNrU291cmNlLFxuICAgIG9wdGlvbjogSW50ZXJuYWxUYXNrVHlwZU9wdGlvblxuKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgaWYgKCFoYXNBbnlSb2xlKG9wdGlvbi5hbGxvd2VkUm9sZXMpKSB7XHJcbiAgICAgICAgYXdhaXQgZ2V0WHJtKCkuTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIllvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIGNyZWF0ZSB0aGlzIEludGVybmFsIFRhc2sgdHlwZS5cIiB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgdGFza1R5cGUgPSBhd2FpdCByZXNvbHZlSW50ZXJuYWxUYXNrVHlwZUJ5Q29kZU5hbWUob3B0aW9uLnRhc2tUeXBlQ29kZU5hbWUpO1xyXG4gICAgaWYgKCF0YXNrVHlwZSkge1xyXG4gICAgICAgIGF3YWl0IGdldFhybSgpLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogYEludGVybmFsIFRhc2sgVHlwZSAnJHtvcHRpb24udGFza1R5cGVDb2RlTmFtZX0nIHdhcyBub3QgZm91bmQuYCB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgYXdhaXQgZ2V0WHJtKCkuTmF2aWdhdGlvbi5vcGVuRm9ybShcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgIGVudGl0eU5hbWU6IElOVEVSTkFMVEFTSy5lbnRpdHksXHJcbiAgICAgICAgICAgIG9wZW5Jbk5ld1dpbmRvdzogdHJ1ZSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJ1aWxkSW50ZXJuYWxUYXNrRm9ybVBhcmFtZXRlcnMoc291cmNlLCB0YXNrVHlwZSlcclxuICAgICk7XHJcbn1cclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQge1xyXG4gICAgZ2V0QWxsb3dlZEludGVybmFsVGFza1R5cGVPcHRpb25zLFxyXG4gICAgZ2V0WHJtLFxyXG4gICAgb3BlbkludGVybmFsVGFza0NyZWF0ZUZvcm0sXHJcbiAgICBwYXJzZURpYWxvZ0RhdGEsXHJcbn0gZnJvbSBcIi4uL2ZlYXR1cmVzL2NyZWF0ZUludGVybmFsVGFzay9jcmVhdGVJbnRlcm5hbFRhc2suc2VydmljZVwiO1xyXG5pbXBvcnQgdHlwZSB7IEludGVybmFsVGFza1R5cGVPcHRpb24gfSBmcm9tIFwiLi4vZmVhdHVyZXMvY3JlYXRlSW50ZXJuYWxUYXNrL2NyZWF0ZUludGVybmFsVGFzay50eXBlc1wiO1xyXG5cclxubGV0IGRpYWxvZ1NvdXJjZSA9IHBhcnNlRGlhbG9nRGF0YSgpO1xyXG5sZXQgYWxsb3dlZE9wdGlvbnM6IEludGVybmFsVGFza1R5cGVPcHRpb25bXSA9IFtdO1xyXG5cclxuZnVuY3Rpb24gZ2V0RWxlbWVudDxUIGV4dGVuZHMgSFRNTEVsZW1lbnQ+KGlkOiBzdHJpbmcpOiBUIHtcclxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcbiAgICBpZiAoIWVsZW1lbnQpIHRocm93IG5ldyBFcnJvcihgTWlzc2luZyBlbGVtZW50ICcke2lkfScuYCk7XHJcbiAgICByZXR1cm4gZWxlbWVudCBhcyBUO1xyXG59XHJcblxyXG5mdW5jdGlvbiBzZXRTdGF0dXModGV4dDogc3RyaW5nLCBpc0Vycm9yID0gZmFsc2UpOiB2b2lkIHtcclxuICAgIGNvbnN0IHN0YXR1cyA9IGdldEVsZW1lbnQ8SFRNTERpdkVsZW1lbnQ+KFwic3RhdHVzXCIpO1xyXG4gICAgc3RhdHVzLnRleHRDb250ZW50ID0gdGV4dDtcclxuICAgIHN0YXR1cy5jbGFzc05hbWUgPSBpc0Vycm9yID8gXCJzdGF0dXMgZXJyb3JcIiA6IFwic3RhdHVzXCI7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHBvcHVsYXRlT3B0aW9ucygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGNvbnN0IHNlbGVjdCA9IGdldEVsZW1lbnQ8SFRNTFNlbGVjdEVsZW1lbnQ+KFwidGFza1R5cGVTZWxlY3RcIik7XHJcbiAgICBzZWxlY3QuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICBhbGxvd2VkT3B0aW9ucyA9IGF3YWl0IGdldEFsbG93ZWRJbnRlcm5hbFRhc2tUeXBlT3B0aW9ucyhkaWFsb2dTb3VyY2U/LmVudGl0eU5hbWUpO1xyXG4gICAgZm9yIChjb25zdCBvcHRpb24gb2YgYWxsb3dlZE9wdGlvbnMpIHtcclxuICAgICAgICBjb25zdCBpdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcclxuICAgICAgICBpdGVtLnZhbHVlID0gb3B0aW9uLmtleTtcclxuICAgICAgICBpdGVtLnRleHRDb250ZW50ID0gb3B0aW9uLmxhYmVsO1xyXG4gICAgICAgIHNlbGVjdC5hcHBlbmRDaGlsZChpdGVtKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIWFsbG93ZWRPcHRpb25zLmxlbmd0aCkge1xyXG4gICAgICAgIHNlbGVjdC5kaXNhYmxlZCA9IHRydWU7XHJcbiAgICAgICAgZ2V0RWxlbWVudDxIVE1MQnV0dG9uRWxlbWVudD4oXCJjcmVhdGVCdXR0b25cIikuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHNldFN0YXR1cyhcIk5vIEludGVybmFsIFRhc2sgdHlwZXMgYXJlIGF2YWlsYWJsZSBmb3IgeW91ciBzZWN1cml0eSByb2xlcy5cIiwgdHJ1ZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVNlbGVjdGVkVGFzaygpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghZGlhbG9nU291cmNlKSB7XHJcbiAgICAgICAgc2V0U3RhdHVzKFwiVGhlIHNvdXJjZSByZWNvcmQgY29udGV4dCBpcyBtaXNzaW5nLlwiLCB0cnVlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0ID0gZ2V0RWxlbWVudDxIVE1MU2VsZWN0RWxlbWVudD4oXCJ0YXNrVHlwZVNlbGVjdFwiKTtcclxuICAgIGNvbnN0IG9wdGlvbiA9IGFsbG93ZWRPcHRpb25zLmZpbmQoKGl0ZW0pID0+IGl0ZW0ua2V5ID09PSBzZWxlY3QudmFsdWUpO1xyXG4gICAgaWYgKCFvcHRpb24pIHtcclxuICAgICAgICBzZXRTdGF0dXMoXCJQbGVhc2Ugc2VsZWN0IGFuIEludGVybmFsIFRhc2sgdHlwZS5cIiwgdHJ1ZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgICAgZ2V0RWxlbWVudDxIVE1MQnV0dG9uRWxlbWVudD4oXCJjcmVhdGVCdXR0b25cIikuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHNldFN0YXR1cyhcIk9wZW5pbmcgSW50ZXJuYWwgVGFzay4uLlwiKTtcclxuICAgICAgICBhd2FpdCBvcGVuSW50ZXJuYWxUYXNrQ3JlYXRlRm9ybShkaWFsb2dTb3VyY2UsIG9wdGlvbik7XHJcbiAgICAgICAgY2xvc2VEaWFsb2coKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICBnZXRFbGVtZW50PEhUTUxCdXR0b25FbGVtZW50PihcImNyZWF0ZUJ1dHRvblwiKS5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIHNldFN0YXR1cyhlcnJvcj8ubWVzc2FnZSA/PyBTdHJpbmcoZXJyb3IpLCB0cnVlKTtcclxuICAgIH1cclxufVxyXG5cclxuZnVuY3Rpb24gY2xvc2VEaWFsb2coKTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGdldFhybSgpPy5OYXZpZ2F0aW9uPy5uYXZpZ2F0ZUJhY2s/LigpO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgd2luZG93LmNsb3NlKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmZ1bmN0aW9uIGluaXQoKTogdm9pZCB7XHJcbiAgICBpZiAoIWRpYWxvZ1NvdXJjZSkge1xyXG4gICAgICAgIHNldFN0YXR1cyhcIlRoZSBkaWFsb2cgd2FzIG9wZW5lZCB3aXRob3V0IGEgdmFsaWQgc291cmNlIHJlY29yZC5cIiwgdHJ1ZSk7XHJcbiAgICAgICAgZ2V0RWxlbWVudDxIVE1MQnV0dG9uRWxlbWVudD4oXCJjcmVhdGVCdXR0b25cIikuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBnZXRFbGVtZW50PEhUTUxEaXZFbGVtZW50PihcInNvdXJjZUluZm9cIikudGV4dENvbnRlbnQgPSBkaWFsb2dTb3VyY2UubmFtZVxyXG4gICAgICAgID8gYCR7ZGlhbG9nU291cmNlLm5hbWV9ICgke2RpYWxvZ1NvdXJjZS5lbnRpdHlOYW1lfSlgXHJcbiAgICAgICAgOiBkaWFsb2dTb3VyY2UuZW50aXR5TmFtZTtcclxuXHJcbiAgICB2b2lkIHBvcHVsYXRlT3B0aW9ucygpO1xyXG4gICAgZ2V0RWxlbWVudDxIVE1MQnV0dG9uRWxlbWVudD4oXCJjcmVhdGVCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHZvaWQgY3JlYXRlU2VsZWN0ZWRUYXNrKCkpO1xyXG4gICAgZ2V0RWxlbWVudDxIVE1MQnV0dG9uRWxlbWVudD4oXCJjYW5jZWxCdXR0b25cIikuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGNsb3NlRGlhbG9nKTtcclxufVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgaW5pdCk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==