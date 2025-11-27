<script setup lang="ts">
import { sub } from 'date-fns'

// TODO: Fetch real analytics data from API
const stats = ref([
  {
    label: 'Total Views',
    value: '12,456',
    change: '+18%',
    changeType: 'positive'
  },
  {
    label: 'Unique Viewers',
    value: '1,234',
    change: '+12%',
    changeType: 'positive'
  },
  {
    label: 'Avg. Engagement',
    value: '78%',
    change: '+5%',
    changeType: 'positive'
  },
  {
    label: 'Completion Rate',
    value: '82%',
    change: '-3%',
    changeType: 'negative'
  }
])

const topPages = ref([
  {
    id: 1,
    title: 'Company Values Update',
    views: 856,
    engagement: 72,
    completions: 680
  },
  {
    id: 2,
    title: 'Q4 Goals & Objectives',
    views: 642,
    engagement: 65,
    completions: 510
  },
  {
    id: 3,
    title: 'Benefits Package Info',
    views: 534,
    engagement: 80,
    completions: 445
  },
  {
    id: 4,
    title: 'Safety Training Module',
    views: 423,
    engagement: 92,
    completions: 398
  },
  {
    id: 5,
    title: 'Holiday Schedule',
    views: 312,
    engagement: 45,
    completions: 156
  }
])

const NuxtLink = resolveComponent('NuxtLink')
const UBadge = resolveComponent('UBadge')
const span = resolveComponent('span')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')

const columns = [{
  accessorKey: 'title',
  header: 'Page Title',
  cell: ({ row }) => {
    return h(NuxtLink, {
      href: `/pages/${row.getValue('id')}/analytics`,
      class: 'hover:underline'
    }, row.getValue('title'))
  }
}, {
  accessorKey: 'views',
  header: 'Views',
  cell: ({ row }) => {
    return h(span, {
      class: 'text-sm text-muted'
    }, row.getValue('views').toLocaleString())
  }
}, {
  accessorKey: 'engagement',
  header: 'Engagement',
  cell: ({ row }) => {
    return h(span, {
      class: 'text-sm text-muted'
    }, row.getValue('engagement').toLocaleString())
  }
}, {
  accessorKey: 'completions',
  header: 'Completions',
  cell: ({ row }) => {
    return h(span, {
      class: 'text-sm text-muted'
    }, row.getValue('completions').toLocaleString())
  }
}]
</script>

<template>
  <UDashboardPanel id="analytics">
    <template #header>
      <UDashboardNavbar title="Analytics">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Export"
            icon="i-lucide-download"
            color="neutral"
            variant="outline"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <span class="text-sm font-medium">Last 30 Days</span>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <!-- Stats Grid -->
      <div class="grid gap-4 lg:grid-cols-4 mb-8">
        <UCard v-for="stat in stats" :key="stat.label" class="ring-1 ring-default">
          <div>
            <p class="text-sm text-muted">{{ stat.label }}</p>
            <p class="text-3xl font-semibold mt-2">{{ stat.value }}</p>
            <p class="text-sm mt-2" :class="stat.changeType === 'positive' ? 'text-success' : 'text-error'">
              {{ stat.change }} from last period
            </p>
          </div>
        </UCard>
      </div>

      <!-- Chart Placeholder -->
      <UCard class="ring-1 ring-default mb-8">
        <template #header>
          <h3 class="text-lg font-semibold">Views Over Time</h3>
        </template>

        <div class="flex items-center justify-center py-16">
          <div class="text-center">
            <UIcon name="i-lucide-bar-chart-2" class="size-16 text-muted mb-4" />
            <p class="text-lg font-semibold mb-2">Chart Coming Soon</p>
            <p class="text-sm text-muted">Interactive analytics charts will be implemented here</p>
          </div>
        </div>
      </UCard>

      <!-- Top Pages -->
      <UCard class="ring-1 ring-default">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Top Performing Pages</h3>
          </div>
        </template>

        <UTable :columns="columns" :data="topPages" />

      </UCard>
    </template>
  </UDashboardPanel>
</template>

