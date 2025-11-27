<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const search = ref('')
const selectedStatus = ref('all')
const loading = ref(false)
const toast = useToast()

// Get company context from global state
const { companyId } = useCompany()

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Published', value: 'published' },
  { label: 'Draft', value: 'draft' },
  { label: 'Archived', value: 'archived' }
]

const pages = ref<any[]>([])

// Fetch pages from API
async function fetchPages() {
  if (!companyId.value) {
    console.warn('No company selected')
    return
  }

  loading.value = true
  try {
    const data = await $fetch(`/api/pages?companyId=${companyId.value}`)
    pages.value = data.map((page: any) => ({
      id: page.id,
      title: page.title,
      status: page.status,
      views: page.views,
      engagement: page.engagement,
      publishedAt: page.publishedAt ? new Date(page.publishedAt) : null,
      createdBy: page.createdByName,
      content: page.content
    }))
  } catch (error) {
    console.error('Error fetching pages:', error)
    toast.add({
      title: 'Error loading pages',
      description: 'Failed to load pages from the database',
      color: 'error'
    })
  } finally {
    loading.value = false
  }
}

// Delete page
async function deletePage(pageId: string) {
  if (!companyId.value) return

  try {
    await $fetch(`/api/pages/${pageId}?companyId=${companyId.value}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Page deleted',
      description: 'The page has been deleted successfully',
      color: 'success'
    })
    await fetchPages()
  } catch (error) {
    console.error('Error deleting page:', error)
    toast.add({
      title: 'Error deleting page',
      description: 'Failed to delete the page',
      color: 'error'
    })
  }
}

// Archive/Restore page
async function toggleArchive(pageId: string, currentStatus: string) {
  if (!companyId.value) return

  const newStatus = currentStatus === 'archived' ? 'draft' : 'archived'
  try {
    await $fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      body: {
        companyId: companyId.value,
        status: newStatus
      }
    })
    toast.add({
      title: newStatus === 'archived' ? 'Page archived' : 'Page restored',
      description: `The page has been ${newStatus === 'archived' ? 'archived' : 'restored'} successfully`,
      color: 'success'
    })
    await fetchPages()
  } catch (error) {
    console.error('Error updating page:', error)
    toast.add({
      title: 'Error updating page',
      description: 'Failed to update the page status',
      color: 'error'
    })
  }
}

// Load pages on mount and when company changes
onMounted(() => {
  fetchPages()
})

// Watch for company changes and reload pages
watch(companyId, () => {
  fetchPages()
})

const filteredPages = computed(() => {
  let result = pages.value

  if (selectedStatus.value !== 'all') {
    result = result.filter(p => p.status === selectedStatus.value)
  }

  if (search.value) {
    result = result.filter(p => 
      p.title.toLowerCase().includes(search.value.toLowerCase())
    )
  }

  return result
})

const NuxtLink = resolveComponent('NuxtLink')
const UBadge = resolveComponent('UBadge')
const span = resolveComponent('span')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')

const columns = [{
  accessorKey: 'title',
  header: 'Title',
  cell: ({ row }) => {
    return h(NuxtLink, {
      href: `/pages/${row.original.id}`,
      class: 'hover:underline'
    }, () => row.getValue('title'))
  }
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    return h(UBadge, {
      color: row.getValue('status') === 'published' ? 'success' : 'neutral',
      variant: 'subtle'
    }, () => row.getValue('status'))
  }
}, {
  accessorKey: 'views',
  header: 'Views',
  cell: ({ row }) => {
    return h(span, {
      class: 'text-sm text-muted'
    }, () => row.getValue('views').toLocaleString())
  }
}, {
  accessorKey: 'engagement',
  header: 'Engagement',
  cell: ({ row }) => {
    return h(span, {
      class: 'text-sm text-muted'
    }, () => row.getValue('engagement').toLocaleString())
  }
}, {
  accessorKey: 'createdBy',
  header: 'Created By',
  cell: ({ row }) => {
    return h(span, {
      class: 'text-sm text-muted'
    }, () => row.getValue('createdBy'))
  }
}, {
  accessorKey: 'publishedAt',
  header: 'Published',
  cell: ({ row }) => {
    const date = row.getValue('publishedAt')
    return h(span, {
      class: 'text-sm text-muted'
    }, () => date ? new Date(date).toLocaleDateString() : '-')
  }
}, {
  accessorKey: 'actions',
  header: '',
  cell: ({ row }) => {
    return h(UDropdownMenu, {
      items: getPageActions(row)
    }, () => [h(UButton, {
      icon: 'i-lucide-more-horizontal',
      color: 'neutral',
      variant: 'ghost',
      square: true
    })])
  }
}]

function getPageActions(row: any): DropdownMenuItem[][] {
  return [[{
    label: 'Edit',
    icon: 'i-lucide-pencil',
    to: `/pages/${row.original.id}/edit`
  }, {
    label: 'View Analytics',
    icon: 'i-lucide-bar-chart',
    to: `/pages/${row.original.id}/analytics`
  }], [{
    label: 'Duplicate',
    icon: 'i-lucide-copy',
    click: () => console.log('Duplicate page:', row.original.id)
  }, {
    label: row.original.status === 'archived' ? 'Restore' : 'Archive',
    icon: row.original.status === 'archived' ? 'i-lucide-archive-restore' : 'i-lucide-archive',
    click: () => toggleArchive(row.original.id, row.original.status)
  }], [{
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    class: 'text-error',
    click: () => deletePage(row.original.id)
  }]]
}
</script>

<template>
  <UDashboardPanel id="pages">
    <template #header>
      <UDashboardNavbar title="Pages">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Create Page"
            icon="i-lucide-plus"
            to="/pages/create"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search pages..."
            class="w-64"
          />

          <USelectMenu
            v-model="selectedStatus"
            :options="statusOptions"
            placeholder="Status"
            class="w-40"
          />
        </template>

        <template #right>
          <span class="text-sm text-muted">
            {{ filteredPages.length }} {{ filteredPages.length === 1 ? 'page' : 'pages' }}
          </span>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard class="ring-1 ring-default">
        <UTable :loading="loading" :columns="columns" :data="filteredPages" />

        <template v-if="filteredPages.length === 0" #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <UIcon name="i-lucide-file-text" class="size-12 text-muted mb-4" />
            <p class="text-lg font-semibold mb-2">No pages found</p>
            <p class="text-sm text-muted mb-6">
              {{ search ? 'Try adjusting your search or filters' : 'Get started by creating your first page' }}
            </p>
            <UButton
              v-if="!search"
              label="Create Page"
              icon="i-lucide-plus"
              to="/pages/create"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

