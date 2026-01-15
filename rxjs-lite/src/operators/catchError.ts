import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SubscriptionLike } from "../core/types";
import { from } from "../creators/from";

export function catchError<T>(selector: (err: unknown, caught: Observable<T>) => Observable<T> | PromiseLike<T> | Iterable<T> | { subscribe: any }): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>((subscriber) => {
      const root = new Subscription();
      let innerSub: SubscriptionLike | null = null;

      const caught = new Observable<T>((o) => source.subscribe(o)); // re-subscribeable wrapper

      const srcSub = source.subscribe({
        next: (v) => subscriber.next(v),
        error: (e) => {
          const replacement$ = from<T>(selector(e, caught) as any);
          innerSub = replacement$.subscribe({
            next: (v) => subscriber.next(v),
            error: (e2) => subscriber.error(e2),
            complete: () => subscriber.complete(),
          });
          root.add(() => innerSub?.unsubscribe());
        },
        complete: () => subscriber.complete(),
      });

      root.add(() => srcSub.unsubscribe());
      return () => root.unsubscribe();
    });
}
