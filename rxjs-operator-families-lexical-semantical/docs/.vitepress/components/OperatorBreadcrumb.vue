<script setup lang="ts">
import { computed } from 'vue'
import { useData, useRouter } from 'vitepress'
import { taxonomy } from '@taxonomy'

const { frontmatter } = useData()
const router = useRouter()

const familyLetter = computed<string>(() => {
  const found = taxonomy.find(f => f.label === frontmatter.value.family)
  return found?.letter ?? ''
})

function backToNavigator(): void {
  router.go(`/?family=${familyLetter.value}`)
}
</script>

<template>
  <div class="breadcrumb-bar">
    <nav class="breadcrumb" aria-label="breadcrumb">
      <a class="back-link" href="/" @click.prevent="backToNavigator">← Navigator</a>
      <span class="sep">›</span>
      <span class="crumb">{{ frontmatter.family }}</span>
      <span class="sep">›</span>
      <span class="crumb">{{ frontmatter.subFamily }}</span>
      <span class="sep">›</span>
      <code class="current">{{ frontmatter.title }}</code>
    </nav>
  </div>
</template>

<style scoped>
.breadcrumb-bar {
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.breadcrumb {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 13px;
}

.back-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-weight: 500;
}

.back-link:hover {
  text-decoration: underline;
}

.sep {
  color: var(--vp-c-text-3);
}

.crumb {
  color: var(--vp-c-text-2);
}

.current {
  color: var(--vp-c-text-1);
  font-size: 13px;
  background: var(--vp-c-bg-soft);
  padding: 1px 6px;
  border-radius: 4px;
}
</style>
