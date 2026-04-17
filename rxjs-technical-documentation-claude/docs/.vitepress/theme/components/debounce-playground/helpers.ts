import type { SourceMarble, OutputMarble, GhostMarble } from './types'

const FIRED_TOLERANCE_MS = 1
const MAX_MARBLES = 26

/**
 * Given a set of source marbles and the current playback time, returns the
 * predicted ghost marble (the next emission that debounceTime is waiting to
 * fire), or null if the most recent pending emission has already been
 * emitted into the output. Pure: does not mutate inputs.
 *
 * @param marbles - source marbles, assumed sorted ascending by time
 */
export function computeGhost(
	marbles: readonly SourceMarble[],
	currentTime: number,
	debounceMs: number,
	output: readonly OutputMarble[]
): GhostMarble | null {
	const consumed = marbles.filter((m: SourceMarble): boolean => m.time <= currentTime)
	const latest = consumed.at(-1)
	if (!latest) return null

	const firesAt = latest.time + debounceMs
	const alreadyFired = output.some(
		(o: OutputMarble): boolean =>
			o.sourceLabel === latest.label && o.time >= firesAt - FIRED_TOLERANCE_MS
	)
	if (alreadyFired) return null

	return { sourceLabel: latest.label, firesAt }
}

/**
 * Sorts marbles by time ascending, caps at 26, and assigns sequential
 * labels 'a'..'z' based on sorted position. Pure: does not mutate input.
 * Marbles beyond the 26th are silently dropped — callers are expected to
 * prevent overflow at the UI layer.
 */
export function relabelMarbles(marbles: readonly SourceMarble[]): SourceMarble[] {
	return [...marbles]
		.sort((a: SourceMarble, b: SourceMarble): number => a.time - b.time)
		.slice(0, MAX_MARBLES)
		.map((m: SourceMarble, i: number): SourceMarble => ({
			...m,
			label: String.fromCharCode(97 + i), // 'a' + i
		}))
}
