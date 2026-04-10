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
