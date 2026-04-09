export interface SubscriptionLike {
  readonly closed: boolean;
  unsubscribe(): void;
}

export type TeardownLogic = void | (() => void) | SubscriptionLike;

/**
 * Partial observer interface allowing optional callbacks.
 * Used when subscribing with only some callbacks defined.
 */
export interface PartialObserver<T> {
  next?: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
  readonly closed?: boolean;
}

/**
 * Complete observer interface requiring all callbacks.
 * Includes closed state for termination checks.
 */
export interface Observer<T> {
  next: (value: T) => void;
  error: (err: unknown) => void;
  complete: () => void;
  readonly closed: boolean;
}

export type OperatorFunction<T, R> = (source: import("./Observable").Observable<T>) => import("./Observable").Observable<R>;

export interface SchedulerLike {
  now(): number;
  schedule(work: () => void, delayMs?: number): SubscriptionLike;
}
