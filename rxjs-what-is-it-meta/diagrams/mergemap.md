# mergeMap — parallel, unordered

```ascii
uploads$:  --A--B--C-------------|
            mergeMap(file => upload$(file))

upload$(A): --------a1--|
upload$(B):    -----b1--|
upload$(C):       --c1--|

output$:   -----c1-b1--a1--|
```
All three inner Observables run simultaneously. Output order reflects completion order, not arrival order.

**Read it:** A, B, and C start uploading immediately as they arrive. C is smallest and completes first. B completes second. A completes last. The output interleaves results as they arrive — there is no waiting.

**Use when:** each inner operation is fully independent and ordering does not matter — parallel file uploads, independent API calls, fire-and-forget analytics events.

```typescript
import { from } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

interface UploadResult { fileId: string; url: string; }

declare const files: File[];

const upload$ = from(files).pipe(
	mergeMap((file: File) => {
		const form = new FormData();
		form.append('file', file);
		return ajax.post<UploadResult>('/api/upload', form);
	}),
);
```
