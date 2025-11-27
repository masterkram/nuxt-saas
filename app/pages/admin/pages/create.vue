<script setup lang="ts">
const router = useRouter()
const toast = useToast()

// Get company context from global state
const { company } = useCompany()

// Get authenticated user from Supabase
const user = useSupabaseUser()

const pageId = ref<string | null>(null)
const title = ref('')
const content = ref({})
const pageStatus = ref<'draft' | 'published' | 'archived'>('draft')
const mode = ref<'design' | 'publish' | 'analytics'>('design')
const showPreview = ref(false)
const isSaving = ref(false)
const isPublishing = ref(false)
const lastSaved = ref<Date | null>(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const editorRef = ref<{ editor: any } | null>(null)

// Publish mode state
const targetType = ref<'all' | 'groups' | 'contacts'>('all')
const selectedGroupIds = ref<string[]>([])
const selectedContactIds = ref<string[]>([])
const notifyEmail = ref(false)
const notifyPush = ref(false)

// Fetch groups for selection
const { data: groups } = await useFetch('/api/groups', {
  query: computed(() => ({
    companyId: company.value?.id
  })),
  watch: [company]
})

// Fetch contacts for selection
const { data: contacts } = await useFetch('/api/contacts', {
  query: computed(() => ({
    companyId: company.value?.id,
    status: 'active'
  })),
  watch: [company]
})

const tabs = computed(() => [{
  label: 'Design',
  value: 'design',
  icon: 'i-lucide-layout'
}, {
  label: 'Publish',
  value: 'publish',
  icon: 'i-lucide-send',
  disabled: !title.value || !pageId.value
}, {
  label: 'Analytics',
  value: 'analytics',
  icon: 'i-lucide-bar-chart',
  disabled: true
}])

const groupOptions = computed(() => {
  return (groups.value || []).map(g => ({
    label: `${g.name} (${g.memberCount} members)`,
    value: g.id
  }))
})

const contactOptions = computed(() => {
  return (contacts.value || []).map(c => ({
    label: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.email,
    value: c.id
  }))
})

async function saveDraft() {
  if (!company.value?.id) {
    toast.add({
      title: 'No company selected',
      description: 'Please select a company first',
      color: 'error'
    })
    return
  }

  if (!title.value.trim()) {
    toast.add({
      title: 'Title required',
      description: 'Please enter a page title',
      color: 'warning'
    })
    return
  }

  isSaving.value = true
  try {
    if (pageId.value) {
      // Update existing page
      await $fetch(`/api/pages/${pageId.value}`, {
        method: 'PUT',
        body: {
          companyId: company.value?.id,
          title: title.value,
          content: content.value,
          status: 'draft'
        }
      })
    } else {
      // Create new page
      const newPage = await $fetch('/api/pages', {
        method: 'POST',
        body: {
          companyId: company.value?.id,
          userId: user.value?.id,
          title: title.value,
          content: content.value,
          status: 'draft'
        }
      })
      if (newPage) {
        pageId.value = newPage.id
        // Update URL without reloading
        router.replace(`/admin/pages/${newPage.id}/edit`)
      }
    }
    
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

async function publishPage() {
  if (!pageId.value) {
    toast.add({
      title: 'Save first',
      description: 'Please save the page before publishing',
      color: 'warning'
    })
    return
  }

  // Validate selection
  if (targetType.value === 'groups' && selectedGroupIds.value.length === 0) {
    toast.add({
      title: 'No groups selected',
      description: 'Please select at least one group to publish to',
      color: 'warning'
    })
    return
  }

  if (targetType.value === 'contacts' && selectedContactIds.value.length === 0) {
    toast.add({
      title: 'No contacts selected',
      description: 'Please select at least one contact to publish to',
      color: 'warning'
    })
    return
  }

  isPublishing.value = true
  try {
    // First save any pending changes
    await $fetch(`/api/pages/${pageId.value}`, {
      method: 'PUT',
      body: {
        companyId: company.value?.id,
        title: title.value,
        content: content.value
      }
    })

    // Then publish
    await $fetch(`/api/pages/${pageId.value}/publish`, {
      method: 'POST',
      body: {
        targetType: targetType.value,
        targetIds: targetType.value === 'groups' 
          ? selectedGroupIds.value 
          : targetType.value === 'contacts' 
            ? selectedContactIds.value 
            : undefined,
        notifyEmail: notifyEmail.value,
        notifyPush: notifyPush.value
      }
    })

    pageStatus.value = 'published'
    toast.add({
      title: 'Page Published!',
      description: getPublishSuccessMessage(),
      color: 'success'
    })

    // Navigate to the edit page
    router.push(`/admin/pages/${pageId.value}/edit`)
  } catch (error: unknown) {
    console.error('Error publishing page:', error)
    const errData = error as { data?: { message?: string } }
    toast.add({
      title: 'Error publishing',
      description: errData.data?.message || 'Please try again',
      color: 'error'
    })
  } finally {
    isPublishing.value = false
  }
}

function getPublishSuccessMessage(): string {
  if (targetType.value === 'all') {
    return 'Your page is now visible to all employees'
  } else if (targetType.value === 'groups') {
    return `Your page is now visible to ${selectedGroupIds.value.length} group(s)`
  } else {
    return `Your page is now visible to ${selectedContactIds.value.length} contact(s)`
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
  if (title.value && pageId.value) {
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
    if (title.value && pageId.value) {
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

// Reset selections when target type changes
watch(targetType, () => {
  selectedGroupIds.value = []
  selectedContactIds.value = []
})

definePageMeta({
  layout: 'admin'
})
</script>

<template>
  <div>
  <UDashboardPanel id="page-editor">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <div class="flex items-center gap-3">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              to="/admin/pages"
            />
            <div class="h-6 w-px bg-default" />
            <UInput
              v-model="title"
              placeholder="Untitled Page"
              class="w-64"
              :ui="{ base: 'font-semibold' }"
            />
            <UBadge color="neutral" variant="subtle">
              {{ pageId ? 'Draft' : 'New' }}
            </UBadge>
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
            :disabled="!title"
            @click="preview"
          />
          <UButton
            label="Save Draft"
            color="neutral"
            :loading="isSaving"
            :disabled="!title"
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
      <!-- Design Mode -->
      <div v-if="mode === 'design'" class="flex h-full">
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
      <div v-else-if="mode === 'publish'" class="max-w-2xl mx-auto space-y-6 p-6">
        <!-- Save First Notice -->
        <UCard v-if="!pageId" class="bg-warning/5 border-warning/20">
          <div class="flex items-start gap-4">
            <div class="p-2 rounded-lg bg-warning/10">
              <UIcon name="i-lucide-alert-circle" class="size-6 text-warning" />
            </div>
            <div>
              <h3 class="font-semibold text-warning">Save your page first</h3>
              <p class="text-sm text-muted mt-1">
                You need to save your page as a draft before you can publish it.
              </p>
              <UButton 
                label="Save Draft" 
                class="mt-3" 
                size="sm"
                :loading="isSaving"
                @click="saveDraft"
              />
            </div>
          </div>
        </UCard>

        <template v-else>
          <!-- Target Audience -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-users" class="size-5 text-primary-500" />
                <h3 class="font-semibold">Target Audience</h3>
              </div>
            </template>

            <div class="space-y-4">
              <URadioGroup
                v-model="targetType"
                :items="[
                  { label: 'All Employees', value: 'all', description: 'Everyone in your organization will see this page' },
                  { label: 'Specific Groups', value: 'groups', description: 'Only members of selected groups will see this page' },
                  { label: 'Specific Contacts', value: 'contacts', description: 'Only selected individuals will see this page' }
                ]"
              />

              <!-- Group Selection -->
              <div v-if="targetType === 'groups'" class="mt-4 p-4 bg-muted/10 rounded-lg">
                <label class="block text-sm font-medium mb-2">Select Groups</label>
                <USelectMenu
                  v-model="selectedGroupIds"
                  :items="groupOptions"
                  multiple
                  placeholder="Select groups..."
                  searchable
                  :search-placeholder="'Search groups...'"
                  value-key="value"
                >
                  <template #empty>
                    <div class="text-center py-4 text-muted">
                      <p>No groups found.</p>
                      <UButton 
                        label="Create Group" 
                        variant="link" 
                        to="/admin/groups/create"
                        size="sm"
                      />
                    </div>
                  </template>
                </USelectMenu>
                <p v-if="selectedGroupIds.length > 0" class="text-sm text-muted mt-2">
                  {{ selectedGroupIds.length }} group(s) selected
                </p>
              </div>

              <!-- Contact Selection -->
              <div v-if="targetType === 'contacts'" class="mt-4 p-4 bg-muted/10 rounded-lg">
                <label class="block text-sm font-medium mb-2">Select Contacts</label>
                <USelectMenu
                  v-model="selectedContactIds"
                  :items="contactOptions"
                  multiple
                  placeholder="Select contacts..."
                  searchable
                  :search-placeholder="'Search contacts...'"
                  value-key="value"
                >
                  <template #empty>
                    <div class="text-center py-4 text-muted">
                      <p>No contacts found.</p>
                      <UButton 
                        label="Add Contact" 
                        variant="link" 
                        to="/admin/contacts/create"
                        size="sm"
                      />
                    </div>
                  </template>
                </USelectMenu>
                <p v-if="selectedContactIds.length > 0" class="text-sm text-muted mt-2">
                  {{ selectedContactIds.length }} contact(s) selected
                </p>
              </div>
            </div>
          </UCard>

          <!-- Notifications -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-bell" class="size-5 text-primary-500" />
                <h3 class="font-semibold">Notifications</h3>
              </div>
            </template>

            <div class="space-y-4">
              <div class="flex items-start gap-3">
                <UCheckbox v-model="notifyEmail" />
                <div class="flex-1">
                  <label class="font-medium cursor-pointer" @click="notifyEmail = !notifyEmail">
                    Send email notification
                  </label>
                  <p class="text-sm text-muted">
                    Recipients will receive an email with a link to view the page
                  </p>
                </div>
              </div>

              <div class="flex items-start gap-3">
                <UCheckbox v-model="notifyPush" disabled />
                <div class="flex-1 opacity-50">
                  <label class="font-medium">
                    Send push notification
                  </label>
                  <p class="text-sm text-muted">
                    Coming soon - Recipients will receive a push notification
                  </p>
                </div>
              </div>
            </div>
          </UCard>

          <!-- Summary & Publish Button -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-clipboard-list" class="size-5 text-primary-500" />
                <h3 class="font-semibold">Summary</h3>
              </div>
            </template>

            <div class="space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-muted">Page Title</span>
                <span class="font-medium">{{ title || 'Untitled' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Target Audience</span>
                <span class="font-medium">
                  <template v-if="targetType === 'all'">All Employees</template>
                  <template v-else-if="targetType === 'groups'">{{ selectedGroupIds.length }} Group(s)</template>
                  <template v-else>{{ selectedContactIds.length }} Contact(s)</template>
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Email Notification</span>
                <span class="font-medium">{{ notifyEmail ? 'Yes' : 'No' }}</span>
              </div>
            </div>

            <template #footer>
              <div class="flex justify-end gap-3">
                <UButton 
                  label="Back to Editor" 
                  color="neutral" 
                  variant="ghost" 
                  @click="mode = 'design'"
                />
                <UButton 
                  label="Publish Page"
                  icon="i-lucide-send"
                  :loading="isPublishing"
                  :disabled="!title || (targetType === 'groups' && selectedGroupIds.length === 0) || (targetType === 'contacts' && selectedContactIds.length === 0)"
                  @click="publishPage"
                />
              </div>
            </template>
          </UCard>
        </template>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Preview Modal -->
  <EditorPreviewDisplay
    v-model:is-open="showPreview" 
    :content="content"
    :title="title"
  />
  </div>
</template>
