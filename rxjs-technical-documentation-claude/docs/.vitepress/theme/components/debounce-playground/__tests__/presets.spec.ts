import { describe, test, expect } from 'vitest'
import { PRESETS, DEFAULT_PRESET_INDEX } from '../presets'

describe('PRESETS', (): void => {
	test('every preset has a unique name', (): void => {
		const names = PRESETS.map((p): string => p.name)
		expect(new Set(names).size).toBe(names.length)
	})

	test('every preset has at least one marble', (): void => {
		for (const p of PRESETS) {
			expect(p.marbles.length).toBeGreaterThan(0)
		}
	})

	test('every preset marble has a label and non-negative time', (): void => {
		for (const p of PRESETS) {
			for (const m of p.marbles) {
				expect(m.label).toMatch(/^[a-z]$/)
				expect(m.time).toBeGreaterThanOrEqual(0)
			}
		}
	})

	test('no marble exceeds the timeline duration of 3000ms', (): void => {
		for (const p of PRESETS) {
			for (const m of p.marbles) {
				expect(m.time).toBeLessThanOrEqual(3000)
			}
		}
	})

	test('DEFAULT_PRESET_INDEX points at "Typing burst"', (): void => {
		expect(PRESETS[DEFAULT_PRESET_INDEX].name).toBe('Typing burst')
	})
})
