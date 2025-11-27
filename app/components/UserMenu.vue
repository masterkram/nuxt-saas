<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const user = useUser()

const router = useRouter()

const items = [[{
  label: user.value?.email || '',
  icon: 'tabler:user',
  disabled: true
}], [{
  label: 'Settings',
  icon: 'tabler:settings',
  to: '/settings'
}, {
  label: 'Sign out',
  icon: 'tabler:logout',
  onClick: () => {
    // TODO: Implement actual logout
    router.push('/login')
  }
}]]
</script>

<template>
  <UDropdownMenu :items="items" :ui="{ width: 'w-full' }">
    <template #default="{ open }">
      <UButton
        color="neutral"
        variant="ghost"
        class="w-full"
        :class="[collapsed ? 'justify-center' : 'justify-start']"
      >
        <template #leading>
          <UAvatar
            :alt="user.firstName + ' ' + user.lastName || ''"
            size="xs"
          >
            <template #fallback>
              <span class="text-xs">{{ user.firstName?.charAt(0) + user.lastName?.charAt(0) || '' }}</span>
            </template>
          </UAvatar>
        </template>

        <span v-if="!collapsed" class="truncate">{{ user.firstName + ' ' + user.lastName || '' }}</span>

        <template v-if="!collapsed" #trailing>
          <UIcon
            name="tabler:chevron-down"
            class="size-4 ms-auto shrink-0 text-muted"
          />
        </template>
      </UButton>
    </template>
  </UDropdownMenu>
</template>

