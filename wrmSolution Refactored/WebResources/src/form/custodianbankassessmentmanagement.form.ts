import { CUSTODIANBANKASSESSMENTMANAGEMENT } from "../entities/CustodianBankAssessmentManagement.entity";
import { LookupViewHelper } from "../core/crm.core";

export async function onLoad(executionContext: Xrm.Events.EventContext) {
    const fc = executionContext.getFormContext();
    // Configure owner lookup (also reusable for onChange)
    configureOwnerLookup(fc);        
}

/**
 * Configure owner lookup to show only Teams and default to current user's teams.
 * Can be reused from onLoad and from field onChange handlers if needed.
 */
function configureOwnerLookup(fc: Xrm.FormContext): void {
    try {
        LookupViewHelper.setEntityTypes(fc, CUSTODIANBANKASSESSMENTMANAGEMENT.fields.ownerid, ["team"]);
        LookupViewHelper.addOwnerTeamViewForCurrentUser(fc, CUSTODIANBANKASSESSMENTMANAGEMENT.fields.ownerid);
    } catch { /* ignore */ }
}

/** Optional exported onChange handler to re-apply owner lookup configuration */
export function onOwnerLookupRefresh(executionContext: Xrm.Events.EventContext): void {
    const fc = executionContext.getFormContext();
    configureOwnerLookup(fc);
}

/**
 * Validates a numeric text field with a maximum of 12 digits.
 * Can be used for OnChange events and optionally receives the attribute name as a parameter.
 */
export function validateBigNumber(
    executionContext: Xrm.Events.EventContext,
    attributeName?: string
): void {

    const formContext = executionContext.getFormContext() as Xrm.FormContext;

    // If no attribute name is provided ? use the event source
    if (!attributeName) {
        const eventSource = executionContext.getEventSource() as Xrm.Attributes.Attribute;
        if (!eventSource) return;
        attributeName = eventSource.getName();
    }

    const attribute = formContext.getAttribute(attributeName);
    if (!attribute) return;

    const notificationId = `${attributeName}_BigNumberError`;
    let value = attribute.getValue() as string | null;

    // Clear error if the field is empty
    if (!value) {
        formContext.ui.clearFormNotification(notificationId);
        return;
    }

    // Remove any whitespace
    value = value.replace(/\s+/g, "");

    // Validation: only digits, max. 12 characters
    const isValid = /^\d{1,12}$/.test(value);

    if (!isValid) {
        attribute.setValue(null);
        formContext.ui.setFormNotification(
            "Please enter a numeric value with a maximum of 12 digits.",
            "ERROR",
            notificationId
        );
        return;
    }

    // Valid ? clear errors and store raw value
    formContext.ui.clearFormNotification(notificationId);
    attribute.setValue(value);
}