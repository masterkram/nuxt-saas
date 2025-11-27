<script setup lang="ts">
/**
 * Notifications Page - Placeholder for future notification center
 */

definePageMeta({
  layout: 'employee',
  middleware: 'auth'
})
</script>

<template>
  <UDashboardPanel id="notifications">
    <template #header>
      <UDashboardNavbar title="Notifications" :ui="{ right: 'gap-3' }">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="max-w-3xl mx-auto">
        <UCard class="text-center py-12">
          <div class="p-4 rounded-full bg-muted/20 w-fit mx-auto mb-4">
            <UIcon name="i-lucide-bell" class="size-12 text-muted" />
          </div>
          <h3 class="text-xl font-semibold mb-2">No notifications</h3>
          <p class="text-muted max-w-md mx-auto">
            When you receive notifications about new pages or updates, they'll appear here.
          </p>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>

