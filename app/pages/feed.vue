<script setup lang="ts">
/**
 * Employee Feed Page - Shows all published pages with filtering
 */

definePageMeta({
  layout: 'employee',
  middleware: 'auth'
})

const { company } = useCompany()

// Pagination state
const page = ref(1)
const limit = 20
const offset = computed(() => (page.value - 1) * limit)

// Fetch the feed
const { data: feed, pending, error, refresh } = await useFetch('/api/employee/feed', {
  query: computed(() => ({
    limit,
    offset: offset.value
  }))
})

// Filter state
const filter = ref<'all' | 'unread'>('all')

const filteredFeed = computed(() => {
  if (!feed.value) return []
  if (filter.value === 'unread') {
    return feed.value.filter(p => !p.hasViewed)
  }
  return feed.value
})

const unreadCount = computed(() => {
  if (!feed.value) return 0
  return feed.value.filter(p => !p.hasViewed).length
})
</script>

<template>
  <UDashboardPanel id="employee-feed">
    <template #header>
      <UDashboardNavbar title="Feed" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButtonGroup>
            <UButton
              label="All"
              :variant="filter === 'all' ? 'solid' : 'ghost'"
              size="sm"
              @click="filter = 'all'"
            />
            <UButton
              :variant="filter === 'unread' ? 'solid' : 'ghost'"
              size="sm"
              @click="filter = 'unread'"
            >
              Unread
              <UBadge v-if="unreadCount > 0" color="error" size="xs" class="ml-1">
                {{ unreadCount }}
              </UBadge>
            </UButton>
          </UButtonGroup>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto">
        <!-- Loading State -->
        <div v-if="pending" class="space-y-4">
          <UCard v-for="i in 5" :key="i">
            <div class="space-y-3">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <USkeleton class="h-6 w-3/4 mb-2" />
                  <USkeleton class="h-4 w-1/2" />
                </div>
                <USkeleton class="h-5 w-12" />
              </div>
              <USkeleton class="h-4 w-full" />
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
        <UCard v-else-if="filteredFeed.length === 0" class="text-center py-12">
          <div class="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-4">
            <UIcon 
              :name="filter === 'unread' ? 'i-lucide-check-circle' : 'i-lucide-newspaper'" 
              class="size-12 text-muted" 
            />
          </div>
          <h3 class="text-xl font-semibold mb-2">
            {{ filter === 'unread' ? 'All caught up!' : 'No pages yet' }}
          </h3>
          <p class="text-muted max-w-md mx-auto">
            {{ filter === 'unread' 
              ? 'You\'ve read all the latest updates. Check back later for new content.' 
              : 'When your company publishes new content, it will appear here.'
            }}
          </p>
          <UButton 
            v-if="filter === 'unread'" 
            label="View All" 
            variant="ghost" 
            class="mt-4"
            @click="filter = 'all'"
          />
        </UCard>

        <!-- Feed -->
        <div v-else class="space-y-4">
          <ViewerPageCard 
            v-for="pageItem in filteredFeed" 
            :key="pageItem.id" 
            :page="pageItem" 
          />

          <!-- Load More -->
          <div v-if="feed && feed.length >= limit" class="text-center pt-4">
            <UButton
              label="Load More"
              variant="ghost"
              @click="page++"
            />
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

