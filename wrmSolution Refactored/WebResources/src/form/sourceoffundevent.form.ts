import { CONTACT } from "./../entities/Contact.entity";
import { SOURCEOFFUNDEVENT } from "./../entities/SourceOfFundEvent.entity";
import { FormWait, OwnerHelper, OwnerRef, ContactOwnerService, FormTypeHelper, SecurityService, VisibilityHelper } from "./../core/crm.core";
import { SECURITY_ROLES } from "../core/SecurityRoles";

let _desiredOwner: OwnerRef | null = null;

export async function onLoad(executionContext: Xrm.Events.EventContext) {
    const fc = executionContext.getFormContext();
    await applyComplianceOfficerAccess(fc);
    await ensureOwnerFromContactOnCreate(fc);
}

/** Enables compliance fields for users with WRM Compliance Officer role */
async function applyComplianceOfficerAccess(fc: Xrm.FormContext): Promise<void> {
    try {
        const isComplianceOfficer = await SecurityService.hasCurrentUserRole(SECURITY_ROLES.WRM_COMPLIANCE_OFFICER);

        // Always start disabled; logic will selectively re-enable
        VisibilityHelper.setDisabled(fc, SOURCEOFFUNDEVENT.fields.compliancecomment, true);
        VisibilityHelper.setDisabled(fc, SOURCEOFFUNDEVENT.fields.compliancestatus, true);

        // Retrieve current status value (OptionSet)
        const statusAttr = fc.getAttribute?.(SOURCEOFFUNDEVENT.fields.compliancestatus) as Xrm.Attributes.OptionSetAttribute | undefined;
        const statusVal = statusAttr?.getValue?.();

        if (!isComplianceOfficer && statusVal === SOURCEOFFUNDEVENT.options.compliancestatus.PENDING) {
            VisibilityHelper.setDisabled(fc, SOURCEOFFUNDEVENT.fields.compliancecomment, false);
            VisibilityHelper.setDisabled(fc, SOURCEOFFUNDEVENT.fields.compliancestatus, false);
        }
    } catch { /* ignore */ }
}

/** On create-like forms, set owner to the contact's owner */
async function ensureOwnerFromContactOnCreate(fc: Xrm.FormContext): Promise<void> {
    const formType = FormTypeHelper.get(fc);
    if (!FormTypeHelper.isCreateLike(formType)) return; // only Create & QuickCreate

    const contactAttrName = SOURCEOFFUNDEVENT.fields.contactid;
    const ownerAttrName = SOURCEOFFUNDEVENT.fields.ownerid;

    if (!OwnerHelper.getOwnerAttribute(fc, ownerAttrName)) return;

    const contactLookup = await FormWait.waitForLookupValue(fc, contactAttrName, 6000);
    if (!contactLookup?.id) return;

    const contactOwner = await ContactOwnerService.getOwnerRef(CONTACT, contactLookup.id);
    if (!contactOwner) return;

    _desiredOwner = contactOwner;

    const currentOwner = OwnerHelper.getCurrentOwner(fc, ownerAttrName);
    if (!OwnerHelper.isSameOwner(currentOwner, contactOwner)) {
        OwnerHelper.setOwner(fc, ownerAttrName, contactOwner);
        // optional: await fc.data.save();
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
