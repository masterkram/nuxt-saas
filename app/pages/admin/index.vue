<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const items = [[{
  label: 'New Page',
  icon: 'i-lucide-file-plus',
  to: '/admin/pages/create'
}, {
  label: 'New Group',
  icon: 'i-lucide-user-plus',
  to: '/admin/groups/create'
}]] satisfies DropdownMenuItem[][]

// Get current company
const { company } = useCompany()

// Fetch dashboard stats
const { data: statsData, pending: statsPending } = await useFetch('/api/dashboard/stats', {
  query: {
    companyId: company.value?.id
  }
})

// Computed stats array
const stats = computed(() => {
  if (!statsData.value) {
    return []
  }

  const formatChange = (value: number) => {
    const sign = value >= 0 ? '+' : ''
    return `${sign}${value}%`
  }

  return [
    {
      label: 'Total Pages',
      value: statsData.value.totalPages.value.toString(),
      icon: 'i-lucide-file-text',
      change: formatChange(statsData.value.totalPages.change),
      changeType: statsData.value.totalPages.changeType
    },
    {
      label: 'Active Employees',
      value: statsData.value.activeEmployees.value.toLocaleString(),
      icon: 'i-lucide-users',
      change: formatChange(statsData.value.activeEmployees.change),
      changeType: statsData.value.activeEmployees.changeType
    },
    {
      label: 'Engagement Rate',
      value: `${statsData.value.engagementRate.value}%`,
      icon: 'i-lucide-trending-up',
      change: formatChange(statsData.value.engagementRate.change),
      changeType: statsData.value.engagementRate.changeType
    },
    {
      label: 'Avg. View Time',
      value: statsData.value.avgViewTime.value,
      icon: 'i-lucide-clock',
      change: formatChange(statsData.value.avgViewTime.change),
      changeType: statsData.value.avgViewTime.changeType
    }
  ]
})

// Fetch recent pages
const { data: recentPages, pending: pagesPending } = await useFetch('/api/dashboard/recent-pages', {
  query: {
    companyId: company.value?.id,
    limit: 5
  }
})

const NuxtLink = resolveComponent('NuxtLink')
const UBadge = resolveComponent('UBadge')

const formatDate = (date: string | null) => {
  if (!date) return 'Not published'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const columns = [{
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    return h(NuxtLink, {
      href: `/admin/pages/${row.original.id}/edit`,
      class: 'hover:underline'
    }, () => row.getValue('title'))
  }
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const status = row.getValue('status') as string
    return h(UBadge, {
      color: status === 'published' ? 'success' : 'neutral',
      variant: 'subtle'
    }, () => status)
  }
}, {
  accessorKey: 'views',
  header: 'Views',
}, {
  accessorKey: 'engagement',
  header: 'Engagement'
}, {
  accessorKey: 'publishedAt',
  header: 'Published',
  cell: ({ row }) => {
    return formatDate(row.getValue('publishedAt'))
  }
}]

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="Dashboard" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UDropdownMenu :items="items">
            <UButton icon="i-lucide-plus" size="md" class="rounded-full" />
          </UDropdownMenu>
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <!-- Stats Grid -->
      <div class="grid gap-4 lg:grid-cols-4 mb-8">
        <UCard v-for="i in 4" v-if="statsPending" :key="i" class="ring-1 ring-default">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <USkeleton class="h-4 w-24 mb-2" />
              <USkeleton class="h-8 w-16 mb-2" />
              <USkeleton class="h-4 w-32" />
            </div>
            <USkeleton class="size-12 rounded-lg" />
          </div>
        </UCard>
        <UCard v-for="stat in stats" v-else :key="stat.label" class="ring-1 ring-default">
          <div class="flex items-start justify-between">
            <div>
              <p class="text-sm text-muted">{{ stat.label }}</p>
              <p class="text-3xl font-semibold mt-2">{{ stat.value }}</p>
              <p class="text-sm mt-2" :class="stat.changeType === 'positive' ? 'text-success' : 'text-error'">
                {{ stat.change }} from last month
              </p>
            </div>
            <div class="p-3 rounded-lg" :class="stat.changeType === 'positive' ? 'bg-success/10' : 'bg-error/10'">
              <UIcon :name="stat.icon" class="size-6" :class="stat.changeType === 'positive' ? 'text-success' : 'text-error'" />
            </div>
          </div>
        </UCard>
      </div>

      <!-- Quick Actions -->
      <div class="grid gap-4 lg:grid-cols-3 mb-8">
        <UCard class="ring-1 ring-default">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-1">Create New Page</h3>
              <p class="text-sm text-muted">Start building engaging content</p>
            </div>
            <UButton
              icon="i-lucide-arrow-right"
              color="primary"
              to="/admin/pages/create"
            />
          </div>
        </UCard>

        <UCard class="ring-1 ring-default">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-1">Manage Groups</h3>
              <p class="text-sm text-muted">Organize your employees</p>
            </div>
            <UButton
              icon="i-lucide-arrow-right"
              color="primary"
              variant="outline"
              to="/admin/groups"
            />
          </div>
        </UCard>

        <UCard class="ring-1 ring-default">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-semibold mb-1">View Analytics</h3>
              <p class="text-sm text-muted">Track engagement metrics</p>
            </div>
            <UButton
              icon="i-lucide-arrow-right"
              color="primary"
              variant="outline"
              to="/admin/analytics"
            />
          </div>
        </UCard>
      </div>

      <!-- Recent Pages -->
      <UCard class="ring-1 ring-default">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Recent Pages</h3>
            <UButton
              label="View All"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
              to="/admin/pages"
            />
          </div>
        </template>

        <div v-if="pagesPending" class="space-y-4 p-4">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4">
            <USkeleton class="h-4 w-48" />
            <USkeleton class="h-4 w-20" />
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-4 w-24" />
          </div>
        </div>
        <div v-else-if="!recentPages || recentPages.length === 0" class="p-8 text-center">
          <p class="text-muted">No pages yet. Create your first page to get started!</p>
          <UButton
            label="Create Page"
            icon="i-lucide-plus"
            color="primary"
            class="mt-4"
            to="/admin/pages/create"
          />
        </div>
        <UTable v-else :columns="columns" :data="recentPages" />

      </UCard>
    </template>
  </UDashboardPanel>
</template>
