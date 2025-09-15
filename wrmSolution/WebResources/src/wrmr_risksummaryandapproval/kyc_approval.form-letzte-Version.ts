const CONFIG = {
    approvalLogicalName: "wrmr_risksummaryandapproval",
    relationshipSchemaName: "mhwrmb_risksummaryandapproval2prortfolio", // N:N Relationship SchemaName
    approvalContactField: "wrmr_contactid",
    approvalCompanyField: "wrmr_companyid",
    subgridName: "wrm_subgrid_accounts",

    portfolioEntity: "wrmb_portfolio",
    portfolioIdAttr: "wrmb_portfolioid",
    portfolioNameAttr: "wrmb_id",

    // <-- WICHTIG: GUID deiner (gefilterten) System-/Persönlichen Ansicht eintragen
    defaultViewId: "0D5D377B-5E7C-47B5-BAB1-A5CB8B4AC10"
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
    const fc = primaryControl;
    const approvalId = cleanId(fc.data.entity.getId() || "");
    if (!approvalId) {
        await Xrm.Navigation.openAlertDialog({ text: "Bitte speichern Sie das Approval zuerst." });
        return;
    }

    // Sicherstellen, dass mind. Contact ODER Company gesetzt ist (deine Business-Regel)
    if (!hasContactOrCompany(fc)) {
        await Xrm.Navigation.openAlertDialog({ text: "Bitte wählen Sie zuerst Contact oder Company im Approval." });
        return;
    }

    // --- Standard-Dialog mit View öffnen (kein filters/filterXml nötig) ---
    const lookupOptions: Xrm.LookupOptions = {
        defaultEntityType: CONFIG.portfolioEntity,
        entityTypes: [CONFIG.portfolioEntity],
        allowMultiSelect: true,
        defaultViewId: CONFIG.defaultViewId,     // <- deine View enthält die Filterlogik
        // optional: weitere Views erlauben
        // viewIds: [CONFIG.defaultViewId, "00000000-0000-0000-00AA-000010001003"],
    };

    try {
        const selected = await Xrm.Utility.lookupObjects(lookupOptions);
        if (!Array.isArray(selected) || selected.length === 0) return;

        // N:N-Verknüpfung nach Auswahl
        await Promise.all(
            selected.map(s =>
                associateNtoN(
                    CONFIG.approvalLogicalName,
                    approvalId,
                    CONFIG.relationshipSchemaName,
                    CONFIG.portfolioEntity,
                    cleanId(s.id)
                )
            )
        );

        // Subgrid refresh
        fc.getControl<Xrm.Controls.GridControl>(CONFIG.subgridName)?.refresh?.();

        await Xrm.Navigation.openAlertDialog({
            text: `Verknüpft: ${selected.length} Portfolio(s).`
        });

    } catch (err: any) {
        console.error(err);
        await Xrm.Navigation.openErrorDialog({
            message: err?.message || "Fehler beim Verknüpfen."
        });
    }
}

/**
 * N:N-Verknüpfung robust herstellen:
 * 1) Versuche Xrm.WebApi.associateRecord
 * 2) Fallback: $ref via fetch (kein WebApi.online.execute!)
 */
async function associateNtoN(
    primaryEntity: string,
    primaryId: string,
    relationshipSchemaName: string, // SchemaName der N:N-Relationship
    relatedEntity: string,
    relatedId: string
): Promise<void> {
    const anyWebApi = Xrm.WebApi as any;

    if (typeof anyWebApi.associateRecord === "function") {
        await anyWebApi.associateRecord(primaryEntity, primaryId, relationshipSchemaName, relatedEntity, relatedId);
        return;
    }

    // Fallback: $ref via fetch
    const gc = Xrm.Utility.getGlobalContext();
    const baseUrl = gc.getClientUrl();
    const version = "v9.2";

    const [primarySet, relatedSet] = await Promise.all([
        getEntitySetName(primaryEntity),
        getEntitySetName(relatedEntity)
    ]);

    // Navigation-Property zur Relationship ermitteln (kann vom SchemaName abweichen)
    const navProp =
        (await getManyToManyNavPropName(primaryEntity, relationshipSchemaName)) || relationshipSchemaName;

    const targetUrl = `${baseUrl}/api/data/${version}/${primarySet}(${primaryId})/${navProp}/$ref`;
    const body = { "@odata.id": `${baseUrl}/api/data/${version}/${relatedSet}(${relatedId})` };

    const res = await fetch(targetUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0"
        },
        body: JSON.stringify(body),
        credentials: "same-origin"
    });

    if (!res.ok) {
        // 412/409 = evtl. bereits verknüpft → optional ignorieren
        const text = await res.text().catch(() => "");
        throw new Error(`Associate failed: ${res.status} ${res.statusText} ${text}`);
    }
}

/** EntitySet-Name (z. B. "accounts" für "account") */
async function getEntitySetName(logicalName: string): Promise<string> {
    const md: any = await Xrm.Utility.getEntityMetadata(logicalName);
    const setName = md?.EntitySetName?.toString?.();
    if (!setName) throw new Error(`EntitySetName not found for ${logicalName}`);
    return setName;
}

/** Liefert die Navigation-Property für die angegebene N:N-Relationship auf der Primary-Entity */
async function getManyToManyNavPropName(
    primaryEntity: string,
    relationshipSchemaName: string
): Promise<string | null> {
    const md: any = await Xrm.Utility.getEntityMetadata(primaryEntity, ["ManyToManyRelationships"]);
    const rel = (md?.ManyToManyRelationships || []).find((r: any) => r.SchemaName === relationshipSchemaName);
    if (!rel) return null;

    if (rel.Entity1LogicalName === primaryEntity) return rel.Entity1NavigationPropertyName || null;
    if (rel.Entity2LogicalName === primaryEntity) return rel.Entity2NavigationPropertyName || null;

    return rel.Entity1NavigationPropertyName || rel.Entity2NavigationPropertyName || null;
}
