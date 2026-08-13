<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../data/posts.data'

// Status badges are an authoring aid — shown only in local dev, never in prod.
const isDev = import.meta.env.DEV

// Posts are chronological — newest first (the sort happens in posts.data.ts).
// Unlike notes, posts carry a publish date, so we show it. Tags are displayed
// inline for now; a filter bar can follow once there are enough posts to make
// filtering useful.

function formatDate(iso: string): string {
  if (!iso) return ''
  // Parse the YYYY-MM-DD part explicitly to avoid timezone shifting the day.
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return iso
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <div class="dl-posts">
    <p v-if="!posts.items.length" class="dl-posts-empty">
      No posts yet. Drop a markdown file in <code>site/posts/</code> and it'll
      show up here.
    </p>

    <ul class="dl-posts-list">
      <li v-for="p in posts.items" :key="p.url" class="dl-posts-item">
        <a :href="p.url">{{ p.title }}</a>
        <time v-if="p.date" :datetime="p.date" class="dl-posts-date">{{
          formatDate(p.date)
        }}</time>
        <span
          v-if="p.uncommitted"
          class="dl-posts-uncommitted-badge"
          title="Uncommitted — local preview only"
          >uncommitted</span
        >
        <span
          v-if="isDev && p.status"
          class="dl-posts-status-badge"
          :class="'is-' + p.status"
          :title="'Editorial status: ' + p.status"
          >{{ p.status }}</span
        >
        <span v-if="p.tags?.length" class="dl-posts-tags">
          <span v-for="t in p.tags" :key="t" class="dl-posts-tag">
            {{ t }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
