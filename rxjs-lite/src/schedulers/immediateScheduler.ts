import type { SchedulerLike, SubscriptionLike } from "../core/types";
import { Subscription } from "../core/Subscription";

/**
 * A simple trampoline scheduler: queues work and flushes synchronously.
 */
export const immediateScheduler: SchedulerLike = {
  now: () => Date.now(),
  schedule: (work, delayMs = 0): SubscriptionLike => {
    const sub = new Subscription();
    if (delayMs > 0) {
      const handle = setTimeout(() => {
        if (!sub.closed) work();
      }, delayMs);
      sub.add(() => clearTimeout(handle));
      return sub;
    }

    // Trampoline
    const queue: Array<() => void> = [];
    queue.push(work);
    while (queue.length && !sub.closed) {
      const w = queue.shift()!;
      w();
    }
    return sub;
  },
};
