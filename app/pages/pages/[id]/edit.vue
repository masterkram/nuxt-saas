<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const toast = useToast()

// Get company context from global state
const { companyId } = useCompany()

// Get authenticated user from Supabase
const user = useSupabaseUser()

const pageId = route.params.id as string
const title = ref('')
const content = ref({})
const mode = ref<'design' | 'publish' | 'analytics'>('design')
const showPreview = ref(false)
const isSaving = ref(false)
const isLoading = ref(false)
const lastSaved = ref<Date | null>(null)
const editorRef = ref<any>(null)

const tabs = computed(() => [{
  label: 'Design',
  value: 'design',
  icon: 'i-lucide-layout'
}, {
  label: 'Publish',
  value: 'publish',
  icon: 'i-lucide-send',
  disabled: !title.value
}, {
  label: 'Analytics',
  value: 'analytics',
  icon: 'i-lucide-bar-chart',
  disabled: true
}])

// Load existing page
async function loadPage() {
  if (!companyId.value) {
    toast.add({
      title: 'No company selected',
      description: 'Please select a company first',
      color: 'error'
    })
    router.push('/pages')
    return
  }

  isLoading.value = true
  try {
    const page = await $fetch(`/api/pages/${pageId}?companyId=${companyId.value}`)
    title.value = page.title
    content.value = page.content
    lastSaved.value = new Date(page.updatedAt)
  } catch (error) {
    console.error('Error loading page:', error)
    toast.add({
      title: 'Error loading page',
      description: 'Failed to load the page',
      color: 'error'
    })
    router.push('/pages')
  } finally {
    isLoading.value = false
  }
}

async function saveDraft() {
  if (!companyId.value) {
    toast.add({
      title: 'No company selected',
      description: 'Please select a company first',
      color: 'error'
    })
    return
  }

  isSaving.value = true
  try {
    await $fetch(`/api/pages/${pageId}`, {
      method: 'PUT',
      body: {
        companyId: companyId.value,
        title: title.value,
        content: content.value,
        status: 'draft'
      }
    })
    
    lastSaved.value = new Date()
    toast.add({
      title: 'Draft saved',
      description: 'Your changes have been saved',
      color: 'success'
    })
  } catch (error) {
    console.error('Error saving draft:', error)
    toast.add({
      title: 'Error saving draft',
      description: 'Please try again',
      color: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

function preview() {
  showPreview.value = true
}

function insertComponent(type: string) {
  const editor = editorRef.value?.editor
  if (!editor) return

  switch (type) {
    case 'image':
      editor.commands.setImageBlock({ src: null })
      break
    case 'video':
      editor.commands.setVideoBlock({ src: null })
      break
    case 'grid':
      editor.commands.setGridBlock({ columns: 2, items: [] })
      break
    case 'button':
      editor.commands.setButtonBlock({ label: 'Button', url: '' })
      break
    case 'quiz':
      editor.commands.setQuizBlock({ title: 'Quiz', questions: [] })
      break
    case 'confirm':
      editor.commands.setConfirmBlock({ 
        title: 'Confirmation Required',
        message: 'I confirm that I have read and understood this information.'
      })
      break
  }
}

// Auto-save handler
function handleAutoSave() {
  if (title.value) {
    saveDraft()
  }
}

// Watch content changes for auto-save (debounced)
let autoSaveTimeout: NodeJS.Timeout | null = null
watch([title, content], () => {
  if (autoSaveTimeout) {
    clearTimeout(autoSaveTimeout)
  }
  autoSaveTimeout = setTimeout(() => {
    if (title.value) {
      handleAutoSave()
    }
  }, 5000) // Auto-save after 5 seconds of inactivity
}, { deep: true })

const formattedLastSaved = computed(() => {
  if (!lastSaved.value) return 'Never'
  const now = new Date()
  const diff = Math.floor((now.getTime() - lastSaved.value.getTime()) / 1000)
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`
  return lastSaved.value.toLocaleDateString()
})

onMounted(() => {
  loadPage()
})
</script>

<template>
  <UDashboardPanel id="page-editor">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <div class="flex items-center gap-3">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/pages"
            />
            <div class="h-6 w-px bg-default" />
            <UInput
              v-model="title"
              placeholder="Untitled Page"
              class="w-64"
              :ui="{ base: 'font-semibold' }"
              :disabled="isLoading"
            />
            <span v-if="lastSaved" class="text-xs text-muted">
              Saved {{ formattedLastSaved }}
            </span>
          </div>
        </template>

        <template #right>
          <UButton
            label="Preview"
            icon="i-lucide-eye"
            color="neutral"
            variant="outline"
            :disabled="!title || isLoading"
            @click="preview"
          />
          <UButton
            label="Save Draft"
            color="neutral"
            :loading="isSaving"
            :disabled="isLoading"
            @click="saveDraft"
          />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <template #left>
          <UTabs
          v-model="mode"
            class="mt-3"
            :items="tabs"
            orientation="horizontal"
          />
        </template>
      </UDashboardToolbar>
    </template>

    <template #body>
      <div v-if="isLoading" class="flex items-center justify-center h-full">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <!-- Design Mode -->
      <div v-else-if="mode === 'design'" class="flex h-full">
        <!-- Component Palette Sidebar -->
        <div class="w-64 border-r border-default bg-muted/5 shrink-0">
          <EditorComponentPalette @insert="insertComponent" />
        </div>

        <!-- Editor Area -->
        <div class="flex-1 overflow-auto">
          <EditorToolbar :editor="editorRef?.editor" @insert-component="insertComponent" />
          <div class="max-w-4xl mx-auto py-8">
            <EditorTiptapEditor 
              ref="editorRef"
              v-model="content" 
              :autosave="true"
              @save="handleAutoSave"
            />
          </div>
        </div>
      </div>

      <!-- Publish Mode -->
      <div v-else-if="mode === 'publish'" class="max-w-4xl mx-auto space-y-6 p-6">
        <UCard class="ring-1 ring-default">
          <template #header>
            <h3 class="text-lg font-semibold">Publishing Options</h3>
          </template>

          <div class="space-y-6">
            <div>
              <label class="block text-sm font-medium mb-2">Target Audience</label>
              <URadioGroup
                :options="[
                  { label: 'All Employees', value: 'all' },
                  { label: 'Specific Groups', value: 'groups' },
                  { label: 'Specific Contacts', value: 'contacts' }
                ]"
              />
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Notifications</label>
              <div class="space-y-2">
                <UCheckbox label="Send email notification" />
                <UCheckbox label="Send push notification" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Schedule</label>
              <URadioGroup
                :options="[
                  { label: 'Publish now', value: 'now' },
                  { label: 'Schedule for later', value: 'scheduled' }
                ]"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton label="Cancel" color="neutral" variant="ghost" to="/pages" />
              <UButton label="Publish Page" icon="i-lucide-send" />
            </div>
          </template>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
  <EditorPreviewDisplay 
    v-model:is-open="showPreview" 
    :content="content"
    :title="title"
  />
</template>

