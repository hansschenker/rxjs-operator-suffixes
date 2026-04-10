import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { deriveStatus, buildReport } from './check-readiness.js';

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
		fs.writeFileSync(path.join(tmpDir, 'draft', '00-01-haskell-list-comprehensions-and-lazy-sequences.md'), '# draft');
		fs.writeFileSync(path.join(tmpDir, 'polished', '00-02-linq-and-the-ienumerable-abstraction.md'), '# polished');

		const lessons = [
			{ id: '0.1', title: 'Haskell list comprehensions and lazy sequences', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
			{ id: '0.2', title: 'LINQ and the IEnumerable abstraction', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
			{ id: '0.3', title: 'Erik Meijer', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
		];

		const report = buildReport(lessons, path.join(tmpDir, 'draft'), path.join(tmpDir, 'polished'));
		expect(report[0].status).toBe('draft');
		expect(report[1].status).toBe('polished');
		expect(report[2].status).toBe('missing');
	});

	test('summary counts are correct', () => {
		fs.writeFileSync(path.join(tmpDir, 'polished', '00-01-haskell-list-comprehensions-and-lazy-sequences.md'), '');
		const lessons = [
			{ id: '0.1', title: 'Haskell list comprehensions and lazy sequences', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
			{ id: '0.2', title: 'LINQ and the IEnumerable abstraction', sectionId: 0, sectionTitle: 'Roots', wikiSources: [], companionPath: null },
		];
		const report = buildReport(lessons, path.join(tmpDir, 'draft'), path.join(tmpDir, 'polished'));
		const polished = report.filter(r => r.status === 'polished').length;
		const missing = report.filter(r => r.status === 'missing').length;
		expect(polished).toBe(1);
		expect(missing).toBe(1);
	});
});
