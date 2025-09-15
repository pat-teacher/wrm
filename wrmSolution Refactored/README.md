# wrmSolution
## Mandatory Engine

### Kurz-Erklärung der Regeln (für Admins/Entwickler)

Dieses Feature steuert **dynamische Pflichtfelder** in Dynamics 365, abhängig von **Business Unit** und **Bedingungen pro Entität**.
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
  * `condition`: Bedingungen (UND-Verknüpfung)

---

#### Unterstützte Operatoren

| Operator    | Bedeutung           | Beispiel                       |
| ----------- | ------------------- | ------------------------------ |
| `eq`        | Gleichheit          | `statecode == 0`               |
| `ne`        | Ungleichheit        | `statecode != 1`               |
| `in`        | Wert in einer Liste | `country in [DE, FR, IT]`      |
| `isnull`    | Feld ist leer       | `wrm_country IS NULL`          |
| `isnotnull` | Feld ist gefüllt    | `primarycontactid IS NOT NULL` |

---

#### Mögliche Datentypen für `value`

* **Zahl** ? OptionSet-Werte (`1`, `2`, …)
* **String** ? z. B. `"external"`, `"CH"`
* **Boolean** ? `true` / `false`
* **GUID** ? Lookup-ID (`"a1b2c3d4-1111-2222-3333-444455556666"`)
* **Array** ? nur für `in` (`["DE","FR","IT"]`)

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
   * **OnChange**: automatisch (über `autoWireOnChange`), oder manuell `DynamicMandatory.apply` auf relevante Felder

---

#### Pflegehinweise für Admins

* JSON wird **pro Business Unit** gepflegt.
* Jede Regel sollte einen **sprechenden Namen** haben (`name`).
* Nur **logical names** von Feldern verwenden (z. B. `telephone1`, nicht „Telefon Geschäft“).
* Syntaxfehler im JSON (fehlende Kommas, falsche Klammern) führen dazu, dass **keine Regeln angewendet werden**.
* Neue Felder/Regeln können jederzeit hinzugefügt werden ? kein Code-Deploy nötig.
