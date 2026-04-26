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
