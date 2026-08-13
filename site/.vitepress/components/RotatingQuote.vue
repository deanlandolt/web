<script setup lang="ts">
import { ref } from 'vue'
import quotes from '../data/quotes.generated.json'

// Pick a random quote once at load — no cycling.
const current = ref(quotes[Math.floor(Math.random() * quotes.length)])
</script>

<template>
  <div class="dl-quote-wrap">
    <blockquote class="dl-quote">
      {{ current.text
      }}<a
        class="dl-quote-dagger"
        :href="current.source"
        target="_blank"
        rel="noopener"
        title="Verify this attribution"
        >†</a
      >
    </blockquote>
    <div class="dl-quote-author">— {{ current.author }}</div>
  </div>
</template>
