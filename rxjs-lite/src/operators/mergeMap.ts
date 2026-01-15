import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SubscriptionLike } from "../core/types";
import { from } from "../creators/from";

export function mergeMap<T, R>(project: (value: T) => Observable<R> | PromiseLike<R> | Iterable<R> | { subscribe: any }, concurrency = Infinity): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>((subscriber) => {
      const root = new Subscription();

      let active = 0;
      let sourceCompleted = false;
      const queue: T[] = [];

      const tryComplete = () => {
        if (sourceCompleted && active === 0 && queue.length === 0) subscriber.complete();
      };

      const startInner = (value: T) => {
        active++;
        let innerSub: SubscriptionLike | null = null;

        const inner$ = from<R>(project(value) as any);
        innerSub = inner$.subscribe({
          next: (v) => subscriber.next(v),
          error: (e) => subscriber.error(e),
          complete: () => {
            active--;
            if (queue.length > 0 && active < concurrency) {
              const next = queue.shift()!;
              startInner(next);
            }
            tryComplete();
          },
        });

        root.add(() => innerSub?.unsubscribe());
      };

      const srcSub = source.subscribe({
        next: (v) => {
          if (active < concurrency) startInner(v);
          else queue.push(v);
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
