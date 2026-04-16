---
module: 9
type: outro
title: Module 9 Recap — Error Handling & Resilience
---

## What You Learned

- Error is terminal — the Observable contract requires exactly one Error or Complete, never both, never resumed
- `catchError` returns a replacement Observable — it does not resume the errored one
- `retry` resubscribes from scratch — correct for idempotent reads, dangerous for non-idempotent writes
- `timeout` detects frozen streams; `finalize` cleans up on all three termination paths: complete, error, and unsubscribe
- Three strategies: recover (catchError), retry (retry/backoff), rethrow (catchError + throwError)

## Bridge to Module 10

You can now build resilient individual streams. Module 10 — Domain Facades, Testing & Architecture — shows how to compose everything into production-ready patterns: readable domain operators, hexagonal architecture, AOP telemetry, deterministic time-based tests, and the 4-Layer Model as a diagnostic compass.
