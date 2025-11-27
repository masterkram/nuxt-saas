<script setup lang="ts">
const { company } = useCompany()
const toast = useToast()
const router = useRouter()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  groupIds: []
})

// Fetch available groups from API
const { data: groups } = await useFetch('/api/groups', {
  query: { companyId: company.value?.id }
})

const availableGroups = computed(() => 
  groups.value?.map(g => ({ label: g.name, value: g.id })) || []
)

const submitting = ref(false)

async function handleSubmit() {
  try {
    submitting.value = true
    await $fetch('/api/contacts', {
      method: 'POST',
      body: { 
        ...form, 
        companyId: company.value?.id
      }
    })
    toast.add({
      title: 'Success',
      description: 'Contact added successfully',
      color: 'success'
    })
    router.push('/contacts')
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.data?.message || 'Failed to add contact',
      color: 'error'
    })
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <UDashboardPanel id="create-contact">
    <template #header>
      <UDashboardNavbar title="Add Contact">
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
      <UCard class="ring-1 ring-default max-w-2xl">
        <template #header>
          <h3 class="text-lg font-semibold">Contact Details</h3>
        </template>

        <form class="space-y-6" @submit.prevent="handleSubmit">
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
              label="Add Contact"
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

