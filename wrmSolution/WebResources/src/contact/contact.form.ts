/// <reference types="xrm" />

namespace WMR.ContactForm {
    /**
     * Wird beim Laden des Contact-Formulars ausgeführt
     */
    export function onLoad(ctx: Xrm.Events.EventContext): void {
        const formContext = ctx.getFormContext();
        formContext.ui.setFormNotification("Hallo vom Contact-Formular!", "INFO", "pcs_con_hello");
    }

    /**
     * Beispiel: prüft, ob Email gesetzt ist
     */
    export function onChange_Email(ctx: Xrm.Events.EventContext): void {
        const formContext = ctx.getFormContext();
        const email = formContext.getAttribute("emailaddress1")?.getValue() || "";
        if (!email) {
            formContext.ui.setFormNotification("Bitte eine E-Mail-Adresse eingeben!", "ERROR", "pcs_con_email");
        } else {
            formContext.ui.clearFormNotification("pcs_con_email");
        }
    }
}
