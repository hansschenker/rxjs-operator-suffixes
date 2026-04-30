import { describe, test, expect } from 'vitest'
import { getOperatorDetail } from './operator-detail'

describe('getOperatorDetail', () => {
	test('returns marbleSVG string and explanation for a known operator', () => {
		const result = getOperatorDetail('/operators/map')
		expect(result.marbleSVG).toBeTypeOf('string')
		expect(result.marbleSVG).toMatch(/^<svg/)
		expect(result.explanation).not.toBeNull()
	})

	test('returns null marbleSVG and null explanation for an unknown path', () => {
		const result = getOperatorDetail('/operators/__nonexistent__')
		expect(result.marbleSVG).toBeNull()
		expect(result.explanation).toBeNull()
	})

	test('extracts key from the last path segment', () => {
		// switchMap is in both registries
		const result = getOperatorDetail('/operators/switchMap')
		expect(result.marbleSVG).toMatch(/switchMap/)
		expect(result.explanation).not.toBeNull()
	})

	test('works for subject paths (/subjects/BehaviorSubject)', () => {
		const result = getOperatorDetail('/subjects/BehaviorSubject')
		expect(result.marbleSVG).toBeTypeOf('string')
	})
})
