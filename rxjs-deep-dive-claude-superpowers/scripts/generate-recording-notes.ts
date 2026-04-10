import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
