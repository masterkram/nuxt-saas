<script setup lang="ts">
const props = defineProps<{
  attrs: {
    columns?: number
    gap?: number
    items?: Array<{
      id: string
      title: string
      content: string
    }>
  }
}>()

const gridClass = computed(() => {
  const cols = props.attrs.columns || 2
  const gap = props.attrs.gap || 4
  return `grid-cols-1 md:grid-cols-${cols} gap-${gap}`
})
</script>

<template>
  <div :class="['grid my-6', gridClass]">
    <div 
      v-for="item in (attrs.items || [])" 
      :key="item.id" 
      class="p-4 border border-default rounded-lg bg-elevated/30"
    >
      <h4 class="font-semibold mb-2">{{ item.title }}</h4>
      <p class="text-sm text-muted">{{ item.content }}</p>
    </div>
  </div>
</template>

