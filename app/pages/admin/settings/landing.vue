<script setup lang="ts">
const form = reactive({
  title: 'Welcome to Acme Corporation',
  subtitle: 'Stay connected with company updates and news',
  defaultFeed: 'company'
})

const feedOptions = [
  { label: 'Company Feed', value: 'company' },
  { label: 'Department News', value: 'department' },
  { label: 'Custom Feed', value: 'custom' }
]

function handleSubmit() {
  // TODO: Implement save landing page API call
  console.log('Saving landing page:', form)
}

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <UDashboardPanel id="settings-landing">
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UTabs
            :items="[
              { label: 'General', to: '/settings' },
              { label: 'Company Branding', to: '/settings/branding' },
              { label: 'Landing Page', to: '/settings/landing' }
            ]"
            orientation="horizontal"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <UCard class="ring-1 ring-default max-w-2xl">
        <template #header>
          <h3 class="text-lg font-semibold">Landing Page Configuration</h3>
        </template>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <UFormField label="Page Title" required>
            <UInput
              v-model="form.title"
              placeholder="Welcome to Acme Corporation"
              required
            />
          </UFormField>

          <UFormField label="Subtitle">
            <UTextarea
              v-model="form.subtitle"
              placeholder="Stay connected with company updates and news"
              :rows="2"
            />
          </UFormField>

          <UFormField label="Default Feed" required>
            <USelectMenu
              v-model="form.defaultFeed"
              :options="feedOptions"
              required
            />
          </UFormField>

          <div class="p-4 rounded-lg bg-muted">
            <h4 class="font-medium mb-2">Preview</h4>
            <div class="space-y-2">
              <p class="text-lg font-semibold">{{ form.title }}</p>
              <p class="text-sm text-muted">{{ form.subtitle }}</p>
            </div>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
            />
            <UButton
              label="Save Changes"
              type="submit"
              icon="i-lucide-save"
            />
          </div>
        </form>
      </UCard>
    </template>
  </UDashboardPanel>
</template>

