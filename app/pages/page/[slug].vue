<script setup lang="ts">
/**
 * Page Viewer - Displays a published page to employees
 */

definePageMeta({
  layout: 'employee',
  middleware: 'auth'
})

const route = useRoute()
const slug = route.params.slug as string

const { data: page, pending, error, refresh } = await useFetch(`/api/employee/pages/${slug}`)

// Track page view when component mounts
const viewStartTime = ref<number | null>(null)

onMounted(() => {
  viewStartTime.value = Date.now()
  
  // Record initial view
  $fetch(`/api/employee/pages/${slug}/view`, {
    method: 'POST',
    body: {}
  }).catch(console.error)
})

// Track view duration when leaving
onBeforeUnmount(() => {
  if (viewStartTime.value) {
    const durationSeconds = Math.floor((Date.now() - viewStartTime.value) / 1000)
    if (durationSeconds > 0) {
      $fetch(`/api/employee/pages/${slug}/view`, {
        method: 'POST',
        body: { durationSeconds }
      }).catch(console.error)
    }
  }
})

// Update reaction locally when user reacts
function handleReactionUpdate(newReaction: string | null) {
  if (page.value) {
    page.value.userReaction = newReaction
  }
}

// Handle validation completion
function handleValidationComplete(validationType: string, response: any) {
  // Refresh page data to update validation status
  refresh()
}
</script>

<template>
  <UDashboardPanel id="page-viewer">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            icon="i-lucide-arrow-left"
            variant="ghost"
            to="/"
            class="mr-2"
          />
        </template>

        <template #title>
          <span v-if="page" class="line-clamp-1">{{ page.title }}</span>
        </template>

        <template #right>
          <UButton
            v-if="page?.socialEnabled?.share"
            icon="i-lucide-share"
            variant="ghost"
            label="Share"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto">
        <!-- Loading State -->
        <div v-if="pending" class="space-y-6">
          <USkeleton class="h-10 w-2/3" />
          <USkeleton class="h-4 w-1/3" />
          <div class="space-y-4">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>
          <USkeleton class="h-64 w-full rounded-lg" />
          <div class="space-y-4">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-1/2" />
          </div>
        </div>

        <!-- Error State -->
        <UCard v-else-if="error" class="text-center py-12">
          <UIcon name="i-lucide-alert-circle" class="size-16 text-error mx-auto mb-4" />
          <h2 class="text-xl font-semibold mb-2">
            {{ error.statusCode === 404 ? 'Page Not Found' : 'Error Loading Page' }}
          </h2>
          <p class="text-muted mb-6">
            {{ error.statusCode === 404 
              ? 'This page doesn\'t exist or you don\'t have access to it.' 
              : error.message 
            }}
          </p>
          <UButton label="Go Back Home" to="/" />
        </UCard>

        <!-- Page Content -->
        <article v-else-if="page" class="space-y-8">
          <!-- Header -->
          <header class="space-y-4">
            <h1 class="text-3xl md:text-4xl font-bold leading-tight">
              {{ page.title }}
            </h1>
            <div class="flex items-center gap-4 text-sm text-muted">
              <span>By {{ page.author }}</span>
              <span>·</span>
              <span>{{ new Date(page.publishedAt!).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              }) }}</span>
            </div>
          </header>

          <!-- Divider -->
          <hr class="border-default" />

          <!-- Content -->
          <ViewerPageViewer 
            :content="page.content" 
            :page-slug="slug"
            :validations="page.validations"
            @validation-complete="handleValidationComplete"
          />

          <!-- Social Section -->
          <div v-if="page.socialEnabled?.reactions || page.socialEnabled?.comments" class="pt-8 border-t border-default space-y-8">
            <!-- Reactions -->
            <ViewerPageReactions
              v-if="page.socialEnabled?.reactions"
              :page-slug="slug"
              :reactions="page.stats.reactions"
              :total-reactions="page.stats.totalReactions"
              :user-reaction="page.userReaction"
              :enabled="true"
              @update="handleReactionUpdate"
            />

            <!-- Comments -->
            <ViewerPageComments
              v-if="page.socialEnabled?.comments"
              :page-slug="slug"
              :comments="page.comments"
              :enabled="true"
              @new-comment="() => refresh()"
            />
          </div>
        </article>
      </div>
    </template>
  </UDashboardPanel>
</template>

