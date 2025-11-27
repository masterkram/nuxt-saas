<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { companyId } = useCompany()

const groupId = route.params.id as string

// Fetch group and members
const { data: group, pending: groupPending } = await useFetch(`/api/groups/${groupId}`)
const { data: members, pending: membersPending, refresh: refreshMembers } = await useFetch(`/api/groups/${groupId}/members`)

// Fetch all contacts to add
const { data: allContacts } = await useFetch('/api/contacts', {
  query: { companyId, status: 'active' }
})

const showAddModal = ref(false)
const selectedContacts = ref<string[]>([])
const adding = ref(false)

const availableContacts = computed(() => {
  const memberIds = new Set(members.value?.map(m => m.userId) || [])
  return allContacts.value?.filter(c => !memberIds.has(c.id)) || []
})

const columns = [{
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => {
    return h('span', {
      class: 'font-medium'
    }, () => `${row.original.firstName} ${row.original.lastName}`)
  }
}, {
  accessorKey: 'email',
  header: 'Email',
  cell: ({ row }) => {
    return h('span', {
      class: 'text-sm text-muted'
    }, () => row.original.email)
  }
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    const UBadge = resolveComponent('UBadge')
    return h(UBadge, {
      color: row.original.status === 'active' ? 'success' : 'neutral',
      variant: 'subtle'
    }, () => row.original.status)
  }
}, {
  accessorKey: 'joinedAt',
  header: 'Joined',
  cell: ({ row }) => {
    return h('span', {
      class: 'text-sm text-muted'
    }, () => new Date(row.original.joinedAt).toLocaleDateString())
  }
}, {
  accessorKey: 'actions',
  header: '',
  cell: ({ row }) => {
    const UButton = resolveComponent('UButton')
    return h(UButton, {
      icon: 'i-lucide-trash-2',
      color: 'error',
      variant: 'ghost',
      square: true,
      onClick: () => removeMember(row.original.userId)
    })
  }
}]

async function addMembers() {
  if (selectedContacts.value.length === 0) {
    return
  }

  try {
    adding.value = true
    await $fetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      body: { userIds: selectedContacts.value }
    })
    toast.add({
      title: 'Success',
      description: 'Members added successfully',
      color: 'success'
    })
    selectedContacts.value = []
    showAddModal.value = false
    refreshMembers()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to add members',
      color: 'error'
    })
  } finally {
    adding.value = false
  }
}

async function removeMember(userId: string) {
  if (!confirm('Are you sure you want to remove this member?')) {
    return
  }

  try {
    await $fetch(`/api/groups/${groupId}/members`, {
      method: 'DELETE',
      body: { userIds: [userId] }
    })
    toast.add({
      title: 'Success',
      description: 'Member removed successfully',
      color: 'success'
    })
    refreshMembers()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to remove member',
      color: 'error'
    })
  }
}
</script>

<template>
  <UDashboardPanel id="group-members">
    <template #header>
      <UDashboardNavbar :title="`${group?.name || 'Group'} - Members`">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            :to="`/groups/${groupId}/edit`"
          />
        </template>

        <template #right>
          <UButton
            label="Add Members"
            icon="i-lucide-user-plus"
            @click="showAddModal = true"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="groupPending || membersPending" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <UCard v-else class="ring-1 ring-default">
        <UTable :columns="columns" :data="members || []" />

        <template v-if="!members || members.length === 0" #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <UIcon name="i-lucide-users" class="size-12 text-muted mb-4" />
            <p class="text-lg font-semibold mb-2">No members yet</p>
            <p class="text-sm text-muted mb-6">Add members to this group to get started</p>
            <UButton
              label="Add Members"
              icon="i-lucide-user-plus"
              @click="showAddModal = true"
            />
          </div>
        </template>
      </UCard>

      <!-- Add Members Modal -->
      <UModal v-model="showAddModal" title="Add Members">
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">Select Members to Add</h3>
          </template>

          <div class="space-y-4">
            <UFormField label="Available Contacts">
              <USelectMenu
                v-model="selectedContacts"
                :options="availableContacts.map(c => ({ label: `${c.firstName} ${c.lastName} (${c.email})`, value: c.id }))"
                multiple
                placeholder="Select contacts..."
                class="w-full"
              />
            </UFormField>

            <div class="flex justify-end gap-3 pt-4">
              <UButton
                label="Cancel"
                color="neutral"
                variant="ghost"
                @click="showAddModal = false"
                :disabled="adding"
              />
              <UButton
                label="Add Members"
                icon="i-lucide-user-plus"
                @click="addMembers"
                :loading="adding"
                :disabled="adding || selectedContacts.length === 0"
              />
            </div>
          </div>
        </UCard>
      </UModal>
    </template>
  </UDashboardPanel>
</template>


