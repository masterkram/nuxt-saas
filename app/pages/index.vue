<script setup lang="ts">
import { sub } from 'date-fns'
import type { DropdownMenuItem } from '@nuxt/ui'

const items = [[{
  label: 'New Page',
  icon: 'i-lucide-file-plus',
  to: '/pages/create'
}, {
  label: 'New Group',
  icon: 'i-lucide-user-plus',
  to: '/groups/create'
}]] satisfies DropdownMenuItem[][]

// TODO: Fetch real stats from API
const stats = ref([
  {
    label: 'Total Pages',
    value: '24',
    icon: 'i-lucide-file-text',
    change: '+12%',
    changeType: 'positive'
  },
  {
    label: 'Active Employees',
    value: '1,234',
    icon: 'i-lucide-users',
    change: '+5%',
    changeType: 'positive'
  },
  {
    label: 'Engagement Rate',
    value: '78%',
    icon: 'i-lucide-trending-up',
    change: '+3%',
    changeType: 'positive'
  },
  {
    label: 'Avg. View Time',
    value: '3m 45s',
    icon: 'i-lucide-clock',
    change: '-2%',
    changeType: 'negative'
  }
])

// TODO: Fetch recent pages from API
const recentPages = ref([
  {
    id: 1,
    title: 'Company Values Update',
    status: 'published',
    views: 856,
    engagement: 72,
    publishedAt: new Date(2025, 10, 20)
  },
  {
    id: 2,
    title: 'Q4 Goals & Objectives',
    status: 'published',
    views: 642,
    engagement: 65,
    publishedAt: new Date(2025, 10, 18)
  },
  {
    id: 3,
    title: 'New Benefits Package',
    status: 'draft',
    views: 0,
    engagement: 0,
    publishedAt: null
  }
])

const NuxtLink = resolveComponent('NuxtLink')
const UBadge = resolveComponent('UBadge')

const columns = [{
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    return h(NuxtLink, {
      href: `/pages/${row.getValue('id')}`,
      class: 'hover:underline'
    }, row.getValue('title'))
  }
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    return h(UBadge, {
      color: row.getValue('status') === 'published' ? 'success' : 'neutral',
      variant: 'subtle'
    }, row.getValue('status'))
  }
}, {
  accessorKey: 'views',
  header: 'Views',
}, {
  accessorKey: 'engagement',
  header: 'Engagement'
}, {
  accessorKey: 'publishedAt',
  header: 'Published'
}]
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
        <UCard v-for="stat in stats" :key="stat.label" class="ring-1 ring-default">
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
              to="/pages/create"
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
              to="/groups"
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
              to="/analytics"
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
              to="/pages"
            />
          </div>
        </template>

        <UTable :columns="columns" :data="recentPages" />

      </UCard>
    </template>
  </UDashboardPanel>
</template>
