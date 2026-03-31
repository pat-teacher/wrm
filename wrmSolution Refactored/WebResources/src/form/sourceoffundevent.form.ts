import { CONTACT } from "./../entities/Contact.entity";
import { COMPANY } from "../entities/Company.entity";
import { SOURCEOFFUNDEVENT } from "./../entities/SourceOfFundEvent.entity";
import { FormWait, OwnerHelper, OwnerRef, FormTypeHelper, SecurityService, FormControlHelper, VisibilityHelper, OwnerService, LookupViewHelper } from "./../core/crm.core";
import { SECURITY_ROLES } from "../core/SecurityRoles";

let _desiredOwner: OwnerRef | null = null;
const DATE_FORMATTER = new Intl.DateTimeFormat("de-CH");

export async function onLoad(executionContext: Xrm.Events.EventContext) {
    const fc = executionContext.getFormContext();
    // Configure owner lookup (also reusable for onChange)
    configureOwnerLookup(fc);
    await applyComplianceOfficerAccess(fc);
    await ensureOwnerFromContactOrAccountOnCreate(fc);
    // Apply mutual read-only logic between contact and account and wire change handlers
    applyMutualReadOnlyContactAccount(fc);
    try {
        const contactAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.contactid) as Xrm.Attributes.LookupAttribute | undefined;
        const accountAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.accountid) as Xrm.Attributes.LookupAttribute | undefined;
        const softypeAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.softype) as Xrm.Attributes.OptionSetAttribute | undefined;
        const periodStartAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.periodstart) as Xrm.Attributes.Attribute | undefined;
        const periodEndAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.periodend) as Xrm.Attributes.Attribute | undefined;
        const complianceStatusAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.compliancestatus) as Xrm.Attributes.OptionSetAttribute | undefined;
        complianceStatusAttr?.addOnChange(async () => { await applyComplianceOfficerAccess(fc); applyMutualReadOnlyContactAccount(fc); });
        const handler = () => { applyMutualReadOnlyContactAccount(fc); void ensureOwnerFromContactOrAccountOnCreate(fc); };
        const nameSyncHandler = () => { syncNameFromSourceOfFundFields(fc); };
        contactAttr?.addOnChange(handler);
        accountAttr?.addOnChange(handler);
        softypeAttr?.addOnChange(nameSyncHandler);
        periodStartAttr?.addOnChange(nameSyncHandler);
        periodEndAttr?.addOnChange(nameSyncHandler);
    } catch { /* ignore */ }
    syncNameFromSourceOfFundFields(fc);
}

/** Enables compliance fields for users with WRM Compliance Officer role */
async function applyComplianceOfficerAccess(fc: Xrm.FormContext): Promise<void> {
    try {
        const controlsToDisableInGeneralInformationSection: string[] = [
            SOURCEOFFUNDEVENT.fields.ownerid,
            SOURCEOFFUNDEVENT.fields.contactid,
            SOURCEOFFUNDEVENT.fields.accountid
        ];
        const controlsToDisableWealthInformationSection: string[] = [
            SOURCEOFFUNDEVENT.fields.softype,
            SOURCEOFFUNDEVENT.fields.periodstart,
            SOURCEOFFUNDEVENT.fields.periodend,
            SOURCEOFFUNDEVENT.fields.estamount_usd_pa,
            SOURCEOFFUNDEVENT.fields.estamount_usd_period,
            SOURCEOFFUNDEVENT.fields.shortdescription,
            SOURCEOFFUNDEVENT.fields.supportingdoc
        ];
        const isComplianceOfficer = await SecurityService.hasCurrentUserRole(SECURITY_ROLES.WRM_COMPLIANCE_OFFICER);
        // Compliance Officer: always enabled (field-level security governs actual permission)
        if (isComplianceOfficer) {
            FormControlHelper.setDisabledNamedControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, controlsToDisableInGeneralInformationSection, false);
            FormControlHelper.setDisabledNamedControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, controlsToDisableWealthInformationSection, false);            
            return;
        }

        // Non Officer: default disabled
        FormControlHelper.setDisabledNamedControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, controlsToDisableInGeneralInformationSection, true);
        FormControlHelper.setDisabledNamedControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, controlsToDisableWealthInformationSection, true);        
        
        if (isComplianceStatusPendingOrRejected(fc)) {
            FormControlHelper.setDisabledNamedControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, controlsToDisableInGeneralInformationSection, false);
            FormControlHelper.setDisabledNamedControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, controlsToDisableWealthInformationSection, false);            
        }
    } catch { /* ignore */ }
}

/**
 * On create-like forms, set owner to the contact's owner; if not available, fallback to the account's owner.
 */
async function ensureOwnerFromContactOrAccountOnCreate(fc: Xrm.FormContext): Promise<void> {
    if (!FormTypeHelper.isCreateLike(FormTypeHelper.get(fc))) return;

    const contactAttrName = SOURCEOFFUNDEVENT.fields.contactid;
    const accountAttrName = SOURCEOFFUNDEVENT.fields.accountid;
    const ownerAttrName = SOURCEOFFUNDEVENT.fields.ownerid;

    if (!OwnerHelper.getOwnerAttribute(fc, ownerAttrName)) return;

    // Parallel wait for both lookups (contact prioritized). Account timeout shorter.
    const [contactLookupRaw, accountLookupRaw] = await Promise.all([
        FormWait.waitForLookupValue(fc, contactAttrName, 4000),
        FormWait.waitForLookupValue(fc, accountAttrName, 2500)
    ]);
    const contactLookup = contactLookupRaw || undefined;
    const accountLookup = accountLookupRaw || undefined;

    let resolvedOwner: OwnerRef | null = null;
    if (contactLookup?.id) {
        resolvedOwner = await OwnerService.getOwnerRef(CONTACT.entity, contactLookup.id, CONTACT.fields.ownerid);
    }
    if (!resolvedOwner && accountLookup?.id) {
        resolvedOwner = await OwnerService.getOwnerRef(COMPANY.entity, accountLookup.id, COMPANY.fields.ownerid);
    }

    if (!resolvedOwner) return;

    _desiredOwner = resolvedOwner;
    const currentOwner = OwnerHelper.getCurrentOwner(fc, ownerAttrName);
    if (!OwnerHelper.isSameOwner(currentOwner, resolvedOwner)) {
        OwnerHelper.setOwner(fc, ownerAttrName, resolvedOwner);
    }
}

export function onSave(executionContext: Xrm.Events.SaveEventContext) {
    const fc = executionContext.getFormContext();
    const ownerAttrName = SOURCEOFFUNDEVENT.fields.ownerid;
    if (!_desiredOwner) return;

    const currentOwner = OwnerHelper.getCurrentOwner(fc, ownerAttrName);
    if (!OwnerHelper.isSameOwner(currentOwner, _desiredOwner)) {
        OwnerHelper.setOwner(fc, ownerAttrName, _desiredOwner);
    }
}

/**
 * Configure owner lookup to show only Teams and default to current user's teams.
 * Can be reused from onLoad and from field onChange handlers if needed.
 */
function configureOwnerLookup(fc: Xrm.FormContext): void {
    try {
        LookupViewHelper.setEntityTypes(fc, SOURCEOFFUNDEVENT.fields.ownerid, ["team"]);
        LookupViewHelper.addOwnerTeamViewForCurrentUser(fc, SOURCEOFFUNDEVENT.fields.ownerid);
    } catch { /* ignore */ }
}

/** Optional exported onChange handler to re-apply owner lookup configuration */
export function onOwnerLookupRefresh(executionContext: Xrm.Events.EventContext): void {
    const fc = executionContext.getFormContext();
    configureOwnerLookup(fc);
}

/**
 * Mutual read-only between contact and account:
 * - If contact has value and account is empty, account becomes read-only
 * - If account has value and contact is empty, contact becomes read-only
 * - Otherwise (both empty or both set), both are editable
 */
function applyMutualReadOnlyContactAccount(fc: Xrm.FormContext): void {
    if (isComplianceStatusPendingOrRejected(fc)) {
        const contactField = SOURCEOFFUNDEVENT.fields.contactid;
        const accountField = SOURCEOFFUNDEVENT.fields.accountid;

        const contactAttr = fc.getAttribute?.(contactField) as Xrm.Attributes.LookupAttribute | undefined;
        const accountAttr = fc.getAttribute?.(accountField) as Xrm.Attributes.LookupAttribute | undefined;

        const hasContact = !!contactAttr?.getValue?.()?.[0]?.id;
        const hasAccount = !!accountAttr?.getValue?.()?.[0]?.id;

        // exactly one set => disable the other; default: enable both
        if (hasContact && !hasAccount) {
            VisibilityHelper.setDisabled(fc, accountField, true);
            VisibilityHelper.setDisabled(fc, contactField, false);
            return;
        }

        if (hasAccount && !hasContact) {
            VisibilityHelper.setDisabled(fc, contactField, true);
            VisibilityHelper.setDisabled(fc, accountField, false);
            return;
        }

        VisibilityHelper.setDisabled(fc, contactField, false);
        VisibilityHelper.setDisabled(fc, accountField, false);
    }    
}

/**
 * Checks if the compliance status is PENDING, REJECTED, or null.
 * @param fc The form context.
 * @returns True if the compliance status is PENDING, REJECTED, or null; otherwise, false.
 */
function isComplianceStatusPendingOrRejected(fc: Xrm.FormContext): boolean {
    const statusAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.compliancestatus) as Xrm.Attributes.OptionSetAttribute | undefined;
    const statusVal = statusAttr?.getValue?.();
    return (
        statusVal === SOURCEOFFUNDEVENT.options.compliancestatus.PENDING ||
        statusVal === SOURCEOFFUNDEVENT.options.compliancestatus.REJECTED ||
        statusVal === null
    );
}

function syncNameFromSourceOfFundFields(fc: Xrm.FormContext): void {
    try {
        const nameAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.name) as Xrm.Attributes.StringAttribute | undefined;
        if (!nameAttr) return;

        const softype = getSoftypeNamePart(fc);
        const periodStart = getDateNamePart(fc, SOURCEOFFUNDEVENT.fields.periodstart);
        const periodEnd = getDateNamePart(fc, SOURCEOFFUNDEVENT.fields.periodend);

        const nextName = [softype, periodStart, periodEnd].filter(Boolean).join("-");
        const currentName = nameAttr.getValue?.() ?? "";
        const targetName = nextName || null;

        if (currentName !== (targetName ?? "")) {
            nameAttr.setValue(targetName);
        }
    } catch { /* ignore */ }
}

function getSoftypeNamePart(fc: Xrm.FormContext): string {
    const softypeAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.softype) as Xrm.Attributes.OptionSetAttribute | undefined;
    if (!softypeAttr) return "";

    const text = softypeAttr.getText?.();
    if (typeof text === "string" && text.trim()) return text.trim();

    const value = softypeAttr.getValue?.();
    if (value === null || value === undefined) return "";
    return String(value).trim();
}

function getDateNamePart(fc: Xrm.FormContext, attributeName: string): string {
    const attr = fc.getAttribute<Xrm.Attributes.DateAttribute>(attributeName);
    const rawValue = attr?.getValue();
    if (!rawValue) return "";

    const date = new Date(rawValue);
    if (Number.isNaN(date.getTime())) return "";
    return DATE_FORMATTER.format(date);
}
