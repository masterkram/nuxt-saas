<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const search = ref('')
const selectedStatus = ref('all')
const { company } = useCompany()
const toast = useToast()

const statusOptions = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
]

// Fetch contacts from API
const { data: contacts, pending, refresh } = await useFetch('/api/contacts', {
  query: {
    companyId: company.value?.id,
    search,
    status: selectedStatus
  },
  watch: [search, selectedStatus]
})

const filteredContacts = computed(() => contacts.value || [])



const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const NuxtLink = resolveComponent('NuxtLink')

const columns = [{
  accessorKey: 'name',
  header: 'Name',
  cell: ({ row }) => {
    return h(NuxtLink, {
      to: `/contacts/${row.original.id}/edit`,
      class: 'font-medium hover:underline'
    }, () => `${row.original.firstName} ${row.original.lastName}`)
  }
}, {
  accessorKey: 'email',
  header: 'Email',
}, {
  accessorKey: 'status',
  header: 'Status',
  cell: ({ row }) => {
    return h(UBadge, {
      color: row.original.status === 'active' ? 'success' : 'neutral',
      variant: 'subtle'
    }, () => row.original.status)
  }
}, {
  accessorKey: 'groups',
  header: 'Groups',
}, {
  accessorKey: 'lastLogin',
  header: 'Last Login',
}, {
  accessorKey: 'actions',
  header: '',
  cell: ({ row }) => {
    return h(UDropdownMenu, {
      items: getContactActions(row.original)
    }, () => [h(UButton, {
      icon: 'i-lucide-more-horizontal',
      color: 'neutral',
      variant: 'ghost',
      square: true
    })])
  }
}]

async function toggleStatus(contactId: string, currentStatus: string) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  try {
    await $fetch(`/api/contacts/${contactId}`, {
      method: 'PUT',
      body: { status: newStatus }
    })
    toast.add({
      title: 'Success',
      description: `Contact ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update contact status',
      color: 'error'
    })
  }
}

async function deleteContact(contactId: string) {
  if (!confirm('Are you sure you want to delete this contact?')) {
    return
  }

  try {
    await $fetch(`/api/contacts/${contactId}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Success',
      description: 'Contact deleted successfully',
      color: 'success'
    })
    refresh()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete contact',
      color: 'error'
    })
  }
}

function getContactActions(contact: any): DropdownMenuItem[][] {
  return [[{
    label: 'Edit',
    icon: 'i-lucide-pencil',
    to: `/admin/contacts/${contact.id}/edit`
  }], [{
    label: contact.status === 'active' ? 'Deactivate' : 'Activate',
    icon: contact.status === 'active' ? 'i-lucide-user-x' : 'i-lucide-user-check',
    click: () => toggleStatus(contact.id, contact.status)
  }], [{
    label: 'Delete',
    icon: 'i-lucide-trash-2',
    class: 'text-error',
    click: () => deleteContact(contact.id)
  }]]
}

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <UDashboardPanel id="contacts">
    <template #header>
      <UDashboardNavbar title="Contacts">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="Import CSV"
            icon="i-lucide-upload"
            color="neutral"
            variant="outline"
          />
          <UButton
            label="Add Contact"
            icon="i-lucide-plus"
            to="/admin/contacts/create"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Search contacts..."
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
            {{ filteredContacts.length }} {{ filteredContacts.length === 1 ? 'contact' : 'contacts' }}
          </span>
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard class="ring-1 ring-default">
        <UTable :columns="columns" :data="filteredContacts" />

        <template v-if="filteredContacts.length === 0" #empty>
          <div class="flex flex-col items-center justify-center py-12">
            <UIcon name="i-lucide-users" class="size-12 text-muted mb-4" />
            <p class="text-lg font-semibold mb-2">No contacts found</p>
            <p class="text-sm text-muted mb-6">
              {{ search ? 'Try adjusting your search or filters' : 'Get started by adding your first contact' }}
            </p>
            <UButton
              v-if="!search"
              label="Add Contact"
              icon="i-lucide-plus"
              to="/admin/contacts/create"
            />
          </div>
        </template>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

