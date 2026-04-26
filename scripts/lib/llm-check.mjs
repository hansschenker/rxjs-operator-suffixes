import Anthropic from '@anthropic-ai/sdk'

/**
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Map<string, string>} glossary
 * @returns {string}
 */
function buildPrompt(filePath, fileContent, glossary) {
	const glossaryText = [...glossary.entries()]
		.map(([term, def]) => `**${term}**: ${def}`)
		.join('\n')

	return `You are a course quality checker. Review the following lesson script for terminology inconsistencies against the canonical glossary.

CANONICAL GLOSSARY:
${glossaryText}

LESSON SCRIPT (${filePath}):
${fileContent}

Return ONLY a JSON array. Each element must be:
{ "term": string, "file": "${filePath}", "line_hint": number|null, "issue": string, "canonical_definition": string, "severity": "contradiction"|"ambiguous" }

Return [] if no issues found. Output raw JSON only — no markdown fences, no explanation.`
}

/**
 * @param {string} prompt
 * @returns {Promise<import('@anthropic-ai/sdk').Message>}
 */
async function callApi(prompt) {
	const client = new Anthropic()
	return client.messages.create({
		model: 'claude-haiku-4-5-20251001',
		max_tokens: 1024,
		messages: [{ role: 'user', content: prompt }],
	})
}

/**
 * @param {string} filePath
 * @param {string} fileContent
 * @param {Map<string, string>} glossary
 * @returns {Promise<object[]>}
 */
export async function llmCheck(filePath, fileContent, glossary) {
	const prompt = buildPrompt(filePath, fileContent, glossary)

	let message
	try {
		message = await callApi(prompt)
	} catch (firstErr) {
		// Skip retry for permanent errors (auth, not found)
		const status = firstErr?.status ?? firstErr?.error?.status
		if (status === 401 || status === 403 || status === 404) {
			console.warn(`Warning: LLM check failed for ${filePath} (${firstErr.message}) — falling back to Tier 1 only`)
			return []
		}
		console.warn(`Warning: LLM check attempt 1 failed for ${filePath} (${firstErr.message}) — retrying`)
		try {
			message = await callApi(prompt)
		} catch (err) {
			console.warn(`Warning: LLM check failed for ${filePath} (${err.message}) — falling back to Tier 1 only`)
			return []
		}
	}

	const text = message.content[0]?.type === 'text' ? message.content[0].text.trim() : '[]'
	try {
		const findings = JSON.parse(text)
		return Array.isArray(findings) ? findings.map(f => ({ ...f, type: 'llm' })) : []
	} catch {
		return []
	}
}
