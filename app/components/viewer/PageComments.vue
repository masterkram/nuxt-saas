<script setup lang="ts">
const props = defineProps<{
  pageSlug: string
  comments: Array<{
    id: string
    text: string
    createdAt: string
    author: string
    authorAvatar: string | null
  }>
  enabled: boolean
}>()

const emit = defineEmits<{
  newComment: [comment: any]
}>()

const toast = useToast()
const user = useUser()
const newCommentText = ref('')
const isSubmitting = ref(false)
const localComments = ref([...props.comments])

const sortedComments = computed(() => {
  return [...localComments.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
})

async function submitComment() {
  if (!newCommentText.value.trim() || isSubmitting.value) return

  isSubmitting.value = true

  try {
    const comment = await $fetch(`/api/employee/pages/${props.pageSlug}/comments`, {
      method: 'POST',
      body: { text: newCommentText.value }
    })

    localComments.value.unshift(comment as any)
    emit('newComment', comment)
    newCommentText.value = ''

    toast.add({
      title: 'Comment Added',
      description: 'Your comment has been posted.',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to post comment. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  })
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Watch for prop changes
watch(() => props.comments, (newComments) => {
  localComments.value = [...newComments]
})
</script>

<template>
  <div class="comments-section">
    <!-- Comment count header -->
    <div class="flex items-center gap-2 mb-4">
      <UIcon name="i-lucide-message-circle" class="size-5 text-muted" />
      <span class="font-medium">{{ localComments.length }} {{ localComments.length === 1 ? 'Comment' : 'Comments' }}</span>
    </div>

    <!-- New comment form -->
    <div v-if="enabled" class="flex gap-3 mb-6">
      <div class="shrink-0">
        <UAvatar
          v-if="user.avatarUrl"
          :src="user.avatarUrl"
          size="sm"
        />
        <div v-else class="size-8 rounded-full bg-primary/10 flex items-center justify-center">
          <span class="text-xs font-medium text-primary-500">
            {{ getInitials(`${user.firstName || ''} ${user.lastName || ''}`) || 'U' }}
          </span>
        </div>
      </div>
      <div class="flex-1">
        <UTextarea
          v-model="newCommentText"
          placeholder="Write a comment..."
          :rows="2"
          autoresize
          class="mb-2"
        />
        <div class="flex justify-end">
          <UButton
            label="Post Comment"
            size="sm"
            :loading="isSubmitting"
            :disabled="!newCommentText.trim()"
            @click="submitComment"
          />
        </div>
      </div>
    </div>

    <!-- Comments list -->
    <div class="space-y-4">
      <div 
        v-for="comment in sortedComments" 
        :key="comment.id"
        class="flex gap-3"
      >
        <div class="shrink-0">
          <UAvatar
            v-if="comment.authorAvatar"
            :src="comment.authorAvatar"
            size="sm"
          />
          <div v-else class="size-8 rounded-full bg-muted/30 flex items-center justify-center">
            <span class="text-xs font-medium text-muted">
              {{ getInitials(comment.author) }}
            </span>
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-sm">{{ comment.author }}</span>
            <span class="text-xs text-muted">{{ formatDate(comment.createdAt) }}</span>
          </div>
          <p class="text-sm whitespace-pre-wrap break-words">{{ comment.text }}</p>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="localComments.length === 0" class="text-center py-8">
        <UIcon name="i-lucide-message-square" class="size-12 text-muted mx-auto mb-3" />
        <p class="text-muted">No comments yet. Be the first to comment!</p>
      </div>
    </div>
  </div>
</template>

