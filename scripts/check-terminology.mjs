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
	if (opts.deep && !process.env.ANTHROPIC_API_KEY) {
		console.error('Error: ANTHROPIC_API_KEY environment variable is required for --deep')
		process.exit(1)
	}

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
		const { llmCheck } = await import('./lib/llm-check.mjs')

		let changedFiles = []
		try {
			changedFiles = execSync('git diff --name-only main', { cwd: WORKSPACE, encoding: 'utf8' })
				.split('\n')
				.map(f => f.trim())
				.filter(f => f.endsWith('.md'))
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
