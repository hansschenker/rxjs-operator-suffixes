import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SchedulerLike } from "../core/types";
import { asyncScheduler } from "../schedulers/asyncScheduler";

/**
 * Delay each `next` by `dueTimeMs`. Completion is delayed until all pending emissions flush.
 * Errors are forwarded immediately.
 */
export function delay<T>(dueTimeMs: number, scheduler: SchedulerLike = asyncScheduler): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();
      let pending = 0;
      let sourceCompleted = false;

      const tryComplete = () => {
        if (sourceCompleted && pending === 0) subscriber.complete();
      };

      const srcSub = source.subscribe({
        next: (v) => {
          pending++;
          const task = scheduler.schedule(() => {
            pending--;
            subscriber.next(v);
            tryComplete();
          }, Math.max(0, dueTimeMs));
          root.add(() => task.unsubscribe());
        },
        error: (e) => subscriber.error(e),
        complete: () => {
          sourceCompleted = true;
          tryComplete();
        },
      });

      root.add(() => srcSub.unsubscribe());
      return () => root.unsubscribe();
    });
}
