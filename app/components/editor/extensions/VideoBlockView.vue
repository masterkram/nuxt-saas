<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}>()

const isEditing = ref(false)
const videoUrl = ref(props.node.attrs.src || '')
const caption = ref(props.node.attrs.caption || '')

function saveVideo() {
  props.updateAttributes({
    src: videoUrl.value,
    caption: caption.value
  })
  isEditing.value = false
}

function getEmbedUrl(url: string) {
  // Convert YouTube URLs to embed format
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]
    return `https://www.youtube.com/embed/${videoId}`
  }
  // Convert Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]
    return `https://player.vimeo.com/video/${videoId}`
  }
  return url
}
</script>

<template>
  <NodeViewWrapper class="video-block" :class="{ 'ring-2 ring-primary': selected }">
    <div v-if="!node.attrs.src || isEditing" class="space-y-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-video" class="size-5 text-primary" />
        <h4 class="font-semibold">Video Block</h4>
      </div>
      
      <UFormGroup label="Video URL" help="YouTube, Vimeo, or direct video URL">
        <UInput v-model="videoUrl" placeholder="https://youtube.com/watch?v=..." />
      </UFormGroup>

      <UFormGroup label="Caption (optional)">
        <UInput v-model="caption" placeholder="Video caption" />
      </UFormGroup>

      <div class="flex gap-2">
        <UButton label="Save" @click="saveVideo" size="sm" />
        <UButton label="Delete" color="error" variant="outline" @click="deleteNode" size="sm" />
      </div>
    </div>

    <div v-else class="space-y-2">
      <div class="aspect-video">
        <iframe
          :src="getEmbedUrl(node.attrs.src)"
          class="w-full h-full rounded-lg"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
        />
      </div>
      <p v-if="node.attrs.caption" class="text-sm text-center text-muted">{{ node.attrs.caption }}</p>
      <div class="flex gap-2 justify-center">
        <UButton label="Edit" icon="i-lucide-pencil" size="xs" variant="ghost" @click="isEditing = true" />
        <UButton label="Delete" icon="i-lucide-trash" size="xs" variant="ghost" color="error" @click="deleteNode" />
      </div>
    </div>
  </NodeViewWrapper>
</template>

