<script setup lang="ts">
const form = reactive({
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  logo: null
})

function handleLogoUpload(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    // TODO: Implement file upload
    console.log('Uploading logo:', target.files[0])
  }
}

function handleSubmit() {
  // TODO: Implement save branding API call
  console.log('Saving branding:', form)
}

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <UDashboardPanel id="settings-branding">
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
          <h3 class="text-lg font-semibold">Company Branding</h3>
        </template>

        <form class="space-y-6" @submit.prevent="handleSubmit">
          <UFormField label="Company Logo">
            <div class="flex items-center gap-4">
              <div class="size-20 rounded-lg bg-muted flex items-center justify-center">
                <UIcon name="i-lucide-building-2" class="size-8 text-muted" />
              </div>
              <div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleLogoUpload"
                >
                <label for="logo-upload">
                  <UButton
                    label="Upload Logo"
                    icon="i-lucide-upload"
                    color="neutral"
                    variant="outline"
                    as="span"
                  />
                </label>
                <p class="text-sm text-muted mt-2">
                  Recommended: 200x200px, PNG or SVG
                </p>
              </div>
            </div>
          </UFormField>

          <UFormField label="Primary Color">
            <div class="flex items-center gap-3">
              <input
                v-model="form.primaryColor"
                type="color"
                class="size-12 rounded border border-default cursor-pointer"
              >
              <UInput
                v-model="form.primaryColor"
                placeholder="#3B82F6"
                class="flex-1"
              />
            </div>
          </UFormField>

          <UFormField label="Secondary Color">
            <div class="flex items-center gap-3">
              <input
                v-model="form.secondaryColor"
                type="color"
                class="size-12 rounded border border-default cursor-pointer"
              >
              <UInput
                v-model="form.secondaryColor"
                placeholder="#8B5CF6"
                class="flex-1"
              />
            </div>
          </UFormField>

          <div class="p-4 rounded-lg bg-muted">
            <h4 class="font-medium mb-2">Preview</h4>
            <div class="flex gap-2">
              <div
                class="size-12 rounded"
                :style="{ backgroundColor: form.primaryColor }"
              />
              <div
                class="size-12 rounded"
                :style="{ backgroundColor: form.secondaryColor }"
              />
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

