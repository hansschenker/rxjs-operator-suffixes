<script setup lang="ts">
import { ref } from 'vue'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import type { Preset } from './debounce-playground/types'

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const debounceMs = ref<number>(300)
const isPlaying = ref<boolean>(false)

const currentPreset = (): Preset => PRESETS[presetIndex.value]

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
</style>
