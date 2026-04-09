import { Observable } from "../core/Observable";
import { Subscription } from "../core/Subscription";
import type { OperatorFunction, SubscriptionLike } from "../core/types";
import { from } from "../creators/from";

/**
 * Projects each source value to an Observable which is merged in the output,
 * cancelling any previous inner Observable when a new value arrives.
 * 
 * @template T Source value type
 * @template R Inner Observable value type
 * @param project Function that returns an Observable/Promise/Iterable for each source value
 * @returns Operator function
 * 
 * @example
 * ```ts
 * // Search typeahead - cancel previous search
 * searchInput$
 *   .pipe(
 *     debounceTime(300),
 *     switchMap(query => searchAPI(query))
 *   )
 *   .subscribe(results => displayResults(results));
 * ```
 * 
 * @example
 * ```ts
 * // Navigation with cancellation
 * routeChange$
 *   .pipe(
 *     switchMap(route => loadRouteData(route))
 *   )
 *   .subscribe(data => renderPage(data));
 * // Switching routes cancels previous data load
 * ```
 * 
 * @example
 * ```ts
 * // Click to start timer (restart on each click)
 * clicks$
 *   .pipe(
 *     switchMap(() => timer(1000))
 *   )
 *   .subscribe(() => console.log('Timer complete!'));
 * // Each click cancels and restarts timer
 * ```
 * 
 * @remarks
 * **Cancellation Semantics:**
 * - When source emits, previous inner Observable is unsubscribed
 * - Only the most recent inner Observable emits values
 * - Completes when source completes AND inner completes
 * - If source errors, propagates immediately
 * - If inner errors, propagates to subscriber
 * 
 * **Use Cases:**
 * - Search typeahead (cancel previous search)
 * - Navigation (cancel previous route load)
 * - Form autosave (cancel previous save)
 * - Auto-complete (cancel previous suggestion fetch)
 * 
 * **Performance:**
 * - Automatically manages subscriptions
 * - Prevents memory leaks from old inner subscriptions
 * - Ideal when only latest result matters
 * 
 * **Compare with:**
 * - `mergeMap`: Doesn't cancel - all run concurrently
 * - `concatMap`: Queues - waits for previous to complete
 * - `exhaustMap`: Ignores new while inner is active
 * 
 * @category Higher-Order Operators
 */
export function switchMap<T, R>(project: (value: T) => Observable<R> | PromiseLike<R> | Iterable<R> | { subscribe: any }): OperatorFunction<T, R> {
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
          innerSub?.unsubscribe();
          innerSub = null;

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
