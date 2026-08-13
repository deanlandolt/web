<script setup lang="ts">
// QuoteRef — a "wikilink for quotes." Drop this in any note to pull in a quote
// from the quotes collection by its slug (the URL fragment on /quotes/<slug>).
//
// Usage in markdown:
//   <QuoteRef slug="the-mind-is-not-a-vessel" />
//
// The quote renders as a blockquote with the text, an em-dash attribution
// linking to the quote's dedicated page, and a discreet dagger (†) linking
// to the source URL for attribution verification.
//
// If the slug isn't found, a fallback message renders so broken refs are
// visible during dev (rather than silently empty).

import { computed } from 'vue'
import quotes from '../data/quotes.generated.json'

interface QuoteEntry {
  slug: string
  url: string
  text: string
  author: string
  source: string
  category: string
}

const props = defineProps<{ slug: string }>()

const quote = computed<QuoteEntry | undefined>(() =>
  (quotes as QuoteEntry[]).find((q) => q.slug === props.slug)
)
</script>

<template>
  <blockquote v-if="quote" class="dl-quote-ref">
    <p>{{ quote.text }}</p>
    <cite>
      — <a :href="quote.url">{{ quote.author }}</a
      ><a
        class="dl-quote-ref-dagger"
        :href="quote.source"
        target="_blank"
        rel="noopener"
        title="Verify this attribution"
        >†</a
      >
    </cite>
  </blockquote>
  <p v-else class="dl-quote-ref-missing">
    <em
      >Quote not found: <code>{{ slug }}</code></em
    >
  </p>
</template>

<style scoped>
.dl-quote-ref {
  margin: 1.25rem 0;
  padding: 0.5rem 0 0.5rem 1rem;
  border-left: 2px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}
.dl-quote-ref p {
  margin: 0 0 0.35rem 0;
  font-style: italic;
}
.dl-quote-ref cite {
  font-style: normal;
  font-size: 0.9em;
  color: var(--vp-c-text-3);
}
.dl-quote-ref cite a {
  color: var(--vp-c-text-2);
  text-decoration: none;
}
.dl-quote-ref cite a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
}
.dl-quote-ref-dagger {
  margin-left: 0.2em;
  color: var(--vp-c-text-3);
  text-decoration: none;
}
.dl-quote-ref-dagger:hover {
  color: var(--vp-c-brand-1);
}
.dl-quote-ref-missing {
  margin: 1.25rem 0;
  padding: 0.5rem 1rem;
  border: 1px dashed var(--vp-c-divider);
  border-radius: 4px;
  color: var(--vp-c-text-3);
}
</style>
