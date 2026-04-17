import { describe, test, expect } from 'vitest'
import { createVirtualScheduler } from '../virtual-scheduler'

describe('createVirtualScheduler', (): void => {
	test('now() returns the current virtual time', (): void => {
		const sched = createVirtualScheduler()
		expect(sched.now()).toBe(0)
		sched.advanceTo(500)
		expect(sched.now()).toBe(500)
	})

	test('schedule runs action at now + delay when flushed', (): void => {
		const sched = createVirtualScheduler()
		const calls: number[] = []
		sched.schedule((): void => calls.push(sched.now()), 300)
		sched.advanceTo(200)
		expect(calls).toEqual([]) // not yet
		sched.advanceTo(300)
		expect(calls).toEqual([300])
	})

	test('unsubscribing a scheduled action prevents execution', (): void => {
		const sched = createVirtualScheduler()
		const calls: number[] = []
		const sub = sched.schedule((): void => calls.push(sched.now()), 300)
		sub.unsubscribe()
		sched.advanceTo(500)
		expect(calls).toEqual([])
	})

	test('scheduled actions run in time order', (): void => {
		const sched = createVirtualScheduler()
		const calls: string[] = []
		sched.schedule((): void => calls.push('late'), 500)
		sched.schedule((): void => calls.push('early'), 100)
		sched.advanceTo(600)
		expect(calls).toEqual(['early', 'late'])
	})
})
