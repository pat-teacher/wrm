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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsQ0FBQztJQUMxRCxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLG1DQUFtQyxDQUFDLEVBQW1COztJQUM1RCxNQUFNLFVBQVUsR0FBRyxRQUFFLENBQUMsWUFBWSxtREFBRyxpRkFBaUIsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQWtELENBQUM7SUFDakksTUFBTSxTQUFTLEdBQUcsZ0JBQVUsYUFBVixVQUFVLHVCQUFWLFVBQVUsQ0FBRSxRQUFRLDBEQUFJLENBQUM7SUFDM0MsT0FBTyxDQUNILFNBQVMsS0FBSyxpRkFBaUIsQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsT0FBTztRQUNoRSxTQUFTLEtBQUssaUZBQWlCLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLFFBQVE7UUFDakUsU0FBUyxLQUFLLElBQUksQ0FDckIsQ0FBQztBQUNOLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9jb3JlL1NlY3VyaXR5Um9sZXMudHMiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvY29yZS9jcm0uY29yZS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db21wYW55LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Db250YWN0LmVudGl0eS50cyIsIndlYnBhY2s6Ly8vV2ViUmVzb3VyY2VzL3NyYy9lbnRpdGllcy9Tb3VyY2VPZkZ1bmRFdmVudC5lbnRpdHkudHMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL1dlYlJlc291cmNlcy9zcmMvZm9ybS9zb3VyY2VvZmZ1bmRldmVudC5mb3JtLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCBTRUNVUklUWV9ST0xFUyA9IHtcclxuICAgIFdSTV9DT01QTElBTkNFX09GRklDRVI6IFwiV1JNIENvbXBsaWFuY2UgT2ZmaWNlclwiLFxyXG59IGFzIGNvbnN0O1xyXG5cclxuZXhwb3J0IHR5cGUgU2VjdXJpdHlSb2xlTmFtZSA9IHR5cGVvZiBTRUNVUklUWV9ST0xFU1trZXlvZiB0eXBlb2YgU0VDVVJJVFlfUk9MRVNdO1xyXG4iLCIvLyA9PT09IEZvcm1UeXBlIENvbnN0YW50cyA9PT09XHJcbmV4cG9ydCBjb25zdCBGT1JNX1RZUEUgPSB7XHJcbiAgICBVbmRlZmluZWQ6IDAsXHJcbiAgICBDcmVhdGU6IDEsXHJcbiAgICBVcGRhdGU6IDIsXHJcbiAgICBSZWFkT25seTogMyxcclxuICAgIERpc2FibGVkOiA0LFxyXG4gICAgUXVpY2tDcmVhdGU6IDUsXHJcbiAgICBCdWxrRWRpdDogNixcclxufSBhcyBjb25zdDtcclxuXHJcbmV4cG9ydCB0eXBlIEZvcm1UeXBlID0gdHlwZW9mIEZPUk1fVFlQRVtrZXlvZiB0eXBlb2YgRk9STV9UWVBFXTtcclxuXHJcbmV4cG9ydCBjb25zdCBGb3JtVHlwZUhlbHBlciA9IHtcclxuICAgIGdldChmYzogYW55KTogRm9ybVR5cGUgfCAwIHtcclxuICAgICAgICByZXR1cm4gZmM/LnVpPy5nZXRGb3JtVHlwZT8uKCkgPz8gRk9STV9UWVBFLlVuZGVmaW5lZDtcclxuICAgIH0sXHJcbiAgICBpc0NyZWF0ZUxpa2UodHlwZTogRm9ybVR5cGUpIHtcclxuICAgICAgICByZXR1cm4gdHlwZSA9PT0gRk9STV9UWVBFLkNyZWF0ZSB8fCB0eXBlID09PSBGT1JNX1RZUEUuUXVpY2tDcmVhdGU7XHJcbiAgICB9LFxyXG4gICAgaXNFZGl0YWJsZSh0eXBlOiBGb3JtVHlwZSkge1xyXG4gICAgICAgIHJldHVybiB0eXBlID09PSBGT1JNX1RZUEUuQ3JlYXRlIHx8IHR5cGUgPT09IEZPUk1fVFlQRS5VcGRhdGUgfHwgdHlwZSA9PT0gRk9STV9UWVBFLlF1aWNrQ3JlYXRlO1xyXG4gICAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPd25lclJlZiB7XHJcbiAgICBpZDogc3RyaW5nO1xyXG4gICAgZW50aXR5VHlwZTogXCJzeXN0ZW11c2VyXCIgfCBcInRlYW1cIjtcclxuICAgIG5hbWU/OiBzdHJpbmcgfCBudWxsO1xyXG59XHJcblxyXG4vLyAtLS0tIFR5cGVzIHNoYXJlZCBhY3Jvc3MgZW5naW5lICYgZW50aXRpZXMgLS0tLVxyXG5leHBvcnQgdHlwZSBPcGVyYXRvciA9IFwiZXFcIiB8IFwibmVcIiB8IFwiaW5cIiB8IFwiaXNudWxsXCIgfCBcImlzbm90bnVsbFwiIHwgXCJub3RudWxsXCI7IC8vIGFsaWFzXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIENvbmRpdGlvbiB7XHJcbiAgICAvKiogTG9naWNhbCBuYW1lIChzdXBwb3J0cyBkb3Qtbm90YXRpb24gZm9yIGxvb2t1cCBwcm9qZWN0aW9uczogZS5nLiwgXCJwcmltYXJ5Y29udGFjdGlkLm5hbWVcIikuICovXHJcbiAgICBmaWVsZDogc3RyaW5nO1xyXG4gICAgb3BlcmF0b3I6IE9wZXJhdG9yO1xyXG4gICAgLyoqIE9wdGlvbmFsIHZhbHVlIGZvciBjb21wYXJpc29ucyAob21pdHRlZCBmb3IgbnVsbC1vcGVyYXRvcnMpLiAqL1xyXG4gICAgdmFsdWU/OiB1bmtub3duO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFJ1bGUge1xyXG4gICAgbmFtZT86IHN0cmluZztcclxuICAgIG1hbmRhdG9yeT86IHN0cmluZ1tdO1xyXG4gICAgY29uZGl0aW9uPzogQ29uZGl0aW9uW107IC8vIEFORC1jb25qdW5jdGlvbjsgZW1wdHkvdW5kZWZpbmVkIOKHkiBydWxlIGFsd2F5cyBtYXRjaGVzXHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW50aXR5Q29uZmlnIHtcclxuICAgIGRlZmF1bHQ/OiBzdHJpbmdbXTtcclxuICAgIHJ1bGVzPzogUnVsZVtdO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEJ1c2luZXNzVW5pdENvbmZpZyB7XHJcbiAgICB2ZXJzaW9uOiBudW1iZXI7XHJcbiAgICBlbnRpdGllczogUmVjb3JkPHN0cmluZywgRW50aXR5Q29uZmlnPjtcclxufVxyXG5cclxuLyoqIExpZ2h0d2VpZ2h0IGNvbXBhcmFibGUgcmVwcmVzZW50YXRpb24gb2YgYSBsb29rdXAgKi9cclxuZXhwb3J0IGludGVyZmFjZSBMb29rdXBDb21wYXJhYmxlIHtcclxuICAgIGlkOiBzdHJpbmcgfCBudWxsO1xyXG4gICAgbmFtZTogc3RyaW5nIHwgbnVsbDtcclxuICAgIGVudGl0eVR5cGU6IHN0cmluZyB8IG51bGw7XHJcbn1cclxuXHJcbi8vIC0tLS0gQ29yZSBoZWxwZXJzIC0tLS1cclxuZXhwb3J0IGNsYXNzIFV0aWwge1xyXG4gICAgc3RhdGljIGdldCBYcm0oKTogYW55IHtcclxuICAgICAgICByZXR1cm4gKHdpbmRvdyBhcyBhbnkpLlhybTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogTG93ZXJjYXNlLCBzdHJpcCBicmFjZXM7IHJldHVybnMgZW1wdHkgc3RyaW5nIGlmIGZhbHN5IGlucHV0LiAqL1xyXG4gICAgc3RhdGljIHNhbml0aXplR3VpZChpZD86IHN0cmluZyk6IHN0cmluZyB7XHJcbiAgICAgICAgcmV0dXJuIChpZCB8fCBcIlwiKS5yZXBsYWNlKC9be31dL2csIFwiXCIpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHVuaXF1ZTxUPihhcnI6IFRbXSk6IFRbXSB7XHJcbiAgICAgICAgcmV0dXJuIEFycmF5LmZyb20obmV3IFNldChhcnIpKTtcclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBUaGluIFdlYiBBUEkgd3JhcHBlciAtLS0tXHJcbmV4cG9ydCBjbGFzcyBBcGlDbGllbnQge1xyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlUmVjb3JkKGVudGl0eUxvZ2ljYWxOYW1lOiBzdHJpbmcsIGlkOiBzdHJpbmcsIG9wdGlvbnM/OiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xyXG4gICAgICAgIGNvbnN0IGNsZWFuSWQgPSBVdGlsLnNhbml0aXplR3VpZChpZCk7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZVJlY29yZChlbnRpdHlMb2dpY2FsTmFtZSwgY2xlYW5JZCwgb3B0aW9ucyk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGFzeW5jIHJldHJpZXZlTXVsdGlwbGUoZW50aXR5TG9naWNhbE5hbWU6IHN0cmluZywgb3B0aW9ucz86IHN0cmluZyk6IFByb21pc2U8eyBlbnRpdGllczogYW55W10gfT4ge1xyXG4gICAgICAgIHJldHVybiBhd2FpdCBVdGlsLlhybS5XZWJBcGkucmV0cmlldmVNdWx0aXBsZVJlY29yZHMoZW50aXR5TG9naWNhbE5hbWUsIG9wdGlvbnMpO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBmZXRjaFhtbChlbnRpdHlMb2dpY2FsTmFtZTogc3RyaW5nLCBmZXRjaFhtbDogc3RyaW5nKTogUHJvbWlzZTx7IGVudGl0aWVzOiBhbnlbXSB9PiB7XHJcbiAgICAgICAgY29uc3QgdXJsID0gYD9mZXRjaFhtbD0ke2VuY29kZVVSSUNvbXBvbmVudChmZXRjaFhtbC50cmltKCkpfWA7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5yZXRyaWV2ZU11bHRpcGxlUmVjb3JkcyhlbnRpdHlMb2dpY2FsTmFtZSwgdXJsKTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgZXhlY3V0ZShyZXF1ZXN0OiBhbnkpOiBQcm9taXNlPFJlc3BvbnNlPiB7XHJcbiAgICAgICAgcmV0dXJuIGF3YWl0IFV0aWwuWHJtLldlYkFwaS5vbmxpbmUuZXhlY3V0ZShyZXF1ZXN0KTtcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgYXN5bmMgYXNzb2NpYXRlTWFueVRvTWFueShcclxuICAgICAgICBwYXJlbnRFbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcGFyZW50SWQ6IHN0cmluZyxcclxuICAgICAgICByZWxhdGlvbnNoaXBTY2hlbWFOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgcmVsYXRlZEVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICByZWxhdGVkSWRzOiBzdHJpbmdbXVxyXG4gICAgKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAgICAgY29uc3QgcmVxID0ge1xyXG4gICAgICAgICAgICB0YXJnZXQ6IHsgZW50aXR5VHlwZTogcGFyZW50RW50aXR5TG9naWNhbCwgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHBhcmVudElkKSB9LFxyXG4gICAgICAgICAgICByZWxhdGVkRW50aXRpZXM6IHJlbGF0ZWRJZHMubWFwKChyaWQpID0+ICh7IGVudGl0eVR5cGU6IHJlbGF0ZWRFbnRpdHlMb2dpY2FsLCBpZDogVXRpbC5zYW5pdGl6ZUd1aWQocmlkKSB9KSksXHJcbiAgICAgICAgICAgIHJlbGF0aW9uc2hpcDogcmVsYXRpb25zaGlwU2NoZW1hTmFtZSxcclxuICAgICAgICAgICAgZ2V0TWV0YWRhdGE6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7IGJvdW5kUGFyYW1ldGVyOiBudWxsLCBwYXJhbWV0ZXJUeXBlczoge30sIG9wZXJhdGlvblR5cGU6IDIsIG9wZXJhdGlvbk5hbWU6IFwiQXNzb2NpYXRlXCIgfTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICB9IGFzIGFueTtcclxuXHJcbiAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBBcGlDbGllbnQuZXhlY3V0ZShyZXEpO1xyXG4gICAgICAgIGlmICghcmVzcG9uc2Uub2spIHRocm93IG5ldyBFcnJvcihgQXNzb2NpYXRpb24gZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c30gJHtyZXNwb25zZS5zdGF0dXNUZXh0fWApO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEZvcm0gaGVscGVycyAtLS0tXHJcbmV4cG9ydCBjbGFzcyBGb3JtQ29udHJvbEhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0Q3VycmVudElkKGZjOiBhbnkpOiBzdHJpbmcgfCBudWxsIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBpZFJhdyA9IGZjPy5kYXRhPy5lbnRpdHk/LmdldElkPy4oKTtcclxuICAgICAgICAgICAgcmV0dXJuIGlkUmF3ID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWRSYXcpIDogbnVsbDtcclxuICAgICAgICB9IGNhdGNoIHtcclxuICAgICAgICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBnZXRMb29rdXBJZChmYzogYW55LCBhdHRyaWJ1dGU6IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgY29uc3QgdiA9IGZjPy5nZXRBdHRyaWJ1dGU/LihhdHRyaWJ1dGUpPy5nZXRWYWx1ZT8uKCk7XHJcbiAgICAgICAgcmV0dXJuIHYgJiYgdi5sZW5ndGggPyBVdGlsLnNhbml0aXplR3VpZCh2WzBdLmlkKSA6IHVuZGVmaW5lZDtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGlzYWJsZSBvciBlbmFibGUgYWxsIGRpc2FibGVhYmxlIGNvbnRyb2xzIGluc2lkZSBhIHRhYiBzZWN0aW9uICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWRBbGxDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGRpc2FibGVkOiBib29sZWFuID0gdHJ1ZVxyXG4gICAgKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgdGFiID0gZmMudWk/LnRhYnM/LmdldD8uKHRhYk5hbWUpO1xyXG4gICAgICAgIGlmICghdGFiKSByZXR1cm47XHJcbiAgICAgICAgY29uc3Qgc2VjdGlvbiA9IHRhYi5zZWN0aW9ucz8uZ2V0Py4oc2VjdGlvbk5hbWUpO1xyXG4gICAgICAgIGlmICghc2VjdGlvbikgcmV0dXJuO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHNlY3Rpb24uY29udHJvbHMuZm9yRWFjaCgoY29udHJvbDogYW55KSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoVmlzaWJpbGl0eUhlbHBlci5pc0Rpc2FibGVhYmxlKGNvbnRyb2wpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdHJ5IHsgY29udHJvbC5zZXREaXNhYmxlZChkaXNhYmxlZCk7IH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgLy8gT3B0aW9uYWw6IHNwZWNpYWwgaGFuZGxpbmcgZm9yIHN1YmdyaWRzLCB3aGljaCBkbyBub3Qgc3VwcG9ydCBzZXREaXNhYmxlZFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGNhdGNoIHsgLyogaWdub3JlICovIH1cclxuICAgIH1cclxuXHJcbiAgIC8qKiAgIFxyXG4gICAqIGRlL2FjdGl2YXRlIG9ubHkgdGhlIHNwZWNpZmllZCBjb250cm9scyAoYnkgbmFtZSkgaW4gYSBzZWN0aW9uLiAgIFxyXG4gICAqIERvZXMgbm90aGluZyBpZiB0aGUgbGlzdCBpcyBlbXB0eSBvciBjb250cm9scyBhcmUgbm90IGZvdW5kLlxyXG4gICAqL1xyXG4gICAgc3RhdGljIHNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihcclxuICAgICAgICBmYzogWHJtLkZvcm1Db250ZXh0LFxyXG4gICAgICAgIHRhYk5hbWU6IHN0cmluZyxcclxuICAgICAgICBzZWN0aW9uTmFtZTogc3RyaW5nLFxyXG4gICAgICAgIGNvbnRyb2xOYW1lczogcmVhZG9ubHkgc3RyaW5nW10sXHJcbiAgICAgICAgZGlzYWJsZWQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICBpZiAoIUFycmF5LmlzQXJyYXkoY29udHJvbE5hbWVzKSB8fCBjb250cm9sTmFtZXMubGVuZ3RoID09PSAwKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnN0IHRhYiA9IGZjLnVpPy50YWJzPy5nZXQ/Lih0YWJOYW1lKTtcclxuICAgICAgICBpZiAoIXRhYikgcmV0dXJuO1xyXG5cclxuICAgICAgICBjb25zdCBzZWN0aW9uID0gdGFiLnNlY3Rpb25zPy5nZXQ/LihzZWN0aW9uTmFtZSk7XHJcbiAgICAgICAgaWYgKCFzZWN0aW9uKSByZXR1cm47XHJcblxyXG4gICAgICAgIGNvbnRyb2xOYW1lc1xyXG4gICAgICAgICAgICAubWFwKChuYW1lKSA9PiBGb3JtQ29udHJvbEhlbHBlci5maW5kQ29udHJvbEluU2VjdGlvbihzZWN0aW9uLCBuYW1lKSlcclxuICAgICAgICAgICAgLmZpbHRlcigoYyk6IGMgaXMgWHJtLkNvbnRyb2xzLkNvbnRyb2wgPT4gQm9vbGVhbihjKSlcclxuICAgICAgICAgICAgLmZvckVhY2goKGNvbnRyb2wpID0+IEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkSWZBbGxvd2VkKGNvbnRyb2wsIGRpc2FibGVkKSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgZmluZENvbnRyb2xJblNlY3Rpb24oXHJcbiAgICAgICAgc2VjdGlvbjogWHJtLkNvbnRyb2xzLlNlY3Rpb24sXHJcbiAgICAgICAgbmFtZTogc3RyaW5nXHJcbiAgICApOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZCB7XHJcbiAgICAgICAgLy8gcHJpbWFyeTogZGlyZWN0IHBlciBOYW1lXHJcbiAgICAgICAgY29uc3QgZGlyZWN0ID0gc2VjdGlvbi5jb250cm9scy5nZXQ/LihuYW1lKTtcclxuICAgICAgICBpZiAoZGlyZWN0KSByZXR1cm4gZGlyZWN0O1xyXG5cclxuICAgICAgICAvLyBGYWxsYmFjazogc2VhcmNoIGJ5IGdldE5hbWUoKSBvdmVyIHRoZSBjb2xsZWN0aW9uXHJcbiAgICAgICAgbGV0IGZvdW5kOiBYcm0uQ29udHJvbHMuQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICBzZWN0aW9uLmNvbnRyb2xzLmZvckVhY2goKGMpID0+IHtcclxuICAgICAgICAgICAgaWYgKGMuZ2V0TmFtZT8uKCkgPT09IG5hbWUpIGZvdW5kID0gYztcclxuICAgICAgICB9KTtcclxuICAgICAgICByZXR1cm4gZm91bmQ7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgc2V0RGlzYWJsZWRJZkFsbG93ZWQoY29udHJvbDogWHJtLkNvbnRyb2xzLkNvbnRyb2wsIGRpc2FibGVkOiBib29sZWFuKTogdm9pZCB7XHJcbiAgICAgICAgaWYgKCFWaXNpYmlsaXR5SGVscGVyLmlzRGlzYWJsZWFibGUoY29udHJvbCkpIHJldHVybjtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBvbmx5IGNoYW5nZSBpZiBkaWZmZXJlbnRcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IGNvbnRyb2wuZ2V0RGlzYWJsZWQ/LigpO1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGN1cnJlbnQgPT09IFwiYm9vbGVhblwiICYmIGN1cnJlbnQgPT09IGRpc2FibGVkKSByZXR1cm47XHJcbiAgICAgICAgICAgIGNvbnRyb2wuc2V0RGlzYWJsZWQoZGlzYWJsZWQpO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAvKiBuby1vcCAqL1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEdyaWRIZWxwZXIge1xyXG4gICAgc3RhdGljIHRyeVJlZnJlc2hTdWJncmlkKGZjOiBhbnksIG5hbWU/OiBzdHJpbmcpIHtcclxuICAgICAgICBpZiAoIW5hbWUpIHJldHVybjtcclxuICAgICAgICBjb25zdCBncmlkID0gZmM/LmdldENvbnRyb2w/LihuYW1lKTtcclxuICAgICAgICBpZiAoZ3JpZD8ucmVmcmVzaCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZ3JpZC5yZWZyZXNoKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgZmM/LnVpPy5yZWZyZXNoUmliYm9uPy4oKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBWaXNpYmlsaXR5IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgVmlzaWJpbGl0eUhlbHBlciB7XHJcbiAgICBzdGF0aWMgc2V0VmlzaWJsZShmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCB2aXNpYmxlOiBib29sZWFuKSB7XHJcbiAgICAgICAgY29uc3QgY3RybCA9IGZjPy5nZXRDb250cm9sPy4oY29udHJvbE5hbWUpO1xyXG4gICAgICAgIGlmIChjdHJsPy5zZXRWaXNpYmxlKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldFZpc2libGUodmlzaWJsZSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEVuYWJsZXMgb3IgZGlzYWJsZXMgYSBjb250cm9sICovXHJcbiAgICBzdGF0aWMgc2V0RGlzYWJsZWQoZmM6IGFueSwgY29udHJvbE5hbWU6IHN0cmluZywgZGlzYWJsZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBjdHJsID0gZmM/LmdldENvbnRyb2w/Lihjb250cm9sTmFtZSk7XHJcbiAgICAgICAgaWYgKGN0cmw/LnNldERpc2FibGVkKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjdHJsLnNldERpc2FibGVkKGRpc2FibGVkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCB7XHJcbiAgICAgICAgICAgICAgICAvKiBpZ25vcmUgKi9cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiogU2V0cyByZXF1aXJlZCBsZXZlbCBvbiBhbiBhdHRyaWJ1dGUvY29udHJvbCAqL1xyXG4gICAgc3RhdGljIHNldFJlcXVpcmVkKGZjOiBhbnksIGNvbnRyb2xOYW1lOiBzdHJpbmcsIGlzUmVxdWlyZWQ6IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBhdHRyID0gZmM/LmdldEF0dHJpYnV0ZT8uKGNvbnRyb2xOYW1lKTtcclxuICAgICAgICBpZiAoYXR0cj8uc2V0UmVxdWlyZWRMZXZlbCkge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXR0ci5zZXRSZXF1aXJlZExldmVsKGlzUmVxdWlyZWQgPyBcInJlcXVpcmVkXCIgOiBcIm5vbmVcIik7XHJcbiAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgLyogaWdub3JlICovXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNob3dJZihmYzogYW55LCBjb250cm9sTmFtZTogc3RyaW5nLCBwcmVkaWNhdGU6ICgpID0+IGJvb2xlYW4pIHtcclxuICAgICAgICBjb25zdCBzaG93ID0gISFwcmVkaWNhdGUoKTtcclxuICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldFZpc2libGUoZmMsIGNvbnRyb2xOYW1lLCBzaG93KTtcclxuICAgICAgICByZXR1cm4gc2hvdztcclxuICAgIH1cclxuXHJcbiAgICBzdGF0aWMgc2hvd0lmTG9va3VwRXF1YWxzKGZjOiBhbnksIGxvb2t1cEF0dHI6IHN0cmluZywgdGFyZ2V0SWQ6IHN0cmluZywgY29udHJvbE5hbWU6IHN0cmluZykge1xyXG4gICAgICAgIHJldHVybiBWaXNpYmlsaXR5SGVscGVyLnNob3dJZihmYywgY29udHJvbE5hbWUsICgpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IEZvcm1Db250cm9sSGVscGVyLmdldExvb2t1cElkKGZjLCBsb29rdXBBdHRyKTtcclxuICAgICAgICAgICAgcmV0dXJuICEhY3VycmVudCAmJiBVdGlsLnNhbml0aXplR3VpZChjdXJyZW50KSA9PT0gVXRpbC5zYW5pdGl6ZUd1aWQodGFyZ2V0SWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBUeXBlIGd1YXJkOiBjb250cm9sIHN1cHBvcnRzIHNldERpc2FibGVkICovXHJcbiAgICBzdGF0aWMgaXNEaXNhYmxlYWJsZShjb250cm9sOiBYcm0uQ29udHJvbHMuQ29udHJvbCk6IGNvbnRyb2wgaXMgWHJtLkNvbnRyb2xzLlN0YW5kYXJkQ29udHJvbCB7XHJcbiAgICAgICAgcmV0dXJuIFwic2V0RGlzYWJsZWRcIiBpbiBjb250cm9sICYmIHR5cGVvZiAoY29udHJvbCBhcyBYcm0uQ29udHJvbHMuU3RhbmRhcmRDb250cm9sKS5zZXREaXNhYmxlZCA9PT0gXCJmdW5jdGlvblwiO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgZGlhbG9nIGhlbHBlciAtLS0tXHJcbmV4cG9ydCBpbnRlcmZhY2UgTG9va3VwUmVzdWx0IHtcclxuICAgIGlkOiBzdHJpbmc7XHJcbiAgICBlbnRpdHlUeXBlOiBzdHJpbmc7XHJcbiAgICBuYW1lPzogc3RyaW5nO1xyXG59XHJcblxyXG5leHBvcnQgY2xhc3MgTG9va3VwRGlhbG9nSGVscGVyIHtcclxuICAgIHN0YXRpYyBhc3luYyBvcGVuV2l0aElkTGlzdChcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgaWRBdHRyaWJ1dGU6IHN0cmluZyxcclxuICAgICAgICBpZHM6IHN0cmluZ1tdLFxyXG4gICAgICAgIG9wdGlvbnM/OiBQYXJ0aWFsPHsgYWxsb3dNdWx0aVNlbGVjdDogYm9vbGVhbjsgZGlzYWJsZU1ydTogYm9vbGVhbjsgZGVmYXVsdFZpZXdJZDogc3RyaW5nIH0+XHJcbiAgICApOiBQcm9taXNlPExvb2t1cFJlc3VsdFtdPiB7XHJcbiAgICAgICAgY29uc3QgaW5WYWx1ZXMgPSBpZHNcclxuICAgICAgICAgICAgLm1hcCgoaWQpID0+IGA8dmFsdWUgdWl0eXBlPVwiJHtlbnRpdHlMb2dpY2FsfVwiPnske1V0aWwuc2FuaXRpemVHdWlkKGlkKX19PC92YWx1ZT5gKVxyXG4gICAgICAgICAgICAuam9pbihcIlwiKTtcclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyWG1sID0gYFxyXG4gICAgICA8ZmlsdGVyIHR5cGU9XCJhbmRcIj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cIiR7aWRBdHRyaWJ1dGV9XCIgb3BlcmF0b3I9XCJpblwiPlxyXG4gICAgICAgICAgJHtpblZhbHVlc31cclxuICAgICAgICA8L2NvbmRpdGlvbj5cclxuICAgICAgICA8Y29uZGl0aW9uIGF0dHJpYnV0ZT1cInN0YXRlY29kZVwiIG9wZXJhdG9yPVwiZXFcIiB2YWx1ZT1cIjBcIiAvPlxyXG4gICAgICA8L2ZpbHRlcj5gLnRyaW0oKTtcclxuXHJcbiAgICAgICAgY29uc3QgbG9va3VwT3B0aW9uczogYW55ID0ge1xyXG4gICAgICAgICAgICBhbGxvd011bHRpU2VsZWN0OiBvcHRpb25zPy5hbGxvd011bHRpU2VsZWN0ID8/IHRydWUsXHJcbiAgICAgICAgICAgIGRlZmF1bHRFbnRpdHlUeXBlOiBlbnRpdHlMb2dpY2FsLFxyXG4gICAgICAgICAgICBlbnRpdHlUeXBlczogW2VudGl0eUxvZ2ljYWxdLFxyXG4gICAgICAgICAgICBmaWx0ZXJzOiBbeyBlbnRpdHlMb2dpY2FsTmFtZTogZW50aXR5TG9naWNhbCwgZmlsdGVyWG1sIH1dLFxyXG4gICAgICAgICAgICBkaXNhYmxlTXJ1OiBvcHRpb25zPy5kaXNhYmxlTXJ1ID8/IHRydWUsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgaWYgKG9wdGlvbnM/LmRlZmF1bHRWaWV3SWQpIGxvb2t1cE9wdGlvbnMuZGVmYXVsdFZpZXdJZCA9IG9wdGlvbnMuZGVmYXVsdFZpZXdJZDtcclxuXHJcbiAgICAgICAgcmV0dXJuIChhd2FpdCBVdGlsLlhybS5VdGlsaXR5Lmxvb2t1cE9iamVjdHMobG9va3VwT3B0aW9ucykpIGFzIExvb2t1cFJlc3VsdFtdO1xyXG4gICAgfVxyXG59XHJcblxyXG4vLyAtLS0tIEdlbmVyaWMgbG9va3VwIE9EYXRhIHNlcnZpY2UgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwU2VydmljZSB7XHJcbiAgICBzdGF0aWMgYXN5bmMgZ2V0Rmlyc3RJZEJ5RmlsdGVyKFxyXG4gICAgICAgIGVudGl0eUxvZ2ljYWw6IHN0cmluZyxcclxuICAgICAgICBpZEF0dHI6IHN0cmluZyxcclxuICAgICAgICBvZGF0YUZpbHRlcjogc3RyaW5nXHJcbiAgICApOiBQcm9taXNlPHN0cmluZyB8IG51bGw+IHtcclxuICAgICAgICBjb25zdCBvcHRpb25zID0gYD8kc2VsZWN0PSR7aWRBdHRyfSYkZmlsdGVyPSR7b2RhdGFGaWx0ZXJ9YDtcclxuICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVNdWx0aXBsZShlbnRpdHlMb2dpY2FsLCBvcHRpb25zKTtcclxuICAgICAgICBjb25zdCByb3cgPSByZXM/LmVudGl0aWVzPy5bMF07XHJcbiAgICAgICAgY29uc3QgaWQgPSByb3c/LltpZEF0dHJdIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICByZXR1cm4gaWQgPyBVdGlsLnNhbml0aXplR3VpZChpZCkgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBhc3luYyBnZXRJZEJ5RXF1YWxpdHkoXHJcbiAgICAgICAgZW50aXR5TG9naWNhbDogc3RyaW5nLFxyXG4gICAgICAgIGlkQXR0cjogc3RyaW5nLFxyXG4gICAgICAgIGF0dHI6IHN0cmluZyxcclxuICAgICAgICB2YWx1ZTogc3RyaW5nIHwgbnVtYmVyIHwgYm9vbGVhblxyXG4gICAgKTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgbGl0ID0gdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiID8gYCcke3ZhbHVlLnJlcGxhY2UoLycvZywgXCInJ1wiKX0nYCA6IFN0cmluZyh2YWx1ZSk7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Rmlyc3RJZEJ5RmlsdGVyKGVudGl0eUxvZ2ljYWwsIGlkQXR0ciwgYCgke2F0dHJ9IGVxICR7bGl0fSlgKTtcclxuICAgIH1cclxufVxyXG5cclxuZXhwb3J0IGNsYXNzIEZvcm1XYWl0IHtcclxuICAgIHN0YXRpYyB3YWl0Rm9yTG9va3VwVmFsdWUoZmM6IGFueSwgYXR0cmlidXRlTmFtZTogc3RyaW5nLCB0aW1lb3V0TXMgPSA2MDAwKTogUHJvbWlzZTxYcm0uTG9va3VwVmFsdWUgfCBudWxsPiB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGF0dHIgPSBmYz8uZ2V0QXR0cmlidXRlPy4oYXR0cmlidXRlTmFtZSkgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICBpZiAoIWF0dHIpIHJldHVybiByZXNvbHZlKG51bGwpO1xyXG5cclxuICAgICAgICAgICAgY29uc3Qgbm93ID0gYXR0ci5nZXRWYWx1ZT8uKCk/LlswXTtcclxuICAgICAgICAgICAgaWYgKG5vdz8uaWQpIHJldHVybiByZXNvbHZlKG5vdyk7XHJcblxyXG4gICAgICAgICAgICBsZXQgZG9uZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb25zdCBjbGVhbnVwID0gKCkgPT4geyB0cnkgeyBhdHRyLnJlbW92ZU9uQ2hhbmdlKG9uQ2hhbmdlKTsgfSBjYXRjaCB7IH0gfTtcclxuICAgICAgICAgICAgY29uc3Qgb25DaGFuZ2UgPSAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IGF0dHIuZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgICAgICAgICBpZiAodj8uaWQpIHsgZG9uZSA9IHRydWU7IGNsZWFudXAoKTsgcmVzb2x2ZSh2KTsgfVxyXG4gICAgICAgICAgICB9O1xyXG5cclxuICAgICAgICAgICAgdHJ5IHsgYXR0ci5hZGRPbkNoYW5nZShvbkNoYW5nZSk7IH0gY2F0Y2ggeyB9XHJcbiAgICAgICAgICAgIHNldFRpbWVvdXQob25DaGFuZ2UsIDApO1xyXG5cclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7IGlmICghZG9uZSkgeyBkb25lID0gdHJ1ZTsgY2xlYW51cCgpOyByZXNvbHZlKG51bGwpOyB9IH0sIHRpbWVvdXRNcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbmV4cG9ydCBjbGFzcyBPd25lckhlbHBlciB7XHJcbiAgICBzdGF0aWMgZ2V0T3duZXJBdHRyaWJ1dGUoZmM6IGFueSwgb3duZXJBdHRyTmFtZTogc3RyaW5nKTogWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkIHtcclxuICAgICAgICByZXR1cm4gKGZjPy5nZXRBdHRyaWJ1dGU/Lihvd25lckF0dHJOYW1lKSA/PyBudWxsKSBhcyBhbnk7XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIGdldEN1cnJlbnRPd25lcihmYzogYW55LCBvd25lckF0dHJOYW1lOiBzdHJpbmcpOiBPd25lclJlZiB8IG51bGwge1xyXG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmdldE93bmVyQXR0cmlidXRlKGZjLCBvd25lckF0dHJOYW1lKT8uZ2V0VmFsdWU/LigpPy5bMF07XHJcbiAgICAgICAgaWYgKCF2Py5pZCB8fCAhdi5lbnRpdHlUeXBlKSByZXR1cm4gbnVsbDtcclxuICAgICAgICByZXR1cm4geyBpZDogVXRpbC5zYW5pdGl6ZUd1aWQodi5pZCksIGVudGl0eVR5cGU6IHYuZW50aXR5VHlwZSBhcyBhbnksIG5hbWU6IHYubmFtZSA/PyBudWxsIH07XHJcbiAgICB9XHJcblxyXG4gICAgc3RhdGljIHNldE93bmVyKGZjOiBhbnksIG93bmVyQXR0ck5hbWU6IHN0cmluZywgb3duZXI6IE93bmVyUmVmKTogdm9pZCB7XHJcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuZ2V0T3duZXJBdHRyaWJ1dGUoZmMsIG93bmVyQXR0ck5hbWUpO1xyXG4gICAgICAgIGlmICghYXR0cikgcmV0dXJuO1xyXG4gICAgICAgIGF0dHIuc2V0VmFsdWUoW3tcclxuICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKG93bmVyLmlkKSxcclxuICAgICAgICAgICAgZW50aXR5VHlwZTogb3duZXIuZW50aXR5VHlwZSxcclxuICAgICAgICAgICAgbmFtZTogb3duZXIubmFtZSA/PyB1bmRlZmluZWRcclxuICAgICAgICB9IGFzIGFueV0pO1xyXG4gICAgfVxyXG5cclxuICAgIHN0YXRpYyBpc1NhbWVPd25lcihhPzogT3duZXJSZWYgfCBudWxsLCBiPzogT3duZXJSZWYgfCBudWxsKTogYm9vbGVhbiB7XHJcbiAgICAgICAgaWYgKCFhIHx8ICFiKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIGEuZW50aXR5VHlwZSA9PT0gYi5lbnRpdHlUeXBlICYmIFV0aWwuc2FuaXRpemVHdWlkKGEuaWQpID09PSBVdGlsLnNhbml0aXplR3VpZChiLmlkKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIEdlbmVyaWMgc2VydmljZTogTG9hZCBvd25lciAoVXNlciBvciBUZWFtKSBmb3IgYW55IHJlY29yZCAqL1xyXG5leHBvcnQgY2xhc3MgT3duZXJTZXJ2aWNlIHtcclxuICAgIHN0YXRpYyBhc3luYyBnZXRPd25lclJlZihcclxuICAgICAgICBlbnRpdHlMb2dpY2FsOiBzdHJpbmcsXHJcbiAgICAgICAgcmVjb3JkSWQ6IHN0cmluZyxcclxuICAgICAgICBvd25lckF0dHJOYW1lID0gXCJvd25lcmlkXCJcclxuICAgICk6IFByb21pc2U8T3duZXJSZWYgfCBudWxsPiB7XHJcbiAgICAgICAgY29uc3QgaWQgPSBVdGlsLnNhbml0aXplR3VpZChyZWNvcmRJZCk7XHJcbiAgICAgICAgaWYgKCFpZCkgcmV0dXJuIG51bGw7XHJcblxyXG4gICAgICAgIC8vIEZvciBwb2x5bW9ycGhpYyBvd25lciBsb29rdXBzLCBleHBhbmQgZGVkaWNhdGVkIG5hdiBwcm9wcyB0byBhdm9pZCBwcm9wZXJ0eS1ub3QtZm91bmQgZXJyb3JzXHJcbiAgICAgICAgY29uc3QgZXhwYW5kID0gYD8kc2VsZWN0PSR7b3duZXJBdHRyTmFtZX0mJGV4cGFuZD1vd25pbmd1c2VyKCRzZWxlY3Q9c3lzdGVtdXNlcmlkLGZ1bGxuYW1lKSxvd25pbmd0ZWFtKCRzZWxlY3Q9dGVhbWlkLG5hbWUpYDtcclxuICAgICAgICBjb25zdCByZWMgPSBhd2FpdCBBcGlDbGllbnQucmV0cmlldmVSZWNvcmQoZW50aXR5TG9naWNhbCwgaWQsIGV4cGFuZCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHVzZXIgPSByZWM/LltcIm93bmluZ3VzZXJcIl07XHJcbiAgICAgICAgaWYgKHVzZXI/LnN5c3RlbXVzZXJpZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgaWQ6IFV0aWwuc2FuaXRpemVHdWlkKHVzZXIuc3lzdGVtdXNlcmlkKSxcclxuICAgICAgICAgICAgICAgIGVudGl0eVR5cGU6IFwic3lzdGVtdXNlclwiLFxyXG4gICAgICAgICAgICAgICAgbmFtZTogdXNlci5mdWxsbmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCB0ZWFtID0gcmVjPy5bXCJvd25pbmd0ZWFtXCJdO1xyXG4gICAgICAgIGlmICh0ZWFtPy50ZWFtaWQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZCh0ZWFtLnRlYW1pZCksXHJcbiAgICAgICAgICAgICAgICBlbnRpdHlUeXBlOiBcInRlYW1cIixcclxuICAgICAgICAgICAgICAgIG5hbWU6IHRlYW0ubmFtZSA/PyBudWxsLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIH1cclxufVxyXG5cclxuLyoqIFNlY3VyaXR5LXJlbGF0ZWQgaGVscGVycyAqL1xyXG5leHBvcnQgY2xhc3MgU2VjdXJpdHlTZXJ2aWNlIHtcclxuICAgICAgICAvKiogUmV0dXJucyBjdXJyZW50IHVzZXIgaWQgZnJvbSBYcm0gY29udGV4dCAqL1xyXG4gICAgICAgIHN0YXRpYyBnZXRDdXJyZW50VXNlcklkKCk6IHN0cmluZyB8IG51bGwge1xyXG4gICAgICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgaWQgPSBVdGlsLlhybT8uVXRpbGl0eT8uZ2V0R2xvYmFsQ29udGV4dD8uKCk/LnVzZXJTZXR0aW5ncz8udXNlcklkIGFzIHN0cmluZyB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGlkID8gVXRpbC5zYW5pdGl6ZUd1aWQoaWQpIDogbnVsbDtcclxuICAgICAgICAgICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8qKiBSZXR1cm5zIHJvbGUgbmFtZXMgb2YgdGhlIGN1cnJlbnQgdXNlciAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBnZXRDdXJyZW50VXNlclJvbGVzKCk6IFByb21pc2U8eyBpZDogc3RyaW5nOyBuYW1lOiBzdHJpbmcgfVtdPiB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB1c2VySWQgPSB0aGlzLmdldEN1cnJlbnRVc2VySWQoKTtcclxuICAgICAgICAgICAgICAgIGlmICghdXNlcklkKSByZXR1cm4gW107XHJcblxyXG4gICAgICAgICAgICAgICAgLy8gRmV0Y2hYTUwgb3ZlciBzeXN0ZW11c2Vycm9sZXMgKE46TikgdG8gcm9sZVxyXG4gICAgICAgICAgICAgICAgY29uc3QgZmV0Y2hYbWwgPSBgXHJcbiAgICAgICAgICAgICAgICA8ZmV0Y2ggdmVyc2lvbj1cIjEuMFwiIGRpc3RpbmN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxlbnRpdHkgbmFtZT1cInJvbGVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwicm9sZWlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGF0dHJpYnV0ZSBuYW1lPVwibmFtZVwiIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIDxsaW5rLWVudGl0eSBuYW1lPVwic3lzdGVtdXNlcnJvbGVzXCIgZnJvbT1cInJvbGVpZFwiIHRvPVwicm9sZWlkXCIgaW50ZXJzZWN0PVwidHJ1ZVwiPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGxpbmstZW50aXR5IG5hbWU9XCJzeXN0ZW11c2VyXCIgZnJvbT1cInN5c3RlbXVzZXJpZFwiIHRvPVwic3lzdGVtdXNlcmlkXCIgYWxpYXM9XCJ1XCI+XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNvbmRpdGlvbiBhdHRyaWJ1dGU9XCJzeXN0ZW11c2VyaWRcIiBvcGVyYXRvcj1cImVxXCIgdmFsdWU9XCIke3VzZXJJZH1cIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZmlsdGVyPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPC9saW5rLWVudGl0eT5cclxuICAgICAgICAgICAgICAgICAgICA8L2VudGl0eT5cclxuICAgICAgICAgICAgICAgIDwvZmV0Y2g+YC50cmltKCk7XHJcblxyXG4gICAgICAgICAgICBjb25zdCByZXMgPSBhd2FpdCBBcGlDbGllbnQuZmV0Y2hYbWwoXCJyb2xlXCIsIGZldGNoWG1sKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiAocmVzLmVudGl0aWVzIHx8IFtdKS5tYXAoKGUpID0+ICh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlkOiBVdGlsLnNhbml0aXplR3VpZChlW1wicm9sZWlkXCJdID8/IGVbXCJfcm9sZWlkX3ZhbHVlXCJdKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogZVtcIm5hbWVcIl0gYXMgc3RyaW5nLFxyXG4gICAgICAgICAgICAgICAgfSkpLmZpbHRlcihyID0+ICEhci5pZCAmJiAhIXIubmFtZSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvKiogQ2hlY2tzIGlmIGN1cnJlbnQgdXNlciBoYXMgb25lIG9mIHRoZSBwcm92aWRlZCByb2xlIG5hbWVzIChjYXNlLWluc2Vuc2l0aXZlKSAqL1xyXG4gICAgICAgIHN0YXRpYyBhc3luYyBoYXNDdXJyZW50VXNlclJvbGUoLi4ucm9sZU5hbWVzOiBzdHJpbmdbXSk6IFByb21pc2U8Ym9vbGVhbj4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgd2FudGVkID0gbmV3IFNldChyb2xlTmFtZXMubWFwKG4gPT4gbi50cmltKCkudG9Mb3dlckNhc2UoKSkuZmlsdGVyKEJvb2xlYW4pKTtcclxuICAgICAgICAgICAgICAgIGlmICh3YW50ZWQuc2l6ZSA9PT0gMCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgcm9sZXMgPSBhd2FpdCB0aGlzLmdldEN1cnJlbnRVc2VyUm9sZXMoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiByb2xlcy5zb21lKHIgPT4gd2FudGVkLmhhcyhyLm5hbWUudG9Mb3dlckNhc2UoKSkpO1xyXG4gICAgICAgIH1cclxufVxyXG5cclxuLy8gLS0tLSBMb29rdXAgY29udHJvbCB2aWV3IGhlbHBlcnMgLS0tLVxyXG5leHBvcnQgY2xhc3MgTG9va3VwVmlld0hlbHBlciB7XHJcbiAgICAvKiogUmVzdHJpY3QgYSBsb29rdXAgY29udHJvbCB0byBzcGVjaWZpYyBlbnRpdHkgdHlwZXMgKi9cclxuICAgIHN0YXRpYyBzZXRFbnRpdHlUeXBlcyhmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nLCBlbnRpdHlUeXBlczogc3RyaW5nW10pOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgY3RybD8uc2V0RW50aXR5VHlwZXM/LihlbnRpdHlUeXBlcyk7XHJcbiAgICAgICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqIEFkZCBhIGN1c3RvbSB2aWV3IHRvIGEgbG9va3VwIGNvbnRyb2wgKi9cclxuICAgIHN0YXRpYyBhZGRDdXN0b21WaWV3KFxyXG4gICAgICAgIGZjOiBYcm0uRm9ybUNvbnRleHQsXHJcbiAgICAgICAgY29udHJvbE5hbWU6IHN0cmluZyxcclxuICAgICAgICB2aWV3SWQ6IHN0cmluZyxcclxuICAgICAgICBlbnRpdHlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgdmlld0Rpc3BsYXlOYW1lOiBzdHJpbmcsXHJcbiAgICAgICAgZmV0Y2hYbWw6IHN0cmluZyxcclxuICAgICAgICBsYXlvdXRYbWw6IHN0cmluZyxcclxuICAgICAgICBzZXRBc0RlZmF1bHQ6IGJvb2xlYW4gPSB0cnVlXHJcbiAgICApOiB2b2lkIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBjb25zdCBjdHJsID0gZmMuZ2V0Q29udHJvbD8uKGNvbnRyb2xOYW1lKSBhcyBYcm0uQ29udHJvbHMuTG9va3VwQ29udHJvbCB8IHVuZGVmaW5lZDtcclxuICAgICAgICAgICAgaWYgKCFjdHJsPy5hZGRDdXN0b21WaWV3KSByZXR1cm47XHJcbiAgICAgICAgICAgIGN0cmwuYWRkQ3VzdG9tVmlldyh2aWV3SWQsIGVudGl0eU5hbWUsIHZpZXdEaXNwbGF5TmFtZSwgZmV0Y2hYbWwudHJpbSgpLCBsYXlvdXRYbWwudHJpbSgpLCBzZXRBc0RlZmF1bHQpO1xyXG4gICAgICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBBZGRzIGEgY3VzdG9tIHZpZXcgZm9yIG93bmVyIGxvb2t1cCB0byBzaG93IG9ubHkgdGVhbXMgdGhlIGN1cnJlbnQgdXNlciBiZWxvbmdzIHRvLiAqL1xyXG4gICAgc3RhdGljIGFkZE93bmVyVGVhbVZpZXdGb3JDdXJyZW50VXNlcihmYzogWHJtLkZvcm1Db250ZXh0LCBjb250cm9sTmFtZTogc3RyaW5nID0gXCJvd25lcmlkXCIpOiB2b2lkIHtcclxuICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gXCJ0ZWFtXCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0Rpc3BsYXlOYW1lID0gXCJPd25lclRlYW1Mb29rdXBWaWV3XCI7XHJcbiAgICAgICAgY29uc3Qgdmlld0lkID0gXCJ7MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAxfVwiO1xyXG5cclxuICAgICAgICBjb25zdCBmZXRjaFhtbCA9IGBcclxuICAgICAgICAgICAgPGZldGNoPlxyXG4gICAgICAgICAgICAgICAgPGVudGl0eSBuYW1lPVwidGVhbVwiPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cIm5hbWVcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgIDxhdHRyaWJ1dGUgbmFtZT1cImJ1c2luZXNzdW5pdGlkXCIgLz5cclxuICAgICAgICAgICAgICAgICAgICA8bGluay1lbnRpdHkgbmFtZT1cIm5ldl9vd25lcnRlYW0yc3lzdGVtdXNlclwiIGZyb209XCJ0ZWFtaWRcIiB0bz1cInRlYW1pZFwiIGludGVyc2VjdD1cInRydWVcIj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgPGZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjb25kaXRpb24gYXR0cmlidXRlPVwic3lzdGVtdXNlcmlkXCIgb3BlcmF0b3I9XCJlcS11c2VyaWRcIiAvPlxyXG4gICAgICAgICAgICAgICAgICAgICAgICA8L2ZpbHRlcj5cclxuICAgICAgICAgICAgICAgICAgICA8L2xpbmstZW50aXR5PlxyXG4gICAgICAgICAgICAgICAgPC9lbnRpdHk+XHJcbiAgICAgICAgICAgIDwvZmV0Y2g+XHJcbiAgICAgICAgYDtcclxuXHJcbiAgICAgICAgY29uc3QgbGF5b3V0WG1sID0gYFxyXG4gICAgICAgICAgICA8Z3JpZCBuYW1lPSdyZXN1bHRzZXQnIG9iamVjdD0nMScganVtcD0ndGVhbWlkJyBzZWxlY3Q9JzEnIGljb249JzEnIHByZXZpZXc9JzEnPlxyXG4gICAgICAgICAgICAgICAgPHJvdyBuYW1lPSdyZXN1bHQnIGlkPSd0ZWFtaWQnPlxyXG4gICAgICAgICAgICAgICAgICAgIDxjZWxsIG5hbWU9J25hbWUnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICAgICAgPGNlbGwgbmFtZT0nYnVzaW5lc3N1bml0aWQnIHdpZHRoPScxNTAnIC8+XHJcbiAgICAgICAgICAgICAgICA8L3Jvdz5cclxuICAgICAgICAgICAgPC9ncmlkPlxyXG4gICAgICAgIGA7XHJcblxyXG4gICAgICAgIExvb2t1cFZpZXdIZWxwZXIuYWRkQ3VzdG9tVmlldyhmYywgY29udHJvbE5hbWUsIHZpZXdJZCwgZW50aXR5TmFtZSwgdmlld0Rpc3BsYXlOYW1lLCBmZXRjaFhtbCwgbGF5b3V0WG1sLCB0cnVlKTtcclxuICAgIH1cclxufSIsImV4cG9ydCBjb25zdCBDT01QQU5ZID0ge1xyXG4gICAgZW50aXR5OiBcImFjY291bnRcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcImFjY291bnRpZFwiLFxyXG4gICAgICAgIG5ldl9idXNpbmVzc3VuaXQ6IFwibmV2X2J1c2luZXNzdW5pdFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCJleHBvcnQgY29uc3QgQ09OVEFDVCA9IHtcclxuICAgIGVudGl0eTogXCJjb250YWN0XCIsXHJcbiAgICBmaWVsZHM6IHtcclxuICAgICAgICBwazogXCJjb250YWN0aWRcIixcclxuICAgICAgICBuZXZfYnVzaW5lc3N1bml0aWQ6IFwibmV2X2J1c2luZXNzdW5pdGlkXCIsXHJcbiAgICAgICAgb3duZXJpZDogXCJvd25lcmlkXCIsXHJcbiAgICB9LFxyXG59IGFzIGNvbnN0OyIsImV4cG9ydCBjb25zdCBTT1VSQ0VPRkZVTkRFVkVOVCA9IHtcclxuICAgIGVudGl0eTogXCJtaHdybWJfc291cmNlb2ZmdW5kZXZlbnRcIixcclxuICAgIGZpZWxkczoge1xyXG4gICAgICAgIHBrOiBcIm1od3JtYl9zb3VyY2VvZmZ1bmRldmVudGlkXCIsXHJcbiAgICAgICAgY29udGFjdGlkOiBcIm1od3JtYl9jb250YWN0aWRcIixcclxuICAgICAgICBhY2NvdW50aWQ6IFwibWh3cm1iX2FjY291bnRpZFwiLFxyXG4gICAgICAgIG93bmVyaWQ6IFwib3duZXJpZFwiLFxyXG4gICAgICAgIGNvbXBsaWFuY2Vjb21tZW50OiBcIm1od3JtYl9jb21wbGlhbmNlY29tbWVudFwiLFxyXG4gICAgICAgIGNvbXBsaWFuY2VzdGF0dXM6IFwibWh3cm1iX2NvbXBsaWFuY2VzdGF0dXNcIixcclxuICAgICAgICBuYW1lOiBcIm1od3JtYl9uYW1lXCIsXHJcbiAgICAgICAgc29mdHlwZTogXCJtaHdybWJfc29mdHlwZVwiLFxyXG4gICAgICAgIHBlcmlvZHN0YXJ0OiBcIm1od3JtYl9wZXJpb2RzdGFydFwiLFxyXG4gICAgICAgIHBlcmlvZGVuZDogXCJtaHdybWJfcGVyaW9kZW5kXCIsXHJcbiAgICAgICAgZXN0YW1vdW50X3VzZF9wZXJpb2Q6IFwibWh3cm1iX2VzdGFtb3VudF91c2RfcGVyaW9kXCIsXHJcbiAgICAgICAgZXN0YW1vdW50X3VzZF9wYTogXCJtaHdybWJfZXN0YW1vdW50X3VzZF9wYVwiLFxyXG4gICAgICAgIHNob3J0ZGVzY3JpcHRpb246IFwibWh3cm1iX3Nob3J0ZGVzY3JpcHRpb25cIixcclxuICAgICAgICBzdXBwb3J0aW5nZG9jOiBcIm1od3JtYl9zdXBwb3J0aW5nZG9jXCIsXHJcbiAgICB9LFxyXG4gICAgb3B0aW9uczogeyAgICAgICAgXHJcbiAgICAgICAgY29tcGxpYW5jZXN0YXR1czogeyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBQRU5ESU5HOiA1NjA4NTAwMDAsICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIEFQUFJPVkVEOiA1NjA4NTAwMDIsXHJcbiAgICAgICAgICAgIFJFSkVDVEVEOiA1NjA4NTAwMDNcclxuICAgICAgICB9XHJcbiAgICB9LFxyXG4gICAgdGFiczoge1xyXG4gICAgICAgIEdFTkVSQUw6IFwiZ2VuZXJhbF90YWJcIlxyXG4gICAgfSxcclxuICAgIHNlY3Rpb25zOiB7XHJcbiAgICAgICAgR0VORVJBTF9JTkZPUk1BVElPTl9TRUNUSU9OOiBcImdlbmVyYWxfaW5mb3JtYXRpb25fc2VjdGlvblwiLFxyXG4gICAgICAgIFdFQUxUSF9JTkZPUk1BVElPTl9TRUNUSU9OOiBcIndlYWx0aF9pbmZvcm1hdGlvbl9zZWN0aW9uXCIsXHJcbiAgICAgICAgQ09NUExJQU5DRV9TRUNUSU9OOiBcImNvbXBsaWFuY2Vfc2VjdGlvblwiLFxyXG4gICAgfSxcclxufSBhcyBjb25zdDsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IENPTlRBQ1QgfSBmcm9tIFwiLi8uLi9lbnRpdGllcy9Db250YWN0LmVudGl0eVwiO1xyXG5pbXBvcnQgeyBDT01QQU5ZIH0gZnJvbSBcIi4uL2VudGl0aWVzL0NvbXBhbnkuZW50aXR5XCI7XHJcbmltcG9ydCB7IFNPVVJDRU9GRlVOREVWRU5UIH0gZnJvbSBcIi4vLi4vZW50aXRpZXMvU291cmNlT2ZGdW5kRXZlbnQuZW50aXR5XCI7XHJcbmltcG9ydCB7IEZvcm1XYWl0LCBPd25lckhlbHBlciwgT3duZXJSZWYsIEZvcm1UeXBlSGVscGVyLCBTZWN1cml0eVNlcnZpY2UsIEZvcm1Db250cm9sSGVscGVyLCBWaXNpYmlsaXR5SGVscGVyLCBPd25lclNlcnZpY2UsIExvb2t1cFZpZXdIZWxwZXIgfSBmcm9tIFwiLi8uLi9jb3JlL2NybS5jb3JlXCI7XHJcbmltcG9ydCB7IFNFQ1VSSVRZX1JPTEVTIH0gZnJvbSBcIi4uL2NvcmUvU2VjdXJpdHlSb2xlc1wiO1xyXG5cclxubGV0IF9kZXNpcmVkT3duZXI6IE93bmVyUmVmIHwgbnVsbCA9IG51bGw7XHJcblxyXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gb25Mb2FkKGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuRXZlbnRDb250ZXh0KSB7XHJcbiAgICBjb25zdCBmYyA9IGV4ZWN1dGlvbkNvbnRleHQuZ2V0Rm9ybUNvbnRleHQoKTtcclxuICAgIC8vIENvbmZpZ3VyZSBvd25lciBsb29rdXAgKGFsc28gcmV1c2FibGUgZm9yIG9uQ2hhbmdlKVxyXG4gICAgY29uZmlndXJlT3duZXJMb29rdXAoZmMpO1xyXG4gICAgYXdhaXQgYXBwbHlDb21wbGlhbmNlT2ZmaWNlckFjY2VzcyhmYyk7XHJcbiAgICBhd2FpdCBlbnN1cmVPd25lckZyb21Db250YWN0T3JBY2NvdW50T25DcmVhdGUoZmMpO1xyXG4gICAgLy8gQXBwbHkgbXV0dWFsIHJlYWQtb25seSBsb2dpYyBiZXR3ZWVuIGNvbnRhY3QgYW5kIGFjY291bnQgYW5kIHdpcmUgY2hhbmdlIGhhbmRsZXJzXHJcbiAgICBhcHBseU11dHVhbFJlYWRPbmx5Q29udGFjdEFjY291bnQoZmMpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBjb250YWN0QXR0ciA9IGZjLmdldEF0dHJpYnV0ZT8uKFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5jb250YWN0aWQpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBhY2NvdW50QXR0ciA9IGZjLmdldEF0dHJpYnV0ZT8uKFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5hY2NvdW50aWQpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBjb21wbGlhbmNlU3RhdHVzQXR0ciA9IGZjLmdldEF0dHJpYnV0ZT8uKFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5jb21wbGlhbmNlc3RhdHVzKSBhcyBYcm0uQXR0cmlidXRlcy5PcHRpb25TZXRBdHRyaWJ1dGUgfCB1bmRlZmluZWQ7XHJcbiAgICAgICAgY29tcGxpYW5jZVN0YXR1c0F0dHI/LmFkZE9uQ2hhbmdlKGFzeW5jICgpID0+IHsgYXdhaXQgYXBwbHlDb21wbGlhbmNlT2ZmaWNlckFjY2VzcyhmYyk7IH0pO1xyXG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSAoKSA9PiB7IGFwcGx5TXV0dWFsUmVhZE9ubHlDb250YWN0QWNjb3VudChmYyk7IHZvaWQgZW5zdXJlT3duZXJGcm9tQ29udGFjdE9yQWNjb3VudE9uQ3JlYXRlKGZjKTsgfTtcclxuICAgICAgICBjb250YWN0QXR0cj8uYWRkT25DaGFuZ2UoaGFuZGxlcik7XHJcbiAgICAgICAgYWNjb3VudEF0dHI/LmFkZE9uQ2hhbmdlKGhhbmRsZXIpO1xyXG4gICAgfSBjYXRjaCB7IC8qIGlnbm9yZSAqLyB9XHJcbn1cclxuXHJcbi8qKiBFbmFibGVzIGNvbXBsaWFuY2UgZmllbGRzIGZvciB1c2VycyB3aXRoIFdSTSBDb21wbGlhbmNlIE9mZmljZXIgcm9sZSAqL1xyXG5hc3luYyBmdW5jdGlvbiBhcHBseUNvbXBsaWFuY2VPZmZpY2VyQWNjZXNzKGZjOiBYcm0uRm9ybUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgY29udHJvbHNUb0Rpc2FibGVJbkdlbmVyYWxJbmZvcm1hdGlvblNlY3Rpb246IHN0cmluZ1tdID0gW1xyXG4gICAgICAgICAgICBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMubmFtZSxcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm93bmVyaWQsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5jb250YWN0aWQsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5hY2NvdW50aWRcclxuICAgICAgICBdO1xyXG4gICAgICAgIGNvbnN0IGNvbnRyb2xzVG9EaXNhYmxlV2VhbHRoSW5mb3JtYXRpb25TZWN0aW9uOiBzdHJpbmdbXSA9IFtcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLnNvZnR5cGUsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5wZXJpb2RzdGFydCxcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLnBlcmlvZGVuZCxcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLmVzdGFtb3VudF91c2RfcGEsXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5lc3RhbW91bnRfdXNkX3BlcmlvZCxcclxuICAgICAgICAgICAgU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLnNob3J0ZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5zdXBwb3J0aW5nZG9jXHJcbiAgICAgICAgXTtcclxuICAgICAgICBjb25zdCBpc0NvbXBsaWFuY2VPZmZpY2VyID0gYXdhaXQgU2VjdXJpdHlTZXJ2aWNlLmhhc0N1cnJlbnRVc2VyUm9sZShTRUNVUklUWV9ST0xFUy5XUk1fQ09NUExJQU5DRV9PRkZJQ0VSKTtcclxuICAgICAgICAvLyBDb21wbGlhbmNlIE9mZmljZXI6IGFsd2F5cyBlbmFibGVkIChmaWVsZC1sZXZlbCBzZWN1cml0eSBnb3Zlcm5zIGFjdHVhbCBwZXJtaXNzaW9uKVxyXG4gICAgICAgIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5uYW1lXHJcbiAgICAgICAgaWYgKGlzQ29tcGxpYW5jZU9mZmljZXIpIHtcclxuICAgICAgICAgICAgRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC50YWJzLkdFTkVSQUwsIFNPVVJDRU9GRlVOREVWRU5ULnNlY3Rpb25zLkdFTkVSQUxfSU5GT1JNQVRJT05fU0VDVElPTiwgY29udHJvbHNUb0Rpc2FibGVJbkdlbmVyYWxJbmZvcm1hdGlvblNlY3Rpb24sIGZhbHNlKTtcclxuICAgICAgICAgICAgRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC50YWJzLkdFTkVSQUwsIFNPVVJDRU9GRlVOREVWRU5ULnNlY3Rpb25zLldFQUxUSF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZVdlYWx0aEluZm9ybWF0aW9uU2VjdGlvbiwgZmFsc2UpOyAgICAgICAgICAgIFxyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAvLyBOb24gT2ZmaWNlcjogZGVmYXVsdCBkaXNhYmxlZFxyXG4gICAgICAgIEZvcm1Db250cm9sSGVscGVyLnNldERpc2FibGVkTmFtZWRDb250cm9sc0luU2VjdGlvbihmYywgU09VUkNFT0ZGVU5ERVZFTlQudGFicy5HRU5FUkFMLCBTT1VSQ0VPRkZVTkRFVkVOVC5zZWN0aW9ucy5HRU5FUkFMX0lORk9STUFUSU9OX1NFQ1RJT04sIGNvbnRyb2xzVG9EaXNhYmxlSW5HZW5lcmFsSW5mb3JtYXRpb25TZWN0aW9uLCB0cnVlKTtcclxuICAgICAgICBGb3JtQ29udHJvbEhlbHBlci5zZXREaXNhYmxlZE5hbWVkQ29udHJvbHNJblNlY3Rpb24oZmMsIFNPVVJDRU9GRlVOREVWRU5ULnRhYnMuR0VORVJBTCwgU09VUkNFT0ZGVU5ERVZFTlQuc2VjdGlvbnMuV0VBTFRIX0lORk9STUFUSU9OX1NFQ1RJT04sIGNvbnRyb2xzVG9EaXNhYmxlV2VhbHRoSW5mb3JtYXRpb25TZWN0aW9uLCB0cnVlKTsgICAgICAgIFxyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChpc0NvbXBsaWFuY2VTdGF0dXNQZW5kaW5nT3JSZWplY3RlZChmYykpIHtcclxuICAgICAgICAgICAgRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC50YWJzLkdFTkVSQUwsIFNPVVJDRU9GRlVOREVWRU5ULnNlY3Rpb25zLkdFTkVSQUxfSU5GT1JNQVRJT05fU0VDVElPTiwgY29udHJvbHNUb0Rpc2FibGVJbkdlbmVyYWxJbmZvcm1hdGlvblNlY3Rpb24sIGZhbHNlKTtcclxuICAgICAgICAgICAgRm9ybUNvbnRyb2xIZWxwZXIuc2V0RGlzYWJsZWROYW1lZENvbnRyb2xzSW5TZWN0aW9uKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC50YWJzLkdFTkVSQUwsIFNPVVJDRU9GRlVOREVWRU5ULnNlY3Rpb25zLldFQUxUSF9JTkZPUk1BVElPTl9TRUNUSU9OLCBjb250cm9sc1RvRGlzYWJsZVdlYWx0aEluZm9ybWF0aW9uU2VjdGlvbiwgZmFsc2UpOyAgICAgICAgICAgIFxyXG4gICAgICAgIH1cclxuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG59XHJcblxyXG4vKipcclxuICogT24gY3JlYXRlLWxpa2UgZm9ybXMsIHNldCBvd25lciB0byB0aGUgY29udGFjdCdzIG93bmVyOyBpZiBub3QgYXZhaWxhYmxlLCBmYWxsYmFjayB0byB0aGUgYWNjb3VudCdzIG93bmVyLlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gZW5zdXJlT3duZXJGcm9tQ29udGFjdE9yQWNjb3VudE9uQ3JlYXRlKGZjOiBYcm0uRm9ybUNvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIFxyXG4gICAgY29uc3QgY29udGFjdEF0dHJOYW1lID0gU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLmNvbnRhY3RpZDtcclxuICAgIGNvbnN0IGFjY291bnRBdHRyTmFtZSA9IFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5hY2NvdW50aWQ7XHJcbiAgICBjb25zdCBvd25lckF0dHJOYW1lID0gU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm93bmVyaWQ7XHJcblxyXG4gICAgaWYgKCFPd25lckhlbHBlci5nZXRPd25lckF0dHJpYnV0ZShmYywgb3duZXJBdHRyTmFtZSkpIHJldHVybjtcclxuXHJcbiAgICAvLyBQYXJhbGxlbCB3YWl0IGZvciBib3RoIGxvb2t1cHMgKGNvbnRhY3QgcHJpb3JpdGl6ZWQpLiBBY2NvdW50IHRpbWVvdXQgc2hvcnRlci5cclxuICAgIGNvbnN0IFtjb250YWN0TG9va3VwUmF3LCBhY2NvdW50TG9va3VwUmF3XSA9IGF3YWl0IFByb21pc2UuYWxsKFtcclxuICAgICAgICBGb3JtV2FpdC53YWl0Rm9yTG9va3VwVmFsdWUoZmMsIGNvbnRhY3RBdHRyTmFtZSwgNDAwMCksXHJcbiAgICAgICAgRm9ybVdhaXQud2FpdEZvckxvb2t1cFZhbHVlKGZjLCBhY2NvdW50QXR0ck5hbWUsIDI1MDApXHJcbiAgICBdKTtcclxuICAgIGNvbnN0IGNvbnRhY3RMb29rdXAgPSBjb250YWN0TG9va3VwUmF3IHx8IHVuZGVmaW5lZDtcclxuICAgIGNvbnN0IGFjY291bnRMb29rdXAgPSBhY2NvdW50TG9va3VwUmF3IHx8IHVuZGVmaW5lZDtcclxuXHJcbiAgICBsZXQgcmVzb2x2ZWRPd25lcjogT3duZXJSZWYgfCBudWxsID0gbnVsbDtcclxuICAgIGlmIChjb250YWN0TG9va3VwPy5pZCkge1xyXG4gICAgICAgIHJlc29sdmVkT3duZXIgPSBhd2FpdCBPd25lclNlcnZpY2UuZ2V0T3duZXJSZWYoQ09OVEFDVC5lbnRpdHksIGNvbnRhY3RMb29rdXAuaWQsIENPTlRBQ1QuZmllbGRzLm93bmVyaWQpO1xyXG4gICAgfVxyXG4gICAgaWYgKCFyZXNvbHZlZE93bmVyICYmIGFjY291bnRMb29rdXA/LmlkKSB7XHJcbiAgICAgICAgcmVzb2x2ZWRPd25lciA9IGF3YWl0IE93bmVyU2VydmljZS5nZXRPd25lclJlZihDT01QQU5ZLmVudGl0eSwgYWNjb3VudExvb2t1cC5pZCwgQ09NUEFOWS5maWVsZHMub3duZXJpZCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFyZXNvbHZlZE93bmVyKSByZXR1cm47XHJcblxyXG4gICAgX2Rlc2lyZWRPd25lciA9IHJlc29sdmVkT3duZXI7XHJcbiAgICBjb25zdCBjdXJyZW50T3duZXIgPSBPd25lckhlbHBlci5nZXRDdXJyZW50T3duZXIoZmMsIG93bmVyQXR0ck5hbWUpO1xyXG4gICAgaWYgKCFPd25lckhlbHBlci5pc1NhbWVPd25lcihjdXJyZW50T3duZXIsIHJlc29sdmVkT3duZXIpKSB7XHJcbiAgICAgICAgT3duZXJIZWxwZXIuc2V0T3duZXIoZmMsIG93bmVyQXR0ck5hbWUsIHJlc29sdmVkT3duZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gb25TYXZlKGV4ZWN1dGlvbkNvbnRleHQ6IFhybS5FdmVudHMuU2F2ZUV2ZW50Q29udGV4dCkge1xyXG4gICAgY29uc3QgZmMgPSBleGVjdXRpb25Db250ZXh0LmdldEZvcm1Db250ZXh0KCk7XHJcbiAgICBjb25zdCBvd25lckF0dHJOYW1lID0gU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLm93bmVyaWQ7XHJcbiAgICBpZiAoIV9kZXNpcmVkT3duZXIpIHJldHVybjtcclxuXHJcbiAgICBjb25zdCBjdXJyZW50T3duZXIgPSBPd25lckhlbHBlci5nZXRDdXJyZW50T3duZXIoZmMsIG93bmVyQXR0ck5hbWUpO1xyXG4gICAgaWYgKCFPd25lckhlbHBlci5pc1NhbWVPd25lcihjdXJyZW50T3duZXIsIF9kZXNpcmVkT3duZXIpKSB7XHJcbiAgICAgICAgT3duZXJIZWxwZXIuc2V0T3duZXIoZmMsIG93bmVyQXR0ck5hbWUsIF9kZXNpcmVkT3duZXIpO1xyXG4gICAgfVxyXG59XHJcblxyXG4vKipcclxuICogQ29uZmlndXJlIG93bmVyIGxvb2t1cCB0byBzaG93IG9ubHkgVGVhbXMgYW5kIGRlZmF1bHQgdG8gY3VycmVudCB1c2VyJ3MgdGVhbXMuXHJcbiAqIENhbiBiZSByZXVzZWQgZnJvbSBvbkxvYWQgYW5kIGZyb20gZmllbGQgb25DaGFuZ2UgaGFuZGxlcnMgaWYgbmVlZGVkLlxyXG4gKi9cclxuZnVuY3Rpb24gY29uZmlndXJlT3duZXJMb29rdXAoZmM6IFhybS5Gb3JtQ29udGV4dCk6IHZvaWQge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBMb29rdXBWaWV3SGVscGVyLnNldEVudGl0eVR5cGVzKGZjLCBTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMub3duZXJpZCwgW1widGVhbVwiXSk7XHJcbiAgICAgICAgTG9va3VwVmlld0hlbHBlci5hZGRPd25lclRlYW1WaWV3Rm9yQ3VycmVudFVzZXIoZmMsIFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5vd25lcmlkKTtcclxuICAgIH0gY2F0Y2ggeyAvKiBpZ25vcmUgKi8gfVxyXG59XHJcblxyXG4vKiogT3B0aW9uYWwgZXhwb3J0ZWQgb25DaGFuZ2UgaGFuZGxlciB0byByZS1hcHBseSBvd25lciBsb29rdXAgY29uZmlndXJhdGlvbiAqL1xyXG5leHBvcnQgZnVuY3Rpb24gb25Pd25lckxvb2t1cFJlZnJlc2goZXhlY3V0aW9uQ29udGV4dDogWHJtLkV2ZW50cy5FdmVudENvbnRleHQpOiB2b2lkIHtcclxuICAgIGNvbnN0IGZjID0gZXhlY3V0aW9uQ29udGV4dC5nZXRGb3JtQ29udGV4dCgpO1xyXG4gICAgY29uZmlndXJlT3duZXJMb29rdXAoZmMpO1xyXG59XHJcblxyXG4vKipcclxuICogTXV0dWFsIHJlYWQtb25seSBiZXR3ZWVuIGNvbnRhY3QgYW5kIGFjY291bnQ6XHJcbiAqIC0gSWYgY29udGFjdCBoYXMgdmFsdWUgYW5kIGFjY291bnQgaXMgZW1wdHksIGFjY291bnQgYmVjb21lcyByZWFkLW9ubHlcclxuICogLSBJZiBhY2NvdW50IGhhcyB2YWx1ZSBhbmQgY29udGFjdCBpcyBlbXB0eSwgY29udGFjdCBiZWNvbWVzIHJlYWQtb25seVxyXG4gKiAtIE90aGVyd2lzZSAoYm90aCBlbXB0eSBvciBib3RoIHNldCksIGJvdGggYXJlIGVkaXRhYmxlXHJcbiAqL1xyXG5mdW5jdGlvbiBhcHBseU11dHVhbFJlYWRPbmx5Q29udGFjdEFjY291bnQoZmM6IFhybS5Gb3JtQ29udGV4dCk6IHZvaWQge1xyXG4gICAgaWYgKGlzQ29tcGxpYW5jZVN0YXR1c1BlbmRpbmdPclJlamVjdGVkKGZjKSkge1xyXG4gICAgICAgIGNvbnN0IGNvbnRhY3RGaWVsZCA9IFNPVVJDRU9GRlVOREVWRU5ULmZpZWxkcy5jb250YWN0aWQ7XHJcbiAgICAgICAgY29uc3QgYWNjb3VudEZpZWxkID0gU09VUkNFT0ZGVU5ERVZFTlQuZmllbGRzLmFjY291bnRpZDtcclxuXHJcbiAgICAgICAgY29uc3QgY29udGFjdEF0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/Lihjb250YWN0RmllbGQpIGFzIFhybS5BdHRyaWJ1dGVzLkxvb2t1cEF0dHJpYnV0ZSB8IHVuZGVmaW5lZDtcclxuICAgICAgICBjb25zdCBhY2NvdW50QXR0ciA9IGZjLmdldEF0dHJpYnV0ZT8uKGFjY291bnRGaWVsZCkgYXMgWHJtLkF0dHJpYnV0ZXMuTG9va3VwQXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG5cclxuICAgICAgICBjb25zdCBoYXNDb250YWN0ID0gISFjb250YWN0QXR0cj8uZ2V0VmFsdWU/LigpPy5bMF0/LmlkO1xyXG4gICAgICAgIGNvbnN0IGhhc0FjY291bnQgPSAhIWFjY291bnRBdHRyPy5nZXRWYWx1ZT8uKCk/LlswXT8uaWQ7XHJcblxyXG4gICAgICAgIC8vIGV4YWN0bHkgb25lIHNldCA9PiBkaXNhYmxlIHRoZSBvdGhlcjsgZGVmYXVsdDogZW5hYmxlIGJvdGhcclxuICAgICAgICBpZiAoaGFzQ29udGFjdCAmJiAhaGFzQWNjb3VudCkge1xyXG4gICAgICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldERpc2FibGVkKGZjLCBhY2NvdW50RmllbGQsIHRydWUpO1xyXG4gICAgICAgICAgICBWaXNpYmlsaXR5SGVscGVyLnNldERpc2FibGVkKGZjLCBjb250YWN0RmllbGQsIGZhbHNlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGhhc0FjY291bnQgJiYgIWhhc0NvbnRhY3QpIHtcclxuICAgICAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgY29udGFjdEZpZWxkLCB0cnVlKTtcclxuICAgICAgICAgICAgVmlzaWJpbGl0eUhlbHBlci5zZXREaXNhYmxlZChmYywgYWNjb3VudEZpZWxkLCBmYWxzZSk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0RGlzYWJsZWQoZmMsIGNvbnRhY3RGaWVsZCwgZmFsc2UpO1xyXG4gICAgICAgIFZpc2liaWxpdHlIZWxwZXIuc2V0RGlzYWJsZWQoZmMsIGFjY291bnRGaWVsZCwgZmFsc2UpO1xyXG4gICAgfSAgICBcclxufVxyXG5cclxuLyoqXHJcbiAqIENoZWNrcyBpZiB0aGUgY29tcGxpYW5jZSBzdGF0dXMgaXMgUEVORElORywgUkVKRUNURUQsIG9yIG51bGwuXHJcbiAqIEBwYXJhbSBmYyBUaGUgZm9ybSBjb250ZXh0LlxyXG4gKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjb21wbGlhbmNlIHN0YXR1cyBpcyBQRU5ESU5HLCBSRUpFQ1RFRCwgb3IgbnVsbDsgb3RoZXJ3aXNlLCBmYWxzZS5cclxuICovXHJcbmZ1bmN0aW9uIGlzQ29tcGxpYW5jZVN0YXR1c1BlbmRpbmdPclJlamVjdGVkKGZjOiBYcm0uRm9ybUNvbnRleHQpOiBib29sZWFuIHtcclxuICAgIGNvbnN0IHN0YXR1c0F0dHIgPSBmYy5nZXRBdHRyaWJ1dGU/LihTT1VSQ0VPRkZVTkRFVkVOVC5maWVsZHMuY29tcGxpYW5jZXN0YXR1cykgYXMgWHJtLkF0dHJpYnV0ZXMuT3B0aW9uU2V0QXR0cmlidXRlIHwgdW5kZWZpbmVkO1xyXG4gICAgY29uc3Qgc3RhdHVzVmFsID0gc3RhdHVzQXR0cj8uZ2V0VmFsdWU/LigpO1xyXG4gICAgcmV0dXJuIChcclxuICAgICAgICBzdGF0dXNWYWwgPT09IFNPVVJDRU9GRlVOREVWRU5ULm9wdGlvbnMuY29tcGxpYW5jZXN0YXR1cy5QRU5ESU5HIHx8XHJcbiAgICAgICAgc3RhdHVzVmFsID09PSBTT1VSQ0VPRkZVTkRFVkVOVC5vcHRpb25zLmNvbXBsaWFuY2VzdGF0dXMuUkVKRUNURUQgfHxcclxuICAgICAgICBzdGF0dXNWYWwgPT09IG51bGxcclxuICAgICk7XHJcbn1cclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9