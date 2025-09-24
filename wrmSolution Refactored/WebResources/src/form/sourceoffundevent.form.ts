import { CONTACT } from "./../entities/Contact.entity";
import { COMPANY } from "../entities/Company.entity";
import { SOURCEOFFUNDEVENT } from "./../entities/SourceOfFundEvent.entity";
import { FormWait, OwnerHelper, OwnerRef, FormTypeHelper, SecurityService, VisibilityHelper, OwnerService } from "./../core/crm.core";
import { SECURITY_ROLES } from "../core/SecurityRoles";

let _desiredOwner: OwnerRef | null = null;

export async function onLoad(executionContext: Xrm.Events.EventContext) {
    const fc = executionContext.getFormContext();
    await applyComplianceOfficerAccess(fc);
    await ensureOwnerFromContactOrAccountOnCreate(fc);
}

/** Enables compliance fields for users with WRM Compliance Officer role */
async function applyComplianceOfficerAccess(fc: Xrm.FormContext): Promise<void> {
    try {
        const isComplianceOfficer = await SecurityService.hasCurrentUserRole(SECURITY_ROLES.WRM_COMPLIANCE_OFFICER);
        // Compliance Officer: always enabled (field-level security governs actual permission)
        if (isComplianceOfficer) {
            VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, false);
            VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, false);
            VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.COMPLIANCE_SECTION, false);
            return;
        }

        // Non Officer: default disabled
        VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, true);
        VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, true);
        VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.COMPLIANCE_SECTION, true);

        const statusAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.compliancestatus) as Xrm.Attributes.OptionSetAttribute | undefined;
        const statusVal = statusAttr?.getValue?.();
        if (statusVal === SOURCEOFFUNDEVENT.options.compliancestatus.PENDING || statusVal === SOURCEOFFUNDEVENT.options.compliancestatus.REJECTED) {
            VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.GENERAL_INFORMATION_SECTION, false);
            VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.WEALTH_INFORMATION_SECTION, false);
            VisibilityHelper.setDisabledAllControlsInSection(fc, SOURCEOFFUNDEVENT.tabs.GENERAL, SOURCEOFFUNDEVENT.sections.COMPLIANCE_SECTION, false);
        }
    } catch { /* ignore */ }
}

/**
 * On create-like forms, set owner to the contact's owner; if not available, fallback to the account's owner.
 */
async function ensureOwnerFromContactOrAccountOnCreate(fc: Xrm.FormContext): Promise<void> {
    const formType = FormTypeHelper.get(fc);
    if (!FormTypeHelper.isCreateLike(formType)) return; // only Create & QuickCreate

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
