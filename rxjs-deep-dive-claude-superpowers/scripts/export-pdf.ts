import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main();
}
