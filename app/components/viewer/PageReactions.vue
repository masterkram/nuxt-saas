<script setup lang="ts">
const props = defineProps<{
  pageSlug: string
  reactions: Record<string, number>
  totalReactions: number
  userReaction: string | null
  enabled: boolean
}>()

const emit = defineEmits<{
  update: [reaction: string | null]
}>()

const toast = useToast()
const isSubmitting = ref(false)
const showPicker = ref(false)
const currentReaction = ref(props.userReaction)

const reactionTypes = [
  { type: 'like', icon: 'i-lucide-thumbs-up', label: 'Like', color: 'text-blue-500' },
  { type: 'love', icon: 'i-lucide-heart', label: 'Love', color: 'text-red-500' },
  { type: 'celebrate', icon: 'i-lucide-party-popper', label: 'Celebrate', color: 'text-yellow-500' },
  { type: 'insightful', icon: 'i-lucide-lightbulb', label: 'Insightful', color: 'text-purple-500' },
  { type: 'support', icon: 'i-lucide-hand-heart', label: 'Support', color: 'text-green-500' }
]

const currentReactionInfo = computed(() => {
  return reactionTypes.find(r => r.type === currentReaction.value)
})

const topReactions = computed(() => {
  return reactionTypes
    .filter(r => props.reactions[r.type] > 0)
    .sort((a, b) => (props.reactions[b.type] || 0) - (props.reactions[a.type] || 0))
    .slice(0, 3)
})

async function toggleReaction(reactionType: string) {
  if (!props.enabled || isSubmitting.value) return

  isSubmitting.value = true

  try {
    if (currentReaction.value === reactionType) {
      // Remove reaction
      await $fetch(`/api/employee/pages/${props.pageSlug}/react`, {
        method: 'DELETE'
      })
      currentReaction.value = null
      emit('update', null)
    } else {
      // Add or change reaction
      await $fetch(`/api/employee/pages/${props.pageSlug}/react`, {
        method: 'POST',
        body: { reactionType }
      })
      currentReaction.value = reactionType
      emit('update', reactionType)
    }
    showPicker.value = false
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to update reaction',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Watch for prop changes
watch(() => props.userReaction, (newVal) => {
  currentReaction.value = newVal
})
</script>

<template>
  <div class="relative">
    <div class="flex items-center gap-2">
      <!-- Main reaction button -->
      <UTooltip v-if="enabled" :text="currentReactionInfo?.label || 'React'">
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
          :class="currentReaction ? 'bg-primary/10' : 'hover:bg-muted/50'"
          @click="showPicker = !showPicker"
          @mouseenter="showPicker = true"
        >
          <UIcon 
            :name="currentReactionInfo?.icon || 'i-lucide-smile-plus'" 
            class="size-5"
            :class="currentReactionInfo?.color || 'text-muted'"
          />
          <span v-if="currentReaction" class="text-sm font-medium" :class="currentReactionInfo?.color">
            {{ currentReactionInfo?.label }}
          </span>
          <span v-else class="text-sm text-muted">React</span>
        </button>
      </UTooltip>

      <!-- Reaction counts -->
      <div v-if="totalReactions > 0" class="flex items-center gap-1 text-sm text-muted">
        <div class="flex -space-x-1">
          <div 
            v-for="reaction in topReactions" 
            :key="reaction.type"
            class="size-5 rounded-full bg-elevated flex items-center justify-center ring-2 ring-background"
          >
            <UIcon :name="reaction.icon" class="size-3" :class="reaction.color" />
          </div>
        </div>
        <span class="ml-1">{{ totalReactions }}</span>
      </div>
    </div>

    <!-- Reaction picker -->
    <Transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div 
        v-if="showPicker && enabled"
        class="absolute bottom-full left-0 mb-2 p-2 rounded-xl bg-elevated shadow-lg border border-default z-50"
        @mouseleave="showPicker = false"
      >
        <div class="flex items-center gap-1">
          <UTooltip v-for="reaction in reactionTypes" :key="reaction.type" :text="reaction.label">
            <button
              class="p-2 rounded-lg transition-all hover:scale-125"
              :class="currentReaction === reaction.type ? 'bg-primary/10' : 'hover:bg-muted/50'"
              @click="toggleReaction(reaction.type)"
            >
              <UIcon :name="reaction.icon" class="size-6" :class="reaction.color" />
            </button>
          </UTooltip>
        </div>
      </div>
    </Transition>
  </div>
</template>

