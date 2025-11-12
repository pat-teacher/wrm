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
        complianceStatusAttr === null || complianceStatusAttr === void 0 ? void 0 : complianceStatusAttr.addOnChange(async () => { await applyComplianceOfficerAccess(fc); });
        const handler = () => { applyMutualReadOnlyContactAccount(fc); void ensureOwnerFromContactOrAccountOnCreate(fc); };
        contactAttr === null || contactAttr === void 0 ? void 0 : contactAttr.addOnChange(handler);
        accountAttr === null || accountAttr === void 0 ? void 0 : accountAttr.addOnChange(handler);
    }
    catch { /* ignore */ }
}
/** Enables compliance fields for users with WRM Compliance Officer role */
async function applyComplianceOfficerAccess(fc) {
    var _a, _b;
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
        const statusAttr = (_a = fc.getAttribute) === null || _a === void 0 ? void 0 : _a.call(fc, _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.fields.compliancestatus);
        const statusVal = (_b = statusAttr === null || statusAttr === void 0 ? void 0 : statusAttr.getValue) === null || _b === void 0 ? void 0 : _b.call(statusAttr);
        if (statusVal === _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.options.compliancestatus.PENDING || statusVal === _entities_SourceOfFundEvent_entity__WEBPACK_IMPORTED_MODULE_2__.SOURCEOFFUNDEVENT.options.compliancestatus.REJECTED || statusVal === null) {
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

})();

(window.WRM = window.WRM || {}).sourceoffundevent_form = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic291cmNlb2ZmdW5kZXZlbnRfZm9ybS5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFPLE1BQU0sY0FBYyxHQUFHO0lBQzFCLHNCQUFzQixFQUFFLHdCQUF3QjtDQUMxQyxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRlgsK0JBQStCO0FBQ3hCLE1BQU0sU0FBUyxHQUFHO0lBQ3JCLFNBQVMsRUFBRSxDQUFDO0lBQ1osTUFBTSxFQUFFLENBQUM7SUFDVCxNQUFNLEVBQUUsQ0FBQztJQUNULFFBQVEsRUFBRSxDQUFDO0lBQ1gsUUFBUSxFQUFFLENBQUM7SUFDWCxXQUFXLEVBQUUsQ0FBQztJQUNkLFFBQVEsRUFBRSxDQUFDO0NBQ0wsQ0FBQztBQUlKLE1BQU0sY0FBYyxHQUFHO0lBQzFCLEdBQUcsQ0FBQyxFQUFPOztRQUNQLE9BQU8sb0JBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxFQUFFLDBDQUFFLFdBQVcsa0RBQUksbUNBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQztJQUMxRCxDQUFDO0lBQ0QsWUFBWSxDQUFDLElBQWM7UUFDdkIsT0FBTyxJQUFJLEtBQUssU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUN2RSxDQUFDO0lBQ0QsVUFBVSxDQUFDLElBQWM7UUFDckIsT0FBTyxJQUFJLEtBQUssU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLE1BQU0sSUFBSSxJQUFJLEtBQUssU0FBUyxDQUFDLFdBQVcsQ0FBQztJQUNwRyxDQUFDO0NBQ0osQ0FBQztBQTBDRix5QkFBeUI7QUFDbEIsTUFBTSxJQUFJO0lBQ2IsTUFBTSxLQUFLLEdBQUc7UUFDVixPQUFRLE1BQWMsQ0FBQyxHQUFHLENBQUM7SUFDL0IsQ0FBQztJQUVELG9FQUFvRTtJQUNwRSxNQUFNLENBQUMsWUFBWSxDQUFDLEVBQVc7UUFDM0IsT0FBTyxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3pELENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFJLEdBQVE7UUFDckIsT0FBTyxLQUFLLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEMsQ0FBQztDQUNKO0FBRUQsaUNBQWlDO0FBQzFCLE1BQU0sU0FBUztJQUNsQixNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FBQyxpQkFBeUIsRUFBRSxFQUFVLEVBQUUsT0FBZ0I7UUFDL0UsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUN0QyxPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsY0FBYyxDQUFDLGlCQUFpQixFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyRixDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxpQkFBeUIsRUFBRSxPQUFnQjtRQUNyRSxPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDckYsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLGlCQUF5QixFQUFFLFFBQWdCO1FBQzdELE1BQU0sR0FBRyxHQUFHLGFBQWEsa0JBQWtCLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUMvRCxPQUFPLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsdUJBQXVCLENBQUMsaUJBQWlCLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDakYsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQVk7UUFDN0IsT0FBTyxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDekQsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFLLENBQUMsbUJBQW1CLENBQzVCLG1CQUEyQixFQUMzQixRQUFnQixFQUNoQixzQkFBOEIsRUFDOUIsb0JBQTRCLEVBQzVCLFVBQW9CO1FBRXBCLE1BQU0sR0FBRyxHQUFHO1lBQ1IsTUFBTSxFQUFFLEVBQUUsVUFBVSxFQUFFLG1CQUFtQixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFO1lBQzVFLGVBQWUsRUFBRSxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLG9CQUFvQixFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUM1RyxZQUFZLEVBQUUsc0JBQXNCO1lBQ3BDLFdBQVcsRUFBRTtnQkFDVCxPQUFPLEVBQUUsY0FBYyxFQUFFLElBQUksRUFBRSxjQUFjLEVBQUUsRUFBRSxFQUFFLGFBQWEsRUFBRSxDQUFDLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxDQUFDO1lBQ3RHLENBQUM7U0FDRyxDQUFDO1FBRVQsTUFBTSxRQUFRLEdBQUcsTUFBTSxTQUFTLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLFFBQVEsQ0FBQyxNQUFNLElBQUksUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDdkcsQ0FBQztDQUNKO0FBRUQseUJBQXlCO0FBQ2xCLE1BQU0saUJBQWlCO0lBQzFCLE1BQU0sQ0FBQyxZQUFZLENBQUMsRUFBTzs7UUFDdkIsSUFBSSxDQUFDO1lBQ0QsTUFBTSxLQUFLLEdBQUcsb0JBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxJQUFJLDBDQUFFLE1BQU0sMENBQUUsS0FBSyxrREFBSSxDQUFDO1lBQzFDLE9BQU8sS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDbkQsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNMLE9BQU8sSUFBSSxDQUFDO1FBQ2hCLENBQUM7SUFDTCxDQUFDO0lBRUQsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFPLEVBQUUsU0FBaUI7O1FBQ3pDLE1BQU0sQ0FBQyxHQUFHLG9CQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsWUFBWSxtREFBRyxTQUFTLENBQUMsMENBQUUsUUFBUSxrREFBSSxDQUFDO1FBQ3RELE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDbEUsQ0FBQztJQUVELHNFQUFzRTtJQUN0RSxNQUFNLENBQUMsK0JBQStCLENBQ2xDLEVBQW1CLEVBQ25CLE9BQWUsRUFDZixXQUFtQixFQUNuQixXQUFvQixJQUFJOztRQUV4QixNQUFNLEdBQUcsR0FBRyxvQkFBRSxDQUFDLEVBQUUsMENBQUUsSUFBSSwwQ0FBRSxHQUFHLG1EQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTztRQUNqQixNQUFNLE9BQU8sR0FBRyxlQUFHLENBQUMsUUFBUSwwQ0FBRSxHQUFHLG1EQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUNyQixJQUFJLENBQUM7WUFDRCxPQUFPLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQVksRUFBRSxFQUFFO2dCQUN0QyxJQUFJLGdCQUFnQixDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO29CQUMxQyxJQUFJLENBQUM7d0JBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxRQUFRLENBQUMsQ0FBQztvQkFBQyxDQUFDO29CQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO2dCQUNqRSxDQUFDO2dCQUNELDRFQUE0RTtZQUNoRixDQUFDLENBQUMsQ0FBQztRQUNQLENBQUM7UUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUY7OztNQUdFO0lBQ0QsTUFBTSxDQUFDLGlDQUFpQyxDQUNwQyxFQUFtQixFQUNuQixPQUFlLEVBQ2YsV0FBbUIsRUFDbkIsWUFBK0IsRUFDL0IsV0FBb0IsSUFBSTs7UUFFeEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksWUFBWSxDQUFDLE1BQU0sS0FBSyxDQUFDO1lBQUUsT0FBTztRQUV0RSxNQUFNLEdBQUcsR0FBRyxvQkFBRSxDQUFDLEVBQUUsMENBQUUsSUFBSSwwQ0FBRSxHQUFHLG1EQUFHLE9BQU8sQ0FBQyxDQUFDO1FBQ3hDLElBQUksQ0FBQyxHQUFHO1lBQUUsT0FBTztRQUVqQixNQUFNLE9BQU8sR0FBRyxlQUFHLENBQUMsUUFBUSwwQ0FBRSxHQUFHLG1EQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQ2pELElBQUksQ0FBQyxPQUFPO1lBQUUsT0FBTztRQUVyQixZQUFZO2FBQ1AsR0FBRyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLENBQUM7YUFDcEUsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUE2QixFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3BELE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDekYsQ0FBQztJQUVPLE1BQU0sQ0FBQyxvQkFBb0IsQ0FDL0IsT0FBNkIsRUFDN0IsSUFBWTs7UUFFWiwyQkFBMkI7UUFDM0IsTUFBTSxNQUFNLEdBQUcsbUJBQU8sQ0FBQyxRQUFRLEVBQUMsR0FBRyxtREFBRyxJQUFJLENBQUMsQ0FBQztRQUM1QyxJQUFJLE1BQU07WUFBRSxPQUFPLE1BQU0sQ0FBQztRQUUxQixvREFBb0Q7UUFDcEQsSUFBSSxLQUF1QyxDQUFDO1FBQzVDLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7O1lBQzNCLElBQUksUUFBQyxDQUFDLE9BQU8saURBQUksTUFBSyxJQUFJO2dCQUFFLEtBQUssR0FBRyxDQUFDLENBQUM7UUFDMUMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBRU8sTUFBTSxDQUFDLG9CQUFvQixDQUFDLE9BQTZCLEVBQUUsUUFBaUI7O1FBQ2hGLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDO1lBQUUsT0FBTztRQUNyRCxJQUFJLENBQUM7WUFDRCwyQkFBMkI7WUFDM0IsTUFBTSxPQUFPLEdBQUcsYUFBTyxDQUFDLFdBQVcsdURBQUksQ0FBQztZQUN4QyxJQUFJLE9BQU8sT0FBTyxLQUFLLFNBQVMsSUFBSSxPQUFPLEtBQUssUUFBUTtnQkFBRSxPQUFPO1lBQ2pFLE9BQU8sQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbEMsQ0FBQztRQUFDLE1BQU0sQ0FBQztZQUNMLFdBQVc7UUFDZixDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBRU0sTUFBTSxVQUFVO0lBQ25CLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFPLEVBQUUsSUFBYTs7UUFDM0MsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPO1FBQ2xCLE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxVQUFVLG1EQUFHLElBQUksQ0FBQyxDQUFDO1FBQ3BDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLE9BQU8sRUFBRSxDQUFDO1lBQ2hCLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDbkIsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDTCxZQUFZO1lBQ2hCLENBQUM7UUFDTCxDQUFDO2FBQU0sQ0FBQztZQUNKLElBQUksQ0FBQztnQkFDRCxjQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsRUFBRSwwQ0FBRSxhQUFhLGtEQUFJLENBQUM7WUFDOUIsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDTCxZQUFZO1lBQ2hCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztDQUNKO0FBRUQsK0JBQStCO0FBQ3hCLE1BQU0sZ0JBQWdCO0lBQ3pCLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBTyxFQUFFLFdBQW1CLEVBQUUsT0FBZ0I7O1FBQzVELE1BQU0sSUFBSSxHQUFHLFFBQUUsYUFBRixFQUFFLHVCQUFGLEVBQUUsQ0FBRSxVQUFVLG1EQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQzNDLElBQUksSUFBSSxhQUFKLElBQUksdUJBQUosSUFBSSxDQUFFLFVBQVUsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQzdCLENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxvQ0FBb0M7SUFDcEMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxFQUFPLEVBQUUsV0FBbUIsRUFBRSxRQUFpQjs7UUFDOUQsTUFBTSxJQUFJLEdBQUcsUUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFVBQVUsbURBQUcsV0FBVyxDQUFDLENBQUM7UUFDM0MsSUFBSSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsV0FBVyxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDO2dCQUNELElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0IsQ0FBQztZQUFDLE1BQU0sQ0FBQztnQkFDTCxZQUFZO1lBQ2hCLENBQUM7UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVELGtEQUFrRDtJQUNsRCxNQUFNLENBQUMsV0FBVyxDQUFDLEVBQU8sRUFBRSxXQUFtQixFQUFFLFVBQW1COztRQUNoRSxNQUFNLElBQUksR0FBRyxRQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsWUFBWSxtREFBRyxXQUFXLENBQUMsQ0FBQztRQUM3QyxJQUFJLElBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxnQkFBZ0IsRUFBRSxDQUFDO1lBQ3pCLElBQUksQ0FBQztnQkFDRCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzVELENBQUM7WUFBQyxNQUFNLENBQUM7Z0JBQ0wsWUFBWTtZQUNoQixDQUFDO1FBQ0wsQ0FBQztJQUNMLENBQUM7SUFFRCxNQUFNLENBQUMsTUFBTSxDQUFDLEVBQU8sRUFBRSxXQUFtQixFQUFFLFNBQXdCO1FBQ2hFLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxTQUFTLEVBQUUsQ0FBQztRQUMzQixnQkFBZ0IsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNuRCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBRUQsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQU8sRUFBRSxVQUFrQixFQUFFLFFBQWdCLEVBQUUsV0FBbUI7UUFDeEYsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxHQUFHLEVBQUU7WUFDakQsTUFBTSxPQUFPLEdBQUcsaUJBQWlCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUM5RCxPQUFPLENBQUMsQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ25GLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELCtDQUErQztJQUMvQyxNQUFNLENBQUMsYUFBYSxDQUFDLE9BQTZCO1FBQzlDLE9BQU8sYUFBYSxJQUFJLE9BQU8sSUFBSSxPQUFRLE9BQXdDLENBQUMsV0FBVyxLQUFLLFVBQVUsQ0FBQztJQUNuSCxDQUFDO0NBQ0o7QUFTTSxNQUFNLGtCQUFrQjtJQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLGNBQWMsQ0FDdkIsYUFBcUIsRUFDckIsV0FBbUIsRUFDbkIsR0FBYSxFQUNiLE9BQTRGOztRQUU1RixNQUFNLFFBQVEsR0FBRyxHQUFHO2FBQ2YsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxrQkFBa0IsYUFBYSxNQUFNLElBQUksQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQzthQUNsRixJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFFZCxNQUFNLFNBQVMsR0FBRzs7Z0NBRU0sV0FBVztZQUMvQixRQUFROzs7Z0JBR0osQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVoQixNQUFNLGFBQWEsR0FBUTtZQUN2QixnQkFBZ0IsRUFBRSxhQUFPLGFBQVAsT0FBTyx1QkFBUCxPQUFPLENBQUUsZ0JBQWdCLG1DQUFJLElBQUk7WUFDbkQsaUJBQWlCLEVBQUUsYUFBYTtZQUNoQyxXQUFXLEVBQUUsQ0FBQyxhQUFhLENBQUM7WUFDNUIsT0FBTyxFQUFFLENBQUMsRUFBRSxpQkFBaUIsRUFBRSxhQUFhLEVBQUUsU0FBUyxFQUFFLENBQUM7WUFDMUQsVUFBVSxFQUFFLGFBQU8sYUFBUCxPQUFPLHVCQUFQLE9BQU8sQ0FBRSxVQUFVLG1DQUFJLElBQUk7U0FDMUMsQ0FBQztRQUVGLElBQUksT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFFLGFBQWE7WUFBRSxhQUFhLENBQUMsYUFBYSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUM7UUFFaEYsT0FBTyxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBQyxDQUFtQixDQUFDO0lBQ25GLENBQUM7Q0FDSjtBQUVELHlDQUF5QztBQUNsQyxNQUFNLGFBQWE7SUFDdEIsTUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FDM0IsYUFBcUIsRUFDckIsTUFBYyxFQUNkLFdBQW1COztRQUVuQixNQUFNLE9BQU8sR0FBRyxZQUFZLE1BQU0sWUFBWSxXQUFXLEVBQUUsQ0FBQztRQUM1RCxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUsTUFBTSxHQUFHLEdBQUcsU0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFFLFFBQVEsMENBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0IsTUFBTSxFQUFFLEdBQUcsR0FBRyxhQUFILEdBQUcsdUJBQUgsR0FBRyxDQUFHLE1BQU0sQ0FBdUIsQ0FBQztRQUMvQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO0lBQzdDLENBQUM7SUFFRCxNQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FDeEIsYUFBcUIsRUFDckIsTUFBYyxFQUNkLElBQVksRUFDWixLQUFnQztRQUVoQyxNQUFNLEdBQUcsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pGLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLGFBQWEsRUFBRSxNQUFNLEVBQUUsSUFBSSxJQUFJLE9BQU8sR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNqRixDQUFDO0NBQ0o7QUFFTSxNQUFNLFFBQVE7SUFDakIsTUFBTSxDQUFDLGtCQUFrQixDQUFDLEVBQU8sRUFBRSxhQUFxQixFQUFFLFNBQVMsR0FBRyxJQUFJO1FBQ3RFLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTs7WUFDM0IsTUFBTSxJQUFJLEdBQUcsUUFBRSxhQUFGLEVBQUUsdUJBQUYsRUFBRSxDQUFFLFlBQVksbURBQUcsYUFBYSxDQUErQyxDQUFDO1lBQzdGLElBQUksQ0FBQyxJQUFJO2dCQUFFLE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBRWhDLE1BQU0sR0FBRyxHQUFHLGdCQUFJLENBQUMsUUFBUSxvREFBSSwwQ0FBRyxDQUFDLENBQUMsQ0FBQztZQUNuQyxJQUFJLEdBQUcsYUFBSCxHQUFHLHVCQUFILEdBQUcsQ0FBRSxFQUFFO2dCQUFFLE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBRWpDLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQztZQUNqQixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUM7Z0JBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUFDLENBQUM7WUFBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNFLE1BQU0sUUFBUSxHQUFHLEdBQUcsRUFBRTs7Z0JBQ2xCLElBQUksSUFBSTtvQkFBRSxPQUFPO2dCQUNqQixNQUFNLENBQUMsR0FBRyxnQkFBSSxDQUFDLFFBQVEsb0RBQUksMENBQUcsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pDLElBQUksQ0FBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLEVBQUUsRUFBRSxDQUFDO29CQUFDLElBQUksR0FBRyxJQUFJLENBQUM7b0JBQUMsT0FBTyxFQUFFLENBQUM7b0JBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUFDLENBQUM7WUFDdEQsQ0FBQyxDQUFDO1lBRUYsSUFBSSxDQUFDO2dCQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7WUFBQyxDQUFDO1lBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUM3QyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBRXhCLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztnQkFBQyxPQUFPLEVBQUUsQ0FBQztnQkFBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1FBQzNGLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztDQUNKO0FBRU0sTUFBTSxXQUFXO0lBQ3BCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxFQUFPLEVBQUUsYUFBcUI7O1FBQ25ELE9BQU8sQ0FBQyxjQUFFLGFBQUYsRUFBRSx1QkFBRixFQUFFLENBQUUsWUFBWSxtREFBRyxhQUFhLENBQUMsbUNBQUksSUFBSSxDQUFRLENBQUM7SUFDOUQsQ0FBQztJQUVELE1BQU0sQ0FBQyxlQUFlLENBQUMsRUFBTyxFQUFFLGFBQXFCOztRQUNqRCxNQUFNLENBQUMsR0FBRyxzQkFBSSxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUMsMENBQUUsUUFBUSxrREFBSSwwQ0FBRyxDQUFDLENBQUMsQ0FBQztRQUN2RSxJQUFJLENBQUMsRUFBQyxhQUFELENBQUMsdUJBQUQsQ0FBQyxDQUFFLEVBQUUsS0FBSSxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFDekMsT0FBTyxFQUFFLEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxVQUFVLEVBQUUsQ0FBQyxDQUFDLFVBQWlCLEVBQUUsSUFBSSxFQUFFLE9BQUMsQ0FBQyxJQUFJLG1DQUFJLElBQUksRUFBRSxDQUFDO0lBQ2xHLENBQUM7SUFFRCxNQUFNLENBQUMsUUFBUSxDQUFDLEVBQU8sRUFBRSxhQUFxQixFQUFFLEtBQWU7O1FBQzNELE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDdkQsSUFBSSxDQUFDLElBQUk7WUFBRSxPQUFPO1FBQ2xCLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDWCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDO2dCQUMvQixVQUFVLEVBQUUsS0FBSyxDQUFDLFVBQVU7Z0JBQzVCLElBQUksRUFBRSxXQUFLLENBQUMsSUFBSSxtQ0FBSSxTQUFTO2FBQ3pCLENBQUMsQ0FBQyxDQUFDO0lBQ2YsQ0FBQztJQUVELE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBbUIsRUFBRSxDQUFtQjtRQUN2RCxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUFFLE9BQU8sS0FBSyxDQUFDO1FBQzNCLE9BQU8sQ0FBQyxDQUFDLFVBQVUsS0FBSyxDQUFDLENBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hHLENBQUM7Q0FDSjtBQUVELGdFQUFnRTtBQUN6RCxNQUFNLFlBQVk7SUFDckIsTUFBTSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQ3BCLGFBQXFCLEVBQ3JCLFFBQWdCLEVBQ2hCLGFBQWEsR0FBRyxTQUFTOztRQUV6QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxFQUFFO1lBQUUsT0FBTyxJQUFJLENBQUM7UUFFckIsK0ZBQStGO1FBQy9GLE1BQU0sTUFBTSxHQUFHLFlBQVksYUFBYSxvRkFBb0YsQ0FBQztRQUM3SCxNQUFNLEdBQUcsR0FBRyxNQUFNLFNBQVMsQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztRQUV0RSxNQUFNLElBQUksR0FBRyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUcsWUFBWSxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsWUFBWSxFQUFFLENBQUM7WUFDckIsT0FBTztnQkFDSCxFQUFFLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDO2dCQUN4QyxVQUFVLEVBQUUsWUFBWTtnQkFDeEIsSUFBSSxFQUFFLFVBQUksQ0FBQyxRQUFRLG1DQUFJLElBQUk7YUFDOUIsQ0FBQztRQUNOLENBQUM7UUFDRCxNQUFNLElBQUksR0FBRyxHQUFHLGFBQUgsR0FBRyx1QkFBSCxHQUFHLENBQUcsWUFBWSxDQUFDLENBQUM7UUFDakMsSUFBSSxJQUFJLGFBQUosSUFBSSx1QkFBSixJQUFJLENBQUUsTUFBTSxFQUFFLENBQUM7WUFDZixPQUFPO2dCQUNILEVBQUUsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7Z0JBQ2xDLFVBQVUsRUFBRSxNQUFNO2dCQUNsQixJQUFJLEVBQUUsVUFBSSxDQUFDLElBQUksbUNBQUksSUFBSTthQUMxQixDQUFDO1FBQ04sQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7Q0FDSjtBQUVELCtCQUErQjtBQUN4QixNQUFNLGVBQWU7SUFDcEIsK0NBQStDO0lBQy9DLE1BQU0sQ0FBQyxnQkFBZ0I7O1FBQ2YsSUFBSSxDQUFDO1lBQ0csTUFBTSxFQUFFLEdBQUcsa0NBQUksQ0FBQyxHQUFHLDBDQUFFLE9BQU8sMENBQUUsZ0JBQWdCLGtEQUFJLDBDQUFFLFlBQVksMENBQUUsTUFBNEIsQ0FBQztZQUMvRixPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQ2pELENBQUM7UUFBQyxNQUFNLENBQUM7WUFDRCxPQUFPLElBQUksQ0FBQztRQUNwQixDQUFDO0lBQ1QsQ0FBQztJQUVELDZDQUE2QztJQUM3QyxNQUFNLENBQUMsS0FBSyxDQUFDLG1CQUFtQjtRQUN4QixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTTtZQUFFLE9BQU8sRUFBRSxDQUFDO1FBRXZCLDhDQUE4QztRQUM5QyxNQUFNLFFBQVEsR0FBRzs7Ozs7Ozs7K0ZBUThELE1BQU07Ozs7O3lCQUs1RSxDQUFDLElBQUksRUFBRSxDQUFDO1FBRXJCLE1BQU0sR0FBRyxHQUFHLE1BQU0sU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFDbkQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLElBQUksRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7O1lBQUMsUUFBQztnQkFDaEMsRUFBRSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsT0FBQyxDQUFDLFFBQVEsQ0FBQyxtQ0FBSSxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUM7Z0JBQ3hELElBQUksRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFXO2FBQ2hDLENBQUM7U0FBQSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBRUQsbUZBQW1GO0lBQ25GLE1BQU0sQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsR0FBRyxTQUFtQjtRQUM5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7UUFDbkYsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUM7WUFBRSxPQUFPLEtBQUssQ0FBQztRQUNwQyxNQUFNLEtBQUssR0FBRyxNQUFNLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQy9DLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDakUsQ0FBQztDQUNSO0FBRUQsd0NBQXdDO0FBQ2pDLE1BQU0sZ0JBQWdCO0lBQ3pCLHlEQUF5RDtJQUN6RCxNQUFNLENBQUMsY0FBYyxDQUFDLEVBQW1CLEVBQUUsV0FBbUIsRUFBRSxXQUFxQjs7UUFDakYsSUFBSSxDQUFDO1lBQ0QsTUFBTSxJQUFJLEdBQUcsUUFBRSxDQUFDLFVBQVUsbURBQUcsV0FBVyxDQUEyQyxDQUFDO1lBQ3BGLFVBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxjQUFjLHFEQUFHLFdBQVcsQ0FBQyxDQUFDO1FBQ3hDLENBQUM7UUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsNENBQTRDO0lBQzVDLE1BQU0sQ0FBQyxhQUFhLENBQ2hCLEVBQW1CLEVBQ25CLFdBQW1CLEVBQ25CLE1BQWMsRUFDZCxVQUFrQixFQUNsQixlQUF1QixFQUN2QixRQUFnQixFQUNoQixTQUFpQixFQUNqQixlQUF3QixJQUFJOztRQUU1QixJQUFJLENBQUM7WUFDRCxNQUFNLElBQUksR0FBRyxRQUFFLENBQUMsVUFBVSxtREFBRyxXQUFXLENBQTJDLENBQUM7WUFDcEYsSUFBSSxDQUFDLEtBQUksYUFBSixJQUFJLHVCQUFKLElBQUksQ0FBRSxhQUFhO2dCQUFFLE9BQU87WUFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLFlBQVksQ0FBQyxDQUFDO1FBQzdHLENBQUM7UUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUM1QixDQUFDO0lBRUQsMEZBQTBGO0lBQzFGLE1BQU0sQ0FBQyw4QkFBOEIsQ0FBQyxFQUFtQixFQUFFLGNBQXNCLFNBQVM7UUFDdEYsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDO1FBQzFCLE1BQU0sZUFBZSxHQUFHLHFCQUFxQixDQUFDO1FBQzlDLE1BQU0sTUFBTSxHQUFHLHdDQUF3QyxDQUFDO1FBRXhELE1BQU0sUUFBUSxHQUFHOzs7Ozs7Ozs7Ozs7U0FZaEIsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFHOzs7Ozs7O1NBT2pCLENBQUM7UUFFRixnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsRUFBRSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BILENBQUM7Q0FDSjs7Ozs7Ozs7Ozs7Ozs7O0FDcGlCTSxNQUFNLE9BQU8sR0FBRztJQUNuQixNQUFNLEVBQUUsU0FBUztJQUNqQixNQUFNLEVBQUU7UUFDSixFQUFFLEVBQUUsV0FBVztRQUNmLGdCQUFnQixFQUFFLGtCQUFrQjtRQUNwQyxPQUFPLEVBQUUsU0FBUztLQUNyQjtDQUNLLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ1BKLE1BQU0sT0FBTyxHQUFHO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE1BQU0sRUFBRTtRQUNKLEVBQUUsRUFBRSxXQUFXO1FBQ2Ysa0JBQWtCLEVBQUUsb0JBQW9CO1FBQ3hDLE9BQU8sRUFBRSxTQUFTO0tBQ3JCO0NBQ0ssQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDUEosTUFBTSxpQkFBaUIsR0FBRztJQUM3QixNQUFNLEVBQUUsMEJBQTBCO0lBQ2xDLE1BQU0sRUFBRTtRQUNKLEVBQUUsRUFBRSw0QkFBNEI7UUFDaEMsU0FBUyxFQUFFLGtCQUFrQjtRQUM3QixTQUFTLEVBQUUsa0JBQWtCO1FBQzdCLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLGlCQUFpQixFQUFFLDBCQUEwQjtRQUM3QyxnQkFBZ0IsRUFBRSx5QkFBeUI7UUFDM0MsSUFBSSxFQUFFLGFBQWE7UUFDbkIsT0FBTyxFQUFFLGdCQUFnQjtRQUN6QixXQUFXLEVBQUUsb0JBQW9CO1FBQ2pDLFNBQVMsRUFBRSxrQkFBa0I7UUFDN0Isb0JBQW9CLEVBQUUsNkJBQTZCO1FBQ25ELGdCQUFnQixFQUFFLHlCQUF5QjtRQUMzQyxnQkFBZ0IsRUFBRSx5QkFBeUI7UUFDM0MsYUFBYSxFQUFFLHNCQUFzQjtLQUN4QztJQUNELE9BQU8sRUFBRTtRQUNMLGdCQUFnQixFQUFFO1lBQ2QsT0FBTyxFQUFFLFNBQVM7WUFDbEIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsUUFBUSxFQUFFLFNBQVM7U0FDdEI7S0FDSjtJQUNELElBQUksRUFBRTtRQUNGLE9BQU8sRUFBRSxhQUFhO0tBQ3pCO0lBQ0QsUUFBUSxFQUFFO1FBQ04sMkJBQTJCLEVBQUUsNkJBQTZCO1FBQzFELDBCQUEwQixFQUFFLDRCQUE0QjtRQUN4RCxrQkFBa0IsRUFBRSxvQkFBb0I7S0FDM0M7Q0FDSyxDQUFDOzs7Ozs7O1VDakNYO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0EsRTs7Ozs7V0NQQSx3Rjs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0QsRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDTnVEO0FBQ0Y7QUFDc0I7QUFDZ0c7QUFDcEg7QUFFdkQsSUFBSSxhQUFhLEdBQW9CLElBQUksQ0FBQztBQUVuQyxLQUFLLFVBQVUsTUFBTSxDQUFDLGdCQUF5Qzs7SUFDbEUsTUFBTSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDN0Msc0RBQXNEO0lBQ3RELG9CQUFvQixDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3pCLE1BQU0sNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdkMsTUFBTSx1Q0FBdUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRCxvRkFBb0Y7SUFDcEYsaUNBQWlDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDdEMsSUFBSSxDQUFDO1FBQ0QsTUFBTSxXQUFXLEdBQUcsUUFBRSxDQUFDLFlBQVksbURBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBK0MsQ0FBQztRQUN4SCxNQUFNLFdBQVcsR0FBRyxRQUFFLENBQUMsWUFBWSxtREFBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUErQyxDQUFDO1FBQ3hILE1BQU0sb0JBQW9CLEdBQUcsUUFBRSxDQUFDLFlBQVksbURBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFrRCxDQUFDO1FBQzNJLG9CQUFvQixhQUFwQixvQkFBb0IsdUJBQXBCLG9CQUFvQixDQUFFLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFBRSxHQUFHLE1BQU0sNEJBQTRCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRixNQUFNLE9BQU8sR0FBRyxHQUFHLEVBQUUsR0FBRyxpQ0FBaUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssdUNBQXVDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbkgsV0FBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsQyxXQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFBQyxNQUFNLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUM1QixDQUFDO0FBRUQsMkVBQTJFO0FBQzNFLEtBQUssVUFBVSw0QkFBNEIsQ0FBQyxFQUFtQjs7SUFDM0QsSUFBSSxDQUFDO1FBQ0QsTUFBTSw0Q0FBNEMsR0FBYTtZQUMzRCxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSTtZQUM3QixpRkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTztZQUNoQyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUztZQUNsQyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUztTQUNyQyxDQUFDO1FBQ0YsTUFBTSx5Q0FBeUMsR0FBYTtZQUN4RCxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTztZQUNoQyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsV0FBVztZQUNwQyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUztZQUNsQyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCO1lBQ3pDLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxvQkFBb0I7WUFDN0MsaUZBQWlCLENBQUMsTUFBTSxDQUFDLGdCQUFnQjtZQUN6QyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsYUFBYTtTQUN6QyxDQUFDO1FBQ0YsTUFBTSxtQkFBbUIsR0FBRyxNQUFNLDJEQUFlLENBQUMsa0JBQWtCLENBQUMsK0RBQWMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzVHLHNGQUFzRjtRQUN0RixpRkFBaUIsQ0FBQyxNQUFNLENBQUMsSUFBSTtRQUM3QixJQUFJLG1CQUFtQixFQUFFLENBQUM7WUFDdEIsNkRBQWlCLENBQUMsaUNBQWlDLENBQUMsRUFBRSxFQUFFLGlGQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsaUZBQWlCLENBQUMsUUFBUSxDQUFDLDJCQUEyQixFQUFFLDRDQUE0QyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3JNLDZEQUFpQixDQUFDLGlDQUFpQyxDQUFDLEVBQUUsRUFBRSxpRkFBaUIsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGlGQUFpQixDQUFDLFFBQVEsQ0FBQywwQkFBMEIsRUFBRSx5Q0FBeUMsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUNqTSxPQUFPO1FBQ1gsQ0FBQztRQUVELGdDQUFnQztRQUNoQyw2REFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUUsaUZBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpRkFBaUIsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsNENBQTRDLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDcE0sNkRBQWlCLENBQUMsaUNBQWlDLENBQUMsRUFBRSxFQUFFLGlGQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsaUZBQWlCLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLHlDQUF5QyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRWhNLE1BQU0sVUFBVSxHQUFHLFFBQUUsQ0FBQyxZQUFZLG1EQUFHLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBa0QsQ0FBQztRQUNqSSxNQUFNLFNBQVMsR0FBRyxnQkFBVSxhQUFWLFVBQVUsdUJBQVYsVUFBVSxDQUFFLFFBQVEsMERBQUksQ0FBQztRQUMzQyxJQUFJLFNBQVMsS0FBSyxpRkFBaUIsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxJQUFJLFNBQVMsS0FBSyxpRkFBaUIsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxJQUFJLFNBQVMsS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUM5Siw2REFBaUIsQ0FBQyxpQ0FBaUMsQ0FBQyxFQUFFLEVBQUUsaUZBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxpRkFBaUIsQ0FBQyxRQUFRLENBQUMsMkJBQTJCLEVBQUUsNENBQTRDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDck0sNkRBQWlCLENBQUMsaUNBQWlDLENBQUMsRUFBRSxFQUFFLGlGQUFpQixDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsaUZBQWlCLENBQUMsUUFBUSxDQUFDLDBCQUEwQixFQUFFLHlDQUF5QyxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBQ3JNLENBQUM7SUFDTCxDQUFDO0lBQUMsTUFBTSxDQUFDLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDNUIsQ0FBQztBQUVEOztHQUVHO0FBQ0gsS0FBSyxVQUFVLHVDQUF1QyxDQUFDLEVBQW1CO0lBRXRFLE1BQU0sZUFBZSxHQUFHLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUM7SUFDM0QsTUFBTSxlQUFlLEdBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUMzRCxNQUFNLGFBQWEsR0FBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBRXZELElBQUksQ0FBQyx1REFBVyxDQUFDLGlCQUFpQixDQUFDLEVBQUUsRUFBRSxhQUFhLENBQUM7UUFBRSxPQUFPO0lBRTlELGlGQUFpRjtJQUNqRixNQUFNLENBQUMsZ0JBQWdCLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxNQUFNLE9BQU8sQ0FBQyxHQUFHLENBQUM7UUFDM0Qsb0RBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLEVBQUUsZUFBZSxFQUFFLElBQUksQ0FBQztRQUN0RCxvREFBUSxDQUFDLGtCQUFrQixDQUFDLEVBQUUsRUFBRSxlQUFlLEVBQUUsSUFBSSxDQUFDO0tBQ3pELENBQUMsQ0FBQztJQUNILE1BQU0sYUFBYSxHQUFHLGdCQUFnQixJQUFJLFNBQVMsQ0FBQztJQUNwRCxNQUFNLGFBQWEsR0FBRyxnQkFBZ0IsSUFBSSxTQUFTLENBQUM7SUFFcEQsSUFBSSxhQUFhLEdBQW9CLElBQUksQ0FBQztJQUMxQyxJQUFJLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxFQUFFLEVBQUUsQ0FBQztRQUNwQixhQUFhLEdBQUcsTUFBTSx3REFBWSxDQUFDLFdBQVcsQ0FBQyw2REFBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLDZEQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdHLENBQUM7SUFDRCxJQUFJLENBQUMsYUFBYSxLQUFJLGFBQWEsYUFBYixhQUFhLHVCQUFiLGFBQWEsQ0FBRSxFQUFFLEdBQUUsQ0FBQztRQUN0QyxhQUFhLEdBQUcsTUFBTSx3REFBWSxDQUFDLFdBQVcsQ0FBQyw2REFBTyxDQUFDLE1BQU0sRUFBRSxhQUFhLENBQUMsRUFBRSxFQUFFLDZEQUFPLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdHLENBQUM7SUFFRCxJQUFJLENBQUMsYUFBYTtRQUFFLE9BQU87SUFFM0IsYUFBYSxHQUFHLGFBQWEsQ0FBQztJQUM5QixNQUFNLFlBQVksR0FBRyx1REFBVyxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDcEUsSUFBSSxDQUFDLHVEQUFXLENBQUMsV0FBVyxDQUFDLFlBQVksRUFBRSxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ3hELHVEQUFXLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxhQUFhLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDM0QsQ0FBQztBQUNMLENBQUM7QUFFTSxTQUFTLE1BQU0sQ0FBQyxnQkFBNkM7SUFDaEUsTUFBTSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDN0MsTUFBTSxhQUFhLEdBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUN2RCxJQUFJLENBQUMsYUFBYTtRQUFFLE9BQU87SUFFM0IsTUFBTSxZQUFZLEdBQUcsdURBQVcsQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQ3BFLElBQUksQ0FBQyx1REFBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsYUFBYSxDQUFDLEVBQUUsQ0FBQztRQUN4RCx1REFBVyxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQzNELENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxFQUFtQjtJQUM3QyxJQUFJLENBQUM7UUFDRCw0REFBZ0IsQ0FBQyxjQUFjLENBQUMsRUFBRSxFQUFFLGlGQUFpQixDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLDREQUFnQixDQUFDLDhCQUE4QixDQUFDLEVBQUUsRUFBRSxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDMUYsQ0FBQztJQUFDLE1BQU0sQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQzVCLENBQUM7QUFFRCxnRkFBZ0Y7QUFDekUsU0FBUyxvQkFBb0IsQ0FBQyxnQkFBeUM7SUFDMUUsTUFBTSxFQUFFLEdBQUcsZ0JBQWdCLENBQUMsY0FBYyxFQUFFLENBQUM7SUFDN0Msb0JBQW9CLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsU0FBUyxpQ0FBaUMsQ0FBQyxFQUFtQjs7SUFDMUQsTUFBTSxZQUFZLEdBQUcsaUZBQWlCLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQztJQUN4RCxNQUFNLFlBQVksR0FBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDO0lBRXhELE1BQU0sV0FBVyxHQUFHLFFBQUUsQ0FBQyxZQUFZLG1EQUFHLFlBQVksQ0FBK0MsQ0FBQztJQUNsRyxNQUFNLFdBQVcsR0FBRyxRQUFFLENBQUMsWUFBWSxtREFBRyxZQUFZLENBQStDLENBQUM7SUFFbEcsTUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLDhCQUFXLGFBQVgsV0FBVyx1QkFBWCxXQUFXLENBQUUsUUFBUSwyREFBSSwwQ0FBRyxDQUFDLENBQUMsMENBQUUsRUFBRSxFQUFDO0lBQ3hELE1BQU0sVUFBVSxHQUFHLENBQUMsQ0FBQyw4QkFBVyxhQUFYLFdBQVcsdUJBQVgsV0FBVyxDQUFFLFFBQVEsMkRBQUksMENBQUcsQ0FBQyxDQUFDLDBDQUFFLEVBQUUsRUFBQztJQUV4RCw2REFBNkQ7SUFDN0QsSUFBSSxVQUFVLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUM1Qiw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNyRCw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN0RCxPQUFPO0lBQ1gsQ0FBQztJQUVELElBQUksVUFBVSxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDNUIsNERBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDckQsNERBQWdCLENBQUMsV0FBVyxDQUFDLEVBQUUsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDdEQsT0FBTztJQUNYLENBQUM7SUFFRCw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUN0RCw0REFBZ0IsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztBQUMxRCxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9TZWN1cml0eVJvbGVzLnRzIiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2NvcmUvY3JtLmNvcmUudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQ29tcGFueS5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvQ29udGFjdC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZW50aXRpZXMvU291cmNlT2ZGdW5kRXZlbnQuZW50aXR5LnRzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy9XZWJSZXNvdXJjZXMvc3JjL2Zvcm0vc291cmNlb2ZmdW5kZXZlbnQuZm9ybS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgU0VDVVJJVFlfUk9MRVMgPSB7XHJcbiAgICBXUk1fQ09NUExJQU5DRV9PRkZJQ0VSOiBcIldSTSBDb21wbGlhbmNlIE9mZmljZXJcIixcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIFNlY3VyaXR5Um9sZU5hbWUgPSB0eXBlb2YgU0VDVVJJVFlfUk9MRVNba2V5b2YgdHlwZW9mIFNFQ1VSSVRZX1JPTEVTXTtcclxuIiwiLy8gPT09PSBGb3JtVHlwZSBDb25zdGFudHMgPT09PVxyXG5leHBvcnQgY29uc3QgRk9STV9UWVBFID0ge1xyXG4gICAgVW5kZWZpbmVkOiAwLFxyXG4gICAgQ3JlYXRlOiAxLFxyXG4gICAgVXBkYXRlOiAyLFxyXG4gICAgUmVhZE9ubHk6IDMsXHJcbiAgICBEaXNhYmxlZDogNCxcclxuICAgIFF1aWNrQ3JlYXRlOiA1LFxyXG4gICAgQnVsa0VkaXQ6IDYsXHJcbn0gYXMgY29uc3Q7XHJcblxyXG5leHBvcnQgdHlwZSBGb3JtVHlwZSA9IHR5cGVvZiBGT1JNX1RZUEVba2V5b2YgdHlwZW9mIEZPUk1fVFlQRV07XHJcblxyXG5leHBvcnQgY29uc3QgRm9ybVR5cGVIZWxwZXIgPSB7XHJcbiAgICBnZXQoZmM6IGFueSk6IEZvcm1UeXBlIHwgMCB7XHJcbiAgICAgICAgcmV0dXJuIGZjPy51aT8uZ2V0Rm9ybVR5cGU/LigpID8/IEZPUk1fVFlQRS5VbmRlZmluZWQ7XHJcbiAgICB9LFxyXG4gICAgaXNDcmVhdGVMaWtlKHR5cGU6IEZvcm1UeXBlKSB7XHJcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09IEZPUk1fVFlQRS5DcmVhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfSxcclxuICAgIGlzRWRpdGFibGUodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuVXBkYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5RdWlja0NyZWF0ZTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3duZXJSZWYge1xyXG4gICAgaWQ6IHN0cmluZztcclxuICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiIHwgXCJ0ZWFtXCI7XHJcbiAgICBuYW1lPzogc3RyaW5nIHwgbnVsbDtcclxufVxyXG5cclxuLy8gLS0tLSBUeXBlcyBzaGFyZWQgYWNyb3NzIGVuZ2luZSAmIGVudGl0aWVzIC0tLS1cclxuZXhwb3J0IHR5cGUgT3BlcmF0b3IgPSBcImVxXCIgfCBcIm5lXCIgfCBcImluXCIgfCBcImlzbnVsbFwiIHwgXCJpc25vdG51bGxcIiB8IFwibm90bnVsbFwiOyAvLyBhbGlhc1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBDb25kaXRpb24ge1xyXG4gICAgLyoqIExvZ2ljYWwgbmFtZSAoc3VwcG9ydHMgZG90LW5vdGF0aW9uIGZvciBsb29rdXAgcHJvamVjdGlvbnM6IGUuZy4sIFwicHJpbWFyeWNvbnRhY3RpZC5uYW1lXCIpLiAqL1xyXG4gICAgZmllbGQ6IHN0cmluZztcclxuICAgIG9wZXJhdG9yOiBPcGVyYXRvcjtcclxuICAgIC8qKiBPcHRpb25hbCB2YWx1ZSBmb3IgY29tcGFyaXNvbnMgKG9taXR0ZWQgZm9yIG51bGwtb3BlcmF0b3JzKS4gKi9cclxuICAgIHZhbHVlPzogdW5rbm93bjtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBSdWxlIHtcclxuICAgIG5hbWU/OiBzdHJpbmc7XHJcbiAgICBtYW5kYXRvcnk/OiBzdHJpbmdbXTtcclxuICAgIGNvbmRpdGlvbj86IENvbmRpdGlvbltdOyAvLyBBTkQtY29uanVuY3Rpb247IGVtcHR5L3VuZGVmaW5lZCDih5IgcnVsZSBhbHdheXMgbWF0Y2hlc1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEVudGl0eUNvbmZpZyB7XHJcbiAgICBkZWZhdWx0Pzogc3RyaW5nW107XHJcbiAgICBydWxlcz86IFJ1bGVbXTtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBCdXNpbmVzc1VuaXRDb25maWcge1xyXG4gICAgdmVyc2lvbjogbnVtYmVyO1xyXG4gICAgZW50aXRpZXM6IFJlY29yZDxzdHJpbmcsIEVudGl0eUNvbmZpZz47XHJcbn1cclxuXHJcbi8qKiBMaWdodHdlaWdodCBjb21wYXJhYmxlIHJlcHJlc2VudGF0aW9uIG9mIGEgbG9va3VwICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwQ29tcGFyYWJsZSB7XHJcbiAgICBpZDogc3RyaW5nIHwgbnVsbDtcclxuICAgIG5hbWU6IHN0cmluZyB8IG51bGw7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIENvcmUgaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBVdGlsIHtcclxuICAgIHN0YXRpYyBnZXQgWHJtKCk6IGFueSB7XHJcbiAgICAgICAgcmV0dXJuICh3aW5kb3cgYXMgYW55KS5Ycm07XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIExvd2VyY2FzZSwgc3RyaXAgYnJhY2VzOyByZXR1cm5zIGVtcHR5IHN0cmluZyBpZiBmYWxzeSBpbnB1dC4gKi9cclxuICAgIHN0YXRpYyBzYW5pdGl6ZUd1aWQoaWQ/OiBzdHJpbmcpOiBzdHJpbmcge1xyXG4gICAgICAgIHJldHVybiAoaWQgfHwgXCJcIikucmVwbGFjZSgvW3t9XS9nLCBcIlwiKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyB1bmlxdWU8VD4oYXJyOiBUW10pOiBUW10ge1xyXG4gICAgICAgIHJldHVybiBBcnJheS5mcm9tKG5ldyBTZXQoYXJyKSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVGhpbiBXZWIgQVBJIHdyYXBwZXIgLS0tLVxyXG5leHBvcnQgY2xhc3MgQXBpQ2xpZW50IHtcclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBpZDogc3RyaW5nLCBvcHRpb25zPzogc3RyaW5nKTogUHJvbWlzZTxhbnk+IHtcclxuICAgICAgICBjb25zdCBjbGVhbklkID0gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbE5hbWUsIGNsZWFuSWQsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyByZXRyaWV2ZU11bHRpcGxlKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPHsgZW50aXRpZXM6IGFueVtdIH0+IHtcclxuICAgICAgICByZXR1cm4gYXdhaXQgVXRpbC5Ycm0uV2ViQXBpLnJldHJpZXZlTXVsdGlwbGVSZWNvcmRzKGVudGl0eUxvZ2ljYWxOYW1lLCBvcHRpb25zKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZmV0Y2hYbWwoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgZmV0Y2hYbWw6IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIGNvbnN0IHVybCA9IGA/ZmV0Y2hYbWw9JHtlbmNvZGVVUklDb21wb25lbnQoZmV0Y2hYbWwudHJpbSgpKX1gO1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIHVybCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGV4ZWN1dGUocmVxdWVzdDogYW55KTogUHJvbWlzZTxSZXNwb25zZT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkub25saW5lLmV4ZWN1dGUocmVxdWVzdCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIGFzc29jaWF0ZU1hbnlUb01hbnkoXHJcbiAgICAgICAgcGFyZW50RW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHBhcmVudElkOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRpb25zaGlwU2NoZW1hTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHJlbGF0ZWRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZElkczogc3RyaW5nW11cclxuICAgICk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgICAgIGNvbnN0IHJlcSA9IHtcclxuICAgICAgICAgICAgdGFyZ2V0OiB7IGVudGl0eVR5cGU6IHBhcmVudEVudGl0eUxvZ2ljYWwsIGlkOiBVdGlsLnNhbml0aXplR3VpZChwYXJlbnRJZCkgfSxcclxuICAgICAgICAgICAgcmVsYXRlZEVudGl0aWVzOiByZWxhdGVkSWRzLm1hcCgocmlkKSA9PiAoeyBlbnRpdHlUeXBlOiByZWxhdGVkRW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHJpZCkgfSkpLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXA6IHJlbGF0aW9uc2hpcFNjaGVtYU5hbWUsXHJcbiAgICAgICAgICAgIGdldE1ldGFkYXRhOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4geyBib3VuZFBhcmFtZXRlcjogbnVsbCwgcGFyYW1ldGVyVHlwZXM6IHt9LCBvcGVyYXRpb25UeXBlOiAyLCBvcGVyYXRpb25OYW1lOiBcIkFzc29jaWF0ZVwiIH07XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgfSBhcyBhbnk7XHJcblxyXG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgQXBpQ2xpZW50LmV4ZWN1dGUocmVxKTtcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEFzc29jaWF0aW9uIGZhaWxlZDogJHtyZXNwb25zZS5zdGF0dXN9ICR7cmVzcG9uc2Uuc3RhdHVzVGV4dH1gKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBGb3JtIGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgRm9ybUNvbnRyb2xIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldEN1cnJlbnRJZChmYzogYW55KTogc3RyaW5nIHwgbnVsbCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgaWRSYXcgPSBmYz8uZGF0YT8uZW50aXR5Py5nZXRJZD8uKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBpZFJhdyA/IFV0aWwuc2FuaXRpemVHdWlkKGlkUmF3KSA6IG51bGw7XHJcbiAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgZ2V0TG9va3VwSWQoZmM6IGFueSwgYXR0cmlidXRlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIGNvbnN0IHYgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlKT8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIHJldHVybiB2ICYmIHYubGVuZ3RoID8gVXRpbC5zYW5pdGl6ZUd1aWQodlswXS5pZCkgOiB1bmRlZmluZWQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIERpc2FibGUgb3IgZW5hYmxlIGFsbCBkaXNhYmxlYWJsZSBjb250cm9scyBpbnNpZGUgYSB0YWIgc2VjdGlvbiAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkQWxsQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBkaXNhYmxlZDogYm9vbGVhbiA9IHRydWVcclxuICAgICk6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG4gICAgICAgIGNvbnN0IHNlY3Rpb24gPSB0YWIuc2VjdGlvbnM/LmdldD8uKHNlY3Rpb25OYW1lKTtcclxuICAgICAgICBpZiAoIXNlY3Rpb24pIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGNvbnRyb2w6IGFueSkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKFZpc2liaWxpdHlIZWxwZXIuaXNEaXNhYmxlYWJsZShjb250cm9sKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHRyeSB7IGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpOyB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vIE9wdGlvbmFsOiBzcGVjaWFsIGhhbmRsaW5nIGZvciBzdWJncmlkcywgd2hpY2ggZG8gbm90IHN1cHBvcnQgc2V0RGlzYWJsZWRcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAvKiogICBcclxuICAgKiBkZS9hY3RpdmF0ZSBvbmx5IHRoZSBzcGVjaWZpZWQgY29udHJvbHMgKGJ5IG5hbWUpIGluIGEgc2VjdGlvbi4gICBcclxuICAgKiBEb2VzIG5vdGhpbmcgaWYgdGhlIGxpc3QgaXMgZW1wdHkgb3IgY29udHJvbHMgYXJlIG5vdCBmb3VuZC5cclxuICAgKi9cclxuICAgIHN0YXRpYyBzZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oXHJcbiAgICAgICAgZmM6IFhybS5Gb3JtQ29udGV4dCxcclxuICAgICAgICB0YWJOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgc2VjdGlvbk5hbWU6IHN0cmluZyxcclxuICAgICAgICBjb250cm9sTmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGNvbnRyb2xOYW1lcykgfHwgY29udHJvbE5hbWVzLmxlbmd0aCA9PT0gMCkgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCB0YWIgPSBmYy51aT8udGFicz8uZ2V0Py4odGFiTmFtZSk7XHJcbiAgICAgICAgaWYgKCF0YWIpIHJldHVybjtcclxuXHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb250cm9sTmFtZXNcclxuICAgICAgICAgICAgLm1hcCgobmFtZSkgPT4gRm9ybUNvbnRyb2xIZWxwZXIuZmluZENvbnRyb2xJblNlY3Rpb24oc2VjdGlvbiwgbmFtZSkpXHJcbiAgICAgICAgICAgIC5maWx0ZXIoKGMpOiBjIGlzIFhybS5Db250cm9scy5Db250cm9sID0+IEJvb2xlYW4oYykpXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKChjb250cm9sKSA9PiBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZElmQWxsb3dlZChjb250cm9sLCBkaXNhYmxlZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGZpbmRDb250cm9sSW5TZWN0aW9uKFxyXG4gICAgICAgIHNlY3Rpb246IFhybS5Db250cm9scy5TZWN0aW9uLFxyXG4gICAgICAgIG5hbWU6IHN0cmluZ1xyXG4gICAgKTogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQge1xyXG4gICAgICAgIC8vIHByaW1hcnk6IGRpcmVjdCBwZXIgTmFtZVxyXG4gICAgICAgIGNvbnN0IGRpcmVjdCA9IHNlY3Rpb24uY29udHJvbHMuZ2V0Py4obmFtZSk7XHJcbiAgICAgICAgaWYgKGRpcmVjdCkgcmV0dXJuIGRpcmVjdDtcclxuXHJcbiAgICAgICAgLy8gRmFsbGJhY2s6IHNlYXJjaCBieSBnZXROYW1lKCkgb3ZlciB0aGUgY29sbGVjdGlvblxyXG4gICAgICAgIGxldCBmb3VuZDogWHJtLkNvbnRyb2xzLkNvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgc2VjdGlvbi5jb250cm9scy5mb3JFYWNoKChjKSA9PiB7XHJcbiAgICAgICAgICAgIGlmIChjLmdldE5hbWU/LigpID09PSBuYW1lKSBmb3VuZCA9IGM7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIGZvdW5kO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIHNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2w6IFhybS5Db250cm9scy5Db250cm9sLCBkaXNhYmxlZDogYm9vbGVhbik6IHZvaWQge1xyXG4gICAgICAgIGlmICghVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSByZXR1cm47XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gb25seSBjaGFuZ2UgaWYgZGlmZmVyZW50XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBjb250cm9sLmdldERpc2FibGVkPy4oKTtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50ID09PSBcImJvb2xlYW5cIiAmJiBjdXJyZW50ID09PSBkaXNhYmxlZCkgcmV0dXJuO1xyXG4gICAgICAgICAgICBjb250cm9sLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgLyogbm8tb3AgKi9cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBHcmlkSGVscGVyIHtcclxuICAgIHN0YXRpYyB0cnlSZWZyZXNoU3ViZ3JpZChmYzogYW55LCBuYW1lPzogc3RyaW5nKSB7XHJcbiAgICAgICAgaWYgKCFuYW1lKSByZXR1cm47XHJcbiAgICAgICAgY29uc3QgZ3JpZCA9IGZjPy5nZXRDb250cm9sPy4obmFtZSk7XHJcbiAgICAgICAgaWYgKGdyaWQ/LnJlZnJlc2gpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGdyaWQucmVmcmVzaCgpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGZjPy51aT8ucmVmcmVzaFJpYmJvbj8uKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gVmlzaWJpbGl0eSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFZpc2liaWxpdHlIZWxwZXIge1xyXG4gICAgc3RhdGljIHNldFZpc2libGUoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgdmlzaWJsZTogYm9vbGVhbikge1xyXG4gICAgICAgIGNvbnN0IGN0cmwgPSBmYz8uZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoY3RybD8uc2V0VmlzaWJsZSkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXRWaXNpYmxlKHZpc2libGUpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBFbmFibGVzIG9yIGRpc2FibGVzIGEgY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGRpc2FibGVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXREaXNhYmxlZCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY3RybC5zZXREaXNhYmxlZChkaXNhYmxlZCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIFNldHMgcmVxdWlyZWQgbGV2ZWwgb24gYW4gYXR0cmlidXRlL2NvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBzZXRSZXF1aXJlZChmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBpc1JlcXVpcmVkOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IGZjPy5nZXRBdHRyaWJ1dGU/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGF0dHI/LnNldFJlcXVpcmVkTGV2ZWwpIHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGF0dHIuc2V0UmVxdWlyZWRMZXZlbChpc1JlcXVpcmVkID8gXCJyZXF1aXJlZFwiIDogXCJub25lXCIpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgIC8qIGlnbm9yZSAqL1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzaG93SWYoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgcHJlZGljYXRlOiAoKSA9PiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3Qgc2hvdyA9ICEhcHJlZGljYXRlKCk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXRWaXNpYmxlKGZjLCBjb250cm9sTmFtZSwgc2hvdyk7XHJcbiAgICAgICAgcmV0dXJuIHNob3c7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZkxvb2t1cEVxdWFscyhmYzogYW55LCBsb29rdXBBdHRyOiBzdHJpbmcsIHRhcmdldElkOiBzdHJpbmcsIGNvbnRyb2xOYW1lOiBzdHJpbmcpIHtcclxuICAgICAgICByZXR1cm4gVmlzaWJpbGl0eUhlbHBlci5zaG93SWYoZmMsIGNvbnRyb2xOYW1lLCAoKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnQgPSBGb3JtQ29udHJvbEhlbHBlci5nZXRMb29rdXBJZChmYywgbG9va3VwQXR0cik7XHJcbiAgICAgICAgICAgIHJldHVybiAhIWN1cnJlbnQgJiYgVXRpbC5zYW5pdGl6ZUd1aWQoY3VycmVudCkgPT09IFV0aWwuc2FuaXRpemVHdWlkKHRhcmdldElkKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogVHlwZSBndWFyZDogY29udHJvbCBzdXBwb3J0cyBzZXREaXNhYmxlZCAqL1xyXG4gICAgc3RhdGljIGlzRGlzYWJsZWFibGUoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wpOiBjb250cm9sIGlzIFhybS5Db250cm9scy5TdGFuZGFyZENvbnRyb2wge1xyXG4gICAgICAgIHJldHVybiBcInNldERpc2FibGVkXCIgaW4gY29udHJvbCAmJiB0eXBlb2YgKGNvbnRyb2wgYXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCkuc2V0RGlzYWJsZWQgPT09IFwiZnVuY3Rpb25cIjtcclxuICAgIH0gICAgXHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGRpYWxvZyBoZWxwZXIgLS0tLVxyXG5leHBvcnQgaW50ZXJmYWNlIExvb2t1cFJlc3VsdCB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogc3RyaW5nO1xyXG4gICAgbmFtZT86IHN0cmluZztcclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIExvb2t1cERpYWxvZ0hlbHBlciB7XHJcbiAgICBzdGF0aWMgYXN5bmMgb3BlbldpdGhJZExpc3QoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cmlidXRlOiBzdHJpbmcsXHJcbiAgICAgICAgaWRzOiBzdHJpbmdbXSxcclxuICAgICAgICBvcHRpb25zPzogUGFydGlhbDx7IGFsbG93TXVsdGlTZWxlY3Q6IGJvb2xlYW47IGRpc2FibGVNcnU6IGJvb2xlYW47IGRlZmF1bHRWaWV3SWQ6IHN0cmluZyB9PlxyXG4gICAgKTogUHJvbWlzZTxMb29rdXBSZXN1bHRbXT4ge1xyXG4gICAgICAgIGNvbnN0IGluVmFsdWVzID0gaWRzXHJcbiAgICAgICAgICAgIC5tYXAoKGlkKSA9PiBgPHZhbHVlIHVpdHlwZT1cIiR7ZW50aXR5TG9naWNhbH1cIj57JHtVdGlsLnNhbml0aXplR3VpZChpZCl9fTwvdmFsdWU+YClcclxuICAgICAgICAgICAgLmpvaW4oXCJcIik7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlclhtbCA9IGBcclxuICAgICAgPGZpbHRlciB0eXBlPVwiYW5kXCI+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCIke2lkQXR0cmlidXRlfVwiIG9wZXJhdG9yPVwiaW5cIj5cclxuICAgICAgICAgICR7aW5WYWx1ZXN9XHJcbiAgICAgICAgPC9jb25kaXRpb24+XHJcbiAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzdGF0ZWNvZGVcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIwXCIgLz5cclxuICAgICAgPC9maWx0ZXI+YC50cmltKCk7XHJcblxyXG4gICAgICAgIGNvbnN0IGxvb2t1cE9wdGlvbnM6IGFueSA9IHtcclxuICAgICAgICAgICAgYWxsb3dNdWx0aVNlbGVjdDogb3B0aW9ucz8uYWxsb3dNdWx0aVNlbGVjdCA/PyB0cnVlLFxyXG4gICAgICAgICAgICBkZWZhdWx0RW50aXR5VHlwZTogZW50aXR5TG9naWNhbCxcclxuICAgICAgICAgICAgZW50aXR5VHlwZXM6IFtlbnRpdHlMb2dpY2FsXSxcclxuICAgICAgICAgICAgZmlsdGVyczogW3sgZW50aXR5TG9naWNhbE5hbWU6IGVudGl0eUxvZ2ljYWwsIGZpbHRlclhtbCB9XSxcclxuICAgICAgICAgICAgZGlzYWJsZU1ydTogb3B0aW9ucz8uZGlzYWJsZU1ydSA/PyB0cnVlLFxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zPy5kZWZhdWx0Vmlld0lkKSBsb29rdXBPcHRpb25zLmRlZmF1bHRWaWV3SWQgPSBvcHRpb25zLmRlZmF1bHRWaWV3SWQ7XHJcblxyXG4gICAgICAgIHJldHVybiAoYXdhaXQgVXRpbC5Ycm0uVXRpbGl0eS5sb29rdXBPYmplY3RzKGxvb2t1cE9wdGlvbnMpKSBhcyBMb29rdXBSZXN1bHRbXTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBHZW5lcmljIGxvb2t1cCBPRGF0YSBzZXJ2aWNlIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFNlcnZpY2Uge1xyXG4gICAgc3RhdGljIGFzeW5jIGdldEZpcnN0SWRCeUZpbHRlcihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgb2RhdGFGaWx0ZXI6IHN0cmluZ1xyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IGA/JHNlbGVjdD0ke2lkQXR0cn0mJGZpbHRlcj0ke29kYXRhRmlsdGVyfWA7XHJcbiAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgY29uc3Qgcm93ID0gcmVzPy5lbnRpdGllcz8uWzBdO1xyXG4gICAgICAgIGNvbnN0IGlkID0gcm93Py5baWRBdHRyXSBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0SWRCeUVxdWFsaXR5KFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBhdHRyOiBzdHJpbmcsXHJcbiAgICAgICAgdmFsdWU6IHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW5cclxuICAgICk6IFByb21pc2U8c3RyaW5nIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGxpdCA9IHR5cGVvZiB2YWx1ZSA9PT0gXCJzdHJpbmdcIiA/IGAnJHt2YWx1ZS5yZXBsYWNlKC8nL2csIFwiJydcIil9J2AgOiBTdHJpbmcodmFsdWUpO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmdldEZpcnN0SWRCeUZpbHRlcihlbnRpdHlMb2dpY2FsLCBpZEF0dHIsIGAoJHthdHRyfSBlcSAke2xpdH0pYCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBGb3JtV2FpdCB7XHJcbiAgICBzdGF0aWMgd2FpdEZvckxvb2t1cFZhbHVlKGZjOiBhbnksIGF0dHJpYnV0ZU5hbWU6IHN0cmluZywgdGltZW91dE1zID0gNjAwMCk6IFByb21pc2U8WHJtLkxvb2t1cFZhbHVlIHwgbnVsbD4ge1xyXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGF0dHJpYnV0ZU5hbWUpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFhdHRyKSByZXR1cm4gcmVzb2x2ZShudWxsKTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IG5vdyA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgIGlmIChub3c/LmlkKSByZXR1cm4gcmVzb2x2ZShub3cpO1xyXG5cclxuICAgICAgICAgICAgbGV0IGRvbmUgPSBmYWxzZTtcclxuICAgICAgICAgICAgY29uc3QgY2xlYW51cCA9ICgpID0+IHsgdHJ5IHsgYXR0ci5yZW1vdmVPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9IH07XHJcbiAgICAgICAgICAgIGNvbnN0IG9uQ2hhbmdlID0gKCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSBhdHRyLmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHY/LmlkKSB7IGRvbmUgPSB0cnVlOyBjbGVhbnVwKCk7IHJlc29sdmUodik7IH1cclxuICAgICAgICAgICAgfTtcclxuXHJcbiAgICAgICAgICAgIHRyeSB7IGF0dHIuYWRkT25DaGFuZ2Uob25DaGFuZ2UpOyB9IGNhdGNoIHsgfVxyXG4gICAgICAgICAgICBzZXRUaW1lb3V0KG9uQ2hhbmdlLCAwKTtcclxuXHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4geyBpZiAoIWRvbmUpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZShudWxsKTsgfSB9LCB0aW1lb3V0TXMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgT3duZXJIZWxwZXIge1xyXG4gICAgc3RhdGljIGdldE93bmVyQXR0cmlidXRlKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZyk6IFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgcmV0dXJuIChmYz8uZ2V0QXR0cmlidXRlPy4ob3duZXJBdHRyTmFtZSkgPz8gbnVsbCkgYXMgYW55O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRDdXJyZW50T3duZXIoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogT3duZXJSZWYgfCBudWxsIHtcclxuICAgICAgICBjb25zdCB2ID0gdGhpcy5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSk/LmdldFZhbHVlPy4oKT8uWzBdO1xyXG4gICAgICAgIGlmICghdj8uaWQgfHwgIXYuZW50aXR5VHlwZSkgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgcmV0dXJuIHsgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHYuaWQpLCBlbnRpdHlUeXBlOiB2LmVudGl0eVR5cGUgYXMgYW55LCBuYW1lOiB2Lm5hbWUgPz8gbnVsbCB9O1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBzZXRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcsIG93bmVyOiBPd25lclJlZik6IHZvaWQge1xyXG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKTtcclxuICAgICAgICBpZiAoIWF0dHIpIHJldHVybjtcclxuICAgICAgICBhdHRyLnNldFZhbHVlKFt7XHJcbiAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChvd25lci5pZCksXHJcbiAgICAgICAgICAgIGVudGl0eVR5cGU6IG93bmVyLmVudGl0eVR5cGUsXHJcbiAgICAgICAgICAgIG5hbWU6IG93bmVyLm5hbWUgPz8gdW5kZWZpbmVkXHJcbiAgICAgICAgfSBhcyBhbnldKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgaXNTYW1lT3duZXIoYT86IE93bmVyUmVmIHwgbnVsbCwgYj86IE93bmVyUmVmIHwgbnVsbCk6IGJvb2xlYW4ge1xyXG4gICAgICAgIGlmICghYSB8fCAhYikgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIHJldHVybiBhLmVudGl0eVR5cGUgPT09IGIuZW50aXR5VHlwZSAmJiBVdGlsLnNhbml0aXplR3VpZChhLmlkKSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQoYi5pZCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBHZW5lcmljIHNlcnZpY2U6IExvYWQgb3duZXIgKFVzZXIgb3IgVGVhbSkgZm9yIGFueSByZWNvcmQgKi9cclxuZXhwb3J0IGNsYXNzIE93bmVyU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0T3duZXJSZWYoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIHJlY29yZElkOiBzdHJpbmcsXHJcbiAgICAgICAgb3duZXJBdHRyTmFtZSA9IFwib3duZXJpZFwiXHJcbiAgICApOiBQcm9taXNlPE93bmVyUmVmIHwgbnVsbD4ge1xyXG4gICAgICAgIGNvbnN0IGlkID0gVXRpbC5zYW5pdGl6ZUd1aWQocmVjb3JkSWQpO1xyXG4gICAgICAgIGlmICghaWQpIHJldHVybiBudWxsO1xyXG5cclxuICAgICAgICAvLyBGb3IgcG9seW1vcnBoaWMgb3duZXIgbG9va3VwcywgZXhwYW5kIGRlZGljYXRlZCBuYXYgcHJvcHMgdG8gYXZvaWQgcHJvcGVydHktbm90LWZvdW5kIGVycm9yc1xyXG4gICAgICAgIGNvbnN0IGV4cGFuZCA9IGA/JHNlbGVjdD0ke293bmVyQXR0ck5hbWV9JiRleHBhbmQ9b3duaW5ndXNlcigkc2VsZWN0PXN5c3RlbXVzZXJpZCxmdWxsbmFtZSksb3duaW5ndGVhbSgkc2VsZWN0PXRlYW1pZCxuYW1lKWA7XHJcbiAgICAgICAgY29uc3QgcmVjID0gYXdhaXQgQXBpQ2xpZW50LnJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWwsIGlkLCBleHBhbmQpO1xyXG5cclxuICAgICAgICBjb25zdCB1c2VyID0gcmVjPy5bXCJvd25pbmd1c2VyXCJdO1xyXG4gICAgICAgIGlmICh1c2VyPy5zeXN0ZW11c2VyaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh1c2VyLnN5c3RlbXVzZXJpZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInN5c3RlbXVzZXJcIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHVzZXIuZnVsbG5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgdGVhbSA9IHJlYz8uW1wib3duaW5ndGVhbVwiXTtcclxuICAgICAgICBpZiAodGVhbT8udGVhbWlkKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodGVhbS50ZWFtaWQpLFxyXG4gICAgICAgICAgICAgICAgZW50aXR5VHlwZTogXCJ0ZWFtXCIsXHJcbiAgICAgICAgICAgICAgICBuYW1lOiB0ZWFtLm5hbWUgPz8gbnVsbCxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKiBTZWN1cml0eS1yZWxhdGVkIGhlbHBlcnMgKi9cclxuZXhwb3J0IGNsYXNzIFNlY3VyaXR5U2VydmljZSB7XHJcbiAgICAgICAgLyoqIFJldHVybnMgY3VycmVudCB1c2VyIGlkIGZyb20gWHJtIGNvbnRleHQgKi9cclxuICAgICAgICBzdGF0aWMgZ2V0Q3VycmVudFVzZXJJZCgpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gVXRpbC5Ycm0/LlV0aWxpdHk/LmdldEdsb2JhbENvbnRleHQ/LigpPy51c2VyU2V0dGluZ3M/LnVzZXJJZCBhcyBzdHJpbmcgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBpZCA/IFV0aWwuc2FuaXRpemVHdWlkKGlkKSA6IG51bGw7XHJcbiAgICAgICAgICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogUmV0dXJucyByb2xlIG5hbWVzIG9mIHRoZSBjdXJyZW50IHVzZXIgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgZ2V0Q3VycmVudFVzZXJSb2xlcygpOiBQcm9taXNlPHsgaWQ6IHN0cmluZzsgbmFtZTogc3RyaW5nIH1bXT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdXNlcklkID0gdGhpcy5nZXRDdXJyZW50VXNlcklkKCk7XHJcbiAgICAgICAgICAgICAgICBpZiAoIXVzZXJJZCkgcmV0dXJuIFtdO1xyXG5cclxuICAgICAgICAgICAgICAgIC8vIEZldGNoWE1MIG92ZXIgc3lzdGVtdXNlcnJvbGVzIChOOk4pIHRvIHJvbGVcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZldGNoWG1sID0gYFxyXG4gICAgICAgICAgICAgICAgPGZldGNoIHZlcnNpb249XCIxLjBcIiBkaXN0aW5jdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICA8ZW50aXR5IG5hbWU9XCJyb2xlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cInJvbGVpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cInN5c3RlbXVzZXJyb2xlc1wiIGZyb209XCJyb2xlaWRcIiB0bz1cInJvbGVpZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlclwiIGZyb209XCJzeXN0ZW11c2VyaWRcIiB0bz1cInN5c3RlbXVzZXJpZFwiIGFsaWFzPVwidVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcVwiIHZhbHVlPVwiJHt1c2VySWR9XCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDwvbGluay1lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgICAgICA8L2ZldGNoPmAudHJpbSgpO1xyXG5cclxuICAgICAgICAgICAgY29uc3QgcmVzID0gYXdhaXQgQXBpQ2xpZW50LmZldGNoWG1sKFwicm9sZVwiLCBmZXRjaFhtbCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gKHJlcy5lbnRpdGllcyB8fCBbXSkubWFwKChlKSA9PiAoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZDogVXRpbC5zYW5pdGl6ZUd1aWQoZVtcInJvbGVpZFwiXSA/PyBlW1wiX3JvbGVpZF92YWx1ZVwiXSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IGVbXCJuYW1lXCJdIGFzIHN0cmluZyxcclxuICAgICAgICAgICAgICAgIH0pKS5maWx0ZXIociA9PiAhIXIuaWQgJiYgISFyLm5hbWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLyoqIENoZWNrcyBpZiBjdXJyZW50IHVzZXIgaGFzIG9uZSBvZiB0aGUgcHJvdmlkZWQgcm9sZSBuYW1lcyAoY2FzZS1pbnNlbnNpdGl2ZSkgKi9cclxuICAgICAgICBzdGF0aWMgYXN5bmMgaGFzQ3VycmVudFVzZXJSb2xlKC4uLnJvbGVOYW1lczogc3RyaW5nW10pOiBQcm9taXNlPGJvb2xlYW4+IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHdhbnRlZCA9IG5ldyBTZXQocm9sZU5hbWVzLm1hcChuID0+IG4udHJpbSgpLnRvTG93ZXJDYXNlKCkpLmZpbHRlcihCb29sZWFuKSk7XHJcbiAgICAgICAgICAgICAgICBpZiAod2FudGVkLnNpemUgPT09IDApIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJvbGVzID0gYXdhaXQgdGhpcy5nZXRDdXJyZW50VXNlclJvbGVzKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcm9sZXMuc29tZShyID0+IHdhbnRlZC5oYXMoci5uYW1lLnRvTG93ZXJDYXNlKCkpKTtcclxuICAgICAgICB9XHJcbn1cclxuXHJcbi8vIC0tLS0gTG9va3VwIGNvbnRyb2wgdmlldyBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIExvb2t1cFZpZXdIZWxwZXIge1xyXG4gICAgLyoqIFJlc3RyaWN0IGEgbG9va3VwIGNvbnRyb2wgdG8gc3BlY2lmaWMgZW50aXR5IHR5cGVzICovXHJcbiAgICBzdGF0aWMgc2V0RW50aXR5VHlwZXMoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZywgZW50aXR5VHlwZXM6IHN0cmluZ1tdKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGN0cmw/LnNldEVudGl0eVR5cGVzPy4oZW50aXR5VHlwZXMpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGQgYSBjdXN0b20gdmlldyB0byBhIGxvb2t1cCBjb250cm9sICovXHJcbiAgICBzdGF0aWMgYWRkQ3VzdG9tVmlldyhcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIGNvbnRyb2xOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0lkOiBzdHJpbmcsXHJcbiAgICAgICAgZW50aXR5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIHZpZXdEaXNwbGF5TmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGZldGNoWG1sOiBzdHJpbmcsXHJcbiAgICAgICAgbGF5b3V0WG1sOiBzdHJpbmcsXHJcbiAgICAgICAgc2V0QXNEZWZhdWx0OiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgY29uc3QgY3RybCA9IGZjLmdldENvbnRyb2w/Lihjb250cm9sTmFtZSkgYXMgWHJtLkNvbnRyb2xzLkxvb2t1cENvbnRyb2wgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgIGlmICghY3RybD8uYWRkQ3VzdG9tVmlldykgcmV0dXJuO1xyXG4gICAgICAgICAgICBjdHJsLmFkZEN1c3RvbVZpZXcodmlld0lkLCBlbnRpdHlOYW1lLCB2aWV3RGlzcGxheU5hbWUsIGZldGNoWG1sLnRyaW0oKSwgbGF5b3V0WG1sLnRyaW0oKSwgc2V0QXNEZWZhdWx0KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogQWRkcyBhIGN1c3RvbSB2aWV3IGZvciBvd25lciBsb29rdXAgdG8gc2hvdyBvbmx5IHRlYW1zIHRoZSBjdXJyZW50IHVzZXIgYmVsb25ncyB0by4gKi9cclxuICAgIHN0YXRpYyBhZGRPd25lclRlYW1WaWV3Rm9yQ3VycmVudFVzZXIoZmM6IFhybS5Gb3JtQ29udGV4dCwgY29udHJvbE5hbWU6IHN0cmluZyA9IFwib3duZXJpZFwiKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgZW50aXR5TmFtZSA9IFwidGVhbVwiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdEaXNwbGF5TmFtZSA9IFwiT3duZXJUZWFtTG9va3VwVmlld1wiO1xyXG4gICAgICAgIGNvbnN0IHZpZXdJZCA9IFwiezAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMX1cIjtcclxuXHJcbiAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgIDxmZXRjaD5cclxuICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInRlYW1cIj5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJuYW1lXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8YXR0cmlidXRlIG5hbWU9XCJidXNpbmVzc3VuaXRpZFwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJuZXZfb3duZXJ0ZWFtMnN5c3RlbXVzZXJcIiBmcm9tPVwidGVhbWlkXCIgdG89XCJ0ZWFtaWRcIiBpbnRlcnNlY3Q9XCJ0cnVlXCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxmaWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN5c3RlbXVzZXJpZFwiIG9wZXJhdG9yPVwiZXEtdXNlcmlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9maWx0ZXI+XHJcbiAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZW50aXR5PlxyXG4gICAgICAgICAgICA8L2ZldGNoPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIGNvbnN0IGxheW91dFhtbCA9IGBcclxuICAgICAgICAgICAgPGdyaWQgbmFtZT0ncmVzdWx0c2V0JyBvYmplY3Q9JzEnIGp1bXA9J3RlYW1pZCcgc2VsZWN0PScxJyBpY29uPScxJyBwcmV2aWV3PScxJz5cclxuICAgICAgICAgICAgICAgIDxyb3cgbmFtZT0ncmVzdWx0JyBpZD0ndGVhbWlkJz5cclxuICAgICAgICAgICAgICAgICAgICA8Y2VsbCBuYW1lPSduYW1lJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J2J1c2luZXNzdW5pdGlkJyB3aWR0aD0nMTUwJyAvPlxyXG4gICAgICAgICAgICAgICAgPC9yb3c+XHJcbiAgICAgICAgICAgIDwvZ3JpZD5cclxuICAgICAgICBgO1xyXG5cclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLmFkZEN1c3RvbVZpZXcoZmMsIGNvbnRyb2xOYW1lLCB2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwsIGxheW91dFhtbCwgdHJ1ZSk7XHJcbiAgICB9XHJcbn0iLCJleHBvcnQgY29uc3QgQ09NUEFOWSA9IHtcclxuICAgIGVudGl0eTogXCJhY2NvdW50XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJhY2NvdW50aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0OiBcIm5ldl9idXNpbmVzc3VuaXRcIixcclxuICAgICAgICBvd25lcmlkOiBcIm93bmVyaWRcIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7IiwiZXhwb3J0IGNvbnN0IENPTlRBQ1QgPSB7XHJcbiAgICBlbnRpdHk6IFwiY29udGFjdFwiLFxyXG4gICAgZmllbGRzOiB7XHJcbiAgICAgICAgcGs6IFwiY29udGFjdGlkXCIsXHJcbiAgICAgICAgbmV2X2J1c2luZXNzdW5pdGlkOiBcIm5ldl9idXNpbmVzc3VuaXRpZFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJleHBvcnQgY29uc3QgU09VUkNFT0ZGVU5ERVZFTlQgPSB7XHJcbiAgICBlbnRpdHk6IFwibWh3cm1iX3NvdXJjZW9mZnVuZGV2ZW50XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJtaHdybWJfc291cmNlb2ZmdW5kZXZlbnRpZFwiLFxyXG4gICAgICAgIGNvbnRhY3RpZDogXCJtaHdybWJfY29udGFjdGlkXCIsXHJcbiAgICAgICAgYWNjb3VudGlkOiBcIm1od3JtYl9hY2NvdW50aWRcIixcclxuICAgICAgICBvd25lcmlkOiBcIm93bmVyaWRcIixcclxuICAgICAgICBjb21wbGlhbmNlY29tbWVudDogXCJtaHdybWJfY29tcGxpYW5jZWNvbW1lbnRcIixcclxuICAgICAgICBjb21wbGlhbmNlc3RhdHVzOiBcIm1od3JtYl9jb21wbGlhbmNlc3RhdHVzXCIsXHJcbiAgICAgICAgbmFtZTogXCJtaHdybWJfbmFtZVwiLFxyXG4gICAgICAgIHNvZnR5cGU6IFwibWh3cm1iX3NvZnR5cGVcIixcclxuICAgICAgICBwZXJpb2RzdGFydDogXCJtaHdybWJfcGVyaW9kc3RhcnRcIixcclxuICAgICAgICBwZXJpb2RlbmQ6IFwibWh3cm1iX3BlcmlvZGVuZFwiLFxyXG4gICAgICAgIGVzdGFtb3VudF91c2RfcGVyaW9kOiBcIm1od3JtYl9lc3RhbW91bnRfdXNkX3BlcmlvZFwiLFxyXG4gICAgICAgIGVzdGFtb3VudF91c2RfcGE6IFwibWh3cm1iX2VzdGFtb3VudF91c2RfcGFcIixcclxuICAgICAgICBzaG9ydGRlc2NyaXB0aW9uOiBcIm1od3JtYl9zaG9ydGRlc2NyaXB0aW9uXCIsXHJcbiAgICAgICAgc3VwcG9ydGluZ2RvYzogXCJtaHdybWJfc3VwcG9ydGluZ2RvY1wiLFxyXG4gICAgfSxcclxuICAgIG9wdGlvbnM6IHsgICAgICAgIFxyXG4gICAgICAgIGNvbXBsaWFuY2VzdGF0dXM6IHsgICAgICAgICAgICBcclxuICAgICAgICAgICAgUEVORElORzogNTYwODUwMDAwLCAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBBUFBST1ZFRDogNTYwODUwMDAyLFxyXG4gICAgICAgICAgICBSRUpFQ1RFRDogNTYwODUwMDAzXHJcbiAgICAgICAgfVxyXG4gICAgfSxcclxuICAgIHRhYnM6IHtcclxuICAgICAgICBHRU5FUkFMOiBcImdlbmVyYWxfdGFiXCJcclxuICAgIH0sXHJcbiAgICBzZWN0aW9uczoge1xyXG4gICAgICAgIEdFTkVSQUxfSU5GT1JNQVRJT05fU0VDVElPTjogXCJnZW5lcmFsX2luZm9ybWF0aW9uX3NlY3Rpb25cIixcclxuICAgICAgICBXRUFMVEhfSU5GT1JNQVRJT05fU0VDVElPTjogXCJ3ZWFsdGhfaW5mb3JtYXRpb25fc2VjdGlvblwiLFxyXG4gICAgICAgIENPTVBMSUFOQ0VfU0VDVElPTjogXCJjb21wbGlhbmNlX3NlY3Rpb25cIixcclxuICAgIH0sXHJcbn0gYXMgY29uc3Q7IiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBDT05UQUNUIH0gZnJvbSBcIi4vLi4vZW50aXRpZXMvQ29udGFjdC5lbnRpdHlcIjtcclxuaW1wb3J0IHsgQ09NUEFOWSB9IGZyb20gXCIuLi9lbnRpdGllcy9Db21wYW55LmVudGl0eVwiO1xyXG5pbXBvcnQgeyBTT1VSQ0VPRkZVTkRFVkVOVCB9IGZyb20gXCIuLy4uL2VudGl0aWVzL1NvdXJjZU9mRnVuZEV2ZW50LmVudGl0eVwiO1xyXG5pbXBvcnQgeyBGb3JtV2FpdCwgT3duZXJIZWxwZXIsIE93bmVyUmVmLCBGb3JtVHlwZUhlbHBlciwgU2VjdXJpdHlTZXJ2aWNlLCBGb3JtQ29udHJvbEhlbHBlciwgVmlzaWJpbGl0eUhlbHBlciwgT3duZXJTZXJ2aWNlLCBMb29rdXBWaWV3SGVscGVyIH0gZnJvbSBcIi4vLi4vY29yZS9jcm0uY29yZVwiO1xyXG5pbXBvcnQgeyBTRUNVUklUWV9ST0xFUyB9IGZyb20gXCIuLi9jb3JlL1NlY3VyaXR5Um9sZXNcIjtcclxuXHJcbmxldCBfZGVzaXJlZE93bmVyOiBPd25lclJlZiB8IG51bGwgPSBudWxsO1xyXG5cclxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIG9uTG9hZChleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCkge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICAvLyBDb25maWd1cmUgb3duZXIgbG9va3VwIChhbHNvIHJldXNhYmxlIGZvciBvbkNoYW5nZSlcclxuICAgIGNvbmZpZ3VyZU93bmVyTG9va3VwKGZjKTtcclxuICAgIGF3YWl0IGFwcGx5Q29tcGxpYW5jZU9mZmljZXJBY2Nlc3MoZmMpO1xyXG4gICAgYXdhaXQgZW5zdXJlT3duZXJGcm9tQ29udGFjdE9yQWNjb3VudE9uQ3JlYXRlKGZjKTtcclxuICAgIC8vIEFwcGx5IG11dHVhbCByZWFkLW9ubHkgbG9naWMgYmV0d2VlbiBjb250YWN0IGFuZCBhY2NvdW50IGFuZCB3aXJlIGNoYW5nZSBoYW5kbGVyc1xyXG4gICAgYXBwbHlNdXR1YWxSZWFkT25seUNvbnRhY3RBY2NvdW50KGZjKTtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY29udGFjdEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgYWNjb3VudEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuYWNjb3VudGlkKSBhcyBYcm0uQXR0cmlidXRlcy5Mb29rdXBBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3QgY29tcGxpYW5jZVN0YXR1c0F0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29tcGxpYW5jZXN0YXR1cykgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgIGNvbXBsaWFuY2VTdGF0dXNBdHRyPy5hZGRPbkNoYW5nZShhc3luYyAoKSA9PiB7IGF3YWl0IGFwcGx5Q29tcGxpYW5jZU9mZmljZXJBY2Nlc3MoZmMpOyB9KTtcclxuICAgICAgICBjb25zdCBoYW5kbGVyID0gKCkgPT4geyBhcHBseU11dHVhbFJlYWRPbmx5Q29udGFjdEFjY291bnQoZmMpOyB2b2lkIGVuc3VyZU93bmVyRnJvbUNvbnRhY3RPckFjY291bnRPbkNyZWF0ZShmYyk7IH07XHJcbiAgICAgICAgY29udGFjdEF0dHI/LmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgICAgIGFjY291bnRBdHRyPy5hZGRPbkNoYW5nZShoYW5kbGVyKTtcclxuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG59XHJcblxyXG4vKiogRW5hYmxlcyBjb21wbGlhbmNlIGZpZWxkcyBmb3IgdXNlcnMgd2l0aCBXUk0gQ29tcGxpYW5jZSBPZmZpY2VyIHJvbGUgKi9cclxuYXN5bmMgZnVuY3Rpb24gYXBwbHlDb21wbGlhbmNlT2ZmaWNlckFjY2VzcyhmYzogWHJtLkZvcm1Db250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2xzVG9EaXNhYmxlSW5HZW5lcmFsSW5mb3JtYXRpb25TZWN0aW9uOiBzdHJpbmdbXSA9IFtcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm5hbWUsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5vd25lcmlkLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuYWNjb3VudGlkXHJcbiAgICAgICAgXTtcclxuICAgICAgICBjb25zdCBjb250cm9sc1RvRGlzYWJsZVdlYWx0aEluZm9ybWF0aW9uU2VjdGlvbjogc3RyaW5nW10gPSBbXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5zb2Z0eXBlLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMucGVyaW9kc3RhcnQsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5wZXJpb2RlbmQsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5lc3RhbW91bnRfdXNkX3BhLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuZXN0YW1vdW50X3VzZF9wZXJpb2QsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5zaG9ydGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuc3VwcG9ydGluZ2RvY1xyXG4gICAgICAgIF07XHJcbiAgICAgICAgY29uc3QgaXNDb21wbGlhbmNlT2ZmaWNlciA9IGF3YWl0IFNlY3VyaXR5U2VydmljZS5oYXNDdXJyZW50VXNlclJvbGUoU0VDVVJJVFlfUk9MRVMuV1JNX0NPTVBMSUFOQ0VfT0ZGSUNFUik7XHJcbiAgICAgICAgLy8gQ29tcGxpYW5jZSBPZmZpY2VyOiBhbHdheXMgZW5hYmxlZCAoZmllbGQtbGV2ZWwgc2VjdXJpdHkgZ292ZXJucyBhY3R1YWwgcGVybWlzc2lvbilcclxuICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMubmFtZVxyXG4gICAgICAgIGlmIChpc0NvbXBsaWFuY2VPZmZpY2VyKSB7XHJcbiAgICAgICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5HRU5FUkFMX0lORk9STUFUSU9OX1NFQ1RJT04sIGNvbnRyb2xzVG9EaXNhYmxlSW5HZW5lcmFsSW5mb3JtYXRpb25TZWN0aW9uLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5XRUFMVEhfSU5GT1JNQVRJT05fU0VDVElPTiwgY29udHJvbHNUb0Rpc2FibGVXZWFsdGhJbmZvcm1hdGlvblNlY3Rpb24sIGZhbHNlKTsgICAgICAgICAgICBcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gTm9uIE9mZmljZXI6IGRlZmF1bHQgZGlzYWJsZWRcclxuICAgICAgICBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oZmMsIFNPVVJDRU9GRlVOREVWRU5ULnRhYnMuR0VORVJBTCwgU09VUkNFT0ZGVU5ERVZFTlQuc2VjdGlvbnMuR0VORVJBTF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZUluR2VuZXJhbEluZm9ybWF0aW9uU2VjdGlvbiwgdHJ1ZSk7XHJcbiAgICAgICAgRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC50YWJzLkdFTkVSQUwsIFNPVVJDRU9GRlVOREVWRU5ULnNlY3Rpb25zLldFQUxUSF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZVdlYWx0aEluZm9ybWF0aW9uU2VjdGlvbiwgdHJ1ZSk7ICAgICAgICBcclxuXHJcbiAgICAgICAgY29uc3Qgc3RhdHVzQXR0ciA9IGZjLmdldEF0dHJpYnV0ZT8uKFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5jb21wbGlhbmNlc3RhdHVzKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29uc3Qgc3RhdHVzVmFsID0gc3RhdHVzQXR0cj8uZ2V0VmFsdWU/LigpO1xyXG4gICAgICAgIGlmIChzdGF0dXNWYWwgPT09IFNPVVJDRU9GRlVOREVWRU5ULm9wdGlvbnMuY29tcGxpYW5jZXN0YXR1cy5QRU5ESU5HIHx8IHN0YXR1c1ZhbCA9PT0gU09VUkNFT0ZGVU5ERVZFTlQub3B0aW9ucy5jb21wbGlhbmNlc3RhdHVzLlJFSkVDVEVEIHx8IHN0YXR1c1ZhbCA9PT0gbnVsbCkge1xyXG4gICAgICAgICAgICBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oZmMsIFNPVVJDRU9GRlVOREVWRU5ULnRhYnMuR0VORVJBTCwgU09VUkNFT0ZGVU5ERVZFTlQuc2VjdGlvbnMuR0VORVJBTF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZUluR2VuZXJhbEluZm9ybWF0aW9uU2VjdGlvbiwgZmFsc2UpO1xyXG4gICAgICAgICAgICBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oZmMsIFNPVVJDRU9GRlVOREVWRU5ULnRhYnMuR0VORVJBTCwgU09VUkNFT0ZGVU5ERVZFTlQuc2VjdGlvbnMuV0VBTFRIX0lORk9STUFUSU9OX1NFQ1RJT04sIGNvbnRyb2xzVG9EaXNhYmxlV2VhbHRoSW5mb3JtYXRpb25TZWN0aW9uLCBmYWxzZSk7ICAgICAgICAgICAgXHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBPbiBjcmVhdGUtbGlrZSBmb3Jtcywgc2V0IG93bmVyIHRvIHRoZSBjb250YWN0J3Mgb3duZXI7IGlmIG5vdCBhdmFpbGFibGUsIGZhbGxiYWNrIHRvIHRoZSBhY2NvdW50J3Mgb3duZXIuXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBlbnN1cmVPd25lckZyb21Db250YWN0T3JBY2NvdW50T25DcmVhdGUoZmM6IFhybS5Gb3JtQ29udGV4dCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgXHJcbiAgICBjb25zdCBjb250YWN0QXR0ck5hbWUgPSBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkO1xyXG4gICAgY29uc3QgYWNjb3VudEF0dHJOYW1lID0gU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLmFjY291bnRpZDtcclxuICAgIGNvbnN0IG93bmVyQXR0ck5hbWUgPSBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMub3duZXJpZDtcclxuXHJcbiAgICBpZiAoIU93bmVySGVscGVyLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKSkgcmV0dXJuO1xyXG5cclxuICAgIC8vIFBhcmFsbGVsIHdhaXQgZm9yIGJvdGggbG9va3VwcyAoY29udGFjdCBwcmlvcml0aXplZCkuIEFjY291bnQgdGltZW91dCBzaG9ydGVyLlxyXG4gICAgY29uc3QgW2NvbnRhY3RMb29rdXBSYXcsIGFjY291bnRMb29rdXBSYXddID0gYXdhaXQgUHJvbWlzZS5hbGwoW1xyXG4gICAgICAgIEZvcm1XYWl0LndhaXRGb3JMb29rdXBWYWx1ZShmYywgY29udGFjdEF0dHJOYW1lLCA0MDAwKSxcclxuICAgICAgICBGb3JtV2FpdC53YWl0Rm9yTG9va3VwVmFsdWUoZmMsIGFjY291bnRBdHRyTmFtZSwgMjUwMClcclxuICAgIF0pO1xyXG4gICAgY29uc3QgY29udGFjdExvb2t1cCA9IGNvbnRhY3RMb29rdXBSYXcgfHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgYWNjb3VudExvb2t1cCA9IGFjY291bnRMb29rdXBSYXcgfHwgdW5kZWZpbmVkO1xyXG5cclxuICAgIGxldCByZXNvbHZlZE93bmVyOiBPd25lclJlZiB8IG51bGwgPSBudWxsO1xyXG4gICAgaWYgKGNvbnRhY3RMb29rdXA/LmlkKSB7XHJcbiAgICAgICAgcmVzb2x2ZWRPd25lciA9IGF3YWl0IE93bmVyU2VydmljZS5nZXRPd25lclJlZihDT05UQUNULmVudGl0eSwgY29udGFjdExvb2t1cC5pZCwgQ09OVEFDVC5maWVsZHMub3duZXJpZCk7XHJcbiAgICB9XHJcbiAgICBpZiAoIXJlc29sdmVkT3duZXIgJiYgYWNjb3VudExvb2t1cD8uaWQpIHtcclxuICAgICAgICByZXNvbHZlZE93bmVyID0gYXdhaXQgT3duZXJTZXJ2aWNlLmdldE93bmVyUmVmKENPTVBBTlkuZW50aXR5LCBhY2NvdW50TG9va3VwLmlkLCBDT01QQU5ZLmZpZWxkcy5vd25lcmlkKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoIXJlc29sdmVkT3duZXIpIHJldHVybjtcclxuXHJcbiAgICBfZGVzaXJlZE93bmVyID0gcmVzb2x2ZWRPd25lcjtcclxuICAgIGNvbnN0IGN1cnJlbnRPd25lciA9IE93bmVySGVscGVyLmdldEN1cnJlbnRPd25lcihmYywgb3duZXJBdHRyTmFtZSk7XHJcbiAgICBpZiAoIU93bmVySGVscGVyLmlzU2FtZU93bmVyKGN1cnJlbnRPd25lciwgcmVzb2x2ZWRPd25lcikpIHtcclxuICAgICAgICBPd25lckhlbHBlci5zZXRPd25lcihmYywgb3duZXJBdHRyTmFtZSwgcmVzb2x2ZWRPd25lcik7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBvblNhdmUoZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5TYXZlRXZlbnRDb250ZXh0KSB7XHJcbiAgICBjb25zdCBmYyA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgIGNvbnN0IG93bmVyQXR0ck5hbWUgPSBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMub3duZXJpZDtcclxuICAgIGlmICghX2Rlc2lyZWRPd25lcikgcmV0dXJuO1xyXG5cclxuICAgIGNvbnN0IGN1cnJlbnRPd25lciA9IE93bmVySGVscGVyLmdldEN1cnJlbnRPd25lcihmYywgb3duZXJBdHRyTmFtZSk7XHJcbiAgICBpZiAoIU93bmVySGVscGVyLmlzU2FtZU93bmVyKGN1cnJlbnRPd25lciwgX2Rlc2lyZWRPd25lcikpIHtcclxuICAgICAgICBPd25lckhlbHBlci5zZXRPd25lcihmYywgb3duZXJBdHRyTmFtZSwgX2Rlc2lyZWRPd25lcik7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBDb25maWd1cmUgb3duZXIgbG9va3VwIHRvIHNob3cgb25seSBUZWFtcyBhbmQgZGVmYXVsdCB0byBjdXJyZW50IHVzZXIncyB0ZWFtcy5cclxuICogQ2FuIGJlIHJldXNlZCBmcm9tIG9uTG9hZCBhbmQgZnJvbSBmaWVsZCBvbkNoYW5nZSBoYW5kbGVycyBpZiBuZWVkZWQuXHJcbiAqL1xyXG5mdW5jdGlvbiBjb25maWd1cmVPd25lckxvb2t1cChmYzogWHJtLkZvcm1Db250ZXh0KTogdm9pZCB7XHJcbiAgICB0cnkge1xyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuc2V0RW50aXR5VHlwZXMoZmMsIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5vd25lcmlkLCBbXCJ0ZWFtXCJdKTtcclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLmFkZE93bmVyVGVhbVZpZXdGb3JDdXJyZW50VXNlcihmYywgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm93bmVyaWQpO1xyXG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbn1cclxuXHJcbi8qKiBPcHRpb25hbCBleHBvcnRlZCBvbkNoYW5nZSBoYW5kbGVyIHRvIHJlLWFwcGx5IG93bmVyIGxvb2t1cCBjb25maWd1cmF0aW9uICovXHJcbmV4cG9ydCBmdW5jdGlvbiBvbk93bmVyTG9va3VwUmVmcmVzaChleGVjdXRpb25Db250ZXh0OiBYcm0uRXZlbnRzLkV2ZW50Q29udGV4dCk6IHZvaWQge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICBjb25maWd1cmVPd25lckxvb2t1cChmYyk7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNdXR1YWwgcmVhZC1vbmx5IGJldHdlZW4gY29udGFjdCBhbmQgYWNjb3VudDpcclxuICogLSBJZiBjb250YWN0IGhhcyB2YWx1ZSBhbmQgYWNjb3VudCBpcyBlbXB0eSwgYWNjb3VudCBiZWNvbWVzIHJlYWQtb25seVxyXG4gKiAtIElmIGFjY291bnQgaGFzIHZhbHVlIGFuZCBjb250YWN0IGlzIGVtcHR5LCBjb250YWN0IGJlY29tZXMgcmVhZC1vbmx5XHJcbiAqIC0gT3RoZXJ3aXNlIChib3RoIGVtcHR5IG9yIGJvdGggc2V0KSwgYm90aCBhcmUgZWRpdGFibGVcclxuICovXHJcbmZ1bmN0aW9uIGFwcGx5TXV0dWFsUmVhZE9ubHlDb250YWN0QWNjb3VudChmYzogWHJtLkZvcm1Db250ZXh0KTogdm9pZCB7XHJcbiAgICBjb25zdCBjb250YWN0RmllbGQgPSBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29udGFjdGlkO1xyXG4gICAgY29uc3QgYWNjb3VudEZpZWxkID0gU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLmFjY291bnRpZDtcclxuXHJcbiAgICBjb25zdCBjb250YWN0QXR0ciA9IGZjLmdldEF0dHJpYnV0ZT8uKGNvbnRhY3RGaWVsZCkgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3QgYWNjb3VudEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihhY2NvdW50RmllbGQpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBjb25zdCBoYXNDb250YWN0ID0gISFjb250YWN0QXR0cj8uZ2V0VmFsdWU/LigpPy5bMF0/LmlkO1xyXG4gICAgY29uc3QgaGFzQWNjb3VudCA9ICEhYWNjb3VudEF0dHI/LmdldFZhbHVlPy4oKT8uWzBdPy5pZDtcclxuXHJcbiAgICAvLyBleGFjdGx5IG9uZSBzZXQgPT4gZGlzYWJsZSB0aGUgb3RoZXI7IGRlZmF1bHQ6IGVuYWJsZSBib3RoXHJcbiAgICBpZiAoaGFzQ29udGFjdCAmJiAhaGFzQWNjb3VudCkge1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0RGlzYWJsZWQoZmMsIGFjY291bnRGaWVsZCwgdHJ1ZSk7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgY29udGFjdEZpZWxkLCBmYWxzZSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChoYXNBY2NvdW50ICYmICFoYXNDb250YWN0KSB7XHJcbiAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgY29udGFjdEZpZWxkLCB0cnVlKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldERpc2FibGVkKGZjLCBhY2NvdW50RmllbGQsIGZhbHNlKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICB9XHJcblxyXG4gICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgY29udGFjdEZpZWxkLCBmYWxzZSk7XHJcbiAgICBWaXNpYmlsaXR5SGVscGVyLnNldERpc2FibGVkKGZjLCBhY2NvdW50RmllbGQsIGZhbHNlKTtcclxufVxyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=