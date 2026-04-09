# RxJS Wiki — Schema & Conventions

This file is the schema for the RxJS wiki. It tells the LLM how the wiki is structured, what conventions to follow, and what workflows to use when ingesting sources, answering queries, or maintaining the wiki.

---

## Wiki Purpose

A persistent, compounding knowledge base about RxJS — its core concepts, patterns, architecture, history, testing, and debugging. The LLM writes and maintains all wiki pages. You curate sources and direct exploration.

---

## Directory Structure

```
rxjs-wiki/
├── CLAUDE.md           ← This file (schema)
├── index.md            ← Content catalog (LLM updates on every change)
├── log.md              ← Append-only operation log
├── overview.md         ← High-level synthesis of all RxJS knowledge
├── sources/            ← Raw, immutable input material (LLM reads, never modifies)
│   ├── talks/          ← Conference talk transcripts (YouTube copy-paste or whisper)
│   ├── articles/       ← Web clips as markdown (Obsidian Web Clipper)
│   ├── courses/        ← Course notes, chapter summaries
│   └── code/           ← Reference implementations, example repos
├── core/               ← RxJS primitives and building blocks
│   ├── Observable.md
│   ├── Observer.md
│   ├── Subscription.md
│   ├── Subject.md
│   ├── BehaviorSubject.md
│   ├── ReplaySubject.md
│   ├── AsyncSubject.md
│   ├── Scheduler.md
│   └── operators.md
├── history/            ← RxJS history and version evolution
├── patterns/           ← Reactive programming patterns
├── architectures/      ← Application architecture using RxJS
├── testing/            ← Testing strategies for RxJS code
└── debugging/          ← Debugging techniques for RxJS streams
```

## Sources Layer

`sources/` holds raw input material — immutable originals the LLM reads but never edits.

| Folder | What goes here | How to get content |
|--------|---------------|-------------------|
| `sources/talks/` | Conference talk transcripts | YouTube → "..." → "Show transcript" → copy-paste as `.txt` |
| `sources/articles/` | Web articles as markdown | Obsidian Web Clipper browser extension |
| `sources/courses/` | Course notes, chapter summaries | Manual notes or copy from course platform |
| `sources/code/` | Reference implementations, annotated examples | Copy from repos or paste code blocks |

**Naming convention:** `YYYY-MM-DD-speaker-or-title.md` (or `.txt` for transcripts)

```
sources/talks/2021-06-15-ben-lesh-rxjs7-release.txt
sources/articles/2023-03-nicholas-jamieson-shareReplay.md
sources/courses/2024-rxjs-masterclass-chapter-03.md
sources/code/rxjs-effects-musician-app-effects-runner.ts
```

---

## Page Conventions

### Frontmatter (YAML)

Every wiki page must start with frontmatter:

```yaml
---
title: "Page Title"
category: core | history | patterns | architectures | testing | debugging
tags: [tag1, tag2]
related: [other-page.md, another-page.md]
sources: 0
updated: YYYY-MM-DD
---
```

### Page Structure

```markdown
# Title

> One-sentence summary (used as the index entry)

## Overview
Brief intro.

## [Main sections — depends on page type]

## Related
- [link](link) — why it's related
```

### Cross-references

Use wiki-link style: `[filename](filename)` or `[display text](filename)` — Obsidian-compatible.

---

## Operations

### Ingest a source

1. Read the source document
2. Discuss key takeaways with user
3. Write a summary page in `sources/` (if a document) or integrate directly into concept pages
4. Update all touched concept/entity pages
5. Update `index.md`
6. Append to `log.md`:
   ```
   ## [YYYY-MM-DD] ingest | Source Title
   Pages touched: ...
   Key additions: ...
   ```

### Answer a query

1. Read `index.md` to find relevant pages
2. Read the relevant pages
3. Synthesize answer with `[page](page)` citations
4. If the answer is valuable, file it as a new page (the LLM prompts the user to confirm)
5. Append to `log.md`:
   ```
   ## [YYYY-MM-DD] query | Question summary
   Answer filed as: page.md (or "not filed")
   ```

### Lint the wiki

Check for:
- Contradictions between pages
- Orphan pages (no inbound links)
- Concepts mentioned but lacking a page
- Missing cross-references
- Stale information (newer sources have superseded)
- Data gaps that could be filled with a web search

Append to `log.md`:
```
## [YYYY-MM-DD] lint
Issues found: N
Actions taken: ...
```

---

## Content Standards

- **Code blocks** always specify language: ` ```typescript `
- **Marble diagrams** in ASCII for stream visualizations
- **Operator examples** include: signature, marble diagram, use case, pitfall
- **Architecture pages** include: diagram, data flow, when to use, trade-offs
- **Pattern pages** include: problem, solution, code example, related patterns

---

## Operator Page Template

```markdown
---
title: "operatorName"
category: core
tags: [operator, transformation|filtering|combination|...]
related: [...]
---

# operatorName

> One-line description.

## Signature
\`\`\`typescript
operatorName<T>(args): OperatorFunction<T, R>
\`\`\`

## Marble Diagram
\`\`\`
source: -a-b-c-|
result: -A-B-C-|
\`\`\`

## Description
...

## Use Cases
- ...

## Pitfalls
- ...

## Example
\`\`\`typescript
...
\`\`\`

## Related
- [switchMap](switchMap) — use when you need cancellation
```

---

## Index Format

`index.md` is organized by category. Each entry:
```
- [Page Title](filename) — one-line summary
```

---

## Log Format

`log.md` entries always start with `## [YYYY-MM-DD] <operation> | <description>` for grep-ability.

```bash
grep "^## \[" log.md | tail -10   # last 10 operations
grep "ingest" log.md              # all ingests
```
