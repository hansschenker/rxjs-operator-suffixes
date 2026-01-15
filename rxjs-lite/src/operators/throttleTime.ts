import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SchedulerLike, SubscriptionLike } from "../core/types";
import { asyncScheduler } from "../schedulers/asyncScheduler";

/**
 * Leading-only throttle (RxJS default is leading=true, trailing=false).
 * - emit immediately
 * - ignore subsequent values for `dueTimeMs`
 */
export function throttleTime<T>(dueTimeMs: number, scheduler: SchedulerLike = asyncScheduler): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();

      let throttling = false;
      let gateTask: SubscriptionLike | null = null;

      const openGateLater = () => {
        gateTask?.unsubscribe();
        gateTask = scheduler.schedule(() => {
          throttling = false;
          gateTask = null;
        }, Math.max(0, dueTimeMs));
        root.add(() => gateTask?.unsubscribe());
      };

      const srcSub = source.subscribe({
        next: (v) => {
          if (throttling) return;
          subscriber.next(v);
          throttling = true;
          openGateLater();
        },
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });

      root.add(() => srcSub.unsubscribe());
      return () => root.unsubscribe();
    });
}
