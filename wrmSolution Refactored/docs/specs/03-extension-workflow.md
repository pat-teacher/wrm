# Extension Workflow

## New Entity

1. Create a new file under `WebResources/src/entities/[EntityName].entity.ts`.
2. Define `entity` and `fields.pk`.
3. Add additional fields, OptionSets, tabs, sections, and relationships only when they are used.
4. Add an export in `WebResources/src/entities/index.ts` when the entity is used by multiple modules.
5. Verify every table and field value against the Dataverse logical name, especially before using it in Web API `$select`, `$filter`, OData binds, or response property access.
6. Do not duplicate logical names directly in form scripts.

## New Form Script

1. Create a file under `WebResources/src/form/[entity-or-purpose].form.ts`.
2. Export only Dynamics handlers.
3. Check Core and Features for reusable logic first.
4. Keep form-specific logic small and split it into private functions.
5. Add a Webpack entry in `webpack.common.js`.
6. Register the bundle in Dynamics as a WebResource.

## New Reusable Feature

A feature is justified when at least one of the following is true:

- It is needed by multiple forms.
- It encapsulates a business pattern with stable configuration.
- It is expected to replace several existing one-off implementations.

Feature files live under `WebResources/src/features/[featureName]`.

## New Core Helper

A Core helper is justified when:

- It does not contain business-specific entity semantics.
- It encapsulates Dynamics / Xrm technical behavior.
- It is suitable for multiple forms or features.

The following does not belong in Core:

- Status values of a specific entity.
- Special rules of a specific form.
- Texts for specific business processes.

## Review Checklist

- Are logical names defined centrally in entity files?
- Are Web API field names using the actual logical / OData property names, not display names or schema-name casing?
- Are there duplicated Xrm accesses that belong in Core?
- Is the dependency direction respected?
- Is the behavior configurable when it is business-data-driven?
- Is a new bundle really required?
- Is the Dynamics event handler signature correct?
- Is the behavior defensive when controls or attributes are missing?

