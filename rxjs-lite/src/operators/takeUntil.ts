import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction } from "../core/types";

export function takeUntil<T>(notifier: Observable<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();

      const srcSub = source.subscribe({
        next: (v) => subscriber.next(v),
        error: (e) => subscriber.error(e),
        complete: () => subscriber.complete(),
      });

      const notSub = notifier.subscribe({
        next: () => subscriber.complete(),
        error: (e) => subscriber.error(e),
        complete: () => {
          // ignore
        },
      });

      root.add(() => srcSub.unsubscribe());
      root.add(() => notSub.unsubscribe());
      return () => root.unsubscribe();
    });
}
