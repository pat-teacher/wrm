# QPLIX Links – Web Resource Documentation

## Overview

This HTML web resource is embedded as an IFrame inside a Dynamics 365 form. It reads a UID from the form field `mhwrmb_qplix_ve_uid`, retrieves a URL configuration from the `nev_config` table, and renders one clickable button per configured URL.

---

## How It Works

### Step 1 – Read UID from Form
On page load, the script reads the field `mhwrmb_qplix_ve_uid` from the parent form. If the field is empty, the web resource renders nothing and exits silently.

### Step 2 – Retrieve URL Configuration
The script calls the Dynamics 365 Web API to retrieve the config record from the `nev_config` table:

- **Table:** `nev_config`
- **Filter:** `nev_key = 'idQplixBaseUrl'`
- **Value column:** `nev_value_ntext` (JSON format)

### Step 3 – Build & Render Links
The JSON is parsed and iterated. For each entry, the placeholder `{UID}` in the URL is replaced with the actual UID from the form. A button is rendered per entry using `urlDescription` as the label.

---

## Configuration JSON Structure

The JSON stored in `nev_value_ntext` must follow this structure:

```json
{
  "QplixAnalytics": {
    "urlDescription": "Open in QPLIX - Analytics",
    "url": "https://portal.marcuardheritage.com/CoreUI/#/administration/legalEntities/editLegalEntity?id={UID}"
  },
  "QplixNeoPortal": {
    "urlDescription": "Open in Neo Portal",
    "url": "https://portal.marcuardheritage.com/neo/#/story/overview?perspectiveId={UID}"
  }
}
```

| Field | Description | Example |
|---|---|---|
| Key (e.g. `QplixAnalytics`) | Unique identifier for the entry | `QplixAnalytics` |
| `urlDescription` | Button label displayed to the user | `Open in QPLIX - Analytics` |
| `url` | Target URL – use `{UID}` as placeholder for the record UID | `https://portal.marcuardheritage.com/...?id={UID}` |

---

## Maintenance

To keep the buttons working, the following conditions must be met:

### 1. Config Record in nev_config
A record must exist in the `nev_config` table with:
- `nev_key` = `idQplixBaseUrl`
- `nev_value_ntext` = valid JSON with at least one entry containing `urlDescription` and `url`

### 2. URL Contains {UID} Placeholder
Each URL in the JSON must contain the exact placeholder `{UID}` (case-sensitive). This is replaced at runtime with the value from the form field.

### 3. Form Field mhwrmb_qplix_ve_uid
The field `mhwrmb_qplix_ve_uid` must exist on the form and contain a valid UID for the buttons to appear. If the field is empty, no buttons are shown.

### 4. Web Resource Registered on the Form
The web resource must be added as an IFrame in the Form Editor with the option **"Pass record object-type code and unique identifier as parameters"** enabled.

---

## Adding a New Link

To add a new button, add a new entry to the JSON in `nev_value_ntext`. **No code changes are required.**

```json
{
  "QplixAnalytics": {
    "urlDescription": "Open in QPLIX - Analytics",
    "url": "https://portal.marcuardheritage.com/CoreUI/#/administration/legalEntities/editLegalEntity?id={UID}"
  },
  "QplixNeoPortal": {
    "urlDescription": "Open in Neo Portal",
    "url": "https://portal.marcuardheritage.com/neo/#/story/overview?perspectiveId={UID}"
  },
  "QplixReports": {
    "urlDescription": "Open Reports",
    "url": "https://portal.marcuardheritage.com/reports?id={UID}"
  }
}
```

The new button will appear automatically without any changes to the web resource file.
