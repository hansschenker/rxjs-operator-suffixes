<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vitepress'
import { taxonomy } from '@taxonomy'
import type { Family, SubFamily, Operator } from '@taxonomy'

const router = useRouter()

const selectedFamily = ref<Family>(taxonomy[0])
const selectedSubFamily = ref<SubFamily | null>(null)
const selectedOperator = ref<Operator | null>(null)

onMounted(() => {
	const params = new URLSearchParams(window.location.search)
	const letter = params.get('family')
	if (letter) {
		const found = taxonomy.find(f => f.letter === letter)
		if (found) {
			selectedFamily.value = found
		}
	}
})

function selectFamily(family: Family): void {
	selectedFamily.value = family
	selectedSubFamily.value = null
	selectedOperator.value = null
}

function selectSubFamily(sub: SubFamily): void {
	selectedSubFamily.value = sub
	selectedOperator.value = null
}

function selectOperator(op: Operator): void {
	selectedOperator.value = op
	router.go(`/operators/${op.slug}`)
}
</script>

<template>
	<div class="navigator">
		<div class="panel">
			<div class="panel-header">Family</div>
			<ul>
				<li
					v-for="family in taxonomy"
					:key="family.letter"
					:class="{ active: selectedFamily.letter === family.letter }"
					@click="selectFamily(family)"
				>
					{{ family.label }}
				</li>
			</ul>
		</div>

		<div class="panel">
			<div class="panel-header">Sub-Family</div>
			<ul>
				<li
					v-for="sub in selectedFamily.subFamilies"
					:key="sub.label"
					:class="{ active: selectedSubFamily?.label === sub.label }"
					@click="selectSubFamily(sub)"
				>
					{{ sub.label }}
				</li>
			</ul>
		</div>

		<div class="panel">
			<div class="panel-header">Operators</div>
			<ul v-if="selectedSubFamily">
				<li
					v-for="op in selectedSubFamily.operators"
					:key="op.slug"
					:class="{ active: selectedOperator?.slug === op.slug }"
					@click="selectOperator(op)"
				>
					<span class="op-name">{{ op.name }}</span>
					<span class="op-tagline">{{ op.tagline }}</span>
				</li>
			</ul>
			<div v-else class="empty-hint">← Select a sub-family</div>
		</div>
	</div>
</template>

<style scoped>
.navigator {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	border: 1px solid var(--vp-c-divider);
	border-radius: 8px;
	overflow: hidden;
	height: 600px;
	margin: 24px 0;
}

.panel {
	display: flex;
	flex-direction: column;
	overflow: hidden;
	border-right: 1px solid var(--vp-c-divider);
}

.panel:last-child {
	border-right: none;
}

.panel-header {
	padding: 10px 16px;
	font-size: 11px;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: var(--vp-c-text-2);
	border-bottom: 1px solid var(--vp-c-divider);
	background: var(--vp-c-bg-soft);
	flex-shrink: 0;
}

ul {
	list-style: none;
	margin: 0;
	padding: 6px 0;
	overflow-y: auto;
	flex: 1;
}

li {
	padding: 8px 16px;
	cursor: pointer;
	display: flex;
	flex-direction: column;
	gap: 2px;
	transition: background 0.1s;
}

li:hover {
	background: var(--vp-c-bg-soft);
}

li.active {
	background: var(--vp-c-brand-soft);
}

li.active .op-name,
li.active {
	color: var(--vp-c-brand-1);
}

.op-name {
	font-family: var(--vp-font-family-mono);
	font-size: 13px;
	font-weight: 500;
}

.op-tagline {
	font-size: 11px;
	color: var(--vp-c-text-2);
	line-height: 1.4;
}

li.active .op-tagline {
	color: var(--vp-c-brand-2);
}

.empty-hint {
	padding: 24px 16px;
	font-size: 13px;
	color: var(--vp-c-text-3);
	font-style: italic;
}
</style>
