<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}>()

const isEditing = ref(false)
const imageUrl = ref(props.node.attrs.src || '')
const altText = ref(props.node.attrs.alt || '')
const caption = ref(props.node.attrs.caption || '')

function saveImage() {
  props.updateAttributes({
    src: imageUrl.value,
    alt: altText.value,
    caption: caption.value
  })
  isEditing.value = false
}

function handleFileUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // TODO: Implement actual file upload to storage
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <NodeViewWrapper class="image-block" :class="{ 'ring-2 ring-primary': selected }">
    <div v-if="!node.attrs.src || isEditing" class="space-y-3">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-image" class="size-5 text-primary" />
        <h4 class="font-semibold">Image Block</h4>
      </div>
      
      <UFormGroup label="Image URL">
        <UInput v-model="imageUrl" placeholder="https://example.com/image.jpg" />
      </UFormGroup>

      <UFormGroup label="Or Upload Image">
        <input 
          type="file" 
          accept="image/*" 
          @change="handleFileUpload"
          class="block w-full text-sm text-muted file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
        />
      </UFormGroup>

      <UFormGroup label="Alt Text">
        <UInput v-model="altText" placeholder="Description of the image" />
      </UFormGroup>

      <UFormGroup label="Caption (optional)">
        <UInput v-model="caption" placeholder="Image caption" />
      </UFormGroup>

      <div class="flex gap-2">
        <UButton label="Save" @click="saveImage" size="sm" />
        <UButton label="Delete" color="error" variant="outline" @click="deleteNode" size="sm" />
      </div>
    </div>

    <div v-else class="space-y-2">
      <img :src="node.attrs.src" :alt="node.attrs.alt" class="w-full rounded-lg" />
      <p v-if="node.attrs.caption" class="text-sm text-center text-muted">{{ node.attrs.caption }}</p>
      <div class="flex gap-2 justify-center">
        <UButton label="Edit" icon="i-lucide-pencil" size="xs" variant="ghost" @click="isEditing = true" />
        <UButton label="Delete" icon="i-lucide-trash" size="xs" variant="ghost" color="error" @click="deleteNode" />
      </div>
    </div>
  </NodeViewWrapper>
</template>

