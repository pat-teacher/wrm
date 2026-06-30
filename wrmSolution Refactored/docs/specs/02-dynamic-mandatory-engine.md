# Dynamic Mandatory Engine

## Purpose

The Dynamic Mandatory Engine sets required fields in Dynamics forms based on a JSON configuration.

The configuration is read per Location / Business Unit from the field `mhwrmb_mandatoryconfigjson`.

## Runtime Behavior

During initialization:

1. Read the form context.
2. Determine the entity logical name.
3. Determine the form's Location / Business Unit lookup.
4. Load the mandatory JSON from Dynamics.
5. Parse the JSON safely.
6. Select the entity configuration.
7. Reset all potentially required fields first.
8. Evaluate rules.
9. Set required fields.
10. Register OnChange handlers for all condition fields.

## Location / Business Unit Resolution

The engine determines the configuration lookup field based on the current entity:

- `contact` -> `CONTACT.fields.nev_businessunitid`
- `account` -> `COMPANY.fields.nev_businessunit`
- `wrmb_portfolio` -> `ACCOUNT.fields.ambcust_locationid`

New entities must be connected explicitly until a more generic mapping configuration is introduced.

## Rule Model

An entity configuration consists of:

- `default`: required fields when no rule matches.
- `rules`: list of rules.

A rule consists of:

- `name`: unique, descriptive name.
- `mandatory`: fields that become required when the rule matches.
- `condition`: AND-combined conditions.

If multiple rules match, their `mandatory` fields are merged.
If no rule matches, `default` is used.

## Operators

Supported:

- `eq`
- `ne`
- `in`
- `isnull`
- `isnotnull`
- `notnull`

`notnull` is an alias for `isnotnull`.

## Comparison Logic

Primitive values are normalized and compared by type:

- Numbers with numbers.
- Booleans with booleans.
- Strings case-insensitively.
- GUIDs normalized without braces and lowercased.

Lookups can be compared by:

- GUID
- Name
- Object with `id`, `name`, `entityType`

Dot notation is supported:

- `primarycontactid.id`
- `primarycontactid.name`
- `primarycontactid.entityType`

## Failure Cases

The engine does not set required fields when:

- no Location / Business Unit is available
- the JSON is empty
- the JSON is invalid
- no matching entity configuration exists
- an attribute is not available on the form

Load or parse failures must not block the form.

## Open Decisions

- Should the Entity -> Business Unit field mapping become configurable?
- Should a JSON Schema be introduced for real build-time validation?
- Should the cache be invalidated when the Location changes on the form?

