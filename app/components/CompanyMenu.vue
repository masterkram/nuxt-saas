<script setup lang="ts">
defineProps<{
  collapsed?: boolean
}>()

const { company, isLoading } = useCompany()
</script>

<template>
  <div
    class="w-full px-2 py-1.5"
    :class="[collapsed ? 'flex justify-center' : '']"
  >
    <div class="flex items-center gap-2" :class="[collapsed ? '' : 'w-full']">
      <UAvatar
        v-if="company?.brandingConfig?.logo"
        :src="company.brandingConfig.logo"
        :alt="company.name"
        size="xs"
      />
      <UAvatar
        v-else
        :alt="company?.name || 'Company'"
        size="xs"
      >
        <template #fallback>
          <UIcon name="tabler:building" class="size-4" />
        </template>
      </UAvatar>

      <span 
        v-if="!collapsed" 
        class="text-sm font-medium truncate"
      >
        {{ company?.name || (isLoading ? 'Loading...' : 'No Company') }}
      </span>
    </div>
  </div>
</template>

