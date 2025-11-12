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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNaLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxJQUFJLEVBQUUsQ0FDL0MsQ0FBQztJQUVGLGNBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxFQUFFLDBDQUFFLHFCQUFxQixtREFBRyx3QkFBd0IsQ0FBQyxDQUFDO0lBRTFELElBQUksQ0FBQyxTQUFTLElBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDO1FBQUUsT0FBTyxFQUFFLENBQUM7SUFDcEQsT0FBTyxnREFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsZ0RBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNwRSxDQUFDO0FBRUQsS0FBSyxVQUFVLDJCQUEyQixDQUFDLE1BQWMsRUFBRSxXQUFxQjtJQUM1RSxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU07UUFBRSxPQUFPO0lBQ2hDLE1BQU0scURBQVMsQ0FBQyxtQkFBbUIsQ0FDL0IsbUVBQXNCLENBQUMsTUFBTSxFQUM3QixNQUFNLEVBQ04sbUVBQXNCLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQ3RELG9EQUFPLENBQUMsTUFBTSxFQUNkLFdBQVcsQ0FDZCxDQUFDO0FBQ04sQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQWNjb3VudC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQ29udGFjdC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvTWFuZGF0b3J5Q29uZmlnLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9PcmlnaW5UeXBlLmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Qb3J0Zm9saW9SZWxhdGlvbnNoaXAuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1BvcnRmb2xpb1JlbGF0aW9uc2hpcFR5cGUuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL1Jpc2tTdW1tYXJ5QW5kQXBwcm92YWwuZW50aXR5LnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2VudGl0aWVzL2luZGV4LnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2Zvcm0va3ljX2FwcHJvdmFsLmZvcm0udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gPT09PSBGb3JtVHlwZSBDb25zdGFudHMgPT09PVxyXG5leHBvcnQgY29uc3QgRk9STV9UWVBFID0ge1xyXG4gICAgVW5kZWZpbmVkOiAwLFxyXG4gICAgQ3JlYXRlOiAxLFxyXG4gICAgVXBkYXRlOiAyLFxyXG4gICAgUmVhZE9ubHk6IDMsXHJcbiAgICBEaXNhYmxlZDogNCxcclxuICAgIFF1aWNrQ3JlYXRlOiA1LFxyXG4gICAgQnVsa0VkaXQ6IDYsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgdHlwZSBGb3JtVHlwZSA9IHR5cGVvZiBGT1JNX1RZUEVba2V5b2YgdHlwZW9mIEZPUk1fVFlQRV07XHJcblxyXG5leHBvcnQgY29uc3QgRm9ybVR5cGVIZWxwZXIgPSB7XHJcbiAgICBnZXQoZmM6IGFueSk6IEZvcm1UeXBlIHwgMCB7XHJcbiAgICAgICAgcmV0dXJuIGZjPy51aT8uZ2V0Rm9ybVR5cGU/LigpID8/IEZPUk1fVFlQRS5VbmRlZmluZWQ7XHJcbiAgICB9LFxyXG4gICAgaXNDcmVhdGVMaWtlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfSxcclxuICAgIGlzRWRpdGFibGUodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuVXBkYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3duZXJSZWYge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiIHwgXCJ0ZWFtXCI7XHJcbiAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBUeXBlcyBzaGFyZWQgYWNyb3NzIGVuZ2luZSAmIGVudGl0aWVzIC0tLS1cclxuZXhwb3J0IHR5cGUgT3BlcmF0b3IgPSBcImVxXCIgfCBcIm5lXCIgfCBcImluXCIgfCBcImlzbnVsbFwiIHwgXCJpc25vdG51bGxcIiB8IFwibm90bnVsbFwiOyAvLyBhbGlhc1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xyXG4gICAgLyoqIExvZ2ljYWwgbmFtZSAoc3VwcG9ydHMgZG90LW5vdGF0aW9uIGZvciBsb29rdXAgcHJvamVjdGlvbnM6IGUuZy4sIFwicHJpbWFyeWNvbnRhY3RpZC5uYW1lXCIpLiAqL1xyXG4gICAgZmllbGQ6IHN0cmluZztcclxuICAgIG9wZXJhdG9yOiBPcGVyYXRvcjtcclxuICAgIC8qKiBPcHRpb25hbCB2YWx1ZSBmb3IgY29tcGFyaXNvbnMgKG9taXR0ZWQgZm9yIG51bGwtb3BlcmF0b3JzKS4gKi9cclxuICAgIHZhbHVlPzogdW5rbm93bjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSdWxlIHtcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk/OiBzdHJpbmdbXTtcclxuICAgIGNvbmRpdGlvbj86IENvbmRpdGlvbltdOyAvLyBBTkQtY29uanVuY3Rpb247IGVtcHR5L3VuZGVmaW5lZCDih5IgcnVsZSBhbHdheXMgbWF0Y2hlc1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNvbmZpZyB7XHJcbiAgICBkZWZhdWx0Pzogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbi8qKiBMaWdodHdlaWdodCBjb21wYXJhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9va3VwICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICBpZDogc3RyaW5nIHwgbnVsbDtcclxuICAgIG5hbWU6IHN0cmluZyB8IG51bGw7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIENvcmUgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5Ycm07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIExvd2VyY2FzZSwgc3RyaXAgYnJhY2VzOyByZXR1cm5zIGVtcHR5IHN0cmluZyBpZiBmYWxzeSBpbnB1dC4gKi9cclxuICAgIHN0YXRpYyBzYW5pdGl6ZUd1aWQoaWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bmlxdWU8VD4oYXJyOiBUW10pOiBUW10ge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVGhpbiBXZWIgQVBJIHdyYXBwZXIgLS0tLVxyXG5leHBvcnQgY2xhc3MgQXBpQ2xpZW50IHtcclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBjbGVhbklkID0gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWUsIGNsZWFuSWQsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hYbWwoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgZmV0Y2hYbWw6IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGA/ZmV0Y2hYbWw9JHtlbmNvZGVVUklDb21wb25lbnQoZmV0Y2hYbWwudHJpbSgpKX1gO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGV4ZWN1dGUocmVxdWVzdDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgcGFyZW50RW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudElkOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRpb25zaGlwU2NoZW1hTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZElkczogc3RyaW5nW11cclxuICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHJlcSA9IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiB7IGVudGl0eVR5cGU6IHBhcmVudEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChwYXJlbnRJZCkgfSxcclxuICAgICAgICAgICAgcmVsYXRlZEVudGl0aWVzOiByZWxhdGVkSWRzLm1hcCgocmlkKSA9PiAoeyBlbnRpdHlUeXBlOiByZWxhdGVkRW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHJpZCkgfSkpLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXA6IHJlbGF0aW9uc2hpcFNjaGVtYU5hbWUsXHJcbiAgICAgICAgICAgIGdldE1ldGFkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBib3VuZFBhcmFtZXRlcjogbnVsbCwgcGFyYW1ldGVyVHlwZXM6IHt9LCBvcGVyYXRpb25UeXBlOiAyLCBvcGVyYXRpb25OYW1lOiBcIkFzc29jaWF0ZVwiIH07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBGb3JtIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgRm9ybUNvbnRyb2xIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldEN1cnJlbnRJZChmYzogYW55KTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWRSYXcgPSBmYz8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJhdyA/IFV0aWwuc2FuaXRpemVHdWlkKGlkUmF3KSA6IG51bGw7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERpc2FibGUgb3IgZW5hYmxlIGFsbCBkaXNhYmxlYWJsZSBjb250cm9scyBpbnNpZGUgYSB0YWIgc2VjdGlvbiAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkQWxsQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2w6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsOiBzcGVjaWFsIGhhbmRsaW5nIGZvciBzdWJncmlkcywgd2hpY2ggZG8gbm90IHN1cHBvcnQgc2V0RGlzYWJsZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAvKiogICBcclxuICAgKiBkZS9hY3RpdmF0ZSBvbmx5IHRoZSBzcGVjaWZpZWQgY29udHJvbHMgKGJ5IG5hbWUpIGluIGEgc2VjdGlvbi4gICBcclxuICAgKiBEb2VzIG5vdGhpbmcgaWYgdGhlIGxpc3QgaXMgZW1wdHkgb3IgY29udHJvbHMgYXJlIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBjb250cm9sTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRyb2xOYW1lcykgfHwgY29udHJvbE5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250cm9sTmFtZXNcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuZmluZENvbnRyb2xJblNlY3Rpb24oc2VjdGlvbiwgbmFtZSkpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGMpOiBjIGlzIFhybS5Db250cm9scy5Db250cm9sID0+IEJvb2xlYW4oYykpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChjb250cm9sKSA9PiBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sLCBkaXNhYmxlZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRDb250cm9sSW5TZWN0aW9uKFxyXG4gICAgICAgIHNlY3Rpb246IFhybS5Db250cm9scy5TZWN0aW9uLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgKTogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIC8vIHByaW1hcnk6IGRpcmVjdCBwZXIgTmFtZVxyXG4gICAgICAgIGNvbnN0IGRpcmVjdCA9IHNlY3Rpb24uY29udHJvbHMuZ2V0Py4obmFtZSk7XHJcbiAgICAgICAgaWYgKGRpcmVjdCkgcmV0dXJuIGRpcmVjdDtcclxuXHJcbiAgICAgICAgLy8gRmFsbGJhY2s6IHNlYXJjaCBieSBnZXROYW1lKCkgb3ZlciB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgIGxldCBmb3VuZDogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjLmdldE5hbWU/LigpID09PSBuYW1lKSBmb3VuZCA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sLCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2UgaWYgZGlmZmVyZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjb250cm9sLmdldERpc2FibGVkPy4oKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSBcImJvb2xlYW5cIiAmJiBjdXJyZW50ID09PSBkaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgLyogbm8tb3AgKi9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdyaWQucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVmlzaWJpbGl0eSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGEgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGRpc2FibGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXREaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgcmVxdWlyZWQgbGV2ZWwgb24gYW4gYXR0cmlidXRlL2NvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF0dHIuc2V0UmVxdWlyZWRMZXZlbChpc1JlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWYoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgcHJlZGljYXRlOiAoKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdyA9ICEhcHJlZGljYXRlKCk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBjb250cm9sTmFtZSwgc2hvdyk7XHJcbiAgICAgICAgcmV0dXJuIHNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZkxvb2t1cEVxdWFscyhmYzogYW55LCBsb29rdXBBdHRyOiBzdHJpbmcsIHRhcmdldElkOiBzdHJpbmcsIGNvbnRyb2xOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gVmlzaWJpbGl0eUhlbHBlci5zaG93SWYoZmMsIGNvbnRyb2xOYW1lLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogVHlwZSBndWFyZDogY29udHJvbCBzdXBwb3J0cyBzZXREaXNhYmxlZCAqL1xyXG4gICAgc3RhdGljIGlzRGlzYWJsZWFibGUoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wpOiBjb250cm9sIGlzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wge1xyXG4gICAgICAgIHJldHVybiBcInNldERpc2FibGVkXCIgaW4gY29udHJvbCAmJiB0eXBlb2YgKGNvbnRyb2wgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCkuc2V0RGlzYWJsZWQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGb3JtV2FpdCB7XHJcbiAgICBzdGF0aWMgd2FpdEZvckxvb2t1cFZhbHVlKGZjOiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgdGltZW91dE1zID0gNjAwMCk6IFByb21pc2U8WHJtLkxvb2t1cFZhbHVlIHwgbnVsbD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFhdHRyKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgIGlmIChub3c/LmlkKSByZXR1cm4gcmVzb2x2ZShub3cpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHsgdHJ5IHsgYXR0ci5yZW1vdmVPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9IH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHY/LmlkKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUodik7IH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7IGF0dHIuYWRkT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KG9uQ2hhbmdlLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBpZiAoIWRvbmUpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZShudWxsKTsgfSB9LCB0aW1lb3V0TXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT3duZXJIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldE93bmVyQXR0cmlidXRlKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIChmYz8uZ2V0QXR0cmlidXRlPy4ob3duZXJBdHRyTmFtZSkgPz8gbnVsbCkgYXMgYW55O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRDdXJyZW50T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogT3duZXJSZWYgfCBudWxsIHtcclxuICAgICAgICBjb25zdCB2ID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk/LmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgIGlmICghdj8uaWQgfHwgIXYuZW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHsgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHYuaWQpLCBlbnRpdHlUeXBlOiB2LmVudGl0eVR5cGUgYXMgYW55LCBuYW1lOiB2Lm5hbWUgPz8gbnVsbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzZXRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcsIG93bmVyOiBPd25lclJlZik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgICAgICBpZiAoIWF0dHIpIHJldHVybjtcclxuICAgICAgICBhdHRyLnNldFZhbHVlKFt7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChvd25lci5pZCksXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IG93bmVyLmVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IG93bmVyLm5hbWUgPz8gdW5kZWZpbmVkXHJcbiAgICAgICAgfSBhcyBhbnldKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaXNTYW1lT3duZXIoYT86IE93bmVyUmVmIHwgbnVsbCwgYj86IE93bmVyUmVmIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBhLmVudGl0eVR5cGUgPT09IGIuZW50aXR5VHlwZSAmJiBVdGlsLnNhbml0aXplR3VpZChhLmlkKSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQoYi5pZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmljIHNlcnZpY2U6IExvYWQgb3duZXIgKFVzZXIgb3IgVGVhbSkgZm9yIGFueSByZWNvcmQgKi9cclxuZXhwb3J0IGNsYXNzIE93bmVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0T3duZXJSZWYoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlY29yZElkOiBzdHJpbmcsXHJcbiAgICAgICAgb3duZXJBdHRyTmFtZSA9IFwib3duZXJpZFwiXHJcbiAgICApOiBQcm9taXNlPE93bmVyUmVmIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocmVjb3JkSWQpO1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyBGb3IgcG9seW1vcnBoaWMgb3duZXIgbG9va3VwcywgZXhwYW5kIGRlZGljYXRlZCBuYXYgcHJvcHMgdG8gYXZvaWQgcHJvcGVydHktbm90LWZvdW5kIGVycm9yc1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZCA9IGA/JHNlbGVjdD0ke293bmVyQXR0ck5hbWV9JiRleHBhbmQ9b3duaW5ndXNlcigkc2VsZWN0PXN5c3RlbXVzZXJpZCxmdWxsbmFtZSksb3duaW5ndGVhbSgkc2VsZWN0PXRlYW1pZCxuYW1lKWA7XHJcbiAgICAgICAgY29uc3QgcmVjID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWwsIGlkLCBleHBhbmQpO1xyXG5cclxuICAgICAgICBjb25zdCB1c2VyID0gcmVjPy5bXCJvd25pbmd1c2VyXCJdO1xyXG4gICAgICAgIGlmICh1c2VyPy5zeXN0ZW11c2VyaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh1c2VyLnN5c3RlbXVzZXJpZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIuZnVsbG5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVhbSA9IHJlYz8uW1wib3duaW5ndGVhbVwiXTtcclxuICAgICAgICBpZiAodGVhbT8udGVhbWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodGVhbS50ZWFtaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJ0ZWFtXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWFtLm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBTZWN1cml0eS1yZWxhdGVkIGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5U2VydmljZSB7XHJcbiAgICAgICAgLyoqIFJldHVybnMgY3VycmVudCB1c2VyIGlkIGZyb20gWHJtIGNvbnRleHQgKi9cclxuICAgICAgICBzdGF0aWMgZ2V0Q3VycmVudFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5Ycm0/LlV0aWxpdHk/LmdldEdsb2JhbENvbnRleHQ/LigpPy51c2VyU2V0dGluZ3M/LnVzZXJJZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJucyByb2xlIG5hbWVzIG9mIHRoZSBjdXJyZW50IHVzZXIgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgZ2V0Q3VycmVudFVzZXJSb2xlcygpOiBQcm9taXNlPHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRDdXJyZW50VXNlcklkKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZCkgcmV0dXJuIFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZldGNoWE1MIG92ZXIgc3lzdGVtdXNlcnJvbGVzIChOOk4pIHRvIHJvbGVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICAgICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJyb2xlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cInJvbGVpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJyb2xlc1wiIGZyb209XCJyb2xlaWRcIiB0bz1cInJvbGVpZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlclwiIGZyb209XCJzeXN0ZW11c2VyaWRcIiB0bz1cInN5c3RlbXVzZXJpZFwiIGFsaWFzPVwidVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHt1c2VySWR9XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LmZldGNoWG1sKFwicm9sZVwiLCBmZXRjaFhtbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHJlcy5lbnRpdGllcyB8fCBbXSkubWFwKChlKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoZVtcInJvbGVpZFwiXSA/PyBlW1wiX3JvbGVpZF92YWx1ZVwiXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVbXCJuYW1lXCJdIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgIH0pKS5maWx0ZXIociA9PiAhIXIuaWQgJiYgISFyLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoZWNrcyBpZiBjdXJyZW50IHVzZXIgaGFzIG9uZSBvZiB0aGUgcHJvdmlkZWQgcm9sZSBuYW1lcyAoY2FzZS1pbnNlbnNpdGl2ZSkgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgaGFzQ3VycmVudFVzZXJSb2xlKC4uLnJvbGVOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdhbnRlZCA9IG5ldyBTZXQocm9sZU5hbWVzLm1hcChuID0+IG4udHJpbSgpLnRvTG93ZXJDYXNlKCkpLmZpbHRlcihCb29sZWFuKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2FudGVkLnNpemUgPT09IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50VXNlclJvbGVzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9sZXMuc29tZShyID0+IHdhbnRlZC5oYXMoci5uYW1lLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGNvbnRyb2wgdmlldyBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFZpZXdIZWxwZXIge1xyXG4gICAgLyoqIFJlc3RyaWN0IGEgbG9va3VwIGNvbnRyb2wgdG8gc3BlY2lmaWMgZW50aXR5IHR5cGVzICovXHJcbiAgICBzdGF0aWMgc2V0RW50aXR5VHlwZXMoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZywgZW50aXR5VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGN0cmw/LnNldEVudGl0eVR5cGVzPy4oZW50aXR5VHlwZXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGQgYSBjdXN0b20gdmlldyB0byBhIGxvb2t1cCBjb250cm9sICovXHJcbiAgICBzdGF0aWMgYWRkQ3VzdG9tVmlldyhcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIGNvbnRyb2xOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZW50aXR5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdEaXNwbGF5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGZldGNoWG1sOiBzdHJpbmcsXHJcbiAgICAgICAgbGF5b3V0WG1sOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0QXNEZWZhdWx0OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghY3RybD8uYWRkQ3VzdG9tVmlldykgcmV0dXJuO1xyXG4gICAgICAgICAgICBjdHJsLmFkZEN1c3RvbVZpZXcodmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLnRyaW0oKSwgbGF5b3V0WG1sLnRyaW0oKSwgc2V0QXNEZWZhdWx0KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkcyBhIGN1c3RvbSB2aWV3IGZvciBvd25lciBsb29rdXAgdG8gc2hvdyBvbmx5IHRlYW1zIHRoZSBjdXJyZW50IHVzZXIgYmVsb25ncyB0by4gKi9cclxuICAgIHN0YXRpYyBhZGRPd25lclRlYW1WaWV3Rm9yQ3VycmVudFVzZXIoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZyA9IFwib3duZXJpZFwiKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZW50aXR5TmFtZSA9IFwidGVhbVwiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdEaXNwbGF5TmFtZSA9IFwiT3duZXJUZWFtTG9va3VwVmlld1wiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJZCA9IFwiezAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMX1cIjtcclxuXHJcbiAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgIDxmZXRjaD5cclxuICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInRlYW1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJidXNpbmVzc3VuaXRpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJuZXZfb3duZXJ0ZWFtMnN5c3RlbXVzZXJcIiBmcm9tPVwidGVhbWlkXCIgdG89XCJ0ZWFtaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXEtdXNlcmlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICA8L2ZldGNoPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxheW91dFhtbCA9IGBcclxuICAgICAgICAgICAgPGdyaWQgbmFtZT0ncmVzdWx0c2V0JyBvYmplY3Q9JzEnIGp1bXA9J3RlYW1pZCcgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cclxuICAgICAgICAgICAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0ndGVhbWlkJz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSduYW1lJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J2J1c2luZXNzdW5pdGlkJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgPC9yb3c+XHJcbiAgICAgICAgICAgIDwvZ3JpZD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLmFkZEN1c3RvbVZpZXcoZmMsIGNvbnRyb2xOYW1lLCB2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwsIGxheW91dFhtbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbn0iLCIvLyBQb3J0Zm9saW8uZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBBQ0NPVU5UID0ge1xyXG4gICAgZW50aXR5OiBcIndybWJfcG9ydGZvbGlvXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb2lkXCIsXHJcbiAgICAgICAgYW1iY3VzdF9sb2NhdGlvbmlkOiBcImFtYmN1c3RfbG9jYXRpb25pZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJpbXBvcnQgdHlwZSB7IEJ1c2luZXNzVW5pdENvbmZpZywgRW50aXR5Q29uZmlnIH0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBCVVNJTkVTU1VOSVRMT0NBVElPTiA9IHtcclxuICAgIGVudGl0eTogXCJhbWJjdXN0X2xvY2F0aW9uXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhbWJjdXN0X2xvY2F0aW9uaWRcIixcclxuICAgICAgICBtYW5kYXRvcnlDb25maWdKc29uOiBcIm1od3JtYl9tYW5kYXRvcnljb25maWdqc29uXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0O1xyXG5cclxuLyoqIFNhZmUgcGFyc2U7IHJldHVybnMgbnVsbCBpZiBpbnZhbGlkLiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VCdXNpbmVzc1VuaXRDb25maWcoanNvblRleHQ6IHN0cmluZyB8IG51bGwpOiBCdXNpbmVzc1VuaXRDb25maWcgfCBudWxsIHtcclxuICAgIGlmICghanNvblRleHQpIHJldHVybiBudWxsO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwYXJzZWQgPSBKU09OLnBhcnNlKGpzb25UZXh0KSBhcyBCdXNpbmVzc1VuaXRDb25maWc7XHJcbiAgICAgICAgaWYgKCFwYXJzZWQgfHwgdHlwZW9mIHBhcnNlZCAhPT0gXCJvYmplY3RcIiB8fCAhcGFyc2VkLmVudGl0aWVzKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4gcGFyc2VkO1xyXG4gICAgfSBjYXRjaCB7XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBDb2xsZWN0IGJhc2UgYXR0cmlidXRlIG5hbWVzIHVzZWQgaW4gY29uZGl0aW9ucyAoZm9yIGF1dG8gT25DaGFuZ2Ugd2lyaW5nKS4gKi9cclxuZXhwb3J0IGZ1bmN0aW9uIGxpc3RDb25kaXRpb25GaWVsZHMoZW50aXR5Q29uZmlnPzogRW50aXR5Q29uZmlnKTogc3RyaW5nW10ge1xyXG4gICAgaWYgKCFlbnRpdHlDb25maWc/LnJ1bGVzPy5sZW5ndGgpIHJldHVybiBbXTtcclxuICAgIGNvbnN0IGZpZWxkcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgZm9yIChjb25zdCByIG9mIGVudGl0eUNvbmZpZy5ydWxlcykge1xyXG4gICAgICAgIGZvciAoY29uc3QgYyBvZiByLmNvbmRpdGlvbiA/PyBbXSkge1xyXG4gICAgICAgICAgICBpZiAoIWMuZmllbGQpIGNvbnRpbnVlO1xyXG4gICAgICAgICAgICAvLyBiaW5kIG9uIHRoZSBiYXNlIGF0dHJpYnV0ZSAoYmVmb3JlIHByb2plY3Rpb24gbGlrZSAubmFtZSlcclxuICAgICAgICAgICAgZmllbGRzLmFkZChjLmZpZWxkLnNwbGl0KFwiLlwiLCAxKVswXSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIEFycmF5LmZyb20oZmllbGRzKTtcclxufSIsIi8vIE9yaWdpblR5cGUuZW50aXR5LnRzXHJcbmV4cG9ydCBjb25zdCBPUklHSU5UWVBFID0ge1xyXG4gICAgZW50aXR5OiBcImFtYmN1c3Rfb3JpZ2ludHlwZVwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIixcclxuICAgICAgICB0eXBlTmFtZUNvZGU6IFwibWh3cm1iX3R5cGVuYW1lY29kZVwiLFxyXG4gICAgfSxcclxuICAgIHZhbHVlczoge1xyXG4gICAgICAgIEFDQ09VTlRfT1BFTklORzogXCJBQ0NPVU5UX09QRU5JTkdcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7XHJcbiIsIi8vIFBvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUCA9IHtcclxuICAgIGVudGl0eTogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcG9ydGZvbGlvSWQ6IFwid3JtYl9wb3J0Zm9saW9pZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1iX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1iX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIHR5cGVJZDogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFBPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUgPSB7XHJcbiAgICBlbnRpdHk6IFwid3JtYl9wb3J0Zm9saW9yZWxhdGlvbnNoaXB0eXBlXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1iX3BvcnRmb2xpb3JlbGF0aW9uc2hpcHR5cGVpZFwiLFxyXG4gICAgICAgIG5hbWU6IFwid3JtYl9uYW1lXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIE5BTUVfUFJJTkNJUEFMOiBcIlByaW5jaXBhbFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gUmlza1N1bW1hcnlBbmRBcHByb3ZhbC5lbnRpdHkudHNcclxuZXhwb3J0IGNvbnN0IFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwgPSB7XHJcbiAgICBlbnRpdHk6IFwid3Jtcl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsXCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJ3cm1yX3Jpc2tzdW1tYXJ5YW5kYXBwcm92YWxpZFwiLFxyXG4gICAgICAgIGNvbnRhY3RJZDogXCJ3cm1yX2NvbnRhY3RpZFwiLFxyXG4gICAgICAgIGNvbXBhbnlJZDogXCJ3cm1yX2NvbXBhbnlpZFwiLFxyXG4gICAgICAgIGFtYmN1c3RPcmlnaW5UeXBlSWQ6IFwiYW1iY3VzdF9vcmlnaW50eXBlaWRcIixcclxuICAgICAgICBzdGF0ZWNvZGU6IFwic3RhdGVjb2RlXCJcclxuICAgIH0sXHJcbiAgICBjb250cm9sczoge1xyXG4gICAgICAgIHN1YmdyaWRBY2NvdW50czogXCJ3cm1fc3ViZ3JpZF9hY2NvdW50c1wiLFxyXG4gICAgfSxcclxuICAgIHJlbGF0aW9uc2hpcHM6IHtcclxuICAgICAgICBwb3J0Zm9saW9zOiB7XHJcbiAgICAgICAgICAgIHNjaGVtYTogXCJtaHdybWJfcmlza3N1bW1hcnlhbmRhcHByb3ZhbDJwb3J0Zm9saW9cIixcclxuICAgICAgICAgICAgbmF2OiBcIm1od3JtYl9yaXNrc3VtbWFyeWFuZGFwcHJvdmFsMnBvcnRmb2xpb1wiLFxyXG4gICAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgdGFiczoge1xyXG4gICAgICAgIE1BSU46IFwiVEFCX01BSU5cIixcclxuICAgICAgICBSRVZJRVc6IFwiVEFCX1JFVklFV1wiLFxyXG4gICAgfSxcclxuICAgIHNlY3Rpb25zOiB7XHJcbiAgICAgICAgQVBQUk9WQUw6IFwiU0VDX0FQUFJPVkFMXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczoge1xyXG4gICAgICAgIC8vIEJlaXNwaWVsOiBTVEFUVVNfQVBQUk9WRUQ6IDEwMDAwMDAwMVxyXG4gICAgfSxcclxufSBhcyBjb25zdDtcclxuIiwiLy8gQmFycmVsIGZpbGUg77+9IGLvv71uZGVsdCBhbGxlIEVudGl0eS1PYmpla3RlXHJcbmV4cG9ydCAqIGZyb20gXCIuL1Jpc2tTdW1tYXJ5QW5kQXBwcm92YWwuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL0FjY291bnQuZW50aXR5XCI7XHJcbmV4cG9ydCAqIGZyb20gXCIuL1BvcnRmb2xpb1JlbGF0aW9uc2hpcC5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vUG9ydGZvbGlvUmVsYXRpb25zaGlwVHlwZS5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vT3JpZ2luVHlwZS5lbnRpdHlcIjtcclxuZXhwb3J0ICogZnJvbSBcIi4vTWFuZGF0b3J5Q29uZmlnLmVudGl0eVwiO1xyXG5leHBvcnQgKiBmcm9tIFwiLi9Db250YWN0LmVudGl0eVwiO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsIi8vIEhpbndlaXM6IEtlaW5lIFRTLU5hbWVzcGFjZXMuIE51ciBkaWUgYmVpZGVuIEhhbmRsZXIgd2VyZGVuIGV4cG9ydGllcnQuXHJcblxyXG5pbXBvcnQge1xyXG4gICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTCxcclxuICAgIEFDQ09VTlQsXHJcbiAgICBQT1JURk9MSU9SRUxBVElPTlNISVAsXHJcbiAgICBQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLFxyXG4gICAgT1JJR0lOVFlQRSxcclxufSBmcm9tIFwiLi4vZW50aXRpZXMvaW5kZXhcIjtcclxuXHJcbmltcG9ydCB7XHJcbiAgICBVdGlsLFxyXG4gICAgQXBpQ2xpZW50LFxyXG4gICAgRm9ybUNvbnRyb2xIZWxwZXIsXHJcbiAgICBHcmlkSGVscGVyLFxyXG4gICAgVmlzaWJpbGl0eUhlbHBlcixcclxuICAgIExvb2t1cERpYWxvZ0hlbHBlcixcclxuICAgIExvb2t1cFNlcnZpY2UsXHJcbn0gZnJvbSBcIi4uL2NvcmUvY3JtLmNvcmVcIjtcclxuXHJcbi8qKlxyXG4gKiBGT1JNIG9uTG9hZFxyXG4gKi9cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uTG9hZChleGVjdXRpb25Db250ZXh0OiBhbnkpIHtcclxuICAgIGNvbnN0IGZjID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dD8uKCkgPz8gZXhlY3V0aW9uQ29udGV4dDtcclxuXHJcbiAgICBpZiAoaXNSZWNvcmRJbmFjdGl2ZShmYykpIHtcclxuICAgICAgICBmYy51aT8uc2V0Rm9ybU5vdGlmaWNhdGlvbj8uKFxyXG4gICAgICAgICAgICBcIlRoaXMgcmVjb3JkIGlzIGluYWN0aXZlLiBBY3Rpb25zIGFyZSBub3QgYXZhaWxhYmxlLlwiLFxyXG4gICAgICAgICAgICBcIldBUk5JTkdcIixcclxuICAgICAgICAgICAgXCJyZWNvcmQtaW5hY3RpdmVcIlxyXG4gICAgICAgICk7XHJcbiAgICAgICAgcmV0dXJuOyAvLyBzdG9wIGZ1cnRoZXIgaW5pdCB3b3JrXHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCB0b2dnbGVBY2NvdW50c1N1YmdyaWRGb3JPcmlnaW5UeXBlKGZjKTtcclxuICAgICAgICAvLyBPbkNoYW5nZS1IYW5kbGVyIGbDvHIgT3JpZ2luVHlwZUlkIGhpbnp1ZsO8Z2VuXHJcbiAgICAgICAgZmMuZ2V0QXR0cmlidXRlPy4oUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuYW1iY3VzdE9yaWdpblR5cGVJZCk/LmFkZE9uQ2hhbmdlKGFzeW5jICgpID0+IHtcclxuICAgICAgICAgICAgYXdhaXQgdG9nZ2xlQWNjb3VudHNTdWJncmlkRm9yT3JpZ2luVHlwZShmYyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGNhdGNoIHtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzLCBmYWxzZSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSaWJib24tQ29tbWFuZDogQWNjb3VudHMgaGluenVmw7xnZW4gKEFzc29jaWF0ZSBpbiBOOk4pXHJcbiAqL1xyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gYWRkQWxsb3dlZEFjY291bnRzKHByaW1hcnlDb250cm9sOiBhbnkpIHtcclxuICAgIGNvbnN0IGZjID0gcHJpbWFyeUNvbnRyb2w7XHJcbiAgICBjb25zdCB4cm0gPSAod2luZG93IGFzIGFueSkuWHJtID8/IFV0aWwuWHJtO1xyXG5cclxuICAgIGlmIChpc1JlY29yZEluYWN0aXZlKGZjKSkge1xyXG4gICAgICAgIGF3YWl0IHhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiUmVjb3JkIGlzIGluYWN0aXZlLlwiIH0pO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjdXJyZW50SWQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRDdXJyZW50SWQoZmMpO1xyXG4gICAgaWYgKCFjdXJyZW50SWQpIHtcclxuICAgICAgICBhd2FpdCB4cm0uTmF2aWdhdGlvbi5vcGVuQWxlcnREaWFsb2coeyB0ZXh0OiBcIlBsZWFzZSBzYXZlIHRoZSByZWNvcmQgZmlyc3QuXCIgfSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGNvbnRhY3RJZCA9IEZvcm1Db250cm9sSGVscGVyLmdldExvb2t1cElkKGZjLCBSSVNLU1VNTUFSWUFOREFQUFJPVkFMLmZpZWxkcy5jb250YWN0SWQpO1xyXG4gICAgY29uc3QgY29tcGFueUlkID0gRm9ybUNvbnRyb2xIZWxwZXIuZ2V0TG9va3VwSWQoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuZmllbGRzLmNvbXBhbnlJZCk7XHJcblxyXG4gICAgaWYgKCFjb250YWN0SWQgJiYgIWNvbXBhbnlJZCkge1xyXG4gICAgICAgIGF3YWl0IHhybS5OYXZpZ2F0aW9uLm9wZW5BbGVydERpYWxvZyh7IHRleHQ6IFwiUGxlYXNlIHNldCBlaXRoZXIgYSBDb250YWN0IG9yIGEgQ29tcGFueSBmaXJzdC5cIiB9KTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjYW5kaWRhdGVJZHMgPSBhd2FpdCBmZXRjaENhbmRpZGF0ZVBvcnRmb2xpb0lkcyhjb250YWN0SWQsIGNvbXBhbnlJZCk7XHJcbiAgICAgICAgaWYgKGNhbmRpZGF0ZUlkcy5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJObyBtYXRjaGluZyBhY2NvdW50cyBmb3VuZCBmb3IgdGhlIHNlbGVjdGVkIENvbnRhY3QvQ29tcGFueS5cIiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3QgYWxyZWFkeUxpbmtlZCA9IGF3YWl0IGdldEFscmVhZHlMaW5rZWRQb3J0Zm9saW9JZHMoY3VycmVudElkKTtcclxuICAgICAgICBjb25zdCBjYW5kaWRhdGVzVG9PZmZlciA9IGNhbmRpZGF0ZUlkcy5maWx0ZXIoaWQgPT4gIWFscmVhZHlMaW5rZWQuaGFzKFV0aWwuc2FuaXRpemVHdWlkKGlkKSkpO1xyXG4gICAgICAgIGlmIChjYW5kaWRhdGVzVG9PZmZlci5sZW5ndGggPT09IDApIHtcclxuICAgICAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkFsZXJ0RGlhbG9nKHsgdGV4dDogXCJBbGwgY2FuZGlkYXRlIGFjY291bnRzIGFyZSBhbHJlYWR5IGxpbmtlZCB0byB0aGlzIHJlY29yZC5cIiB9KTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgY29uc3Qgc2VsZWN0ZWRJZHMgPSBhd2FpdCBvcGVuQ2FuZGlkYXRlUGlja2VyKGZjLCBjYW5kaWRhdGVzVG9PZmZlcik7XHJcbiAgICAgICAgaWYgKHNlbGVjdGVkSWRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBhd2FpdCBhc3NvY2lhdGVTZWxlY3RlZFBvcnRmb2xpb3MoY3VycmVudElkLCBzZWxlY3RlZElkcyk7XHJcblxyXG4gICAgICAgIEdyaWRIZWxwZXIudHJ5UmVmcmVzaFN1YmdyaWQoZmMsIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzKTtcclxuICAgIH0gY2F0Y2ggKGVycjogYW55KSB7XHJcbiAgICAgICAgYXdhaXQgeHJtLk5hdmlnYXRpb24ub3BlbkVycm9yRGlhbG9nPy4oeyBtZXNzYWdlOiBlcnI/Lm1lc3NhZ2UgPz8gU3RyaW5nKGVycikgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gKi9cclxuLyogICAgICAgICAgIGhlbHBlciBmdW5jdGlvbnMgICAgICAgICAqL1xyXG4vKiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tICovXHJcblxyXG4vLyBSZXR1cm5zIHRydWUgaWYgdGhlIGN1cnJlbnQgcmVjb3JkIGlzIGluYWN0aXZlIChzdGF0ZWNvZGUgPSAxKVxyXG5mdW5jdGlvbiBpc1JlY29yZEluYWN0aXZlKGZjOiBhbnkpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHN0YXRlY29kZUF0dHJpYnV0ZSA9IGZjLmdldEF0dHJpYnV0ZT8uKFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuZmllbGRzLnN0YXRlY29kZSk7XHJcbiAgICBjb25zdCB2YWwgPSBzdGF0ZWNvZGVBdHRyaWJ1dGU/LmdldFZhbHVlPy4oKTsgICAgICAgIC8vIG9wdGlvbnNldCBudW1iZXIgKDA9QWN0aXZlLCAxPUluYWN0aXZlKVxyXG4gICAgcmV0dXJuIHZhbCA9PT0gMSB8fCB2YWwgPT09IFwiMVwiOyAgICAgICAgICAgIC8vIGJlIGRlZmVuc2l2ZSBhYm91dCB0eXBlXHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIHRvZ2dsZUFjY291bnRzU3ViZ3JpZEZvck9yaWdpblR5cGUoZmM6IGFueSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgYWNjb3VudE9wZW5pbmdJZCA9IGF3YWl0IGdldEFjY291bnRPcGVuaW5nSWQoKTtcclxuICAgIGlmICghYWNjb3VudE9wZW5pbmdJZCkge1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0VmlzaWJsZShmYywgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5jb250cm9scy5zdWJncmlkQWNjb3VudHMsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgVmlzaWJpbGl0eUhlbHBlci5zaG93SWZMb29rdXBFcXVhbHMoXHJcbiAgICAgICAgZmMsXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5maWVsZHMuYW1iY3VzdE9yaWdpblR5cGVJZCxcclxuICAgICAgICBhY2NvdW50T3BlbmluZ0lkLFxyXG4gICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwuY29udHJvbHMuc3ViZ3JpZEFjY291bnRzXHJcbiAgICApO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRBY2NvdW50T3BlbmluZ0lkKCk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgcmV0dXJuIExvb2t1cFNlcnZpY2UuZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIE9SSUdJTlRZUEUuZW50aXR5LFxyXG4gICAgICAgIE9SSUdJTlRZUEUuZmllbGRzLnBrLFxyXG4gICAgICAgIE9SSUdJTlRZUEUuZmllbGRzLnR5cGVOYW1lQ29kZSxcclxuICAgICAgICBPUklHSU5UWVBFLnZhbHVlcy5BQ0NPVU5UX09QRU5JTkdcclxuICAgICk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGZldGNoQ2FuZGlkYXRlUG9ydGZvbGlvSWRzKGNvbnRhY3RJZD86IHN0cmluZywgY29tcGFueUlkPzogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xyXG4gICAgY29uc3Qgb3JCbG9jayA9IFtcclxuICAgICAgICBjb250YWN0SWRcclxuICAgICAgICAgICAgPyBgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMuY29udGFjdElkfVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIiR7VXRpbC5zYW5pdGl6ZUd1aWQoY29udGFjdElkKX1cIiAvPmBcclxuICAgICAgICAgICAgOiBcIlwiLFxyXG4gICAgICAgIGNvbXBhbnlJZFxyXG4gICAgICAgICAgICA/IGA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5jb21wYW55SWR9XCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHtVdGlsLnNhbml0aXplR3VpZChjb21wYW55SWQpfVwiIC8+YFxyXG4gICAgICAgICAgICA6IFwiXCIsXHJcbiAgICBdXHJcbiAgICAgICAgLmZpbHRlcihCb29sZWFuKVxyXG4gICAgICAgIC5qb2luKFwiXCIpO1xyXG5cclxuICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgPGVudGl0eSBuYW1lPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZW50aXR5fVwiPlxyXG4gICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIiR7UE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5wb3J0Zm9saW9JZH1cIiAvPlxyXG4gICAgICAgIDxmaWx0ZXIgdHlwZT1cImFuZFwiPlxyXG4gICAgICAgICAgPGZpbHRlciB0eXBlPVwib3JcIj5cclxuICAgICAgICAgICAgJHtvckJsb2NrfVxyXG4gICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUuZW50aXR5fVwiXHJcbiAgICAgICAgICAgICAgICAgICAgIGZyb209XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUuZmllbGRzLnBrfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgIHRvPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVAuZmllbGRzLnR5cGVJZH1cIiBhbGlhcz1cInJlbHR5cGVcIj5cclxuICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwiJHtQT1JURk9MSU9SRUxBVElPTlNISVBUWVBFLmZpZWxkcy5uYW1lfVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgb3BlcmF0b3I9XCJlcVwiXHJcbiAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU9XCIke1BPUlRGT0xJT1JFTEFUSU9OU0hJUFRZUEUub3B0aW9ucy5OQU1FX1BSSU5DSVBBTH1cIiAvPlxyXG4gICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgPC9lbnRpdHk+XHJcbiAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgIGNvbnN0IHJlcyA9IGF3YWl0IEFwaUNsaWVudC5mZXRjaFhtbChQT1JURk9MSU9SRUxBVElPTlNISVAuZW50aXR5LCBmZXRjaFhtbCk7XHJcbiAgICBjb25zdCBpZHMgPSBuZXcgU2V0PHN0cmluZz4oKTtcclxuICAgIGZvciAoY29uc3QgZSBvZiByZXMuZW50aXRpZXMpIHtcclxuICAgICAgICBjb25zdCBpZCA9XHJcbiAgICAgICAgICAgIFV0aWwuc2FuaXRpemVHdWlkKChlIGFzIGFueSlbYF8ke1BPUlRGT0xJT1JFTEFUSU9OU0hJUC5maWVsZHMucG9ydGZvbGlvSWR9X3ZhbHVlYF0pIHx8XHJcbiAgICAgICAgICAgIFV0aWwuc2FuaXRpemVHdWlkKChlIGFzIGFueSlbUE9SVEZPTElPUkVMQVRJT05TSElQLmZpZWxkcy5wb3J0Zm9saW9JZF0pO1xyXG4gICAgICAgIGlmIChpZCkgaWRzLmFkZChpZCk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gQXJyYXkuZnJvbShpZHMpO1xyXG59XHJcblxyXG5hc3luYyBmdW5jdGlvbiBnZXRBbHJlYWR5TGlua2VkUG9ydGZvbGlvSWRzKG1haW5JZDogc3RyaW5nKTogUHJvbWlzZTxTZXQ8c3RyaW5nPj4ge1xyXG4gICAgY29uc3QgZXhwYW5kID0gYD8kZXhwYW5kPSR7UklTS1NVTU1BUllBTkRBUFBST1ZBTC5yZWxhdGlvbnNoaXBzLnBvcnRmb2xpb3MubmF2fSgkc2VsZWN0PSR7QUNDT1VOVC5maWVsZHMucGt9KWA7XHJcbiAgICBjb25zdCByZWMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoUklTS1NVTU1BUllBTkRBUFBST1ZBTC5lbnRpdHksIG1haW5JZCwgZXhwYW5kKTtcclxuICAgIGNvbnN0IGxpc3QgPSAocmVjPy5bUklTS1NVTU1BUllBTkRBUFBST1ZBTC5yZWxhdGlvbnNoaXBzLnBvcnRmb2xpb3MubmF2XSB8fCBbXSkgYXMgQXJyYXk8YW55PjtcclxuICAgIHJldHVybiBuZXcgU2V0PHN0cmluZz4obGlzdC5tYXAocm93ID0+IFV0aWwuc2FuaXRpemVHdWlkKHJvd1tBQ0NPVU5ULmZpZWxkcy5wa10pKSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIG9wZW5DYW5kaWRhdGVQaWNrZXIoZmM6IGFueSwgY2FuZGlkYXRlSWRzOiBzdHJpbmdbXSk6IFByb21pc2U8c3RyaW5nW10+IHtcclxuICAgIGZjPy51aT8uc2V0Rm9ybU5vdGlmaWNhdGlvbj8uKFxyXG4gICAgICAgIFwiU2hvd2luZyBhY2NvdW50cyB0aGF0IG1hdGNoIHRoZSBzZWxlY3RlZCBDb250YWN0L0NvbXBhbnkuIEFscmVhZHkgbGlua2VkIGl0ZW1zIGFyZSBoaWRkZW4uXCIsXHJcbiAgICAgICAgXCJJTkZPXCIsXHJcbiAgICAgICAgXCJhY2NvdW50LWZpbHRlci1jb250ZXh0XCJcclxuICAgICk7XHJcblxyXG4gICAgY29uc3Qgc2VsZWN0aW9uID0gYXdhaXQgTG9va3VwRGlhbG9nSGVscGVyLm9wZW5XaXRoSWRMaXN0KFxyXG4gICAgICAgIEFDQ09VTlQuZW50aXR5LFxyXG4gICAgICAgIEFDQ09VTlQuZmllbGRzLnBrLFxyXG4gICAgICAgIGNhbmRpZGF0ZUlkcyxcclxuICAgICAgICB7IGFsbG93TXVsdGlTZWxlY3Q6IHRydWUsIGRpc2FibGVNcnU6IHRydWUgfVxyXG4gICAgKTtcclxuXHJcbiAgICBmYz8udWk/LmNsZWFyRm9ybU5vdGlmaWNhdGlvbj8uKFwiYWNjb3VudC1maWx0ZXItY29udGV4dFwiKTtcclxuXHJcbiAgICBpZiAoIXNlbGVjdGlvbiB8fCBzZWxlY3Rpb24ubGVuZ3RoID09PSAwKSByZXR1cm4gW107XHJcbiAgICByZXR1cm4gVXRpbC51bmlxdWUoc2VsZWN0aW9uLm1hcChzID0+IFV0aWwuc2FuaXRpemVHdWlkKHMuaWQpKSk7XHJcbn1cclxuXHJcbmFzeW5jIGZ1bmN0aW9uIGFzc29jaWF0ZVNlbGVjdGVkUG9ydGZvbGlvcyhtYWluSWQ6IHN0cmluZywgc2VsZWN0ZWRJZHM6IHN0cmluZ1tdKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICBpZiAoIXNlbGVjdGVkSWRzLmxlbmd0aCkgcmV0dXJuO1xyXG4gICAgYXdhaXQgQXBpQ2xpZW50LmFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgUklTS1NVTU1BUllBTkRBUFBST1ZBTC5lbnRpdHksXHJcbiAgICAgICAgbWFpbklkLFxyXG4gICAgICAgIFJJU0tTVU1NQVJZQU5EQVBQUk9WQUwucmVsYXRpb25zaGlwcy5wb3J0Zm9saW9zLnNjaGVtYSxcclxuICAgICAgICBBQ0NPVU5ULmVudGl0eSxcclxuICAgICAgICBzZWxlY3RlZElkc1xyXG4gICAgKTtcclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=