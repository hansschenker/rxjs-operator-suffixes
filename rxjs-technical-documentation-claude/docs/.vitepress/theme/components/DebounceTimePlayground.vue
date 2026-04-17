<script setup lang="ts">
import { ref } from 'vue'
import { PRESETS, DEFAULT_PRESET_INDEX } from './debounce-playground/presets'
import type { Preset } from './debounce-playground/types'

const presetIndex = ref<number>(DEFAULT_PRESET_INDEX)
const currentPreset = (): Preset => PRESETS[presetIndex.value]
</script>

<template>
	<div class="debounce-playground" data-testid="playground-root">
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
}
.caption {
	font-size: 0.9rem;
	color: var(--vp-c-text-2);
	font-style: italic;
}
</style>
