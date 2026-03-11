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

`npm run build` uses the production Webpack configuration, while `npm run build:dev` uses the development configuration. The generated bundles are written to the configured Webpack output directory and can then be deployed as Web Resources in Dynamics.

Difference between both commands:

* `npm run build` (production): optimized/minified bundles for deployment.
* `npm run build:dev` (development): easier debugging (typically less optimization and better source maps).

Source map behavior:

* Production uses `source-map`: generates separate `.map` files next to the bundles.
* Development uses `inline-source-map`: embeds source maps directly into the JavaScript bundles (larger files, easier local debugging).

## Mandatory Engine

### Kurz-Erkl�rung der Regeln (f�r Admins/Entwickler)

Dieses Feature steuert **dynamische Pflichtfelder** in Dynamics 365, abh�ngig von **Business Unit** und **Bedingungen pro Entit�t**.
Die Konfiguration wird im Feld `wrm_mandatoryconfigjson` auf der **Business Unit** gespeichert.

#### Aufbau der JSON-Struktur

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

##### Regeln:

* **`default`**: Pflichtfelder, wenn keine Regel zutrifft.
* **`rules`**: Liste von Regeln mit

  * `name`: eindeutiger Name
  * `mandatory`: Felder, die *required* werden
  * `condition`: Bedingungen (UND-Verkn�pfung)

---

#### Unterst�tzte Operatoren

| Operator    | Bedeutung           | Beispiel                       |
| ----------- | ------------------- | ------------------------------ |
| `eq`        | Gleichheit          | `statecode == 0`               |
| `ne`        | Ungleichheit        | `statecode != 1`               |
| `in`        | Wert in einer Liste | `country in [DE, FR, IT]`      |
| `isnull`    | Feld ist leer       | `wrm_country IS NULL`          |
| `isnotnull` | Feld ist gef�llt    | `primarycontactid IS NOT NULL` |

---

#### M�gliche Datentypen f�r `value`

* **Zahl** ? OptionSet-Werte (`1`, `2`, �)
* **String** ? z. B. `"external"`, `"CH"`
* **Boolean** ? `true` / `false`
* **GUID** ? Lookup-ID (`"a1b2c3d4-1111-2222-3333-444455556666"`)
* **Array** ? nur f�r `in` (`["DE","FR","IT"]`)

---

#### Merge-Strategie

* Mehrere passende Regeln werden **kombiniert**.
* Pflichtfelder = **Union** aller `mandatory`-Felder.
* Wenn keine Regel zutrifft ? es gilt `default`.

---

#### Beispiele

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

Pflichtfelder, wenn **beide Bedingungen** zutreffen.

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

Pflichtfelder, wenn `wrm_isvip == true`.

---

##### 3. Merge-Beispiel

Ein Account ist **Prospect** **und** **VIP** ? required:
`["primarycontactid","address1_line1","wrm_viplevel","ownerid"]`.

---

#### Verwendung im Formular

1. Lade die Engine in dein Form-Skript:

   ```ts
   import { DynamicMandatory } from "../features/dynamic-mandatory/wrm_dynamicMandatory";
   ```

2. Registriere die Methoden:

   * **OnLoad**: `DynamicMandatory.init`
   * **OnChange**: automatisch (�ber `autoWireOnChange`), oder manuell `DynamicMandatory.apply` auf relevante Felder

---

#### Pflegehinweise f�r Admins

* JSON wird **pro Business Unit** gepflegt.
* Jede Regel sollte einen **sprechenden Namen** haben (`name`).
* Nur **logical names** von Feldern verwenden (z. B. `telephone1`, nicht �Telefon Gesch�ft�).
* Syntaxfehler im JSON (fehlende Kommas, falsche Klammern) f�hren dazu, dass **keine Regeln angewendet werden**.
* Neue Felder/Regeln k�nnen jederzeit hinzugef�gt werden ? kein Code-Deploy n�tig.
