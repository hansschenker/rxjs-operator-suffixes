import { Subject, Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { Action } from "./actions";
import { Effect } from "./effect-creator";

export interface EffectsSystemConfig {
  debug?: boolean;
  errorHandler?: (error: any, effectId: string) => void;
}

export interface EffectsRunner {
  registerEffects: (effects: Record<string, Effect>) => void;
  start: () => void;
  stop: () => void;
}

export interface EffectsSystem {
  actions$: Observable<Action>;
  dispatcher: Subject<Action>;
  runner: EffectsRunner;
}

export function createEffectsSystem(
  config: EffectsSystemConfig = {}
): EffectsSystem {
  const { debug = false, errorHandler } = config;

  const dispatcher = new Subject<Action>();
  const actions$ = dispatcher.asObservable();

  let registeredEffects: Effect[] = [];
  let subscriptions: any[] = [];
  let isRunning = false;

  const runner: EffectsRunner = {
    registerEffects(effects) {
      if (isRunning) {
        throw new Error("Cannot register effects while system is running");
      }

      registeredEffects = Object.values(effects);
    },

    start() {
      if (isRunning) return;

      isRunning = true;

      // Create observables for dispatching effects
      const dispatchingEffects = registeredEffects
        .filter((effect) => effect.dispatch)
        .map((effect) =>
          effect.observable.pipe(
            tap((action) => {
              if (debug) {
                console.log(`📤 Dispatching action from ${effect.id}:`, action);
              }
              dispatcher.next(action);
            }),
            tap({
              error: (error) => {
                if (errorHandler) {
                  errorHandler(error, effect.id);
                } else {
                  console.error(`Error in effect ${effect.id}:`, error);
                }
              },
            })
          )
        );

      // Create observables for non-dispatching effects
      const nonDispatchingEffects = registeredEffects
        .filter((effect) => !effect.dispatch)
        .map((effect) =>
          effect.observable.pipe(
            tap({
              error: (error) => {
                if (errorHandler) {
                  errorHandler(error, effect.id);
                } else {
                  console.error(`Error in effect ${effect.id}:`, error);
                }
              },
            })
          )
        );

      // Subscribe to all effects
      subscriptions = [
        ...dispatchingEffects.map((obs) => obs.subscribe()),
        ...nonDispatchingEffects.map((obs) => obs.subscribe()),
      ];

      if (debug) {
        console.log(
          `🚀 Effects system started with ${registeredEffects.length} effects`
        );
      }
    },

    stop() {
      if (!isRunning) return;

      isRunning = false;
      subscriptions.forEach((sub) => sub.unsubscribe());
      subscriptions = [];

      if (debug) {
        console.log("🛑 Effects system stopped");
      }
    },
  };

  return {
    actions$,
    dispatcher,
    runner,
  };
}
