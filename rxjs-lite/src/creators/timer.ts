import { Observable } from "../core/Observable";
import type { SchedulerLike } from "../core/types";
import { asyncScheduler } from "../schedulers/asyncScheduler";

export function timer(dueTimeMs: number, scheduler: SchedulerLike = asyncScheduler): Observable<number> {
  return new Observable<number>((subscriber) => {
    const task = scheduler.schedule(() => {
      subscriber.next(0);
      subscriber.complete();
    }, Math.max(0, dueTimeMs));
    return () => task.unsubscribe();
  });
}
