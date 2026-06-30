# Solution Vision

## Purpose

This solution provides a shared TypeScript foundation for Dynamics 365 WebResources.

It should centralize common behavior, reduce repeated form logic, and represent business-specific variants through configuration or clearly separated form scripts.

## Goals

- Reusable Xrm helpers in `WebResources/src/core`.
- Central entity and field metadata in `WebResources/src/entities`.
- Generic features in `WebResources/src/features`.
- Thin form scripts in `WebResources/src/form`.
- Configurable mandatory field logic through Business Unit / Location configuration.
- Clear bundle and deployment boundaries for Dynamics WebResources.

## Non-Goals

- No complete Dynamics metadata generation.
- No server-side plugin architecture.
- No business logic in Core when it only applies to a single form.
- No duplicated logical names outside entity metadata files.

## Architecture Principles

- Shared behavior is centralized only when it has at least two realistic reuse cases or is clearly generic from a business perspective.
- Form scripts orchestrate UI events and delegate to Core, Entities, or Features.
- Entity files are the single source of truth for logical names, OptionSet values, tabs, sections, and relationships.
- Configuration replaces code only where behavior is stable and variants are business-data-driven.
- Error handling is defensive against missing controls, missing attributes, and Dynamics runtime differences.

## Success Criteria

- New form logic requires only minimal new helper code.
- Existing helpers are not diluted with form-specific behavior.
- Mandatory rules can be extended without code deployment.
- Build outputs can be clearly mapped to Dynamics WebResources.
- Reviews can use these SDD files to check whether new implementations introduce redundant solutions.

