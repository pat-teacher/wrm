/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./WebResources/src/core/SecurityRoles.ts":
/*!************************************************!*\
  !*** ./WebResources/src/core/SecurityRoles.ts ***!
  \************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SECURITY_ROLES: () => (/* binding */ SECURITY_ROLES)
/* harmony export */ });
const SECURITY_ROLES = {
    WRM_COMPLIANCE_OFFICER: "WRM Compliance Officer",
};


/***/ }),

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

/***/ "./WebResources/src/entities/Company.entity.ts":
/*!*****************************************************!*\
  !*** ./WebResources/src/entities/Company.entity.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   COMPANY: () => (/* binding */ COMPANY)
/* harmony export */ });
const COMPANY = {
    entity: "account",
    fields: {
        pk: "accountid",
        nev_businessunit: "nev_businessunit",
        ownerid: "ownerid",
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

/***/ "./WebResources/src/entities/SourceOfFundEvent.entity.ts":
/*!***************************************************************!*\
  !*** ./WebResources/src/entities/SourceOfFundEvent.entity.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SOURCEOFFUNDEVENT: () => (/* binding */ SOURCEOFFUNDEVENT)
/* harmony export */ });
const SOURCEOFFUNDEVENT = {
    entity: "mhwrmb_sourceoffundevent",
    fields: {
        pk: "mhwrmb_sourceoffundeventid",
        contactid: "mhwrmb_contactid",
        accountid: "mhwrmb_accountid",
        ownerid: "ownerid",
        compliancecomment: "mhwrmb_compliancecomment",
        compliancestatus: "mhwrmb_compliancestatus",
        name: "mhwrmb_name",
        softype: "mhwrmb_softype",
        periodstart: "mhwrmb_periodstart",
        periodend: "mhwrmb_periodend",
        estamount_usd_period: "mhwrmb_estamount_usd_period",
        estamount_usd_pa: "mhwrmb_estamount_usd_pa",
        shortdescription: "mhwrmb_shortdescription",
        supportingdoc: "mhwrmb_supportingdoc",
    },
    options: {
        compliancestatus: {
            PENDING: 560850000,
            APPROVED: 560850002,
            REJECTED: 560850003
        }
    },
    tabs: {
        GENERAL: "general_tab"
    },
    sections: {
        GENERAL_INFORMATION_SECTION: "general_information_section",
        WEALTH_INFORMATION_SECTION: "wealth_information_section",
        COMPLIANCE_SECTION: "compliance_section",
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
/*!*********************************************************!*\
  !*** ./WebResources/src/form/sourceoffundevent.form.ts ***!
  \*********************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   onLoad: () => (/* binding */ onLoad),
/* harmony export */   onOwnerLookupRefresh: () => (/* binding */ onOwnerLookupRefresh),
/* harmony export */   onSave: () => (/* binding */ onSave)
/* harmony export */ });
/* harmony import */ var _entities_Contact_entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../entities/Contact.entity */ "./WebResources/src/entities/Contact.entity.ts");
/* harmony import */ var _entities_Company_entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../entities/Company.entity */ "./WebResources/src/entities/Company.entity.ts");
/* harmony import */ var _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./../entities/SourceOfFundEvent.entity */ "./WebResources/src/entities/SourceOfFundEvent.entity.ts");
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./../core/crm.core */ "./WebResources/src/core/crm.core.ts");
/* harmony import */ var _core_SecurityRoles__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../core/SecurityRoles */ "./WebResources/src/core/SecurityRoles.ts");





let _desiredOwner = null;
async function onLoad(executionContext) {
    var _a, _b, _c;
    const fc = executionContext.getFormContext();
    // Configure owner lookup (also reusable for onChange)
    configureOwnerLookup(fc);
    await applyComplianceOfficerAccess(fc);
    await ensureOwnerFromContactOrAccountOnCreate(fc);
    // Apply mutual read-only logic between contact and account and wire change handlers
    applyMutualReadOnlyContactAccount(fc);
    try {
        const contactAttr = (_a = fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.contactid);
        const accountAttr = (_b = fc.getAttribute) === null || _b === void 0 ? void 0 : _b.call(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.accountid);
        const complianceStatusAttr = (_c = fc.getAttribute) === null || _c === void 0 ? void 0 : _c.call(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.compliancestatus);
        complianceStatusAttr === null || complianceStatusAttr === void 0 ? void 0 : complianceStatusAttr.addOnChange(async () => { await applyComplianceOfficerAccess(fc); applyMutualReadOnlyContactAccount(fc); });
        const handler = () => { applyMutualReadOnlyContactAccount(fc); void ensureOwnerFromContactOrAccountOnCreate(fc); };
        contactAttr === null || contactAttr === void 0 ? void 0 : contactAttr.addOnChange(handler);
        accountAttr === null || accountAttr === void 0 ? void 0 : accountAttr.addOnChange(handler);
    }
    catch { /* ignore */ }
}
/** Enables compliance fields for users with WRM Compliance Officer role */
async function applyComplianceOfficerAccess(fc) {
    try {
        const controlsToDisableInGeneralInformationSection = [
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.name,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.ownerid,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.contactid,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.accountid
        ];
        const controlsToDisableWealthInformationSection = [
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.softype,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.periodstart,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.periodend,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.estamount_usd_pa,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.estamount_usd_period,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.shortdescription,
            _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.supportingdoc
        ];
        const isComplianceOfficer = await _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.SecurityService.hasCurrentUserRole(_core_SecurityRoles__WEBPACK_IMPORTED_MODULE_4__.SECURITY_ROLES.WRM_COMPLIANCE_OFFICER);
        // Compliance Officer: always enabled (field-level security governs actual permission)
        _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.name;
        if (isComplianceOfficer) {
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormControlHelper.setDisabledNamedControlsInSection(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.tabs.GENERAL, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, controlsToDisableInGeneralInformationSection, false);
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormControlHelper.setDisabledNamedControlsInSection(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.tabs.GENERAL, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, controlsToDisableWealthInformationSection, false);
            return;
        }
        // Non Officer: default disabled
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormControlHelper.setDisabledNamedControlsInSection(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.tabs.GENERAL, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, controlsToDisableInGeneralInformationSection, true);
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormControlHelper.setDisabledNamedControlsInSection(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.tabs.GENERAL, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, controlsToDisableWealthInformationSection, true);
        if (isComplianceStatusPendingOrRejected(fc)) {
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormControlHelper.setDisabledNamedControlsInSection(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.tabs.GENERAL, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, controlsToDisableInGeneralInformationSection, false);
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormControlHelper.setDisabledNamedControlsInSection(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.tabs.GENERAL, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, controlsToDisableWealthInformationSection, false);
        }
    }
    catch { /* ignore */ }
}
/**
 * On create-like forms, set owner to the contact's owner; if not available, fallback to the account's owner.
 */
async function ensureOwnerFromContactOrAccountOnCreate(fc) {
    const contactAttrName = _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.contactid;
    const accountAttrName = _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.accountid;
    const ownerAttrName = _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.ownerid;
    if (!_core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.getOwnerAttribute(fc, ownerAttrName))
        return;
    // Parallel wait for both lookups (contact prioritized). Account timeout shorter.
    const [contactLookupRaw, accountLookupRaw] = await Promise.all([
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormWait.waitForLookupValue(fc, contactAttrName, 4000),
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.FormWait.waitForLookupValue(fc, accountAttrName, 2500)
    ]);
    const contactLookup = contactLookupRaw || undefined;
    const accountLookup = accountLookupRaw || undefined;
    let resolvedOwner = null;
    if (contactLookup === null || contactLookup === void 0 ? void 0 : contactLookup.id) {
        resolvedOwner = await _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerService.getOwnerRef(_entities_Contact_entity__WEBPACK_IMPORTED_MODULE_0__.CONTACT.entity, contactLookup.id, _entities_Contact_entity__WEBPACK_IMPORTED_MODULE_0__.CONTACT.fields.ownerid);
    }
    if (!resolvedOwner && (accountLookup === null || accountLookup === void 0 ? void 0 : accountLookup.id)) {
        resolvedOwner = await _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerService.getOwnerRef(_entities_Company_entity__WEBPACK_IMPORTED_MODULE_1__.COMPANY.entity, accountLookup.id, _entities_Company_entity__WEBPACK_IMPORTED_MODULE_1__.COMPANY.fields.ownerid);
    }
    if (!resolvedOwner)
        return;
    _desiredOwner = resolvedOwner;
    const currentOwner = _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.getCurrentOwner(fc, ownerAttrName);
    if (!_core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.isSameOwner(currentOwner, resolvedOwner)) {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.setOwner(fc, ownerAttrName, resolvedOwner);
    }
}
function onSave(executionContext) {
    const fc = executionContext.getFormContext();
    const ownerAttrName = _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.ownerid;
    if (!_desiredOwner)
        return;
    const currentOwner = _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.getCurrentOwner(fc, ownerAttrName);
    if (!_core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.isSameOwner(currentOwner, _desiredOwner)) {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.OwnerHelper.setOwner(fc, ownerAttrName, _desiredOwner);
    }
}
/**
 * Configure owner lookup to show only Teams and default to current user's teams.
 * Can be reused from onLoad and from field onChange handlers if needed.
 */
function configureOwnerLookup(fc) {
    try {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.LookupViewHelper.setEntityTypes(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.ownerid, ["team"]);
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.LookupViewHelper.addOwnerTeamViewForCurrentUser(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.ownerid);
    }
    catch { /* ignore */ }
}
/** Optional exported onChange handler to re-apply owner lookup configuration */
function onOwnerLookupRefresh(executionContext) {
    const fc = executionContext.getFormContext();
    configureOwnerLookup(fc);
}
/**
 * Mutual read-only between contact and account:
 * - If contact has value and account is empty, account becomes read-only
 * - If account has value and contact is empty, contact becomes read-only
 * - Otherwise (both empty or both set), both are editable
 */
function applyMutualReadOnlyContactAccount(fc) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (isComplianceStatusPendingOrRejected(fc)) {
        const contactField = _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.contactid;
        const accountField = _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.accountid;
        const contactAttr = (_a = fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, contactField);
        const accountAttr = (_b = fc.getAttribute) === null || _b === void 0 ? void 0 : _b.call(fc, accountField);
        const hasContact = !!((_e = (_d = (_c = contactAttr === null || contactAttr === void 0 ? void 0 : contactAttr.getValue) === null || _c === void 0 ? void 0 : _c.call(contactAttr)) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.id);
        const hasAccount = !!((_h = (_g = (_f = accountAttr === null || accountAttr === void 0 ? void 0 : accountAttr.getValue) === null || _f === void 0 ? void 0 : _f.call(accountAttr)) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.id);
        // exactly one set => disable the other; default: enable both
        if (hasContact && !hasAccount) {
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.VisibilityHelper.setDisabled(fc, accountField, true);
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.VisibilityHelper.setDisabled(fc, contactField, false);
            return;
        }
        if (hasAccount && !hasContact) {
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.VisibilityHelper.setDisabled(fc, contactField, true);
            _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.VisibilityHelper.setDisabled(fc, accountField, false);
            return;
        }
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.VisibilityHelper.setDisabled(fc, contactField, false);
        _core_crm_core__WEBPACK_IMPORTED_MODULE_3__.VisibilityHelper.setDisabled(fc, accountField, false);
    }
}
/**
 * Checks if the compliance status is PENDING, REJECTED, or null.
 * @param fc The form context.
 * @returns True if the compliance status is PENDING, REJECTED, or null; otherwise, false.
 */
function isComplianceStatusPendingOrRejected(fc) {
    var _a, _b;
    const statusAttr = (_a = fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.compliancestatus);
    const statusVal = (_b = statusAttr === null || statusAttr === void 0 ? void 0 : statusAttr.getValue) === null || _b === void 0 ? void 0 : _b.call(statusAttr);
    return (statusVal === _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.options.compliancestatus.PENDING ||
        statusVal === _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.options.compliancestatus.REJECTED ||
        statusVal === null);
}

})();

(window.WRM = window.WRM || {}).sourceoffundevent_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlb2ZmdW5kZXZlbnRfZm9ybS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFPLE1BQU0sY0FBYyxHQUFHO0lBQzFCLHNCQUFzQixFQUFFLHdCQUF3QjtDQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ0ZYLCtCQUErQjtBQUN4QixNQUFNLFNBQVMsR0FBRztJQUNyQixTQUFTLEVBQUUsQ0FBQztJQUNaLE1BQU0sRUFBRSxDQUFDO0lBQ1QsTUFBTSxFQUFFLENBQUM7SUFDVCxRQUFRLEVBQUUsQ0FBQztJQUNYLFFBQVEsRUFBRSxDQUFDO0lBQ1gsV0FBVyxFQUFFLENBQUM7SUFDZCxRQUFRLEVBQUUsQ0FBQztDQUNMLENBQUM7QUFJSixNQUFNLGNBQWMsR0FBRztJQUMxQixHQUFHLENBQUMsRUFBTzs7UUFDUCxPQUFPLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRSwwQ0FBRSxXQUFXLGtEQUFJLG1DQUFJLFNBQVMsQ0FBQyxTQUFTLENBQUM7SUFDMUQsQ0FBQztJQUNELFlBQVksQ0FBQyxJQUFjO1FBQ3ZCLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDdkUsQ0FBQztJQUNELFVBQVUsQ0FBQyxJQUFjO1FBQ3JCLE9BQU8sSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxLQUFLLFNBQVMsQ0FBQyxXQUFXLENBQUM7SUFDcEcsQ0FBQztDQUNKLENBQUM7QUEwQ0YseUJBQXlCO0FBQ2xCLE1BQU0sSUFBSTtJQUNiLE1BQU0sS0FBSyxHQUFHO1FBQ1YsT0FBUSxNQUFjLENBQUMsR0FBRyxDQUFDO0lBQy9CLENBQUM7SUFFRCxvRUFBb0U7SUFDcEUsTUFBTSxDQUFDLFlBQVksQ0FBQyxFQUFXO1FBQzNCLE9BQU8sQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUN6RCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBSSxHQUFRO1FBQ3JCLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BDLENBQUM7Q0FDSjtBQUVELGlDQUFpQztBQUMxQixNQUFNLFNBQVM7SUFDbEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsaUJBQXlCLEVBQUUsRUFBVSxFQUFFLE9BQWdCO1FBQy9FLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDdEMsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxpQkFBaUIsRUFBRSxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsZ0JBQWdCLENBQUMsaUJBQXlCLEVBQUUsT0FBZ0I7UUFDckUsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxpQkFBeUIsRUFBRSxRQUFnQjtRQUM3RCxNQUFNLEdBQUcsR0FBRyxhQUFhLGtCQUFrQixDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDL0QsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLHVCQUF1QixDQUFDLGlCQUFpQixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2pGLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFZO1FBQzdCLE9BQU8sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQixDQUM1QixtQkFBMkIsRUFDM0IsUUFBZ0IsRUFDaEIsc0JBQThCLEVBQzlCLG9CQUE0QixFQUM1QixVQUFvQjtRQUVwQixNQUFNLEdBQUcsR0FBRztZQUNSLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUM1RSxlQUFlLEVBQUUsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDNUcsWUFBWSxFQUFFLHNCQUFzQjtZQUNwQyxXQUFXLEVBQUU7Z0JBQ1QsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEVBQUUsRUFBRSxhQUFhLEVBQUUsQ0FBQyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQUUsQ0FBQztZQUN0RyxDQUFDO1NBQ0csQ0FBQztRQUVULE1BQU0sUUFBUSxHQUFHLE1BQU0sU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFBRSxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixRQUFRLENBQUMsTUFBTSxJQUFJLFFBQVEsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZHLENBQUM7Q0FDSjtBQUVELHlCQUF5QjtBQUNsQixNQUFNLGlCQUFpQjtJQUMxQixNQUFNLENBQUMsWUFBWSxDQUFDLEVBQU87O1FBQ3ZCLElBQUksQ0FBQztZQUNELE1BQU0sS0FBSyxHQUFHLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsSUFBSSwwQ0FBRSxNQUFNLDBDQUFFLEtBQUssa0RBQUksQ0FBQztZQUMxQyxPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ25ELENBQUM7UUFBQyxNQUFNLENBQUM7WUFDTCxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDO0lBQ0wsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBTyxFQUFFLFNBQWlCOztRQUN6QyxNQUFNLENBQUMsR0FBRyxvQkFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsU0FBUyxDQUFDLDBDQUFFLFFBQVEsa0RBQUksQ0FBQztRQUN0RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO0lBQ2xFLENBQUM7SUFFRCxzRUFBc0U7SUFDdEUsTUFBTSxDQUFDLCtCQUErQixDQUNsQyxFQUFtQixFQUNuQixPQUFlLEVBQ2YsV0FBbUIsRUFDbkIsV0FBb0IsSUFBSTs7UUFFeEIsTUFBTSxHQUFHLEdBQUcsb0JBQUUsQ0FBQyxFQUFFLDBDQUFFLElBQUksMENBQUUsR0FBRyxtREFBRyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU87UUFDakIsTUFBTSxPQUFPLEdBQUcsZUFBRyxDQUFDLFFBQVEsMENBQUUsR0FBRyxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFDckIsSUFBSSxDQUFDO1lBQ0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxPQUFZLEVBQUUsRUFBRTtnQkFDdEMsSUFBSSxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztvQkFDMUMsSUFBSSxDQUFDO3dCQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7b0JBQUMsQ0FBQztvQkFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztnQkFDakUsQ0FBQztnQkFDRCw0RUFBNEU7WUFDaEYsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVGOzs7TUFHRTtJQUNELE1BQU0sQ0FBQyxpQ0FBaUMsQ0FDcEMsRUFBbUIsRUFDbkIsT0FBZSxFQUNmLFdBQW1CLEVBQ25CLFlBQStCLEVBQy9CLFdBQW9CLElBQUk7O1FBRXhCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxJQUFJLFlBQVksQ0FBQyxNQUFNLEtBQUssQ0FBQztZQUFFLE9BQU87UUFFdEUsTUFBTSxHQUFHLEdBQUcsb0JBQUUsQ0FBQyxFQUFFLDBDQUFFLElBQUksMENBQUUsR0FBRyxtREFBRyxPQUFPLENBQUMsQ0FBQztRQUN4QyxJQUFJLENBQUMsR0FBRztZQUFFLE9BQU87UUFFakIsTUFBTSxPQUFPLEdBQUcsZUFBRyxDQUFDLFFBQVEsMENBQUUsR0FBRyxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUNqRCxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFckIsWUFBWTthQUNQLEdBQUcsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BFLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBNkIsRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUNwRCxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0lBQ3pGLENBQUM7SUFFTyxNQUFNLENBQUMsb0JBQW9CLENBQy9CLE9BQTZCLEVBQzdCLElBQVk7O1FBRVosMkJBQTJCO1FBQzNCLE1BQU0sTUFBTSxHQUFHLG1CQUFPLENBQUMsUUFBUSxFQUFDLEdBQUcsbURBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxNQUFNO1lBQUUsT0FBTyxNQUFNLENBQUM7UUFFMUIsb0RBQW9EO1FBQ3BELElBQUksS0FBdUMsQ0FBQztRQUM1QyxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFOztZQUMzQixJQUFJLFFBQUMsQ0FBQyxPQUFPLGlEQUFJLE1BQUssSUFBSTtnQkFBRSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxLQUFLLENBQUM7SUFDakIsQ0FBQztJQUVPLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQyxPQUE2QixFQUFFLFFBQWlCOztRQUNoRixJQUFJLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQztZQUFFLE9BQU87UUFDckQsSUFBSSxDQUFDO1lBQ0QsMkJBQTJCO1lBQzNCLE1BQU0sT0FBTyxHQUFHLGFBQU8sQ0FBQyxXQUFXLHVEQUFJLENBQUM7WUFDeEMsSUFBSSxPQUFPLE9BQU8sS0FBSyxTQUFTLElBQUksT0FBTyxLQUFLLFFBQVE7Z0JBQUUsT0FBTztZQUNqRSxPQUFPLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ2xDLENBQUM7UUFBQyxNQUFNLENBQUM7WUFDTCxXQUFXO1FBQ2YsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQUVNLE1BQU0sVUFBVTtJQUNuQixNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBTyxFQUFFLElBQWE7O1FBQzNDLElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTztRQUNsQixNQUFNLElBQUksR0FBRyxRQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsVUFBVSxtREFBRyxJQUFJLENBQUMsQ0FBQztRQUNwQyxJQUFJLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxPQUFPLEVBQUUsQ0FBQztZQUNoQixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ25CLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQzthQUFNLENBQUM7WUFDSixJQUFJLENBQUM7Z0JBQ0QsY0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLEVBQUUsMENBQUUsYUFBYSxrREFBSSxDQUFDO1lBQzlCLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7Q0FDSjtBQUVELCtCQUErQjtBQUN4QixNQUFNLGdCQUFnQjtJQUN6QixNQUFNLENBQUMsVUFBVSxDQUFDLEVBQU8sRUFBRSxXQUFtQixFQUFFLE9BQWdCOztRQUM1RCxNQUFNLElBQUksR0FBRyxRQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsVUFBVSxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUMzQyxJQUFJLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxVQUFVLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNMLFlBQVk7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsb0NBQW9DO0lBQ3BDLE1BQU0sQ0FBQyxXQUFXLENBQUMsRUFBTyxFQUFFLFdBQW1CLEVBQUUsUUFBaUI7O1FBQzlELE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxVQUFVLG1EQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFdBQVcsRUFBRSxDQUFDO1lBQ3BCLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQy9CLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxrREFBa0Q7SUFDbEQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFPLEVBQUUsV0FBbUIsRUFBRSxVQUFtQjs7UUFDaEUsTUFBTSxJQUFJLEdBQUcsUUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsV0FBVyxDQUFDLENBQUM7UUFDN0MsSUFBSSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsZ0JBQWdCLEVBQUUsQ0FBQztZQUN6QixJQUFJLENBQUM7Z0JBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM1RCxDQUFDO1lBQUMsTUFBTSxDQUFDO2dCQUNMLFlBQVk7WUFDaEIsQ0FBQztRQUNMLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFPLEVBQUUsV0FBbUIsRUFBRSxTQUF3QjtRQUNoRSxNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0IsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDbkQsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFPLEVBQUUsVUFBa0IsRUFBRSxRQUFnQixFQUFFLFdBQW1CO1FBQ3hGLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsR0FBRyxFQUFFO1lBQ2pELE1BQU0sT0FBTyxHQUFHLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxFQUFFLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDOUQsT0FBTyxDQUFDLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLEtBQUssSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUNuRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCwrQ0FBK0M7SUFDL0MsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUE2QjtRQUM5QyxPQUFPLGFBQWEsSUFBSSxPQUFPLElBQUksT0FBUSxPQUF3QyxDQUFDLFdBQVcsS0FBSyxVQUFVLENBQUM7SUFDbkgsQ0FBQztDQUNKO0FBU00sTUFBTSxrQkFBa0I7SUFDM0IsTUFBTSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQ3ZCLGFBQXFCLEVBQ3JCLFdBQW1CLEVBQ25CLEdBQWEsRUFDYixPQUE0Rjs7UUFFNUYsTUFBTSxRQUFRLEdBQUcsR0FBRzthQUNmLEdBQUcsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsa0JBQWtCLGFBQWEsTUFBTSxJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUM7YUFDbEYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBRWQsTUFBTSxTQUFTLEdBQUc7O2dDQUVNLFdBQVc7WUFDL0IsUUFBUTs7O2dCQUdKLENBQUMsSUFBSSxFQUFFLENBQUM7UUFFaEIsTUFBTSxhQUFhLEdBQVE7WUFDdkIsZ0JBQWdCLEVBQUUsYUFBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGdCQUFnQixtQ0FBSSxJQUFJO1lBQ25ELGlCQUFpQixFQUFFLGFBQWE7WUFDaEMsV0FBVyxFQUFFLENBQUMsYUFBYSxDQUFDO1lBQzVCLE9BQU8sRUFBRSxDQUFDLEVBQUUsaUJBQWlCLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxDQUFDO1lBQzFELFVBQVUsRUFBRSxhQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsVUFBVSxtQ0FBSSxJQUFJO1NBQzFDLENBQUM7UUFFRixJQUFJLE9BQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxhQUFhO1lBQUUsYUFBYSxDQUFDLGFBQWEsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRWhGLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxhQUFhLENBQUMsQ0FBbUIsQ0FBQztJQUNuRixDQUFDO0NBQ0o7QUFFRCx5Q0FBeUM7QUFDbEMsTUFBTSxhQUFhO0lBQ3RCLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQzNCLGFBQXFCLEVBQ3JCLE1BQWMsRUFDZCxXQUFtQjs7UUFFbkIsTUFBTSxPQUFPLEdBQUcsWUFBWSxNQUFNLFlBQVksV0FBVyxFQUFFLENBQUM7UUFDNUQsTUFBTSxHQUFHLEdBQUcsTUFBTSxTQUFTLENBQUMsZ0JBQWdCLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLE1BQU0sR0FBRyxHQUFHLFNBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxRQUFRLDBDQUFHLENBQUMsQ0FBQyxDQUFDO1FBQy9CLE1BQU0sRUFBRSxHQUFHLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRyxNQUFNLENBQXVCLENBQUM7UUFDL0MsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQ3hCLGFBQXFCLEVBQ3JCLE1BQWMsRUFDZCxJQUFZLEVBQ1osS0FBZ0M7UUFFaEMsTUFBTSxHQUFHLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN6RixPQUFPLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsTUFBTSxFQUFFLElBQUksSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDakYsQ0FBQztDQUNKO0FBRU0sTUFBTSxRQUFRO0lBQ2pCLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxFQUFPLEVBQUUsYUFBcUIsRUFBRSxTQUFTLEdBQUcsSUFBSTtRQUN0RSxPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLEVBQUU7O1lBQzNCLE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxZQUFZLG1EQUFHLGFBQWEsQ0FBK0MsQ0FBQztZQUM3RixJQUFJLENBQUMsSUFBSTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUVoQyxNQUFNLEdBQUcsR0FBRyxnQkFBSSxDQUFDLFFBQVEsb0RBQUksMENBQUcsQ0FBQyxDQUFDLENBQUM7WUFDbkMsSUFBSSxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUUsRUFBRTtnQkFBRSxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUVqQyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUM7WUFDakIsTUFBTSxPQUFPLEdBQUcsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDO2dCQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzRSxNQUFNLFFBQVEsR0FBRyxHQUFHLEVBQUU7O2dCQUNsQixJQUFJLElBQUk7b0JBQUUsT0FBTztnQkFDakIsTUFBTSxDQUFDLEdBQUcsZ0JBQUksQ0FBQyxRQUFRLG9EQUFJLDBDQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUNqQyxJQUFJLENBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxFQUFFLEVBQUUsQ0FBQztvQkFBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO29CQUFDLE9BQU8sRUFBRSxDQUFDO29CQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFBQyxDQUFDO1lBQ3RELENBQUMsQ0FBQztZQUVGLElBQUksQ0FBQztnQkFBQyxJQUFJLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQUMsQ0FBQztZQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7WUFDN0MsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUV4QixVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO2dCQUFDLElBQUksR0FBRyxJQUFJLENBQUM7Z0JBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzRixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSjtBQUVNLE1BQU0sV0FBVztJQUNwQixNQUFNLENBQUMsaUJBQWlCLENBQUMsRUFBTyxFQUFFLGFBQXFCOztRQUNuRCxPQUFPLENBQUMsY0FBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsYUFBYSxDQUFDLG1DQUFJLElBQUksQ0FBUSxDQUFDO0lBQzlELENBQUM7SUFFRCxNQUFNLENBQUMsZUFBZSxDQUFDLEVBQU8sRUFBRSxhQUFxQjs7UUFDakQsTUFBTSxDQUFDLEdBQUcsc0JBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLDBDQUFFLFFBQVEsa0RBQUksMENBQUcsQ0FBQyxDQUFDLENBQUM7UUFDdkUsSUFBSSxDQUFDLEVBQUMsYUFBRCxDQUFDLHVCQUFELENBQUMsQ0FBRSxFQUFFLEtBQUksQ0FBQyxDQUFDLENBQUMsVUFBVTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBQ3pDLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsVUFBVSxFQUFFLENBQUMsQ0FBQyxVQUFpQixFQUFFLElBQUksRUFBRSxPQUFDLENBQUMsSUFBSSxtQ0FBSSxJQUFJLEVBQUUsQ0FBQztJQUNsRyxDQUFDO0lBRUQsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFPLEVBQUUsYUFBcUIsRUFBRSxLQUFlOztRQUMzRCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZELElBQUksQ0FBQyxJQUFJO1lBQUUsT0FBTztRQUNsQixJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQ1gsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDL0IsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dCQUM1QixJQUFJLEVBQUUsV0FBSyxDQUFDLElBQUksbUNBQUksU0FBUzthQUN6QixDQUFDLENBQUMsQ0FBQztJQUNmLENBQUM7SUFFRCxNQUFNLENBQUMsV0FBVyxDQUFDLENBQW1CLEVBQUUsQ0FBbUI7UUFDdkQsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUMzQixPQUFPLENBQUMsQ0FBQyxVQUFVLEtBQUssQ0FBQyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoRyxDQUFDO0NBQ0o7QUFFRCxnRUFBZ0U7QUFDekQsTUFBTSxZQUFZO0lBQ3JCLE1BQU0sQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUNwQixhQUFxQixFQUNyQixRQUFnQixFQUNoQixhQUFhLEdBQUcsU0FBUzs7UUFFekIsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUN2QyxJQUFJLENBQUMsRUFBRTtZQUFFLE9BQU8sSUFBSSxDQUFDO1FBRXJCLCtGQUErRjtRQUMvRixNQUFNLE1BQU0sR0FBRyxZQUFZLGFBQWEsb0ZBQW9GLENBQUM7UUFDN0gsTUFBTSxHQUFHLEdBQUcsTUFBTSxTQUFTLENBQUMsY0FBYyxDQUFDLGFBQWEsRUFBRSxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUM7UUFFdEUsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFlBQVksRUFBRSxDQUFDO1lBQ3JCLE9BQU87Z0JBQ0gsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztnQkFDeEMsVUFBVSxFQUFFLFlBQVk7Z0JBQ3hCLElBQUksRUFBRSxVQUFJLENBQUMsUUFBUSxtQ0FBSSxJQUFJO2FBQzlCLENBQUM7UUFDTixDQUFDO1FBQ0QsTUFBTSxJQUFJLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFHLFlBQVksQ0FBQyxDQUFDO1FBQ2pDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLE1BQU0sRUFBRSxDQUFDO1lBQ2YsT0FBTztnQkFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDO2dCQUNsQyxVQUFVLEVBQUUsTUFBTTtnQkFDbEIsSUFBSSxFQUFFLFVBQUksQ0FBQyxJQUFJLG1DQUFJLElBQUk7YUFDMUIsQ0FBQztRQUNOLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0NBQ0o7QUFFRCwrQkFBK0I7QUFDeEIsTUFBTSxlQUFlO0lBQ3BCLCtDQUErQztJQUMvQyxNQUFNLENBQUMsZ0JBQWdCOztRQUNmLElBQUksQ0FBQztZQUNHLE1BQU0sRUFBRSxHQUFHLGtDQUFJLENBQUMsR0FBRywwQ0FBRSxPQUFPLDBDQUFFLGdCQUFnQixrREFBSSwwQ0FBRSxZQUFZLDBDQUFFLE1BQTRCLENBQUM7WUFDL0YsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUNqRCxDQUFDO1FBQUMsTUFBTSxDQUFDO1lBQ0QsT0FBTyxJQUFJLENBQUM7UUFDcEIsQ0FBQztJQUNULENBQUM7SUFFRCw2Q0FBNkM7SUFDN0MsTUFBTSxDQUFDLEtBQUssQ0FBQyxtQkFBbUI7UUFDeEIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLE1BQU07WUFBRSxPQUFPLEVBQUUsQ0FBQztRQUV2Qiw4Q0FBOEM7UUFDOUMsTUFBTSxRQUFRLEdBQUc7Ozs7Ozs7OytGQVE4RCxNQUFNOzs7Ozt5QkFLNUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQixNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1FBQ25ELE9BQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLEVBQUUsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFOztZQUFDLFFBQUM7Z0JBQ2hDLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLE9BQUMsQ0FBQyxRQUFRLENBQUMsbUNBQUksQ0FBQyxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUN4RCxJQUFJLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBVzthQUNoQyxDQUFDO1NBQUEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELG1GQUFtRjtJQUNuRixNQUFNLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLEdBQUcsU0FBbUI7UUFDOUMsTUFBTSxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ25GLElBQUksTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDO1lBQUUsT0FBTyxLQUFLLENBQUM7UUFDcEMsTUFBTSxLQUFLLEdBQUcsTUFBTSxJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUMvQyxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7Q0FDUjtBQUVELHdDQUF3QztBQUNqQyxNQUFNLGdCQUFnQjtJQUN6Qix5REFBeUQ7SUFDekQsTUFBTSxDQUFDLGNBQWMsQ0FBQyxFQUFtQixFQUFFLFdBQW1CLEVBQUUsV0FBcUI7O1FBQ2pGLElBQUksQ0FBQztZQUNELE1BQU0sSUFBSSxHQUFHLFFBQUUsQ0FBQyxVQUFVLG1EQUFHLFdBQVcsQ0FBMkMsQ0FBQztZQUNwRixVQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsY0FBYyxxREFBRyxXQUFXLENBQUMsQ0FBQztRQUN4QyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELDRDQUE0QztJQUM1QyxNQUFNLENBQUMsYUFBYSxDQUNoQixFQUFtQixFQUNuQixXQUFtQixFQUNuQixNQUFjLEVBQ2QsVUFBa0IsRUFDbEIsZUFBdUIsRUFDdkIsUUFBZ0IsRUFDaEIsU0FBaUIsRUFDakIsZUFBd0IsSUFBSTs7UUFFNUIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsUUFBRSxDQUFDLFVBQVUsbURBQUcsV0FBVyxDQUEyQyxDQUFDO1lBQ3BGLElBQUksQ0FBQyxLQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsYUFBYTtnQkFBRSxPQUFPO1lBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLFNBQVMsQ0FBQyxJQUFJLEVBQUUsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUM3RyxDQUFDO1FBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDNUIsQ0FBQztJQUVELDBGQUEwRjtJQUMxRixNQUFNLENBQUMsOEJBQThCLENBQUMsRUFBbUIsRUFBRSxjQUFzQixTQUFTO1FBQ3RGLE1BQU0sVUFBVSxHQUFHLE1BQU0sQ0FBQztRQUMxQixNQUFNLGVBQWUsR0FBRyxxQkFBcUIsQ0FBQztRQUM5QyxNQUFNLE1BQU0sR0FBRyx3Q0FBd0MsQ0FBQztRQUV4RCxNQUFNLFFBQVEsR0FBRzs7Ozs7Ozs7Ozs7O1NBWWhCLENBQUM7UUFFRixNQUFNLFNBQVMsR0FBRzs7Ozs7OztTQU9qQixDQUFDO1FBRUYsZ0JBQWdCLENBQUMsYUFBYSxDQUFDLEVBQUUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwSCxDQUFDO0NBQ0o7QUFFTSxNQUFNLGNBQWM7SUFDdkI7OztPQUdHO0lBQ0gsTUFBTSxDQUFDLGlCQUFpQixDQUNwQixnQkFBeUMsRUFDekMsYUFBc0I7UUFFdEIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFxQixDQUFDO1FBRXpFLHNEQUFzRDtRQUN0RCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7WUFDakIsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUE4QixDQUFDO1lBQ2xGLElBQUksQ0FBQyxXQUFXO2dCQUFFLE9BQU87WUFDekIsYUFBYSxHQUFHLFdBQVcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUMxQyxDQUFDO1FBRUQsTUFBTSxTQUFTLEdBQUcsV0FBVyxDQUFDLFlBQVksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxRCxNQUFNLE9BQU8sR0FBRyxXQUFXLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBaUMsQ0FBQztRQUV0RixJQUFJLENBQUMsU0FBUyxJQUFJLENBQUMsT0FBTztZQUFFLE9BQU87UUFFbkMsTUFBTSxjQUFjLEdBQUcsR0FBRyxhQUFhLGlCQUFpQixDQUFDO1FBQ3pELElBQUksS0FBSyxHQUFHLFNBQVMsQ0FBQyxRQUFRLEVBQW1CLENBQUM7UUFFbEQsNERBQTREO1FBQzVELElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ2pCLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztZQUMxQyxPQUFPO1FBQ1gsQ0FBQztRQUVELDJDQUEyQztRQUMzQyxNQUFNLEdBQUcsR0FBRyxLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFFN0IseURBQXlEO1FBQ3pELElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztZQUMxQixTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxlQUFlLENBQ25CLDJEQUEyRCxFQUMzRCxjQUFjLENBQ2pCLENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELGlEQUFpRDtRQUNqRCxNQUFNLFVBQVUsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztRQUUzQyw4Q0FBOEM7UUFDOUMsTUFBTSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUU5QyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDWCxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLE9BQU8sQ0FBQyxlQUFlLENBQ25CLDJEQUEyRCxFQUMzRCxjQUFjLENBQ2pCLENBQUM7WUFDRixPQUFPO1FBQ1gsQ0FBQztRQUVELGdFQUFnRTtRQUNoRSxPQUFPLENBQUMsaUJBQWlCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFDMUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUNuQyxDQUFDO0NBQ0o7Ozs7Ozs7Ozs7Ozs7OztBQ3RtQk0sTUFBTSxPQUFPLEdBQUc7SUFDbkIsTUFBTSxFQUFFLFNBQVM7SUFDakIsTUFBTSxFQUFFO1FBQ0osRUFBRSxFQUFFLFdBQVc7UUFDZixnQkFBZ0IsRUFBRSxrQkFBa0I7UUFDcEMsT0FBTyxFQUFFLFNBQVM7S0FDckI7Q0FDSyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNQSixNQUFNLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUUsU0FBUztJQUNqQixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsV0FBVztRQUNmLGtCQUFrQixFQUFFLG9CQUFvQjtRQUN4QyxPQUFPLEVBQUUsU0FBUztLQUNyQjtDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ1BKLE1BQU0saUJBQWlCLEdBQUc7SUFDN0IsTUFBTSxFQUFFLDBCQUEwQjtJQUNsQyxNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsNEJBQTRCO1FBQ2hDLFNBQVMsRUFBRSxrQkFBa0I7UUFDN0IsU0FBUyxFQUFFLGtCQUFrQjtRQUM3QixPQUFPLEVBQUUsU0FBUztRQUNsQixpQkFBaUIsRUFBRSwwQkFBMEI7UUFDN0MsZ0JBQWdCLEVBQUUseUJBQXlCO1FBQzNDLElBQUksRUFBRSxhQUFhO1FBQ25CLE9BQU8sRUFBRSxnQkFBZ0I7UUFDekIsV0FBVyxFQUFFLG9CQUFvQjtRQUNqQyxTQUFTLEVBQUUsa0JBQWtCO1FBQzdCLG9CQUFvQixFQUFFLDZCQUE2QjtRQUNuRCxnQkFBZ0IsRUFBRSx5QkFBeUI7UUFDM0MsZ0JBQWdCLEVBQUUseUJBQXlCO1FBQzNDLGFBQWEsRUFBRSxzQkFBc0I7S0FDeEM7SUFDRCxPQUFPLEVBQUU7UUFDTCxnQkFBZ0IsRUFBRTtZQUNkLE9BQU8sRUFBRSxTQUFTO1lBQ2xCLFFBQVEsRUFBRSxTQUFTO1lBQ25CLFFBQVEsRUFBRSxTQUFTO1NBQ3RCO0tBQ0o7SUFDRCxJQUFJLEVBQUU7UUFDRixPQUFPLEVBQUUsYUFBYTtLQUN6QjtJQUNELFFBQVEsRUFBRTtRQUNOLDJCQUEyQixFQUFFLDZCQUE2QjtRQUMxRCwwQkFBMEIsRUFBRSw0QkFBNEI7UUFDeEQsa0JBQWtCLEVBQUUsb0JBQW9CO0tBQzNDO0NBQ0ssQ0FBQzs7Ozs7OztVQ2pDWDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBLEU7Ozs7O1dDUEEsd0Y7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdELEU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ051RDtBQUNGO0FBQ3NCO0FBQ2dHO0FBQ3BIO0FBRXZELElBQUksYUFBYSxHQUFvQixJQUFJLENBQUM7QUFFbkMsS0FBSyxVQUFVLE1BQU0sQ0FBQyxnQkFBeUM7O0lBQ2xFLE1BQU0sRUFBRSxHQUFHLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxDQUFDO0lBQzdDLHNEQUFzRDtJQUN0RCxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUN6QixNQUFNLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3ZDLE1BQU0sdUNBQXVDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEQsb0ZBQW9GO0lBQ3BGLGlDQUFpQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQztRQUNELE1BQU0sV0FBVyxHQUFHLFFBQUUsQ0FBQyxZQUFZLG1EQUFHLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQStDLENBQUM7UUFDeEgsTUFBTSxXQUFXLEdBQUcsUUFBRSxDQUFDLFlBQVksbURBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBK0MsQ0FBQztRQUN4SCxNQUFNLG9CQUFvQixHQUFHLFFBQUUsQ0FBQyxZQUFZLG1EQUFHLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBa0QsQ0FBQztRQUMzSSxvQkFBb0IsYUFBcEIsb0JBQW9CLHVCQUFwQixvQkFBb0IsQ0FBRSxXQUFXLENBQUMsS0FBSyxJQUFJLEVBQUUsR0FBRyxNQUFNLDRCQUE0QixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsSSxNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssdUNBQXVDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkgsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQsMkVBQTJFO0FBQzNFLEtBQUssVUFBVSw0QkFBNEIsQ0FBQyxFQUFtQjtJQUMzRCxJQUFJLENBQUM7UUFDRCxNQUFNLDRDQUE0QyxHQUFhO1lBQzNELGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJO1lBQzdCLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPO1lBQ2hDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTO1lBQ2xDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTO1NBQ3JDLENBQUM7UUFDRixNQUFNLHlDQUF5QyxHQUFhO1lBQ3hELGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPO1lBQ2hDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxXQUFXO1lBQ3BDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTO1lBQ2xDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0I7WUFDekMsaUZBQWlCLENBQUMsTUFBTSxDQUFDLG9CQUFvQjtZQUM3QyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO1lBQ3pDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxhQUFhO1NBQ3pDLENBQUM7UUFDRixNQUFNLG1CQUFtQixHQUFHLE1BQU0sMkRBQWUsQ0FBQyxrQkFBa0IsQ0FBQywrREFBYyxDQUFDLHNCQUFzQixDQUFDLENBQUM7UUFDNUcsc0ZBQXNGO1FBQ3RGLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxJQUFJO1FBQzdCLElBQUksbUJBQW1CLEVBQUUsQ0FBQztZQUN0Qiw2REFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUUsaUZBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpRkFBaUIsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsNENBQTRDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDck0sNkRBQWlCLENBQUMsaUNBQWlDLENBQUMsRUFBRSxFQUFFLGlGQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsaUZBQWlCLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLHlDQUF5QyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2pNLE9BQU87UUFDWCxDQUFDO1FBRUQsZ0NBQWdDO1FBQ2hDLDZEQUFpQixDQUFDLGlDQUFpQyxDQUFDLEVBQUUsRUFBRSxpRkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlGQUFpQixDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSw0Q0FBNEMsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNwTSw2REFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUUsaUZBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpRkFBaUIsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUseUNBQXlDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFFaE0sSUFBSSxtQ0FBbUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1lBQzFDLDZEQUFpQixDQUFDLGlDQUFpQyxDQUFDLEVBQUUsRUFBRSxpRkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlGQUFpQixDQUFDLFFBQVEsQ0FBQywyQkFBMkIsRUFBRSw0Q0FBNEMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNyTSw2REFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUUsaUZBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpRkFBaUIsQ0FBQyxRQUFRLENBQUMsMEJBQTBCLEVBQUUseUNBQXlDLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDck0sQ0FBQztJQUNMLENBQUM7SUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxLQUFLLFVBQVUsdUNBQXVDLENBQUMsRUFBbUI7SUFFdEUsTUFBTSxlQUFlLEdBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUMzRCxNQUFNLGVBQWUsR0FBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBQzNELE1BQU0sYUFBYSxHQUFHLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFFdkQsSUFBSSxDQUFDLHVEQUFXLENBQUMsaUJBQWlCLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQztRQUFFLE9BQU87SUFFOUQsaUZBQWlGO0lBQ2pGLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLE1BQU0sT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUMzRCxvREFBUSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDO1FBQ3RELG9EQUFRLENBQUMsa0JBQWtCLENBQUMsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUM7S0FDekQsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLElBQUksU0FBUyxDQUFDO0lBQ3BELE1BQU0sYUFBYSxHQUFHLGdCQUFnQixJQUFJLFNBQVMsQ0FBQztJQUVwRCxJQUFJLGFBQWEsR0FBb0IsSUFBSSxDQUFDO0lBQzFDLElBQUksYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLEVBQUUsRUFBRSxDQUFDO1FBQ3BCLGFBQWEsR0FBRyxNQUFNLHdEQUFZLENBQUMsV0FBVyxDQUFDLDZEQUFPLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsNkRBQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUNELElBQUksQ0FBQyxhQUFhLEtBQUksYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFFLEVBQUUsR0FBRSxDQUFDO1FBQ3RDLGFBQWEsR0FBRyxNQUFNLHdEQUFZLENBQUMsV0FBVyxDQUFDLDZEQUFPLENBQUMsTUFBTSxFQUFFLGFBQWEsQ0FBQyxFQUFFLEVBQUUsNkRBQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDN0csQ0FBQztJQUVELElBQUksQ0FBQyxhQUFhO1FBQUUsT0FBTztJQUUzQixhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQzlCLE1BQU0sWUFBWSxHQUFHLHVEQUFXLENBQUMsZUFBZSxDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNwRSxJQUFJLENBQUMsdURBQVcsQ0FBQyxXQUFXLENBQUMsWUFBWSxFQUFFLGFBQWEsQ0FBQyxFQUFFLENBQUM7UUFDeEQsdURBQVcsQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLGFBQWEsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUMzRCxDQUFDO0FBQ0wsQ0FBQztBQUVNLFNBQVMsTUFBTSxDQUFDLGdCQUE2QztJQUNoRSxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUM3QyxNQUFNLGFBQWEsR0FBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBQ3ZELElBQUksQ0FBQyxhQUFhO1FBQUUsT0FBTztJQUUzQixNQUFNLFlBQVksR0FBRyx1REFBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDcEUsSUFBSSxDQUFDLHVEQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ3hELHVEQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDM0QsQ0FBQztBQUNMLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLG9CQUFvQixDQUFDLEVBQW1CO0lBQzdDLElBQUksQ0FBQztRQUNELDREQUFnQixDQUFDLGNBQWMsQ0FBQyxFQUFFLEVBQUUsaUZBQWlCLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7UUFDaEYsNERBQWdCLENBQUMsOEJBQThCLENBQUMsRUFBRSxFQUFFLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMxRixDQUFDO0lBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVELGdGQUFnRjtBQUN6RSxTQUFTLG9CQUFvQixDQUFDLGdCQUF5QztJQUMxRSxNQUFNLEVBQUUsR0FBRyxnQkFBZ0IsQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUM3QyxvQkFBb0IsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7Ozs7O0dBS0c7QUFDSCxTQUFTLGlDQUFpQyxDQUFDLEVBQW1COztJQUMxRCxJQUFJLG1DQUFtQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUM7UUFDMUMsTUFBTSxZQUFZLEdBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztRQUN4RCxNQUFNLFlBQVksR0FBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO1FBRXhELE1BQU0sV0FBVyxHQUFHLFFBQUUsQ0FBQyxZQUFZLG1EQUFHLFlBQVksQ0FBK0MsQ0FBQztRQUNsRyxNQUFNLFdBQVcsR0FBRyxRQUFFLENBQUMsWUFBWSxtREFBRyxZQUFZLENBQStDLENBQUM7UUFFbEcsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLDhCQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsUUFBUSwyREFBSSwwQ0FBRyxDQUFDLENBQUMsMENBQUUsRUFBRSxFQUFDO1FBQ3hELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyw4QkFBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLFFBQVEsMkRBQUksMENBQUcsQ0FBQyxDQUFDLDBDQUFFLEVBQUUsRUFBQztRQUV4RCw2REFBNkQ7UUFDN0QsSUFBSSxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM1Qiw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNyRCw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztZQUN0RCxPQUFPO1FBQ1gsQ0FBQztRQUVELElBQUksVUFBVSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDNUIsNERBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckQsNERBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDdEQsT0FBTztRQUNYLENBQUM7UUFFRCw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRCxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLG1DQUFtQyxDQUFDLEVBQW1COztJQUM1RCxNQUFNLFVBQVUsR0FBRyxRQUFFLENBQUMsWUFBWSxtREFBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQWtELENBQUM7SUFDakksTUFBTSxTQUFTLEdBQUcsZ0JBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxRQUFRLDBEQUFJLENBQUM7SUFDM0MsT0FBTyxDQUNILFNBQVMsS0FBSyxpRkFBaUIsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTztRQUNoRSxTQUFTLEtBQUssaUZBQWlCLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVE7UUFDakUsU0FBUyxLQUFLLElBQUksQ0FDckIsQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL1NlY3VyaXR5Um9sZXMudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jcm0uY29yZS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db21wYW55LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db250YWN0LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Tb3VyY2VPZkZ1bmRFdmVudC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZm9ybS9zb3VyY2VvZmZ1bmRldmVudC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTRUNVUklUWV9ST0xFUyA9IHtcclxuICAgIFdSTV9DT01QTElBTkNFX09GRklDRVI6IFwiV1JNIENvbXBsaWFuY2UgT2ZmaWNlclwiLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgU2VjdXJpdHlSb2xlTmFtZSA9IHR5cGVvZiBTRUNVUklUWV9ST0xFU1trZXlvZiB0eXBlb2YgU0VDVVJJVFlfUk9MRVNdO1xyXG4iLCIvLyA9PT09IEZvcm1UeXBlIENvbnN0YW50cyA9PT09XHJcbmV4cG9ydCBjb25zdCBGT1JNX1RZUEUgPSB7XHJcbiAgICBVbmRlZmluZWQ6IDAsXHJcbiAgICBDcmVhdGU6IDEsXHJcbiAgICBVcGRhdGU6IDIsXHJcbiAgICBSZWFkT25seTogMyxcclxuICAgIERpc2FibGVkOiA0LFxyXG4gICAgUXVpY2tDcmVhdGU6IDUsXHJcbiAgICBCdWxrRWRpdDogNixcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIEZvcm1UeXBlID0gdHlwZW9mIEZPUk1fVFlQRVtrZXlvZiB0eXBlb2YgRk9STV9UWVBFXTtcclxuXHJcbmV4cG9ydCBjb25zdCBGb3JtVHlwZUhlbHBlciA9IHtcclxuICAgIGdldChmYzogYW55KTogRm9ybVR5cGUgfCAwIHtcclxuICAgICAgICByZXR1cm4gZmM/LnVpPy5nZXRGb3JtVHlwZT8uKCkgPz8gRk9STV9UWVBFLlVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBpc0NyZWF0ZUxpa2UodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9LFxyXG4gICAgaXNFZGl0YWJsZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5VcGRhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPd25lclJlZiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIgfCBcInRlYW1cIjtcclxuICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIFR5cGVzIHNoYXJlZCBhY3Jvc3MgZW5naW5lICYgZW50aXRpZXMgLS0tLVxyXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9IFwiZXFcIiB8IFwibmVcIiB8IFwiaW5cIiB8IFwiaXNudWxsXCIgfCBcImlzbm90bnVsbFwiIHwgXCJub3RudWxsXCI7IC8vIGFsaWFzXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICAvKiogTG9naWNhbCBuYW1lIChzdXBwb3J0cyBkb3Qtbm90YXRpb24gZm9yIGxvb2t1cCBwcm9qZWN0aW9uczogZS5nLiwgXCJwcmltYXJ5Y29udGFjdGlkLm5hbWVcIikuICovXHJcbiAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgb3BlcmF0b3I6IE9wZXJhdG9yO1xyXG4gICAgLyoqIE9wdGlvbmFsIHZhbHVlIGZvciBjb21wYXJpc29ucyAob21pdHRlZCBmb3IgbnVsbC1vcGVyYXRvcnMpLiAqL1xyXG4gICAgdmFsdWU/OiB1bmtub3duO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJ1bGUge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIG1hbmRhdG9yeT86IHN0cmluZ1tdO1xyXG4gICAgY29uZGl0aW9uPzogQ29uZGl0aW9uW107IC8vIEFORC1jb25qdW5jdGlvbjsgZW1wdHkvdW5kZWZpbmVkIOKHkiBydWxlIGFsd2F5cyBtYXRjaGVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q29uZmlnIHtcclxuICAgIGRlZmF1bHQ/OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuLyoqIExpZ2h0d2VpZ2h0IGNvbXBhcmFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsb29rdXAgKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIGlkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gQ29yZSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG4gICAgc3RhdGljIGdldCBYcm0oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogTG93ZXJjYXNlLCBzdHJpcCBicmFjZXM7IHJldHVybnMgZW1wdHkgc3RyaW5nIGlmIGZhbHN5IGlucHV0LiAqL1xyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBUaGluIFdlYiBBUEkgd3JhcHBlciAtLS0tXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKChyaWQpID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocmlkKSB9KSksXHJcbiAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwU2NoZW1hTmFtZSxcclxuICAgICAgICAgICAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGJvdW5kUGFyYW1ldGVyOiBudWxsLCBwYXJhbWV0ZXJUeXBlczoge30sIG9wZXJhdGlvblR5cGU6IDIsIG9wZXJhdGlvbk5hbWU6IFwiQXNzb2NpYXRlXCIgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9IGFzIGFueTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBBcGlDbGllbnQuZXhlY3V0ZShyZXEpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEZvcm0gaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBGb3JtQ29udHJvbEhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRMb29rdXBJZChmYzogYW55LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgY29uc3QgdiA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGUpPy5nZXRWYWx1ZT8uKCk7XHJcbiAgICAgICAgcmV0dXJuIHYgJiYgdi5sZW5ndGggPyBVdGlsLnNhbml0aXplR3VpZCh2WzBdLmlkKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGlzYWJsZSBvciBlbmFibGUgYWxsIGRpc2FibGVhYmxlIGNvbnRyb2xzIGluc2lkZSBhIHRhYiBzZWN0aW9uICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWRBbGxDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoY29udHJvbDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHsgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gT3B0aW9uYWw6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHN1YmdyaWRzLCB3aGljaCBkbyBub3Qgc3VwcG9ydCBzZXREaXNhYmxlZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgIC8qKiAgIFxyXG4gICAqIGRlL2FjdGl2YXRlIG9ubHkgdGhlIHNwZWNpZmllZCBjb250cm9scyAoYnkgbmFtZSkgaW4gYSBzZWN0aW9uLiAgIFxyXG4gICAqIERvZXMgbm90aGluZyBpZiB0aGUgbGlzdCBpcyBlbXB0eSBvciBjb250cm9scyBhcmUgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGNvbnRyb2xOYW1lczogcmVhZG9ubHkgc3RyaW5nW10sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29udHJvbE5hbWVzKSB8fCBjb250cm9sTmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnRyb2xOYW1lc1xyXG4gICAgICAgICAgICAubWFwKChuYW1lKSA9PiBGb3JtQ29udHJvbEhlbHBlci5maW5kQ29udHJvbEluU2VjdGlvbihzZWN0aW9uLCBuYW1lKSlcclxuICAgICAgICAgICAgLmZpbHRlcigoYyk6IGMgaXMgWHJtLkNvbnRyb2xzLkNvbnRyb2wgPT4gQm9vbGVhbihjKSlcclxuICAgICAgICAgICAgLmZvckVhY2goKGNvbnRyb2wpID0+IEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2wsIGRpc2FibGVkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZENvbnRyb2xJblNlY3Rpb24oXHJcbiAgICAgICAgc2VjdGlvbjogWHJtLkNvbnRyb2xzLlNlY3Rpb24sXHJcbiAgICAgICAgbmFtZTogc3RyaW5nXHJcbiAgICApOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgLy8gcHJpbWFyeTogZGlyZWN0IHBlciBOYW1lXHJcbiAgICAgICAgY29uc3QgZGlyZWN0ID0gc2VjdGlvbi5jb250cm9scy5nZXQ/LihuYW1lKTtcclxuICAgICAgICBpZiAoZGlyZWN0KSByZXR1cm4gZGlyZWN0O1xyXG5cclxuICAgICAgICAvLyBGYWxsYmFjazogc2VhcmNoIGJ5IGdldE5hbWUoKSBvdmVyIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgICAgbGV0IGZvdW5kOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGMpID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuZ2V0TmFtZT8uKCkgPT09IG5hbWUpIGZvdW5kID0gYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wsIGRpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IGNoYW5nZSBpZiBkaWZmZXJlbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IGNvbnRyb2wuZ2V0RGlzYWJsZWQ/LigpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09IFwiYm9vbGVhblwiICYmIGN1cnJlbnQgPT09IGRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvKiBuby1vcCAqL1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWRIZWxwZXIge1xyXG4gICAgc3RhdGljIHRyeVJlZnJlc2hTdWJncmlkKGZjOiBhbnksIG5hbWU/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBncmlkID0gZmM/LmdldENvbnRyb2w/LihuYW1lKTtcclxuICAgICAgICBpZiAoZ3JpZD8ucmVmcmVzaCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ3JpZC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZmM/LnVpPy5yZWZyZXNoUmliYm9uPy4oKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBWaXNpYmlsaXR5IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVmlzaWJpbGl0eUhlbHBlciB7XHJcbiAgICBzdGF0aWMgc2V0VmlzaWJsZShmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXRWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFZpc2libGUodmlzaWJsZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgYSBjb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgZGlzYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldERpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyByZXF1aXJlZCBsZXZlbCBvbiBhbiBhdHRyaWJ1dGUvY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldFJlcXVpcmVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGlzUmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cj8uc2V0UmVxdWlyZWRMZXZlbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZihmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzaG93ID0gISFwcmVkaWNhdGUoKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIGNvbnRyb2xOYW1lLCBzaG93KTtcclxuICAgICAgICByZXR1cm4gc2hvdztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmTG9va3VwRXF1YWxzKGZjOiBhbnksIGxvb2t1cEF0dHI6IHN0cmluZywgdGFyZ2V0SWQ6IHN0cmluZywgY29udHJvbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5SGVscGVyLnNob3dJZihmYywgY29udHJvbE5hbWUsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IEZvcm1Db250cm9sSGVscGVyLmdldExvb2t1cElkKGZjLCBsb29rdXBBdHRyKTtcclxuICAgICAgICAgICAgcmV0dXJuICEhY3VycmVudCAmJiBVdGlsLnNhbml0aXplR3VpZChjdXJyZW50KSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQodGFyZ2V0SWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBUeXBlIGd1YXJkOiBjb250cm9sIHN1cHBvcnRzIHNldERpc2FibGVkICovXHJcbiAgICBzdGF0aWMgaXNEaXNhYmxlYWJsZShjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCk6IGNvbnRyb2wgaXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCB7XHJcbiAgICAgICAgcmV0dXJuIFwic2V0RGlzYWJsZWRcIiBpbiBjb250cm9sICYmIHR5cGVvZiAoY29udHJvbCBhcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sKS5zZXREaXNhYmxlZCA9PT0gXCJmdW5jdGlvblwiO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgZGlhbG9nIGhlbHBlciAtLS0tXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nIH0+XHJcbiAgICApOiBQcm9taXNlPExvb2t1cFJlc3VsdFtdPiB7XHJcbiAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBpZHNcclxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IGA8dmFsdWUgdWl0eXBlPVwiJHtlbnRpdHlMb2dpY2FsfVwiPnske1V0aWwuc2FuaXRpemVHdWlkKGlkKX19PC92YWx1ZT5gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyWG1sID0gYFxyXG4gICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7aWRBdHRyaWJ1dGV9XCIgb3BlcmF0b3I9XCJpblwiPlxyXG4gICAgICAgICAgJHtpblZhbHVlc31cclxuICAgICAgICA8L2NvbmRpdGlvbj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN0YXRlY29kZVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIjBcIiAvPlxyXG4gICAgICA8L2ZpbHRlcj5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9va3VwT3B0aW9uczogYW55ID0ge1xyXG4gICAgICAgICAgICBhbGxvd011bHRpU2VsZWN0OiBvcHRpb25zPy5hbGxvd011bHRpU2VsZWN0ID8/IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHRFbnRpdHlUeXBlOiBlbnRpdHlMb2dpY2FsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlczogW2VudGl0eUxvZ2ljYWxdLFxyXG4gICAgICAgICAgICBmaWx0ZXJzOiBbeyBlbnRpdHlMb2dpY2FsTmFtZTogZW50aXR5TG9naWNhbCwgZmlsdGVyWG1sIH1dLFxyXG4gICAgICAgICAgICBkaXNhYmxlTXJ1OiBvcHRpb25zPy5kaXNhYmxlTXJ1ID8/IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LmRlZmF1bHRWaWV3SWQpIGxvb2t1cE9wdGlvbnMuZGVmYXVsdFZpZXdJZCA9IG9wdGlvbnMuZGVmYXVsdFZpZXdJZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCBVdGlsLlhybS5VdGlsaXR5Lmxvb2t1cE9iamVjdHMobG9va3VwT3B0aW9ucykpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEdlbmVyaWMgbG9va3VwIE9EYXRhIHNlcnZpY2UgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRJZEJ5RXF1YWxpdHkoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIGF0dHI6IHN0cmluZyxcclxuICAgICAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhblxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgbGl0ID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCA6IFN0cmluZyh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RJZEJ5RmlsdGVyKGVudGl0eUxvZ2ljYWwsIGlkQXR0ciwgYCgke2F0dHJ9IGVxICR7bGl0fSlgKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm1XYWl0IHtcclxuICAgIHN0YXRpYyB3YWl0Rm9yTG9va3VwVmFsdWUoZmM6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCB0aW1lb3V0TXMgPSA2MDAwKTogUHJvbWlzZTxYcm0uTG9va3VwVmFsdWUgfCBudWxsPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlTmFtZSkgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWF0dHIpIHJldHVybiByZXNvbHZlKG51bGwpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgaWYgKG5vdz8uaWQpIHJldHVybiByZXNvbHZlKG5vdyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZG9uZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4geyB0cnkgeyBhdHRyLnJlbW92ZU9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH0gfTtcclxuICAgICAgICAgICAgY29uc3Qgb25DaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgICAgICBpZiAodj8uaWQpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZSh2KTsgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdHJ5IHsgYXR0ci5hZGRPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQob25DaGFuZ2UsIDApO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGlmICghZG9uZSkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKG51bGwpOyB9IH0sIHRpbWVvdXRNcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBPd25lckhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0T3duZXJBdHRyaWJ1dGUoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gKGZjPy5nZXRBdHRyaWJ1dGU/Lihvd25lckF0dHJOYW1lKSA/PyBudWxsKSBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEN1cnJlbnRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBPd25lclJlZiB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKT8uZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgaWYgKCF2Py5pZCB8fCAhdi5lbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4geyBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodi5pZCksIGVudGl0eVR5cGU6IHYuZW50aXR5VHlwZSBhcyBhbnksIG5hbWU6IHYubmFtZSA/PyBudWxsIH07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNldE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZywgb3duZXI6IE93bmVyUmVmKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cikgcmV0dXJuO1xyXG4gICAgICAgIGF0dHIuc2V0VmFsdWUoW3tcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKG93bmVyLmlkKSxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTogb3duZXIuZW50aXR5VHlwZSxcclxuICAgICAgICAgICAgbmFtZTogb3duZXIubmFtZSA/PyB1bmRlZmluZWRcclxuICAgICAgICB9IGFzIGFueV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpc1NhbWVPd25lcihhPzogT3duZXJSZWYgfCBudWxsLCBiPzogT3duZXJSZWYgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGEuZW50aXR5VHlwZSA9PT0gYi5lbnRpdHlUeXBlICYmIFV0aWwuc2FuaXRpemVHdWlkKGEuaWQpID09PSBVdGlsLnNhbml0aXplR3VpZChiLmlkKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEdlbmVyaWMgc2VydmljZTogTG9hZCBvd25lciAoVXNlciBvciBUZWFtKSBmb3IgYW55IHJlY29yZCAqL1xyXG5leHBvcnQgY2xhc3MgT3duZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRPd25lclJlZihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVjb3JkSWQ6IHN0cmluZyxcclxuICAgICAgICBvd25lckF0dHJOYW1lID0gXCJvd25lcmlkXCJcclxuICAgICk6IFByb21pc2U8T3duZXJSZWYgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBVdGlsLnNhbml0aXplR3VpZChyZWNvcmRJZCk7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIC8vIEZvciBwb2x5bW9ycGhpYyBvd25lciBsb29rdXBzLCBleHBhbmQgZGVkaWNhdGVkIG5hdiBwcm9wcyB0byBhdm9pZCBwcm9wZXJ0eS1ub3QtZm91bmQgZXJyb3JzXHJcbiAgICAgICAgY29uc3QgZXhwYW5kID0gYD8kc2VsZWN0PSR7b3duZXJBdHRyTmFtZX0mJGV4cGFuZD1vd25pbmd1c2VyKCRzZWxlY3Q9c3lzdGVtdXNlcmlkLGZ1bGxuYW1lKSxvd25pbmd0ZWFtKCRzZWxlY3Q9dGVhbWlkLG5hbWUpYDtcclxuICAgICAgICBjb25zdCByZWMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbCwgaWQsIGV4cGFuZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSByZWM/LltcIm93bmluZ3VzZXJcIl07XHJcbiAgICAgICAgaWYgKHVzZXI/LnN5c3RlbXVzZXJpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHVzZXIuc3lzdGVtdXNlcmlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdXNlci5mdWxsbmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZWFtID0gcmVjPy5bXCJvd25pbmd0ZWFtXCJdO1xyXG4gICAgICAgIGlmICh0ZWFtPy50ZWFtaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh0ZWFtLnRlYW1pZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInRlYW1cIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRlYW0ubmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFNlY3VyaXR5LXJlbGF0ZWQgaGVscGVycyAqL1xyXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlTZXJ2aWNlIHtcclxuICAgICAgICAvKiogUmV0dXJucyBjdXJyZW50IHVzZXIgaWQgZnJvbSBYcm0gY29udGV4dCAqL1xyXG4gICAgICAgIHN0YXRpYyBnZXRDdXJyZW50VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBVdGlsLlhybT8uVXRpbGl0eT8uZ2V0R2xvYmFsQ29udGV4dD8uKCk/LnVzZXJTZXR0aW5ncz8udXNlcklkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm5zIHJvbGUgbmFtZXMgb2YgdGhlIGN1cnJlbnQgdXNlciAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBnZXRDdXJyZW50VXNlclJvbGVzKCk6IFByb21pc2U8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldEN1cnJlbnRVc2VySWQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdXNlcklkKSByZXR1cm4gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRmV0Y2hYTUwgb3ZlciBzeXN0ZW11c2Vycm9sZXMgKE46TikgdG8gcm9sZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZmV0Y2ggdmVyc2lvbj1cIjEuMFwiIGRpc3RpbmN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInJvbGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwicm9sZWlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlcnJvbGVzXCIgZnJvbT1cInJvbGVpZFwiIHRvPVwicm9sZWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2VyXCIgZnJvbT1cInN5c3RlbXVzZXJpZFwiIHRvPVwic3lzdGVtdXNlcmlkXCIgYWxpYXM9XCJ1XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke3VzZXJJZH1cIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZmV0Y2g+YC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQuZmV0Y2hYbWwoXCJyb2xlXCIsIGZldGNoWG1sKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAocmVzLmVudGl0aWVzIHx8IFtdKS5tYXAoKGUpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChlW1wicm9sZWlkXCJdID8/IGVbXCJfcm9sZWlkX3ZhbHVlXCJdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZVtcIm5hbWVcIl0gYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgfSkpLmZpbHRlcihyID0+ICEhci5pZCAmJiAhIXIubmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2hlY2tzIGlmIGN1cnJlbnQgdXNlciBoYXMgb25lIG9mIHRoZSBwcm92aWRlZCByb2xlIG5hbWVzIChjYXNlLWluc2Vuc2l0aXZlKSAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBoYXNDdXJyZW50VXNlclJvbGUoLi4ucm9sZU5hbWVzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2FudGVkID0gbmV3IFNldChyb2xlTmFtZXMubWFwKG4gPT4gbi50cmltKCkudG9Mb3dlckNhc2UoKSkuZmlsdGVyKEJvb2xlYW4pKTtcclxuICAgICAgICAgICAgICAgIGlmICh3YW50ZWQuc2l6ZSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRVc2VyUm9sZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByb2xlcy5zb21lKHIgPT4gd2FudGVkLmhhcyhyLm5hbWUudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgY29udHJvbCB2aWV3IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwVmlld0hlbHBlciB7XHJcbiAgICAvKiogUmVzdHJpY3QgYSBsb29rdXAgY29udHJvbCB0byBzcGVjaWZpYyBlbnRpdHkgdHlwZXMgKi9cclxuICAgIHN0YXRpYyBzZXRFbnRpdHlUeXBlcyhmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nLCBlbnRpdHlUeXBlczogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY3RybD8uc2V0RW50aXR5VHlwZXM/LihlbnRpdHlUeXBlcyk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZCBhIGN1c3RvbSB2aWV3IHRvIGEgbG9va3VwIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBhZGRDdXN0b21WaWV3KFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgY29udHJvbE5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBlbnRpdHlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0Rpc3BsYXlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZmV0Y2hYbWw6IHN0cmluZyxcclxuICAgICAgICBsYXlvdXRYbWw6IHN0cmluZyxcclxuICAgICAgICBzZXRBc0RlZmF1bHQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFjdHJsPy5hZGRDdXN0b21WaWV3KSByZXR1cm47XHJcbiAgICAgICAgICAgIGN0cmwuYWRkQ3VzdG9tVmlldyh2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwudHJpbSgpLCBsYXlvdXRYbWwudHJpbSgpLCBzZXRBc0RlZmF1bHQpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGRzIGEgY3VzdG9tIHZpZXcgZm9yIG93bmVyIGxvb2t1cCB0byBzaG93IG9ubHkgdGVhbXMgdGhlIGN1cnJlbnQgdXNlciBiZWxvbmdzIHRvLiAqL1xyXG4gICAgc3RhdGljIGFkZE93bmVyVGVhbVZpZXdGb3JDdXJyZW50VXNlcihmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nID0gXCJvd25lcmlkXCIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gXCJ0ZWFtXCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0Rpc3BsYXlOYW1lID0gXCJPd25lclRlYW1Mb29rdXBWaWV3XCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0lkID0gXCJ7MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxfVwiO1xyXG5cclxuICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgPGZldGNoPlxyXG4gICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwidGVhbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImJ1c2luZXNzdW5pdGlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cIm5ldl9vd25lcnRlYW0yc3lzdGVtdXNlclwiIGZyb209XCJ0ZWFtaWRcIiB0bz1cInRlYW1pZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcS11c2VyaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgIDwvZmV0Y2g+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgY29uc3QgbGF5b3V0WG1sID0gYFxyXG4gICAgICAgICAgICA8Z3JpZCBuYW1lPSdyZXN1bHRzZXQnIG9iamVjdD0nMScganVtcD0ndGVhbWlkJyBzZWxlY3Q9JzEnIGljb249JzEnIHByZXZpZXc9JzEnPlxyXG4gICAgICAgICAgICAgICAgPHJvdyBuYW1lPSdyZXN1bHQnIGlkPSd0ZWFtaWQnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J25hbWUnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nYnVzaW5lc3N1bml0aWQnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICA8L3Jvdz5cclxuICAgICAgICAgICAgPC9ncmlkPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuYWRkQ3VzdG9tVmlldyhmYywgY29udHJvbE5hbWUsIHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbCwgbGF5b3V0WG1sLCB0cnVlKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZpZWxkVmFsaWRhdG9yIHtcclxuICAgIC8qKlxyXG4gICAgICogVmFsaWRhdGVzIGEgbnVtZXJpYyB0ZXh0IGZpZWxkIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cclxuICAgICAqIENhbiBiZSB1c2VkIGZvciBPbkNoYW5nZSBldmVudHMgYW5kIG9wdGlvbmFsbHkgcmVjZWl2ZXMgdGhlIGF0dHJpYnV0ZSBuYW1lIGFzIGEgcGFyYW1ldGVyLlxyXG4gICAgICovXHJcbiAgICBzdGF0aWMgdmFsaWRhdGVCaWdOdW1iZXIoXHJcbiAgICAgICAgZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQsXHJcbiAgICAgICAgYXR0cmlidXRlTmFtZT86IHN0cmluZ1xyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZm9ybUNvbnRleHQgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCkgYXMgWHJtLkZvcm1Db250ZXh0O1xyXG5cclxuICAgICAgICAvLyBJZiBubyBhdHRyaWJ1dGUgbmFtZSBpcyBwcm92aWRlZCDihpIgdXNlIGV2ZW50IHNvdXJjZVxyXG4gICAgICAgIGlmICghYXR0cmlidXRlTmFtZSkge1xyXG4gICAgICAgICAgICBjb25zdCBldmVudFNvdXJjZSA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0RXZlbnRTb3VyY2UoKSBhcyBYcm0uQXR0cmlidXRlcy5BdHRyaWJ1dGU7XHJcbiAgICAgICAgICAgIGlmICghZXZlbnRTb3VyY2UpIHJldHVybjtcclxuICAgICAgICAgICAgYXR0cmlidXRlTmFtZSA9IGV2ZW50U291cmNlLmdldE5hbWUoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGF0dHJpYnV0ZSA9IGZvcm1Db250ZXh0LmdldEF0dHJpYnV0ZShhdHRyaWJ1dGVOYW1lKTtcclxuICAgICAgICBjb25zdCBjb250cm9sID0gZm9ybUNvbnRleHQuZ2V0Q29udHJvbChhdHRyaWJ1dGVOYW1lKSBhcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sO1xyXG5cclxuICAgICAgICBpZiAoIWF0dHJpYnV0ZSB8fCAhY29udHJvbCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBub3RpZmljYXRpb25JZCA9IGAke2F0dHJpYnV0ZU5hbWV9X0JpZ051bWJlckVycm9yYDtcclxuICAgICAgICBsZXQgdmFsdWUgPSBhdHRyaWJ1dGUuZ2V0VmFsdWUoKSBhcyBzdHJpbmcgfCBudWxsO1xyXG5cclxuICAgICAgICAvLyBJZiB0aGUgZmllbGQgaXMgdHJ1bHkgZW1wdHkgKG51bGwpIOKGkiBjbGVhciBlcnJvciBhbmQgZXhpdFxyXG4gICAgICAgIGlmICh2YWx1ZSA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBjb250cm9sLmNsZWFyTm90aWZpY2F0aW9uKG5vdGlmaWNhdGlvbklkKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gS2VlcCBvcmlnaW5hbCBzdHJpbmcsIGJ1dCB3b3JrIG9uIGEgY29weVxyXG4gICAgICAgIGNvbnN0IHJhdyA9IHZhbHVlLnRvU3RyaW5nKCk7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSB1c2VyIGVudGVyZWQgb25seSB3aGl0ZXNwYWNlIOKGkiB0cmVhdCBhcyBpbnZhbGlkXHJcbiAgICAgICAgaWYgKHJhdy50cmltKCkubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24oXHJcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSBlbnRlciBhIG51bWVyaWMgdmFsdWUgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlwiLFxyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gUmVtb3ZlIGFsbCB3aGl0ZXNwYWNlIGZvciB2YWxpZGF0aW9uIC8gc3RvcmFnZVxyXG4gICAgICAgIGNvbnN0IGRpZ2l0c09ubHkgPSByYXcucmVwbGFjZSgvXFxzKy9nLCBcIlwiKTtcclxuXHJcbiAgICAgICAgLy8gVmFsaWRhdGlvbjogb25seSBkaWdpdHMsIG1heC4gMTIgY2hhcmFjdGVyc1xyXG4gICAgICAgIGNvbnN0IGlzVmFsaWQgPSAvXlxcZHsxLDEyfSQvLnRlc3QoZGlnaXRzT25seSk7XHJcblxyXG4gICAgICAgIGlmICghaXNWYWxpZCkge1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGUuc2V0VmFsdWUobnVsbCk7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0Tm90aWZpY2F0aW9uKFxyXG4gICAgICAgICAgICAgICAgXCJQbGVhc2UgZW50ZXIgYSBudW1lcmljIHZhbHVlIHdpdGggYSBtYXhpbXVtIG9mIDEyIGRpZ2l0cy5cIixcclxuICAgICAgICAgICAgICAgIG5vdGlmaWNhdGlvbklkXHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIFZhbGlkIOKGkiBjbGVhciBub3RpZmljYXRpb24gYW5kIHN0b3JlIHJhdyB2YWx1ZSB3aXRob3V0IHNwYWNlc1xyXG4gICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24obm90aWZpY2F0aW9uSWQpO1xyXG4gICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShkaWdpdHNPbmx5KTtcclxuICAgIH1cclxufVxyXG4iLCJleHBvcnQgY29uc3QgQ09NUEFOWSA9IHtcclxuICAgIGVudGl0eTogXCJhY2NvdW50XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhY2NvdW50aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0OiBcIm5ldl9idXNpbmVzc3VuaXRcIixcclxuICAgICAgICBvd25lcmlkOiBcIm93bmVyaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7IiwiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJleHBvcnQgY29uc3QgU09VUkNFT0ZGVU5ERVZFTlQgPSB7XHJcbiAgICBlbnRpdHk6IFwibWh3cm1iX3NvdXJjZW9mZnVuZGV2ZW50XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJtaHdybWJfc291cmNlb2ZmdW5kZXZlbnRpZFwiLFxyXG4gICAgICAgIGNvbnRhY3RpZDogXCJtaHdybWJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgYWNjb3VudGlkOiBcIm1od3JtYl9hY2NvdW50aWRcIixcclxuICAgICAgICBvd25lcmlkOiBcIm93bmVyaWRcIixcclxuICAgICAgICBjb21wbGlhbmNlY29tbWVudDogXCJtaHdybWJfY29tcGxpYW5jZWNvbW1lbnRcIixcclxuICAgICAgICBjb21wbGlhbmNlc3RhdHVzOiBcIm1od3JtYl9jb21wbGlhbmNlc3RhdHVzXCIsXHJcbiAgICAgICAgbmFtZTogXCJtaHdybWJfbmFtZVwiLFxyXG4gICAgICAgIHNvZnR5cGU6IFwibWh3cm1iX3NvZnR5cGVcIixcclxuICAgICAgICBwZXJpb2RzdGFydDogXCJtaHdybWJfcGVyaW9kc3RhcnRcIixcclxuICAgICAgICBwZXJpb2RlbmQ6IFwibWh3cm1iX3BlcmlvZGVuZFwiLFxyXG4gICAgICAgIGVzdGFtb3VudF91c2RfcGVyaW9kOiBcIm1od3JtYl9lc3RhbW91bnRfdXNkX3BlcmlvZFwiLFxyXG4gICAgICAgIGVzdGFtb3VudF91c2RfcGE6IFwibWh3cm1iX2VzdGFtb3VudF91c2RfcGFcIixcclxuICAgICAgICBzaG9ydGRlc2NyaXB0aW9uOiBcIm1od3JtYl9zaG9ydGRlc2NyaXB0aW9uXCIsXHJcbiAgICAgICAgc3VwcG9ydGluZ2RvYzogXCJtaHdybWJfc3VwcG9ydGluZ2RvY1wiLFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHsgICAgICAgIFxyXG4gICAgICAgIGNvbXBsaWFuY2VzdGF0dXM6IHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgUEVORElORzogNTYwODUwMDAwLCAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBBUFBST1ZFRDogNTYwODUwMDAyLFxyXG4gICAgICAgICAgICBSRUpFQ1RFRDogNTYwODUwMDAzXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRhYnM6IHtcclxuICAgICAgICBHRU5FUkFMOiBcImdlbmVyYWxfdGFiXCJcclxuICAgIH0sXHJcbiAgICBzZWN0aW9uczoge1xyXG4gICAgICAgIEdFTkVSQUxfSU5GT1JNQVRJT05fU0VDVElPTjogXCJnZW5lcmFsX2luZm9ybWF0aW9uX3NlY3Rpb25cIixcclxuICAgICAgICBXRUFMVEhfSU5GT1JNQVRJT05fU0VDVElPTjogXCJ3ZWFsdGhfaW5mb3JtYXRpb25fc2VjdGlvblwiLFxyXG4gICAgICAgIENPTVBMSUFOQ0VfU0VDVElPTjogXCJjb21wbGlhbmNlX3NlY3Rpb25cIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBDT05UQUNUIH0gZnJvbSBcIi4vLi4vZW50aXRpZXMvQ29udGFjdC5lbnRpdHlcIjtcclxuaW1wb3J0IHsgQ09NUEFOWSB9IGZyb20gXCIuLi9lbnRpdGllcy9Db21wYW55LmVudGl0eVwiO1xyXG5pbXBvcnQgeyBTT1VSQ0VPRkZVTkRFVkVOVCB9IGZyb20gXCIuLy4uL2VudGl0aWVzL1NvdXJjZU9mRnVuZEV2ZW50LmVudGl0eVwiO1xyXG5pbXBvcnQgeyBGb3JtV2FpdCwgT3duZXJIZWxwZXIsIE93bmVyUmVmLCBGb3JtVHlwZUhlbHBlciwgU2VjdXJpdHlTZXJ2aWNlLCBGb3JtQ29udHJvbEhlbHBlciwgVmlzaWJpbGl0eUhlbHBlciwgT3duZXJTZXJ2aWNlLCBMb29rdXBWaWV3SGVscGVyIH0gZnJvbSBcIi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBTRUNVUklUWV9ST0xFUyB9IGZyb20gXCIuLi9jb3JlL1NlY3VyaXR5Um9sZXNcIjtcclxuXHJcbmxldCBfZGVzaXJlZE93bmVyOiBPd25lclJlZiB8IG51bGwgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uTG9hZChleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICAvLyBDb25maWd1cmUgb3duZXIgbG9va3VwIChhbHNvIHJldXNhYmxlIGZvciBvbkNoYW5nZSlcclxuICAgIGNvbmZpZ3VyZU93bmVyTG9va3VwKGZjKTtcclxuICAgIGF3YWl0IGFwcGx5Q29tcGxpYW5jZU9mZmljZXJBY2Nlc3MoZmMpO1xyXG4gICAgYXdhaXQgZW5zdXJlT3duZXJGcm9tQ29udGFjdE9yQWNjb3VudE9uQ3JlYXRlKGZjKTtcclxuICAgIC8vIEFwcGx5IG11dHVhbCByZWFkLW9ubHkgbG9naWMgYmV0d2VlbiBjb250YWN0IGFuZCBhY2NvdW50IGFuZCB3aXJlIGNoYW5nZSBoYW5kbGVyc1xyXG4gICAgYXBwbHlNdXR1YWxSZWFkT25seUNvbnRhY3RBY2NvdW50KGZjKTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY29udGFjdEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgYWNjb3VudEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuYWNjb3VudGlkKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgY29tcGxpYW5jZVN0YXR1c0F0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29tcGxpYW5jZXN0YXR1cykgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbXBsaWFuY2VTdGF0dXNBdHRyPy5hZGRPbkNoYW5nZShhc3luYyAoKSA9PiB7IGF3YWl0IGFwcGx5Q29tcGxpYW5jZU9mZmljZXJBY2Nlc3MoZmMpOyBhcHBseU11dHVhbFJlYWRPbmx5Q29udGFjdEFjY291bnQoZmMpOyB9KTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gKCkgPT4geyBhcHBseU11dHVhbFJlYWRPbmx5Q29udGFjdEFjY291bnQoZmMpOyB2b2lkIGVuc3VyZU93bmVyRnJvbUNvbnRhY3RPckFjY291bnRPbkNyZWF0ZShmYyk7IH07XHJcbiAgICAgICAgY29udGFjdEF0dHI/LmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgIGFjY291bnRBdHRyPy5hZGRPbkNoYW5nZShoYW5kbGVyKTtcclxuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG59XHJcblxyXG4vKiogRW5hYmxlcyBjb21wbGlhbmNlIGZpZWxkcyBmb3IgdXNlcnMgd2l0aCBXUk0gQ29tcGxpYW5jZSBPZmZpY2VyIHJvbGUgKi9cclxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDb21wbGlhbmNlT2ZmaWNlckFjY2VzcyhmYzogWHJtLkZvcm1Db250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2xzVG9EaXNhYmxlSW5HZW5lcmFsSW5mb3JtYXRpb25TZWN0aW9uOiBzdHJpbmdbXSA9IFtcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm5hbWUsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5vd25lcmlkLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuYWNjb3VudGlkXHJcbiAgICAgICAgXTtcclxuICAgICAgICBjb25zdCBjb250cm9sc1RvRGlzYWJsZVdlYWx0aEluZm9ybWF0aW9uU2VjdGlvbjogc3RyaW5nW10gPSBbXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5zb2Z0eXBlLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMucGVyaW9kc3RhcnQsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5wZXJpb2RlbmQsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5lc3RhbW91bnRfdXNkX3BhLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuZXN0YW1vdW50X3VzZF9wZXJpb2QsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5zaG9ydGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuc3VwcG9ydGluZ2RvY1xyXG4gICAgICAgIF07XHJcbiAgICAgICAgY29uc3QgaXNDb21wbGlhbmNlT2ZmaWNlciA9IGF3YWl0IFNlY3VyaXR5U2VydmljZS5oYXNDdXJyZW50VXNlclJvbGUoU0VDVVJJVFlfUk9MRVMuV1JNX0NPTVBMSUFOQ0VfT0ZGSUNFUik7XHJcbiAgICAgICAgLy8gQ29tcGxpYW5jZSBPZmZpY2VyOiBhbHdheXMgZW5hYmxlZCAoZmllbGQtbGV2ZWwgc2VjdXJpdHkgZ292ZXJucyBhY3R1YWwgcGVybWlzc2lvbilcclxuICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMubmFtZVxyXG4gICAgICAgIGlmIChpc0NvbXBsaWFuY2VPZmZpY2VyKSB7XHJcbiAgICAgICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5HRU5FUkFMX0lORk9STUFUSU9OX1NFQ1RJT04sIGNvbnRyb2xzVG9EaXNhYmxlSW5HZW5lcmFsSW5mb3JtYXRpb25TZWN0aW9uLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5XRUFMVEhfSU5GT1JNQVRJT05fU0VDVElPTiwgY29udHJvbHNUb0Rpc2FibGVXZWFsdGhJbmZvcm1hdGlvblNlY3Rpb24sIGZhbHNlKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm9uIE9mZmljZXI6IGRlZmF1bHQgZGlzYWJsZWRcclxuICAgICAgICBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oZmMsIFNPVVJDRU9GRlVOREVWRU5ULnRhYnMuR0VORVJBTCwgU09VUkNFT0ZGVU5ERVZFTlQuc2VjdGlvbnMuR0VORVJBTF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZUluR2VuZXJhbEluZm9ybWF0aW9uU2VjdGlvbiwgdHJ1ZSk7XHJcbiAgICAgICAgRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC50YWJzLkdFTkVSQUwsIFNPVVJDRU9GRlVOREVWRU5ULnNlY3Rpb25zLldFQUxUSF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZVdlYWx0aEluZm9ybWF0aW9uU2VjdGlvbiwgdHJ1ZSk7ICAgICAgICBcclxuICAgICAgICBcclxuICAgICAgICBpZiAoaXNDb21wbGlhbmNlU3RhdHVzUGVuZGluZ09yUmVqZWN0ZWQoZmMpKSB7XHJcbiAgICAgICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5HRU5FUkFMX0lORk9STUFUSU9OX1NFQ1RJT04sIGNvbnRyb2xzVG9EaXNhYmxlSW5HZW5lcmFsSW5mb3JtYXRpb25TZWN0aW9uLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5XRUFMVEhfSU5GT1JNQVRJT05fU0VDVElPTiwgY29udHJvbHNUb0Rpc2FibGVXZWFsdGhJbmZvcm1hdGlvblNlY3Rpb24sIGZhbHNlKTsgICAgICAgICAgICBcclxuICAgICAgICB9XHJcbiAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIE9uIGNyZWF0ZS1saWtlIGZvcm1zLCBzZXQgb3duZXIgdG8gdGhlIGNvbnRhY3QncyBvd25lcjsgaWYgbm90IGF2YWlsYWJsZSwgZmFsbGJhY2sgdG8gdGhlIGFjY291bnQncyBvd25lci5cclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIGVuc3VyZU93bmVyRnJvbUNvbnRhY3RPckFjY291bnRPbkNyZWF0ZShmYzogWHJtLkZvcm1Db250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBcclxuICAgIGNvbnN0IGNvbnRhY3RBdHRyTmFtZSA9IFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5jb250YWN0aWQ7XHJcbiAgICBjb25zdCBhY2NvdW50QXR0ck5hbWUgPSBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuYWNjb3VudGlkO1xyXG4gICAgY29uc3Qgb3duZXJBdHRyTmFtZSA9IFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5vd25lcmlkO1xyXG5cclxuICAgIGlmICghT3duZXJIZWxwZXIuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpKSByZXR1cm47XHJcblxyXG4gICAgLy8gUGFyYWxsZWwgd2FpdCBmb3IgYm90aCBsb29rdXBzIChjb250YWN0IHByaW9yaXRpemVkKS4gQWNjb3VudCB0aW1lb3V0IHNob3J0ZXIuXHJcbiAgICBjb25zdCBbY29udGFjdExvb2t1cFJhdywgYWNjb3VudExvb2t1cFJhd10gPSBhd2FpdCBQcm9taXNlLmFsbChbXHJcbiAgICAgICAgRm9ybVdhaXQud2FpdEZvckxvb2t1cFZhbHVlKGZjLCBjb250YWN0QXR0ck5hbWUsIDQwMDApLFxyXG4gICAgICAgIEZvcm1XYWl0LndhaXRGb3JMb29rdXBWYWx1ZShmYywgYWNjb3VudEF0dHJOYW1lLCAyNTAwKVxyXG4gICAgXSk7XHJcbiAgICBjb25zdCBjb250YWN0TG9va3VwID0gY29udGFjdExvb2t1cFJhdyB8fCB1bmRlZmluZWQ7XHJcbiAgICBjb25zdCBhY2NvdW50TG9va3VwID0gYWNjb3VudExvb2t1cFJhdyB8fCB1bmRlZmluZWQ7XHJcblxyXG4gICAgbGV0IHJlc29sdmVkT3duZXI6IE93bmVyUmVmIHwgbnVsbCA9IG51bGw7XHJcbiAgICBpZiAoY29udGFjdExvb2t1cD8uaWQpIHtcclxuICAgICAgICByZXNvbHZlZE93bmVyID0gYXdhaXQgT3duZXJTZXJ2aWNlLmdldE93bmVyUmVmKENPTlRBQ1QuZW50aXR5LCBjb250YWN0TG9va3VwLmlkLCBDT05UQUNULmZpZWxkcy5vd25lcmlkKTtcclxuICAgIH1cclxuICAgIGlmICghcmVzb2x2ZWRPd25lciAmJiBhY2NvdW50TG9va3VwPy5pZCkge1xyXG4gICAgICAgIHJlc29sdmVkT3duZXIgPSBhd2FpdCBPd25lclNlcnZpY2UuZ2V0T3duZXJSZWYoQ09NUEFOWS5lbnRpdHksIGFjY291bnRMb29rdXAuaWQsIENPTVBBTlkuZmllbGRzLm93bmVyaWQpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICghcmVzb2x2ZWRPd25lcikgcmV0dXJuO1xyXG5cclxuICAgIF9kZXNpcmVkT3duZXIgPSByZXNvbHZlZE93bmVyO1xyXG4gICAgY29uc3QgY3VycmVudE93bmVyID0gT3duZXJIZWxwZXIuZ2V0Q3VycmVudE93bmVyKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgIGlmICghT3duZXJIZWxwZXIuaXNTYW1lT3duZXIoY3VycmVudE93bmVyLCByZXNvbHZlZE93bmVyKSkge1xyXG4gICAgICAgIE93bmVySGVscGVyLnNldE93bmVyKGZjLCBvd25lckF0dHJOYW1lLCByZXNvbHZlZE93bmVyKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIG9uU2F2ZShleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLlNhdmVFdmVudENvbnRleHQpIHtcclxuICAgIGNvbnN0IGZjID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgY29uc3Qgb3duZXJBdHRyTmFtZSA9IFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5vd25lcmlkO1xyXG4gICAgaWYgKCFfZGVzaXJlZE93bmVyKSByZXR1cm47XHJcblxyXG4gICAgY29uc3QgY3VycmVudE93bmVyID0gT3duZXJIZWxwZXIuZ2V0Q3VycmVudE93bmVyKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgIGlmICghT3duZXJIZWxwZXIuaXNTYW1lT3duZXIoY3VycmVudE93bmVyLCBfZGVzaXJlZE93bmVyKSkge1xyXG4gICAgICAgIE93bmVySGVscGVyLnNldE93bmVyKGZjLCBvd25lckF0dHJOYW1lLCBfZGVzaXJlZE93bmVyKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIENvbmZpZ3VyZSBvd25lciBsb29rdXAgdG8gc2hvdyBvbmx5IFRlYW1zIGFuZCBkZWZhdWx0IHRvIGN1cnJlbnQgdXNlcidzIHRlYW1zLlxyXG4gKiBDYW4gYmUgcmV1c2VkIGZyb20gb25Mb2FkIGFuZCBmcm9tIGZpZWxkIG9uQ2hhbmdlIGhhbmRsZXJzIGlmIG5lZWRlZC5cclxuICovXHJcbmZ1bmN0aW9uIGNvbmZpZ3VyZU93bmVyTG9va3VwKGZjOiBYcm0uRm9ybUNvbnRleHQpOiB2b2lkIHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgTG9va3VwVmlld0hlbHBlci5zZXRFbnRpdHlUeXBlcyhmYywgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm93bmVyaWQsIFtcInRlYW1cIl0pO1xyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuYWRkT3duZXJUZWFtVmlld0ZvckN1cnJlbnRVc2VyKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMub3duZXJpZCk7XHJcbiAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxufVxyXG5cclxuLyoqIE9wdGlvbmFsIGV4cG9ydGVkIG9uQ2hhbmdlIGhhbmRsZXIgdG8gcmUtYXBwbHkgb3duZXIgbG9va3VwIGNvbmZpZ3VyYXRpb24gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIG9uT3duZXJMb29rdXBSZWZyZXNoKGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KTogdm9pZCB7XHJcbiAgICBjb25zdCBmYyA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgIGNvbmZpZ3VyZU93bmVyTG9va3VwKGZjKTtcclxufVxyXG5cclxuLyoqXHJcbiAqIE11dHVhbCByZWFkLW9ubHkgYmV0d2VlbiBjb250YWN0IGFuZCBhY2NvdW50OlxyXG4gKiAtIElmIGNvbnRhY3QgaGFzIHZhbHVlIGFuZCBhY2NvdW50IGlzIGVtcHR5LCBhY2NvdW50IGJlY29tZXMgcmVhZC1vbmx5XHJcbiAqIC0gSWYgYWNjb3VudCBoYXMgdmFsdWUgYW5kIGNvbnRhY3QgaXMgZW1wdHksIGNvbnRhY3QgYmVjb21lcyByZWFkLW9ubHlcclxuICogLSBPdGhlcndpc2UgKGJvdGggZW1wdHkgb3IgYm90aCBzZXQpLCBib3RoIGFyZSBlZGl0YWJsZVxyXG4gKi9cclxuZnVuY3Rpb24gYXBwbHlNdXR1YWxSZWFkT25seUNvbnRhY3RBY2NvdW50KGZjOiBYcm0uRm9ybUNvbnRleHQpOiB2b2lkIHtcclxuICAgIGlmIChpc0NvbXBsaWFuY2VTdGF0dXNQZW5kaW5nT3JSZWplY3RlZChmYykpIHtcclxuICAgICAgICBjb25zdCBjb250YWN0RmllbGQgPSBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkO1xyXG4gICAgICAgIGNvbnN0IGFjY291bnRGaWVsZCA9IFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5hY2NvdW50aWQ7XHJcblxyXG4gICAgICAgIGNvbnN0IGNvbnRhY3RBdHRyID0gZmMuZ2V0QXR0cmlidXRlPy4oY29udGFjdEZpZWxkKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgYWNjb3VudEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihhY2NvdW50RmllbGQpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICAgICAgY29uc3QgaGFzQ29udGFjdCA9ICEhY29udGFjdEF0dHI/LmdldFZhbHVlPy4oKT8uWzBdPy5pZDtcclxuICAgICAgICBjb25zdCBoYXNBY2NvdW50ID0gISFhY2NvdW50QXR0cj8uZ2V0VmFsdWU/LigpPy5bMF0/LmlkO1xyXG5cclxuICAgICAgICAvLyBleGFjdGx5IG9uZSBzZXQgPT4gZGlzYWJsZSB0aGUgb3RoZXI7IGRlZmF1bHQ6IGVuYWJsZSBib3RoXHJcbiAgICAgICAgaWYgKGhhc0NvbnRhY3QgJiYgIWhhc0FjY291bnQpIHtcclxuICAgICAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgYWNjb3VudEZpZWxkLCB0cnVlKTtcclxuICAgICAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgY29udGFjdEZpZWxkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChoYXNBY2NvdW50ICYmICFoYXNDb250YWN0KSB7XHJcbiAgICAgICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0RGlzYWJsZWQoZmMsIGNvbnRhY3RGaWVsZCwgdHJ1ZSk7XHJcbiAgICAgICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0RGlzYWJsZWQoZmMsIGFjY291bnRGaWVsZCwgZmFsc2UpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldERpc2FibGVkKGZjLCBjb250YWN0RmllbGQsIGZhbHNlKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldERpc2FibGVkKGZjLCBhY2NvdW50RmllbGQsIGZhbHNlKTtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDaGVja3MgaWYgdGhlIGNvbXBsaWFuY2Ugc3RhdHVzIGlzIFBFTkRJTkcsIFJFSkVDVEVELCBvciBudWxsLlxyXG4gKiBAcGFyYW0gZmMgVGhlIGZvcm0gY29udGV4dC5cclxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29tcGxpYW5jZSBzdGF0dXMgaXMgUEVORElORywgUkVKRUNURUQsIG9yIG51bGw7IG90aGVyd2lzZSwgZmFsc2UuXHJcbiAqL1xyXG5mdW5jdGlvbiBpc0NvbXBsaWFuY2VTdGF0dXNQZW5kaW5nT3JSZWplY3RlZChmYzogWHJtLkZvcm1Db250ZXh0KTogYm9vbGVhbiB7XHJcbiAgICBjb25zdCBzdGF0dXNBdHRyID0gZmMuZ2V0QXR0cmlidXRlPy4oU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLmNvbXBsaWFuY2VzdGF0dXMpIGFzIFhybS5BdHRyaWJ1dGVzLk9wdGlvblNldEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IHN0YXR1c1ZhbCA9IHN0YXR1c0F0dHI/LmdldFZhbHVlPy4oKTtcclxuICAgIHJldHVybiAoXHJcbiAgICAgICAgc3RhdHVzVmFsID09PSBTT1VSQ0VPRkZVTkRFVkVOVC5vcHRpb25zLmNvbXBsaWFuY2VzdGF0dXMuUEVORElORyB8fFxyXG4gICAgICAgIHN0YXR1c1ZhbCA9PT0gU09VUkNFT0ZGVU5ERVZFTlQub3B0aW9ucy5jb21wbGlhbmNlc3RhdHVzLlJFSkVDVEVEIHx8XHJcbiAgICAgICAgc3RhdHVzVmFsID09PSBudWxsXHJcbiAgICApO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==