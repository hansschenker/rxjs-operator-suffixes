const STOP_WORDS = new Set([
	'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
	'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
	'should', 'may', 'might', 'shall', 'can', 'that', 'this', 'these',
	'those', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from',
	'as', 'into', 'through', 'and', 'or', 'but', 'not', 'which', 'where',
	'when', 'it', 'its', 'i', 'you', 'we', 'they', 'he', 'she', 'our',
	'their', 'your', 'means', 'refers'
])

/**
 * @param {string} text
 * @returns {Set<string>}
 */
export function tokenize(text) {
	return new Set(
		text.toLowerCase()
			.replace(/[`*_#[\]()]/g, '')
			.split(/\W+/)
			.filter(w => w.length > 2 && !STOP_WORDS.has(w))
	)
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number} 0–1 Jaccard similarity
 */
export function jaccardSimilarity(a, b) {
	const setA = tokenize(a)
	const setB = tokenize(b)
	if (setA.size === 0 && setB.size === 0) return 1
	const intersection = [...setA].filter(x => setB.has(x))
	const union = new Set([...setA, ...setB])
	return intersection.length / union.size
}

/**
 * @param {string} sentence  - definitional sentence found in a script
 * @param {string} canonical - glossary definition
 * @param {number} threshold - below this similarity score → contradiction (default 0.3)
 * @returns {{ similarity: number, isContradiction: boolean }}
 */
export function compare(sentence, canonical, threshold = 0.3) {
	const similarity = jaccardSimilarity(sentence, canonical)
	return { similarity, isContradiction: similarity < threshold }
}
