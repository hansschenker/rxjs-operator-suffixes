import { VirtualTimeScheduler } from 'rxjs'
import type { SchedulerAction, SchedulerLike, Subscription } from 'rxjs'

export interface VirtualScheduler extends SchedulerLike {
	advanceTo(time: number): void
	reset(): void
}

export function createVirtualScheduler(): VirtualScheduler {
	let inner = new VirtualTimeScheduler(undefined, Number.POSITIVE_INFINITY)

	return {
		now(): number {
			return inner.frame
		},

		schedule<T>(
			work: (this: SchedulerAction<T>, state?: T) => void,
			delay: number = 0,
			state?: T
		): Subscription {
			return inner.schedule(work, delay, state)
		},

		advanceTo(time: number): void {
			if (time < inner.frame) return

			// Set maxFrames so flush() won't overshoot past `time`.
			inner.maxFrames = time

			// Flush executes actions whose absolute delay <= maxFrames and advances
			// inner.frame to each executed action's delay. If no actions are due,
			// flush() leaves inner.frame unchanged — so we set it directly afterward
			// to ensure now() always reflects the requested virtual time.
			inner.flush()

			// Guarantee now() == time even when no actions fired in this window.
			if (inner.frame < time) {
				inner.frame = time
			}
		},

		reset(): void {
			inner = new VirtualTimeScheduler(undefined, Number.POSITIVE_INFINITY)
		},
	}
}
