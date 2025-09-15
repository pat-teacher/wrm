// Datei: WebResources/src/wrmr_risksummaryandapproval/kyc_approval.form.ts
// HINWEIS: Keine TS-namespace! Wir exportieren Funktionen, die Webpack als globale Funktionen bereitstellt.

// ======= KONFIGURATION (ANPASSEN) =======
const REL_TABLE = "wrmb_portfoliorelationship";            // Beziehungstabelle
const REL_FK_ACCOUNT = "wrmb_portfolioid";                 // Lookup -> account in REL_TABLE
const REL_FK_CONTACT = "wrmb_contactid";                   // Lookup -> contact in REL_TABLE
const REL_FK_COMPANY = "wrmr_companyid";                   // Lookup -> company in REL_TABLE

const MAIN_ENTITY = "wrmr_risksummaryandapproval";     // Hauptentität (dein Formular)
const FORM_ATTR_CONTACT = "wrmr_contactid";                // Formularfeld: contact (Lookup)
const FORM_ATTR_COMPANY = "wrmr_companyid";                // Formularfeld: company (Lookup)
const N2N_NAV = "mhwrmb_risksummaryandapproval2prortfolio";// Navigation-Name der n:n-Beziehung (aus Metadaten)
const SUBGRID_NAME_TO_REFRESH = "wrm_subgrid_accounts";    // optional: Subgrid-Name im Formular

// ======= ÖFFENTLICHER RIBBON-HANDLER =======
export async function addAllowedAccounts(primaryControl: any) {
    const X = (window as any).Xrm;
    try {
        const fc = primaryControl; // FormContext
        const currentId = getCurrentId(fc);
        if (!currentId) {
            await X.Navigation.openAlertDialog({ text: "Bitte Datensatz zuerst speichern." });
            return;
        }

        const contactId = getLookupId(fc, FORM_ATTR_CONTACT);
        const companyId = getLookupId(fc, FORM_ATTR_COMPANY);
        if (!contactId && !companyId) {
            await X.Navigation.openAlertDialog({ text: "Bitte zuerst Contact oder Company setzen." });
            return;
        }

        // 1) Kandidaten-Accounts über Relationship-Tabelle ermitteln
        const accountIds = await getCandidateAccountIds(contactId, companyId);
        if (accountIds.length === 0) {
            await X.Navigation.openAlertDialog({ text: "Keine passenden Accounts gefunden." });
            return;
        }

        // 2) Multi-Select Lookup mit IN-Filter öffnen (nur Kandidaten anzeigen)
        const selection = await openAccountPicker(accountIds);
        if (!selection || selection.length === 0) return;
        
        
        // 4) n:n-Verknüpfungen erstellen
        X.Utility.showProgressIndicator("Verknüpfe Accounts...");
        let ok = 0, fail = 0;
        for (const item of selection) {
            const accountId = sanitizeGuid(item.id);
            try {
                await X.WebApi.associateRecord(MAIN_ENTITY, currentId, N2N_NAV, "wrmb_portfolio", accountId);
                ok++;
            } catch {
                fail++;
            }
        }
        X.Utility.closeProgressIndicator();

        // 5) Subgrid refresh (falls konfiguriert)
        tryRefreshSubgrid(fc, SUBGRID_NAME_TO_REFRESH);

        await X.Navigation.openAlertDialog({
            text: `Fertig.\nErfolgreich: ${ok}${fail ? `  •  Fehlgeschlagen: ${fail}` : ""}`
        });
    } catch (err: any) {
        (window as any).Xrm?.Utility?.closeProgressIndicator?.();
        await (window as any).Xrm?.Navigation?.openErrorDialog?.({ message: err?.message ?? String(err) });
    }
}

// ======= KERNE: Kandidaten-IDs aus Relationship holen (nur contact/company-Filter) =======
async function getCandidateAccountIds(contactId?: string, companyId?: string): Promise<string[]> {
    const X = (window as any).Xrm;

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
      </entity>
    </fetch>`.trim();

    const res = await X.WebApi.retrieveMultipleRecords(
        REL_TABLE,
        `?fetchXml=${encodeURIComponent(fetchXml)}`
    );

    const ids = new Set<string>();
    for (const e of res.entities) {
        const id = sanitizeGuid(
            e[`_${REL_FK_ACCOUNT}_value`] || e[REL_FK_ACCOUNT]
        );
        if (id) ids.add(id);
    }
    return Array.from(ids);
}

// ======= UI: Multi-Select Lookup nur mit diesen Account-IDs =======
async function openAccountPicker(accountIds: string[]) {
    const X = (window as any).Xrm;

    const inValues = accountIds
        .map(id => `<value uitype="wrmb_portfolio">{${sanitizeGuid(id)}}</value>`)
        .join("");

    const filterXml = `
    <filter type="and">
      <condition attribute="wrmb_portfolioid" operator="in">
        ${inValues}
      </condition>
    </filter>`.trim();


    const options = {
        allowMultiSelect: true,
        defaultEntityType: "wrmb_portfolio",
        entityTypes: ["wrmb_portfolio"],
        defaultViewId: "1fa782c6-4f87-f011-b4cc-002248dacc70",
        filters: [{ entityLogicalName: "wrmb_portfolio", filterXml }],
        disableMru: true // Nur gefilterte Objekte anzeigen, keine Recent Objects
    };

    return X.Utility.lookupObjects(options as any);
}

// ======= Helpers =======
function getCurrentId(fc: any): string | null {
    const idRaw = fc?.data?.entity?.getId?.();
    return idRaw ? sanitizeGuid(idRaw) : null;
}
function getLookupId(fc: any, attrName: string): string | undefined {
    const v = fc.getAttribute?.(attrName)?.getValue?.();
    const id = v && v.length ? sanitizeGuid(v[0].id) : undefined;
    return id;
}
function sanitizeGuid(id?: string): string {
    return (id || "").replace(/[{}]/g, "").toLowerCase();
}
function tryRefreshSubgrid(fc: any, name?: string) {
    if (!name) return;
    const grid = fc.getControl?.(name);
    if (grid && grid.refresh) {
        try { grid.refresh(); } catch { }
    } else {
        try { fc.ui.refreshRibbon(); } catch { }
    }
}
