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
