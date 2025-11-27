<script setup lang="ts">
const emit = defineEmits<{
  'insert': [type: string]
}>()

const componentGroups = [
  {
    title: 'Navigation',
    icon: 'tabler:navigation',
    components: [
      { type: 'grid', label: 'Grid', icon: 'tabler:grid', description: 'Arrange content in responsive grid' },
      { type: 'button', label: 'Button', icon: 'tabler:square', description: 'Clickable button with custom styling' }
    ]
  },
  {
    title: 'Content',
    icon: 'tabler:file-text',
    components: [
      { type: 'image', label: 'Image', icon: 'tabler:photo', description: 'Upload images with alt text' },
      { type: 'video', label: 'Video', icon: 'tabler:video', description: 'Embed videos from URL' }
    ]
  },
  {
    title: 'Validation',
    icon: 'tabler:help-circle',
    components: [
      { type: 'quiz', label: 'Quiz', icon: 'tabler:help-circle', description: 'Multiple choice questions' },
      { type: 'confirm', label: 'Confirm', icon: 'tabler:circle-check', description: 'Require user acknowledgment' }
    ]
  }
]
</script>

<template>
  <div class="component-palette h-full overflow-y-auto p-4 space-y-6">
    <div>
      <h3 class="text-sm font-semibold mb-3">Components</h3>
      <p class="text-xs text-muted mb-4">Click to add components to your page</p>
    </div>

    <div v-for="group in componentGroups" :key="group.title" class="space-y-2">
      <div class="flex items-center gap-2 mb-3">
        <UIcon :name="group.icon" class="size-4 text-muted" />
        <h4 class="text-xs font-semibold uppercase text-muted">{{ group.title }}</h4>
      </div>

      <div class="flex gap-2">
      <button
        v-for="component in group.components"
        :key="component.type"
        class="w-full p-3 rounded-lg border border-default hover:border-primary hover:bg-muted/20 transition-colors text-left group"
        @click="emit('insert', component.type)"
      >
        <div class="flex flex-col items-center justify-center gap-3">
          <div class="p-2 rounded-lg">
            <UIcon :name="component.icon" class="size-5 text-primary-500" />
          </div>
          <div class="flex-1 text-center">
            <p class="font-medium text-sm mb-1">{{ component.label }}</p>
          </div>
        </div>
      </button>
    </div>
    </div>

    <div class="pt-4 border-t border-default">
      <h4 class="text-xs font-semibold uppercase text-muted mb-3">Text Formatting</h4>
      <p class="text-xs text-muted">
        Use the rich text editor to format text with headings, bold, italic, lists, and more.
      </p>
    </div>
  </div>
</template>

