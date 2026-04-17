<script setup lang="ts">
import { ref, watch } from 'vue'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import { relabelMarbles } from './debounce-playground/helpers'
import type { Preset, SourceMarble } from './debounce-playground/types'

const TIMELINE_DURATION_MS = 3000

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const debounceMs = ref<number>(300)
const isPlaying = ref<boolean>(false)
const source = ref<SourceMarble[]>([])

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
}

watch(presetIndex, (i: number): void => loadPreset(i), { immediate: true })

const currentPreset = (): Preset => PRESETS[presetIndex.value]

function marbleXPercent(time: number): number {
	return (time / TIMELINE_DURATION_MS) * 100
}

function onPlayPause(): void {
	isPlaying.value = !isPlaying.value
}

function onReset(): void {
	isPlaying.value = false
}
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
			<div class="lane-track">
				<div
					v-for="m in source"
					:key="m.id"
					class="marble source-marble"
					:style="{ left: `${marbleXPercent(m.time)}%` }"
					data-testid="source-marble"
				>
					<span class="marble-label" data-testid="source-marble-label">{{ m.label }}</span>
				</div>
			</div>
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
</style>
