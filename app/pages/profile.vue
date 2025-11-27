<script setup lang="ts">
/**
 * Profile Page - User profile and settings
 */

definePageMeta({
  layout: 'employee',
  middleware: 'auth'
})

const user = useUser()
const { company } = useCompany()

function getInitials(firstName?: string, lastName?: string): string {
  const first = firstName?.[0] || ''
  const last = lastName?.[0] || ''
  return (first + last).toUpperCase() || 'U'
}
</script>

<template>
  <UDashboardPanel id="profile">
    <template #header>
      <UDashboardNavbar title="Profile" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-2xl mx-auto space-y-6">
        <!-- Profile Card -->
        <UCard>
          <div class="flex items-start gap-6">
            <!-- Avatar -->
            <div class="shrink-0">
              <div class="size-24 rounded-full bg-primary/10 flex items-center justify-center">
                <span class="text-3xl font-semibold text-primary-500">
                  {{ getInitials(user.firstName, user.lastName) }}
                </span>
              </div>
            </div>

            <!-- Info -->
            <div class="flex-1 min-w-0">
              <h2 class="text-2xl font-bold">
                {{ user.firstName || '' }} {{ user.lastName || '' }}
              </h2>
              <p class="text-muted mt-1">{{ user.email }}</p>
              <div class="flex items-center gap-2 mt-3">
                <UIcon name="i-lucide-building-2" class="size-4 text-muted" />
                <span class="text-sm text-muted">{{ company?.name || 'Company' }}</span>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Account Settings -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-settings" class="size-5" />
              <h3 class="font-semibold">Account Settings</h3>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between py-2">
              <div>
                <p class="font-medium">Email Address</p>
                <p class="text-sm text-muted">{{ user.email }}</p>
              </div>
              <UButton 
                label="Change" 
                variant="ghost" 
                size="sm"
                disabled
              />
            </div>

            <USeparator />

            <div class="flex items-center justify-between py-2">
              <div>
                <p class="font-medium">Password</p>
                <p class="text-sm text-muted">••••••••</p>
              </div>
              <UButton 
                label="Change" 
                variant="ghost" 
                size="sm"
                disabled
              />
            </div>
          </div>
        </UCard>

        <!-- Notification Settings -->
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-bell" class="size-5" />
              <h3 class="font-semibold">Notification Preferences</h3>
            </div>
          </template>

          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Email Notifications</p>
                <p class="text-sm text-muted">Receive updates about new pages via email</p>
              </div>
              <UToggle disabled />
            </div>

            <USeparator />

            <div class="flex items-center justify-between">
              <div>
                <p class="font-medium">Push Notifications</p>
                <p class="text-sm text-muted">Get notified in your browser</p>
              </div>
              <UToggle disabled />
            </div>
          </div>
        </UCard>

        <!-- Coming Soon Notice -->
        <div class="text-center py-4">
          <p class="text-sm text-muted">
            Profile editing and notification settings will be available soon.
          </p>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>

