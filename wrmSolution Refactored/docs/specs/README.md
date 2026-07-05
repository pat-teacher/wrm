# SDD Specs

These specifications describe the shared foundation of the Dynamics 365 WebResources solution.

The goal is to make reusable architecture decisions, code contracts, and business rules explicit, so new form logic does not repeatedly become a one-off implementation.

## Files

- `00-solution-vision.md`: Target state, scope, and architecture principles.
- `01-architecture.md`: Layers, dependencies, and bundle structure.
- `02-dynamic-mandatory-engine.md`: Behavior of the dynamic mandatory field engine.
- `03-extension-workflow.md`: Workflow for adding new entities, forms, and features.
- `04-create-internal-task.md`: Technical documentation for the Create Internal Task command, dialog, configuration, security, and form integration.
- `schemas/mandatory-config.contract.yaml`: Machine-readable contract for mandatory configurations.
- `schemas/entity-metadata.contract.yaml`: Contract for `*.entity.ts` files.
- `schemas/form-script.contract.yaml`: Contract for form scripts.
- `schemas/bundles.contract.yaml`: Contract for Webpack entries and Dynamics WebResources.

## Working Model

Markdown files describe intent, rules, and decisions for humans.
YAML files describe verifiable contracts for reviews, scripts, or future CI checks.

If documents conflict, precedence is:

1. Production Dynamics configuration and code.
2. YAML contract.
3. Markdown explanation.

