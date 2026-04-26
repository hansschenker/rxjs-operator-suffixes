# Course Terminology Quality Agent — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a two-tier terminology consistency checker that validates all three RxJS course repos against a curated `glossary.md`, runs locally on demand and in CI on every push.

**Architecture:** Tier 1 is a pure Node.js lexical pass (no external deps) that extracts definitional sentences and compares them to canonical glossary definitions via token-overlap (Jaccard similarity). Tier 2 (`--deep`) calls the Claude Haiku API on git-changed files only for semantic analysis. A GitHub Actions workflow runs Tier 1 on every push and posts findings to the PR comment / job summary.

**Tech Stack:** Node.js 24, ESM (`.mjs`), Vitest 4, `@anthropic-ai/sdk` 0.x, GitHub Actions

---

## File Map

| File | Responsibility |
|------|---------------|
| `glossary.md` | Curated canonical term definitions (user-maintained) |
| `scripts/check-terminology.mjs` | CLI entry point — parses args, orchestrates all modules |
| `scripts/lib/parse-glossary.mjs` | Parses `glossary.md` → `Map<term, definition>` |
| `scripts/lib/scan-scripts.mjs` | Walks repos, extracts definitional sentences per file |
| `scripts/lib/compare.mjs` | Jaccard token-overlap comparison, returns finding objects |
| `scripts/lib/report.mjs` | Formats findings as terminal text or JSON |
| `scripts/lib/llm-check.mjs` | Tier 2: Claude Haiku API call for semantic analysis |
| `scripts/lib/parse-glossary.test.mjs` | Vitest tests for parse-glossary |
| `scripts/lib/scan-scripts.test.mjs` | Vitest tests for scan-scripts |
| `scripts/lib/compare.test.mjs` | Vitest tests for compare |
| `vitest.config.mjs` | Vitest config scoped to `scripts/lib/**` |
| `.github/workflows/course-quality.yml` | GitHub Actions CI |

---

## Task 1: Bootstrap workspace

**Files:**
- Modify: `package.json`
- Create: `vitest.config.mjs`
- Create: `scripts/lib/` (directory only)

- [ ] **Step 1: Update root `package.json`**

Replace the `scripts` and add `devDependencies`/`dependencies`:

```json
{
  "name": "rxjs",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "check-terminology": "node scripts/check-terminology.mjs",
    "test:terminology": "vitest run --config vitest.config.mjs"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "@anthropic-ai/sdk": "^0.91.1",
    "rxjs": "^7.8.2",
    "typescript": "^5.9.3",
    "vitepress": "^1.6.4",
    "ws": "^8.18.3"
  },
  "devDependencies": {
    "vitest": "^4.1.4"
  }
}
```

- [ ] **Step 2: Create `vitest.config.mjs`**

```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['scripts/lib/**/*.test.mjs'],
  },
})
```

- [ ] **Step 3: Create directories and install dependencies**

```bash
mkdir -p scripts/lib
npm install
```

Expected: `node_modules/@anthropic-ai/sdk` appears; `node_modules/vitest` appears.

- [ ] **Step 4: Commit**

```bash
git add package.json vitest.config.mjs
git commit -m "chore: bootstrap terminology agent workspace"
```

---

## Task 2: `parse-glossary.mjs` (TDD)

**Files:**
- Create: `scripts/lib/parse-glossary.mjs`
- Create: `scripts/lib/parse-glossary.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/parse-glossary.test.mjs`:

```javascript
import { describe, test, expect } from 'vitest'
import { parseGlossary } from './parse-glossary.mjs'

describe('parseGlossary', () => {
  test('parses a single term', () => {
    const { terms } = parseGlossary('## cold observable\nA producer created fresh per subscribe.\n')
    expect(terms.get('cold observable')).toBe('A producer created fresh per subscribe.')
  })

  test('parses multiple terms', () => {
    const { terms } = parseGlossary(
      '## cold observable\nProducer created fresh per subscribe.\n\n## hot observable\nProducer exists independently.\n'
    )
    expect(terms.size).toBe(2)
    expect(terms.has('hot observable')).toBe(true)
  })

  test('uses only first paragraph', () => {
    const { terms } = parseGlossary('## flattening\nFirst paragraph.\n\nSecond paragraph ignored.\n')
    expect(terms.get('flattening')).toBe('First paragraph.')
  })

  test('warns on heading with no body and skips the term', () => {
    const { terms, warnings } = parseGlossary('## empty term\n\n## real term\nHas a body.\n')
    expect(terms.has('empty term')).toBe(false)
    expect(warnings).toHaveLength(1)
    expect(warnings[0]).toContain('empty term')
  })

  test('lowercases term keys', () => {
    const { terms } = parseGlossary('## Cold Observable\nSome definition.\n')
    expect(terms.has('cold observable')).toBe(true)
  })

  test('collapses internal newlines in first paragraph to spaces', () => {
    const { terms } = parseGlossary('## cold observable\nFirst line\nsecond line.\n')
    expect(terms.get('cold observable')).toBe('First line second line.')
  })
})
```

- [ ] **Step 2: Run tests — expect all to fail**

```bash
npx vitest run --config vitest.config.mjs scripts/lib/parse-glossary.test.mjs
```

Expected: `Cannot find module './parse-glossary.mjs'`

- [ ] **Step 3: Implement `scripts/lib/parse-glossary.mjs`**

```javascript
/**
 * @param {string} content - Contents of glossary.md
 * @returns {{ terms: Map<string, string>, warnings: string[] }}
 */
export function parseGlossary(content) {
  const terms = new Map()
  const warnings = []
  const sections = content.split(/^## /m).slice(1)

  for (const section of sections) {
    const newlineIdx = section.indexOf('\n')
    const term = section.slice(0, newlineIdx).trim().toLowerCase()
    const body = section.slice(newlineIdx + 1).trim()

    if (!body) {
      warnings.push(`Glossary term "${term}" has no definition body — skipped`)
      continue
    }

    const firstParagraph = body.split(/\n\n/)[0].replace(/\n/g, ' ').trim()
    terms.set(term, firstParagraph)
  }

  return { terms, warnings }
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
npx vitest run --config vitest.config.mjs scripts/lib/parse-glossary.test.mjs
```

Expected: `6 tests passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/parse-glossary.mjs scripts/lib/parse-glossary.test.mjs
git commit -m "feat: add parse-glossary module with tests"
```

---

## Task 3: `scan-scripts.mjs` (TDD)

**Files:**
- Create: `scripts/lib/scan-scripts.mjs`
- Create: `scripts/lib/scan-scripts.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/scan-scripts.test.mjs`:

```javascript
import { describe, test, expect, afterEach } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { stripCodeFences, extractDefinitions, walkRepo } from './scan-scripts.mjs'

describe('stripCodeFences', () => {
  test('removes content inside code fences', () => {
    const content = 'before\n```\ncode here\n```\nafter'
    expect(stripCodeFences(content)).not.toContain('code here')
  })

  test('preserves line count so line numbers remain accurate', () => {
    const content = 'line1\n```\nline3\nline4\n```\nline6'
    const result = stripCodeFences(content)
    expect(result.split('\n').length).toBe(content.split('\n').length)
  })

  test('leaves content outside fences intact', () => {
    const content = 'before\n```\ncode\n```\nafter'
    const result = stripCodeFences(content)
    expect(result).toContain('before')
    expect(result).toContain('after')
  })
})

describe('extractDefinitions', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  function writeTemp(filename, content) {
    tmpDir = join(tmpdir(), 'scan-test-' + Date.now())
    mkdirSync(tmpDir, { recursive: true })
    const file = join(tmpDir, filename)
    writeFileSync(file, content)
    return file
  }

  test('extracts a definitional sentence containing a known term', () => {
    const file = writeTemp('lesson.md',
      'A cold observable is an observable that creates a new producer per subscriber.\n'
    )
    const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
    expect(results.some(r => r.term === 'cold observable')).toBe(true)
  })

  test('does not extract from inside code fences', () => {
    const file = writeTemp('lesson.md',
      '```\na cold observable is something inside a fence\n```\n'
    )
    const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
    expect(results).toHaveLength(0)
  })

  test('includes file path and line number in result', () => {
    const file = writeTemp('lesson.md',
      'intro\nA cold observable is an observable.\n'
    )
    const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
    expect(results[0].file).toBe(file)
    expect(results[0].line).toBe(2)
  })

  test('does not flag non-definitional use of a term', () => {
    const file = writeTemp('lesson.md',
      'Use switchMap when subscribing to a cold observable in sequence.\n'
    )
    const results = extractDefinitions(file, new Map([['cold observable', 'definition']]))
    expect(results).toHaveLength(0)
  })
})

describe('walkRepo', () => {
  let tmpDir

  afterEach(() => {
    if (tmpDir) rmSync(tmpDir, { recursive: true, force: true })
  })

  test('counts .md files and returns definitions and candidates', () => {
    tmpDir = join(tmpdir(), 'walk-test-' + Date.now())
    mkdirSync(join(tmpDir, 'sub'), { recursive: true })
    writeFileSync(join(tmpDir, 'a.md'), 'A cold observable is a fresh producer per subscribe.\n')
    writeFileSync(join(tmpDir, 'sub', 'b.md'), 'Flattening refers to subscribing to inner observables.\n')
    writeFileSync(join(tmpDir, 'c.ts'), 'not a markdown file')

    const glossary = new Map([['cold observable', 'definition']])
    const { definitions, candidates, fileCount } = walkRepo(tmpDir, glossary)
    expect(fileCount).toBe(2)
    expect(definitions.some(d => d.term === 'cold observable')).toBe(true)
    // 'flattening' is not in the glossary — captured in candidates
    expect(candidates.some(c => c.term === 'flattening')).toBe(true)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run --config vitest.config.mjs scripts/lib/scan-scripts.test.mjs
```

Expected: `Cannot find module './scan-scripts.mjs'`

- [ ] **Step 3: Implement `scripts/lib/scan-scripts.mjs`**

```javascript
import { readFileSync, readdirSync, statSync } from 'fs'
import { join, extname } from 'path'

/**
 * Replaces code fence blocks with blank lines, preserving line count.
 * @param {string} content
 * @returns {string}
 */
export function stripCodeFences(content) {
  return content.replace(/```[\s\S]*?```/g, match =>
    '\n'.repeat((match.match(/\n/g) ?? []).length)
  )
}

const DEFINITIONAL_VERBS = ['refers to', 'can be defined as', 'means', 'is', 'are']

/**
 * Returns true if the line contains `term` followed immediately by a definitional verb.
 * @param {string} line
 * @param {string} term
 * @returns {boolean}
 */
function isDefinitionalLine(line, term) {
  const lower = line.toLowerCase()
  const termIdx = lower.indexOf(term.toLowerCase())
  if (termIdx === -1) return false
  const after = lower.slice(termIdx + term.length).trimStart()
  return DEFINITIONAL_VERBS.some(verb => after.startsWith(verb + ' ') || after.startsWith(verb + ','))
}

/**
 * Finds hits for every glossary term that appears in a definitional sentence.
 * @param {string} filePath
 * @param {Map<string, string>} glossary  term → canonical definition
 * @returns {{ term: string, sentence: string, line: number, file: string }[]}
 */
export function extractDefinitions(filePath, glossary) {
  const raw = readFileSync(filePath, 'utf8')
  const cleaned = stripCodeFences(raw)
  const lines = cleaned.split('\n')
  const results = []

  for (const [term] of glossary) {
    for (let i = 0; i < lines.length; i++) {
      if (isDefinitionalLine(lines[i], term)) {
        results.push({ term, sentence: lines[i].trim(), line: i + 1, file: filePath })
      }
    }
  }

  return results
}

// Distinctive verbs only (not "is") to reduce false positives when extracting unknown terms
const CANDIDATE_RE = /\b(?:an? |the )?([a-z][a-z -]{3,30}?)\s+(?:refers to|can be defined as|is defined as|means)\b/gi

/**
 * Extracts any term defined using a distinctive verb — used to find undocumented terms.
 * Uses only multi-word verbs to keep false-positive rate low.
 * @param {string} filePath
 * @returns {{ term: string, sentence: string, line: number, file: string }[]}
 */
export function extractCandidates(filePath) {
  const raw = readFileSync(filePath, 'utf8')
  const cleaned = stripCodeFences(raw)
  const lines = cleaned.split('\n')
  const results = []

  for (let i = 0; i < lines.length; i++) {
    CANDIDATE_RE.lastIndex = 0
    let m
    while ((m = CANDIDATE_RE.exec(lines[i])) !== null) {
      const term = m[1].trim().toLowerCase()
      if (term.split(/\s+/).length <= 4) {
        results.push({ term, sentence: lines[i].trim(), line: i + 1, file: filePath })
      }
    }
  }

  return results
}

/**
 * @param {string} dirPath
 * @param {Map<string, string>} glossary
 * @returns {{ definitions: object[], candidates: object[], fileCount: number }}
 */
export function walkRepo(dirPath, glossary) {
  const definitions = []
  const candidates = []
  let fileCount = 0

  function walk(dir) {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry)
      const stat = statSync(full)
      if (stat.isDirectory()) {
        walk(full)
      } else if (extname(full) === '.md') {
        fileCount++
        definitions.push(...extractDefinitions(full, glossary))
        candidates.push(...extractCandidates(full))
      }
    }
  }

  walk(dirPath)
  return { definitions, candidates, fileCount }
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
npx vitest run --config vitest.config.mjs scripts/lib/scan-scripts.test.mjs
```

Expected: `8 tests passed`

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/scan-scripts.mjs scripts/lib/scan-scripts.test.mjs
git commit -m "feat: add scan-scripts module with tests"
```

---

## Task 4: `compare.mjs` (TDD)

**Files:**
- Create: `scripts/lib/compare.mjs`
- Create: `scripts/lib/compare.test.mjs`

- [ ] **Step 1: Write failing tests**

Create `scripts/lib/compare.test.mjs`:

```javascript
import { describe, test, expect } from 'vitest'
import { tokenize, jaccardSimilarity, compare } from './compare.mjs'

describe('tokenize', () => {
  test('returns significant words as a Set', () => {
    const tokens = tokenize('cold observable is a stream')
    expect(tokens.has('cold')).toBe(true)
    expect(tokens.has('observable')).toBe(true)
    expect(tokens.has('stream')).toBe(true)
  })

  test('filters stop words', () => {
    const tokens = tokenize('cold observable is a stream')
    expect(tokens.has('is')).toBe(false)
    expect(tokens.has('a')).toBe(false)
  })

  test('strips markdown formatting characters', () => {
    const tokens = tokenize('**cold** `observable` is a stream')
    expect(tokens.has('cold')).toBe(true)
    expect(tokens.has('observable')).toBe(true)
  })

  test('lowercases all tokens', () => {
    const tokens = tokenize('Cold Observable')
    expect(tokens.has('cold')).toBe(true)
    expect(tokens.has('observable')).toBe(true)
  })
})

describe('jaccardSimilarity', () => {
  test('identical strings score 1.0', () => {
    expect(jaccardSimilarity('cold observable', 'cold observable')).toBe(1)
  })

  test('completely disjoint strings score 0.0', () => {
    expect(jaccardSimilarity('cold observable', 'flattening operator')).toBe(0)
  })

  test('partial overlap scores between 0 and 1', () => {
    const score = jaccardSimilarity('cold observable producer', 'cold observable subscriber')
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThan(1)
  })
})

describe('compare', () => {
  test('flags contradiction when similarity below threshold', () => {
    const { isContradiction } = compare(
      'a cold observable runs continuously and never resets',
      'An Observable whose producer is created fresh on each subscribe call — nothing runs until a subscriber attaches',
      0.3
    )
    expect(isContradiction).toBe(true)
  })

  test('does not flag when sentence matches canonical closely', () => {
    const canonical = 'An Observable whose producer is created fresh on each subscribe call'
    const { isContradiction } = compare(canonical, canonical, 0.3)
    expect(isContradiction).toBe(false)
  })

  test('returns numeric similarity score', () => {
    const { similarity } = compare('cold observable subscribe producer', 'cold observable subscribe producer', 0.3)
    expect(similarity).toBe(1)
  })

  test('respects custom threshold', () => {
    const sentence = 'cold observable producer subscribe'
    const canonical = 'cold observable producer'
    const { isContradiction: high } = compare(sentence, canonical, 0.9)
    const { isContradiction: low } = compare(sentence, canonical, 0.1)
    expect(high).toBe(true)
    expect(low).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run --config vitest.config.mjs scripts/lib/compare.test.mjs
```

Expected: `Cannot find module './compare.mjs'`

- [ ] **Step 3: Implement `scripts/lib/compare.mjs`**

```javascript
const STOP_WORDS = new Set([
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'shall', 'can', 'that', 'this', 'these',
  'those', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
  'as', 'into', 'through', 'and', 'or', 'but', 'not', 'which', 'where',
  'when', 'it', 'its', 'i', 'you', 'we', 'they', 'he', 'she', 'our',
  'their', 'your', 'means', 'refers'
])

/**
 * @param {string} text
 * @returns {Set<string>}
 */
export function tokenize(text) {
  return new Set(
    text.toLowerCase()
      .replace(/[`*_#[\]()]/g, '')
      .split(/\W+/)
      .filter(w => w.length > 2 && !STOP_WORDS.has(w))
  )
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} 0–1 Jaccard similarity
 */
export function jaccardSimilarity(a, b) {
  const setA = tokenize(a)
  const setB = tokenize(b)
  if (setA.size === 0 && setB.size === 0) return 1
  const intersection = [...setA].filter(x => setB.has(x))
  const union = new Set([...setA, ...setB])
  return intersection.length / union.size
}

/**
 * @param {string} sentence  - definitional sentence found in a script
 * @param {string} canonical - glossary definition
 * @param {number} threshold - below this similarity score → contradiction (default 0.3)
 * @returns {{ similarity: number, isContradiction: boolean }}
 */
export function compare(sentence, canonical, threshold = 0.3) {
  const similarity = jaccardSimilarity(sentence, canonical)
  return { similarity, isContradiction: similarity < threshold }
}
```

- [ ] **Step 4: Run all tests so far**

```bash
npx vitest run --config vitest.config.mjs
```

Expected: all tests in `parse-glossary`, `scan-scripts`, `compare` pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/lib/compare.mjs scripts/lib/compare.test.mjs
git commit -m "feat: add compare module with Jaccard similarity tests"
```

---

## Task 5: `report.mjs`

**Files:**
- Create: `scripts/lib/report.mjs`

No unit tests — output is visual; verified by running the CLI in Task 7.

- [ ] **Step 1: Create `scripts/lib/report.mjs`**

```javascript
/**
 * @typedef {{
 *   type: 'contradiction' | 'undocumented' | 'llm',
 *   term: string,
 *   file: string,
 *   line?: number,
 *   line_hint?: number,
 *   sentence?: string,
 *   canonical?: string,
 *   similarity?: number,
 *   issue?: string,
 *   canonical_definition?: string,
 *   severity?: string
 * }} Finding
 */

/**
 * @param {Finding[]} findings
 * @param {{ repos: number, files: number, durationMs: number }} stats
 * @returns {string}
 */
export function formatTerminal(findings, stats) {
  if (findings.length === 0) {
    return `✓ No terminology findings — ${stats.repos} repos, ${stats.files} files scanned in ${stats.durationMs}ms`
  }

  const lines = [
    `TERMINOLOGY FINDINGS — ${stats.repos} repos, ${stats.files} files scanned\n`
  ]

  for (const f of findings) {
    if (f.type === 'contradiction') {
      lines.push(`[CONTRADICTION] ${f.file}:${f.line}`)
      lines.push(`  Term:      ${f.term}`)
      lines.push(`  Found:     "${f.sentence}"`)
      lines.push(`  Canonical: "${f.canonical}"`)
      lines.push(`  Similarity: ${((f.similarity ?? 0) * 100).toFixed(0)}%`)
    } else if (f.type === 'undocumented') {
      lines.push(`[UNDOCUMENTED] ${f.file}:${f.line}`)
      lines.push(`  Term:  "${f.term}"`)
      lines.push(`  Found: "${f.sentence}"`)
      lines.push(`  → Not in glossary. Run --add-candidates to append stub.`)
    } else if (f.type === 'llm') {
      const lineRef = f.line_hint ?? '?'
      const severity = (f.severity ?? 'issue').toUpperCase()
      lines.push(`[LLM:${severity}] ${f.file}:${lineRef}`)
      lines.push(`  Term:      ${f.term}`)
      lines.push(`  Issue:     ${f.issue}`)
      lines.push(`  Canonical: "${f.canonical_definition}"`)
    }
    lines.push('')
  }

  lines.push(`${findings.length} finding${findings.length === 1 ? '' : 's'}`)
  return lines.join('\n')
}

/**
 * @param {Finding[]} findings
 * @param {{ repos: number, files: number, durationMs: number }} stats
 * @returns {string}
 */
export function formatJson(findings, stats) {
  return JSON.stringify({ stats, findings }, null, 2)
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/lib/report.mjs
git commit -m "feat: add report module"
```

---

## Task 6: `llm-check.mjs`

**Files:**
- Create: `scripts/lib/llm-check.mjs`

No unit test — this is an integration boundary wrapping the Anthropic SDK.

- [ ] **Step 1: Create `scripts/lib/llm-check.mjs`**

```javascript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

/**
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Map<string, string>} glossary
 * @returns {string}
 */
function buildPrompt(filePath, fileContent, glossary) {
  const glossaryText = [...glossary.entries()]
    .map(([term, def]) => `**${term}**: ${def}`)
    .join('\n')

  return `You are a course quality checker. Review the following lesson script for terminology inconsistencies against the canonical glossary.

CANONICAL GLOSSARY:
${glossaryText}

LESSON SCRIPT (${filePath}):
${fileContent}

Return ONLY a JSON array. Each element must be:
{ "term": string, "file": "${filePath}", "line_hint": number|null, "issue": string, "canonical_definition": string, "severity": "contradiction"|"ambiguous" }

Return [] if no issues found. Output raw JSON only — no markdown fences, no explanation.`
}

/**
 * @param {string} prompt
 * @returns {Promise<import('@anthropic-ai/sdk').Message>}
 */
async function callApi(prompt) {
  return client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })
}

/**
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Map<string, string>} glossary
 * @returns {Promise<object[]>}
 */
export async function llmCheck(filePath, fileContent, glossary) {
  const prompt = buildPrompt(filePath, fileContent, glossary)

  let message
  try {
    message = await callApi(prompt)
  } catch {
    try {
      message = await callApi(prompt)
    } catch (err) {
      console.warn(`Warning: LLM check failed for ${filePath} (${err.message}) — falling back to Tier 1 only`)
      return []
    }
  }

  const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '[]'
  try {
    const findings = JSON.parse(text)
    return Array.isArray(findings) ? findings.map(f => ({ ...f, type: 'llm' })) : []
  } catch {
    return []
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/lib/llm-check.mjs
git commit -m "feat: add llm-check module (Tier 2 Claude Haiku wrapper)"
```

---

## Task 7: `check-terminology.mjs` CLI entry point

**Files:**
- Create: `scripts/check-terminology.mjs`

- [ ] **Step 1: Create `scripts/check-terminology.mjs`**

```javascript
#!/usr/bin/env node
import { readFileSync, existsSync, appendFileSync } from 'fs'
import { join, resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'
import { parseGlossary } from './lib/parse-glossary.mjs'
import { walkRepo } from './lib/scan-scripts.mjs'
import { compare } from './lib/compare.mjs'
import { formatTerminal, formatJson } from './lib/report.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WORKSPACE = resolve(__dirname, '..')

const REPOS = {
  'rxjs-insights': join(WORKSPACE, 'rxjs-insights', 'scripts'),
  'rxjs-deep-dive-claude-superpowers': join(WORKSPACE, 'rxjs-deep-dive-claude-superpowers', 'docs', 'recording-notes'),
  'rxjs-what-is-it-meta': join(WORKSPACE, 'rxjs-what-is-it-meta', 'scripts'),
}

function parseArgs(argv) {
  const args = argv.slice(2)
  const idx = name => args.indexOf(name)
  return {
    deep: args.includes('--deep'),
    jsonFormat: args.includes('--format') && args[idx('--format') + 1] === 'json',
    addCandidates: args.includes('--add-candidates'),
    repo: args.includes('--repo') ? args[idx('--repo') + 1] : null,
    threshold: args.includes('--threshold') ? parseFloat(args[idx('--threshold') + 1]) : 0.3,
  }
}

async function main() {
  const opts = parseArgs(process.argv)

  const glossaryPath = join(WORKSPACE, 'glossary.md')
  if (!existsSync(glossaryPath)) {
    console.error('Error: glossary.md not found at rxjs/ root — create it before running')
    process.exit(1)
  }

  const { terms: glossary, warnings } = parseGlossary(readFileSync(glossaryPath, 'utf8'))
  for (const w of warnings) console.warn(`Warning: ${w}`)

  let repos = REPOS
  if (opts.repo) {
    if (!REPOS[opts.repo]) {
      console.error(`Error: unknown repo "${opts.repo}". Valid: ${Object.keys(REPOS).join(', ')}`)
      process.exit(1)
    }
    repos = { [opts.repo]: REPOS[opts.repo] }
  }

  const start = Date.now()
  const allFindings = []
  let totalFiles = 0

  // Tier 1: lexical pass
  for (const [name, absPath] of Object.entries(repos)) {
    if (!existsSync(absPath)) {
      console.warn(`Warning: repo path not found: ${absPath} — skipping ${name}`)
      continue
    }
    const { definitions, candidates, fileCount } = walkRepo(absPath, glossary)
    totalFiles += fileCount

    for (const hit of definitions) {
      const canonical = glossary.get(hit.term)
      const { similarity, isContradiction } = compare(hit.sentence, canonical, opts.threshold)
      if (isContradiction) {
        allFindings.push({ type: 'contradiction', ...hit, canonical, similarity })
      }
    }

    for (const hit of candidates) {
      if (!glossary.has(hit.term)) {
        allFindings.push({ type: 'undocumented', ...hit })
      }
    }
  }

  // Tier 2: LLM pass (--deep, changed files only)
  if (opts.deep) {
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('Error: ANTHROPIC_API_KEY environment variable is required for --deep')
      process.exit(1)
    }

    const { llmCheck } = await import('./lib/llm-check.mjs')

    let changedFiles = []
    try {
      changedFiles = execSync('git diff --name-only main', { cwd: WORKSPACE, encoding: 'utf8' })
        .split('\n')
        .filter(f => f.trim().endsWith('.md'))
    } catch {
      console.warn('Warning: could not determine changed files (no base branch) — skipping LLM pass')
    }

    for (const relFile of changedFiles) {
      const abs = join(WORKSPACE, relFile)
      if (!existsSync(abs)) continue
      const content = readFileSync(abs, 'utf8')
      const findings = await llmCheck(relFile, content, glossary)
      allFindings.push(...findings)
    }
  }

  // --add-candidates: append undocumented terms as stubs
  if (opts.addCandidates) {
    const undocumented = allFindings.filter(f => f.type === 'undocumented')
    const newTerms = [...new Set(undocumented.map(f => f.term))].filter(t => !glossary.has(t))
    if (newTerms.length > 0) {
      const stubs = newTerms.map(t => `\n## ${t}\nTODO: add canonical definition.\n`).join('')
      appendFileSync(glossaryPath, stubs)
      console.log(`Added ${newTerms.length} candidate stub(s) to glossary.md`)
    }
  }

  const stats = {
    repos: Object.keys(repos).length,
    files: totalFiles,
    durationMs: Date.now() - start,
  }

  const output = opts.jsonFormat
    ? formatJson(allFindings, stats)
    : formatTerminal(allFindings, stats)

  console.log(output)
  process.exit(allFindings.length > 0 ? 1 : 0)
}

main().catch(err => {
  console.error(err.message)
  process.exit(1)
})
```

- [ ] **Step 2: Commit**

```bash
git add scripts/check-terminology.mjs
git commit -m "feat: add check-terminology CLI entry point"
```

---

## Task 8: Seed `glossary.md`

**Files:**
- Create: `glossary.md`

- [ ] **Step 1: Create `glossary.md` with 10 seed terms**

```markdown
# RxJS Course Glossary

Canonical term definitions for the RxJS course quality checker.
Each `## heading` is a term key (lowercase). Only the first paragraph is used for comparison.

---

## cold observable
An Observable whose producer function is invoked fresh for each new subscriber — nothing executes until `subscribe()` is called, and each subscriber gets its own independent execution.

## hot observable
An Observable whose producer exists independently of any subscriber — values are emitted regardless of whether anyone is subscribed, and late subscribers miss earlier emissions. DOM event streams and Subjects are hot.

## subscription
The object returned by `observable.subscribe()` that represents an active execution of the observable. Calling `unsubscribe()` on it cancels the execution and releases resources.

## operator
A pure function of the form `(source: Observable<T>) => Observable<R>` that transforms, filters, or combines observables without modifying the source. Operators are composed inside `pipe()`.

## flattening
The process by which a higher-order observable — one that emits inner observables — subscribes to those inner observables and merges their emissions into a single output stream. The four flattening strategies differ in how they manage concurrent inner subscriptions.

## subject
A special type of observable that is also an observer, allowing values to be pushed into it imperatively via `next()`. Subjects are hot and multicast — they share a single execution among all subscribers.

## scheduler
An object that controls when and on which execution context (microtask, macrotask, animation frame) observable notifications are delivered. Used via `observeOn()` and `subscribeOn()` to change timing without altering stream logic.

## marble diagram
A textual or graphical notation for depicting the timing of observable emissions over a virtual timeline. Hyphens represent time passing, letters represent emitted values, `|` represents completion, and `#` represents an error.

## backpressure
The condition where a producer emits values faster than a consumer can process them. RxJS handles backpressure through operators that drop (`throttleTime`, `debounceTime`), queue (`concatMap`), or cancel and restart (`switchMap`) inner work.

## multicasting
The act of sharing a single observable execution among multiple subscribers, so the producer runs only once regardless of subscriber count. Achieved via `Subject`, `shareReplay`, `share`, or `publish` + `connect`.
```

- [ ] **Step 2: Smoke-test the CLI against the seeded glossary**

```bash
cd C:/Users/HP/Web/Frontend/rxjs
node scripts/check-terminology.mjs --repo rxjs-insights
```

Expected: terminal output listing findings (contradictions or undocumented terms), or `✓ No terminology findings` if the threshold is too low. Adjust `--threshold` if needed.

- [ ] **Step 3: Commit**

```bash
git add glossary.md
git commit -m "docs: seed glossary.md with 10 canonical RxJS term definitions"
```

---

## Task 9: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/course-quality.yml`

> **Note:** This workflow assumes all three course repos are checked out as siblings in the same GitHub Actions workspace. If the repos are not on GitHub yet, the checkout steps for the sibling repos should be removed and the paths configured to match wherever the repos are available in CI.

- [ ] **Step 1: Create `.github/workflows/course-quality.yml`**

```yaml
name: Course Terminology Quality

on:
  push:
    branches: ['**']
  pull_request:
    branches: ['**']

jobs:
  terminology-check:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout rxjs workspace
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Checkout rxjs-insights
        uses: actions/checkout@v4
        with:
          repository: ${{ github.repository_owner }}/rxjs-insights
          path: rxjs-insights
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Checkout rxjs-deep-dive-claude-superpowers
        uses: actions/checkout@v4
        with:
          repository: ${{ github.repository_owner }}/rxjs-deep-dive-claude-superpowers
          path: rxjs-deep-dive-claude-superpowers
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Checkout rxjs-what-is-it-meta
        uses: actions/checkout@v4
        with:
          repository: ${{ github.repository_owner }}/rxjs-what-is-it-meta
          path: rxjs-what-is-it-meta
          token: ${{ secrets.GITHUB_TOKEN }}

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run terminology check
        id: check
        run: node scripts/check-terminology.mjs --format json > /tmp/findings.json; echo "exit_code=$?" >> "$GITHUB_OUTPUT"

      - name: Write to job summary
        if: always()
        run: |
          echo "## Terminology Check Results" >> "$GITHUB_STEP_SUMMARY"
          node -e "
            const fs = require('fs');
            const { stats, findings } = JSON.parse(fs.readFileSync('/tmp/findings.json', 'utf8'));
            const lines = [\`**Repos:** \${stats.repos} | **Files:** \${stats.files} | **Duration:** \${stats.durationMs}ms\`];
            if (findings.length === 0) {
              lines.push('', '✅ No terminology findings.');
            } else {
              lines.push('', \`⚠️ \${findings.length} finding(s)\`, '');
              findings.forEach(f => {
                const loc = f.line || f.line_hint || '?';
                lines.push(\`- [\${f.type.toUpperCase()}] \\\`\${f.file}:\${loc}\\\` — **\${f.term}**\`);
              });
            }
            fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n');
          "

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        run: |
          BODY=$(node -e "
            const fs = require('fs');
            const { stats, findings } = JSON.parse(fs.readFileSync('/tmp/findings.json', 'utf8'));
            const lines = ['## Course Terminology Check', ''];
            if (findings.length === 0) {
              lines.push('✅ No terminology findings — ' + stats.files + ' files scanned.');
            } else {
              lines.push('⚠️ ' + findings.length + ' finding(s) — ' + stats.files + ' files scanned.', '');
              findings.slice(0, 20).forEach(f => {
                const loc = f.line || f.line_hint || '?';
                lines.push('- \`' + f.file + ':' + loc + '\` — **' + f.term + '**: ' + (f.issue || 'contradicts glossary'));
              });
              if (findings.length > 20) lines.push('', '…and ' + (findings.length - 20) + ' more. See job summary for full list.');
            }
            process.stdout.write(lines.join('\n'));
          ")
          gh pr comment --edit-last --body "$BODY" 2>/dev/null || gh pr comment --body "$BODY"
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Fail if findings exist
        if: steps.check.outputs.exit_code != '0'
        run: |
          echo "Terminology findings detected. Review the job summary."
          exit 1
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/course-quality.yml
git commit -m "ci: add course terminology quality GitHub Actions workflow"
```

---

## Task 10: Full integration smoke test

- [ ] **Step 1: Run full Tier 1 check across all three repos**

```bash
cd C:/Users/HP/Web/Frontend/rxjs
node scripts/check-terminology.mjs
```

Expected: output listing any findings with file paths and line numbers, or a clean `✓ No terminology findings` message.

- [ ] **Step 2: Run with JSON output and verify structure**

```bash
node scripts/check-terminology.mjs --format json | node -e "
  const d = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  console.log('repos:', d.stats.repos, '| files:', d.stats.files, '| findings:', d.findings.length);
"
```

Expected: `repos: 3 | files: <N> | findings: <N>`

- [ ] **Step 3: Run the Vitest suite**

```bash
npm run test:terminology
```

Expected: all tests pass.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete course terminology quality agent"
```
