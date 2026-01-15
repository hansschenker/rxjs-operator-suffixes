import type { SubscriptionLike, TeardownLogic } from "./types";

function isSubscriptionLike(x: unknown): x is SubscriptionLike {
  return typeof x === "object" && x !== null && "unsubscribe" in (x as any) && typeof (x as any).unsubscribe === "function";
}

export class Subscription implements SubscriptionLike {
  public closed = false;
  private teardowns: Array<() => void> = [];

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

  unsubscribe(): void {
    if (this.closed) return;
    this.closed = true;

    // LIFO helps in many resource scenarios.
    for (let i = this.teardowns.length - 1; i >= 0; i--) {
      try {
        this.teardowns[i]!();
      } catch {
        // Out-of-band errors: swallowed by default in this lite implementation.
        // A future version could report to a host error handler.
      }
    }
    this.teardowns = [];
  }
}
