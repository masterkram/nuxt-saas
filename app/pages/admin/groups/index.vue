<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const search = ref('')
const { company } = useCompany()
const toast = useToast()

// Fetch groups from API
const { data: groups, status, refresh } = await useFetch('/api/groups', {
  query: {
    companyId: company.value?.id,
    search
  },
  watch: [search]
})

const filteredGroups = computed(() => groups.value || [])

const NuxtLink = resolveComponent('NuxtLink')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UButton = resolveComponent('UButton')
const NuxtTime = resolveComponent('NuxtTime')

const columns = [{
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => {
    return h(NuxtLink, {
      to: `/groups/${row.original.id}/edit`,
      class: 'hover:underline font-medium'
    }, () => row.original.name)
  }
}, {
  accessorKey: 'description',
  header: 'Description',
}, {
  accessorKey: 'memberCount',
  header: 'Members',
}, {
  accessorKey: 'creatorName',
  header: 'Created By',
}, {
  accessorKey: 'createdAt',
  header: 'Created',
  cell: ({ row }) => {
    return h(NuxtTime, {
      datetime: row.original.createdAt
    })
  }
}, {
  accessorKey: 'actions',
  header: '',
  cell: ({ row }) => {
    return h(UDropdownMenu, {
      items: getGroupActions(row.original)
    }, () => [h(UButton, {
      icon: 'i-lucide-more-horizontal',
      color: 'neutral',
      variant: 'ghost',
      square: true
    })])
  }
}]

async function deleteGroup(groupId: string) {
  try {
    await $fetch(`/api/groups/${groupId}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Group deleted',
      description: 'The group has been successfully deleted',
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete group',
      color: 'error'
    })
  }
}

function getGroupActions(group: any): DropdownMenuItem[][] {
  return [[{
    label: 'Edit',
    icon: 'i-lucide-pencil',
    to: `/admin/groups/${group.id}/edit`
  }, {
    label: 'View Members',
    icon: 'i-lucide-users',
    to: `/admin/groups/${group.id}/members`
  }], [{
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    class: 'text-error',
    click: () => deleteGroup(group.id)
  }]]
}

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <UDashboardPanel id="groups">
    <template #header>
      <UDashboardNavbar title="Groups">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Create Group"
            icon="i-lucide-plus"
            to="/groups/create"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search groups..."
            class="w-64"
          />
        </template>

        <template #right>
          <span class="text-sm text-muted">
            {{ filteredGroups.length }} {{ filteredGroups.length === 1 ? 'group' : 'groups' }}
          </span>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard class="ring-1 ring-default">
        <UTable :loading="status === 'pending'" :columns="columns" :data="filteredGroups" />

        <template v-if="filteredGroups.length === 0" #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <UIcon name="i-lucide-users" class="size-12 text-muted mb-4" />
            <p class="text-lg font-semibold mb-2">No groups found</p>
            <p class="text-sm text-muted mb-6">
              {{ search ? 'Try adjusting your search' : 'Get started by creating your first group' }}
            </p>
            <UButton
              v-if="!search"
              label="Create Group"
              icon="i-lucide-plus"
              to="/groups/create"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

