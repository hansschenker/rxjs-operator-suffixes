import { Subject } from "./Subject";
import type { PartialObserver } from "../core/types";

export class BehaviorSubject<T> extends Subject<T> {
  private _value: T;

  constructor(initialValue: T) {
    super();
    this._value = initialValue;
  }

  get value(): T {
    return this._value;
  }

  override next(value: T): void {
    this._value = value;
    super.next(value);
  }

  // Emit current value immediately upon subscription
  override subscribe(observerOrNext?: PartialObserver<T> | ((v: T) => void), error?: (e: unknown) => void, complete?: () => void) {
    const sub = super.subscribe(observerOrNext as any, error as any, complete as any);
    // Only emit if not closed by synchronous error/complete.
    if (!sub.closed) {
      const obs: any = typeof observerOrNext === "function" ? { next: observerOrNext, error, complete } : (observerOrNext ?? {});
      obs.next?.(this._value);
    }
    return sub;
  }
}
