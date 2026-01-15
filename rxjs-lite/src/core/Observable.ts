import { Subscription } from "./Subscription";
import type { Observer, PartialObserver, TeardownLogic } from "./types";

export type SubscribeFn<T> = (observer: Observer<T>) => TeardownLogic;

function toObserver<T>(observerOrNext?: PartialObserver<T> | ((v: T) => void), error?: (e: unknown) => void, complete?: () => void): PartialObserver<T> {
  if (typeof observerOrNext === "function") return { next: observerOrNext, error, complete };
  return observerOrNext ?? {};
}

class SafeSubscriber<T> extends Subscription implements Observer<T> {
  constructor(private readonly destination: PartialObserver<T>) {
    super();
  }

  next(value: T): void {
    if (this.closed) return;
    try {
      this.destination.next?.(value);
    } catch (e) {
      // If user code throws inside next, we terminate the stream.
      this.error(e);
    }
  }

  error(err: unknown): void {
    if (this.closed) return;
    try {
      this.destination.error?.(err);
    } finally {
      this.unsubscribe();
    }
  }

  complete(): void {
    if (this.closed) return;
    try {
      this.destination.complete?.();
    } finally {
      this.unsubscribe();
    }
  }
}

export class Observable<T> {
  constructor(private readonly _subscribe: SubscribeFn<T>) {}

  subscribe(observer: PartialObserver<T>): Subscription;
  subscribe(next?: (v: T) => void, error?: (e: unknown) => void, complete?: () => void): Subscription;
  subscribe(observerOrNext?: PartialObserver<T> | ((v: T) => void), error?: (e: unknown) => void, complete?: () => void): Subscription {
    const destination = toObserver(observerOrNext, error, complete);
    const subscriber = new SafeSubscriber(destination);

    const teardown = this._subscribe(subscriber);
    subscriber.add(teardown);

    return subscriber;
  }

  pipe<A>(op1: (src: Observable<T>) => Observable<A>): Observable<A>;
  pipe<A, B>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>): Observable<B>;
  pipe<A, B, C>(op1: (src: Observable<T>) => Observable<A>, op2: (src: Observable<A>) => Observable<B>, op3: (src: Observable<B>) => Observable<C>): Observable<C>;
  pipe(...ops: Array<(src: any) => any>): any {
    return ops.reduce((src, op) => op(src), this);
  }
}
