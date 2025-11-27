<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { companyId } = useCompany()

const contactId = route.params.id as string

// Fetch contact details
const { data: contact, pending } = await useFetch(`/api/contacts/${contactId}`)

// Fetch available groups
const { data: groups } = await useFetch('/api/groups', {
  query: { companyId }
})

const availableGroups = computed(() => 
  groups.value?.map(g => ({ label: g.name, value: g.id })) || []
)

const form = reactive({
  firstName: contact.value?.firstName || '',
  lastName: contact.value?.lastName || '',
  email: contact.value?.email || '',
  status: contact.value?.status || 'active',
  groupIds: contact.value?.groups?.map((g: any) => g.id) || []
})

// Update form when contact data loads
watch(contact, (newContact) => {
  if (newContact) {
    form.firstName = newContact.firstName || ''
    form.lastName = newContact.lastName || ''
    form.email = newContact.email
    form.status = newContact.status
    form.groupIds = newContact.groups?.map((g: any) => g.id) || []
  }
})

const submitting = ref(false)

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Suspended', value: 'suspended' }
]

async function handleSubmit() {
  try {
    submitting.value = true
    await $fetch(`/api/contacts/${contactId}`, {
      method: 'PUT',
      body: form
    })
    toast.add({
      title: 'Success',
      description: 'Contact updated successfully',
      color: 'success'
    })
    router.push('/contacts')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to update contact',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
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
    router.push('/contacts')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete contact',
      color: 'error'
    })
  }
}
</script>

<template>
  <UDashboardPanel id="edit-contact">
    <template #header>
      <UDashboardNavbar :title="`Edit ${contact?.firstName || 'Contact'} ${contact?.lastName || ''}`">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/contacts"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="pending" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <UCard v-else class="ring-1 ring-default max-w-2xl">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Contact Details</h3>
            <UButton
              label="Delete Contact"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="handleDelete"
            />
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <UFormField label="First Name" required>
              <UInput
                v-model="form.firstName"
                placeholder="John"
                required
              />
            </UFormField>

            <UFormField label="Last Name" required>
              <UInput
                v-model="form.lastName"
                placeholder="Doe"
                required
              />
            </UFormField>
          </div>

          <UFormField label="Email" required>
            <UInput
              v-model="form.email"
              type="email"
              placeholder="john.doe@example.com"
              required
            />
          </UFormField>

          <UFormField label="Status">
            <USelectMenu
              v-model="form.status"
              :options="statusOptions"
            />
          </UFormField>

          <UFormField label="Groups">
            <USelectMenu
              v-model="form.groupIds"
              :options="availableGroups"
              multiple
              placeholder="Select groups..."
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              to="/contacts"
              :disabled="submitting"
            />
            <UButton
              label="Save Changes"
              type="submit"
              icon="i-lucide-save"
              :loading="submitting"
              :disabled="submitting"
            />
          </div>
        </form>
      </UCard>

      <UCard v-if="!pending && contact" class="ring-1 ring-default max-w-2xl mt-6">
        <template #header>
          <h3 class="text-lg font-semibold">Additional Information</h3>
        </template>

        <div class="space-y-3 text-sm">
          <div class="flex justify-between">
            <span class="text-muted">Last Login:</span>
            <span class="font-medium">
              {{ contact.lastLogin ? new Date(contact.lastLogin).toLocaleString() : 'Never' }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Created:</span>
            <span class="font-medium">
              {{ new Date(contact.createdAt).toLocaleDateString() }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-muted">Updated:</span>
            <span class="font-medium">
              {{ new Date(contact.updatedAt).toLocaleDateString() }}
            </span>
          </div>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>


