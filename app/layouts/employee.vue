<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()
const open = ref(false)

const { company } = useCompany()
const user = useUser()

const links = [[{
  label: 'Home',
  icon: 'i-lucide-home',
  to: '/',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Feed',
  icon: 'i-lucide-newspaper',
  to: '/feed',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Notifications',
  icon: 'i-lucide-bell',
  to: '/notifications',
  onSelect: () => {
    open.value = false
  }
}]] satisfies NavigationMenuItem[][]

const groups = computed(() => [{
  id: 'links',
  label: 'Go to',
  items: links.flat()
}])
</script>

<template>
  <UDashboardGroup unit="rem">
    <UDashboardSidebar
      id="employee"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-3 p-2">
          <div v-if="company?.brandingConfig?.logo" class="shrink-0">
            <img 
              :src="company.brandingConfig.logo" 
              :alt="company?.name" 
              class="h-8 w-auto"
            >
          </div>
          <div v-else class="shrink-0 size-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <UIcon name="i-lucide-building-2" class="size-5 text-primary-500" />
          </div>
          <div v-if="!collapsed" class="min-w-0">
            <p class="font-semibold truncate">{{ company?.name || 'Company' }}</p>
          </div>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UDashboardSearchButton :collapsed="collapsed" class="bg-transparent ring-default" />

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[0]"
          orientation="vertical"
          tooltip
          popover
        />
      </template>

      <template #footer="{ collapsed }">
        <UserMenu :collapsed="collapsed" />
      </template>
    </UDashboardSidebar>

    <UDashboardSearch :groups="groups" />

    <slot />
  </UDashboardGroup>
</template>

