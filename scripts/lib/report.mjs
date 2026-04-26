/**
 * @typedef {{
 *   type: 'contradiction' | 'undocumented' | 'llm',
 *   term: string,
 *   file: string,
 *   line?: number,
 *   line_hint?: number,
 *   sentence?: string,
 *   canonical?: string,
 *   similarity?: number,
 *   issue?: string,
 *   canonical_definition?: string,
 *   severity?: string
 * }} Finding
 */

/**
 * @param {Finding[]} findings
 * @param {{ repos: number, files: number, durationMs: number }} stats
 * @returns {string}
 */
export function formatTerminal(findings, stats) {
	if (findings.length === 0) {
		return `✓ No terminology findings — ${stats.repos} repos, ${stats.files} files scanned in ${stats.durationMs}ms`
	}

	const lines = [
		`TERMINOLOGY FINDINGS — ${stats.repos} repos, ${stats.files} files scanned in ${stats.durationMs}ms\n`
	]

	for (const f of findings) {
		if (f.type === 'contradiction') {
			lines.push(`[CONTRADICTION] ${f.file}:${f.line}`)
			lines.push(`  Term:      ${f.term}`)
			lines.push(`  Found:     "${f.sentence}"`)
			lines.push(`  Canonical: "${f.canonical}"`)
			lines.push(`  Similarity: ${((f.similarity ?? 0) * 100).toFixed(0)}%`)
		} else if (f.type === 'undocumented') {
			lines.push(`[UNDOCUMENTED] ${f.file}:${f.line}`)
			lines.push(`  Term:  "${f.term}"`)
			lines.push(`  Found: "${f.sentence}"`)
			lines.push(`  → Not in glossary. Run --add-candidates to append stub.`)
		} else if (f.type === 'llm') {
			const lineRef = f.line_hint ?? '?'
			const severity = (f.severity ?? 'issue').toUpperCase()
			lines.push(`[LLM:${severity}] ${f.file}:${lineRef}`)
			lines.push(`  Term:      ${f.term}`)
			lines.push(`  Issue:     ${f.issue}`)
			lines.push(`  Canonical: "${f.canonical_definition}"`)
		}
		lines.push('')
	}

	lines.push(`${findings.length} finding${findings.length === 1 ? '' : 's'}`)
	return lines.join('\n')
}

/**
 * @param {Finding[]} findings
 * @param {{ repos: number, files: number, durationMs: number }} stats
 * @returns {string}
 */
export function formatJson(findings, stats) {
	return JSON.stringify({ stats, findings }, null, 2)
}
