export interface SubscriptionLike {
  readonly closed: boolean;
  unsubscribe(): void;
}

export type TeardownLogic = void | (() => void) | SubscriptionLike;

export interface PartialObserver<T> {
  next?: (value: T) => void;
  error?: (err: unknown) => void;
  complete?: () => void;
}

export interface Observer<T> {
  next: (value: T) => void;
  error: (err: unknown) => void;
  complete: () => void;
}

export type OperatorFunction<T, R> = (source: import("./Observable").Observable<T>) => import("./Observable").Observable<R>;

export interface SchedulerLike {
  now(): number;
  schedule(work: () => void, delayMs?: number): SubscriptionLike;
}
