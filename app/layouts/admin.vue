<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = ref(false)

const links = [[{
  label: 'Dashboard',
  icon: 'i-lucide-layout-dashboard',
  to: '/admin',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Pages',
  icon: 'i-lucide-file-text',
  to: '/admin/pages',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Groups',
  icon: 'i-lucide-users',
  to: '/admin/groups',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Contacts',
  icon: 'i-lucide-contact',
  to: '/admin/contacts',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Analytics',
  icon: 'i-lucide-bar-chart',
  to: '/admin/analytics',
  onSelect: () => {
    open.value = false
  }
}, {
  label: 'Settings',
  to: '/admin/settings',
  icon: 'i-lucide-settings',
  defaultOpen: false,
  type: 'trigger',
  children: [{
    label: 'General',
    to: '/admin/settings',
    exact: true,
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Company Branding',
    to: '/admin/settings/branding',
    onSelect: () => {
      open.value = false
    }
  }, {
    label: 'Landing Page',
    to: '/admin/settings/landing',
    onSelect: () => {
      open.value = false
    }
  }]
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
      id="default"
      v-model:open="open"
      collapsible
      resizable
      class="bg-elevated/25"
      :ui="{ footer: 'lg:border-t lg:border-default' }"
    >
      <template #header="{ collapsed }">
        <CompanyMenu :collapsed="collapsed" />
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

        <UNavigationMenu
          :collapsed="collapsed"
          :items="links[1]"
          orientation="vertical"
          tooltip
          class="mt-auto"
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

