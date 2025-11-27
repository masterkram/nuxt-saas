<script setup lang="ts">
const form = reactive({
  companyName: 'Acme Corporation',
  companyEmail: 'contact@acme.com',
  companyPhone: '+1 (555) 123-4567',
  companyWebsite: 'https://acme.com',
  timezone: 'America/New_York',
  language: 'en'
})

const timezones = [
  { label: 'Eastern Time (ET)', value: 'America/New_York' },
  { label: 'Central Time (CT)', value: 'America/Chicago' },
  { label: 'Mountain Time (MT)', value: 'America/Denver' },
  { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' }
]

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Spanish', value: 'es' }
]

function handleSubmit() {
  // TODO: Implement save settings API call
  console.log('Saving settings:', form)
}
</script>

<template>
  <UDashboardPanel id="settings">
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
          <h3 class="text-lg font-semibold">General Settings</h3>
        </template>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <UFormField label="Company Name" required>
            <UInput
              v-model="form.companyName"
              placeholder="Acme Corporation"
              required
            />
          </UFormField>

          <UFormField label="Company Email" required>
            <UInput
              v-model="form.companyEmail"
              type="email"
              placeholder="contact@acme.com"
              required
            />
          </UFormField>

          <UFormField label="Company Phone">
            <UInput
              v-model="form.companyPhone"
              type="tel"
              placeholder="+1 (555) 123-4567"
            />
          </UFormField>

          <UFormField label="Company Website">
            <UInput
              v-model="form.companyWebsite"
              type="url"
              placeholder="https://acme.com"
            />
          </UFormField>

          <UFormField label="Timezone" required>
            <USelectMenu
              v-model="form.timezone"
              :options="timezones"
              required
            />
          </UFormField>

          <UFormField label="Default Language" required>
            <USelectMenu
              v-model="form.language"
              :options="languages"
              required
            />
          </UFormField>

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

