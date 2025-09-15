export namespace ApprovalAccount {
    export function ping(): void {
        Xrm.Navigation.openAlertDialog({ text: "ping" });
    }

    // Shim: Namespace zusätzlich global machen
    declare const window: any;
    if (typeof window !== "undefined") {
        window.ApprovalAccount = ApprovalAccount;
    }
}
