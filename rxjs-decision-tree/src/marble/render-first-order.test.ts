// src/marble/render-first-order.test.ts
import { describe, test, expect } from 'vitest'
import { renderFirstOrderSVG } from './render-first-order'
import type { FirstOrderDiagramConfig } from './marble.types'

const config: FirstOrderDiagramConfig = {
	operatorName: 'filter',
	totalTime: 10,
	source: {
		values: [
			{ time: 2, label: 'a', color: '#a78bfa', active: true },
			{ time: 5, label: 'b', color: '#34d399', active: false },
			{ time: 8, label: 'c', color: '#fb923c', active: true },
		],
		completedAt: 10,
	},
	result: { completedAt: 10 },
}

describe('renderFirstOrderSVG', () => {
	test('returns a string starting with <svg', () => {
		expect(renderFirstOrderSVG(config)).toMatch(/^<svg/)
	})
	test('contains operator name', () => {
		expect(renderFirstOrderSVG(config)).toContain('filter')
	})
	test('contains 3 source circles', () => {
		const svg = renderFirstOrderSVG(config)
		expect((svg.match(/class="src-circle"/g) ?? []).length).toBe(3)
	})
	test('active values have opacity 1; inactive have opacity 0.25', () => {
		const svg = renderFirstOrderSVG(config)
		expect(svg).toContain('opacity="1"')
		expect(svg).toContain('opacity="0.25"')
	})
})
