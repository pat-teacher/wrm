# Architecture

## Layers

### Core

Path: `WebResources/src/core`

Core contains reusable technical building blocks for Dynamics:

- `FORM_TYPE`
- `FormTypeHelper`
- `ApiClient`
- `FormControlHelper`
- `VisibilityHelper`
- `LookupDialogHelper`
- `LookupViewHelper`
- `OwnerHelper`
- `OwnerService`
- `SecurityService`
- `FieldValidator`

Core must not contain business entity rules that only apply to one specific form.

Shared Dynamics platform values, such as form types, save modes, notification levels, and other Xrm numeric or string codes, must be represented as central constants or helpers in Core. Form scripts and features must not use unexplained literal values such as `1` or `5` for form types.

### Entities

Path: `WebResources/src/entities`

Entity files define Dynamics logical names, fields, OptionSets, tabs, sections, and relationships as `as const` objects.

Form scripts and features must use these constants instead of repeating string literals.

For Dataverse Web API calls, entity metadata must use the actual logical / Web API property names used by OData. Do not use display names or schema-name casing in `$select`, `$filter`, OData binds, or response property access. In practice, custom column logical names are usually lowercase, for example `nev_key` and `nev_value_ntext`, even when the schema names are shown as `nev_Key` and `nev_Value_nText`.

### Features

Path: `WebResources/src/features`

Features are reusable business-technical modules. The most important current feature boundary is:

- `dynamicMandatory`: dynamic mandatory fields based on Location / Business Unit configuration.

Features may use Core and Entities. Features must not directly depend on form scripts.

### Form

Path: `WebResources/src/form`

Form scripts export Dynamics event handlers such as `onLoad`, `onSave`, OnChange handlers, or ribbon commands.

Form scripts may contain business orchestration, but reusable logic should be moved to Core or Features.

When integrating with legacy form scripts, the preferred pattern is a single wrapper event handler that prepares required context and invokes the legacy handler exactly once. Avoid parallel registrations that make the same legacy handler run twice, and avoid fragmented compatibility calls to individual legacy helper functions unless there is no stable legacy entry point.

### Config

Path: `WebResources/src/config`

Config files serve as examples, seeds, or review artifacts for Dynamics configurations.
The production mandatory configuration is stored in the Dynamics field `mhwrmb_mandatoryconfigjson` on the Location / Business Unit record.

## Dependency Rules

Allowed:

- `form` -> `features`
- `form` -> `core`
- `form` -> `entities`
- `features` -> `core`
- `features` -> `entities`
- `entities` -> types from `core`, when needed

Not allowed:

- `core` -> `form`
- `core` -> `features`
- `core` -> business-specific form logic
- `entities` -> `form`
- `features` -> `form`

## Bundle Rules

Webpack creates Dynamics WebResources from explicit entries in `webpack.common.js`.

Every Dynamics event handler must be reachable through a bundle exported under `window.WRM.[entryName]`.

Current entry categories:

- Base: `crmCore`, `entities`, `conditionEvaluator`
- Feature: `dynamicMandatoryEngine`
- Form: `kyc_approval_form`, `sourceoffundevent_form`, `custodianbankassessmentmanagement_form`

## Extension Rule

When a new form requires behavior, check first:

1. Is there already a Core helper?
2. Is there already an Entity constant?
3. Is the behavior a reusable Feature?
4. Is it truly form-specific orchestration?

Only case 4 should remain permanently in the form script.

