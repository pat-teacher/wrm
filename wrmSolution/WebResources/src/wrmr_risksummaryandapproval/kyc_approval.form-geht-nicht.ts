const CONFIG = {
    controlName: "wrm_multiselectlookupcontrol", // Name des Multiselect Lookup Controls
    targetEntity: "wrmb_portfolio",                 // Ziel-Entity des Lookups
    // Felder am Approval:
    approvalContactField: "wrmr_contactid",
    approvalCompanyField: "wrmr_companyid",
    // Konfigurationstabelle + Spalten:
    configTable: "wrmb_portfoliorelationship",
    cfgAccountField: "wrmb_portfolioid",   // ? account
    cfgContactField: "wrmb_contactid",   // ? contact
    cfgCompanyField: "wrmb_companyid"    // ? company/account
} as const;

const cleanId = (id?: string) => (id ? id.replace(/[{}]/g, "") : "");

/** Formular OnLoad: PreSearch registrieren */
export function onLoad(executionContext: Xrm.Events.EventContext): void {
    const formContext = executionContext.getFormContext();

    const ctrl = formContext.getControl(CONFIG.controlName) as Xrm.Controls.LookupControl | null;
    if (!ctrl) {
        console.warn(`Lookup control '${CONFIG.controlName}' not found`);
        return;
    }

    // Defensive: pr¸fe, ob das Control PreSearch/CustomFilter unterst¸tzt
    const anyCtrl = ctrl as any;
    if (typeof anyCtrl.addPreSearch !== "function" || typeof anyCtrl.addCustomFilter !== "function") {
        console.warn("Control supports no addPreSearch/addCustomFilter (PCF limitation/version).");
        return;
    }

    // Bei jedem ÷ffnen des Lookups Filter neu setzen
    anyCtrl.addPreSearch(() => {
        try {
            const contactAttr = formContext.getAttribute(CONFIG.approvalContactField) as Xrm.Attributes.LookupAttribute | null;
            const companyAttr = formContext.getAttribute(CONFIG.approvalCompanyField) as Xrm.Attributes.LookupAttribute | null;

            const contactVal = contactAttr?.getValue();  // Xrm.LookupValue[] | null
            const companyVal = companyAttr?.getValue();  // Xrm.LookupValue[] | null

            const contactId = Array.isArray(contactVal) && contactVal[0]?.id ? cleanId(contactVal[0].id) : null;
            const companyId = Array.isArray(companyVal) && companyVal[0]?.id ? cleanId(companyVal[0].id) : null;

            // Wenn nichts gesetzt, optional kein Filter ? alles anzeigen (oder leeren Filter setzen)
            if (!contactId && !companyId) {
                // Keine Einschr‰nkung
                return;
            }

            const where =
                contactId && companyId
                    ? `<filter type='or'>
                 <condition attribute='${CONFIG.cfgContactField}' operator='eq' value='${contactId}' />
                 <condition attribute='${CONFIG.cfgCompanyField}' operator='eq' value='${companyId}' />
               </filter>`
                    : contactId
                        ? `<filter type='and'>
                   <condition attribute='${CONFIG.cfgContactField}' operator='eq' value='${contactId}' />
                 </filter>`
                        : `<filter type='and'>
                   <condition attribute='${CONFIG.cfgCompanyField}' operator='eq' value='${companyId}' />
                 </filter>`;

            // Filter bezieht sich auf die ZIEL?Entity (account) ? link-entity zur Konfigurationstabelle
            const fetchFilter = `
          <filter type='and'>
            <link-entity name='${CONFIG.configTable}' from='${CONFIG.cfgAccountField}' to='accountid' alias='rel'>
              ${where}
            </link-entity>
          </filter>`;

            anyCtrl.addCustomFilter(fetchFilter, CONFIG.targetEntity);
        } catch (e) {
            console.error("addPreSearch filter error:", e);
        }
    });

    // Optional: bei ƒnderungen von Contact/Company Lookup-Cache Ñauffrischenì
    // (Filter greift ohnehin beim ÷ffnen; das hier hilft, falls Control cached)
    const refreshFilter = () => {
        try {
            // kurzer Trick: eine leere Suche anstoﬂen, indem wir die Datenquelle anstoﬂen
            // Viele Controls brauchen das nicht ñ kann sonst weggelassen werden.
            (ctrl as any)?.refresh?.();
        } catch { /* noop */ }
    };

    (formContext.getAttribute(CONFIG.approvalContactField) as any)?.addOnChange(refreshFilter);
    (formContext.getAttribute(CONFIG.approvalCompanyField) as any)?.addOnChange(refreshFilter);
}
