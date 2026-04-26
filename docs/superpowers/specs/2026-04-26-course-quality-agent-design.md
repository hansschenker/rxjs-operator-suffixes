# Course Terminology Quality Agent — Design Spec

**Date:** 2026-04-26  
**Status:** Approved  
**Scope:** Cross-repo terminology consistency check for three RxJS course repos

---

## Problem

Three RxJS course repos accumulate narration scripts independently:

| Repo | Files | Structure |
|------|-------|-----------|
| `rxjs-insights` | ~73 | 6 sections → lessons → concept / deep-dive / code-sample |
| `rxjs-deep-dive-claude-superpowers` | ~53 | 11 sections → recording notes |
| `rxjs-what-is-it-meta` | ~120 | 10 modules → lessons + exercises |

Terms like "cold observable", "hot observable", and "flattening" are defined inline across hundreds of files with no central authority. Definitions drift over time and contradict each other across repos without anyone noticing.

---

## Goal

A quality agent that:
1. Checks all three repos against a curated canonical glossary
2. Flags any script that defines a term differently from the glossary
3. Flags terms defined in scripts but missing from the glossary (candidates for addition)
4. Runs locally on demand and in CI on every push

---

## Approach: Two-Tier (Lexical CI + LLM On-Demand)

### Tier 1 — Lexical pass (always runs)

- Fast, deterministic, no external dependencies
- Runs in CI on every push and locally via `node scripts/check-terminology.mjs`
- Parses `glossary.md` → `Map<term, definition>`
- Walks all `.md` files in all three repos (skips code fences)
- Extracts sentences matching definitional patterns: `<term> is`, `<term> means`, `<term> refers to`, `a <term> is`, `the <term> is`
- Compares flagged sentences to canonical definitions via token overlap (default threshold: 0.30)
- Findings below threshold = flagged contradiction
- Sentences using definitional patterns for terms absent from glossary = flagged as undocumented

### Tier 2 — LLM pass (`--deep` flag, local only)

- Scoped to files changed since base branch (`git diff --name-only main`); falls back to scanning all files if no base branch can be determined (e.g. on the main branch itself)
- Sends each changed file + full glossary to Claude API
- Model: `claude-haiku-4-5` (~$0.01/file)
- Returns structured findings: `{ term, file, line_hint, issue, canonical_definition }`
- Requires `ANTHROPIC_API_KEY` environment variable
- Catches semantic drift and paraphrased contradictions that regex misses
- Merges findings with Tier 1 results in final report

---

## Repository Layout

All agent files live in the parent `rxjs/` workspace:

```
rxjs/
  glossary.md                        ← canonical term definitions (user-maintained)
  scripts/
    check-terminology.mjs            ← CLI entry point
    lib/
      parse-glossary.mjs             ← parses glossary.md → Map<term, definition>
      scan-scripts.mjs               ← walks repos, extracts definitional sentences
      compare.mjs                    ← token-overlap comparison, produces findings
      llm-check.mjs                  ← Tier 2 Claude API call
      report.mjs                     ← terminal or JSON output formatter
    lib/*.test.mjs                   ← Vitest unit tests
  .github/
    workflows/
      course-quality.yml             ← GitHub Actions CI
```

The three course repos are referenced by relative sibling paths — no cloning needed.

---

## Glossary Format

`glossary.md` uses H2 headings as term keys, body as canonical definition:

```markdown
## cold observable
An Observable whose producer is created fresh on each `subscribe()` call —
nothing runs until a subscriber attaches.

## hot observable
An Observable whose producer exists independently of subscribers —
e.g. a DOM event stream or a `Subject`.

## flattening
The process of subscribing to inner Observables emitted by a higher-order
Observable and merging their values into a single output stream.
```

Rules:
- One term per H2 heading (lowercase)
- Body is the canonical definition — first paragraph only is used for comparison
- Headings with no body are skipped with a warning

---

## CLI Interface

```bash
# Tier 1 only — fast, no API key needed
node scripts/check-terminology.mjs

# Tier 1 + Tier 2 on changed files
node scripts/check-terminology.mjs --deep

# Scope to one repo only
node scripts/check-terminology.mjs --repo rxjs-insights

# Machine-readable output
node scripts/check-terminology.mjs --format json

# Adjust token-overlap threshold (0.0–1.0, default 0.3)
node scripts/check-terminology.mjs --threshold 0.4

# Append undocumented terms to glossary.md as stub entries
node scripts/check-terminology.mjs --add-candidates
```

**Exit codes:** `0` = no findings, `1` = findings present.

---

## Output Format (terminal)

```
TERMINOLOGY FINDINGS — 3 repos, 246 files scanned

[CONTRADICTION] rxjs-insights/scripts/section-03-data-model/08-push-model/concept.md:14
  Term: cold observable
  Found: "a cold observable is one that starts when you call subscribe and shares no state"
  Canonical: "An Observable whose producer is created fresh on each subscribe() call — nothing runs until a subscriber attaches."

[UNDOCUMENTED] rxjs-deep-dive-claude-superpowers/docs/recording-notes/section-02/02-03.md:31
  Term: lazy observable
  Found: "a lazy observable is one that defers execution until subscribed"
  → Not in glossary. Add it? Run with --add-candidates to append to glossary.md.

2 findings in 0.4s
```

---

## GitHub Actions

`.github/workflows/course-quality.yml` triggers on every push to any branch.

Behaviour:
- Runs `node scripts/check-terminology.mjs --format json`
- Writes findings to the Actions job summary (always)
- If a PR is open for the current branch: posts findings as a PR comment via `gh pr comment --edit-last`
- No auto-issue creation — findings are informational; human reviews and acts

Requires: Node.js 20+. No secrets needed for Tier 1. `ANTHROPIC_API_KEY` required only for `--deep`, which CI does not run.

---

## Error Handling

| Situation | Behaviour |
|-----------|-----------|
| `glossary.md` missing | Hard error: "glossary.md not found at rxjs/ root" |
| `ANTHROPIC_API_KEY` missing with `--deep` | Hard error explaining requirement |
| A course repo directory not found | Warning, skip that repo, continue |
| Glossary heading with no body | Skip term, warn at end of run |
| Claude API timeout / rate limit | Retry once, then fall back to Tier 1 only for that file with warning |

---

## Testing

Vitest suite at `scripts/lib/*.test.mjs`:

| Module | What is tested |
|--------|---------------|
| `parse-glossary` | Multi-term parse, heading-with-no-body handling |
| `scan-scripts` | Definitional sentence extraction, code-fence skipping |
| `compare` | Correct flagging at threshold boundaries, non-definitional term usage ignored |

The LLM call (`llm-check.mjs`) is not unit-tested — it is an integration boundary. The wrapper interface is thin enough to mock in future if needed.

---

## Out of Scope

- Prerequisite ordering checks (not requested)
- Code sample compilation (not requested)
- Marp slide-count checks (not requested)
- Auto-fixing contradictions
- Semantic similarity beyond the `--deep` LLM pass
