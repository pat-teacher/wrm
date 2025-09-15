/// <reference types="xrm" />

namespace WMR.AccountForm {
    /**
     * Wird beim Laden des Account-Formulars ausgeführt
     */
    export function onLoad(ctx: Xrm.Events.EventContext): void {
        const formContext = ctx.getFormContext();
        formContext.ui.setFormNotification("Hallo vom Account-Formular!", "INFO", "pcs_acc_hello");
    }

    /**
     * Beispiel für OnChange des Namensfelds
     */
    export function onChange_Name(ctx: Xrm.Events.EventContext): void {
        const formContext = ctx.getFormContext();
        const name = formContext.getAttribute("name")?.getValue() || "";
        if (!name) {
            formContext.ui.setFormNotification("Name ist sehr lang!", "WARNING", "pcs_acc_name");
        } else {
            formContext.ui.clearFormNotification("pcs_acc_name");
        }
    }
}
