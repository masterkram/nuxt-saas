<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()

const groupId = route.params.id as string

// Fetch group details
const { data: group, pending } = await useFetch(`/api/groups/${groupId}`)

const form = reactive({
  name: group.value?.name || '',
  description: group.value?.description || ''
})

// Update form when group data loads
watch(group, (newGroup) => {
  if (newGroup) {
    form.name = newGroup.name
    form.description = newGroup.description || ''
  }
})

const submitting = ref(false)

async function handleSubmit() {
  try {
    submitting.value = true
    await $fetch(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: form
    })
    toast.add({
      title: 'Success',
      description: 'Group updated successfully',
      color: 'success'
    })
    router.push('/groups')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update group',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

async function handleDelete() {
  if (!confirm('Are you sure you want to delete this group?')) {
    return
  }

  try {
    await $fetch(`/api/groups/${groupId}`, {
      method: 'DELETE'
    })
    toast.add({
      title: 'Success',
      description: 'Group deleted successfully',
      color: 'success'
    })
    router.push('/groups')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete group',
      color: 'error'
    })
  }
}
</script>

<template>
  <UDashboardPanel id="edit-group">
    <template #header>
      <UDashboardNavbar :title="`Edit ${group?.name || 'Group'}`">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/groups"
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
            <h3 class="text-lg font-semibold">Group Details</h3>
            <UButton
              label="Delete Group"
              icon="i-lucide-trash-2"
              color="error"
              variant="ghost"
              @click="handleDelete"
            />
          </div>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UFormField label="Group Name" required>
            <UInput
              v-model="form.name"
              placeholder="e.g., Marketing Team"
              required
            />
          </UFormField>

          <UFormField label="Description">
            <UTextarea
              v-model="form.description"
              placeholder="Brief description of this group..."
              :rows="3"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              to="/groups"
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

      <UCard v-if="!pending" class="ring-1 ring-default max-w-2xl mt-6">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">Members</h3>
            <UButton
              label="Manage Members"
              icon="i-lucide-users"
              :to="`/groups/${groupId}/members`"
            />
          </div>
        </template>

        <div class="text-sm text-muted">
          <p>This group has {{ group?.memberCount || 0 }} member(s).</p>
          <p class="mt-2">Click "Manage Members" to add or remove members.</p>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>


