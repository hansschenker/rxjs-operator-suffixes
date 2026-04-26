import { describe, test, expect } from 'vitest'
import { parseGlossary } from './parse-glossary.mjs'

describe('parseGlossary', () => {
	test('parses a single term', () => {
		const { terms } = parseGlossary('## cold observable\nA producer created fresh per subscribe.\n')
		expect(terms.get('cold observable')).toBe('A producer created fresh per subscribe.')
	})

	test('parses multiple terms', () => {
		const { terms } = parseGlossary(
			'## cold observable\nProducer created fresh per subscribe.\n\n## hot observable\nProducer exists independently.\n'
		)
		expect(terms.size).toBe(2)
		expect(terms.has('hot observable')).toBe(true)
	})

	test('uses only first paragraph', () => {
		const { terms } = parseGlossary('## flattening\nFirst paragraph.\n\nSecond paragraph ignored.\n')
		expect(terms.get('flattening')).toBe('First paragraph.')
	})

	test('warns on heading with no body and skips the term', () => {
		const { terms, warnings } = parseGlossary('## empty term\n\n## real term\nHas a body.\n')
		expect(terms.has('empty term')).toBe(false)
		expect(warnings).toHaveLength(1)
		expect(warnings[0]).toContain('empty term')
	})

	test('lowercases term keys', () => {
		const { terms } = parseGlossary('## Cold Observable\nSome definition.\n')
		expect(terms.has('cold observable')).toBe(true)
	})

	test('collapses internal newlines in first paragraph to spaces', () => {
		const { terms } = parseGlossary('## cold observable\nFirst line\nsecond line.\n')
		expect(terms.get('cold observable')).toBe('First line second line.')
	})

	test('warns and skips term when section has no newline', () => {
		const { terms, warnings } = parseGlossary('## bare term')
		expect(terms.has('bare term')).toBe(false)
		expect(warnings).toHaveLength(1)
		expect(warnings[0]).toContain('bare term')
	})

	test('warns when term is defined more than once', () => {
		const { terms, warnings } = parseGlossary(
			'## cold observable\nFirst definition.\n\n## cold observable\nSecond definition.\n'
		)
		expect(terms.get('cold observable')).toBe('Second definition.')
		expect(warnings).toHaveLength(1)
		expect(warnings[0]).toContain('cold observable')
	})
})
