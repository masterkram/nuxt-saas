<script setup lang="ts">
const props = defineProps<{
  attrs: {
    src?: string
    caption?: string
  }
}>()

function getEmbedUrl(url: string): string {
  // Convert YouTube URLs to embed format
  if (url.includes('youtube.com/watch')) {
    const videoId = new URL(url).searchParams.get('v')
    return `https://www.youtube.com/embed/${videoId}`
  }
  if (url.includes('youtu.be/')) {
    const videoId = url.split('youtu.be/')[1]?.split('?')[0]
    return `https://www.youtube.com/embed/${videoId}`
  }
  // Convert Vimeo URLs
  if (url.includes('vimeo.com/')) {
    const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
    return `https://player.vimeo.com/video/${videoId}`
  }
  return url
}
</script>

<template>
  <figure v-if="attrs.src" class="my-6">
    <div class="aspect-video rounded-lg overflow-hidden shadow-sm">
      <iframe
        :src="getEmbedUrl(attrs.src)"
        class="w-full h-full"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </div>
    <figcaption 
      v-if="attrs.caption" 
      class="text-sm text-center text-muted mt-2"
    >
      {{ attrs.caption }}
    </figcaption>
  </figure>
</template>

