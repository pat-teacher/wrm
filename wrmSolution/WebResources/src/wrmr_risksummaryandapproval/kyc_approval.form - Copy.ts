// Datei: WebResources/src/wrmr_risksummaryandapproval/kyc_approval.form.ts
// Hinweis: Keine TS-namespace! Exportierte Funktionen werden von Webpack als globale Funktionen bereitgestellt.

// =====================
// CONFIG (edit as needed)
// =====================
const MAIN_ENTITY = "wrmr_risksummaryandapproval";
const MAIN_ENTITY_ID_ATTR = "wrmr_risksummaryandapprovalid"; // primary key logical name

const FORM_ATTR_CONTACT = "wrmr_contactid";
const FORM_ATTR_COMPANY = "wrmr_companyid";

const ENTITY_PORTFOLIO = "wrmb_portfolio";          // logical name (Display: Account)
const PORTFOLIO_ID_ATTR = "wrmb_portfolioid";        // primary key of portfolio

const REL_TABLE = "wrmb_portfoliorelationship";
const REL_FK_ACCOUNT = "wrmb_portfolioid";         // in REL_TABLE → lookup to portfolio
const REL_FK_CONTACT = "wrmb_contactid";
const REL_FK_COMPANY = "wrmb_companyid";
const REL_FK_TYPE = "wrmb_portfoliorelationshiptypeid";

const ENTITY_PORTFOLIORELATIONSHIPTYPE = "wrmb_portfoliorelationshiptype";
const ENTITY_PORTFOLIORELATIONSHIPTYPE_PK = "wrmb_portfoliorelationshiptypeid";
const ENTITY_PORTFOLIORELATIONSHIPTYPE_NAME = "wrmb_name";
const ENTITY_PORTFOLIORELATIONSHIPTYPE_NAME_PRINCIPAL = "Principal";

// N:N Beziehung
const N2N_RELATIONSHIP_SCHEMA = "mhwrmb_risksummaryandapproval2portfolio"; // schema name for Associate
const N2N_NAV_COLLECTION = "mhwrmb_risksummaryandapproval2portfolio"; // collection-valued nav. name for $expand

// optional: Subgrid im Formular, das nachher refreshed werden soll
const SUBGRID_NAME_TO_REFRESH = "wrm_subgrid_accounts";

const FORM_ATTR_ORIGINTYPE_LOOKUP = "ambcust_origintypeid";    // Lookup-Feld auf MAIN_ENTITY
const ENTITY_ORIGINTYPE = "ambcust_origintype";                // singulärer logischer Name
const ENTITY_ORIGINTYPE_PK = "ambcust_origintypeid";           // Primärschlüssel der Zieltabelle
const ORIGINTYPE_CODE_ATTR = "mhwrmb_typenamecode";            // Spalte, nach der gefiltert wird
const ORIGINTYPE_CODE_ACCOUNT_OPENING = "ACCOUNT_OPENING";     // Zielcode


// =====================
// TYPES
// =====================
interface LookupResult {
    id: string;           // GUID (with/without {})
    entityType: string;   // e.g., "wrmb_portfolio"
    name?: string;
}

// =====================
// FORM ONLOAD VISIBILITY
// =====================
export async function onLoad(executionContext: any) {
    const X = (window as any).Xrm;
    const fc = executionContext.getFormContext?.() ?? executionContext; // falls bereits formContext

    try {
        // 1) GUID der "ACCOUNT_OPENING" OriginType holen (aus ambcust_origintype)
        const accountOpeningId = await getAccountOpeningOriginTypeId();
        if (!accountOpeningId) {
            // Nichts gefunden → Subgrid sicherheitshalber ausblenden
            setSubgridVisible(fc, SUBGRID_NAME_TO_REFRESH, false);
            return;
        }

        // 2) Aktuellen Lookupwert vom Formular lesen
        const currentLookupId = Helpers.getLookupId(fc, FORM_ATTR_ORIGINTYPE_LOOKUP);
        const show = !!currentLookupId
            && Helpers.sanitizeGuid(currentLookupId) === Helpers.sanitizeGuid(accountOpeningId);

        // 3) Sichtbarkeit setzen
        setSubgridVisible(fc, SUBGRID_NAME_TO_REFRESH, show);
    } catch (e: any) {
        // Bei Fehlern lieber ausblenden, damit nichts Falsches angezeigt wird
        setSubgridVisible(fc, SUBGRID_NAME_TO_REFRESH, false);
        // Optional: Debugmeldung
        // X.Navigation.openAlertDialog({ text: `OnLoad error: ${e?.message ?? e}` });
    }
}

// =====================
// PUBLIC RIBBON HANDLER
// =====================
export async function addAllowedAccounts(primaryControl: any) {
    const X = (window as any).Xrm;
    const fc = primaryControl;

    const currentId = Helpers.getCurrentId(fc);
    if (!currentId) { await X.Navigation.openAlertDialog({ text: "Please save the record first." }); return; }

    const contactId = Helpers.getLookupId(fc, FORM_ATTR_CONTACT);
    const companyId = Helpers.getLookupId(fc, FORM_ATTR_COMPANY);
    if (!contactId && !companyId) {
        await X.Navigation.openAlertDialog({ text: "Please set either a Contact or a Company first." });
        return;
    }

    try {
        await ApprovalPortfolioService.runAssociateFlow(fc, currentId, { contactId, companyId });
    } catch (err: any) {
        await X.Navigation.openErrorDialog?.({ message: err?.message ?? String(err) });
    }
}

// Hilfsfunktion: lädt die ID des OriginType-Datensatzes mit Code = 'ACCOUNT_OPENING'
async function getAccountOpeningOriginTypeId(): Promise<string | null> {
    const X = (window as any).Xrm;

    // entspricht deiner OData-URL: .../ambcust_origintypes?$select=ambcust_origintypeid&$filter=(mhwrmb_typenamecode eq 'ACCOUNT_OPENING')
    const options =
        `?$select=${ENTITY_ORIGINTYPE_PK}&` +
        `$filter=(${ORIGINTYPE_CODE_ATTR} eq '${ORIGINTYPE_CODE_ACCOUNT_OPENING}')`;

    // Achtung: retrieveMultipleRecords erwartet den SINGULÄREN logischen Namen
    const res = await X.WebApi.retrieveMultipleRecords(ENTITY_ORIGINTYPE, options);

    // Falls mehrere Treffer: nimm den ersten; sonst null
    const row = res.entities?.[0];
    const id = row?.[ENTITY_ORIGINTYPE_PK] as string | undefined;
    return id ? Helpers.sanitizeGuid(id) : null;
}

// Hilfsfunktion: Subgrid sichtbar/unsichtbar
function setSubgridVisible(fc: any, subgridName: string, visible: boolean) {
    if (!subgridName) return;
    const ctrl = fc?.getControl?.(subgridName);
    if (ctrl?.setVisible) {
        try { ctrl.setVisible(visible); } catch { /* ignore */ }
    }
}

// =====================
// SERVICE MODULE (internal)
// =====================
const ApprovalPortfolioService = (() => {
    const X = (window as any).Xrm;

    async function runAssociateFlow(fc: any, mainId: string, ctx: { contactId?: string; companyId?: string; }) {
        // 1) Candidates from relationship table
        const candidateIds = await Data.getCandidatePortfolioIds(ctx.contactId, ctx.companyId);
        if (candidateIds.length === 0) {
            await X.Navigation.openAlertDialog({ text: "No matching accounts found for the selected Contact/Company." });
            return;
        }

        // 2) Remove already linked
        const alreadyLinked = await Data.getAlreadyLinkedPortfolioIds(mainId);
        const candidatesToOffer = candidateIds.filter(id => !alreadyLinked.has(id));
        if (candidatesToOffer.length === 0) {
            await X.Navigation.openAlertDialog({ text: "All candidate accounts are already linked to this record." });
            return;
        }

        // 3) Context notice & open picker
        fc.ui.setFormNotification(
            "Showing accounts that match the selected Contact/Company. Already linked items are hidden.",
            "INFO",
            "account-filter-context"
        );

        const selection: LookupResult[] = await UI.openPortfolioPicker(candidatesToOffer);
        fc.ui.clearFormNotification("account-filter-context");

        if (!selection || selection.length === 0) return;

        const selectedIds: string[] = Helpers.unique(selection.map(i => Helpers.sanitizeGuid(i.id)));
        if (selectedIds.length === 0) return;

        // 4) Associate in ONE request (Associate operation)
        await Associate.associateManyToMany(
            MAIN_ENTITY,
            mainId,
            N2N_RELATIONSHIP_SCHEMA, // schema name
            ENTITY_PORTFOLIO,
            selectedIds
        ).catch((e: any) => {
            // tolerate duplicate links (race conditions)
            const msg = String(e?.message || e);
            if (!/already exists/i.test(msg)) throw e;
        });

        // 5) Refresh subgrid & friendly feedback incl. names
        UI.tryRefreshSubgrid(fc, SUBGRID_NAME_TO_REFRESH);        
    }

    // ---- Data access helpers ----
    const Data = {
        // Candidate portfolio IDs from REL_TABLE (filter by contact/company)
        async getCandidatePortfolioIds(contactId?: string, companyId?: string): Promise<string[]> {
            const orBlock = [
                contactId ? `<condition attribute="${REL_FK_CONTACT}" operator="eq" value="${contactId}" />` : "",
                companyId ? `<condition attribute="${REL_FK_COMPANY}" operator="eq" value="${companyId}" />` : ""
            ].filter(Boolean).join("");

            const fetchXml = `
                <fetch version="1.0" distinct="true">
                <entity name="${REL_TABLE}">
                    <attribute name="${REL_FK_ACCOUNT}" />
                    <filter type="and">
                    <filter type="or">
                        ${orBlock}
                    </filter>
                    </filter>

                    <!-- only RelationshipType = "Principal" -->
                    <link-entity name="${ENTITY_PORTFOLIORELATIONSHIPTYPE}"
                                from="${ENTITY_PORTFOLIORELATIONSHIPTYPE_PK}"
                                to="${REL_FK_TYPE}"
                                alias="reltype">
                    <filter>
                        <condition attribute="${ENTITY_PORTFOLIORELATIONSHIPTYPE_NAME}"
                                    operator="eq"
                                    value="${ENTITY_PORTFOLIORELATIONSHIPTYPE_NAME_PRINCIPAL}" />
                    </filter>
                    </link-entity>
                </entity>
                </fetch>`.trim();

            const res = await X.WebApi.retrieveMultipleRecords(
                REL_TABLE,
                `?fetchXml=${encodeURIComponent(fetchXml)}`
            );

            const ids = new Set<string>();
            for (const e of res.entities) {
                const id = Helpers.sanitizeGuid(e[`_${REL_FK_ACCOUNT}_value`] || e[REL_FK_ACCOUNT]);
                if (id) ids.add(id);
            }
            return Array.from(ids);
        },

        // Already linked portfolio IDs via $expand on the N:N navigation
        async getAlreadyLinkedPortfolioIds(mainId: string): Promise<Set<string>> {
            const expand = `?$expand=${N2N_NAV_COLLECTION}($select=${PORTFOLIO_ID_ATTR})`;
            
            const rec = await X.WebApi.retrieveRecord(MAIN_ENTITY, mainId, expand);
            
            const list = (rec?.[N2N_NAV_COLLECTION] || []) as Array<any>;
            const set = new Set<string>();
            for (const row of list) {
                const id = Helpers.sanitizeGuid(row[PORTFOLIO_ID_ATTR]);
                if (id) set.add(id);
            }
            return set;
        }       
    };

    // ---- Associate helper (single request for multiple links) ----
    const Associate = {
        async associateManyToMany(
            parentEntityLogical: string,
            parentId: string,
            relationshipSchemaName: string,
            relatedEntityLogical: string,
            relatedIds: string[]
        ) {
            const request = {
                target: { entityType: parentEntityLogical, id: parentId },
                relatedEntities: relatedIds.map(id => ({ entityType: relatedEntityLogical, id })),
                relationship: relationshipSchemaName,
                getMetadata: function () {
                    return {
                        boundParameter: null,
                        parameterTypes: {},
                        operationType: 2,           // Associate/Disassociate
                        operationName: "Associate"
                    };
                }
            };
            const response = await X.WebApi.online.execute(request as any);
            if (!response.ok) {
                throw new Error(`Association failed: ${response.status} ${response.statusText}`);
            }
        }
    };

    // ---- UI helpers ----
    const UI = {
        async openPortfolioPicker(portfolioIds: string[]): Promise<LookupResult[]> {
            const inValues = portfolioIds
                .map(id => `<value uitype="${ENTITY_PORTFOLIO}">{${Helpers.sanitizeGuid(id)}}</value>`)
                .join("");

            const filterXml = `
            <filter type="and">
                <condition attribute="${PORTFOLIO_ID_ATTR}" operator="in">
                    ${inValues}
                </condition>
                <condition attribute="statecode" operator="eq" value="0" />
            </filter>`.trim();

            const options = {
                allowMultiSelect: true,
                defaultEntityType: ENTITY_PORTFOLIO,
                entityTypes: [ENTITY_PORTFOLIO],
                filters: [{ entityLogicalName: ENTITY_PORTFOLIO, filterXml }],
                disableMru: true
            };

            // cast to typed result to avoid TS2345 (unknown[] -> LookupResult[])
            return X.Utility.lookupObjects(options as any) as Promise<LookupResult[]>;
        },

        tryRefreshSubgrid(fc: any, name?: string) {
            if (!name) return;
            const grid = fc.getControl?.(name);
            if (grid && grid.refresh) {
                try { grid.refresh(); } catch { /* ignore */ }
            } else {
                try { fc.ui.refreshRibbon(); } catch { /* ignore */ }
            }
        }
    };

    // expose only what the handler needs
    return { runAssociateFlow };
})();


// =====================
// SMALL RE-EXPORT OF HELPERS (if you need them elsewhere)
// =====================
const Helpers = {
    sanitizeGuid(id?: string): string {
        return (id || "").replace(/[{}]/g, "").toLowerCase();
    },
    getCurrentId(fc: any): string | null {
        const idRaw = fc?.data?.entity?.getId?.();
        return idRaw ? Helpers.sanitizeGuid(idRaw) : null;
    },
    getLookupId(fc: any, attrName: string): string | undefined {
        const v = fc.getAttribute?.(attrName)?.getValue?.();
        const id = v && v.length ? Helpers.sanitizeGuid(v[0].id) : undefined;
        return id;
    },
    unique<T>(arr: T[]): T[] {
        return Array.from(new Set(arr));
    }
};
