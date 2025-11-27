<script setup lang="ts">
const props = defineProps<{
  page: {
    id: string
    title: string
    slug: string
    preview?: string
    publishedAt: string | null
    author: string
    hasViewed: boolean
    stats: {
      views: number
      reactions: number
      comments: number
    }
    userReaction?: string | null
  }
}>()

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffHours < 24) {
    if (diffHours < 1) return 'Just now'
    return `${diffHours}h ago`
  }
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <NuxtLink :to="`/page/${page.slug}`" class="block group">
    <UCard 
      class="transition-all hover:shadow-md hover:border-primary/30"
      :class="{ 'opacity-75': page.hasViewed }"
    >
      <div class="space-y-3">
        <!-- Header -->
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-lg group-hover:text-primary-500 transition-colors line-clamp-2">
              {{ page.title }}
            </h3>
            <p class="text-sm text-muted mt-1">
              By {{ page.author }} · {{ formatDate(page.publishedAt) }}
            </p>
          </div>
          <UBadge v-if="!page.hasViewed" color="primary" variant="soft" size="xs">
            New
          </UBadge>
        </div>

        <!-- Preview -->
        <p v-if="page.preview" class="text-sm text-muted line-clamp-2">
          {{ page.preview }}
        </p>

        <!-- Stats -->
        <div class="flex items-center gap-4 text-sm text-muted">
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-eye" class="size-4" />
            <span>{{ page.stats.views }}</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-heart" class="size-4" />
            <span>{{ page.stats.reactions }}</span>
          </div>
          <div class="flex items-center gap-1">
            <UIcon name="i-lucide-message-circle" class="size-4" />
            <span>{{ page.stats.comments }}</span>
          </div>
        </div>
      </div>
    </UCard>
  </NuxtLink>
</template>

