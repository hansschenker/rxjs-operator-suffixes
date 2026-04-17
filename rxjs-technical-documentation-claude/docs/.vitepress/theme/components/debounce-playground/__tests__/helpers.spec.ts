import { describe, test, expect } from 'vitest'
import { computeGhost, relabelMarbles } from '../helpers'
import type { SourceMarble, OutputMarble } from '../types'

describe('computeGhost', (): void => {
	test('returns null when no source marble has been consumed', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		expect(computeGhost(marbles, 100, 300, [])).toBeNull()
	})

	test('points at latestConsumed.time + debounceMs', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		expect(computeGhost(marbles, 600, 300, [])).toEqual({
			sourceLabel: 'a',
			firesAt: 800,
		})
	})

	test('returns null after the predicted emission has already fired', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		const output: OutputMarble[] = [{ id: 'o1', sourceLabel: 'a', time: 800 }]
		expect(computeGhost(marbles, 900, 300, output)).toBeNull()
	})

	test('tracks the latest-consumed marble when multiple are in range', (): void => {
		const marbles: SourceMarble[] = [
			{ id: '1', label: 'a', time: 100 },
			{ id: '2', label: 'b', time: 200 },
		]
		expect(computeGhost(marbles, 250, 300, [])).toEqual({
			sourceLabel: 'b',
			firesAt: 500,
		})
	})

	test('ignores marbles not yet consumed by currentTime', (): void => {
		const marbles: SourceMarble[] = [
			{ id: '1', label: 'a', time: 100 },
			{ id: '2', label: 'b', time: 500 },
		]
		expect(computeGhost(marbles, 200, 300, [])).toEqual({
			sourceLabel: 'a',
			firesAt: 400,
		})
	})

	test('ignores output entries from a different source label', (): void => {
		const marbles: SourceMarble[] = [{ id: '1', label: 'a', time: 500 }]
		const output: OutputMarble[] = [{ id: 'o1', sourceLabel: 'x', time: 800 }]
		expect(computeGhost(marbles, 600, 300, output)).toEqual({
			sourceLabel: 'a',
			firesAt: 800,
		})
	})
})

describe('relabelMarbles', (): void => {
	test('labels marbles a, b, c… in time order', (): void => {
		const input: SourceMarble[] = [
			{ id: '1', label: 'x', time: 300 },
			{ id: '2', label: 'y', time: 100 },
			{ id: '3', label: 'z', time: 200 },
		]
		const result = relabelMarbles(input)
		expect(result.map((m: SourceMarble): string => m.label)).toEqual(['a', 'b', 'c'])
		expect(result.map((m: SourceMarble): number => m.time)).toEqual([100, 200, 300])
	})

	test('handles empty input', (): void => {
		expect(relabelMarbles([])).toEqual([])
	})

	test('caps at 26 marbles (rest unlabeled)', (): void => {
		const input: SourceMarble[] = Array.from({ length: 30 }, (_, i: number): SourceMarble => ({
			id: String(i),
			label: '?',
			time: i * 10,
		}))
		const result = relabelMarbles(input)
		expect(result[25].label).toBe('z')
		expect(result.length).toBe(26) // drops overflow
	})
})
