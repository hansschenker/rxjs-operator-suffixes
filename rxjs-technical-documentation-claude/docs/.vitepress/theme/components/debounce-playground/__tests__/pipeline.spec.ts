import { describe, test, expect } from 'vitest'
import { Subject, debounceTime } from 'rxjs'
import { createVirtualScheduler } from '../virtual-scheduler'
import { PRESETS } from '../presets'
import type { Preset } from '../types'

/**
 * Drive a preset through the virtual scheduler and capture emissions.
 */
function runPreset(preset: Preset, debounceMs: number, timelineMs: number): Array<{ label: string; time: number }> {
	const sched = createVirtualScheduler()
	const subject = new Subject<string>()
	const emissions: Array<{ label: string; time: number }> = []

	const sub = subject.pipe(debounceTime(debounceMs, sched)).subscribe({
		next: (label: string): void => {
			emissions.push({ label, time: sched.now() })
		},
	})

	// Collect all relevant time points: marble times and estimated debounce completions.
	const times = new Set<number>()
	for (const marble of preset.marbles) {
		times.add(marble.time)
	}
	times.add(timelineMs)

	// Convert to sorted array and add granular time steps for proper scheduler progression.
	const sortedTimes = Array.from(times).sort((a: number, b: number): number => a - b)

	let idx = 0
	let prevTime = 0

	for (const t of sortedTimes) {
		// Advance from prevTime to t in small steps to allow scheduler to process.
		for (let step = prevTime; step <= t; step += 1) {
			sched.advanceTo(step)
			// Emit marbles at this exact time.
			while (idx < preset.marbles.length && preset.marbles[idx].time === step) {
				subject.next(preset.marbles[idx].label)
				idx++
			}
		}
		prevTime = t
	}

	// Advance to final time plus debounce window to ensure all timeouts fire.
	for (let t = prevTime + 1; t <= timelineMs + debounceMs + 100; t += 1) {
		sched.advanceTo(t)
	}

	subject.complete()
	sub.unsubscribe()
	return emissions
}

describe('debounceTime pipeline with virtual scheduler', (): void => {
	test('preset "Typing burst" emits once: e at ~1100', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Typing burst')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('e')
		expect(result[0].time).toBeGreaterThanOrEqual(1100)
		expect(result[0].time).toBeLessThanOrEqual(1110)
	})

	test('preset "Steady typing" emits 5 times', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Steady typing')!
		const result = runPreset(preset, 300, 3000)
		expect(result.map((r): string => r.label)).toEqual(['a', 'b', 'c', 'd', 'e'])
	})

	test('preset "Two bursts" emits b at ~600 and d at ~1650', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Two bursts')!
		const result = runPreset(preset, 300, 3000)
		expect(result.map((r): string => r.label)).toEqual(['b', 'd'])
	})

	test('preset "Firehose" emits once: o at ~2500', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Firehose')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('o')
		expect(result[0].time).toBeGreaterThanOrEqual(2500)
		expect(result[0].time).toBeLessThanOrEqual(2510)
	})

	test('preset "Lone click" emits a at ~1300', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Lone click')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('a')
		expect(result[0].time).toBeGreaterThanOrEqual(1300)
		expect(result[0].time).toBeLessThanOrEqual(1310)
	})

	test('preset "Emit on complete" emits b when source completes, bypassing wait', (): void => {
		const preset = PRESETS.find((p: Preset): boolean => p.name === 'Emit on complete')!
		const result = runPreset(preset, 300, 3000)
		expect(result).toHaveLength(1)
		expect(result[0].label).toBe('b')
		// b@2700 + 300 = 3000 → fires at/around 3000 (either via deadline or completion)
		expect(result[0].time).toBeGreaterThanOrEqual(2999)
		expect(result[0].time).toBeLessThanOrEqual(3010)
	})
})
