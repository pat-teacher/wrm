# Dynamic Mandatory Engine - Technical Documentation

## Purpose

The Dynamic Mandatory Engine sets Dynamics form fields to required or optional based on a JSON configuration stored on the related Location / Business Unit record.

The objective is to avoid hardcoded mandatory-field logic in individual form scripts. Business-specific required-field rules are maintained as JSON data instead of duplicated JavaScript.

## Runtime Components

| Component | Purpose |
| --- | --- |
| `dynamicMandatoryEngine.js` | Generated WebResource bundle used by Dynamics forms. |
| `dynamicMandatoryEngine.ts` | TypeScript source of the engine. |
| `MandatoryConfig.entity.ts` | Dataverse table and field constants for configuration loading. |
| `condition.evaluator.ts` | Generic condition evaluation logic. |
| `crm.core.ts` | Shared Xrm helpers and JSON contract types. |
| `mandatory-config.contract.yaml` | Machine-readable contract for review and validation. |

The Webpack entry is:

```text
dynamicMandatoryEngine: ./WebResources/src/features/dynamicMandatory/dynamicMandatoryEngine.ts
```

The generated global namespace is:

```text
WRM.dynamicMandatoryEngine
```

## Public Form Handlers

The bundle exports two Dynamics-compatible handlers:

```text
WRM.dynamicMandatoryEngine.initializeDynamicMandatoryFields
WRM.dynamicMandatoryEngine.applyDynamicMandatoryRules
```

### initializeDynamicMandatoryFields

Use this handler on form `OnLoad`.

It performs the full initialization:

1. Resolve the form context.
2. Resolve the Location / Business Unit lookup for the current entity.
3. Load the JSON configuration from Dataverse.
4. Parse the JSON.
5. Apply the matching mandatory rules.
6. Auto-register OnChange handlers for all fields used in rule conditions.

### applyDynamicMandatoryRules

This handler reapplies the mandatory logic.

The engine registers it automatically on all condition fields. It may also be registered manually if a form requires explicit re-evaluation from another event.

## Dataverse Configuration Source

Configuration is stored on:

```text
Table:  ambcust_location
Field:  mhwrmb_mandatoryconfigjson
```

The engine retrieves the field with:

```text
Xrm.WebApi.retrieveRecord("ambcust_location", locationId, "?$select=mhwrmb_mandatoryconfigjson")
```

The field value must contain a valid JSON document matching the mandatory configuration contract.

## Location / Business Unit Resolution

The engine determines the Location / Business Unit lookup from the current form entity:

| Current entity | Lookup field used to find `ambcust_location` |
| --- | --- |
| `contact` | `nev_businessunitid` |
| `account` | `nev_businessunit` |
| `wrmb_portfolio` | `ambcust_locationid` |

If no lookup value exists, no rules are applied.

New entities must be added explicitly in `getBusinessUnitAttributeForForm`.

## Runtime Rule Algorithm

The runtime starts with the form `OnLoad` handler:

```text
WRM.dynamicMandatoryEngine.initializeDynamicMandatoryFields
```

The exact sequence is:

1. The handler receives the Dynamics `executionContext`.
2. The engine gets the current `formContext` from `executionContext.getFormContext()`.
3. The engine determines the current form entity with:

```text
formContext.data.entity.getEntityName()
```

Example result:

```text
contact
```

4. The engine resolves which form lookup contains the Location / Business Unit reference:

| Form entity | Lookup read by the engine |
| --- | --- |
| `contact` | `nev_businessunitid` |
| `account` | `nev_businessunit` |
| `wrmb_portfolio` | `ambcust_locationid` |

5. The engine reads the lookup value from the form.
6. If the lookup is empty, the engine stops and applies no required-field changes.
7. If the lookup has a value, the GUID is sanitized and used as the Location / Business Unit ID.
8. The engine checks the browser-session cache with key `location:{id}`.
9. If the config is already cached, the cached config is reused.
10. If the config is not cached, the engine loads the record from Dataverse:

```text
Table: ambcust_location
ID:    Location / Business Unit lookup ID
Field: mhwrmb_mandatoryconfigjson
```

11. The JSON text from `mhwrmb_mandatoryconfigjson` is parsed.
12. If the JSON is empty, invalid, or does not contain `entities`, the parsed config is `null` and no rules are applied.
13. If the JSON is valid, the engine reads the matching entity block:

```ts
const entityLogicalName = formContext.data.entity.getEntityName();
const entityConfig = config.entities[entityLogicalName];
```

Example:

```ts
const entityConfig = config.entities["contact"];
```

This maps to the JSON block:

```json
{
  "entities": {
    "contact": {
      "default": ["lastname"],
      "rules": []
    }
  }
}
```

14. If there is no block for the current entity, the engine stops and applies no changes.
15. The engine builds a set of all fields that could be mandatory:
    - all fields from `entityConfig.default`,
    - all fields from every `rules[].mandatory`.
16. The engine resets all these fields to optional with `required = false`.
17. The engine evaluates every rule in `entityConfig.rules`.
18. A rule matches only when all conditions in its `condition` array match.
19. If a rule matches, all fields from that rule's `mandatory` array are added to a merged list.
20. Duplicate field names are ignored in the merged list.
21. After all rules are evaluated:
    - if the merged list contains fields, those fields are set to required,
    - if the merged list is empty, the fields from `entityConfig.default` are set to required.
22. After applying the rules, the engine registers OnChange handlers for all fields used in rule conditions.
23. When one of those condition fields changes, the engine reruns only the apply part:

```text
WRM.dynamicMandatoryEngine.applyDynamicMandatoryRules
```

This reloads the configuration through the same cache-aware loading logic and reapplies the reset/evaluate/merge/default sequence.

Important behavior:

- Rules are additive.
- There is no first-match-wins behavior.
- `default` is a fallback only.
- `default` fields are not automatically added when one or more rules match.
- Before every apply run, all potentially required fields from `default` and all rules are reset to optional first.

## Rule Evaluation

Conditions inside one rule are combined with AND.

Example:

```json
{
  "name": "active_swiss_company",
  "mandatory": ["emailaddress1", "websiteurl"],
  "condition": [
    { "field": "statecode", "operator": "eq", "value": 0 },
    { "field": "wrm_country", "operator": "eq", "value": "CH" }
  ]
}
```

The rule matches only if both conditions match.

If `condition` is missing or empty, the rule always matches.

## Supported Operators

| Operator | Meaning |
| --- | --- |
| `eq` | Equal. |
| `ne` | Not equal. |
| `in` | Actual value is in the configured value list. For multi-select fields, any overlap is enough. |
| `isnull` | Empty or not set. |
| `isnotnull` | Set and not empty. |
| `notnull` | Alias for `isnotnull`. |

Unknown operators do not match.

## Supported Field Types

| Field type | Expected JSON value |
| --- | --- |
| Text | String, compared case-insensitively. |
| Boolean | `true` / `false`; string representations are also tolerated. |
| OptionSet | Numeric option value. |
| Multi-select OptionSet | Array of numbers or strings. |
| Lookup | GUID, lookup name, or object with `id`, `name`, `entityType`. |

GUIDs are normalized by removing braces and lowercasing.

## Lookup Projections

Lookup conditions support dot notation:

```json
{ "field": "primarycontactid.id", "operator": "eq", "value": "a1b2c3d4-1111-2222-3333-444455556666" }
```

Supported projections:

- `.id`
- `.name`
- `.entityType`

Without projection, lookup comparison behaves as follows:

- If the configured value is a GUID, compare by lookup ID.
- Otherwise compare by lookup name.

## OnChange Wiring

During initialization, the engine reads all condition fields from the entity configuration and registers an OnChange handler on each base attribute.

Example:

```json
{ "field": "primarycontactid.name", "operator": "eq", "value": "Jane Doe" }
```

The engine registers OnChange on:

```text
primarycontactid
```

When one of these fields changes, the mandatory rules are evaluated again.

## Cache Behavior

The loaded configuration is cached in the browser session by Location / Business Unit ID.

Cache key examples:

```text
location:aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
location:null
```

Implications:

- Reopening or refreshing the form loads the current configuration.
- Changes to the JSON may not affect an already opened form immediately if the same Location / Business Unit was already loaded in that browser session.
- If a tester changes JSON configuration, refresh the browser tab before retesting.

## Error Handling

The engine is defensive and must not block form usage.

No rules are applied when:

- no Location / Business Unit lookup is available,
- the Location / Business Unit lookup has no ID,
- the Dataverse record cannot be loaded,
- the JSON field is empty,
- the JSON is invalid,
- no entity block exists for the current entity,
- a configured field is not available on the current form.

Missing attributes are ignored.

## Required Dynamics Form Setup

For every form using this feature:

1. Add the generated `dynamicMandatoryEngine.js` WebResource as a form library.
2. Register this OnLoad handler:

```text
WRM.dynamicMandatoryEngine.initializeDynamicMandatoryFields
```

3. Enable `Pass execution context as first parameter`.
4. Ensure all fields referenced by `mandatory` and `condition` are available on the form.
5. Ensure the form contains the Location / Business Unit lookup needed for the entity.

## Deployment Notes

Build with:

```powershell
npm run build
```

The generated bundle is:

```text
WebResources/dist/dynamicMandatoryEngine.js
```

Deploy it as the corresponding Dynamics JavaScript WebResource according to the project packaging process.
