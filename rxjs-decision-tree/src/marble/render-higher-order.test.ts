// src/marble/render-higher-order.test.ts
import { describe, test, expect } from 'vitest'
import { renderHigherOrderSVG } from './render-higher-order'
import type { MarbleDiagramConfig } from './marble.types'

const config: MarbleDiagramConfig = {
	operatorName: 'switchMap',
	totalTime: 9,
	source: {
		emissions: [
			{ time: 1, label: 'A', color: '#a78bfa' },
			{ time: 3, label: 'B', color: '#fb923c' },
		],
	},
	inners: [
		{
			color: '#a78bfa', startTime: 1, cancelledAt: 3,
			values: [{ time: 2, label: 'a1', active: true }],
		},
		{
			color: '#fb923c', startTime: 3, completedAt: 9,
			values: [{ time: 5, label: 'b1', active: true }],
		},
	],
	result: {
		values: [
			{ time: 2, label: 'a1', color: '#a78bfa' },
			{ time: 5, label: 'b1', color: '#fb923c' },
		],
	},
}

describe('renderHigherOrderSVG', () => {
	test('returns a string starting with <svg', () => {
		expect(renderHigherOrderSVG(config)).toMatch(/^<svg/)
	})
	test('contains operator name', () => {
		expect(renderHigherOrderSVG(config)).toContain('switchMap')
	})
	test('contains cancellation marks for cancelled inners', () => {
		expect(renderHigherOrderSVG(config)).toContain('class="cancel-mark"')
	})

	test('spawnsInnerIndex: null makes source circle dimmed (exhaustMap — source ignored)', () => {
		const exhaustConfig: MarbleDiagramConfig = {
			operatorName: 'exhaustMap',
			totalTime: 9,
			source: {
				emissions: [
					{ time: 1, label: 'A', color: '#a78bfa' },
					{ time: 2, label: 'B', color: '#fb923c', spawnsInnerIndex: null },
				],
			},
			inners: [
				{
					color: '#a78bfa', startTime: 1, completedAt: 5,
					values: [{ time: 3, label: 'a1', active: true }],
				},
			],
			result: { values: [{ time: 3, label: 'a1', color: '#a78bfa' }] },
		}
		const svg = renderHigherOrderSVG(exhaustConfig)
		// Second source emission (spawnsInnerIndex: null) should be dimmed (opacity="0.25")
		expect(svg).toContain('opacity="0.25"')
	})
})
