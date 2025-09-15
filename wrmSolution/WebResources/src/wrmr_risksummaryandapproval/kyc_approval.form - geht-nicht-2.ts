const CONFIG = {
    approvalLogicalName: "wrmr_risksummaryandapproval",
    relationshipSchemaName: "mhwrmb_risksummaryandapproval2prortfolio", // N:N Relationship SchemaName
    approvalContactField: "wrmr_contactid",
    approvalCompanyField: "wrmr_companyid",
    configTableName: "wrmb_portfoliorelationship",
    configAccountField: "wrmb_portfolioid",
    configContactField: "wrmb_contactid",
    configCompanyField: "wrmb_companyid",
    subgridName: "wrm_subgrid_accounts"
} as const;

const cleanId = (id: string) => id.replace(/[{}]/g, "");

export function hasContactOrCompany(primaryControl: Xrm.FormContext): boolean {
    const fc = primaryControl;
    const contactAttr = fc.getAttribute(CONFIG.approvalContactField) as Xrm.Attributes.LookupAttribute | null;
    const companyAttr = fc.getAttribute(CONFIG.approvalCompanyField) as Xrm.Attributes.LookupAttribute | null;

    const contactVal = contactAttr?.getValue();
    const companyVal = companyAttr?.getValue();

    return (Array.isArray(contactVal) && contactVal.length > 0) ||
        (Array.isArray(companyVal) && companyVal.length > 0);
}

export async function addAllowedAccounts(primaryControl: Xrm.FormContext): Promise<void> {
    Xrm.Navigation.openAlertDialog({ text: "Button hit" });

    const fc = primaryControl;
    const approvalId = cleanId(fc.data.entity.getId() || "");       

    if (!approvalId) {
        await Xrm.Navigation.openAlertDialog({ text: "Bitte speichern Sie das Approval zuerst." });
        return;
    }

    // Lookup-Werte sicher lesen
    const contactAttr = fc.getAttribute(CONFIG.approvalContactField) as Xrm.Attributes.LookupAttribute | null;
    const companyAttr = fc.getAttribute(CONFIG.approvalCompanyField) as Xrm.Attributes.LookupAttribute | null;

    const contactVal = contactAttr?.getValue();
    const companyVal = companyAttr?.getValue();

    if (!(Array.isArray(contactVal) && contactVal.length) &&
        !(Array.isArray(companyVal) && companyVal.length)) {
        await Xrm.Navigation.openAlertDialog({ text: "Bitte wählen Sie zuerst Contact oder Company im Approval." });
        return;
    }

    // Lookup mit Filter öffnen
    const filterXml = buildAccountFilterXml(contactVal || null, companyVal || null);
    const lookupOptions: Xrm.LookupOptions = {
        defaultEntityType: "wrmb_portfolio",
        entityTypes: ["wrmb_portfolio"],
        allowMultiSelect: true,
        filters: [{ entityLogicalName: "wrmb_portfolio", filterXml }],
        searchText: "Zulässige Accounts auswählen"
    };

    try {
        const selected = await Xrm.Utility.lookupObjects(lookupOptions);
        if (!Array.isArray(selected) || selected.length === 0) return;

        // Verknüpfen (N:N)
        await Promise.all(
            selected.map(s =>
                associateNtoN(
                    CONFIG.approvalLogicalName,
                    approvalId,
                    CONFIG.relationshipSchemaName,
                    "wrmb_portfolio",
                    cleanId(s.id)
                )
            )
        );

        // Subgrid refresh
        const grid = fc.getControl<Xrm.Controls.GridControl>(CONFIG.subgridName);
        grid?.refresh?.();

    } catch (err: any) {
        console.error(err);
        await Xrm.Navigation.openErrorDialog({
            message: err?.message || "Fehler beim Verknüpfen der Accounts."
        });
    }
}

/** Baut FilterXml für das Account-Lookup via link-entity auf die Konfigurationstabelle */
function buildAccountFilterXml(
    contactVal: Xrm.LookupValue[] | null,
    companyVal: Xrm.LookupValue[] | null
): string {
    const contactId = (Array.isArray(contactVal) && contactVal[0]?.id) ? cleanId(contactVal[0].id) : null;
    const companyId = (Array.isArray(companyVal) && companyVal[0]?.id) ? cleanId(companyVal[0].id) : null;

    let where = "";
    if (contactId && companyId) {
        where = `
    <filter type='or'>
        <condition attribute='${CONFIG.configContactField}' operator='eq' value='${contactId}' />
        <condition attribute='${CONFIG.configCompanyField}' operator='eq' value='${companyId}' />
    </filter>`;
    } else if (contactId) {
        where = `
    <filter type='and'>
        <condition attribute='${CONFIG.configContactField}' operator='eq' value='${contactId}' />
    </filter>`;
    } else if (companyId) {
        where = `
    <filter type='and'>
        <condition attribute='${CONFIG.configCompanyField}' operator='eq' value='${companyId}' />
    </filter>`;
    }

    return `
    
    <link-entity name='${CONFIG.configTableName}' from='${CONFIG.configAccountField}' to='wrmb_portfolioid' alias='rel'>
        ${where}
    </link-entity>`;
    
}

/**
    * N:N-Verknüpfung robust herstellen.
    * 1) Versucht Xrm.WebApi.associateRecord (falls vorhanden)
    * 2) Fällt zurück auf $ref-POST gegen den Relationship-Navigation-Pfad
    */
async function associateNtoN(
    primaryEntity: string,
    primaryId: string,
    relationshipSchemaName: string,
    relatedEntity: string,
    relatedId: string
): Promise<void> {
    const anyWebApi = Xrm.WebApi as any;

    // 1) Happy Path: associateRecord vorhanden
    if (typeof anyWebApi.associateRecord === "function") {
        await anyWebApi.associateRecord(primaryEntity, primaryId, relationshipSchemaName, relatedEntity, relatedId);
        return;
    }

    // 2) Fallback: $ref Endpoint direkt
    // Pfad: /api/data/v9.2/<primarySet>(<id>)/<relationshipSchemaName>/$ref
    // Body: { "@odata.id": "<url>/api/data/v9.2/<relatedSet>(<id>)" }
    const gc = Xrm.Utility.getGlobalContext();
    const baseUrl = gc.getClientUrl();
    const version = "v9.2";

    const primarySet = await getEntitySetName(primaryEntity);
    const relatedSet = await getEntitySetName(relatedEntity);

    const targetUrl = `${baseUrl}/api/data/${version}/${primarySet}(${primaryId})/${relationshipSchemaName}/$ref`;
    const body = {
        "@odata.id": `${baseUrl}/api/data/${version}/${relatedSet}(${relatedId})`
    };

    const req = {
        method: "POST",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify(body),
        url: targetUrl
    };

    // execute raw request
    const response = await (Xrm.WebApi.online as any).execute(req);
    if (!response.ok) {
        throw new Error(`Associate failed: ${response.status} ${response.statusText}`);
    }
}

/** Ermittelt zur LogicalName den EntitySet-Namen (z. B. "accounts" für "account") */
async function getEntitySetName(logicalName: string): Promise<string> {
    // Ab Dataverse Client API verfügbar:
    const md = await Xrm.Utility.getEntityMetadata(logicalName);
    // @ts-ignore – ältere Typings kennen EntitySetName ggf. nicht
    const setName = (md as any)?.EntitySetName || (md as any)?.EntitySetName?.toString?.();
    if (!setName) throw new Error(`EntitySetName not found for ${logicalName}`);
    return setName;
}
