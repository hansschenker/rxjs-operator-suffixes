// src/main.ts
import './style.css';
import { MarkdownRouter } from './router';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  const router = new MarkdownRouter('app');

  // Register your markdown content
  const indexContent = `
This is the **start page** for navigating RxJS operators using **16 behavioral groups**.

**How to use this repo**
1. Start from your *intent* (what you need to accomplish).
2. Choose the matching **group**.
3. Use the group's **decision questions** and **specialization decision tree** to select an operator.
4. Jump to the operator page for rules, pitfalls, and tests.

## Navigation
- [Groups Index](./groups-index)
- [Use Case Index](./use-cases/index)
- [Glossary](./glossary)

---

## Groups

1. [Creation / Generation](./groups/01-creation-generation) — Create sources and define where events come from.
2. [Projection](./groups/02-projection) — Transform values (mostly 1→1) without changing topology.
3. [Partitioning](./groups/03-partitioning) — Keep/drop/segment values (filter, take, buffer, window).
4. [Combining](./groups/04-combining) — Merge/sequence multiple streams into one.
5. [Joining](./groups/05-joining) — Pair/correlate streams (latest snapshot, index pairing, completion join).
6. [Grouping](./groups/06-grouping) — Split into keyed substreams.
7. [Set Operations](./groups/07-set-operations) — Uniqueness/equality policies over emissions.
8. [Concurrency](./groups/08-concurrency) — Inner subscription and cancellation policies.
9. [Single Value](./groups/09-single-value) — Select exactly one value then complete.
10. [Quantifiers](./groups/10-quantifiers) — Prove boolean properties over a stream.
11. [Aggregation](./groups/11-aggregation) — Fold values into accumulated state/results.
12. [Timing](./groups/12-timing) — Control *when* values are allowed to appear downstream.
13. [Scheduling](./groups/13-scheduling) — Control execution context for subscription/notifications.
14. [Error Handling](./groups/14-error-handling) — Recovery/retry/replace semantics.
15. [Testing](./groups/15-testing) — Virtual time, deterministic assertions, cancellation proofs.
16. [Inspection](./groups/16-inspection) — Observe/debug/measure without changing meaning.
`;

  router.registerMarkdown('index', indexContent);
  
  // Register other pages as needed
  router.registerMarkdown('./groups-index', `
# Groups Index

Quick reference to all operator groups...
  `);

  // Initialize with index page
  router.init('index');
});