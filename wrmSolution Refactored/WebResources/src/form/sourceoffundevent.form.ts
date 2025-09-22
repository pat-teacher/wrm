import { CONTACT } from "./../entities/Contact.entity";
import { SOURCEOFFUNDEVENT } from "./../entities/SourceOfFundEvent.entity";
import { FormWait, OwnerHelper, OwnerRef, ContactOwnerService, FormTypeHelper } from "./../core/crm.core";

let _desiredOwner: OwnerRef | null = null;

export async function onLoad(executionContext: Xrm.Events.EventContext) {
    const fc = executionContext.getFormContext();
    
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
