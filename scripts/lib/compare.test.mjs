import { describe, test, expect } from 'vitest'
import { tokenize, jaccardSimilarity, compare } from './compare.mjs'

describe('tokenize', () => {
	test('returns significant words as a Set', () => {
		const tokens = tokenize('cold observable is a stream')
		expect(tokens.has('cold')).toBe(true)
		expect(tokens.has('observable')).toBe(true)
		expect(tokens.has('stream')).toBe(true)
	})

	test('filters stop words', () => {
		const tokens = tokenize('cold observable is a stream')
		expect(tokens.has('is')).toBe(false)
		expect(tokens.has('a')).toBe(false)
	})

	test('strips markdown formatting characters', () => {
		const tokens = tokenize('**cold** `observable` is a stream')
		expect(tokens.has('cold')).toBe(true)
		expect(tokens.has('observable')).toBe(true)
	})

	test('lowercases all tokens', () => {
		const tokens = tokenize('Cold Observable')
		expect(tokens.has('cold')).toBe(true)
		expect(tokens.has('observable')).toBe(true)
	})
})

describe('jaccardSimilarity', () => {
	test('identical strings score 1.0', () => {
		expect(jaccardSimilarity('cold observable', 'cold observable')).toBe(1)
	})

	test('completely disjoint strings score 0.0', () => {
		expect(jaccardSimilarity('cold observable', 'flattening operator')).toBe(0)
	})

	test('partial overlap scores between 0 and 1', () => {
		const score = jaccardSimilarity('cold observable producer', 'cold observable subscriber')
		expect(score).toBeGreaterThan(0)
		expect(score).toBeLessThan(1)
	})
})

describe('compare', () => {
	test('flags contradiction when similarity below threshold', () => {
		const { isContradiction } = compare(
			'a cold observable runs continuously and never resets',
			'An Observable whose producer is created fresh on each subscribe call — nothing runs until a subscriber attaches',
			0.3
		)
		expect(isContradiction).toBe(true)
	})

	test('does not flag when sentence matches canonical closely', () => {
		const canonical = 'An Observable whose producer is created fresh on each subscribe call'
		const { isContradiction } = compare(canonical, canonical, 0.3)
		expect(isContradiction).toBe(false)
	})

	test('returns numeric similarity score', () => {
		const { similarity } = compare('cold observable subscribe producer', 'cold observable subscribe producer', 0.3)
		expect(similarity).toBe(1)
	})

	test('respects custom threshold', () => {
		const sentence = 'cold observable producer subscribe'
		const canonical = 'cold observable producer'
		const { isContradiction: high } = compare(sentence, canonical, 0.9)
		const { isContradiction: low } = compare(sentence, canonical, 0.1)
		expect(high).toBe(true)
		expect(low).toBe(false)
	})
})
