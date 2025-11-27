<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}>()

const isEditing = ref(false)
const title = ref(props.node.attrs.title || 'Confirmation Required')
const message = ref(props.node.attrs.message || 'I confirm that I have read and understood this information.')
const required = ref(props.node.attrs.required || true)

function saveConfirm() {
  props.updateAttributes({
    title: title.value,
    message: message.value,
    required: required.value
  })
  isEditing.value = false
}
</script>

<template>
  <NodeViewWrapper class="confirm-block" :class="{ 'ring-2 ring-primary': selected }">
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-check-circle" class="size-5 text-primary-500" />
          <h4 class="font-semibold">{{ node.attrs.title }}</h4>
          <UBadge v-if="node.attrs.required" color="error" variant="subtle" size="xs">Required</UBadge>
        </div>
        <UButton 
          :label="isEditing ? 'Done' : 'Edit'" 
          :icon="isEditing ? 'i-lucide-check' : 'i-lucide-pencil'" 
          size="xs" 
          @click="isEditing ? saveConfirm() : isEditing = true" 
        />
      </div>

      <div v-if="isEditing" class="space-y-3 p-3 bg-muted/20 rounded-lg">
        <UFormGroup label="Title">
          <UInput v-model="title" placeholder="Confirmation title" />
        </UFormGroup>

        <UFormGroup label="Message">
          <UTextarea v-model="message" placeholder="Confirmation message" :rows="3" />
        </UFormGroup>

        <UCheckbox v-model="required" label="Required" />

        <div class="flex gap-2">
          <UButton label="Save" size="sm" @click="saveConfirm" />
          <UButton label="Delete Block" color="error" variant="outline" size="sm" @click="deleteNode" />
        </div>
      </div>

      <div v-else class="p-4 bg-muted/10 rounded-lg border-l-4 border-primary">
        <div class="flex items-start gap-3">
          <UCheckbox disabled class="mt-1" />
          <p class="text-sm flex-1">{{ node.attrs.message }}</p>
        </div>
        <p class="text-xs text-muted italic mt-2">Preview mode - checkbox will be interactive for employees</p>
      </div>
    </div>
  </NodeViewWrapper>
</template>

