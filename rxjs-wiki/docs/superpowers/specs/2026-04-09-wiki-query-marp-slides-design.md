# Wiki-Query Marp Slides Extension — Design

**Date:** 2026-04-09
**Scope:** Extend the `wiki-query` command to automatically generate a Marp slide deck from every query result.

---

## Summary

Every time `/wiki-query` is used, after filing the answer as a wiki page, the command also generates a Marp `.md` slide file in a flat `slides/` directory at the wiki root. No new commands, no new workflow — just two extra steps appended to the existing wiki-query flow.

---

## What Changes

`wiki-query.md` gains two extra steps **after** the existing "append to log.md" step:

1. **Generate Marp slides** from the filed wiki page.
2. **Note the slide file** in the existing log.md entry.

No changes to `index.md`, the VitePress sidebar, or any other workflow step.

---

## Slide File Location

All slide files live in a flat `slides/` directory at the wiki root.

The path is derived by flattening the wiki page path:

```
core/Observable.md      →  slides/core-Observable.md
patterns/mvu.md         →  slides/patterns-mvu.md
debugging/tap.md        →  slides/debugging-tap.md
```

---

## Slide File Structure

```markdown
---
marp: true
theme: uncover
title: "Page Title"
---

# Page Title
> One-sentence summary

---

## Section Heading

- Bullet point condensed from prose
- Bullet point condensed from prose
- Bullet point condensed from prose

---

## Next Section

...
```

---

## Slide Generation Rules

| Content type | Rule |
|---|---|
| Prose paragraphs | Condense to 3–5 bullet points per slide |
| Code blocks | Keep the most illustrative snippet; trim to 15 lines max with `// ...` |
| ASCII marble diagrams | Keep as-is |
| "Related" section | Omit — not useful in slides |

One `---` slide break per H2 section from the filed wiki page. The opening title slide uses the page `title` frontmatter and the one-sentence summary from the page's `>` blockquote.

---

## Log Entry

The slide file is noted in the **existing** log.md entry for the query — not a separate entry:

```
## [YYYY-MM-DD] query | Question summary
Answer filed as: core/Observable.md
Slides: slides/core-Observable.md
```

---

## Out of Scope

- A standalone `/wiki-slides` command for generating slides from existing pages (can be added later if needed)
- Marp theme customisation per query
- Index or sidebar entries for slide files
