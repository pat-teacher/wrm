# wrmSolution

## how to build javascripts

The JavaScript files are built with Webpack from the TypeScript sources in `WebResources/src`.

1. Install dependencies:

  ```bash
  npm install
  ```

  > **Note:** Run this command initially (or whenever `package.json` / `package-lock.json` changes). It is not required before every build.

2. Run a production build:

  ```bash
  npm run build
  ```

3. Run a development build:

  ```bash
  npm run build:dev
  ```

`npm run build` uses the production Webpack configuration, while `npm run build:dev` uses the development configuration.

Generated output location:

* Output directory: `WebResources/dist`
* File pattern: `[name].js`
* Example generated files: `entities.js`, `crmCore.js`, `dynamicMandatoryEngine.js`

The generated bundles can then be deployed as Web Resources in Dynamics.

Difference between both commands:

* `npm run build` (production): optimized/minified bundles for deployment.
* `npm run build:dev` (development): easier debugging (typically less optimization and better source maps).

Source map behavior:

* Production uses `source-map`: generates separate `.map` files next to the bundles.
* Development uses `inline-source-map`: embeds source maps directly into the JavaScript bundles (larger files, easier local debugging).

## Mandatory Engine

### Short explanation of the rules (for admins/developers)

This feature controls **dynamic required fields** in Dynamics 365, depending on **Business Unit** and **conditions per entity**.
The configuration is stored in the `wrm_mandatoryconfigjson` field on the **Business Unit**.

#### JSON structure

```json
{
  "version": 1,
  "entities": {
    "account": {
      "default": ["name", "telephone1", "emailaddress1"],
      "rules": [
        {
          "name": "prospect_account",
          "mandatory": ["primarycontactid", "address1_line1"],
          "condition": [
            { "field": "customertypecode", "operator": "eq", "value": 1 },
            { "field": "statecode", "operator": "eq", "value": 0 }
          ]
        },
        {
          "name": "vip_account",
          "mandatory": ["wrm_viplevel", "ownerid"],
          "condition": [
            { "field": "wrm_isvip", "operator": "eq", "value": true }
          ]
        }
      ]
    }
  }
}
```

##### Rules:

* **`default`**: Required fields when no rule matches.
* **`rules`**: List of rules with

  * `name`: unique name
  * `mandatory`: fields that become *required*
  * `condition`: conditions (AND logic)

---

#### Supported operators

| Operator    | Meaning             | Example                        |
| ----------- | ------------------- | ------------------------------ |
| `eq`        | Equality            | `statecode == 0`               |
| `ne`        | Not equal           | `statecode != 1`               |
| `in`        | Value in a list     | `country in [DE, FR, IT]`      |
| `isnull`    | Field is empty      | `wrm_country IS NULL`          |
| `isnotnull` | Field is filled     | `primarycontactid IS NOT NULL` |

---

#### Supported data types for `value`

* **Number**: OptionSet values (`1`, `2`, ...)
* **String**: e.g. `"external"`, `"CH"`
* **Boolean**: `true` / `false`
* **GUID**: Lookup ID (`"a1b2c3d4-1111-2222-3333-444455556666"`)
* **Array**: only for `in` (`["DE","FR","IT"]`)

---

#### Merge strategy

* Multiple matching rules are **combined**.
* Required fields = **union** of all `mandatory` fields.
* If no rule matches, `default` is applied.

---

#### Examples

##### 1. Prospect Account

```json
{
  "name": "prospect_account",
  "mandatory": ["primarycontactid", "address1_line1"],
  "condition": [
    { "field": "customertypecode", "operator": "eq", "value": 1 },
    { "field": "statecode", "operator": "eq", "value": 0 }
  ]
}
```

Required fields when **both conditions** match.

---

##### 2. VIP Account

```json
{
  "name": "vip_account",
  "mandatory": ["wrm_viplevel", "ownerid"],
  "condition": [
    { "field": "wrm_isvip", "operator": "eq", "value": true }
  ]
}
```

Required fields when `wrm_isvip == true`.

---

##### 3. Merge example

An account is **Prospect** **and** **VIP** ? required:
`["primarycontactid","address1_line1","wrm_viplevel","ownerid"]`.

---

#### Usage in form

1. Load the engine in your form script:

   ```ts
   import { DynamicMandatory } from "../features/dynamic-mandatory/wrm_dynamicMandatory";
   ```

2. Register the methods:

   * **OnLoad**: `DynamicMandatory.init`
  * **OnChange**: automatically (via `autoWireOnChange`), or manually call `DynamicMandatory.apply` on relevant fields

---

#### Maintenance notes for admins

* JSON is maintained **per Business Unit**.
* Each rule should have a **descriptive name** (`name`).
* Use only **logical names** of fields (e.g. `telephone1`, not "Business Phone").
* JSON syntax errors (missing commas, incorrect brackets) result in **no rules being applied**.
* New fields/rules can be added at any time ? no code deployment required.
