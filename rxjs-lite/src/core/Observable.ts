import { Subscription } from "./Subscription";
import type { Observer, PartialObserver, TeardownLogic } from "./types";

/**
 * Function that defines how an Observable produces values.
 * Called once per subscriber with a SafeSubscriber instance.
 * 
 * @param observer SafeSubscriber instance that implements Observer<T>
 * @returns Teardown logic to execute on unsubscribe
 */
export type SubscribeFn<T> = (observer: Observer<T>) => TeardownLogic;

/**
 * Converts various subscription formats to a PartialObserver.
 * 
 * @internal
 */
function toObserver<T>(observerOrNext?: PartialObserver<T> | ((v: T) => void), error?: (e: unknown) => void, complete?: () => void): PartialObserver<T> {
  if (typeof observerOrNext === "function") return { next: observerOrNext, error, complete };
  return observerOrNext ?? {};
}

/**
 * Internal wrapper that provides safety guarantees for user observers.
 * 
 * Ensures that:
 * - No emissions occur after completion or error
 * - Errors in user code properly terminate the stream
 * - Unsubscribe is called on terminal notifications
 * - State checks use type-safe closed property
 * 
 * @internal
 */
class SafeSubscriber<T> extends Subscription implements Observer<T> {
  constructor(private readonly destination: PartialObserver<T>) {
    super();
  }

  next(value: T): void {
    if (this.closed) return; // ✅ Type-safe check
    try {
      this.destination.next?.(value);
    } catch (e) {
      // If user code throws inside next, we terminate the stream.
      this.error(e);
    }
  }

  error(err: unknown): void {
    if (this.closed) return; // ✅ Type-safe check
    try {
      this.destination.error?.(err);
    } finally {
      this.unsubscribe();
    }
  }

  complete(): void {
    if (this.closed) return; // ✅ Type-safe check
    try {
      this.destination.complete?.();
    } finally {
      this.unsubscribe();
    }
  }
}

/**
 * Represents a lazy push-based collection that can emit multiple values over time.
 * 
 * @template T The type of values emitted by the Observable
 * 
 * @example
 * ```ts
 * const obs$ = new Observable<number>(subscriber => {
 *   subscriber.next(1);
 *   subscriber.next(2);
 *   subscriber.complete();
 * });
 * 
 * obs$.subscribe({
 *   next: v => console.log(v),
 *   complete: () => console.log('done')
 * });
 * // Output: 1, 2, "done"
 * ```
 * 
 * @remarks
 * Observables are cold by default - each subscription triggers independent execution.
 * Use Subject for hot/multicast behavior.
 */
export class Observable<T> {
  /**
   * Creates a new Observable with custom subscription logic.
   * 
   * @param _subscribe Function that defines how values are produced.
   *                   Called once per subscriber.
   * 
   * @example
   * ```ts
   * const clicks$ = new Observable<MouseEvent>(subscriber => {
   *   const handler = (e: MouseEvent) => subscriber.next(e);
   *   document.addEventListener('click', handler);
   *   return () => document.removeEventListener('click', handler);
   * });
   * ```
   */
  constructor(private readonly _subscribe: SubscribeFn<T>) {}

  /**
   * Subscribes to the Observable to begin receiving values.
   * 
   * @param observer Observer object with callbacks
   * @returns Subscription that can be unsubscribed to stop receiving values
   */
  subscribe(observer: PartialObserver<T>): Subscription;
  /**
   * Subscribes to the Observable to begin receiving values.
   * 
   * @param next Callback for next values
   * @param error Optional error callback
   * @param complete Optional completion callback
   * @returns Subscription that can be unsubscribed to stop receiving values
   */
  subscribe(next?: (v: T) => void, error?: (e: unknown) => void, complete?: () => void): Subscription;
  subscribe(observerOrNext?: PartialObserver<T> | ((v: T) => void), error?: (e: unknown) => void, complete?: () => void): Subscription {
    const destination = toObserver(observerOrNext, error, complete);
    const subscriber = new SafeSubscriber(destination);

    const teardown = this._subscribe(subscriber);
    subscriber.add(teardown);

    return subscriber;
  }

  /**
   * Composes operators to transform the Observable.
   * 
   * @param ops Operator functions to apply in sequence
   * @returns New Observable with operators applied
   * 
   * @example
   * ```ts
   * of(1, 2, 3, 4, 5)
   *   .pipe(
   *     filter(x => x % 2 === 0),
   *     map(x => x * 10)
   *   )
   *   .subscribe(console.log);
   * // Output: 20, 40
   * ```
   * 
   * @remarks
   * Operators are applied left-to-right. Each operator returns a new Observable,
   * maintaining immutability.
   */
  pipe<A>(op1: (src: Observable<T>) => Observable<A>): Observable<A>;
  pipe<A, B>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>): Observable<B>;
  pipe<A, B, C>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>): Observable<C>;
  pipe<A, B, C, D>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>): Observable<D>;
  pipe<A, B, C, D, E>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>, op5: (src: Observable<D>) => Observable<E>): Observable<E>;
  pipe<A, B, C, D, E, F>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>, op5: (src: Observable<D>) => Observable<E>, op6: (src: Observable<E>) => Observable<F>): Observable<F>;
  pipe<A, B, C, D, E, F, G>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>, op5: (src: Observable<D>) => Observable<E>, op6: (src: Observable<E>) => Observable<F>, op7: (src: Observable<F>) => Observable<G>): Observable<G>;
  pipe<A, B, C, D, E, F, G, H>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>, op5: (src: Observable<D>) => Observable<E>, op6: (src: Observable<E>) => Observable<F>, op7: (src: Observable<F>) => Observable<G>, op8: (src: Observable<G>) => Observable<H>): Observable<H>;
  pipe<A, B, C, D, E, F, G, H, I>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>, op5: (src: Observable<D>) => Observable<E>, op6: (src: Observable<E>) => Observable<F>, op7: (src: Observable<F>) => Observable<G>, op8: (src: Observable<G>) => Observable<H>, op9: (src: Observable<H>) => Observable<I>): Observable<I>;
  pipe<A, B, C, D, E, F, G, H, I, J>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>, op4: (src: Observable<C>) => Observable<D>, op5: (src: Observable<D>) => Observable<E>, op6: (src: Observable<E>) => Observable<F>, op7: (src: Observable<F>) => Observable<G>, op8: (src: Observable<G>) => Observable<H>, op9: (src: Observable<H>) => Observable<I>, op10: (src: Observable<I>) => Observable<J>): Observable<J>;
  pipe(...ops: Array<(src: any) => any>): any {
    return ops.reduce((src, op) => op(src), this);
  }
}
