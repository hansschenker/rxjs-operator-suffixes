import type { SchedulerLike, SubscriptionLike } from "../core/types";
import { Subscription } from "../core/Subscription";

export const asyncScheduler: SchedulerLike = {
  now: () => Date.now(),
  schedule: (work, delayMs = 0): SubscriptionLike => {
    const sub = new Subscription();
    const handle = setTimeout(() => {
      if (!sub.closed) work();
    }, delayMs);
    sub.add(() => clearTimeout(handle));
    return sub;
  },
};
