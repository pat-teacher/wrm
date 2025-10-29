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