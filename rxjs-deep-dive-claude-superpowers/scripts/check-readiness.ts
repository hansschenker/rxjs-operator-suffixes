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
