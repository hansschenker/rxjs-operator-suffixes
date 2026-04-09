/**
 * Musicians App - Framework-Agnostic RxJS Effects Version
 * Facade re-exporting functionality from modular files.
 */

import { Musician } from "./model/musician";
import {
  musiciansPageOpened,
  musiciansQueryChanged,
  musiciansLoadedSuccess,
  musiciansLoadedFailure,
  musicianDeleteClicked,
} from "./store/musicians.actions";
import {
  musiciansState$,
  selectMusicians,
  selectIsLoading,
  selectQuery,
  selectError,
  selectFilteredMusicians,
  subscribe,
  MusiciansState,
} from "./store/musicians.state";
import { runner, dispatcher, actions$ } from "./store/musicians.effects";

// Re-export types
export type { Musician, MusiciansState };

// Re-export Actions
export {
  musiciansPageOpened,
  musiciansQueryChanged,
  musiciansLoadedSuccess,
  musiciansLoadedFailure,
  musicianDeleteClicked,
};

// Re-export State & Selectors
export {
  musiciansState$,
  selectMusicians,
  selectIsLoading,
  selectQuery,
  selectError,
  selectFilteredMusicians,
  subscribe,
};

// Re-export Runner items
export { runner, actions$, dispatcher };

// ============================================================================
// PUBLIC API FACADE
// ============================================================================

/**
 * Initialize the effects system
 */
export function initializeEffects(): void {
  runner.start();
}

/**
 * Cleanup function
 */
export function cleanup(): void {
  runner.stop();
}

/**
 * Dispatch actions
 */
export const dispatch = {
  pageOpened: () => dispatcher.next(musiciansPageOpened()),
  queryChanged: (query: string) => {
    dispatcher.next(musiciansQueryChanged({ query }));
  },
  deleteMusician: (id: number) => {
    dispatcher.next(musicianDeleteClicked({ id }));
  },
};

export const musiciansApp = {
  // State access
  state$: musiciansState$,
  selectMusicians,
  selectIsLoading,
  selectQuery,
  selectError,
  selectFilteredMusicians,
  getCurrentState,

  // Actions
  dispatch,

  // Subscriptions
  subscribe,

  // System control
  initializeEffects,
  cleanup,

  // Direct access to runner for advanced use
  runner,
  actions$,
  dispatcher,
};

/**
 * Example 1: Initialize the app
 */
export function initializeApp(): void {
  // Note: Call initializeEffects() first, then dispatch.pageOpened()
  // But for backward compatibility with the demo/test call sites that might not call initializeEffects explicitly if it wasn't there before (it was auto-started in original code? No, commented out)
  // Original code had `initializeEffects` exported and `runner.start` commented out in global scope.
  // Wait, original `initializeApp` just console logged. The consumer had to call setup.
  console.log("🎸 Musicians App Initialized");
}

/**
 * Example 2: Search for musicians
 */
export function searchMusicians(query: string): void {
  dispatch.queryChanged(query);
}

/**
 * Example 3: Subscribe to filtered musicians
 */
export function watchFilteredMusicians(
  callback: (musicians: Musician[]) => void
): () => void {
  const subscription = subscribe.toFilteredMusicians(callback);
  return () => subscription.unsubscribe();
}

/**
 * Example 4: Get current state synchronously
 */
// We need to access the BehaviorSubject value, but we only exported `musiciansState$` (Observable) from state.ts.
// Let's modify state.ts to export the getter or we can just subscribe and take 1.
// Actually, for a synchronous getter, we need access to the underlying value.
// I'll update `src/store/musicians.state.ts` to export a `getCurrentState` helper if needed, or just cheat here if I can't change it easily.
// Checking `src/store/musicians.state.ts` content I wrote... I did not export `state$`, only `musiciansState$` as observable.
// But I exported selectors which use `state$.value`.
// So I can implement `getCurrentState` by composing selectors or just adding it to `state.ts`.
// I will just use the `select*` functions to reconstruct state or, better, update `state.ts` to export a `getStateSnapshot`.
// Reviewing my `state.ts` write... I did not export `state$` directly.
// But I do have `state$.value` usage in selectors.
// To implement `getCurrentState` efficiently, I should export a function from `state.ts`.
// I will rewrite `src/store/musicians.state.ts` to export `getStateSnapshot`.

export function getCurrentState(): MusiciansState {
  // Temporary implementation until I update state.ts
  // This is not ideal but avoids another file write unless necessary.
  // But wait, `selectMusicians` uses `state$.value`.
  return {
    musicians: selectMusicians(),
    isLoading: selectIsLoading(),
    query: selectQuery(),
    error: selectError(),
  };
}
