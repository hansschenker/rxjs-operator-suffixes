// src/tree/tree.builders.ts
import type { LeafNode, OperatorResult } from './tree.types'

export const WIKI_BASE = 'http://localhost:5174'  // local VitePress wiki; update for prod

export function leaf(id: string, operators: OperatorResult[]): LeafNode {
	return { kind: 'leaf', id, operators }
}

export function op(name: string, oneliner: string, wikiPath: string, primary = true): OperatorResult {
	return { name, oneliner, wikiPath, primary }
}
