import type { SchedulerAction, SchedulerLike, Subscription } from 'rxjs'

interface ScheduledItem {
	firesAt: number
	action: () => void
	cancelled: boolean
}

export interface VirtualScheduler extends SchedulerLike {
	advanceTo(time: number): void
	reset(): void
}

export function createVirtualScheduler(): VirtualScheduler {
	let currentTime = 0
	let queue: ScheduledItem[] = []

	const flushDue = (): void => {
		queue.sort((a: ScheduledItem, b: ScheduledItem): number => a.firesAt - b.firesAt)
		while (queue.length > 0 && queue[0].firesAt <= currentTime) {
			const item = queue.shift()!
			if (!item.cancelled) item.action()
		}
	}

	return {
		now(): number {
			return currentTime
		},
		schedule<T>(
			work: (this: SchedulerAction<T>, state?: T) => void,
			delay: number = 0,
			_state?: T
		): Subscription {
			const item: ScheduledItem = {
				firesAt: currentTime + delay,
				action: (): void => {
					// We don't use the SchedulerAction machinery here — just invoke work.
					;(work as (state?: T) => void)(undefined)
				},
				cancelled: false,
			}
			queue.push(item)
			const sub: Subscription = {
				closed: false,
				unsubscribe(): void {
					item.cancelled = true
					sub.closed = true
				},
				add(): void {},
				remove(): void {},
			} as unknown as Subscription
			return sub
		},
		advanceTo(time: number): void {
			if (time < currentTime) {
				// Going backwards means a reset; caller should call reset() instead.
				return
			}
			currentTime = time
			flushDue()
		},
		reset(): void {
			currentTime = 0
			queue = []
		},
	}
}
