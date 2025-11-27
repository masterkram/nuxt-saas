<script setup lang="ts">
/**
 * Employee Home Page - Shows the feed of published pages
 */

definePageMeta({
  layout: 'employee',
  middleware: 'auth'
})

const user = useUser()
const { company } = useCompany()

// Fetch the feed
const { data: feed, pending, error, refresh } = await useFetch('/api/employee/feed', {
  query: {
    limit: 20
  }
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
})

const displayName = computed(() => {
  if (user.value?.firstName) {
    return user.value.firstName
  }
  return 'there'
})
</script>

<template>
  <UDashboardPanel id="employee-home">
    <template #header>
      <UDashboardNavbar :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #title>
          <div>
            <h1 class="text-lg font-semibold">{{ greeting }}, {{ displayName }}!</h1>
            <p class="text-sm text-muted">Here's what's new at {{ company?.name || 'your company' }}</p>
          </div>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto">
        <!-- Loading State -->
        <div v-if="pending" class="space-y-4">
          <UCard v-for="i in 3" :key="i">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <USkeleton class="h-6 w-3/4 mb-2" />
                  <USkeleton class="h-4 w-1/2" />
                </div>
                <USkeleton class="h-5 w-12" />
              </div>
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-2/3" />
              <div class="flex gap-4">
                <USkeleton class="h-4 w-16" />
                <USkeleton class="h-4 w-16" />
                <USkeleton class="h-4 w-16" />
              </div>
            </div>
          </UCard>
        </div>

        <!-- Error State -->
        <UCard v-else-if="error" class="text-center py-8">
          <UIcon name="i-lucide-alert-circle" class="size-12 text-error mx-auto mb-4" />
          <h3 class="font-semibold mb-2">Failed to load feed</h3>
          <p class="text-muted mb-4">{{ error.message }}</p>
          <UButton label="Try Again" @click="refresh()" />
        </UCard>

        <!-- Empty State -->
        <UCard v-else-if="!feed || feed.length === 0" class="text-center py-12">
          <div class="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-4">
            <UIcon name="i-lucide-newspaper" class="size-12 text-muted" />
          </div>
          <h3 class="text-xl font-semibold mb-2">No pages yet</h3>
          <p class="text-muted max-w-md mx-auto">
            When your company publishes new content, it will appear here. Check back soon!
          </p>
        </UCard>

        <!-- Feed -->
        <div v-else class="space-y-4">
          <ViewerPageCard 
            v-for="page in feed" 
            :key="page.id" 
            :page="page" 
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

