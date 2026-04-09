import { createAction } from "../core/actions";
import { Musician } from "../model/musician";

// ============================================================================
// 4. ACTIONS
// ============================================================================

// Page Actions (User Interactions)
export const musiciansPageOpened = createAction<"musicians/page/opened">(
    "musicians/page/opened"
);
export const musiciansQueryChanged = createAction<
    "musicians/page/queryChanged",
    { query: string }
>("musicians/page/queryChanged");

export const musicianDeleteClicked = createAction<
    "musicians/user/deleteClicked",
    { id: number }
>("musicians/user/deleteClicked");

// API Actions (Results from backend)
export const musiciansLoadedSuccess = createAction<
    "musicians/api/loadedSuccess",
    { musicians: Musician[] }
>("musicians/api/loadedSuccess");
export const musiciansLoadedFailure = createAction<
    "musicians/api/loadedFailure",
    { message: string }
>("musicians/api/loadedFailure");

export const musicianDeleteSuccess = createAction<
    "musicians/api/deleteSuccess",
    { id: number }
>("musicians/api/deleteSuccess");

export const musicianDeleteFailure = createAction<
    "musicians/api/deleteFailure",
    { message: string }
>("musicians/api/deleteFailure");
