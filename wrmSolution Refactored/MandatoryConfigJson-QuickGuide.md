# Mandatory Config JSON - Quick Guide

## 1) Structure

* **Entity block**

  * `default`: fields required when no rule contributes anything
  * `rules[]`: AND-combined `condition[]`, plus `mandatory[]`
* **Rule precedence**
  Merge `mandatory` from all **matching rules**.
  If the merged list is **empty**, fall back to `default`.

**Tiny example**

```json
{
  "default": ["name"],
  "rules": [
    { "name": "vip", "mandatory": ["wrm_viplevel"],
      "condition": [{ "field": "wrm_isvip", "operator": "eq", "value": true }] }
  ]
}
```

## 2) Operators

* `eq` -- equal
* `ne` -- not equal
* `in` -- value is in list (or any overlap for multi-select)
* `isnull` -- empty / not set
* `isnotnull` (alias: `notnull`) -- set / not empty

## 3) Field types & values

* **Text**: string, case-insensitive.
* **Boolean**: `true`/`false` (strings also accepted).
* **OptionSet (single)**: number code.
* **OptionSet (multi-select)**: array of numbers/strings; `in` checks **overlap**.
* **Lookup**:

  * Default (no suffix): if `value` is a **GUID** -> compare by **ID**, else by **Name**.
  * Explicit projection: `field.id` / `field.name` / `field.entityType`.

> GUIDs can include `{}`; string & GUID compares are case-insensitive.

**Tiny examples**

```json
{ "field": "customertypecode", "operator": "eq", "value": 1 }            // single OptionSet
{ "field": "wrm_tags", "operator": "in", "value": [101, 202] }          // multi-select overlap
{ "field": "primarycontactid", "operator": "eq", "value": "Jane Doe" }  // lookup by name
{ "field": "primarycontactid.id", "operator": "eq", "value": "{A1...}" } // lookup by GUID
{ "field": "ownerid.entityType", "operator": "eq", "value": "systemuser" } // user vs team
{ "field": "wrm_country", "operator": "isnull" }                        // empty
```

## 4) Rule evaluation

* Conditions inside one rule are **AND**.
* Multiple matching rules -> **union** of all their `mandatory` fields.
* **Defaults apply only if** that union is empty.

**Tiny examples**

```json
// No rule matches -> use default
{ "default": ["name"], "rules": [
  { "mandatory": ["primarycontactid"], "condition": [
    { "field": "wrm_isvip", "operator": "eq", "value": true } ] }
]}

// Two rules match -> union of both mandatory lists
{ "default": ["name"], "rules": [
  { "mandatory": ["primarycontactid"], "condition": [{ "field": "code", "operator": "eq", "value": 1 }] },
  { "mandatory": ["ownerid"],         "condition": [{ "field": "wrm_isvip", "operator": "eq", "value": true }] }
]}
```

## 5) Best practices

* Prefer `.id` for stable lookup checks; use `.name` for human-readable matches.
* Keep rule `mandatory` lists minimal and explicit; **don't** rely on `default` if rules should also include those fields--repeat them in each matching rule.
* Use `in` for both scalar and multi-select scenarios.
