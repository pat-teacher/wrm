import {
    getCreateInternalTaskAvailability,
    getSourceFromForm,
    getXrm,
    initializeInternalTaskCreateForm,
    openCreateInternalTaskDialog,
} from "../features/createInternalTask/createInternalTask.service";

function getAvailabilityMessage(reason?: string): string {
    switch (reason) {
        case "missing_config":
            return "Create Internal Task configuration was not found or contains no valid task types.";
        case "no_enabled_task_types":
            return "Create Internal Task has no enabled task types.";
        case "no_source_match":
            return "Create Internal Task has no task types configured for this source record type.";
        case "no_role_match":
            return "You do not have permission to create Internal Tasks.";
        default:
            return "Create Internal Task is not available.";
    }
}

export async function openDialog(primaryControl: Xrm.FormContext): Promise<void> {
    const source = getSourceFromForm(primaryControl);
    if (!source) {
        await getXrm().Navigation.openAlertDialog({
            text: "Please save the record before creating an Internal Task.",
        });
        return;
    }

    const availability = await getCreateInternalTaskAvailability(source.entityName);
    if (!availability.canCreate) {
        await getXrm().Navigation.openAlertDialog({
            text: getAvailabilityMessage(availability.reason),
        });
        return;
    }

    await openCreateInternalTaskDialog(source);
}

export function canCreateInternalTask(): boolean {
    return true;
}

export function initializeCreateForm(executionContext: Xrm.Events.EventContext): void {
    initializeInternalTaskCreateForm(executionContext);
}
