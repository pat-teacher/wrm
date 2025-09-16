// Hinweis: Keine TS-Namespaces. Nur die beiden Handler werden exportiert.

import {
    RISKSUMMARYANDAPPROVAL,
    PORTFOLIO,
    PORTFOLIORELATIONSHIP,
    PORTFOLIORELATIONSHIPTYPE,
    ORIGINTYPE,
} from "../entities/index";

import {
    Util,
    ApiClient,
    FormHelper,
    GridHelper,
    VisibilityHelper,
    LookupDialogHelper,
    LookupService,
} from "../core/crm.core";

/**
 * FORM onLoad
 */
export async function onLoad(executionContext: any) {
    const fc = executionContext.getFormContext?.() ?? executionContext;

    if (isRecordInactive(fc)) {
        fc.ui?.setFormNotification?.(
            "This record is inactive. Actions are not available.",
            "WARNING",
            "record-inactive"
        );
        return; // stop further init work
    }

    try {
        await toggleAccountsSubgridForOriginType(fc);
        // OnChange-Handler für OriginTypeId hinzufügen
        fc.getAttribute?.(RISKSUMMARYANDAPPROVAL.fields.ambcustOriginTypeId)?.addOnChange(async () => {
            await toggleAccountsSubgridForOriginType(fc);
        });
    } catch {
        VisibilityHelper.setVisible(fc, RISKSUMMARYANDAPPROVAL.controls.subgridAccounts, false);
    }
}

/**
 * Ribbon-Command: Accounts hinzufügen (Associate in N:N)
 */
export async function addAllowedAccounts(primaryControl: any) {
    const fc = primaryControl;
    const xrm = (window as any).Xrm ?? Util.Xrm;

    if (isRecordInactive(fc)) {
        await xrm.Navigation.openAlertDialog({ text: "Record is inactive." });
        return;
    }

    const currentId = FormHelper.getCurrentId(fc);
    if (!currentId) {
        await xrm.Navigation.openAlertDialog({ text: "Please save the record first." });
        return;
    }

    const contactId = FormHelper.getLookupId(fc, RISKSUMMARYANDAPPROVAL.fields.contactId);
    const companyId = FormHelper.getLookupId(fc, RISKSUMMARYANDAPPROVAL.fields.companyId);

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
        const candidatesToOffer = candidateIds.filter(id => !alreadyLinked.has(Util.sanitizeGuid(id)));
        if (candidatesToOffer.length === 0) {
            await xrm.Navigation.openAlertDialog({ text: "All candidate accounts are already linked to this record." });
            return;
        }

        const selectedIds = await openCandidatePicker(fc, candidatesToOffer);
        if (selectedIds.length === 0) return;

        await associateSelectedPortfolios(currentId, selectedIds);

        GridHelper.tryRefreshSubgrid(fc, RISKSUMMARYANDAPPROVAL.controls.subgridAccounts);
    } catch (err: any) {
        await xrm.Navigation.openErrorDialog?.({ message: err?.message ?? String(err) });
    }
}

/* ---------------------------------- */
/*           helper functions         */
/* ---------------------------------- */

// Returns true if the current record is inactive (statecode = 1)
function isRecordInactive(fc: any): boolean {
    const statecodeAttribute = fc.getAttribute?.(RISKSUMMARYANDAPPROVAL.fields.statecode);
    const val = statecodeAttribute?.getValue?.();        // optionset number (0=Active, 1=Inactive)
    return val === 1 || val === "1";            // be defensive about type
}

async function toggleAccountsSubgridForOriginType(fc: any): Promise<void> {
    const accountOpeningId = await getAccountOpeningId();
    if (!accountOpeningId) {
        VisibilityHelper.setVisible(fc, RISKSUMMARYANDAPPROVAL.controls.subgridAccounts, false);
        return;
    }

    VisibilityHelper.showIfLookupEquals(
        fc,
        RISKSUMMARYANDAPPROVAL.fields.ambcustOriginTypeId,
        accountOpeningId,
        RISKSUMMARYANDAPPROVAL.controls.subgridAccounts
    );
}

async function getAccountOpeningId(): Promise<string | null> {
    return LookupService.getIdByEquality(
        ORIGINTYPE.entity,
        ORIGINTYPE.fields.pk,
        ORIGINTYPE.fields.typeNameCode,
        ORIGINTYPE.values.ACCOUNT_OPENING
    );
}

async function fetchCandidatePortfolioIds(contactId?: string, companyId?: string): Promise<string[]> {
    const orBlock = [
        contactId
            ? `<condition attribute="${PORTFOLIORELATIONSHIP.fields.contactId}" operator="eq" value="${Util.sanitizeGuid(contactId)}" />`
            : "",
        companyId
            ? `<condition attribute="${PORTFOLIORELATIONSHIP.fields.companyId}" operator="eq" value="${Util.sanitizeGuid(companyId)}" />`
            : "",
    ]
        .filter(Boolean)
        .join("");

    const fetchXml = `
    <fetch version="1.0" distinct="true">
      <entity name="${PORTFOLIORELATIONSHIP.entity}">
        <attribute name="${PORTFOLIORELATIONSHIP.fields.portfolioId}" />
        <filter type="and">
          <filter type="or">
            ${orBlock}
          </filter>
        </filter>
        <link-entity name="${PORTFOLIORELATIONSHIPTYPE.entity}"
                     from="${PORTFOLIORELATIONSHIPTYPE.fields.pk}"
                     to="${PORTFOLIORELATIONSHIP.fields.typeId}" alias="reltype">
          <filter>
            <condition attribute="${PORTFOLIORELATIONSHIPTYPE.fields.name}"
                       operator="eq"
                       value="${PORTFOLIORELATIONSHIPTYPE.options.NAME_PRINCIPAL}" />
          </filter>
        </link-entity>
      </entity>
    </fetch>`.trim();

    const res = await ApiClient.fetchXml(PORTFOLIORELATIONSHIP.entity, fetchXml);
    const ids = new Set<string>();
    for (const e of res.entities) {
        const id =
            Util.sanitizeGuid((e as any)[`_${PORTFOLIORELATIONSHIP.fields.portfolioId}_value`]) ||
            Util.sanitizeGuid((e as any)[PORTFOLIORELATIONSHIP.fields.portfolioId]);
        if (id) ids.add(id);
    }
    return Array.from(ids);
}

async function getAlreadyLinkedPortfolioIds(mainId: string): Promise<Set<string>> {
    const expand = `?$expand=${RISKSUMMARYANDAPPROVAL.relationships.portfolios.nav}($select=${PORTFOLIO.fields.pk})`;
    const rec = await ApiClient.retrieveRecord(RISKSUMMARYANDAPPROVAL.entity, mainId, expand);
    const list = (rec?.[RISKSUMMARYANDAPPROVAL.relationships.portfolios.nav] || []) as Array<any>;
    return new Set<string>(list.map(row => Util.sanitizeGuid(row[PORTFOLIO.fields.pk])));
}

async function openCandidatePicker(fc: any, candidateIds: string[]): Promise<string[]> {
    fc?.ui?.setFormNotification?.(
        "Showing accounts that match the selected Contact/Company. Already linked items are hidden.",
        "INFO",
        "account-filter-context"
    );

    const selection = await LookupDialogHelper.openWithIdList(
        PORTFOLIO.entity,
        PORTFOLIO.fields.pk,
        candidateIds,
        { allowMultiSelect: true, disableMru: true }
    );

    fc?.ui?.clearFormNotification?.("account-filter-context");

    if (!selection || selection.length === 0) return [];
    return Util.unique(selection.map(s => Util.sanitizeGuid(s.id)));
}

async function associateSelectedPortfolios(mainId: string, selectedIds: string[]): Promise<void> {
    if (!selectedIds.length) return;
    await ApiClient.associateManyToMany(
        RISKSUMMARYANDAPPROVAL.entity,
        mainId,
        RISKSUMMARYANDAPPROVAL.relationships.portfolios.schema,
        PORTFOLIO.entity,
        selectedIds
    );
}
