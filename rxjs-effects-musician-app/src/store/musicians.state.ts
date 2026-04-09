import { BehaviorSubject } from "rxjs";
import { map, distinctUntilChanged } from "rxjs/operators";
import { Musician } from "../model/musician";

// ============================================================================
// 5. STATE MANAGEMENT
// ============================================================================

export interface MusiciansState {
    musicians: Musician[];
    isLoading: boolean;
    query: string;
    error: string | null;
}

const initialState: MusiciansState = {
    musicians: [],
    isLoading: false,
    query: "",
    error: null,
};

// State as BehaviorSubject (replaces NgRx Store)
const state$ = new BehaviorSubject<MusiciansState>(initialState);

/**
 * Update state immutably
 */
function updateState(updater: (state: MusiciansState) => MusiciansState): void {
    state$.next(updater(state$.value));
}

/**
 * Selectors - query current state
 */
export const selectMusicians = () => state$.value.musicians;
export const selectIsLoading = () => state$.value.isLoading;
export const selectQuery = () => state$.value.query;
export const selectError = () => state$.value.error;
export const selectFilteredMusicians = () => {
    const musicians = selectMusicians();
    const query = selectQuery().toLowerCase();
    return musicians.filter((musician) =>
        musician.name.toLowerCase().includes(query)
    );
};

// Expose state as observable for reactive subscriptions
export const musiciansState$ = state$.asObservable();

// ============================================================================
// 6. REDUCER LOGIC (handled via updateState + action listeners)
// ============================================================================

export function handlePageOpened(): void {
    updateState((state) => ({ ...state, isLoading: true, error: null }));
}

export function handleQueryChanged(query: string): void {
    updateState((state) => ({ ...state, query }));
}

export function handleMusiciansLoadedSuccess(musicians: Musician[]): void {
    updateState((state) => ({
        ...state,
        musicians,
        isLoading: false,
        error: null,
    }));
}

export function handleMusiciansLoadedFailure(message: string): void {
    updateState((state) => ({ ...state, isLoading: false, error: message }));
}

export function handleMusicianDeleteSuccess(id: number): void {
    updateState((state) => ({
        ...state,
        musicians: state.musicians.filter((m) => m.id !== id),
    }));
}

/**
 * Subscribe to state changes (replaces Angular Store selectors)
 */
export const subscribe = {
    toState: (callback: (state: MusiciansState) => void) =>
        state$.subscribe(callback),

    toMusicians: (callback: (musicians: Musician[]) => void) =>
        state$.subscribe((state) => callback(state.musicians)),

    toFilteredMusicians: (callback: (musicians: Musician[]) => void) =>
        state$
            .pipe(
                map((state) => {
                    const query = state.query.toLowerCase();
                    return state.musicians.filter((m) =>
                        m.name.toLowerCase().includes(query)
                    );
                }),
                distinctUntilChanged((prev, next) => {
                    if (prev.length !== next.length) {
                        return false;
                    }

                    return prev.every((musician, index) => musician.id === next[index].id);
                })
            )
            .subscribe(callback),

    toIsLoading: (callback: (isLoading: boolean) => void) =>
        state$.subscribe((state) => callback(state.isLoading)),

    toQuery: (callback: (query: string) => void) =>
        state$.subscribe((state) => callback(state.query)),

    toError: (callback: (error: string | null) => void) =>
        state$.subscribe((state) => callback(state.error)),
};
