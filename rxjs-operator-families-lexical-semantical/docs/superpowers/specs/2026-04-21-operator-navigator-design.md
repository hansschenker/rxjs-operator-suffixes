# RxJS Operator Family Navigator — Design Spec

**Date:** 2026-04-21
**Status:** Approved

---

## Purpose

An interactive lookup tool for experienced RxJS developers who know *what they want to achieve* but need a fast path to the right operator name. Not a tutorial — a routing guide.

---

## Architecture

The app is a **VitePress site** with two modes:

1. **Navigator** — the home page; a three-panel drill-down component
2. **Operator detail** — one VitePress markdown page per operator

A single `src/taxonomy.ts` file is the source of truth for the entire family hierarchy. Both the navigator component and operator pages derive from it.

### File Structure

```
docs/
  .vitepress/
    config.ts                    ← VitePress config; no sidebar (navigator replaces it)
    components/
      ThreePanelNavigator.vue    ← three-panel UI component
      OperatorBreadcrumb.vue     ← reads frontmatter via useData(), renders breadcrumb
  index.md                       ← home page, embeds <ThreePanelNavigator />
  operators/
    map.md
    switchMap.md
    ...                          ← one file per operator
src/
  taxonomy.ts                    ← typed family hierarchy, single source of truth
```

---

## Data Model

`src/taxonomy.ts` exports a typed constant consumed by the navigator component:

```ts
export interface Operator {
  name: string     // e.g. 'switchMap'
  slug: string     // maps to docs/operators/{slug}.md
  tagline: string  // one-line intent description
}

export interface SubFamily {
  label: string
  operators: Operator[]
}

export interface Family {
  label: string    // e.g. 'Flattening Policies'
  letter: string   // e.g. 'F' (from the decision-tree taxonomy)
  subFamilies: SubFamily[]
}

export const taxonomy: Family[] = [ /* 14 families */ ]
```

No API calls, no async loading. The navigator imports `taxonomy` directly at compile time.

---

## Three-Panel Navigator

### Layout

```
┌─────────────────────┬─────────────────────┬─────────────────────┐
│  FAMILY             │  SUB-FAMILY         │  OPERATORS          │
│─────────────────────│─────────────────────│─────────────────────│
│  Creation           │  Web callbacks      │  fromEvent          │
│  Combination   ←──  │  Create on sub  ←── │  fromEventPattern   │
│▶ Flattening         │  From values        │  bindCallback       │
│  Filtering          │▶ Only latest        │▶ bindNodeCallback   │
│  State/Accum        │  Queue              │                     │
│  Time Control       │  Allow overlap      │                     │
│  ...                │  Ignore while busy  │                     │
└─────────────────────┴─────────────────────┴─────────────────────┘
```

### Interaction Rules

- Column 1 (Families) is always populated on page load; first family is pre-selected.
- Selecting a Family populates Column 2 and clears Column 3.
- Selecting a Sub-Family populates Column 3.
- Clicking an Operator navigates to `/operators/{slug}` — the only full-page transition.
- Active selection in each column is visually highlighted.

### State

Three Vue `ref`s inside `ThreePanelNavigator.vue`:

```ts
const selectedFamily    = ref<Family | null>(taxonomy[0])
const selectedSubFamily = ref<SubFamily | null>(null)
const selectedOperator  = ref<Operator | null>(null)
```

No Pinia, no Vuex. Navigation to operator page uses VitePress's `useRouter().go()`.

### URL State Restoration

The navigator reads an optional `?family={letter}` query param on mount and pre-selects the matching family. This allows the operator detail page's "Back to navigator" link to restore context.

---

## Operator Detail Page

### Frontmatter

```yaml
---
title: switchMap
family: Flattening Policies
subFamily: Only latest
tagline: Cancel previous inner observable, subscribe to the latest
---
```

### Page Structure

1. **`<OperatorBreadcrumb />`** — renders `Flattening Policies → Only latest → switchMap` from frontmatter via `useData()`
2. **Signature** — TypeScript function signature in a code block
3. **What it does** — one intent-first paragraph
4. **Marble diagram** — ASCII marble diagram in a code block
5. **When to use** — bullet list of concrete scenarios
6. **Related operators** — links to sibling operators in the same sub-family

### Navigation

A "← Back to navigator" link at the top routes to `/?family={letter}` to restore panel state.

---

## VitePress Configuration

- `ThreePanelNavigator` and `OperatorBreadcrumb` registered as global components in `.vitepress/theme/index.ts` (not `config.ts`) using VitePress's `enhanceApp` hook
- A Vite path alias `@taxonomy` → `src/taxonomy.ts` configured in `.vitepress/config.ts` under `vite.resolve.alias` so Vue components can `import { taxonomy } from '@taxonomy'` without fragile relative paths
- No custom sidebar — the navigator replaces standard sidebar navigation
- `srcDir` set to `docs/` so operator pages resolve cleanly as `/operators/{slug}`

---

## Out of Scope

- Marble diagram rendering (interactive/animated) — ASCII diagrams only for now
- Search within the navigator panels
- Dark/light theme customisation beyond VitePress defaults
- Operator playground / live code execution
