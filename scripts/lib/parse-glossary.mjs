/**
 * @param {string} content - Contents of glossary.md
 * @returns {{ terms: Map<string, string>, warnings: string[] }}
 */
export function parseGlossary(content) {
	const terms = new Map()
	const warnings = []
	const sections = content.split(/^## /m).slice(1)

	for (const section of sections) {
		const newlineIdx = section.indexOf('\n')
		if (newlineIdx === -1) {
			warnings.push(`Glossary term "${section.trim().toLowerCase()}" has no newline — skipped`)
			continue
		}
		const term = section.slice(0, newlineIdx).trim().toLowerCase()
		const body = section.slice(newlineIdx + 1).trim()

		if (!body) {
			warnings.push(`Glossary term "${term}" has no definition body — skipped`)
			continue
		}

		if (terms.has(term)) {
			warnings.push(`Glossary term "${term}" is defined more than once — later definition used`)
		}
		const firstParagraph = body.split(/\n\n/)[0].replace(/\n/g, ' ').trim()
		terms.set(term, firstParagraph)
	}

	return { terms, warnings }
}
