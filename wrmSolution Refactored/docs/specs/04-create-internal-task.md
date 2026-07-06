# Create Internal Task

## Table of Contents

- [Purpose](#purpose)
- [User Flow](#user-flow)
- [Main Components](#main-components)
- [Dataverse Configuration](#dataverse-configuration)
- [JSON Configuration](#json-configuration)
  - [JSON Properties](#json-properties)
- [Security Role Behavior](#security-role-behavior)
- [Source Lookup Mapping](#source-lookup-mapping)
- [Form Integration](#form-integration)
- [Legacy Script Integration](#legacy-script-integration)
- [Required Dynamics Form Setup](#required-dynamics-form-setup)
- [Required Command Bar Setup](#required-command-bar-setup)
- [Required WebResources](#required-webresources)
- [Supported Creation Paths](#supported-creation-paths)
- [Troubleshooting](#troubleshooting)
  - [The button opens, but the dialog shows no options](#the-button-opens-but-the-dialog-shows-no-options)
  - [The user gets a permission message](#the-user-gets-a-permission-message)
  - [The Internal Task Type is not found](#the-internal-task-type-is-not-found)
  - [Approval Flow Type or Flow Step are not set](#approval-flow-type-or-flow-step-are-not-set)
- [Deployment Notes](#deployment-notes)

## Purpose

The Create Internal Task feature allows users to create a new `Internal Task` from supported source records through a command bar button.

Supported source records:

- `contact`
- `account`
- `wrmb_portfolio`

The feature opens a dialog where the user selects an allowed Internal Task Type. After selection, a new unsaved `Internal Task` create form is opened with predefined lookup values. The record is not saved automatically.

## User Flow

1. The user opens a supported source record.
2. The user clicks the command bar button `Create Internal Task`.
3. A dialog WebResource opens.
4. The dialog shows only task types that are:
   - enabled in configuration,
   - allowed for the current source entity,
   - allowed for the current user's security roles.
5. The user selects one task type and clicks `Create`.
6. Dynamics opens a new `Internal Task` create form.
7. The form receives default lookup values:
   - source lookup, depending on the original record,
   - Internal Task Type lookup.
8. The existing legacy Internal Task form script runs and applies its existing create behavior.

## Main Components

| Component | Purpose |
| --- | --- |
| `createInternalTaskCommand.js` | Command bar entry point and Internal Task form wrapper. |
| `createInternalTaskDialog.html` | Dialog UI WebResource. |
| `createInternalTaskDialog.js` | Dialog logic and form opening. |
| `nev_config` | Dataverse configuration table. |
| `nev_internaltasktype` | Table used to resolve the selected Internal Task Type. |
| Legacy `nev_/InternalTasksFunctions.js` | Existing Internal Task form behavior. |

## Dataverse Configuration

The feature reads its configuration from table `nev_config`.

Required config record:

| Field | Value |
| --- | --- |
| `nev_key` | `idInternalTaskDialogConfig` |
| `nev_value_ntext` | JSON configuration |

Web API calls must use the lowercase logical / OData names:

- `nev_key`
- `nev_value_ntext`

Do not use schema-name casing such as `nev_Key` or `nev_Value_nText` in Web API queries.

## JSON Configuration

Example:

```json
{
  "version": 1,
  "taskTypes": [
    {
      "key": "review",
      "label": "KYC Review",
      "taskTypeCodeName": "KYC_PERIODIC_REVIEW",
      "allowedRoles": ["WRM Internal Task Create"],
      "sourceEntities": ["contact", "account", "wrmb_portfolio"],
      "enabled": true
    }
  ]
}
```

### JSON Properties

| Property | Required | Meaning |
| --- | --- | --- |
| `version` | Yes | Configuration schema version. Currently `1`. |
| `taskTypes` | Yes | List of selectable task types. |
| `key` | Yes | Stable technical identifier for this menu option. |
| `label` | Yes | Text shown in the dialog dropdown. |
| `taskTypeCodeName` | Yes | Value matched against `nev_internaltasktype.nev_internaltasktypecodename`. |
| `allowedRoles` | No | Security role names allowed to use this option. Empty or missing means all users are allowed for this option. |
| `sourceEntities` | No | Source entity logical names where this option is available. Empty or missing means all supported source entities. |
| `enabled` | No | `false` disables the option. Missing or `true` means enabled. |

## Security Role Behavior

Security is evaluated per configured task type.

The current user's role names are read from:

```text
Xrm.Utility.getGlobalContext().userSettings.roles
```

The dialog option is visible if at least one role in `allowedRoles` matches the current user's roles.

Rules:

- `allowedRoles: ["Role A"]` means only users with `Role A` can see and create that option.
- `allowedRoles: []` means every user can see and create that option.
- Missing `allowedRoles` also means every user can see and create that option.

Recommended setup:

- Use dedicated business roles such as `WRM Internal Task Create` or `WRM Internal Task Approval`.
- Keep role names stable, because the configuration compares by role name.
- Use Ribbon Workbench display rules or privilege rules for coarse button visibility.
- Use JSON `allowedRoles` for option-level visibility inside the dialog.

## Source Lookup Mapping

The created Internal Task receives one source lookup depending on where the user started:

| Source entity | Internal Task lookup |
| --- | --- |
| `contact` | `nev_contactid` |
| `account` | `nev_companyid` |
| `wrmb_portfolio` | `nev_portfolioid` |

The Internal Task Type lookup is set on:

```text
nev_internaltasktype
```

The selected task type is resolved by:

```text
nev_internaltasktype.nev_internaltasktypecodename = taskTypeCodeName
```

## Form Integration

The new create form is opened with:

```text
Xrm.Navigation.openForm
```

The record is opened as an unsaved create form. The solution does not call `createRecord` and does not save the Internal Task automatically.

This is intentional because the existing Internal Task form script must still run its standard create behavior.

## Legacy Script Integration

The Internal Task form uses a wrapper handler:

```text
WRM.createInternalTaskCommand.initializeCreateForm
```

This wrapper:

1. Checks if the form is Create or Quick Create.
2. Reads create-form parameters and `extraqs`.
3. Sets empty lookup fields from parameters.
4. Calls the existing legacy `OnLoad` once.
5. If `nev_internaltasktype` has a value on create, triggers the normal Dynamics `fireOnChange`.

The last step is required because the legacy script registers the `nev_internaltasktype` OnChange handler during `OnLoad`. The OnChange then fills fields such as Approval Flow Type and Flow Step according to existing legacy behavior.

## Required Dynamics Form Setup

On the `Internal Task` main form:

1. Add the legacy `nev_/InternalTasksFunctions.js` WebResource as a form library.
2. Add `mhwrmb_createInternalTaskCommand.js` as a form library.
3. Ensure the legacy library is loaded before the wrapper library.
4. Register only this OnLoad handler:

```text
WRM.createInternalTaskCommand.initializeCreateForm
```

5. Enable `Pass execution context as first parameter`.
6. Do not register the old legacy `OnLoad` as a separate form event handler.

The old legacy library must still be loaded, but its `OnLoad` is called by the wrapper. Registering both handlers separately would run the legacy logic twice.

## Required Command Bar Setup

Create a command bar button on the supported source forms.

Recommended button label:

```text
Create Internal Task
```

Command action:

```text
WRM.createInternalTaskCommand.openDialog
```

Parameter:

```text
PrimaryControl
```

For basic command availability, the bundle also exposes:

```text
WRM.createInternalTaskCommand.canCreateInternalTask
```

This currently returns `true`. Detailed option-level security is handled by the JSON configuration and dialog filtering. If the button itself must be hidden for users without general access, configure Ribbon Workbench display rules or privilege rules.

## Required WebResources

The following WebResources must be deployed:

| WebResource | Purpose |
| --- | --- |
| `mhwrmb_createInternalTaskCommand.js` | Command and form wrapper logic. |
| `mhwrmb_createInternalTaskDialog.html` | Dialog HTML. |
| `mhwrmb_createInternalTaskDialog.js` | Dialog JavaScript. |

The HTML references the dialog JavaScript as:

```html
<script src="mhwrmb_createInternalTaskDialog.js"></script>
```

Both dialog WebResources must therefore exist with matching names in Dynamics.

## Supported Creation Paths

The solution supports three creation paths:

- Manual Internal Task creation.
- Create Internal Task command button and dialog.
- Related-record or subgrid creation.

The wrapper only fills empty fields. Existing values provided by Dynamics relationship mapping or user input are not overwritten.

## Troubleshooting

### The button opens, but the dialog shows no options

Check:

- `nev_config` contains a record with `nev_key = idInternalTaskDialogConfig`.
- `nev_value_ntext` contains valid JSON.
- The selected source entity is listed in `sourceEntities`.
- The task type entry is not disabled with `"enabled": false`.
- The current user has at least one role listed in `allowedRoles`, unless `allowedRoles` is empty.

### The user gets a permission message

Check `allowedRoles` in the JSON. If the array is empty, the option is available for all users. If role names are configured, they must exactly match the Dynamics security role names.

### The Internal Task Type is not found

Check that `taskTypeCodeName` in JSON matches:

```text
nev_internaltasktype.nev_internaltasktypecodename
```

### Approval Flow Type or Flow Step are not set

Check:

- `nev_/InternalTasksFunctions.js` is loaded as a form library.
- `WRM.createInternalTaskCommand.initializeCreateForm` is the only OnLoad handler.
- `Pass execution context` is enabled.
- `nev_internaltasktype`, `nev_approvalflowtype`, and `nev_flowstep` are available on the form.
- Browser and Dynamics WebResource cache were refreshed after deployment.

## Deployment Notes

Build the WebResources with:

```powershell
npm run build
```

Deploy the generated JavaScript from `Deployment` or the agreed solution packaging process.

For production, deploy JavaScript WebResources without inline source maps. Separate `.map` files may be deployed to test environments only if debugging is required.
