---
module: 7
lesson: "7.2"
title: mergeMap
exercise: Add a concurrency limit to an unbounded mergeMap that is opening too many simultaneous connections.
difficulty: intermediate
---

## Scenario

A file processing pipeline uses `mergeMap` to upload files from a drop zone. When a user drops 50 files simultaneously, 50 upload requests start at once, causing connection pool exhaustion and browser throttling. The upload queue needs to process at most 3 files at a time while the remaining files wait in an implicit queue.

## Starter Code

```typescript
import { fromEvent, from } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';
import { Observable } from 'rxjs';

interface UploadResult { filename: string; url: string; }

const dropZone = document.getElementById('drop-zone') as HTMLDivElement;

const drops$ = fromEvent<DragEvent>(dropZone, 'drop').pipe(
	map((e: DragEvent) => Array.from(e.dataTransfer!.files)),
);

// BUG: unlimited concurrency — 50 files dropped = 50 simultaneous uploads
const uploads$ = drops$.pipe(
	mergeMap((files: File[]) =>
		from(files).pipe(
			mergeMap((file: File) =>
				ajax.post<UploadResult>('/api/upload', file),  // no concurrency limit
			),
		),
	),
);
```

## Task

1. Identify the exact location in the pipeline where the concurrency limit must be applied.
2. Fix the inner `mergeMap` to process at most 3 uploads simultaneously using the concurrency parameter.
3. Explain what would happen with `concurrency=1` (serial) and `concurrency=Infinity` (unlimited) to justify the choice of 3.

## Hint

`mergeMap` accepts a second argument — the maximum number of inner Observables that may be active simultaneously. Everything beyond that limit queues automatically.
