---
module: 9
type: intro
title: Module 9 — Error Handling & Resilience
---

## What You Already Know

From Module 2: the Observable contract — five phases, one Error or Complete, teardown on termination. From Module 7: inner Observables can error independently. You know that an uncaught error terminates the stream. This module shows you what to do about it.

## What This Module Covers

- **9.1** Why errors terminate permanently — the Observable contract and SafeSubscriber
- **9.2** catchError — recovering from errors by returning a replacement Observable
- **9.3** retry — resubscribing from scratch, the resilience ladder
- **9.4** timeout and finalize — detecting frozen streams and guaranteeing cleanup
- **9.5** The three-strategy decision tree — recover, retry, or rethrow

## Why It Matters

Production code fails. The question is whether failure kills the stream permanently or triggers a recovery that keeps the user experience intact. This module gives you the tools and the decision framework to make that choice correctly.
