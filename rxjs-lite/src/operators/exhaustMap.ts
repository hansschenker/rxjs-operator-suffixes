import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SubscriptionLike } from "../core/types";
import { from } from "../creators/from";

export function exhaustMap<T, R>(project: (value: T) => Observable<R> | PromiseLike<R> | Iterable<R> | { subscribe: any }): OperatorFunction<T, R> {
  return (source: Observable<T>) =>
    new Observable<R>((subscriber) => {
      const root = new Subscription();
      let innerSub: SubscriptionLike | null = null;
      let sourceCompleted = false;

      const tryComplete = () => {
        if (sourceCompleted && !innerSub) subscriber.complete();
      };

      const srcSub = source.subscribe({
        next: (v) => {
          if (innerSub) return; // ignore while active
          const inner$ = from<R>(project(v) as any);
          innerSub = inner$.subscribe({
            next: (x) => subscriber.next(x),
            error: (e) => subscriber.error(e),
            complete: () => {
              innerSub = null;
              tryComplete();
            },
          });
          root.add(() => innerSub?.unsubscribe());
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
