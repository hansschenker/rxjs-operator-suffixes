import { Observable, of, from, throwError, EMPTY } from "rxjs";
import { delay, switchMap, concatMap, catchError, toArray } from "rxjs/operators";
import { Musician } from "../model/musician";

// ============================================================================
// 2. MOCK DATA (simulates backend API)
// ============================================================================

const musiciansMock: Musician[] = [
    {
        id: 1,
        name: "Eric Clapton",
        photoUrl: "/assets/musicians/eric-clapton.jpg",
    },
    {
        id: 2,
        name: "Stevie Ray Vaughan",
        photoUrl: "/assets/musicians/srv.jpg",
    },
    {
        id: 3,
        name: "B.B. King",
        photoUrl: "/assets/musicians/bb-king.jpg",
    },
    {
        id: 4,
        name: "B.B. King",
        photoUrl: "/assets/musicians/bb-king.jpg",
    },
    {
        id: 5,
        name: 'null',
        photoUrl: "null",
    },
    {
        id: 6,
        name: "Jimi Hendrix",
        photoUrl: "/assets/musicians/jimi-hendrix.jpg",
    },
    {
        id: 7,
        name: "Keith Richards",
        photoUrl: "/assets/musicians/keith-richards.jpg",
    },
];

// ============================================================================
// 3. SERVICE (replaces Angular @Injectable service)
// ============================================================================

export class MusiciansService {
    /**
     * Simulates API call with 1 second delay
     */
    getAll(): Observable<Musician[]> {
        return of(musiciansMock).pipe(
            delay(1000), // Original delay remains for realism
            switchMap(musicians => from(musicians)), // Flatten array to stream
            concatMap(musician => {
                // Check for 'bad' record to simulate throwing error
                if (musician.id === 5) {
                    // This observable throws an error
                    return throwError(() => new Error(`Failed to load musician ${musician.id}`)).pipe(
                        // Recovery mechanism: Catch error LOCALLY and return EMPTY to skip this item,
                        // or return a fallback item.
                        catchError(err => {
                            console.warn("⚠️ Recovred from error for musician:", musician.id, err);
                            // Return EMPTY to skip this item in the final list
                            return EMPTY;
                        })
                    );
                }
                return of(musician);
            }),
            // Collect all successfully processed items back into an array
            toArray()
        );
    }

    delete(_id: number): Observable<void> {
        return of(undefined).pipe(delay(1000));
    }
}

export const musiciansService = new MusiciansService();
