<script setup lang="ts">
import { computed, ref } from 'vue'
import quotes from '../data/quotes.generated.json'

interface QuoteItem {
  slug: string
  url: string
  title: string
  text: string
  author: string
  authorSlug: string
  authorUrl: string
  source: string
  category: string
  categorySlug: string
  categoryUrl: string
  circa?: string | number
  context?: string
  work?: string
  note?: string
}

const allQuotes = quotes as QuoteItem[]

// ── Category filter ─────────────────────────────────────────────────────────
// Collect unique categories in first-appearance order (matching the YAML).
const allCategories = computed(() => {
  const seen = new Set<string>()
  const order: string[] = []
  for (const q of allQuotes) {
    if (!seen.has(q.category)) {
      seen.add(q.category)
      order.push(q.category)
    }
  }
  return order
})

const activeCategory = ref('')

// ── Search ──────────────────────────────────────────────────────────────────
// Client-side full-text search across quote text, author, work, context, and
// notes. Lowercase comparison — instant, no debounce needed at this scale.
const searchQuery = ref('')

const visible = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return allQuotes.filter((item) => {
    if (activeCategory.value && item.category !== activeCategory.value)
      return false
    if (!q) return true
    const haystack = [
      item.title,
      item.text,
      item.author,
      item.work || '',
      item.context || '',
      item.note || ''
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(q)
  })
})
</script>

<template>
  <div class="dl-quotes">
    <div class="dl-quotes-searchbar">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="Search quotes, authors, works…"
        class="dl-quotes-search"
        aria-label="Search quotes"
      />
      <span class="dl-quotes-count"
        >{{ visible.length }} / {{ allQuotes.length }}</span
      >
    </div>

    <nav
      v-if="allCategories.length"
      class="dl-quotes-cats"
      aria-label="Filter quotes by category"
    >
      <button
        class="dl-quotes-cat-btn"
        :class="{ 'is-active': !activeCategory }"
        @click="activeCategory = ''"
      >
        all
      </button>
      <button
        v-for="cat in allCategories"
        :key="cat"
        class="dl-quotes-cat-btn"
        :class="{ 'is-active': activeCategory === cat }"
        @click="activeCategory = activeCategory === cat ? '' : cat"
      >
        {{ cat }}
      </button>
    </nav>
    <style scoped>
      .dl-quotes {
        margin-top: 1.5rem;
      }
      .dl-quotes-searchbar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .dl-quotes-search {
        flex: 1;
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.88rem;
        color: var(--vp-c-text-1);
        background: var(--vp-c-bg-soft-up, rgba(255, 255, 255, 0.03));
        border: 1px solid var(--vp-c-divider, #333);
        border-radius: 4px;
        padding: 0.5rem 0.75rem;
        outline: none;
        transition: border-color 0.15s;
      }
      .dl-quotes-search:focus {
        border-color: var(--vp-c-brand-1, #5fb878);
      }
      .dl-quotes-search::placeholder {
        color: var(--vp-c-text-3);
      }
      .dl-quotes-count {
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.72rem;
        color: var(--vp-c-text-3);
        white-space: nowrap;
      }
      .dl-quotes-cats {
        display: flex;
        flex-wrap: wrap;
        gap: 0.4rem;
        margin-bottom: 1.25rem;
        padding-bottom: 0.75rem;
        border-bottom: 1px solid var(--vp-c-divider);
      }
      .dl-quotes-cat-btn {
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.72rem;
        color: var(--vp-c-text-3);
        background: transparent;
        border: 1px solid var(--vp-c-divider);
        border-radius: 3px;
        padding: 0.1rem 0.5rem;
        cursor: pointer;
        transition:
          color 0.15s,
          border-color 0.15s,
          background 0.15s;
      }
      .dl-quotes-cat-btn:hover {
        color: var(--vp-c-text-1);
        border-color: var(--vp-c-text-3);
      }
      .dl-quotes-cat-btn.is-active {
        color: var(--vp-c-brand-1);
        border-color: var(--vp-c-brand-1);
        background: var(--vp-c-brand-soft, rgba(52, 81, 178, 0.08));
      }
      .dl-quotes-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
        gap: 1rem;
      }
      .dl-quote-card {
        position: relative;
        display: flex;
        flex-direction: column;
        padding: 1.1rem 1.25rem;
        border-radius: 8px;
        background: var(--vp-c-bg-soft-up, rgba(255, 255, 255, 0.03));
        border: 1px solid var(--vp-c-divider, #333);
        transition:
          border-color 0.15s ease,
          transform 0.15s ease;
      }
      .dl-quote-card:hover {
        border-color: var(--vp-c-brand-1, #5fb878);
        transform: translateY(-1px);
      }
      .dl-quote-card-text {
        margin: 0;
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.88rem;
        line-height: 1.55;
        color: var(--vp-c-text-1);
        text-decoration: none;
      }
      .dl-quote-card-text:hover {
        color: var(--vp-c-brand-1);
      }
      .dl-quote-card-meta {
        margin-top: 0.6rem;
        display: flex;
        align-items: baseline;
        gap: 0.5rem;
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.76rem;
      }
      .dl-quote-card-author {
        color: var(--vp-c-text-2);
        text-decoration: none;
      }
      .dl-quote-card-author:hover {
        color: var(--vp-c-brand-1);
        text-decoration: underline;
      }
      .dl-quote-card-circa {
        color: var(--vp-c-text-3);
        font-size: 0.7rem;
      }
      .dl-quote-card-cat {
        position: absolute;
        top: 0.5rem;
        right: 0.6rem;
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.62rem;
        text-transform: lowercase;
        letter-spacing: 0.04em;
        color: var(--vp-c-text-3);
        text-decoration: none;
        opacity: 0.6;
      }
      .dl-quote-card-cat:hover {
        color: var(--vp-c-brand-1);
        opacity: 1;
      }
      .dl-quotes-empty {
        color: var(--vp-c-text-2);
        font-family: var(--dl-mono, ui-monospace, monospace);
        font-size: 0.9rem;
      }
    </style>

    <div v-if="visible.length" class="dl-quotes-grid">
      <article v-for="q in visible" :key="q.url" class="dl-quote-card">
        <a :href="q.url" class="dl-quote-card-text" :title="q.title"
          ><blockquote>{{ q.text }}</blockquote></a
        >
        <figcaption class="dl-quote-card-meta">
          <a :href="q.authorUrl" class="dl-quote-card-author"
            >— {{ q.author }}</a
          >
          <span v-if="q.circa !== undefined" class="dl-quote-card-circa">{{
            q.circa
          }}</span>
        </figcaption>
        <a :href="q.categoryUrl" class="dl-quote-card-cat">{{ q.category }}</a>
      </article>
    </div>

    <p v-else class="dl-quotes-empty">No quotes match "{{ searchQuery }}".</p>
  </div>
</template>
