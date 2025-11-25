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

/***/ "./WebResources/src/entities/Account.entity.ts":
/*!*****************************************************!*\
  !*** ./WebResources/src/entities/Account.entity.ts ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACCOUNT: () => (/* binding */ ACCOUNT)
/* harmony export */ });
// Portfolio.entity.ts
const ACCOUNT = {
    entity: "wrmb_portfolio",
    fields: {
        pk: "wrmb_portfolioid",
        ambcust_locationid: "ambcust_locationid",
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
        ambcustOriginTypeId: "ambcust_origintypeid",
        statecode: "statecode"
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


/***/ }),

/***/ "./WebResources/src/entities/index.ts":
/*!********************************************!*\
  !*** ./WebResources/src/entities/index.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ACCOUNT: () => (/* reexport safe */ _Account_entity__WEBPACK_IMPORTED_MODULE_1__.ACCOUNT),
/* harmony export */   BUSINESSUNITLOCATION: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.BUSINESSUNITLOCATION),
/* harmony export */   CONTACT: () => (/* reexport safe */ _Contact_entity__WEBPACK_IMPORTED_MODULE_6__.CONTACT),
/* harmony export */   ORIGINTYPE: () => (/* reexport safe */ _OriginType_entity__WEBPACK_IMPORTED_MODULE_4__.ORIGINTYPE),
/* harmony export */   PORTFOLIORELATIONSHIP: () => (/* reexport safe */ _PortfolioRelationship_entity__WEBPACK_IMPORTED_MODULE_2__.PORTFOLIORELATIONSHIP),
/* harmony export */   PORTFOLIORELATIONSHIPTYPE: () => (/* reexport safe */ _PortfolioRelationshipType_entity__WEBPACK_IMPORTED_MODULE_3__.PORTFOLIORELATIONSHIPTYPE),
/* harmony export */   RISKSUMMARYANDAPPROVAL: () => (/* reexport safe */ _RiskSummaryAndApproval_entity__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL),
/* harmony export */   listConditionFields: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.listConditionFields),
/* harmony export */   parseBusinessUnitConfig: () => (/* reexport safe */ _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__.parseBusinessUnitConfig)
/* harmony export */ });
/* harmony import */ var _RiskSummaryAndApproval_entity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./RiskSummaryAndApproval.entity */ "./WebResources/src/entities/RiskSummaryAndApproval.entity.ts");
/* harmony import */ var _Account_entity__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./Account.entity */ "./WebResources/src/entities/Account.entity.ts");
/* harmony import */ var _PortfolioRelationship_entity__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./PortfolioRelationship.entity */ "./WebResources/src/entities/PortfolioRelationship.entity.ts");
/* harmony import */ var _PortfolioRelationshipType_entity__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./PortfolioRelationshipType.entity */ "./WebResources/src/entities/PortfolioRelationshipType.entity.ts");
/* harmony import */ var _OriginType_entity__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./OriginType.entity */ "./WebResources/src/entities/OriginType.entity.ts");
/* harmony import */ var _MandatoryConfig_entity__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./MandatoryConfig.entity */ "./WebResources/src/entities/MandatoryConfig.entity.ts");
/* harmony import */ var _Contact_entity__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./Contact.entity */ "./WebResources/src/entities/Contact.entity.ts");
// Barrel file � b�ndelt alle Entity-Objekte









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
/*!****************************************************!*\
  !*** ./WebResources/src/form/kyc_approval.form.ts ***!
  \****************************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addAllowedAccounts: () => (/* binding */ addAllowedAccounts),
/* harmony export */   onLoad: () => (/* binding */ onLoad)
/* harmony export */ });
/* harmony import */ var _entities_index__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../entities/index */ "./WebResources/src/entities/index.ts");
/* harmony import */ var _core_crm_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../core/crm.core */ "./WebResources/src/core/crm.core.ts");
// Hinweis: Keine TS-Namespaces. Nur die beiden Handler werden exportiert.


/**
 * FORM onLoad
 */
async function onLoad(executionContext) {
    var _a, _b, _c, _d, _e, _f;
    const fc = (_b = (_a = executionContext.getFormContext) === null || _a === void 0 ? void 0 : _a.call(executionContext)) !== null && _b !== void 0 ? _b : executionContext;
    if (isRecordInactive(fc)) {
        (_d = (_c = fc.ui) === null || _c === void 0 ? void 0 : _c.setFormNotification) === null || _d === void 0 ? void 0 : _d.call(_c, "This record is inactive. Actions are not available.", "WARNING", "record-inactive");
        return; // stop further init work
    }
    try {
        await toggleAccountsSubgridForOriginType(fc);
        // OnChange-Handler für OriginTypeId hinzufügen
        (_f = (_e = fc.getAttribute) === null || _e === void 0 ? void 0 : _e.call(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.ambcustOriginTypeId)) === null || _f === void 0 ? void 0 : _f.addOnChange(async () => {
            await toggleAccountsSubgridForOriginType(fc);
        });
    }
    catch {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.setVisible(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts, false);
    }
}
/**
 * Ribbon-Command: Accounts hinzufügen (Associate in N:N)
 */
async function addAllowedAccounts(primaryControl) {
    var _a, _b, _c, _d;
    const fc = primaryControl;
    const xrm = (_a = window.Xrm) !== null && _a !== void 0 ? _a : _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.Xrm;
    if (isRecordInactive(fc)) {
        await xrm.Navigation.openAlertDialog({ text: "Record is inactive." });
        return;
    }
    const currentId = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.FormControlHelper.getCurrentId(fc);
    if (!currentId) {
        await xrm.Navigation.openAlertDialog({ text: "Please save the record first." });
        return;
    }
    const contactId = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.FormControlHelper.getLookupId(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.contactId);
    const companyId = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.FormControlHelper.getLookupId(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.companyId);
    if (!contactId && !companyId) {
        await xrm.Navigation.openAlertDialog({ text: "Please set either a Contact or a Company first." });
        return;
    }
    try {
        const candidateIds = await fetchCandidatePortfolioIds(contactId, companyId);
        if (candidateIds.length === 0) {
            await xrm.Navigation.openAlertDialog({ text: "No matching accounts found for the selected Contact/Company." });
            return;
        }
        const alreadyLinked = await getAlreadyLinkedPortfolioIds(currentId);
        const candidatesToOffer = candidateIds.filter(id => !alreadyLinked.has(_core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(id)));
        if (candidatesToOffer.length === 0) {
            await xrm.Navigation.openAlertDialog({ text: "All candidate accounts are already linked to this record." });
            return;
        }
        const selectedIds = await openCandidatePicker(fc, candidatesToOffer);
        if (selectedIds.length === 0)
            return;
        await associateSelectedPortfolios(currentId, selectedIds);
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.GridHelper.tryRefreshSubgrid(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts);
    }
    catch (err) {
        await ((_c = (_b = xrm.Navigation).openErrorDialog) === null || _c === void 0 ? void 0 : _c.call(_b, { message: (_d = err === null || err === void 0 ? void 0 : err.message) !== null && _d !== void 0 ? _d : String(err) }));
    }
}
/* ---------------------------------- */
/*           helper functions         */
/* ---------------------------------- */
// Returns true if the current record is inactive (statecode = 1)
function isRecordInactive(fc) {
    var _a, _b;
    const statecodeAttribute = (_a = fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.statecode);
    const val = (_b = statecodeAttribute === null || statecodeAttribute === void 0 ? void 0 : statecodeAttribute.getValue) === null || _b === void 0 ? void 0 : _b.call(statecodeAttribute); // optionset number (0=Active, 1=Inactive)
    return val === 1 || val === "1"; // be defensive about type
}
async function toggleAccountsSubgridForOriginType(fc) {
    const accountOpeningId = await getAccountOpeningId();
    if (!accountOpeningId) {
        _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.setVisible(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts, false);
        return;
    }
    _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.VisibilityHelper.showIfLookupEquals(fc, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.fields.ambcustOriginTypeId, accountOpeningId, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.controls.subgridAccounts);
}
async function getAccountOpeningId() {
    return _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.LookupService.getIdByEquality(_entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.entity, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.fields.pk, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.fields.typeNameCode, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ORIGINTYPE.values.ACCOUNT_OPENING);
}
async function fetchCandidatePortfolioIds(contactId, companyId) {
    const orBlock = [
        contactId
            ? `<condition attribute="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.contactId}" operator="eq" value="${_core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(contactId)}" />`
            : "",
        companyId
            ? `<condition attribute="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.companyId}" operator="eq" value="${_core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(companyId)}" />`
            : "",
    ]
        .filter(Boolean)
        .join("");
    const fetchXml = `
    <fetch version="1.0" distinct="true">
      <entity name="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.entity}">
        <attribute name="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.portfolioId}" />
        <filter type="and">
          <filter type="or">
            ${orBlock}
          </filter>
        </filter>
        <link-entity name="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.entity}"
                     from="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.fields.pk}"
                     to="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.typeId}" alias="reltype">
          <filter>
            <condition attribute="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.fields.name}"
                       operator="eq"
                       value="${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIPTYPE.options.NAME_PRINCIPAL}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>`.trim();
    const res = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.fetchXml(_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.entity, fetchXml);
    const ids = new Set();
    for (const e of res.entities) {
        const id = _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(e[`_${_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.portfolioId}_value`]) ||
            _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(e[_entities_index__WEBPACK_IMPORTED_MODULE_0__.PORTFOLIORELATIONSHIP.fields.portfolioId]);
        if (id)
            ids.add(id);
    }
    return Array.from(ids);
}
async function getAlreadyLinkedPortfolioIds(mainId) {
    const expand = `?$expand=${_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.relationships.portfolios.nav}($select=${_entities_index__WEBPACK_IMPORTED_MODULE_0__.ACCOUNT.fields.pk})`;
    const rec = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.retrieveRecord(_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.entity, mainId, expand);
    const list = ((rec === null || rec === void 0 ? void 0 : rec[_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.relationships.portfolios.nav]) || []);
    return new Set(list.map(row => _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(row[_entities_index__WEBPACK_IMPORTED_MODULE_0__.ACCOUNT.fields.pk])));
}
async function openCandidatePicker(fc, candidateIds) {
    var _a, _b, _c, _d;
    (_b = (_a = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _a === void 0 ? void 0 : _a.setFormNotification) === null || _b === void 0 ? void 0 : _b.call(_a, "Showing accounts that match the selected Contact/Company. Already linked items are hidden.", "INFO", "account-filter-context");
    const selection = await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.LookupDialogHelper.openWithIdList(_entities_index__WEBPACK_IMPORTED_MODULE_0__.ACCOUNT.entity, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ACCOUNT.fields.pk, candidateIds, { allowMultiSelect: true, disableMru: true });
    (_d = (_c = fc === null || fc === void 0 ? void 0 : fc.ui) === null || _c === void 0 ? void 0 : _c.clearFormNotification) === null || _d === void 0 ? void 0 : _d.call(_c, "account-filter-context");
    if (!selection || selection.length === 0)
        return [];
    return _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.unique(selection.map(s => _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.Util.sanitizeGuid(s.id)));
}
async function associateSelectedPortfolios(mainId, selectedIds) {
    if (!selectedIds.length)
        return;
    await _core_crm_core__WEBPACK_IMPORTED_MODULE_1__.ApiClient.associateManyToMany(_entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.entity, mainId, _entities_index__WEBPACK_IMPORTED_MODULE_0__.RISKSUMMARYANDAPPROVAL.relationships.portfolios.schema, _entities_index__WEBPACK_IMPORTED_MODULE_0__.ACCOUNT.entity, selectedIds);
}

})();

(window.WRM = window.WRM || {}).kyc_approval_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QU0sRUFDN0IsTUFBTSxFQUNOLG1FQUFzQixDQUFDLGFBQWEsQ0FBQyxVQUFVLENBQUMsTUFBTSxFQUN0RCxvREFBTyxDQUFDLE1BQU0sRUFDZCxXQUFXLENBQ2QsQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL2NybS5jb3JlLnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0FjY291bnQuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL0NvbnRhY3QuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL01hbmRhdG9yeUNvbmZpZy5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvT3JpZ2luVHlwZS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9SaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9pbmRleC50cyIsIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9mb3JtL2t5Y19hcHByb3ZhbC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vID09PT0gRm9ybVR5cGUgQ29uc3RhbnRzID09PT1cclxuZXhwb3J0IGNvbnN0IEZPUk1fVFlQRSA9IHtcclxuICAgIFVuZGVmaW5lZDogMCxcclxuICAgIENyZWF0ZTogMSxcclxuICAgIFVwZGF0ZTogMixcclxuICAgIFJlYWRPbmx5OiAzLFxyXG4gICAgRGlzYWJsZWQ6IDQsXHJcbiAgICBRdWlja0NyZWF0ZTogNSxcclxuICAgIEJ1bGtFZGl0OiA2LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgRm9ybVR5cGUgPSB0eXBlb2YgRk9STV9UWVBFW2tleW9mIHR5cGVvZiBGT1JNX1RZUEVdO1xyXG5cclxuZXhwb3J0IGNvbnN0IEZvcm1UeXBlSGVscGVyID0ge1xyXG4gICAgZ2V0KGZjOiBhbnkpOiBGb3JtVHlwZSB8IDAge1xyXG4gICAgICAgIHJldHVybiBmYz8udWk/LmdldEZvcm1UeXBlPy4oKSA/PyBGT1JNX1RZUEUuVW5kZWZpbmVkO1xyXG4gICAgfSxcclxuICAgIGlzQ3JlYXRlTGlrZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH0sXHJcbiAgICBpc0VkaXRhYmxlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlVwZGF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9XHJcbn07XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE93bmVyUmVmIHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIiB8IFwidGVhbVwiO1xyXG4gICAgbmFtZT86IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gVHlwZXMgc2hhcmVkIGFjcm9zcyBlbmdpbmUgJiBlbnRpdGllcyAtLS0tXHJcbmV4cG9ydCB0eXBlIE9wZXJhdG9yID0gXCJlcVwiIHwgXCJuZVwiIHwgXCJpblwiIHwgXCJpc251bGxcIiB8IFwiaXNub3RudWxsXCIgfCBcIm5vdG51bGxcIjsgLy8gYWxpYXNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29uZGl0aW9uIHtcclxuICAgIC8qKiBMb2dpY2FsIG5hbWUgKHN1cHBvcnRzIGRvdC1ub3RhdGlvbiBmb3IgbG9va3VwIHByb2plY3Rpb25zOiBlLmcuLCBcInByaW1hcnljb250YWN0aWQubmFtZVwiKS4gKi9cclxuICAgIGZpZWxkOiBzdHJpbmc7XHJcbiAgICBvcGVyYXRvcjogT3BlcmF0b3I7XHJcbiAgICAvKiogT3B0aW9uYWwgdmFsdWUgZm9yIGNvbXBhcmlzb25zIChvbWl0dGVkIGZvciBudWxsLW9wZXJhdG9ycykuICovXHJcbiAgICB2YWx1ZT86IHVua25vd247XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUnVsZSB7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG4gICAgbWFuZGF0b3J5Pzogc3RyaW5nW107XHJcbiAgICBjb25kaXRpb24/OiBDb25kaXRpb25bXTsgLy8gQU5ELWNvbmp1bmN0aW9uOyBlbXB0eS91bmRlZmluZWQg4oeSIHJ1bGUgYWx3YXlzIG1hdGNoZXNcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBFbnRpdHlDb25maWcge1xyXG4gICAgZGVmYXVsdD86IHN0cmluZ1tdO1xyXG4gICAgcnVsZXM/OiBSdWxlW107XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQnVzaW5lc3NVbml0Q29uZmlnIHtcclxuICAgIHZlcnNpb246IG51bWJlcjtcclxuICAgIGVudGl0aWVzOiBSZWNvcmQ8c3RyaW5nLCBFbnRpdHlDb25maWc+O1xyXG59XHJcblxyXG4vKiogTGlnaHR3ZWlnaHQgY29tcGFyYWJsZSByZXByZXNlbnRhdGlvbiBvZiBhIGxvb2t1cCAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cENvbXBhcmFibGUge1xyXG4gICAgaWQ6IHN0cmluZyB8IG51bGw7XHJcbiAgICBuYW1lOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBDb3JlIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVXRpbCB7XHJcbiAgICBzdGF0aWMgZ2V0IFhybSgpOiBhbnkge1xyXG4gICAgICAgIHJldHVybiAod2luZG93IGFzIGFueSkuWHJtO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBMb3dlcmNhc2UsIHN0cmlwIGJyYWNlczsgcmV0dXJucyBlbXB0eSBzdHJpbmcgaWYgZmFsc3kgaW5wdXQuICovXHJcbiAgICBzdGF0aWMgc2FuaXRpemVHdWlkKGlkPzogc3RyaW5nKTogc3RyaW5nIHtcclxuICAgICAgICByZXR1cm4gKGlkIHx8IFwiXCIpLnJlcGxhY2UoL1t7fV0vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgdW5pcXVlPFQ+KGFycjogVFtdKTogVFtdIHtcclxuICAgICAgICByZXR1cm4gQXJyYXkuZnJvbShuZXcgU2V0KGFycikpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFRoaW4gV2ViIEFQSSB3cmFwcGVyIC0tLS1cclxuZXhwb3J0IGNsYXNzIEFwaUNsaWVudCB7XHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgaWQ6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8YW55PiB7XHJcbiAgICAgICAgY29uc3QgY2xlYW5JZCA9IFV0aWwuc2FuaXRpemVHdWlkKGlkKTtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lLCBjbGVhbklkLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgcmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGZldGNoWG1sKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGZldGNoWG1sOiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICBjb25zdCB1cmwgPSBgP2ZldGNoWG1sPSR7ZW5jb2RlVVJJQ29tcG9uZW50KGZldGNoWG1sLnRyaW0oKSl9YDtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCB1cmwpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBleGVjdXRlKHJlcXVlc3Q6IGFueSk6IFByb21pc2U8UmVzcG9uc2U+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLm9ubGluZS5leGVjdXRlKHJlcXVlc3QpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBhc3NvY2lhdGVNYW55VG9NYW55KFxyXG4gICAgICAgIHBhcmVudEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBwYXJlbnRJZDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0aW9uc2hpcFNjaGVtYU5hbWU6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkRW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRJZHM6IHN0cmluZ1tdXHJcbiAgICApOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgICAgICBjb25zdCByZXEgPSB7XHJcbiAgICAgICAgICAgIHRhcmdldDogeyBlbnRpdHlUeXBlOiBwYXJlbnRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocGFyZW50SWQpIH0sXHJcbiAgICAgICAgICAgIHJlbGF0ZWRFbnRpdGllczogcmVsYXRlZElkcy5tYXAoKHJpZCkgPT4gKHsgZW50aXR5VHlwZTogcmVsYXRlZEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChyaWQpIH0pKSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwOiByZWxhdGlvbnNoaXBTY2hlbWFOYW1lLFxyXG4gICAgICAgICAgICBnZXRNZXRhZGF0YTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHsgYm91bmRQYXJhbWV0ZXI6IG51bGwsIHBhcmFtZXRlclR5cGVzOiB7fSwgb3BlcmF0aW9uVHlwZTogMiwgb3BlcmF0aW9uTmFtZTogXCJBc3NvY2lhdGVcIiB9O1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0gYXMgYW55O1xyXG5cclxuICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IEFwaUNsaWVudC5leGVjdXRlKHJlcSk7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZS5vaykgdGhyb3cgbmV3IEVycm9yKGBBc3NvY2lhdGlvbiBmYWlsZWQ6ICR7cmVzcG9uc2Uuc3RhdHVzfSAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gRm9ybSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIEZvcm1Db250cm9sSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRDdXJyZW50SWQoZmM6IGFueSk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGlkUmF3ID0gZmM/LmRhdGE/LmVudGl0eT8uZ2V0SWQ/LigpO1xyXG4gICAgICAgICAgICByZXR1cm4gaWRSYXcgPyBVdGlsLnNhbml0aXplR3VpZChpZFJhdykgOiBudWxsO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldExvb2t1cElkKGZjOiBhbnksIGF0dHJpYnV0ZTogc3RyaW5nKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICBjb25zdCB2ID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZSk/LmdldFZhbHVlPy4oKTtcclxuICAgICAgICByZXR1cm4gdiAmJiB2Lmxlbmd0aCA/IFV0aWwuc2FuaXRpemVHdWlkKHZbMF0uaWQpIDogdW5kZWZpbmVkO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEaXNhYmxlIG9yIGVuYWJsZSBhbGwgZGlzYWJsZWFibGUgY29udHJvbHMgaW5zaWRlIGEgdGFiIHNlY3Rpb24gKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZEFsbENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjb250cm9sOiBhbnkpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHtcclxuICAgICAgICAgICAgICAgICAgICB0cnkgeyBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTsgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyBPcHRpb25hbDogc3BlY2lhbCBoYW5kbGluZyBmb3Igc3ViZ3JpZHMsIHdoaWNoIGRvIG5vdCBzdXBwb3J0IHNldERpc2FibGVkXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgLyoqICAgXHJcbiAgICogZGUvYWN0aXZhdGUgb25seSB0aGUgc3BlY2lmaWVkIGNvbnRyb2xzIChieSBuYW1lKSBpbiBhIHNlY3Rpb24uICAgXHJcbiAgICogRG9lcyBub3RoaW5nIGlmIHRoZSBsaXN0IGlzIGVtcHR5IG9yIGNvbnRyb2xzIGFyZSBub3QgZm91bmQuXHJcbiAgICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgdGFiTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHNlY3Rpb25OYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgY29udHJvbE5hbWVzOiByZWFkb25seSBzdHJpbmdbXSxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGlmICghQXJyYXkuaXNBcnJheShjb250cm9sTmFtZXMpIHx8IGNvbnRyb2xOYW1lcy5sZW5ndGggPT09IDApIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuXHJcbiAgICAgICAgY29udHJvbE5hbWVzXHJcbiAgICAgICAgICAgIC5tYXAoKG5hbWUpID0+IEZvcm1Db250cm9sSGVscGVyLmZpbmRDb250cm9sSW5TZWN0aW9uKHNlY3Rpb24sIG5hbWUpKVxyXG4gICAgICAgICAgICAuZmlsdGVyKChjKTogYyBpcyBYcm0uQ29udHJvbHMuQ29udHJvbCA9PiBCb29sZWFuKGMpKVxyXG4gICAgICAgICAgICAuZm9yRWFjaCgoY29udHJvbCkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbCwgZGlzYWJsZWQpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBmaW5kQ29udHJvbEluU2VjdGlvbihcclxuICAgICAgICBzZWN0aW9uOiBYcm0uQ29udHJvbHMuU2VjdGlvbixcclxuICAgICAgICBuYW1lOiBzdHJpbmdcclxuICAgICk6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICAvLyBwcmltYXJ5OiBkaXJlY3QgcGVyIE5hbWVcclxuICAgICAgICBjb25zdCBkaXJlY3QgPSBzZWN0aW9uLmNvbnRyb2xzLmdldD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChkaXJlY3QpIHJldHVybiBkaXJlY3Q7XHJcblxyXG4gICAgICAgIC8vIEZhbGxiYWNrOiBzZWFyY2ggYnkgZ2V0TmFtZSgpIG92ZXIgdGhlIGNvbGxlY3Rpb25cclxuICAgICAgICBsZXQgZm91bmQ6IFhybS5Db250cm9scy5Db250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoYykgPT4ge1xyXG4gICAgICAgICAgICBpZiAoYy5nZXROYW1lPy4oKSA9PT0gbmFtZSkgZm91bmQgPSBjO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIHJldHVybiBmb3VuZDtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBzZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCwgZGlzYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcclxuICAgICAgICBpZiAoIVZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIC8vIG9ubHkgY2hhbmdlIGlmIGRpZmZlcmVudFxyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY29udHJvbC5nZXREaXNhYmxlZD8uKCk7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudCA9PT0gXCJib29sZWFuXCIgJiYgY3VycmVudCA9PT0gZGlzYWJsZWQpIHJldHVybjtcclxuICAgICAgICAgICAgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIC8qIG5vLW9wICovXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgR3JpZEhlbHBlciB7XHJcbiAgICBzdGF0aWMgdHJ5UmVmcmVzaFN1YmdyaWQoZmM6IGFueSwgbmFtZT86IHN0cmluZykge1xyXG4gICAgICAgIGlmICghbmFtZSkgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IGdyaWQgPSBmYz8uZ2V0Q29udHJvbD8uKG5hbWUpO1xyXG4gICAgICAgIGlmIChncmlkPy5yZWZyZXNoKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBncmlkLnJlZnJlc2goKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBmYz8udWk/LnJlZnJlc2hSaWJib24/LigpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIFZpc2liaWxpdHkgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBWaXNpYmlsaXR5SGVscGVyIHtcclxuICAgIHN0YXRpYyBzZXRWaXNpYmxlKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHZpc2libGU6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldFZpc2libGUpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0VmlzaWJsZSh2aXNpYmxlKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogRW5hYmxlcyBvciBkaXNhYmxlcyBhIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBkaXNhYmxlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0RGlzYWJsZWQpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGN0cmwuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBTZXRzIHJlcXVpcmVkIGxldmVsIG9uIGFuIGF0dHJpYnV0ZS9jb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0UmVxdWlyZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgaXNSZXF1aXJlZDogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChhdHRyPy5zZXRSZXF1aXJlZExldmVsKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBhdHRyLnNldFJlcXVpcmVkTGV2ZWwoaXNSZXF1aXJlZCA/IFwicmVxdWlyZWRcIiA6IFwibm9uZVwiKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIHByZWRpY2F0ZTogKCkgPT4gYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IHNob3cgPSAhIXByZWRpY2F0ZSgpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgY29udHJvbE5hbWUsIHNob3cpO1xyXG4gICAgICAgIHJldHVybiBzaG93O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWZMb29rdXBFcXVhbHMoZmM6IGFueSwgbG9va3VwQXR0cjogc3RyaW5nLCB0YXJnZXRJZDogc3RyaW5nLCBjb250cm9sTmFtZTogc3RyaW5nKSB7XHJcbiAgICAgICAgcmV0dXJuIFZpc2liaWxpdHlIZWxwZXIuc2hvd0lmKGZjLCBjb250cm9sTmFtZSwgKCkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gRm9ybUNvbnRyb2xIZWxwZXIuZ2V0TG9va3VwSWQoZmMsIGxvb2t1cEF0dHIpO1xyXG4gICAgICAgICAgICByZXR1cm4gISFjdXJyZW50ICYmIFV0aWwuc2FuaXRpemVHdWlkKGN1cnJlbnQpID09PSBVdGlsLnNhbml0aXplR3VpZCh0YXJnZXRJZCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFR5cGUgZ3VhcmQ6IGNvbnRyb2wgc3VwcG9ydHMgc2V0RGlzYWJsZWQgKi9cclxuICAgIHN0YXRpYyBpc0Rpc2FibGVhYmxlKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sKTogY29udHJvbCBpcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sIHtcclxuICAgICAgICByZXR1cm4gXCJzZXREaXNhYmxlZFwiIGluIGNvbnRyb2wgJiYgdHlwZW9mIChjb250cm9sIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wpLnNldERpc2FibGVkID09PSBcImZ1bmN0aW9uXCI7XHJcbiAgICB9ICAgIFxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBkaWFsb2cgaGVscGVyIC0tLS1cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBSZXN1bHQge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZztcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBEaWFsb2dIZWxwZXIge1xyXG4gICAgc3RhdGljIGFzeW5jIG9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHJpYnV0ZTogc3RyaW5nLFxyXG4gICAgICAgIGlkczogc3RyaW5nW10sXHJcbiAgICAgICAgb3B0aW9ucz86IFBhcnRpYWw8eyBhbGxvd011bHRpU2VsZWN0OiBib29sZWFuOyBkaXNhYmxlTXJ1OiBib29sZWFuOyBkZWZhdWx0Vmlld0lkOiBzdHJpbmcgfT5cclxuICAgICk6IFByb21pc2U8TG9va3VwUmVzdWx0W10+IHtcclxuICAgICAgICBjb25zdCBpblZhbHVlcyA9IGlkc1xyXG4gICAgICAgICAgICAubWFwKChpZCkgPT4gYDx2YWx1ZSB1aXR5cGU9XCIke2VudGl0eUxvZ2ljYWx9XCI+eyR7VXRpbC5zYW5pdGl6ZUd1aWQoaWQpfX08L3ZhbHVlPmApXHJcbiAgICAgICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJYbWwgPSBgXHJcbiAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtpZEF0dHJpYnV0ZX1cIiBvcGVyYXRvcj1cImluXCI+XHJcbiAgICAgICAgICAke2luVmFsdWVzfVxyXG4gICAgICAgIDwvY29uZGl0aW9uPlxyXG4gICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3RhdGVjb2RlXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiMFwiIC8+XHJcbiAgICAgIDwvZmlsdGVyPmAudHJpbSgpO1xyXG5cclxuICAgICAgICBjb25zdCBsb29rdXBPcHRpb25zOiBhbnkgPSB7XHJcbiAgICAgICAgICAgIGFsbG93TXVsdGlTZWxlY3Q6IG9wdGlvbnM/LmFsbG93TXVsdGlTZWxlY3QgPz8gdHJ1ZSxcclxuICAgICAgICAgICAgZGVmYXVsdEVudGl0eVR5cGU6IGVudGl0eUxvZ2ljYWwsXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGVzOiBbZW50aXR5TG9naWNhbF0sXHJcbiAgICAgICAgICAgIGZpbHRlcnM6IFt7IGVudGl0eUxvZ2ljYWxOYW1lOiBlbnRpdHlMb2dpY2FsLCBmaWx0ZXJYbWwgfV0sXHJcbiAgICAgICAgICAgIGRpc2FibGVNcnU6IG9wdGlvbnM/LmRpc2FibGVNcnUgPz8gdHJ1ZSxcclxuICAgICAgICB9O1xyXG5cclxuICAgICAgICBpZiAob3B0aW9ucz8uZGVmYXVsdFZpZXdJZCkgbG9va3VwT3B0aW9ucy5kZWZhdWx0Vmlld0lkID0gb3B0aW9ucy5kZWZhdWx0Vmlld0lkO1xyXG5cclxuICAgICAgICByZXR1cm4gKGF3YWl0IFV0aWwuWHJtLlV0aWxpdHkubG9va3VwT2JqZWN0cyhsb29rdXBPcHRpb25zKSkgYXMgTG9va3VwUmVzdWx0W107XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gR2VuZXJpYyBsb29rdXAgT0RhdGEgc2VydmljZSAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRGaXJzdElkQnlGaWx0ZXIoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIG9kYXRhRmlsdGVyOiBzdHJpbmdcclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbnMgPSBgPyRzZWxlY3Q9JHtpZEF0dHJ9JiRmaWx0ZXI9JHtvZGF0YUZpbHRlcn1gO1xyXG4gICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWwsIG9wdGlvbnMpO1xyXG4gICAgICAgIGNvbnN0IHJvdyA9IHJlcz8uZW50aXRpZXM/LlswXTtcclxuICAgICAgICBjb25zdCBpZCA9IHJvdz8uW2lkQXR0cl0gYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGdldElkQnlFcXVhbGl0eShcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgYXR0cjogc3RyaW5nLFxyXG4gICAgICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBib29sZWFuXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBsaXQgPSB0eXBlb2YgdmFsdWUgPT09IFwic3RyaW5nXCIgPyBgJyR7dmFsdWUucmVwbGFjZSgvJy9nLCBcIicnXCIpfSdgIDogU3RyaW5nKHZhbHVlKTtcclxuICAgICAgICByZXR1cm4gdGhpcy5nZXRGaXJzdElkQnlGaWx0ZXIoZW50aXR5TG9naWNhbCwgaWRBdHRyLCBgKCR7YXR0cn0gZXEgJHtsaXR9KWApO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRm9ybVdhaXQge1xyXG4gICAgc3RhdGljIHdhaXRGb3JMb29rdXBWYWx1ZShmYzogYW55LCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHRpbWVvdXRNcyA9IDYwMDApOiBQcm9taXNlPFhybS5Mb29rdXBWYWx1ZSB8IG51bGw+IHtcclxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGVOYW1lKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghYXR0cikgcmV0dXJuIHJlc29sdmUobnVsbCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCBub3cgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICBpZiAobm93Py5pZCkgcmV0dXJuIHJlc29sdmUobm93KTtcclxuXHJcbiAgICAgICAgICAgIGxldCBkb25lID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnN0IGNsZWFudXAgPSAoKSA9PiB7IHRyeSB7IGF0dHIucmVtb3ZlT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfSB9O1xyXG4gICAgICAgICAgICBjb25zdCBvbkNoYW5nZSA9ICgpID0+IHtcclxuICAgICAgICAgICAgICAgIGlmIChkb25lKSByZXR1cm47XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgICAgIGlmICh2Py5pZCkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKHYpOyB9XHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICB0cnkgeyBhdHRyLmFkZE9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH1cclxuICAgICAgICAgICAgc2V0VGltZW91dChvbkNoYW5nZSwgMCk7XHJcblxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHsgaWYgKCFkb25lKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUobnVsbCk7IH0gfSwgdGltZW91dE1zKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIE93bmVySGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXRPd25lckF0dHJpYnV0ZShmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIHJldHVybiAoZmM/LmdldEF0dHJpYnV0ZT8uKG93bmVyQXR0ck5hbWUpID8/IG51bGwpIGFzIGFueTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IE93bmVyUmVmIHwgbnVsbCB7XHJcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpPy5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICBpZiAoIXY/LmlkIHx8ICF2LmVudGl0eVR5cGUpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiB7IGlkOiBVdGlsLnNhbml0aXplR3VpZCh2LmlkKSwgZW50aXR5VHlwZTogdi5lbnRpdHlUeXBlIGFzIGFueSwgbmFtZTogdi5uYW1lID8/IG51bGwgfTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2V0T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nLCBvd25lcjogT3duZXJSZWYpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk7XHJcbiAgICAgICAgaWYgKCFhdHRyKSByZXR1cm47XHJcbiAgICAgICAgYXR0ci5zZXRWYWx1ZShbe1xyXG4gICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQob3duZXIuaWQpLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlOiBvd25lci5lbnRpdHlUeXBlLFxyXG4gICAgICAgICAgICBuYW1lOiBvd25lci5uYW1lID8/IHVuZGVmaW5lZFxyXG4gICAgICAgIH0gYXMgYW55XSk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGlzU2FtZU93bmVyKGE/OiBPd25lclJlZiB8IG51bGwsIGI/OiBPd25lclJlZiB8IG51bGwpOiBib29sZWFuIHtcclxuICAgICAgICBpZiAoIWEgfHwgIWIpIHJldHVybiBmYWxzZTtcclxuICAgICAgICByZXR1cm4gYS5lbnRpdHlUeXBlID09PSBiLmVudGl0eVR5cGUgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoYS5pZCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKGIuaWQpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogR2VuZXJpYyBzZXJ2aWNlOiBMb2FkIG93bmVyIChVc2VyIG9yIFRlYW0pIGZvciBhbnkgcmVjb3JkICovXHJcbmV4cG9ydCBjbGFzcyBPd25lclNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldE93bmVyUmVmKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWNvcmRJZDogc3RyaW5nLFxyXG4gICAgICAgIG93bmVyQXR0ck5hbWUgPSBcIm93bmVyaWRcIlxyXG4gICAgKTogUHJvbWlzZTxPd25lclJlZiB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBpZCA9IFV0aWwuc2FuaXRpemVHdWlkKHJlY29yZElkKTtcclxuICAgICAgICBpZiAoIWlkKSByZXR1cm4gbnVsbDtcclxuXHJcbiAgICAgICAgLy8gRm9yIHBvbHltb3JwaGljIG93bmVyIGxvb2t1cHMsIGV4cGFuZCBkZWRpY2F0ZWQgbmF2IHByb3BzIHRvIGF2b2lkIHByb3BlcnR5LW5vdC1mb3VuZCBlcnJvcnNcclxuICAgICAgICBjb25zdCBleHBhbmQgPSBgPyRzZWxlY3Q9JHtvd25lckF0dHJOYW1lfSYkZXhwYW5kPW93bmluZ3VzZXIoJHNlbGVjdD1zeXN0ZW11c2VyaWQsZnVsbG5hbWUpLG93bmluZ3RlYW0oJHNlbGVjdD10ZWFtaWQsbmFtZSlgO1xyXG4gICAgICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsLCBpZCwgZXhwYW5kKTtcclxuXHJcbiAgICAgICAgY29uc3QgdXNlciA9IHJlYz8uW1wib3duaW5ndXNlclwiXTtcclxuICAgICAgICBpZiAodXNlcj8uc3lzdGVtdXNlcmlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodXNlci5zeXN0ZW11c2VyaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB1c2VyLmZ1bGxuYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IHRlYW0gPSByZWM/LltcIm93bmluZ3RlYW1cIl07XHJcbiAgICAgICAgaWYgKHRlYW0/LnRlYW1pZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHRlYW0udGVhbWlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwidGVhbVwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdGVhbS5uYW1lID8/IG51bGwsXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKiogU2VjdXJpdHktcmVsYXRlZCBoZWxwZXJzICovXHJcbmV4cG9ydCBjbGFzcyBTZWN1cml0eVNlcnZpY2Uge1xyXG4gICAgICAgIC8qKiBSZXR1cm5zIGN1cnJlbnQgdXNlciBpZCBmcm9tIFhybSBjb250ZXh0ICovXHJcbiAgICAgICAgc3RhdGljIGdldEN1cnJlbnRVc2VySWQoKTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBpZCA9IFV0aWwuWHJtPy5VdGlsaXR5Py5nZXRHbG9iYWxDb250ZXh0Py4oKT8udXNlclNldHRpbmdzPy51c2VySWQgYXMgc3RyaW5nIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIFJldHVybnMgcm9sZSBuYW1lcyBvZiB0aGUgY3VycmVudCB1c2VyICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGdldEN1cnJlbnRVc2VyUm9sZXMoKTogUHJvbWlzZTx7IGlkOiBzdHJpbmc7IG5hbWU6IHN0cmluZyB9W10+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHVzZXJJZCA9IHRoaXMuZ2V0Q3VycmVudFVzZXJJZCgpO1xyXG4gICAgICAgICAgICAgICAgaWYgKCF1c2VySWQpIHJldHVybiBbXTtcclxuXHJcbiAgICAgICAgICAgICAgICAvLyBGZXRjaFhNTCBvdmVyIHN5c3RlbXVzZXJyb2xlcyAoTjpOKSB0byByb2xlXHJcbiAgICAgICAgICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgICAgIDxmZXRjaCB2ZXJzaW9uPVwiMS4wXCIgZGlzdGluY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwicm9sZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJyb2xlaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2Vycm9sZXNcIiBmcm9tPVwicm9sZWlkXCIgdG89XCJyb2xlaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJcIiBmcm9tPVwic3lzdGVtdXNlcmlkXCIgdG89XCJzeXN0ZW11c2VyaWRcIiBhbGlhcz1cInVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7dXNlcklkfVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9mZXRjaD5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5mZXRjaFhtbChcInJvbGVcIiwgZmV0Y2hYbWwpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIChyZXMuZW50aXRpZXMgfHwgW10pLm1hcCgoZSkgPT4gKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKGVbXCJyb2xlaWRcIl0gPz8gZVtcIl9yb2xlaWRfdmFsdWVcIl0pLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBlW1wibmFtZVwiXSBhcyBzdHJpbmcsXHJcbiAgICAgICAgICAgICAgICB9KSkuZmlsdGVyKHIgPT4gISFyLmlkICYmICEhci5uYW1lKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBDaGVja3MgaWYgY3VycmVudCB1c2VyIGhhcyBvbmUgb2YgdGhlIHByb3ZpZGVkIHJvbGUgbmFtZXMgKGNhc2UtaW5zZW5zaXRpdmUpICovXHJcbiAgICAgICAgc3RhdGljIGFzeW5jIGhhc0N1cnJlbnRVc2VyUm9sZSguLi5yb2xlTmFtZXM6IHN0cmluZ1tdKTogUHJvbWlzZTxib29sZWFuPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB3YW50ZWQgPSBuZXcgU2V0KHJvbGVOYW1lcy5tYXAobiA9PiBuLnRyaW0oKS50b0xvd2VyQ2FzZSgpKS5maWx0ZXIoQm9vbGVhbikpO1xyXG4gICAgICAgICAgICAgICAgaWYgKHdhbnRlZC5zaXplID09PSAwKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zdCByb2xlcyA9IGF3YWl0IHRoaXMuZ2V0Q3VycmVudFVzZXJSb2xlcygpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvbGVzLnNvbWUociA9PiB3YW50ZWQuaGFzKHIubmFtZS50b0xvd2VyQ2FzZSgpKSk7XHJcbiAgICAgICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIExvb2t1cCBjb250cm9sIHZpZXcgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBMb29rdXBWaWV3SGVscGVyIHtcclxuICAgIC8qKiBSZXN0cmljdCBhIGxvb2t1cCBjb250cm9sIHRvIHNwZWNpZmljIGVudGl0eSB0eXBlcyAqL1xyXG4gICAgc3RhdGljIHNldEVudGl0eVR5cGVzKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGVudGl0eVR5cGVzOiBzdHJpbmdbXSk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBjdHJsPy5zZXRFbnRpdHlUeXBlcz8uKGVudGl0eVR5cGVzKTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkIGEgY3VzdG9tIHZpZXcgdG8gYSBsb29rdXAgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIGFkZEN1c3RvbVZpZXcoXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICBjb250cm9sTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdJZDogc3RyaW5nLFxyXG4gICAgICAgIGVudGl0eU5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3RGlzcGxheU5hbWU6IHN0cmluZyxcclxuICAgICAgICBmZXRjaFhtbDogc3RyaW5nLFxyXG4gICAgICAgIGxheW91dFhtbDogc3RyaW5nLFxyXG4gICAgICAgIHNldEFzRGVmYXVsdDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSBmYy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpIGFzIFhybS5Db250cm9scy5Mb29rdXBDb250cm9sIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWN0cmw/LmFkZEN1c3RvbVZpZXcpIHJldHVybjtcclxuICAgICAgICAgICAgY3RybC5hZGRDdXN0b21WaWV3KHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbC50cmltKCksIGxheW91dFhtbC50cmltKCksIHNldEFzRGVmYXVsdCk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZHMgYSBjdXN0b20gdmlldyBmb3Igb3duZXIgbG9va3VwIHRvIHNob3cgb25seSB0ZWFtcyB0aGUgY3VycmVudCB1c2VyIGJlbG9uZ3MgdG8uICovXHJcbiAgICBzdGF0aWMgYWRkT3duZXJUZWFtVmlld0ZvckN1cnJlbnRVc2VyKGZjOiBYcm0uRm9ybUNvbnRleHQsIGNvbnRyb2xOYW1lOiBzdHJpbmcgPSBcIm93bmVyaWRcIik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBcInRlYW1cIjtcclxuICAgICAgICBjb25zdCB2aWV3RGlzcGxheU5hbWUgPSBcIk93bmVyVGVhbUxvb2t1cFZpZXdcIjtcclxuICAgICAgICBjb25zdCB2aWV3SWQgPSBcInswMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDF9XCI7XHJcblxyXG4gICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICA8ZmV0Y2g+XHJcbiAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJ0ZWFtXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiYnVzaW5lc3N1bml0aWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwibmV2X293bmVydGVhbTJzeXN0ZW11c2VyXCIgZnJvbT1cInRlYW1pZFwiIHRvPVwidGVhbWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8ZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxLXVzZXJpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgPC9mZXRjaD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBjb25zdCBsYXlvdXRYbWwgPSBgXHJcbiAgICAgICAgICAgIDxncmlkIG5hbWU9J3Jlc3VsdHNldCcgb2JqZWN0PScxJyBqdW1wPSd0ZWFtaWQnIHNlbGVjdD0nMScgaWNvbj0nMScgcHJldmlldz0nMSc+XHJcbiAgICAgICAgICAgICAgICA8cm93IG5hbWU9J3Jlc3VsdCcgaWQ9J3RlYW1pZCc+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nbmFtZScgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSdidXNpbmVzc3VuaXRpZCcgd2lkdGg9JzE1MCcgLz5cclxuICAgICAgICAgICAgICAgIDwvcm93PlxyXG4gICAgICAgICAgICA8L2dyaWQ+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgTG9va3VwVmlld0hlbHBlci5hZGRDdXN0b21WaWV3KGZjLCBjb250cm9sTmFtZSwgdmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLCBsYXlvdXRYbWwsIHRydWUpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgRmllbGRWYWxpZGF0b3Ige1xyXG4gICAgLyoqXHJcbiAgICAgKiBWYWxpZGF0ZXMgYSBudW1lcmljIHRleHQgZmllbGQgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlxyXG4gICAgICogQ2FuIGJlIHVzZWQgZm9yIE9uQ2hhbmdlIGV2ZW50cyBhbmQgb3B0aW9uYWxseSByZWNlaXZlcyB0aGUgYXR0cmlidXRlIG5hbWUgYXMgYSBwYXJhbWV0ZXIuXHJcbiAgICAgKi9cclxuICAgIHN0YXRpYyB2YWxpZGF0ZUJpZ051bWJlcihcclxuICAgICAgICBleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCxcclxuICAgICAgICBhdHRyaWJ1dGVOYW1lPzogc3RyaW5nXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBmb3JtQ29udGV4dCA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKSBhcyBYcm0uRm9ybUNvbnRleHQ7XHJcblxyXG4gICAgICAgIC8vIElmIG5vIGF0dHJpYnV0ZSBuYW1lIGlzIHByb3ZpZGVkIOKGkiB1c2UgZXZlbnQgc291cmNlXHJcbiAgICAgICAgaWYgKCFhdHRyaWJ1dGVOYW1lKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50U291cmNlID0gZXhlY3V0aW9uQ29udGV4dC5nZXRFdmVudFNvdXJjZSgpIGFzIFhybS5BdHRyaWJ1dGVzLkF0dHJpYnV0ZTtcclxuICAgICAgICAgICAgaWYgKCFldmVudFNvdXJjZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lID0gZXZlbnRTb3VyY2UuZ2V0TmFtZSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYXR0cmlidXRlID0gZm9ybUNvbnRleHQuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZU5hbWUpO1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSBmb3JtQ29udGV4dC5nZXRDb250cm9sKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2w7XHJcblxyXG4gICAgICAgIGlmICghYXR0cmlidXRlIHx8ICFjb250cm9sKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbklkID0gYCR7YXR0cmlidXRlTmFtZX1fQmlnTnVtYmVyRXJyb3JgO1xyXG4gICAgICAgIGxldCB2YWx1ZSA9IGF0dHJpYnV0ZS5nZXRWYWx1ZSgpIGFzIHN0cmluZyB8IG51bGw7XHJcblxyXG4gICAgICAgIC8vIElmIHRoZSBmaWVsZCBpcyB0cnVseSBlbXB0eSAobnVsbCkg4oaSIGNsZWFyIGVycm9yIGFuZCBleGl0XHJcbiAgICAgICAgaWYgKHZhbHVlID09PSBudWxsKSB7XHJcbiAgICAgICAgICAgIGNvbnRyb2wuY2xlYXJOb3RpZmljYXRpb24obm90aWZpY2F0aW9uSWQpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBLZWVwIG9yaWdpbmFsIHN0cmluZywgYnV0IHdvcmsgb24gYSBjb3B5XHJcbiAgICAgICAgY29uc3QgcmF3ID0gdmFsdWUudG9TdHJpbmcoKTtcclxuXHJcbiAgICAgICAgLy8gSWYgdGhlIHVzZXIgZW50ZXJlZCBvbmx5IHdoaXRlc3BhY2Ug4oaSIHRyZWF0IGFzIGludmFsaWRcclxuICAgICAgICBpZiAocmF3LnRyaW0oKS5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKG51bGwpO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldE5vdGlmaWNhdGlvbihcclxuICAgICAgICAgICAgICAgIFwiUGxlYXNlIGVudGVyIGEgbnVtZXJpYyB2YWx1ZSB3aXRoIGEgbWF4aW11bSBvZiAxMiBkaWdpdHMuXCIsXHJcbiAgICAgICAgICAgICAgICBub3RpZmljYXRpb25JZFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBSZW1vdmUgYWxsIHdoaXRlc3BhY2UgZm9yIHZhbGlkYXRpb24gLyBzdG9yYWdlXHJcbiAgICAgICAgY29uc3QgZGlnaXRzT25seSA9IHJhdy5yZXBsYWNlKC9cXHMrL2csIFwiXCIpO1xyXG5cclxuICAgICAgICAvLyBWYWxpZGF0aW9uOiBvbmx5IGRpZ2l0cywgbWF4LiAxMiBjaGFyYWN0ZXJzXHJcbiAgICAgICAgY29uc3QgaXNWYWxpZCA9IC9eXFxkezEsMTJ9JC8udGVzdChkaWdpdHNPbmx5KTtcclxuXHJcbiAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZS5zZXRWYWx1ZShudWxsKTtcclxuICAgICAgICAgICAgY29udHJvbC5zZXROb3RpZmljYXRpb24oXHJcbiAgICAgICAgICAgICAgICBcIlBsZWFzZSBlbnRlciBhIG51bWVyaWMgdmFsdWUgd2l0aCBhIG1heGltdW0gb2YgMTIgZGlnaXRzLlwiLFxyXG4gICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uSWRcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gVmFsaWQg4oaSIGNsZWFyIG5vdGlmaWNhdGlvbiBhbmQgc3RvcmUgcmF3IHZhbHVlIHdpdGhvdXQgc3BhY2VzXHJcbiAgICAgICAgY29udHJvbC5jbGVhck5vdGlmaWNhdGlvbihub3RpZmljYXRpb25JZCk7XHJcbiAgICAgICAgYXR0cmlidXRlLnNldFZhbHVlKGRpZ2l0c09ubHkpO1xyXG4gICAgfVxyXG59XHJcbiIsIi8vIFBvcnRmb2xpby5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IEFDQ09VTlQgPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybWJfcG9ydGZvbGlvaWRcIixcclxuICAgICAgICBhbWJjdXN0X2xvY2F0aW9uaWQ6IFwiYW1iY3VzdF9sb2NhdGlvbmlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCJleHBvcnQgY29uc3QgQ09OVEFDVCA9IHtcclxuICAgIGVudGl0eTogXCJjb250YWN0XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJjb250YWN0aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0aWQ6IFwibmV2X2J1c2luZXNzdW5pdGlkXCIsXHJcbiAgICAgICAgb3duZXJpZDogXCJvd25lcmlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0OyIsImltcG9ydCB0eXBlIHsgQnVzaW5lc3NVbml0Q29uZmlnLCBFbnRpdHlDb25maWcgfSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEJVU0lORVNTVU5JVExPQ0FUSU9OID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3RfbG9jYXRpb25cIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgICAgIG1hbmRhdG9yeUNvbmZpZ0pzb246IFwibWh3cm1iX21hbmRhdG9yeWNvbmZpZ2pzb25cIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcblxyXG4vKiogU2FmZSBwYXJzZTsgcmV0dXJucyBudWxsIGlmIGludmFsaWQuICovXHJcbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUJ1c2luZXNzVW5pdENvbmZpZyhqc29uVGV4dDogc3RyaW5nIHwgbnVsbCk6IEJ1c2luZXNzVW5pdENvbmZpZyB8IG51bGwge1xyXG4gICAgaWYgKCFqc29uVGV4dCkgcmV0dXJuIG51bGw7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHBhcnNlZCA9IEpTT04ucGFyc2UoanNvblRleHQpIGFzIEJ1c2luZXNzVW5pdENvbmZpZztcclxuICAgICAgICBpZiAoIXBhcnNlZCB8fCB0eXBlb2YgcGFyc2VkICE9PSBcIm9iamVjdFwiIHx8ICFwYXJzZWQuZW50aXRpZXMpIHJldHVybiBudWxsO1xyXG4gICAgICAgIHJldHVybiBwYXJzZWQ7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIENvbGxlY3QgYmFzZSBhdHRyaWJ1dGUgbmFtZXMgdXNlZCBpbiBjb25kaXRpb25zIChmb3IgYXV0byBPbkNoYW5nZSB3aXJpbmcpLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gbGlzdENvbmRpdGlvbkZpZWxkcyhlbnRpdHlDb25maWc/OiBFbnRpdHlDb25maWcpOiBzdHJpbmdbXSB7XHJcbiAgICBpZiAoIWVudGl0eUNvbmZpZz8ucnVsZXM/Lmxlbmd0aCkgcmV0dXJuIFtdO1xyXG4gICAgY29uc3QgZmllbGRzID0gbmV3IFNldDxzdHJpbmc+KCk7XHJcbiAgICBmb3IgKGNvbnN0IHIgb2YgZW50aXR5Q29uZmlnLnJ1bGVzKSB7XHJcbiAgICAgICAgZm9yIChjb25zdCBjIG9mIHIuY29uZGl0aW9uID8/IFtdKSB7XHJcbiAgICAgICAgICAgIGlmICghYy5maWVsZCkgY29udGludWU7XHJcbiAgICAgICAgICAgIC8vIGJpbmQgb24gdGhlIGJhc2UgYXR0cmlidXRlIChiZWZvcmUgcHJvamVjdGlvbiBsaWtlIC5uYW1lKVxyXG4gICAgICAgICAgICBmaWVsZHMuYWRkKGMuZmllbGQuc3BsaXQoXCIuXCIsIDEpWzBdKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShmaWVsZHMpO1xyXG59IiwiLy8gT3JpZ2luVHlwZS5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IE9SSUdJTlRZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwiYW1iY3VzdF9vcmlnaW50eXBlXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X29yaWdpbnR5cGVpZFwiLFxyXG4gICAgICAgIHR5cGVOYW1lQ29kZTogXCJtaHdybWJfdHlwZW5hbWVjb2RlXCIsXHJcbiAgICB9LFxyXG4gICAgdmFsdWVzOiB7XHJcbiAgICAgICAgQUNDT1VOVF9PUEVOSU5HOiBcIkFDQ09VTlRfT1BFTklOR1wiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwb3J0Zm9saW9JZDogXCJ3cm1iX3BvcnRmb2xpb2lkXCIsXHJcbiAgICAgICAgY29udGFjdElkOiBcIndybWJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueUlkOiBcIndybWJfY29tcGFueWlkXCIsXHJcbiAgICAgICAgdHlwZUlkOiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBQb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUE9SVEZPTElPUkVMQVRJT05TSElQVFlQRSA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybWJfcG9ydGZvbGlvcmVsYXRpb25zaGlwdHlwZWlkXCIsXHJcbiAgICAgICAgbmFtZTogXCJ3cm1iX25hbWVcIixcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgTkFNRV9QUklOQ0lQQUw6IFwiUHJpbmNpcGFsXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBSaXNrU3VtbWFyeUFuZEFwcHJvdmFsLmVudGl0eS50c1xyXG5leHBvcnQgY29uc3QgUklTS1NVTU1BUllBTkRBUFBST1ZBTCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIndybXJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbGlkXCIsXHJcbiAgICAgICAgY29udGFjdElkOiBcIndybXJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgY29tcGFueUlkOiBcIndybXJfY29tcGFueWlkXCIsXHJcbiAgICAgICAgYW1iY3VzdE9yaWdpblR5cGVJZDogXCJhbWJjdXN0X29yaWdpbnR5cGVpZFwiLFxyXG4gICAgICAgIHN0YXRlY29kZTogXCJzdGF0ZWNvZGVcIlxyXG4gICAgfSxcclxuICAgIGNvbnRyb2xzOiB7XHJcbiAgICAgICAgc3ViZ3JpZEFjY291bnRzOiBcIndybV9zdWJncmlkX2FjY291bnRzXCIsXHJcbiAgICB9LFxyXG4gICAgcmVsYXRpb25zaGlwczoge1xyXG4gICAgICAgIHBvcnRmb2xpb3M6IHtcclxuICAgICAgICAgICAgc2NoZW1hOiBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiLFxyXG4gICAgICAgICAgICBuYXY6IFwibWh3cm1iX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWwycG9ydGZvbGlvXCIsXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbiAgICB0YWJzOiB7XHJcbiAgICAgICAgTUFJTjogXCJUQUJfTUFJTlwiLFxyXG4gICAgICAgIFJFVklFVzogXCJUQUJfUkVWSUVXXCIsXHJcbiAgICB9LFxyXG4gICAgc2VjdGlvbnM6IHtcclxuICAgICAgICBBUFBST1ZBTDogXCJTRUNfQVBQUk9WQUxcIixcclxuICAgIH0sXHJcbiAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgLy8gQmVpc3BpZWw6IFNUQVRVU19BUFBST1ZFRDogMTAwMDAwMDAxXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG4iLCIvLyBCYXJyZWwgZmlsZSDvv70gYu+/vW5kZWx0IGFsbGUgRW50aXR5LU9iamVrdGVcclxuZXhwb3J0ICogZnJvbSBcIi4vUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vQWNjb3VudC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvUmVsYXRpb25zaGlwLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Qb3J0Zm9saW9SZWxhdGlvbnNoaXBUeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9PcmlnaW5UeXBlLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9NYW5kYXRvcnlDb25maWcuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0NvbnRhY3QuZW50aXR5XCI7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiLy8gSGlud2VpczogS2VpbmUgVFMtTmFtZXNwYWNlcy4gTnVyIGRpZSBiZWlkZW4gSGFuZGxlciB3ZXJkZW4gZXhwb3J0aWVydC5cclxuXHJcbmltcG9ydCB7XHJcbiAgICBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLFxyXG4gICAgQUNDT1VOVCxcclxuICAgIFBPUlRGT0xJT1JFTEFUSU9OU0hJUCxcclxuICAgIFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUsXHJcbiAgICBPUklHSU5UWVBFLFxyXG59IGZyb20gXCIuLi9lbnRpdGllcy9pbmRleFwiO1xyXG5cclxuaW1wb3J0IHtcclxuICAgIFV0aWwsXHJcbiAgICBBcGlDbGllbnQsXHJcbiAgICBGb3JtQ29udHJvbEhlbHBlcixcclxuICAgIEdyaWRIZWxwZXIsXHJcbiAgICBWaXNpYmlsaXR5SGVscGVyLFxyXG4gICAgTG9va3VwRGlhbG9nSGVscGVyLFxyXG4gICAgTG9va3VwU2VydmljZSxcclxufSBmcm9tIFwiLi4vY29yZS9jcm0uY29yZVwiO1xyXG5cclxuLyoqXHJcbiAqIEZPUk0gb25Mb2FkXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25Mb2FkKGV4ZWN1dGlvbkNvbnRleHQ6IGFueSkge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0Py4oKSA/PyBleGVjdXRpb25Db250ZXh0O1xyXG5cclxuICAgIGlmIChpc1JlY29yZEluYWN0aXZlKGZjKSkge1xyXG4gICAgICAgIGZjLnVpPy5zZXRGb3JtTm90aWZpY2F0aW9uPy4oXHJcbiAgICAgICAgICAgIFwiVGhpcyByZWNvcmQgaXMgaW5hY3RpdmUuIEFjdGlvbnMgYXJlIG5vdCBhdmFpbGFibGUuXCIsXHJcbiAgICAgICAgICAgIFwiV0FSTklOR1wiLFxyXG4gICAgICAgICAgICBcInJlY29yZC1pbmFjdGl2ZVwiXHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm47IC8vIHN0b3AgZnVydGhlciBpbml0IHdvcmtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGF3YWl0IHRvZ2dsZUFjY291bnRzU3ViZ3JpZEZvck9yaWdpblR5cGUoZmMpO1xyXG4gICAgICAgIC8vIE9uQ2hhbmdlLUhhbmRsZXIgZsO8ciBPcmlnaW5UeXBlSWQgaGluenVmw7xnZW5cclxuICAgICAgICBmYy5nZXRBdHRyaWJ1dGU/LihSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmZpZWxkcy5hbWJjdXN0T3JpZ2luVHlwZUlkKT8uYWRkT25DaGFuZ2UoYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgICAgICBhd2FpdCB0b2dnbGVBY2NvdW50c1N1YmdyaWRGb3JPcmlnaW5UeXBlKGZjKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gY2F0Y2gge1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5jb250cm9scy5zdWJncmlkQWNjb3VudHMsIGZhbHNlKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFJpYmJvbi1Db21tYW5kOiBBY2NvdW50cyBoaW56dWbDvGdlbiAoQXNzb2NpYXRlIGluIE46TilcclxuICovXHJcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBhZGRBbGxvd2VkQWNjb3VudHMocHJpbWFyeUNvbnRyb2w6IGFueSkge1xyXG4gICAgY29uc3QgZmMgPSBwcmltYXJ5Q29udHJvbDtcclxuICAgIGNvbnN0IHhybSA9ICh3aW5kb3cgYXMgYW55KS5Ycm0gPz8gVXRpbC5Ycm07XHJcblxyXG4gICAgaWYgKGlzUmVjb3JkSW5hY3RpdmUoZmMpKSB7XHJcbiAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJSZWNvcmQgaXMgaW5hY3RpdmUuXCIgfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRJZCA9IEZvcm1Db250cm9sSGVscGVyLmdldEN1cnJlbnRJZChmYyk7XHJcbiAgICBpZiAoIWN1cnJlbnRJZCkge1xyXG4gICAgICAgIGF3YWl0IHhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiUGxlYXNlIHNhdmUgdGhlIHJlY29yZCBmaXJzdC5cIiB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgY29udGFjdElkID0gRm9ybUNvbnRyb2xIZWxwZXIuZ2V0TG9va3VwSWQoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuZmllbGRzLmNvbnRhY3RJZCk7XHJcbiAgICBjb25zdCBjb21wYW55SWQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRMb29rdXBJZChmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuY29tcGFueUlkKTtcclxuXHJcbiAgICBpZiAoIWNvbnRhY3RJZCAmJiAhY29tcGFueUlkKSB7XHJcbiAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJQbGVhc2Ugc2V0IGVpdGhlciBhIENvbnRhY3Qgb3IgYSBDb21wYW55IGZpcnN0LlwiIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZUlkcyA9IGF3YWl0IGZldGNoQ2FuZGlkYXRlUG9ydGZvbGlvSWRzKGNvbnRhY3RJZCwgY29tcGFueUlkKTtcclxuICAgICAgICBpZiAoY2FuZGlkYXRlSWRzLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIk5vIG1hdGNoaW5nIGFjY291bnRzIGZvdW5kIGZvciB0aGUgc2VsZWN0ZWQgQ29udGFjdC9Db21wYW55LlwiIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBhbHJlYWR5TGlua2VkID0gYXdhaXQgZ2V0QWxyZWFkeUxpbmtlZFBvcnRmb2xpb0lkcyhjdXJyZW50SWQpO1xyXG4gICAgICAgIGNvbnN0IGNhbmRpZGF0ZXNUb09mZmVyID0gY2FuZGlkYXRlSWRzLmZpbHRlcihpZCA9PiAhYWxyZWFkeUxpbmtlZC5oYXMoVXRpbC5zYW5pdGl6ZUd1aWQoaWQpKSk7XHJcbiAgICAgICAgaWYgKGNhbmRpZGF0ZXNUb09mZmVyLmxlbmd0aCA9PT0gMCkge1xyXG4gICAgICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIkFsbCBjYW5kaWRhdGUgYWNjb3VudHMgYXJlIGFscmVhZHkgbGlua2VkIHRvIHRoaXMgcmVjb3JkLlwiIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBjb25zdCBzZWxlY3RlZElkcyA9IGF3YWl0IG9wZW5DYW5kaWRhdGVQaWNrZXIoZmMsIGNhbmRpZGF0ZXNUb09mZmVyKTtcclxuICAgICAgICBpZiAoc2VsZWN0ZWRJZHMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGF3YWl0IGFzc29jaWF0ZVNlbGVjdGVkUG9ydGZvbGlvcyhjdXJyZW50SWQsIHNlbGVjdGVkSWRzKTtcclxuXHJcbiAgICAgICAgR3JpZEhlbHBlci50cnlSZWZyZXNoU3ViZ3JpZChmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5jb250cm9scy5zdWJncmlkQWNjb3VudHMpO1xyXG4gICAgfSBjYXRjaCAoZXJyOiBhbnkpIHtcclxuICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuRXJyb3JEaWFsb2c/Lih7IG1lc3NhZ2U6IGVycj8ubWVzc2FnZSA/PyBTdHJpbmcoZXJyKSB9KTtcclxuICAgIH1cclxufVxyXG5cclxuLyogLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAqL1xyXG4vKiAgICAgICAgICAgaGVscGVyIGZ1bmN0aW9ucyAgICAgICAgICovXHJcbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cclxuXHJcbi8vIFJldHVybnMgdHJ1ZSBpZiB0aGUgY3VycmVudCByZWNvcmQgaXMgaW5hY3RpdmUgKHN0YXRlY29kZSA9IDEpXHJcbmZ1bmN0aW9uIGlzUmVjb3JkSW5hY3RpdmUoZmM6IGFueSk6IGJvb2xlYW4ge1xyXG4gICAgY29uc3Qgc3RhdGVjb2RlQXR0cmlidXRlID0gZmMuZ2V0QXR0cmlidXRlPy4oUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuc3RhdGVjb2RlKTtcclxuICAgIGNvbnN0IHZhbCA9IHN0YXRlY29kZUF0dHJpYnV0ZT8uZ2V0VmFsdWU/LigpOyAgICAgICAgLy8gb3B0aW9uc2V0IG51bWJlciAoMD1BY3RpdmUsIDE9SW5hY3RpdmUpXHJcbiAgICByZXR1cm4gdmFsID09PSAxIHx8IHZhbCA9PT0gXCIxXCI7ICAgICAgICAgICAgLy8gYmUgZGVmZW5zaXZlIGFib3V0IHR5cGVcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gdG9nZ2xlQWNjb3VudHNTdWJncmlkRm9yT3JpZ2luVHlwZShmYzogYW55KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBjb25zdCBhY2NvdW50T3BlbmluZ0lkID0gYXdhaXQgZ2V0QWNjb3VudE9wZW5pbmdJZCgpO1xyXG4gICAgaWYgKCFhY2NvdW50T3BlbmluZ0lkKSB7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmNvbnRyb2xzLnN1YmdyaWRBY2NvdW50cywgZmFsc2UpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBWaXNpYmlsaXR5SGVscGVyLnNob3dJZkxvb2t1cEVxdWFscyhcclxuICAgICAgICBmYyxcclxuICAgICAgICBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmZpZWxkcy5hbWJjdXN0T3JpZ2luVHlwZUlkLFxyXG4gICAgICAgIGFjY291bnRPcGVuaW5nSWQsXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5jb250cm9scy5zdWJncmlkQWNjb3VudHNcclxuICAgICk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFjY291bnRPcGVuaW5nSWQoKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICByZXR1cm4gTG9va3VwU2VydmljZS5nZXRJZEJ5RXF1YWxpdHkoXHJcbiAgICAgICAgT1JJR0lOVFlQRS5lbnRpdHksXHJcbiAgICAgICAgT1JJR0lOVFlQRS5maWVsZHMucGssXHJcbiAgICAgICAgT1JJR0lOVFlQRS5maWVsZHMudHlwZU5hbWVDb2RlLFxyXG4gICAgICAgIE9SSUdJTlRZUEUudmFsdWVzLkFDQ09VTlRfT1BFTklOR1xyXG4gICAgKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hDYW5kaWRhdGVQb3J0Zm9saW9JZHMoY29udGFjdElkPzogc3RyaW5nLCBjb21wYW55SWQ/OiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZ1tdPiB7XHJcbiAgICBjb25zdCBvckJsb2NrID0gW1xyXG4gICAgICAgIGNvbnRhY3RJZFxyXG4gICAgICAgICAgICA/IGA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5jb250YWN0SWR9XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHtVdGlsLnNhbml0aXplR3VpZChjb250YWN0SWQpfVwiIC8+YFxyXG4gICAgICAgICAgICA6IFwiXCIsXHJcbiAgICAgICAgY29tcGFueUlkXHJcbiAgICAgICAgICAgID8gYDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLmNvbXBhbnlJZH1cIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke1V0aWwuc2FuaXRpemVHdWlkKGNvbXBhbnlJZCl9XCIgLz5gXHJcbiAgICAgICAgICAgIDogXCJcIixcclxuICAgIF1cclxuICAgICAgICAuZmlsdGVyKEJvb2xlYW4pXHJcbiAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICA8ZmV0Y2ggdmVyc2lvbj1cIjEuMFwiIGRpc3RpbmN0PVwidHJ1ZVwiPlxyXG4gICAgICA8ZW50aXR5IG5hbWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5lbnRpdHl9XCI+XHJcbiAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLnBvcnRmb2xpb0lkfVwiIC8+XHJcbiAgICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgICA8ZmlsdGVyIHR5cGU9XCJvclwiPlxyXG4gICAgICAgICAgICAke29yQmxvY2t9XHJcbiAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQVFlQRS5lbnRpdHl9XCJcclxuICAgICAgICAgICAgICAgICAgICAgZnJvbT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQVFlQRS5maWVsZHMucGt9XCJcclxuICAgICAgICAgICAgICAgICAgICAgdG89XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMudHlwZUlkfVwiIGFsaWFzPVwicmVsdHlwZVwiPlxyXG4gICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUuZmllbGRzLm5hbWV9XCJcclxuICAgICAgICAgICAgICAgICAgICAgICBvcGVyYXRvcj1cImVxXCJcclxuICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQVFlQRS5vcHRpb25zLk5BTUVfUFJJTkNJUEFMfVwiIC8+XHJcbiAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICA8L2VudGl0eT5cclxuICAgIDwvZmV0Y2g+YC50cmltKCk7XHJcblxyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LmZldGNoWG1sKFBPUlRGT0xJT1JFTEFUSU9OU0hJUC5lbnRpdHksIGZldGNoWG1sKTtcclxuICAgIGNvbnN0IGlkcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgZm9yIChjb25zdCBlIG9mIHJlcy5lbnRpdGllcykge1xyXG4gICAgICAgIGNvbnN0IGlkID1cclxuICAgICAgICAgICAgVXRpbC5zYW5pdGl6ZUd1aWQoKGUgYXMgYW55KVtgXyR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5wb3J0Zm9saW9JZH1fdmFsdWVgXSkgfHxcclxuICAgICAgICAgICAgVXRpbC5zYW5pdGl6ZUd1aWQoKGUgYXMgYW55KVtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLnBvcnRmb2xpb0lkXSk7XHJcbiAgICAgICAgaWYgKGlkKSBpZHMuYWRkKGlkKTtcclxuICAgIH1cclxuICAgIHJldHVybiBBcnJheS5mcm9tKGlkcyk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGdldEFscmVhZHlMaW5rZWRQb3J0Zm9saW9JZHMobWFpbklkOiBzdHJpbmcpOiBQcm9taXNlPFNldDxzdHJpbmc+PiB7XHJcbiAgICBjb25zdCBleHBhbmQgPSBgPyRleHBhbmQ9JHtSSVNLU1VNTUFSWUFOREFQUFJPVkFMLnJlbGF0aW9uc2hpcHMucG9ydGZvbGlvcy5uYXZ9KCRzZWxlY3Q9JHtBQ0NPVU5ULmZpZWxkcy5wa30pYDtcclxuICAgIGNvbnN0IHJlYyA9IGF3YWl0IEFwaUNsaWVudC5yZXRyaWV2ZVJlY29yZChSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmVudGl0eSwgbWFpbklkLCBleHBhbmQpO1xyXG4gICAgY29uc3QgbGlzdCA9IChyZWM/LltSSVNLU1VNTUFSWUFOREFQUFJPVkFMLnJlbGF0aW9uc2hpcHMucG9ydGZvbGlvcy5uYXZdIHx8IFtdKSBhcyBBcnJheTxhbnk+O1xyXG4gICAgcmV0dXJuIG5ldyBTZXQ8c3RyaW5nPihsaXN0Lm1hcChyb3cgPT4gVXRpbC5zYW5pdGl6ZUd1aWQocm93W0FDQ09VTlQuZmllbGRzLnBrXSkpKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gb3BlbkNhbmRpZGF0ZVBpY2tlcihmYzogYW55LCBjYW5kaWRhdGVJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgZmM/LnVpPy5zZXRGb3JtTm90aWZpY2F0aW9uPy4oXHJcbiAgICAgICAgXCJTaG93aW5nIGFjY291bnRzIHRoYXQgbWF0Y2ggdGhlIHNlbGVjdGVkIENvbnRhY3QvQ29tcGFueS4gQWxyZWFkeSBsaW5rZWQgaXRlbXMgYXJlIGhpZGRlbi5cIixcclxuICAgICAgICBcIklORk9cIixcclxuICAgICAgICBcImFjY291bnQtZmlsdGVyLWNvbnRleHRcIlxyXG4gICAgKTtcclxuXHJcbiAgICBjb25zdCBzZWxlY3Rpb24gPSBhd2FpdCBMb29rdXBEaWFsb2dIZWxwZXIub3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgQUNDT1VOVC5lbnRpdHksXHJcbiAgICAgICAgQUNDT1VOVC5maWVsZHMucGssXHJcbiAgICAgICAgY2FuZGlkYXRlSWRzLFxyXG4gICAgICAgIHsgYWxsb3dNdWx0aVNlbGVjdDogdHJ1ZSwgZGlzYWJsZU1ydTogdHJ1ZSB9XHJcbiAgICApO1xyXG5cclxuICAgIGZjPy51aT8uY2xlYXJGb3JtTm90aWZpY2F0aW9uPy4oXCJhY2NvdW50LWZpbHRlci1jb250ZXh0XCIpO1xyXG5cclxuICAgIGlmICghc2VsZWN0aW9uIHx8IHNlbGVjdGlvbi5sZW5ndGggPT09IDApIHJldHVybiBbXTtcclxuICAgIHJldHVybiBVdGlsLnVuaXF1ZShzZWxlY3Rpb24ubWFwKHMgPT4gVXRpbC5zYW5pdGl6ZUd1aWQocy5pZCkpKTtcclxufVxyXG5cclxuYXN5bmMgZnVuY3Rpb24gYXNzb2NpYXRlU2VsZWN0ZWRQb3J0Zm9saW9zKG1haW5JZDogc3RyaW5nLCBzZWxlY3RlZElkczogc3RyaW5nW10pOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICghc2VsZWN0ZWRJZHMubGVuZ3RoKSByZXR1cm47XHJcbiAgICBhd2FpdCBBcGlDbGllbnQuYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmVudGl0eSxcclxuICAgICAgICBtYWluSWQsXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5yZWxhdGlvbnNoaXBzLnBvcnRmb2xpb3Muc2NoZW1hLFxyXG4gICAgICAgIEFDQ09VTlQuZW50aXR5LFxyXG4gICAgICAgIHNlbGVjdGVkSWRzXHJcbiAgICApO1xyXG59XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==