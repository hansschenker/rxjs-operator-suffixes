---
title: About This Documentation
---

# About This Documentation

## What You're Reading

This site is a structured reference for **RxJS operator naming conventions** — how the base name of each operator encodes its core semantic, and how the suffix narrows the trigger, boundary, or configuration.

It covers:

- **12 operator categories** with suffix-grouped reference pages
- **12 Mermaid decision trees** to guide you to the right operator by answering a short sequence of questions
- **Deep-dive pages** for every operator in the RxJS 7 API surface, including policy tables, marble diagrams, TypeScript signatures, code samples, and gotchas

---

## Created With Claude

This documentation was researched, structured, and written in collaboration with **[Claude](https://claude.ai)**, Anthropic's AI assistant, using **[Claude Code](https://claude.ai/code)** — Anthropic's agentic CLI for software engineering tasks.

The workflow combined:

- **Brainstorming sessions** to design the site structure, category taxonomy, and decision-tree format
- **Implementation plans** broken into discrete tasks and executed by subagents with two-stage review (spec compliance → code quality) after each task
- **`/rxjs-explain` skill** — a custom Claude Code skill that generates operator deep-dive pages in a consistent v2 template format and caches them to disk
- **Subagent-driven development** — each feature was dispatched to a fresh subagent with exactly the context it needed, then reviewed against the spec before the next task began

Every operator deep-dive page was generated from Claude's knowledge of the RxJS source, cross-checked against the operator's published TypeScript signatures and documented behaviour. The decision trees reflect the reasoning embedded in those deep-dives, surfaced as yes/no flowcharts.

---

## Author

**Hans Schenker** — Frontend developer, RxJS enthusiast, and educator.

The site was built as a companion to a series of RxJS learning projects exploring operator families, reactive architecture, and the mathematical foundations of Observables.

---

## Technology

| Concern | Tool |
|---------|------|
| Documentation site | [VitePress](https://vitepress.dev) 1.6.4 |
| Diagrams | [Mermaid](https://mermaid.js.org) (via VitePress plugin) |
| Language | TypeScript |
| AI assistant | [Claude](https://claude.ai) (Anthropic) |
| AI CLI | [Claude Code](https://claude.ai/code) |

---

## Licence

Documentation content is provided for educational use. RxJS is copyright ReactiveX contributors, licensed under Apache 2.0.
