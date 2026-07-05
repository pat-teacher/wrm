# Dynamic Mandatory Engine - Maintenance Guide

## Purpose

This guide explains how to maintain the JSON configuration for the Dynamic Mandatory Engine.

Use this document when a business user or administrator asks to change which fields are required for a specific Location / Business Unit.

## Where The Configuration Is Stored

The active configuration is stored in Dynamics:

```text
Table:  ambcust_location
Field:  mhwrmb_mandatoryconfigjson
```

Each Location / Business Unit can have its own JSON configuration.

Local example files are available for review and development:

```text
WebResources/src/config/BusinessUnitMandatoryConfig.json
WebResources/src/config/BusinessUnitMandatoryConfigContact.json
MandatoryConfigJson-QuickGuide.md
```

The local files are examples only. The runtime engine reads the JSON from Dynamics.

## Supported Entities

The current engine supports these entity blocks:

| Entity block in JSON | Dynamics source |
| --- | --- |
| `contact` | Contact form. |
| `account` | Company / account form. |
| `wrmb_portfolio` | Portfolio form. |

If a new entity must be supported, a developer must add the entity-to-Location lookup mapping in the engine.

## JSON Root Structure

The JSON must have this root structure:

```json
{
  "version": 1,
  "entities": {
    "contact": {
      "default": ["lastname"],
      "rules": []
    }
  }
}
```

Required root properties:

| Property | Meaning |
| --- | --- |
| `version` | Must currently be `1`. |
| `entities` | Object containing one block per Dynamics entity logical name. |

## Entity Block

Each entity block can contain:

| Property | Meaning |
| --- | --- |
| `default` | Fields required when no rule contributes mandatory fields. |
| `rules` | Business rules that conditionally require fields. |

Example:

```json
{
  "default": ["lastname", "emailaddress1"],
  "rules": [
    {
      "name": "external_contact",
      "mandatory": ["parentcustomerid", "mobilephone"],
      "condition": [
        { "field": "wrm_contacttype", "operator": "eq", "value": "external" }
      ]
    }
  ]
}
```

## Rule Structure

Each rule has:

| Property | Required | Meaning |
| --- | --- | --- |
| `name` | Yes | Unique technical rule name within the entity block. |
| `mandatory` | Yes | Fields that become required when the rule matches. |
| `condition` | No | AND-combined conditions. Empty or missing means the rule always matches. |

## How Rules Are Applied

The engine evaluates all rules for the current entity.

Important behavior:

- All matching rules are merged.
- If two rules match, the result is the union of both `mandatory` lists.
- `default` is used only when no matching rule contributes mandatory fields.
- The engine first clears required flags from all fields listed in `default` and all rules, then applies the current result.

Example:

```json
{
  "default": ["name"],
  "rules": [
    {
      "name": "vip",
      "mandatory": ["ownerid"],
      "condition": [{ "field": "wrm_isvip", "operator": "eq", "value": true }]
    },
    {
      "name": "missing_country",
      "mandatory": ["wrm_country"],
      "condition": [{ "field": "wrm_country", "operator": "isnull" }]
    }
  ]
}
```

If both rules match, `ownerid` and `wrm_country` are required. `name` from `default` is not automatically added.

If the default fields must always remain required, repeat them in every rule's `mandatory` list.

## Operators

Use only these operators:

| Operator | Usage |
| --- | --- |
| `eq` | Value equals configured value. |
| `ne` | Value does not equal configured value. |
| `in` | Value is in configured list. |
| `isnull` | Field is empty. |
| `isnotnull` | Field is not empty. |
| `notnull` | Same as `isnotnull`. |

## Value Examples

### Text

```json
{ "field": "wrm_country", "operator": "eq", "value": "CH" }
```

Text is compared case-insensitively.

### Boolean

```json
{ "field": "wrm_isvip", "operator": "eq", "value": true }
```

### OptionSet

```json
{ "field": "customertypecode", "operator": "eq", "value": 1 }
```

Use the numeric option value, not the label.

### Multi-select OptionSet

```json
{ "field": "wrm_tags", "operator": "in", "value": [101, 202] }
```

For multi-select fields, `in` matches when at least one selected value overlaps with the configured list.

### Lookup By Name

```json
{ "field": "primarycontactid", "operator": "eq", "value": "Jane Doe" }
```

This is readable but less stable than comparing by ID.

### Lookup By ID

```json
{ "field": "primarycontactid.id", "operator": "eq", "value": "a1b2c3d4-1111-2222-3333-444455556666" }
```

This is the recommended approach for stable lookup comparisons.

### Lookup Entity Type

```json
{ "field": "ownerid.entityType", "operator": "eq", "value": "systemuser" }
```

Useful for owner fields where the value can be a user or a team.

## Maintenance Workflow

1. Identify the Location / Business Unit whose mandatory logic must change.
2. Open the related `ambcust_location` record in Dynamics.
3. Edit field `mhwrmb_mandatoryconfigjson`.
4. Copy the current JSON into an editor.
5. Validate that the JSON is syntactically valid.
6. Change only the relevant entity block and rule.
7. Verify all field names are Dynamics logical names.
8. Save the JSON back to `mhwrmb_mandatoryconfigjson`.
9. Refresh the Dynamics form in the browser.
10. Test all affected rule paths.

## Validation Checklist

Before saving a JSON change:

- Is the JSON valid?
- Is `version` set to `1`?
- Are entity names logical names such as `contact`, `account`, `wrmb_portfolio`?
- Are all field names logical names?
- Are all mandatory fields present on the target form?
- Are OptionSet values numeric codes, not labels?
- Are lookup comparisons using `.id` where stability matters?
- Are rule names unique within the entity block?
- Does each rule contain a clear `mandatory` list?
- Is `default` understood as fallback only?

## Troubleshooting

### No fields become required

Check:

- The form has a Location / Business Unit lookup value.
- The related `ambcust_location` record contains JSON in `mhwrmb_mandatoryconfigjson`.
- The JSON is valid.
- The JSON contains an entity block matching the current form entity logical name.
- The configured fields are available on the form.
- The browser tab was refreshed after changing JSON.

### The wrong fields are required

Check:

- Multiple rules may match and are merged.
- `default` is only used when no rule contributes fields.
- Condition fields use the correct logical names.
- OptionSet values use numeric codes.
- Lookup conditions compare the intended value: ID, name, or entity type.

### Changes do not appear immediately

The engine caches configuration per Location / Business Unit in the browser session.

Refresh the form browser tab after changing `mhwrmb_mandatoryconfigjson`.

### A field is configured but not required

Check:

- The field exists on the form.
- The field logical name is correct.
- The field is not disabled by another form script or business rule.
- The rule condition actually matches.

## Best Practices

- Keep rules small and specific.
- Prefer lookup `.id` comparisons for stable behavior.
- Use clear rule names that explain the business case.
- Do not use display names or labels as field names.
- Avoid relying on `default` if fields must always be mandatory; repeat those fields in matching rules.
- Test every changed rule with at least one positive and one negative case.

