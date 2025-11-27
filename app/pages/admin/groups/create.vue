<script setup lang="ts">
const { company } = useCompany()
const user = useUser()
const toast = useToast()
const router = useRouter()

const form = reactive({
  name: '',
  description: ''
})

const submitting = ref(false)

async function handleSubmit() {
  try {
    submitting.value = true
    await $fetch('/api/groups', {
      method: 'POST',
      body: { 
        ...form, 
        companyId: company.value?.id,
        createdBy: user.value?.sub
      }
    })
    toast.add({
      title: 'Success',
      description: 'Group created successfully',
      color: 'success'
    })
    router.push('/groups')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to create group',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <UDashboardPanel id="create-group">
    <template #header>
      <UDashboardNavbar title="Create Group">
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
      <UCard class="ring-1 ring-default max-w-2xl">
        <template #header>
          <h3 class="text-lg font-semibold">Group Details</h3>
        </template>

        <form class="space-y-6" @submit.prevent="handleSubmit">
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
              label="Create Group"
              type="submit"
              icon="i-lucide-plus"
              :loading="submitting"
              :disabled="submitting"
            />
          </div>
        </form>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

