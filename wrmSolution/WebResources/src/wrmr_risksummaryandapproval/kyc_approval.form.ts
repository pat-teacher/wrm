// =====================
// REFACTORED: Classes & Helpers (no TS namespaces)
// =====================
// This file keeps the public handlers as exports (bundled by Webpack as globals),
// but organizes the logic into reusable classes for API, visibility, grid/lookup, and domain services.

// =====================
// CONFIG (edit as needed)
// =====================
const RISKSUMMARYANDAPPROVAL_ENTITY = "wrmr_risksummaryandapproval";
const RISKSUMMARYANDAPPROVAL_ENTITY_PK = "wrmr_risksummaryandapprovalid"; // primary key logical name

const RISKSUMMARYANDAPPROVAL_ENTITY_CONTACTID = "wrmr_contactid";
const RISKSUMMARYANDAPPROVAL_ENTITY_COMPANYID = "wrmr_companyid";

const PORTFOLIO_ENTITY = "wrmb_portfolio";          // logical name (Display: Account)
const PORTFOLIO_ENTITY_PK = "wrmb_portfolioid";        // primary key of portfolio

const PORTFOLIORELATIONSHIP_ENTITY = "wrmb_portfoliorelationship";
const PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID = "wrmb_portfolioid";         // in REL_TABLE → lookup to portfolio
const PORTFOLIORELATIONSHIP_ENTITY_CONTACTID = "wrmb_contactid";
const PORTFOLIORELATIONSHIP_ENTITY_COMPANYID = "wrmb_companyid";
const PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIORELATIONSHIPTYPEID = "wrmb_portfoliorelationshiptypeid";

const PORTFOLIORELATIONSHIPTYPE_ENTITY = "wrmb_portfoliorelationshiptype";
const PORTFOLIORELATIONSHIPTYPE_ENTITY_PK = "wrmb_portfoliorelationshiptypeid";
const PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME = "wrmb_name";
const PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME_PRINCIPAL = "Principal";

// N:N Beziehung
const RISKSUMMARYANDAPPROVAL_ENTITY_N2N_RELATIONSHIP_SCHEMA = "mhwrmb_risksummaryandapproval2portfolio"; // schema name for Associate
const RISKSUMMARYANDAPPROVAL_ENTITY_N2N_NAV_COLLECTION = "mhwrmb_risksummaryandapproval2portfolio"; // collection-valued nav. name for $expand

// optional: Subgrid im Formular, das nachher refreshed werden soll
const PORTFOLIO_ENTITY_SUBGRID_NAME = "wrm_subgrid_accounts";

const RISKSUMMARYANDAPPROVAL_ENTITY_AMBCUST_ORIGINTYPEID = "ambcust_origintypeid";    // Lookup-Feld auf MAIN_ENTITY
const ORIGINTYPE_ENTITY = "ambcust_origintype";                // singulärer logischer Name
const ORIGINTYPE_ENTITY_PK = "ambcust_origintypeid";           // Primärschlüssel der Zieltabelle
const ORIGINTYPE_ENTITY_TYPENAMECODE = "mhwrmb_typenamecode";            // Spalte, nach der gefiltert wird
const ORIGINTYPE_ENTITY_TYPENAMECODE_ACCOUNT_OPENING = "ACCOUNT_OPENING";     // Zielcode

// =====================
// TYPES
// =====================
interface LookupResult {
    id: string;           // GUID (with/without {})
    entityType: string;   // e.g., "wrmb_portfolio"
    name?: string;
}

// =====================
// CORE UTILS
// =====================
class Util {
    static get X(): any { return (window as any).Xrm; }

    static sanitizeGuid(id?: string): string {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    }

    static unique<T>(arr: T[]): T[] { return Array.from(new Set(arr)); }

    static ensureArray<T>(v: T | T[] | null | undefined): T[] {
        if (!v) return [];
        return Array.isArray(v) ? v : [v];
    }
}

// =====================
// API CLIENT (WebApi wrapper)
// =====================
class ApiClient {
    static async retrieveRecord(entityLogicalName: string, id: string, options?: string): Promise<any> {
        const cleanId = Util.sanitizeGuid(id);
        return await Util.X.WebApi.retrieveRecord(entityLogicalName, cleanId, options);
    }

    static async retrieveMultiple(entityLogicalName: string, options?: string): Promise<{ entities: any[] }> {
        // options like: `?$select=...&$filter=...`  (no extra '?' before $filter!)
        return await Util.X.WebApi.retrieveMultipleRecords(entityLogicalName, options);
    }

    static async fetchXml(entityLogicalName: string, fetchXml: string): Promise<{ entities: any[] }> {
        const url = `?fetchXml=${encodeURIComponent(fetchXml.trim())}`;
        return await Util.X.WebApi.retrieveMultipleRecords(entityLogicalName, url);
    }

    static async execute(request: any): Promise<Response> {
        return await Util.X.WebApi.online.execute(request);
    }

    static async associateManyToMany(
        parentEntityLogical: string,
        parentId: string,
        relationshipSchemaName: string,
        relatedEntityLogical: string,
        relatedIds: string[]
    ): Promise<void> {
        const req = {
            target: { entityType: parentEntityLogical, id: Util.sanitizeGuid(parentId) },
            relatedEntities: relatedIds.map(id => ({ entityType: relatedEntityLogical, id: Util.sanitizeGuid(id) })),
            relationship: relationshipSchemaName,
            getMetadata: function () {
                return { boundParameter: null, parameterTypes: {}, operationType: 2, operationName: "Associate" };
            }
        } as any;

        const response = await ApiClient.execute(req);
        if (!response.ok) {
            throw new Error(`Association failed: ${response.status} ${response.statusText}`);
        }
    }
}

// =====================
// FORM HELPERS
// =====================
class FormHelper {
    static getCurrentId(fc: any): string | null {
        try {
            const idRaw = fc?.data?.entity?.getId?.();
            return idRaw ? Util.sanitizeGuid(idRaw) : null;
        } catch { return null; }
    }

    static getLookupId(fc: any, attribute: string): string | undefined {
        const v = fc?.getAttribute?.(attribute)?.getValue?.();
        return v && v.length ? Util.sanitizeGuid(v[0].id) : undefined;
    }
}

class GridHelper {
    static tryRefreshSubgrid(fc: any, name?: string) {
        if (!name) return;
        const grid = fc?.getControl?.(name);
        if (grid?.refresh) {
            try { grid.refresh(); } catch { /* ignore */ }
        } else {
            try { fc?.ui?.refreshRibbon?.(); } catch { /* ignore */ }
        }
    }
}

class VisibilityHelper {
    /** Set visibility for a single control (field, subgrid, section control). */
    static setVisible(fc: any, controlName: string, visible: boolean) {
        const ctrl = fc?.getControl?.(controlName);
        if (ctrl?.setVisible) { try { ctrl.setVisible(visible); } catch { /* ignore */ } }
    }

    /** Show/hide multiple controls. */
    static setMany(fc: any, controlNames: string[], visible: boolean) {
        controlNames.forEach(n => VisibilityHelper.setVisible(fc, n, visible));
    }

    /** Show a control when a predicate returns true, otherwise hide. */
    static showIf(fc: any, controlName: string, predicate: () => boolean) {
        const show = !!predicate();
        VisibilityHelper.setVisible(fc, controlName, show);
        return show;
    }

    /** Generic: compare a lookup attribute to a target GUID (case/brace-insensitive). */
    static showIfLookupEquals(fc: any, lookupAttr: string, targetId: string, controlName: string) {
        return VisibilityHelper.showIf(fc, controlName, () => {
            const current = FormHelper.getLookupId(fc, lookupAttr);
            return !!current && Util.sanitizeGuid(current) === Util.sanitizeGuid(targetId);
        });
    }
}

class LookupDialogHelper {
    /** Open lookup with an IN-filter on the id attribute, limiting to a given entity. */
    static async openWithIdList(
        entityLogical: string,
        idAttribute: string,
        ids: string[],
        options?: Partial<{ allowMultiSelect: boolean; disableMru: boolean; defaultViewId: string; }>
    ): Promise<LookupResult[]> {
        const inValues = ids
            .map(id => `<value uitype="${entityLogical}">{${Util.sanitizeGuid(id)}}</value>`) // keep {} inside value
            .join("");

        const filterXml = `
      <filter type="and">
        <condition attribute="${idAttribute}" operator="in">
          ${inValues}
        </condition>
        <condition attribute="statecode" operator="eq" value="0" />
      </filter>`.trim();

        const lookupOptions: any = {
            allowMultiSelect: options?.allowMultiSelect ?? true,
            defaultEntityType: entityLogical,
            entityTypes: [entityLogical],
            filters: [{ entityLogicalName: entityLogical, filterXml }],
            disableMru: options?.disableMru ?? true,
        };

        if (options?.defaultViewId) lookupOptions.defaultViewId = options.defaultViewId;

        return await Util.X.Utility.lookupObjects(lookupOptions) as LookupResult[];
    }
}

// =====================
// DOMAIN SERVICES
// =====================
class OriginTypeService {
    /** Get the ID of the OriginType record by code value (e.g., 'ACCOUNT_OPENING'). */
    static async getIdByCode(
        entityLogical: string,
        primaryIdAttr: string,
        codeAttr: string,
        codeValue: string
    ): Promise<string | null> {
        // Correct OData options: one '?' prefix only
        const options = `?$select=${primaryIdAttr}&$filter=(${codeAttr} eq '${codeValue}')`;
        const res = await ApiClient.retrieveMultiple(entityLogical, options);
        const row = res?.entities?.[0];
        const id = row?.[primaryIdAttr] as string | undefined;
        return id ? Util.sanitizeGuid(id) : null;
    }
}

class RelationshipService {
    /**
     * Collect candidate portfolio IDs from relationship table with optional filters for contact/company
     * and forced relationship type name == 'Principal'.
     */
    static async getCandidatePortfolioIds(
        contactId?: string,
        companyId?: string
    ): Promise<string[]> {
        const orBlock = [
            contactId ? `<condition attribute="${PORTFOLIORELATIONSHIP_ENTITY_CONTACTID}" operator="eq" value="${Util.sanitizeGuid(contactId)}" />` : "",
            companyId ? `<condition attribute="${PORTFOLIORELATIONSHIP_ENTITY_COMPANYID}" operator="eq" value="${Util.sanitizeGuid(companyId)}" />` : "",
        ].filter(Boolean).join("");

        const fetchXml = `
      <fetch version="1.0" distinct="true">
        <entity name="${PORTFOLIORELATIONSHIP_ENTITY}">
          <attribute name="${PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID}" />
          <filter type="and">
            <filter type="or">
              ${orBlock}
            </filter>
          </filter>
          <link-entity name="${PORTFOLIORELATIONSHIPTYPE_ENTITY}"
                       from="${PORTFOLIORELATIONSHIPTYPE_ENTITY_PK}"
                       to="${PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIORELATIONSHIPTYPEID}" alias="reltype">
            <filter>
              <condition attribute="${PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME}" operator="eq" value="${PORTFOLIORELATIONSHIPTYPE_ENTITY_NAME_PRINCIPAL}" />
            </filter>
          </link-entity>
        </entity>
      </fetch>`;

        const res = await ApiClient.fetchXml(PORTFOLIORELATIONSHIP_ENTITY, fetchXml);
        const set = new Set<string>();

        for (const e of res.entities) {
            const id = Util.sanitizeGuid((e as any)[`_${PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID}_value`] || (e as any)[PORTFOLIORELATIONSHIP_ENTITY_PORTFOLIOID]);
            if (id) set.add(id);
        }
        return Array.from(set);
    }
}

class N2NService {
    static async getAlreadyLinkedPortfolioIds(mainId: string): Promise<Set<string>> {
        const expand = `?$expand=${RISKSUMMARYANDAPPROVAL_ENTITY_N2N_NAV_COLLECTION}($select=${PORTFOLIO_ENTITY_PK})`;
        const rec = await ApiClient.retrieveRecord(RISKSUMMARYANDAPPROVAL_ENTITY, mainId, expand);
        const list = (rec?.[RISKSUMMARYANDAPPROVAL_ENTITY_N2N_NAV_COLLECTION] || []) as Array<any>;

        const set = new Set<string>();
        for (const row of list) {
            const id = Util.sanitizeGuid(row[PORTFOLIO_ENTITY_PK]);
            if (id) set.add(id);
        }
        return set;
    }
}

class ApprovalPortfolioFlow {
    static async run(fc: any, mainId: string, ctx: { contactId?: string; companyId?: string; }) {
        const X = Util.X;

        // 1) Candidates
        const candidateIds = await RelationshipService.getCandidatePortfolioIds(ctx.contactId, ctx.companyId);
        if (candidateIds.length === 0) {
            await X.Navigation.openAlertDialog({ text: "No matching accounts found for the selected Contact/Company." });
            return;
        }

        // 2) Exclude already-linked
        const alreadyLinked = await N2NService.getAlreadyLinkedPortfolioIds(mainId);
        const candidatesToOffer = candidateIds.filter(id => !alreadyLinked.has(Util.sanitizeGuid(id)));
        if (candidatesToOffer.length === 0) {
            await X.Navigation.openAlertDialog({ text: "All candidate accounts are already linked to this record." });
            return;
        }

        // 3) Open picker (filtered to those candidates)
        fc?.ui?.setFormNotification?.(
            "Showing accounts that match the selected Contact/Company. Already linked items are hidden.",
            "INFO",
            "account-filter-context"
        );

        const selection = await LookupDialogHelper.openWithIdList(
            PORTFOLIO_ENTITY,
            PORTFOLIO_ENTITY_PK,
            candidatesToOffer,
            { allowMultiSelect: true, disableMru: true }
        );

        fc?.ui?.clearFormNotification?.("account-filter-context");
        if (!selection || selection.length === 0) return;

        const selectedIds = Util.unique(selection.map(s => Util.sanitizeGuid(s.id)));
        if (selectedIds.length === 0) return;

        // 4) Associate
        try {
            await ApiClient.associateManyToMany(
                RISKSUMMARYANDAPPROVAL_ENTITY,
                mainId,
                RISKSUMMARYANDAPPROVAL_ENTITY_N2N_RELATIONSHIP_SCHEMA,
                PORTFOLIO_ENTITY,
                selectedIds
            );
        } catch (e: any) {
            const msg = String(e?.message || e);
            // common duplicate case when concurrent (ignore)
            if (!/already exists/i.test(msg)) throw e;
        }

        // 5) Refresh grid
        GridHelper.tryRefreshSubgrid(fc, PORTFOLIO_ENTITY_SUBGRID_NAME);
    }
}

// =====================
// PUBLIC HANDLERS (exported)
// =====================
export async function onLoad(executionContext: any) {
    const fc = executionContext.getFormContext?.() ?? executionContext;

    try {
        // 1) Get GUID for ACCOUNT_OPENING origin type
        const accountOpeningId = await OriginTypeService.getIdByCode(
            ORIGINTYPE_ENTITY,
            ORIGINTYPE_ENTITY_PK,
            ORIGINTYPE_ENTITY_TYPENAMECODE,
            ORIGINTYPE_ENTITY_TYPENAMECODE_ACCOUNT_OPENING
        );

        if (!accountOpeningId) {
            VisibilityHelper.setVisible(fc, PORTFOLIO_ENTITY_SUBGRID_NAME, false);
            return;
        }

        // 2) Compare current lookup and toggle subgrid
        VisibilityHelper.showIfLookupEquals(
            fc,
            RISKSUMMARYANDAPPROVAL_ENTITY_AMBCUST_ORIGINTYPEID,
            accountOpeningId,
            PORTFOLIO_ENTITY_SUBGRID_NAME
        );
    } catch (e) {
        VisibilityHelper.setVisible(fc, PORTFOLIO_ENTITY_SUBGRID_NAME, false);
    }
}

export async function addAllowedAccounts(primaryControl: any) {
    const fc = primaryControl;
    const X = Util.X;

    const currentId = FormHelper.getCurrentId(fc);
    if (!currentId) { await X.Navigation.openAlertDialog({ text: "Please save the record first." }); return; }

    const contactId = FormHelper.getLookupId(fc, RISKSUMMARYANDAPPROVAL_ENTITY_CONTACTID);
    const companyId = FormHelper.getLookupId(fc, RISKSUMMARYANDAPPROVAL_ENTITY_COMPANYID);

    if (!contactId && !companyId) {
        await X.Navigation.openAlertDialog({ text: "Please set either a Contact or a Company first." });
        return;
    }

    try {
        await ApprovalPortfolioFlow.run(fc, currentId, { contactId, companyId });
    } catch (err: any) {
        await X.Navigation.openErrorDialog?.({ message: err?.message ?? String(err) });
    }
}

// =====================
// OPTIONAL: Export helpers if you want to reuse outside
// (Webpack can expose these if configured; otherwise keep local.)
// =====================
export const Helpers = { Util, FormHelper, VisibilityHelper, GridHelper, ApiClient, LookupDialogHelper };
