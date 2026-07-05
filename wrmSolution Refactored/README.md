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

The Dynamic Mandatory Engine controls required fields in Dynamics forms from JSON configuration.

Active runtime configuration:

```text
Table:  ambcust_location
Field:  mhwrmb_mandatoryconfigjson
```

Use the SDD documentation as the maintained source of truth:

* `docs/specs/02-dynamic-mandatory-engine.md`: overview, technical runtime, form integration, JSON maintenance guide, examples, and troubleshooting.
* `docs/specs/schemas/mandatory-config.contract.yaml`: machine-readable JSON contract.
