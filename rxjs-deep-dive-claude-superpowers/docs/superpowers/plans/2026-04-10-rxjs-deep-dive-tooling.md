# RxJS Deep Dive — Course Production Tooling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the course production tooling for the RxJS Deep Dive Udemy course — project scaffold, curriculum manifest (52 lessons), slide generator, readiness dashboard, PDF exporter, and recording-notes scaffolder.

**Architecture:** A TypeScript scripts project in `rxjs-deep-dive-claude-superpowers/`. `curriculum.json` is the single source of truth for all lessons. Scripts read it to generate Marp slide drafts (via Anthropic SDK), report readiness by inspecting the filesystem, export PDFs via marp-cli, and scaffold per-lesson recording notes. Slide status is derived from the filesystem (no mutable fields in `curriculum.json`).

**Tech Stack:** TypeScript 5.x, tsx (script runner), Vitest (testing), @anthropic-ai/sdk (slide generation), @marp-team/marp-cli (PDF export), Node.js built-in `child_process` (process spawning)

---

## File Map

All paths are relative to `rxjs-deep-dive-claude-superpowers/`.

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `package.json` | Dependencies, npm scripts |
| Create | `tsconfig.json` | TypeScript compiler config |
| Create | `vitest.config.ts` | Test runner config |
| Create | `curriculum.json` | All 52 lessons — static metadata only |
| Create | `scripts/lib/config.ts` | Resolved absolute paths to wiki, spa, slides-polished |
| Create | `scripts/lib/curriculum.ts` | `Lesson` / `Section` types + `loadCurriculum()` |
| Create | `scripts/lib/curriculum.test.ts` | Unit tests for loader + slug derivation |
| Create | `scripts/check-readiness.ts` | Print dashboard: missing / draft / polished per lesson |
| Create | `scripts/check-readiness.test.ts` | Unit tests for status derivation |
| Create | `scripts/generate-slides.ts` | Generate Marp draft per lesson via Anthropic SDK |
| Create | `scripts/export-pdf.ts` | Run marp-cli on every polished slide deck |
| Create | `scripts/generate-recording-notes.ts` | Scaffold per-lesson `.md` stubs in `docs/recording-notes/` |
| Create | `slides-polished/.gitkeep` | Track empty directory in git |
| Create | `docs/recording-notes/template.md` | Master template for recording note stubs |

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `slides-polished/.gitkeep`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "rxjs-deep-dive-course",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "check": "tsx scripts/check-readiness.ts",
    "generate": "tsx scripts/generate-slides.ts",
    "export-pdf": "tsx scripts/export-pdf.ts",
    "notes": "tsx scripts/generate-recording-notes.ts",
    "tags": "tsx scripts/tag-sections.ts",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@types/node": "^22.10.2",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3",
    "vitest": "^2.1.9"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.36.3",
    "@marp-team/marp-cli": "^4.4.1"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["scripts/**/*", "*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create `vitest.config.ts`**

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['scripts/**/*.test.ts'],
		environment: 'node',
	},
});
```

- [ ] **Step 4: Create `slides-polished/.gitkeep`**

Create an empty file at `slides-polished/.gitkeep`.

- [ ] **Step 5: Install dependencies**

Run from `rxjs-deep-dive-claude-superpowers/`:
```bash
npm install
```

Expected: `node_modules/` created, no errors.

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: No output (no errors). If you get "no input files" that's fine at this stage — the scripts don't exist yet.

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts slides-polished/.gitkeep package-lock.json
git commit -m "feat: scaffold course tooling project — package.json, tsconfig, vitest"
```

---

## Task 2: Create `curriculum.json`

**Files:**
- Create: `curriculum.json`

- [ ] **Step 1: Create `curriculum.json` with all 52 lessons**

```json
{
  "sections": [
    {
      "id": 0,
      "title": "RxJS Conceptual and Historical Roots",
      "tagline": "Where did this come from and why does it look the way it does?",
      "lessons": [
        {
          "id": "0.1",
          "title": "Haskell list comprehensions and lazy sequences",
          "wikiSources": ["core/frp-concepts.md"],
          "companionPath": null
        },
        {
          "id": "0.2",
          "title": "LINQ and the IEnumerable abstraction",
          "wikiSources": ["core/linq-monad.md"],
          "companionPath": null
        },
        {
          "id": "0.3",
          "title": "Erik Meijer and the IEnumerable/IObservable dual",
          "wikiSources": ["history/erik-meijer.md"],
          "companionPath": null
        },
        {
          "id": "0.4",
          "title": "Rx.NET to RxJS: the port and what changed",
          "wikiSources": ["history/roots.md", "history/timeline.md"],
          "companionPath": null
        },
        {
          "id": "0.5",
          "title": "The monad connection: flatMap as the universal combinator",
          "wikiSources": ["core/linq-monad.md"],
          "companionPath": null
        }
      ]
    },
    {
      "id": 1,
      "title": "Foundations Revisited",
      "tagline": "The mental model intermediate devs are missing",
      "lessons": [
        {
          "id": "1.1",
          "title": "Observable internals: what actually happens on subscribe",
          "wikiSources": ["core/observable-internals.md"],
          "companionPath": "apps/starter-minimal"
        },
        {
          "id": "1.2",
          "title": "The eight execution phases",
          "wikiSources": ["core/execution-phases.md"],
          "companionPath": "apps/starter-minimal"
        },
        {
          "id": "1.3",
          "title": "Hot vs Cold: precise definition, not intuition",
          "wikiSources": ["core/hot-cold.md"],
          "companionPath": "apps/starter-standard"
        },
        {
          "id": "1.4",
          "title": "The operator policy framework (8 axes)",
          "wikiSources": ["core/operator-policies.md"],
          "companionPath": null
        },
        {
          "id": "1.5",
          "title": "Marble diagrams as a first-class tool",
          "wikiSources": ["core/operators.md"],
          "companionPath": "packages/testing"
        }
      ]
    },
    {
      "id": 2,
      "title": "Async Coordination",
      "tagline": "switchMap vs mergeMap vs concatMap vs exhaustMap — once and for all",
      "lessons": [
        {
          "id": "2.1",
          "title": "Higher-order operators: what flattening means",
          "wikiSources": ["core/higher-order-operators.md"],
          "companionPath": "packages/http"
        },
        {
          "id": "2.2",
          "title": "switchMap: live queries, search, cancellation",
          "wikiSources": ["core/higher-order-operators.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "2.3",
          "title": "concatMap: ordered queues, animations",
          "wikiSources": ["core/higher-order-operators.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "2.4",
          "title": "exhaustMap: form submit, login, debounced actions",
          "wikiSources": ["core/higher-order-operators.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "2.5",
          "title": "mergeMap: when order truly does not matter",
          "wikiSources": ["core/higher-order-operators.md"],
          "companionPath": "apps/playground"
        },
        {
          "id": "2.6",
          "title": "Decision guide: choosing the right flattening operator",
          "wikiSources": ["core/higher-order-operators.md"],
          "companionPath": null
        }
      ]
    },
    {
      "id": 3,
      "title": "State Without a Framework",
      "tagline": "BehaviorSubject + scan is your state machine",
      "lessons": [
        {
          "id": "3.1",
          "title": "BehaviorSubject as a state container",
          "wikiSources": ["core/BehaviorSubject.md"],
          "companionPath": "packages/store"
        },
        {
          "id": "3.2",
          "title": "scan + reducer = MVU in 10 lines",
          "wikiSources": ["core/subjects-guide.md"],
          "companionPath": "packages/store"
        },
        {
          "id": "3.3",
          "title": "ReplaySubject and AsyncSubject: when BehaviorSubject is not right",
          "wikiSources": ["core/ReplaySubject.md", "core/AsyncSubject.md"],
          "companionPath": null
        },
        {
          "id": "3.4",
          "title": "shareReplay: caching, multicasting, the refCount trap",
          "wikiSources": ["core/share-replay.md"],
          "companionPath": "packages/store"
        },
        {
          "id": "3.5",
          "title": "Persisted state with localStorage",
          "wikiSources": ["patterns/state-management.md"],
          "companionPath": "packages/persist"
        }
      ]
    },
    {
      "id": 4,
      "title": "Stream Composition",
      "tagline": "Combining multiple sources without losing your mind",
      "lessons": [
        {
          "id": "4.1",
          "title": "combineLatest: formal rules, the EMPTY trap",
          "wikiSources": ["core/combine-latest.md"],
          "companionPath": "packages/dom"
        },
        {
          "id": "4.2",
          "title": "withLatestFrom: sampling vs combining",
          "wikiSources": ["core/combination-operators.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "4.3",
          "title": "merge, concat, race, zip: when to use each",
          "wikiSources": ["core/combination-operators.md"],
          "companionPath": "apps/playground"
        },
        {
          "id": "4.4",
          "title": "RxJS as a dataflow graph",
          "wikiSources": ["core/dataflow-model.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "4.5",
          "title": "Stream machines: the 6 irreducible building blocks",
          "wikiSources": ["core/stream-machines.md"],
          "companionPath": null
        }
      ]
    },
    {
      "id": 5,
      "title": "Error Resilience",
      "tagline": "Streams that do not die in production",
      "lessons": [
        {
          "id": "5.1",
          "title": "catchError: recover vs rethrow",
          "wikiSources": ["patterns/error-handling.md"],
          "companionPath": "packages/errors"
        },
        {
          "id": "5.2",
          "title": "retry, retryWhen, and exponential backoff",
          "wikiSources": ["patterns/error-handling.md"],
          "companionPath": "packages/http"
        },
        {
          "id": "5.3",
          "title": "timeout and race-based fallbacks",
          "wikiSources": ["patterns/error-handling.md"],
          "companionPath": "packages/http"
        },
        {
          "id": "5.4",
          "title": "Global error capture and centralized reporting",
          "wikiSources": ["patterns/error-handling.md"],
          "companionPath": "packages/errors"
        }
      ]
    },
    {
      "id": 6,
      "title": "Custom Operators and Pipeline Composition",
      "tagline": "Writing operators that read like sentences",
      "lessons": [
        {
          "id": "6.1",
          "title": "pipe() as Kleisli composition",
          "wikiSources": ["core/custom-operators.md"],
          "companionPath": "packages/core"
        },
        {
          "id": "6.2",
          "title": "Parametric operator factories",
          "wikiSources": ["core/custom-operators.md"],
          "companionPath": "packages/core"
        },
        {
          "id": "6.3",
          "title": "Domain operators: giving operators business names",
          "wikiSources": ["patterns/domain-operators.md"],
          "companionPath": "packages/dom"
        },
        {
          "id": "6.4",
          "title": "Low-level: building operators with the Observable constructor",
          "wikiSources": ["core/custom-operators.md"],
          "companionPath": "packages/core"
        }
      ]
    },
    {
      "id": 7,
      "title": "Multicasting and Hot Streams",
      "tagline": "Subjects are not bad — you are just using them wrong",
      "lessons": [
        {
          "id": "7.1",
          "title": "Subject variants compared: the choosing guide",
          "wikiSources": ["core/subjects-guide.md"],
          "companionPath": null
        },
        {
          "id": "7.2",
          "title": "Cold-to-hot conversion: publish, share, multicast",
          "wikiSources": ["core/hot-cold.md"],
          "companionPath": "packages/router"
        },
        {
          "id": "7.3",
          "title": "The router as a shared hot stream",
          "wikiSources": ["core/hot-cold.md"],
          "companionPath": "packages/router"
        },
        {
          "id": "7.4",
          "title": "Subject as action bus: the effects pattern",
          "wikiSources": ["patterns/effects.md"],
          "companionPath": "apps/shop"
        }
      ]
    },
    {
      "id": 8,
      "title": "Architecture Patterns",
      "tagline": "How RxJS organises a whole application",
      "lessons": [
        {
          "id": "8.1",
          "title": "MVU (Model-View-Update) in pure RxJS",
          "wikiSources": ["architectures/mvu.md", "patterns/mvu.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "8.2",
          "title": "Event-driven architecture with action streams",
          "wikiSources": ["architectures/event-driven.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "8.3",
          "title": "Redux-Observable style effects",
          "wikiSources": ["architectures/redux-observable.md", "patterns/effects.md"],
          "companionPath": "apps/shop"
        },
        {
          "id": "8.4",
          "title": "XState vs RxJS: when to reach for a state machine",
          "wikiSources": ["architectures/xstate-vs-rxjs.md"],
          "companionPath": null
        },
        {
          "id": "8.5",
          "title": "The full shop walkthrough: all patterns assembled",
          "wikiSources": [],
          "companionPath": "apps/shop"
        }
      ]
    },
    {
      "id": 9,
      "title": "Testing Reactive Code",
      "tagline": "Tests that actually catch bugs",
      "lessons": [
        {
          "id": "9.1",
          "title": "TestScheduler and virtual time",
          "wikiSources": ["core/Scheduler.md"],
          "companionPath": "packages/testing"
        },
        {
          "id": "9.2",
          "title": "Marble syntax deep dive",
          "wikiSources": ["core/Scheduler.md"],
          "companionPath": "packages/testing"
        },
        {
          "id": "9.3",
          "title": "Testing operators in isolation",
          "wikiSources": [],
          "companionPath": "packages/core"
        },
        {
          "id": "9.4",
          "title": "Testing effects and async state",
          "wikiSources": [],
          "companionPath": "packages/store"
        }
      ]
    },
    {
      "id": 10,
      "title": "Production Patterns",
      "tagline": "What nobody tells you until you are in production",
      "lessons": [
        {
          "id": "10.1",
          "title": "Memory leaks: takeUntil, take(1), async pipe equivalents",
          "wikiSources": ["core/Subscription.md"],
          "companionPath": "apps/demo"
        },
        {
          "id": "10.2",
          "title": "Debugging streams: tap, debug operators, DevTools",
          "wikiSources": [],
          "companionPath": "apps/playground"
        },
        {
          "id": "10.3",
          "title": "Animations with animationFrameScheduler",
          "wikiSources": ["patterns/animations.md"],
          "companionPath": "apps/snake"
        },
        {
          "id": "10.4",
          "title": "SSR: Observable pipelines on the server",
          "wikiSources": [],
          "companionPath": "apps/demo"
        },
        {
          "id": "10.5",
          "title": "RxJS with React and Angular: bridging the gap",
          "wikiSources": [],
          "companionPath": "apps/demo"
        }
      ]
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add curriculum.json
git commit -m "feat: add curriculum.json — 52 lessons across 11 sections"
```

---

## Task 3: `lib/config.ts` and `lib/curriculum.ts` with Tests

**Files:**
- Create: `scripts/lib/config.ts`
- Create: `scripts/lib/curriculum.ts`
- Create: `scripts/lib/curriculum.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `scripts/lib/curriculum.test.ts`:

```typescript
import { describe, test, expect } from 'vitest';
import { loadCurriculum, lessonSlug, allLessons } from './curriculum.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CURRICULUM_PATH = path.resolve(__dirname, '../../curriculum.json');

describe('loadCurriculum', () => {
	test('loads and parses curriculum.json', () => {
		const curriculum = loadCurriculum(CURRICULUM_PATH);
		expect(curriculum.sections).toHaveLength(11);
		expect(curriculum.sections[0].id).toBe(0);
		expect(curriculum.sections[10].id).toBe(10);
	});

	test('all sections have at least one lesson', () => {
		const curriculum = loadCurriculum(CURRICULUM_PATH);
		for (const section of curriculum.sections) {
			expect(section.lessons.length).toBeGreaterThan(0);
		}
	});
});

describe('lessonSlug', () => {
	test('converts lesson id and title to a filesystem-safe slug', () => {
		expect(lessonSlug('2.2', 'switchMap: live queries, search, cancellation'))
			.toBe('02-02-switchmap-live-queries-search-cancellation');
	});

	test('handles section 10 with two-digit padding', () => {
		expect(lessonSlug('10.1', 'Memory leaks: takeUntil, take(1), async pipe equivalents'))
			.toBe('10-01-memory-leaks-takeuntil-take-1-async-pipe-equivalents');
	});
});

describe('allLessons', () => {
	test('flattens all lessons from all sections', () => {
		const curriculum = loadCurriculum(CURRICULUM_PATH);
		const lessons = allLessons(curriculum);
		expect(lessons).toHaveLength(52);
	});

	test('each lesson carries its section id', () => {
		const curriculum = loadCurriculum(CURRICULUM_PATH);
		const lessons = allLessons(curriculum);
		expect(lessons[0].sectionId).toBe(0);
		expect(lessons[5].sectionId).toBe(1);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run scripts/lib/curriculum.test.ts
```

Expected: FAIL — `Cannot find module './curriculum.js'`

- [ ] **Step 3: Create `scripts/lib/config.ts`**

```typescript
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');

export const WIKI_DIR = path.resolve(ROOT, '../rxjs-wiki');
export const SPA_DIR = path.resolve(ROOT, '../rxjs-spa');
export const SLIDES_DRAFT_DIR = path.join(WIKI_DIR, 'slides');
export const SLIDES_POLISHED_DIR = path.join(ROOT, 'slides-polished');
export const RECORDING_NOTES_DIR = path.join(ROOT, 'docs/recording-notes');
export const CURRICULUM_PATH = path.join(ROOT, 'curriculum.json');
```

- [ ] **Step 4: Create `scripts/lib/curriculum.ts`**

```typescript
import fs from 'node:fs';

export interface Lesson {
	id: string;
	title: string;
	wikiSources: string[];
	companionPath: string | null;
}

export interface LessonWithSection extends Lesson {
	sectionId: number;
	sectionTitle: string;
}

export interface Section {
	id: number;
	title: string;
	tagline: string;
	lessons: Lesson[];
}

export interface Curriculum {
	sections: Section[];
}

export function loadCurriculum(curriculumPath: string): Curriculum {
	const raw = fs.readFileSync(curriculumPath, 'utf-8');
	return JSON.parse(raw) as Curriculum;
}

export function lessonSlug(id: string, title: string): string {
	const [section, lesson] = id.split('.');
	const paddedSection = section.padStart(2, '0');
	const paddedLesson = lesson.padStart(2, '0');
	const slug = title
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, ' ')
		.trim()
		.replace(/\s+/g, '-');
	return `${paddedSection}-${paddedLesson}-${slug}`;
}

export function allLessons(curriculum: Curriculum): LessonWithSection[] {
	return curriculum.sections.flatMap(section =>
		section.lessons.map(lesson => ({
			...lesson,
			sectionId: section.id,
			sectionTitle: section.title,
		}))
	);
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx vitest run scripts/lib/curriculum.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 6: Commit**

```bash
git add scripts/lib/config.ts scripts/lib/curriculum.ts scripts/lib/curriculum.test.ts
git commit -m "feat: add curriculum loader, lessonSlug util, and allLessons helper"
```

---

## Task 4: `check-readiness.ts` with Tests

**Files:**
- Create: `scripts/check-readiness.ts`
- Create: `scripts/check-readiness.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `scripts/check-readiness.test.ts`:

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deriveStatus, buildReport, SlideStatus } from './check-readiness.js';

let tmpDir: string;

beforeEach(() => {
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rxjs-course-test-'));
	fs.mkdirSync(path.join(tmpDir, 'draft'));
	fs.mkdirSync(path.join(tmpDir, 'polished'));
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('deriveStatus', () => {
	test('returns missing when no file exists', () => {
		const status = deriveStatus(
			'01-01-some-lesson',
			path.join(tmpDir, 'draft'),
			path.join(tmpDir, 'polished')
		);
		expect(status).toBe('missing');
	});

	test('returns draft when only draft file exists', () => {
		fs.writeFileSync(path.join(tmpDir, 'draft', '01-01-some-lesson.md'), '# draft');
		const status = deriveStatus(
			'01-01-some-lesson',
			path.join(tmpDir, 'draft'),
			path.join(tmpDir, 'polished')
		);
		expect(status).toBe('draft');
	});

	test('returns polished when polished file exists (regardless of draft)', () => {
		fs.writeFileSync(path.join(tmpDir, 'polished', '01-01-some-lesson.md'), '# polished');
		const status = deriveStatus(
			'01-01-some-lesson',
			path.join(tmpDir, 'draft'),
			path.join(tmpDir, 'polished')
		);
		expect(status).toBe('polished');
	});
});

describe('buildReport', () => {
	test('returns one entry per lesson with correct status', () => {
		fs.writeFileSync(path.join(tmpDir, 'draft', '00-01-haskell.md'), '# draft');
		fs.writeFileSync(path.join(tmpDir, 'polished', '00-02-linq.md'), '# polished');

		const lessons = [
			{ id: '0.1', title: 'Haskell list comprehensions', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
			{ id: '0.2', title: 'LINQ and IEnumerable', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
			{ id: '0.3', title: 'Erik Meijer', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
		];

		const report = buildReport(lessons, path.join(tmpDir, 'draft'), path.join(tmpDir, 'polished'));
		expect(report[0].status).toBe('draft');
		expect(report[1].status).toBe('polished');
		expect(report[2].status).toBe('missing');
	});

	test('summary counts are correct', () => {
		fs.writeFileSync(path.join(tmpDir, 'polished', '00-01-haskell.md'), '');
		const lessons = [
			{ id: '0.1', title: 'Haskell list comprehensions', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
			{ id: '0.2', title: 'LINQ and IEnumerable', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
		];
		const report = buildReport(lessons, path.join(tmpDir, 'draft'), path.join(tmpDir, 'polished'));
		const polished = report.filter(r => r.status === 'polished').length;
		const missing = report.filter(r => r.status === 'missing').length;
		expect(polished).toBe(1);
		expect(missing).toBe(1);
	});
});
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run scripts/check-readiness.test.ts
```

Expected: FAIL — `Cannot find module './check-readiness.js'`

- [ ] **Step 3: Create `scripts/check-readiness.ts`**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { loadCurriculum, lessonSlug, allLessons, LessonWithSection } from './lib/curriculum.js';
import { CURRICULUM_PATH, SLIDES_DRAFT_DIR, SLIDES_POLISHED_DIR } from './lib/config.js';

export type SlideStatus = 'missing' | 'draft' | 'polished';

export interface ReportEntry {
	lesson: LessonWithSection;
	slug: string;
	status: SlideStatus;
}

export function deriveStatus(
	slug: string,
	draftDir: string,
	polishedDir: string
): SlideStatus {
	if (fs.existsSync(path.join(polishedDir, `${slug}.md`))) return 'polished';
	if (fs.existsSync(path.join(draftDir, `${slug}.md`))) return 'draft';
	return 'missing';
}

export function buildReport(
	lessons: LessonWithSection[],
	draftDir: string,
	polishedDir: string
): ReportEntry[] {
	return lessons.map(lesson => {
		const slug = lessonSlug(lesson.id, lesson.title);
		const status = deriveStatus(slug, draftDir, polishedDir);
		return { lesson, slug, status };
	});
}

function statusSymbol(status: SlideStatus): string {
	if (status === 'polished') return '✓';
	if (status === 'draft') return '○';
	return '✗';
}

function main(): void {
	const curriculum = loadCurriculum(CURRICULUM_PATH);
	const lessons = allLessons(curriculum);
	const report = buildReport(lessons, SLIDES_DRAFT_DIR, SLIDES_POLISHED_DIR);

	let currentSection = -1;
	for (const entry of report) {
		if (entry.lesson.sectionId !== currentSection) {
			currentSection = entry.lesson.sectionId;
			const section = curriculum.sections[currentSection];
			console.log(`\nSection ${section.id} — ${section.title}`);
		}
		const symbol = statusSymbol(entry.status);
		const pad = entry.lesson.id.padEnd(5);
		const title = entry.lesson.title.substring(0, 55).padEnd(55);
		console.log(`  ${pad}  ${title}  [${entry.status.padEnd(8)}]  ${symbol}`);
	}

	const polished = report.filter(r => r.status === 'polished').length;
	const draft = report.filter(r => r.status === 'draft').length;
	const missing = report.filter(r => r.status === 'missing').length;

	console.log(`\nSummary: ${polished} polished  ${draft} draft  ${missing} missing  /  ${report.length} total`);
}

main();
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run scripts/check-readiness.test.ts
```

Expected: All 4 tests pass.

- [ ] **Step 5: Run the script to verify live output**

```bash
npm run check
```

Expected: Dashboard printed with all 52 lessons showing `[missing]  ✗` (no slides exist yet).

- [ ] **Step 6: Commit**

```bash
git add scripts/check-readiness.ts scripts/check-readiness.test.ts
git commit -m "feat: add check-readiness script with dashboard output"
```

---

## Task 5: `generate-slides.ts`

**Files:**
- Create: `scripts/generate-slides.ts`

This script calls the Anthropic API to generate a Marp slide draft for a specified lesson (or all lessons). It reads the wiki source files for the lesson and instructs the model to produce a 6-slide deck following the course skeleton.

**Prerequisite:** `ANTHROPIC_API_KEY` must be set in the environment.

- [ ] **Step 1: Create `scripts/generate-slides.ts`**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import Anthropic from '@anthropic-ai/sdk';
import { loadCurriculum, lessonSlug, allLessons, LessonWithSection } from './lib/curriculum.js';
import { CURRICULUM_PATH, WIKI_DIR, SLIDES_DRAFT_DIR } from './lib/config.js';

const SLIDE_SYSTEM_PROMPT = `You are generating a Marp slide deck for an RxJS Deep Dive Udemy course.

Target audience: intermediate RxJS developers — they already know map, filter, and subscribe. They want depth: operator intuition, mental models, architecture.

Produce a Marp slide deck with EXACTLY this structure (6 slides minimum):

\`\`\`
---
marp: true
theme: uncover
title: "<lesson title>"
---

# <lesson title>
> <one-sentence problem statement: the pain point this lesson solves>

---

## Core Concept
<3–5 bullet points defining the concept precisely. Quote the most important rule verbatim.>

---

## How It Works
<ASCII marble diagram OR TypeScript code block showing the transformation. Label inputs and outputs.>

---

## Common Mistake
<TypeScript code block showing the wrong approach intermediate devs reach for, with a comment explaining why it fails.>

---

## The Right Way
<TypeScript code block showing the correct pattern. Use RxJS pipe() chains. Add comments on the key lines.>

---

## Key Rule
> **<One sentence. The rule the student must remember. Bold. No hedging.>**
\`\`\`

Output ONLY the Marp markdown. No prose before or after. No explanation. No triple-backtick wrapper around the entire output.`;

function readWikiSources(wikiSources: string[]): string {
	if (wikiSources.length === 0) return '(No wiki source — draw on general RxJS knowledge for this lesson.)';
	return wikiSources
		.map(src => {
			const filePath = path.join(WIKI_DIR, src);
			if (!fs.existsSync(filePath)) return `[Missing: ${src}]`;
			return `=== ${src} ===\n${fs.readFileSync(filePath, 'utf-8')}`;
		})
		.join('\n\n');
}

async function generateSlide(client: Anthropic, lesson: LessonWithSection): Promise<string> {
	const wikiContent = readWikiSources(lesson.wikiSources);
	const userPrompt = `Lesson ID: ${lesson.id}
Lesson title: ${lesson.title}
Section: ${lesson.sectionTitle}

Wiki source content:
${wikiContent}`;

	const message = await client.messages.create({
		model: 'claude-opus-4-6',
		max_tokens: 2048,
		system: SLIDE_SYSTEM_PROMPT,
		messages: [{ role: 'user', content: userPrompt }],
	});

	const block = message.content[0];
	if (block.type !== 'text') throw new Error(`Unexpected content block type: ${block.type}`);
	return block.text;
}

async function main(): Promise<void> {
	const lessonFilter = process.argv[2]; // optional: "2.2" to generate only one lesson

	const apiKey = process.env['ANTHROPIC_API_KEY'];
	if (!apiKey) throw new Error('ANTHROPIC_API_KEY environment variable is required');

	const client = new Anthropic({ apiKey });
	const curriculum = loadCurriculum(CURRICULUM_PATH);
	const lessons = allLessons(curriculum);

	const targets = lessonFilter
		? lessons.filter(l => l.id === lessonFilter)
		: lessons;

	if (targets.length === 0) {
		console.error(`No lesson found with id: ${lessonFilter}`);
		process.exit(1);
	}

	fs.mkdirSync(SLIDES_DRAFT_DIR, { recursive: true });

	for (const lesson of targets) {
		const slug = lessonSlug(lesson.id, lesson.title);
		const outPath = path.join(SLIDES_DRAFT_DIR, `${slug}.md`);

		if (fs.existsSync(outPath)) {
			console.log(`skip  ${lesson.id}  (draft exists: ${slug}.md)`);
			continue;
		}

		console.log(`gen   ${lesson.id}  ${lesson.title}`);
		const content = await generateSlide(client, lesson);
		fs.writeFileSync(outPath, content, 'utf-8');
		console.log(`done  → ${slug}.md`);
	}
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
```

- [ ] **Step 2: Run a single-lesson smoke test**

Ensure `ANTHROPIC_API_KEY` is set, then:

```bash
ANTHROPIC_API_KEY=<your-key> npx tsx scripts/generate-slides.ts 0.1
```

Expected:
```
gen   0.1  Haskell list comprehensions and lazy sequences
done  → 00-01-haskell-list-comprehensions-and-lazy-sequences.md
```

Verify the file was created in `../rxjs-wiki/slides/` and contains valid Marp frontmatter (`marp: true`).

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-slides.ts
git commit -m "feat: add generate-slides script using Anthropic SDK"
```

---

## Task 6: `export-pdf.ts`

**Files:**
- Create: `scripts/export-pdf.ts`

Runs `@marp-team/marp-cli` on every polished slide deck and outputs PDFs to `slides-polished/pdf/`.

- [ ] **Step 1: Create `scripts/export-pdf.ts`**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { loadCurriculum, lessonSlug, allLessons } from './lib/curriculum.js';
import { CURRICULUM_PATH, SLIDES_POLISHED_DIR } from './lib/config.js';

function main(): void {
	const lessonFilter = process.argv[2]; // optional: "2.2"

	const curriculum = loadCurriculum(CURRICULUM_PATH);
	const lessons = allLessons(curriculum);

	const targets = lessonFilter
		? lessons.filter(l => l.id === lessonFilter)
		: lessons;

	const pdfDir = path.join(SLIDES_POLISHED_DIR, 'pdf');
	fs.mkdirSync(pdfDir, { recursive: true });

	let exported = 0;
	let skipped = 0;

	for (const lesson of targets) {
		const slug = lessonSlug(lesson.id, lesson.title);
		const slidePath = path.join(SLIDES_POLISHED_DIR, `${slug}.md`);
		const pdfPath = path.join(pdfDir, `${slug}.pdf`);

		if (!fs.existsSync(slidePath)) {
			console.log(`skip  ${lesson.id}  (no polished slide: ${slug}.md)`);
			skipped++;
			continue;
		}

		console.log(`pdf   ${lesson.id}  ${lesson.title}`);
		execSync(
			`npx @marp-team/marp-cli --pdf --output "${pdfPath}" "${slidePath}"`,
			{ stdio: 'inherit' }
		);
		exported++;
	}

	console.log(`\nExported ${exported} PDFs, skipped ${skipped} (no polished slide).`);
}

main();
```

- [ ] **Step 2: Smoke-test with a polished slide**

Copy one of the existing slides from `rxjs-wiki/slides/` to `slides-polished/`:

```bash
cp ../rxjs-wiki/slides/core-BehaviorSubject.md slides-polished/03-01-behaviorsubject-as-a-state-container.md
npm run export-pdf -- 3.1
```

Expected: `slides-polished/pdf/03-01-behaviorsubject-as-a-state-container.pdf` created.

Remove the test file after verifying:
```bash
rm slides-polished/03-01-behaviorsubject-as-a-state-container.md
```

- [ ] **Step 3: Commit**

```bash
git add scripts/export-pdf.ts
git commit -m "feat: add export-pdf script wrapping marp-cli"
```

---

## Task 7: Recording Notes Template and Generator

**Files:**
- Create: `docs/recording-notes/template.md`
- Create: `scripts/generate-recording-notes.ts`

- [ ] **Step 1: Create `docs/recording-notes/template.md`**

```markdown
# {{LESSON_ID}} — {{LESSON_TITLE}}

**Section:** {{SECTION_TITLE}}  
**Companion:** {{COMPANION_PATH}}  
**Wiki sources:** {{WIKI_SOURCES}}  
**Estimated length:** 8–12 minutes

---

## Hook (30–60s)

<!-- The production problem or frustration this lesson solves. Start with "Have you ever..." or "You've probably hit this when..." -->

TODO: write hook

---

## Slide Walkthrough Notes

### Slide 1 — Title + Problem Statement
<!-- What to say as you show this slide -->

TODO

### Slide 2 — Core Concept
<!-- Key points to emphasise. Any nuance not visible in the bullets. -->

TODO

### Slide 3 — How It Works
<!-- Walk through the marble diagram or diagram step by step. -->

TODO

### Slide 4 — Common Mistake
<!-- Describe a real scenario where you or a colleague wrote this wrong code. -->

TODO

### Slide 5 — The Right Way
<!-- Narrate the code line by line. Point out the key operator/pattern. -->

TODO

### Slide 6 — Key Rule
<!-- Read the rule aloud. Pause. Repeat it once. -->

TODO

---

## Live Coding Demo

**What to open:** `{{COMPANION_PATH}}`  
**Starting state:** git tag `section-{{SECTION_ID_PADDED}}-start`

### What to type / demo

<!-- Step by step — what code to write, what to run, what the output shows. -->

1. TODO
2. TODO
3. TODO

### Expected terminal / browser output

```
TODO
```

---

## Recap (15s)

<!-- One sentence summary of what was learned. -->

TODO

## What's Next (15s)

<!-- Bridge sentence to the next lesson. -->

TODO
```

- [ ] **Step 2: Create `scripts/generate-recording-notes.ts`**

```typescript
import fs from 'node:fs';
import path from 'node:path';
import { loadCurriculum, lessonSlug, allLessons } from './lib/curriculum.js';
import { CURRICULUM_PATH, RECORDING_NOTES_DIR } from './lib/config.js';

function renderTemplate(template: string, vars: Record<string, string>): string {
	return Object.entries(vars).reduce(
		(acc, [key, value]) => acc.replaceAll(`{{${key}}}`, value),
		template
	);
}

function main(): void {
	const lessonFilter = process.argv[2]; // optional: "2.2"

	const templatePath = path.join(RECORDING_NOTES_DIR, 'template.md');
	if (!fs.existsSync(templatePath)) {
		console.error(`Template not found at ${templatePath}`);
		process.exit(1);
	}
	const template = fs.readFileSync(templatePath, 'utf-8');

	const curriculum = loadCurriculum(CURRICULUM_PATH);
	const lessons = allLessons(curriculum);

	const targets = lessonFilter
		? lessons.filter(l => l.id === lessonFilter)
		: lessons;

	let created = 0;
	let skipped = 0;

	for (const lesson of targets) {
		const [sectionStr] = lesson.id.split('.');
		const sectionDir = path.join(RECORDING_NOTES_DIR, `section-${sectionStr.padStart(2, '0')}`);
		fs.mkdirSync(sectionDir, { recursive: true });

		const slug = lessonSlug(lesson.id, lesson.title);
		const outPath = path.join(sectionDir, `${slug}.md`);

		if (fs.existsSync(outPath)) {
			console.log(`skip  ${lesson.id}  (already exists)`);
			skipped++;
			continue;
		}

		const content = renderTemplate(template, {
			LESSON_ID: lesson.id,
			LESSON_TITLE: lesson.title,
			SECTION_TITLE: lesson.sectionTitle,
			COMPANION_PATH: lesson.companionPath ?? '(none)',
			WIKI_SOURCES: lesson.wikiSources.length > 0 ? lesson.wikiSources.join(', ') : '(none)',
			SECTION_ID_PADDED: sectionStr.padStart(2, '0'),
		});

		fs.writeFileSync(outPath, content, 'utf-8');
		console.log(`create  ${lesson.id}  → ${path.relative(RECORDING_NOTES_DIR, outPath)}`);
		created++;
	}

	console.log(`\nCreated ${created} recording note stubs, skipped ${skipped}.`);
}

main();
```

- [ ] **Step 3: Run the generator for all lessons**

```bash
npm run notes
```

Expected: 52 stub files created across `docs/recording-notes/section-00/` through `docs/recording-notes/section-10/`.

- [ ] **Step 4: Verify one stub looks correct**

```bash
cat docs/recording-notes/section-02/02-02-switchmap-live-queries-search-cancellation.md
```

Expected: Template with `{{...}}` replaced by actual lesson values (`2.2`, `switchMap: live queries, search, cancellation`, `apps/shop`, etc.).

- [ ] **Step 5: Commit**

```bash
git add scripts/generate-recording-notes.ts docs/recording-notes/
git commit -m "feat: add recording-notes generator with per-lesson stubs for all 52 lessons"
```

---

## Task 8: Run Full Test Suite and Final Verification

- [ ] **Step 1: Run all tests**

```bash
npm test
```

Expected: All tests pass. Output similar to:
```
✓ scripts/lib/curriculum.test.ts (5 tests)
✓ scripts/check-readiness.test.ts (4 tests)

Test Files  2 passed (2)
Tests       9 passed (9)
```

- [ ] **Step 2: Run the readiness dashboard**

```bash
npm run check
```

Expected: All 52 lessons listed as `[missing]  ✗`. (No slides have been polished yet — this is the correct starting state.)

- [ ] **Step 3: TypeScript compile check**

```bash
npx tsc --noEmit
```

Expected: No errors.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: course production tooling complete — curriculum, scripts, recording notes"
```

---

## Self-Review Notes

**Spec coverage check:**
- ✓ `curriculum.json` — 52 lessons, all fields from spec
- ✓ `generate-slides.ts` — wiki-query equivalent using Anthropic SDK
- ✓ `check-readiness.ts` — dashboard with missing/draft/polished status
- ✓ `export-pdf.ts` — marp-cli wrapper
- ✓ `docs/recording-notes/` — per-lesson stubs generated from template
- ✓ `slides-polished/` — directory tracked in git

**Not in this plan (out of scope — manual work):**
- Recording videos
- Polishing slide decks
- Adding git tags to `rxjs-spa` (done as recording progresses, not automated)
- Uploading to Udemy

**Spec note:** The spec header states 46 lessons but the curriculum tables count to 52. This plan uses 52 (the authoritative count from the tables). The spec summary should be corrected separately.
