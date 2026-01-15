import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SchedulerLike, SubscriptionLike } from "../core/types";
import { asyncScheduler } from "../schedulers/asyncScheduler";

/**
 * Emit the latest value only after `dueTimeMs` has passed without another source emission.
 * If the source completes while a value is pending, the pending value is emitted before completion.
 */
export function debounceTime<T>(dueTimeMs: number, scheduler: SchedulerLike = asyncScheduler): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();

      let hasValue = false;
      let lastValue!: T;
      let task: SubscriptionLike | null = null;
      let sourceCompleted = false;

      const cancelTask = () => {
        task?.unsubscribe();
        task = null;
      };

      const flush = () => {
        if (hasValue) {
          hasValue = false;
          subscriber.next(lastValue);
        }
      };

      const scheduleFlush = () => {
        cancelTask();
        task = scheduler.schedule(() => {
          task = null;
          flush();
          if (sourceCompleted) subscriber.complete();
        }, Math.max(0, dueTimeMs));
        root.add(() => task?.unsubscribe());
      };

      const srcSub = source.subscribe({
        next: (v) => {
          hasValue = true;
          lastValue = v;
          scheduleFlush();
        },
        error: (e) => subscriber.error(e),
        complete: () => {
          sourceCompleted = true;
          // If a debounce timer is pending, it will flush and then complete.
          // Otherwise, flush immediately and complete.
          if (!task) {
            flush();
            subscriber.complete();
          }
        },
      });

      root.add(() => srcSub.unsubscribe());
      root.add(() => cancelTask());
      return () => root.unsubscribe();
    });
}
