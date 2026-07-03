import {
    getAllowedInternalTaskTypeOptions,
    getXrm,
    openInternalTaskCreateForm,
    parseDialogData,
} from "../features/createInternalTask/createInternalTask.service";
import type { InternalTaskTypeOption } from "../features/createInternalTask/createInternalTask.types";

let dialogSource = parseDialogData();
let allowedOptions: InternalTaskTypeOption[] = [];

function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing element '${id}'.`);
    return element as T;
}

function setStatus(text: string, isError = false): void {
    const status = getElement<HTMLDivElement>("status");
    status.textContent = text;
    status.className = isError ? "status error" : "status";
}

async function populateOptions(): Promise<void> {
    const select = getElement<HTMLSelectElement>("taskTypeSelect");
    select.innerHTML = "";

    allowedOptions = await getAllowedInternalTaskTypeOptions(dialogSource?.entityName);
    for (const option of allowedOptions) {
        const item = document.createElement("option");
        item.value = option.key;
        item.textContent = option.label;
        select.appendChild(item);
    }

    if (!allowedOptions.length) {
        select.disabled = true;
        getElement<HTMLButtonElement>("createButton").disabled = true;
        setStatus("No Internal Task types are available for your security roles.", true);
    }
}

async function createSelectedTask(): Promise<void> {
    if (!dialogSource) {
        setStatus("The source record context is missing.", true);
        return;
    }

    const select = getElement<HTMLSelectElement>("taskTypeSelect");
    const option = allowedOptions.find((item) => item.key === select.value);
    if (!option) {
        setStatus("Please select an Internal Task type.", true);
        return;
    }

    try {
        getElement<HTMLButtonElement>("createButton").disabled = true;
        setStatus("Opening Internal Task...");
        await openInternalTaskCreateForm(dialogSource, option);
        closeDialog();
    } catch (error: any) {
        getElement<HTMLButtonElement>("createButton").disabled = false;
        setStatus(error?.message ?? String(error), true);
    }
}

function closeDialog(): void {
    try {
        getXrm()?.Navigation?.navigateBack?.();
    } catch {
        window.close();
    }
}

function init(): void {
    if (!dialogSource) {
        setStatus("The dialog was opened without a valid source record.", true);
        getElement<HTMLButtonElement>("createButton").disabled = true;
        return;
    }

    getElement<HTMLDivElement>("sourceInfo").textContent = dialogSource.name
        ? `${dialogSource.name} (${dialogSource.entityName})`
        : dialogSource.entityName;

    void populateOptions();
    getElement<HTMLButtonElement>("createButton").addEventListener("click", () => void createSelectedTask());
    getElement<HTMLButtonElement>("cancelButton").addEventListener("click", closeDialog);
}

document.addEventListener("DOMContentLoaded", init);
