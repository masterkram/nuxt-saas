<script setup lang="ts">
const props = defineProps<{
  attrs: {
    src?: string
    alt?: string
    caption?: string
  }
}>()
</script>

<template>
  <figure v-if="attrs.src" class="my-6">
    <img 
      :src="attrs.src" 
      :alt="attrs.alt || ''" 
      class="w-full rounded-lg shadow-sm"
    />
    <figcaption 
      v-if="attrs.caption" 
      class="text-sm text-center text-muted mt-2"
    >
      {{ attrs.caption }}
    </figcaption>
  </figure>
</template>

