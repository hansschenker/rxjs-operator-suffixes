import { Observable, OperatorFunction, throwError } from 'rxjs';
import { tap, catchError, finalize } from 'rxjs/operators';

export interface TelemetryService {
	log(event: string, data?: unknown): void;
	trackError(operatorName: string, error: unknown): void;
	trackDuration(operatorName: string, durationMs: number): void;
}

// Console-based telemetry suitable for development
export const consoleTelemetry: TelemetryService = {
	log: (event, data) => console.log(`[telemetry] ${event}`, data ?? ''),
	trackError: (name, err) => console.error(`[telemetry] ${name} error`, err),
	trackDuration: (name, ms) => console.log(`[telemetry] ${name} took ${ms}ms`),
};

export function withTelemetry<T>(
	operatorName: string,
	operator: OperatorFunction<T, T>,
	telemetry: TelemetryService,
): OperatorFunction<T, T> {
	return (source$: Observable<T>): Observable<T> => {
		const startTime = Date.now();
		return source$.pipe(
			tap(value => telemetry.log(`${operatorName}:input`, value)),
			operator,
			tap(value => telemetry.log(`${operatorName}:output`, value)),
			catchError((err: unknown) => {
				telemetry.trackError(operatorName, err);
				return throwError(() => err);
			}),
			finalize(() => telemetry.trackDuration(operatorName, Date.now() - startTime)),
		);
	};
}
