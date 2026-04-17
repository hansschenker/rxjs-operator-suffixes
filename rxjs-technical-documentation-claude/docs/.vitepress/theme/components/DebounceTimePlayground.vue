<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { Subject, debounceTime, type Subscription } from 'rxjs'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import { relabelMarbles, computeGhost } from './debounce-playground/helpers'
import { createVirtualScheduler, type VirtualScheduler } from './debounce-playground/virtual-scheduler'
import type { Preset, SourceMarble, OutputMarble, GhostMarble } from './debounce-playground/types'

const TIMELINE_DURATION_MS = 3000

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const debounceMs = ref<number>(300)
const isPlaying = ref<boolean>(false)
const source = ref<SourceMarble[]>([])
const currentTime = ref<number>(0)
const output = ref<OutputMarble[]>([])

const ghost = computed((): GhostMarble | null =>
	computeGhost(source.value, currentTime.value, debounceMs.value, output.value)
)

const statusMessage = computed((): string => {
	// Just-emitted flash (300ms virtual window)
	if (lastEmittedLabel.value !== null && currentTime.value - justEmittedFlash.value < 300) {
		return `emitted '${lastEmittedLabel.value}' at t=${Math.round(justEmittedFlash.value)}ms`
	}
	// Active silence timer
	if (ghost.value) {
		const remaining = Math.max(0, ghost.value.firesAt - currentTime.value)
		return `silence active · ${Math.round(remaining)}ms until next emit${
			lastEmittedLabel.value ? ` · last emit: '${lastEmittedLabel.value}'` : ''
		}`
	}
	return 'idle — waiting for input'
})

function clearPlaybackState(): void {
	currentTime.value = 0
	output.value = []
	lastEmittedLabel.value = null
	justEmittedFlash.value = 0
}

const PLAYBACK_DURATION_MS = 6000
const lastEmittedLabel = ref<string | null>(null)
const justEmittedFlash = ref<number>(0)

let scheduler: VirtualScheduler | null = null
let pipelineSubject: Subject<SourceMarble> | null = null
let pipelineSubscription: Subscription | null = null
let nextSourceIdx = 0
let playStartWall = 0
let animationFrameId: number | null = null

function buildPipeline(): void {
	scheduler?.reset()
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()

	scheduler = createVirtualScheduler()
	pipelineSubject = new Subject<SourceMarble>()
	pipelineSubscription = pipelineSubject
		.pipe(debounceTime(debounceMs.value, scheduler))
		.subscribe({
			next: (marble: SourceMarble): void => {
				output.value.push({
					id: crypto.randomUUID(),
					sourceLabel: marble.label,
					time: scheduler!.now(),
				})
				lastEmittedLabel.value = marble.label
				justEmittedFlash.value = scheduler!.now()
			},
		})
	nextSourceIdx = 0
}

function tick(): void {
	if (!isPlaying.value || !scheduler || !pipelineSubject) return
	const wallElapsed = performance.now() - playStartWall
	const virtualTime = Math.min(
		TIMELINE_DURATION_MS,
		wallElapsed * (TIMELINE_DURATION_MS / PLAYBACK_DURATION_MS)
	)
	currentTime.value = virtualTime
	scheduler.advanceTo(virtualTime)

	while (nextSourceIdx < source.value.length && source.value[nextSourceIdx].time <= virtualTime) {
		pipelineSubject.next(source.value[nextSourceIdx])
		nextSourceIdx++
	}

	if (virtualTime >= TIMELINE_DURATION_MS) {
		pipelineSubject.complete()
		scheduler.advanceTo(TIMELINE_DURATION_MS)
		isPlaying.value = false
		return
	}
	animationFrameId = requestAnimationFrame(tick)
}

function startPlayback(): void {
	buildPipeline()
	clearPlaybackState()
	playStartWall = performance.now()
	isPlaying.value = true
	animationFrameId = requestAnimationFrame(tick)
}

function loadPreset(index: number): void {
	const preset: Preset = PRESETS[index]
	source.value = relabelMarbles(
		preset.marbles.map((m: { label: string; time: number }): SourceMarble => ({
			id: crypto.randomUUID(),
			label: m.label,
			time: m.time,
		}))
	)
	isPlaying.value = false
	clearPlaybackState()
}

watch(presetIndex, (i: number): void => loadPreset(i), { immediate: true })

watch(debounceMs, (): void => {
	if (!isPlaying.value) return
	// Rebuild the pipeline with the new debounce value, preserving current virtual time.
	const resumeTime = currentTime.value
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()
	scheduler = createVirtualScheduler()
	pipelineSubject = new Subject<SourceMarble>()
	pipelineSubscription = pipelineSubject
		.pipe(debounceTime(debounceMs.value, scheduler))
		.subscribe({
			next: (marble: SourceMarble): void => {
				output.value.push({
					id: crypto.randomUUID(),
					sourceLabel: marble.label,
					time: scheduler!.now(),
				})
				lastEmittedLabel.value = marble.label
				justEmittedFlash.value = scheduler!.now()
			},
		})
	scheduler.advanceTo(resumeTime)
	// Replay consumed marbles so the operator's internal state is correct at resumeTime
	nextSourceIdx = 0
	while (nextSourceIdx < source.value.length && source.value[nextSourceIdx].time <= resumeTime) {
		pipelineSubject.next(source.value[nextSourceIdx])
		nextSourceIdx++
	}
})

const currentPreset = (): Preset => PRESETS[presetIndex.value]

function marbleXPercent(time: number): number {
	return (time / TIMELINE_DURATION_MS) * 100
}

const MAX_SOURCE_MARBLES = 26

function onLaneClick(event: MouseEvent): void {
	// Only add if the click was on the track itself, not on a marble
	const target = event.target as HTMLElement
	if (target.classList.contains('marble')) return

	// I1 guard: refuse to add beyond the max
	if (source.value.length >= MAX_SOURCE_MARBLES) return

	const track = event.currentTarget as HTMLElement
	const rect = track.getBoundingClientRect()
	const xRatio = (event.clientX - rect.left) / rect.width
	const time = Math.round(xRatio * TIMELINE_DURATION_MS)
	if (time < 0 || time > TIMELINE_DURATION_MS) return

	const nextLabel = String.fromCharCode(97 + source.value.length)
	source.value = relabelMarbles([
		...source.value,
		{ id: crypto.randomUUID(), label: nextLabel, time },
	])
	isPlaying.value = false
	clearPlaybackState()
}

function onMarbleClick(event: MouseEvent, marbleId: string): void {
	if (event.shiftKey || event.button === 2) {
		event.preventDefault()
		event.stopPropagation()
		source.value = relabelMarbles(source.value.filter((m: SourceMarble): boolean => m.id !== marbleId))
		isPlaying.value = false
		clearPlaybackState()
	}
}

const draggingMarbleId = ref<string | null>(null)

function onMarblePointerDown(event: PointerEvent, marbleId: string): void {
	if (event.shiftKey || event.button === 2) return
	event.preventDefault()
	draggingMarbleId.value = marbleId
	;(event.target as HTMLElement).setPointerCapture(event.pointerId)
}

function onMarblePointerMove(event: PointerEvent): void {
	if (!draggingMarbleId.value) return
	const track = (event.currentTarget as HTMLElement).closest('.lane-track') as HTMLElement | null
	if (!track) return
	const rect = track.getBoundingClientRect()
	const xRatio = Math.min(Math.max(0, (event.clientX - rect.left) / rect.width), 1)
	const newTime = Math.round(xRatio * TIMELINE_DURATION_MS)
	source.value = source.value.map(
		(m: SourceMarble): SourceMarble =>
			m.id === draggingMarbleId.value ? { ...m, time: newTime } : m
	)
}

function onMarblePointerUp(): void {
	if (!draggingMarbleId.value) return
	draggingMarbleId.value = null
	source.value = relabelMarbles(source.value)
	isPlaying.value = false
	clearPlaybackState()
}

function onPlayPause(): void {
	if (isPlaying.value) {
		isPlaying.value = false
		if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
	} else {
		startPlayback()
	}
}

function onReset(): void {
	isPlaying.value = false
	if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
	scheduler?.reset()
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()
	scheduler = null
	pipelineSubject = null
	pipelineSubscription = null
	clearPlaybackState()
}

onBeforeUnmount((): void => {
	if (animationFrameId !== null) cancelAnimationFrame(animationFrameId)
	pipelineSubscription?.unsubscribe()
	pipelineSubject?.complete()
})
</script>

<template>
	<div class="debounce-playground" data-testid="playground-root">
		<div class="controls">
			<label>
				Preset:
				<select v-model="presetIndex" data-testid="preset-selector">
					<option v-for="(p, i) in PRESETS" :key="p.name" :value="i">{{ p.name }}</option>
				</select>
			</label>
			<label class="slider-label">
				debounceTime:
				<input
					type="range"
					min="0"
					max="1000"
					step="10"
					v-model.number="debounceMs"
					data-testid="debounce-ms-slider"
				/>
				<span class="slider-value">{{ debounceMs }}ms</span>
			</label>
			<button type="button" @click="onPlayPause" data-testid="play-button">
				{{ isPlaying ? '⏸ Pause' : '▶ Play' }}
			</button>
			<button type="button" @click="onReset" data-testid="reset-button">
				↻ Reset
			</button>
		</div>
		<div class="caption" data-testid="preset-description">
			{{ currentPreset().description }}
		</div>
		<div class="lane source-lane" data-testid="source-lane">
			<div class="lane-label">source$</div>
			<div
				class="lane-track"
				@click="onLaneClick"
				@contextmenu.prevent
			>
				<div
					v-for="m in source"
					:key="m.id"
					class="marble source-marble"
					:class="{ dragging: draggingMarbleId === m.id }"
					:style="{ left: `${marbleXPercent(m.time)}%` }"
					data-testid="source-marble"
					@click.stop="onMarbleClick($event, m.id)"
					@contextmenu.prevent="onMarbleClick($event, m.id)"
					@pointerdown="onMarblePointerDown($event, m.id)"
					@pointermove="onMarblePointerMove($event)"
					@pointerup="onMarblePointerUp"
					@pointercancel="onMarblePointerUp"
				>
					<span class="marble-label" data-testid="source-marble-label">{{ m.label }}</span>
				</div>
				<div
					v-if="isPlaying || currentTime > 0"
					class="time-cursor"
					:style="{ left: `${marbleXPercent(currentTime)}%` }"
					data-testid="time-cursor"
				/>
			</div>
		</div>
		<div class="lane output-lane" data-testid="output-lane">
			<div class="lane-label">output$</div>
			<div class="lane-track">
				<div
					v-for="o in output"
					:key="o.id"
					class="marble output-marble"
					:style="{ left: `${marbleXPercent(o.time)}%` }"
					data-testid="output-marble"
				>
					<span class="marble-label">{{ o.sourceLabel }}</span>
				</div>
				<div
					v-if="ghost"
					class="marble ghost-marble"
					:style="{ left: `${marbleXPercent(ghost.firesAt)}%` }"
					data-testid="ghost-marble"
					:title="`fires at t=${ghost.firesAt}ms`"
				>
					<span class="marble-label">{{ ghost.sourceLabel }}</span>
				</div>
				<div
					v-if="isPlaying || currentTime > 0"
					class="time-cursor"
					:style="{ left: `${marbleXPercent(currentTime)}%` }"
					data-testid="time-cursor"
				/>
			</div>
		</div>
		<div class="status-caption" data-testid="status-caption">
			{{ statusMessage }}
		</div>
	</div>
</template>

<style scoped>
.debounce-playground {
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	padding: 1rem;
	background: var(--vp-c-bg-soft);
	margin: 1.5rem 0;
	font-family: var(--vp-font-family-base);
}
.controls {
	display: flex;
	gap: 1rem;
	align-items: center;
	flex-wrap: wrap;
	margin-bottom: 0.75rem;
}
.slider-label {
	display: flex;
	align-items: center;
	gap: 0.5rem;
}
.slider-value {
	font-variant-numeric: tabular-nums;
	min-width: 48px;
}
button {
	padding: 0.4rem 0.8rem;
	border: 1px solid var(--vp-c-divider);
	border-radius: 4px;
	background: var(--vp-c-bg);
	cursor: pointer;
	color: var(--vp-c-text-1);
}
button:hover {
	background: var(--vp-c-bg-elv);
}
.caption {
	font-size: 0.9rem;
	color: var(--vp-c-text-2);
	font-style: italic;
}
.lane {
	position: relative;
	padding: 0.5rem 0;
	margin: 0.5rem 0;
}
.lane-label {
	font-size: 0.85rem;
	color: var(--vp-c-text-2);
	margin-bottom: 0.25rem;
	font-family: var(--vp-font-family-mono);
}
.lane-track {
	position: relative;
	height: 32px;
	background: var(--vp-c-bg);
	border-radius: 4px;
	border: 1px solid var(--vp-c-divider);
}
.marble {
	position: absolute;
	top: 50%;
	width: 24px;
	height: 24px;
	border-radius: 50%;
	transform: translate(-50%, -50%);
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 0.8rem;
	font-weight: bold;
	cursor: pointer;
	user-select: none;
}
.source-marble {
	background: var(--vp-c-brand-1);
	color: var(--vp-c-bg);
}
.marble-label {
	pointer-events: none;
}
.marble.dragging {
	transform: translate(-50%, -50%) scale(1.2);
	box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
	z-index: 10;
}
.output-marble {
	background: var(--vp-c-tip-1);
	color: var(--vp-c-bg);
}
.ghost-marble {
	background: transparent;
	border: 2px dashed var(--vp-c-tip-1);
	color: var(--vp-c-tip-1);
	opacity: 0.6;
}
.time-cursor {
	position: absolute;
	top: 0;
	bottom: 0;
	width: 1px;
	background: var(--vp-c-text-2);
	pointer-events: none;
}
.status-caption {
	font-size: 0.85rem;
	color: var(--vp-c-text-2);
	font-family: var(--vp-font-family-mono);
	margin-top: 0.5rem;
	min-height: 1.2em;
}
</style>
