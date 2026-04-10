import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch(err => {
		console.error(err);
		process.exit(1);
	});
}
