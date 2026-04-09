import type { SubscriptionLike, TeardownLogic } from "./types";
import { reportError } from "./errorHandling";

/**
 * Type guard to check if a value implements SubscriptionLike interface.
 * @internal
 */
function isSubscriptionLike(x: unknown): x is SubscriptionLike {
  return typeof x === "object" && x !== null && "unsubscribe" in (x as any) && typeof (x as any).unsubscribe === "function";
}

/**
 * Represents a disposable resource with cleanup logic.
 * 
 * @remarks
 * Subscriptions can aggregate multiple teardown functions.
 * Calling unsubscribe() executes all teardowns in LIFO (Last-In-First-Out) order.
 * 
 * @example
 * ```ts
 * const sub = new Subscription();
 * sub.add(() => console.log('cleanup 1'));
 * sub.add(() => console.log('cleanup 2'));
 * sub.unsubscribe();
 * // Output: "cleanup 2", "cleanup 1"  (LIFO order)
 * ```
 */
export class Subscription implements SubscriptionLike {
  /**
   * Whether this subscription has been unsubscribed.
   * Once true, cannot be reset to false.
   */
  public closed = false;
  private teardowns: Array<() => void> = [];

  /**
   * Adds a teardown function or subscription to be executed on unsubscribe.
   * 
   * @param teardown Function, Subscription, or void to execute on cleanup
   * 
   * @remarks
   * - If already closed, executes teardown immediately
   * - Teardowns are executed in LIFO (last-in-first-out) order
   * - Errors in teardowns are reported but don't prevent other teardowns
   * 
   * @example
   * ```ts
   * const sub = new Subscription();
   * const interval = setInterval(() => console.log('tick'), 1000);
   * sub.add(() => clearInterval(interval));
   * 
   * // Later...
   * sub.unsubscribe();  // Clears interval
   * ```
   */
  add(teardown: TeardownLogic): void {
    if (!teardown) return;

    if (this.closed) {
      // If already closed, run immediately.
      if (typeof teardown === "function") teardown();
      else if (isSubscriptionLike(teardown)) teardown.unsubscribe();
      return;
    }

    if (typeof teardown === "function") this.teardowns.push(teardown);
    else if (isSubscriptionLike(teardown)) this.teardowns.push(() => teardown.unsubscribe());
  }

  /**
   * Executes all teardown logic and marks subscription as closed.
   * Safe to call multiple times (idempotent).
   * 
   * @remarks
   * - Executes teardowns in LIFO (last-in-first-out) order
   * - Swallows errors to ensure all teardowns run
   * - Sets closed = true before executing teardowns
   * - LIFO order ensures inner subscriptions clean up before outer ones
   * 
   * @example
   * ```ts
   * const sub = obs$.subscribe(console.log);
   * sub.unsubscribe();
   * sub.unsubscribe();  // Safe - does nothing
   * ```
   */
  unsubscribe(): void {
    if (this.closed) return;
    this.closed = true;

    // LIFO helps in many resource scenarios (e.g., inner subscriptions before outer).
    for (let i = this.teardowns.length - 1; i >= 0; i--) {
      try {
        this.teardowns[i]!();
      } catch (err) {
        // Report out-of-band errors to global handler
        reportError(err);
      }
    }
    this.teardowns = [];
  }
}
