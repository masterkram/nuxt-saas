<script setup lang="ts">
const props = defineProps<{
  attrs: {
    label?: string
    url?: string
    color?: string
    variant?: string
    size?: string
    alignment?: string
  }
}>()

const alignmentClass = computed(() => {
  const alignments: Record<string, string> = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  }
  return alignments[props.attrs.alignment || 'left'] || alignments.left
})
</script>

<template>
  <div :class="['flex my-4', alignmentClass]">
    <UButton
      :label="attrs.label || 'Button'"
      :color="(attrs.color as any) || 'primary'"
      :variant="(attrs.variant as any) || 'solid'"
      :size="(attrs.size as any) || 'md'"
      :to="attrs.url"
      target="_blank"
    />
  </div>
</template>

