# Wiki-Query Marp Slides Extension — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the `wiki-query` command so that every query automatically generates a Marp slide deck in `rxjs-wiki/slides/` alongside the filed wiki page.

**Architecture:** One file changes — `~/.claude/commands/wiki-query.md`. The updated instruction text appends slide-generation steps after the existing log.md step. Slides live in a flat `rxjs-wiki/slides/` directory; the filename is derived by flattening the wiki page path (`core/Observable.md` → `slides/core-Observable.md`).

**Tech Stack:** Marp (markdown slides), plain `.md` files, no build step.

---

## File Map

| Action | File |
|--------|------|
| Modify | `C:/Users/HP/.claude/commands/wiki-query.md` |
| Created by command at runtime | `C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki/slides/<topic>.md` |

---

## Task 1: Update wiki-query.md with slide-generation instructions

**Files:**
- Modify: `C:/Users/HP/.claude/commands/wiki-query.md`

- [ ] **Step 1: Read the current file**

  Open `C:/Users/HP/.claude/commands/wiki-query.md` and confirm it contains exactly this single-paragraph text (no trailing newline check needed — just confirm the content):

  ```
  Answer a question against the RxJS wiki at C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki/. Read index.md first to identify relevant pages, then read those pages and synthesize a thorough answer with [[page]] citations. After answering, always file the answer as a new wiki page automatically — choose the most appropriate folder (core/, history/, patterns/, architectures/, testing/, debugging/), create the page with proper YAML frontmatter (title, category, tags, related, sources, updated), add cross-links to and from related existing pages, add it to index.md, update the .vitepress/config.ts sidebar, and append a "## [YYYY-MM-DD] query | <question summary>" entry to log.md noting the page it was filed as. Follow project code style: tabs, single quotes, $ suffix for Observables, explicit TypeScript types, pipe() over chaining.
  ```

- [ ] **Step 2: Overwrite the file with the extended instruction**

  Replace the entire file content with:

  ````
  Answer a question against the RxJS wiki at C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki/. Read index.md first to identify relevant pages, then read those pages and synthesize a thorough answer with [[page]] citations. After answering, always file the answer as a new wiki page automatically — choose the most appropriate folder (core/, history/, patterns/, architectures/, testing/, debugging/), create the page with proper YAML frontmatter (title, category, tags, related, sources, updated), add cross-links to and from related existing pages, add it to index.md, update the .vitepress/config.ts sidebar, and append a "## [YYYY-MM-DD] query | <question summary>" entry to log.md noting the page it was filed as.

  After appending to log.md, generate a Marp slide deck from the filed page:
  1. Derive the slide path: take the filed page path (e.g. `core/Observable.md`), replace `/` with `-`, and prefix with `slides/` → `slides/core-Observable.md`.
  2. Create the `slides/` directory inside the wiki root if it does not exist.
  3. Write the slide file with this structure:
     - Frontmatter block: `marp: true`, `theme: uncover`, `title` copied from the page's YAML frontmatter.
     - Title slide: `# <title>` followed by `> <one-sentence summary>` (the `>` blockquote from the top of the filed page).
     - One `---`-separated slide per H2 section from the filed page. For each H2:
       - Use the H2 heading as the slide heading.
       - Condense prose paragraphs to 3–5 tight bullet points.
       - Preserve code blocks; trim any block longer than 15 lines to the most illustrative lines with a `// ...` comment marking the cut.
       - Keep ASCII marble diagrams exactly as-is.
       - Omit the "Related" section entirely.
  4. Append `Slides: slides/<filename>` to the existing log.md entry for this query (on the line after "Answer filed as: ...").

  Follow project code style: tabs, single quotes, $ suffix for Observables, explicit TypeScript types, pipe() over chaining.
  ````

- [ ] **Step 3: Verify the file**

  Read `wiki-query.md` back and confirm:
  - The original paragraph is still present unchanged at the top
  - The "After appending to log.md, generate a Marp slide deck..." block follows it
  - The four numbered steps (derive path, create dir, write file, append log) are all present
  - The file ends with the code-style line

- [ ] **Step 4: Commit**

  ```bash
  git add C:/Users/HP/.claude/commands/wiki-query.md
  git commit -m "feat: extend wiki-query to generate Marp slides after each query"
  ```

---

## Task 2: Smoke-test the updated command

**Files:**
- Verify created: `C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki/slides/<topic>.md`

This task verifies the updated command actually produces a well-formed Marp file. Run a real wiki-query on a simple, already-indexed topic so you can compare the output against the spec without doing deep research.

- [ ] **Step 1: Run a wiki-query on an existing topic**

  Use the updated `/wiki-query` command with this prompt:

  ```
  What is a BehaviorSubject?
  ```

  Expected: the command answers the question, files (or skips filing if the page already exists — in that case it should still generate slides from the existing page), and produces a slide file.

- [ ] **Step 2: Locate the generated slide file**

  The filed page will be `core/BehaviorSubject.md` (already exists in the wiki). The slide file should be at:

  ```
  C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki/slides/core-BehaviorSubject.md
  ```

  Read the file and confirm it is present.

- [ ] **Step 3: Verify slide file structure**

  Check the file for all of the following — each is a pass/fail:

  | Check | Expected |
  |-------|----------|
  | First 3 lines | `---`, `marp: true`, `theme: uncover` |
  | `title:` line | Matches the `title:` in `core/BehaviorSubject.md` frontmatter |
  | Title slide | Contains `# BehaviorSubject` and a `>` blockquote line |
  | Slide breaks | At least 3 `---` separators (one per H2 in the source page) |
  | No "Related" slide | The word "Related" does not appear as a heading |
  | Code blocks | Any code block present is ≤ 15 lines |

  If any check fails, note which one and fix the command text in Task 1 Step 2 accordingly, then re-run.

- [ ] **Step 4: Verify log.md entry**

  Open `C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki/log.md` and find the most recent entry. Confirm it contains both:
  - `Answer filed as: core/BehaviorSubject.md` (or similar)
  - `Slides: slides/core-BehaviorSubject.md`

- [ ] **Step 5: Commit the generated slide**

  ```bash
  cd C:/Users/HP/Web/Frontend/rxjs/rxjs-wiki
  git add slides/core-BehaviorSubject.md log.md
  git commit -m "test: add smoke-test slide for BehaviorSubject query"
  ```

---

## Self-Review Notes

- Spec requires: automatic generation on every query → Task 1 adds it to the command; Task 2 verifies it fires
- Spec requires: flat `slides/` dir → path-flattening rule in Step 2 covers this
- Spec requires: `uncover` theme → frontmatter in Step 2 specifies it
- Spec requires: one slide per H2 → rule 3 in the instruction covers this
- Spec requires: log entry extended → rule 4 in the instruction covers this
- No placeholders or TBDs in any step
