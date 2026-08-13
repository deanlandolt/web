<script setup lang="ts">
import { computed, ref } from 'vue'
import { data as notes } from '../data/notes.data'

// Status badges are an authoring aid — shown only in local dev (`pnpm dev`),
// never in the production build.
const isDev = import.meta.env.DEV

// Notes are living documents, not blog posts. They have no publish date and
// aren't ordered chronologically — just a flat list, filterable by tag. The
// sort is alphabetical for now (see notes.data.ts) until a more deliberate
// organizing principle emerges.

// Build a frequency map of all tags across notes, then sort by occurrence
// (descending) with an alphabetical tiebreak for stability. Tags that appear
// only once are omitted from the filter bar to keep it focused — singleton
// tags are still shown on each note's inline tag list, just not as filters.
const tagCounts = computed(() => {
  const map = new Map<string, number>()
  for (const n of notes.items) {
    n.tags?.forEach((t) => map.set(t, (map.get(t) || 0) + 1))
  }
  return map
})

const allTags = computed(() => {
  const entries = [...tagCounts.value.entries()]
    .filter(([, count]) => count > 1)
    .sort((a, b) => {
      const diff = b[1] - a[1]
      return diff !== 0 ? diff : a[0].localeCompare(b[0])
    })
  return entries.map(([tag]) => tag)
})

// Currently active tag set. Multiple tags can be active simultaneously; notes
// must have ALL active tags to be shown (logical AND). Clicking an active tag
// removes it; clicking an inactive tag adds it.
const activeTags = ref<Set<string>>(new Set())

function toggleTag(tag: string) {
  const next = new Set(activeTags.value)
  if (next.has(tag)) next.delete(tag)
  else next.add(tag)
  activeTags.value = next
}

const visible = computed(() => {
  const tags = activeTags.value
  if (!tags.size) return notes.items
  return notes.items.filter((n) => {
    if (!n.tags) return false
    for (const t of tags) {
      if (!n.tags.includes(t)) return false
    }
    return true
  })
})
</script>

<template>
  <div class="dl-notes">
    <p v-if="!notes.items.length" class="dl-notes-empty">
      No notes yet. Drop a markdown file in <code>site/notes/</code> and it'll
      show up here.
    </p>

    <nav
      v-if="allTags.length"
      class="dl-notes-tags-bar"
      aria-label="Filter notes by tag"
    >
      <button
        v-for="t in allTags"
        :key="t"
        class="dl-notes-tag-btn"
        :class="{ 'is-active': activeTags.has(t) }"
        @click="toggleTag(t)"
      >
        {{ t }}
      </button>
    </nav>

    <ul class="dl-notes-list">
      <li v-for="n in visible" :key="n.url">
        <a :href="n.url">{{ n.title }}</a>
        <span
          v-if="n.draft"
          class="dl-notes-draft-badge"
          title="Rough draft — not published"
          >draft</span
        >
        <span
          v-if="n.uncommitted"
          class="dl-notes-uncommitted-badge"
          title="Uncommitted — local preview only"
          >uncommitted</span
        >
        <span
          v-if="isDev && n.status"
          class="dl-notes-status-badge"
          :class="'is-' + n.status"
          :title="'Editorial status: ' + n.status"
          >{{ n.status }}</span
        >
        <span v-if="n.tags?.length" class="dl-notes-tags">
          <span
            v-for="t in n.tags"
            :key="t"
            class="dl-notes-tag"
            :class="{ 'is-active': activeTags.has(t) }"
            @click="toggleTag(t)"
          >
            {{ t }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
