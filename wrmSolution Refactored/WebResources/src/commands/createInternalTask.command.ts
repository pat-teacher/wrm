import {
    canCreateAnyInternalTask,
    getSourceFromForm,
    getXrm,
    openCreateInternalTaskDialog,
} from "../features/createInternalTask/createInternalTask.service";

export async function openDialog(primaryControl: Xrm.FormContext): Promise<void> {
    const source = getSourceFromForm(primaryControl);
    if (!source) {
        await getXrm().Navigation.openAlertDialog({
            text: "Please save the record before creating an Internal Task.",
        });
        return;
    }

    if (!(await canCreateAnyInternalTask(source.entityName))) {
        await getXrm().Navigation.openAlertDialog({
            text: "You do not have permission to create Internal Tasks.",
        });
        return;
    }

    await openCreateInternalTaskDialog(source);
}

export function canCreateInternalTask(): boolean {
    return true;
}
