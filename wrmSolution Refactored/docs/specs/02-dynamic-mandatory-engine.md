# Dynamic Mandatory Engine

## Purpose

The Dynamic Mandatory Engine sets required fields in Dynamics forms based on JSON configuration stored per Location / Business Unit.

The active runtime configuration is read from:

```text
Table:  ambcust_location
Field:  mhwrmb_mandatoryconfigjson
```

The engine exists to keep mandatory-field business rules out of individual form scripts and make them configurable as data.

## Documentation Structure

This file is the high-level overview only.

Detailed documentation is split by audience:

- `05-dynamic-mandatory-engine-technical.md`: technical runtime behavior, form integration, handlers, cache, and error handling.
- `06-dynamic-mandatory-engine-maintenance.md`: JSON maintenance guide, examples, validation checklist, and troubleshooting.
- `schemas/mandatory-config.contract.yaml`: machine-readable contract for the JSON configuration shape.

## Supported Entities

The current runtime mapping supports:

| Form entity | Location / Business Unit lookup |
| --- | --- |
| `contact` | `nev_businessunitid` |
| `account` | `nev_businessunit` |
| `wrmb_portfolio` | `ambcust_locationid` |

The OnLoad handler must be registered on the forms where dynamic mandatory fields should be active:

```text
WRM.dynamicMandatoryEngine.initializeDynamicMandatoryFields
```

## Rule Summary

At runtime, the engine:

1. Resolves the current form entity.
2. Resolves the Location / Business Unit lookup.
3. Loads JSON from `mhwrmb_mandatoryconfigjson`.
4. Selects the matching entity block from `config.entities`.
5. Resets all potentially mandatory fields to optional.
6. Evaluates all rules.
7. Merges fields from all matching rules.
8. Uses `default` only when no rule contributes fields.
9. Registers OnChange handlers for condition fields.

Rules are additive. There is no first-match-wins behavior.

## Runtime Safety

The engine must not block form usage. If configuration is missing, invalid, or does not apply to the current form, no mandatory rules are applied.
