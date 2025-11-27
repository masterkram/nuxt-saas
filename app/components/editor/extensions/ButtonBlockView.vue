<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}>()

const isEditing = ref(false)
const label = ref(props.node.attrs.label || 'Button')
const url = ref(props.node.attrs.url || '')
const color = ref(props.node.attrs.color || 'primary')
const variant = ref(props.node.attrs.variant || 'solid')
const size = ref(props.node.attrs.size || 'md')
const alignment = ref(props.node.attrs.alignment || 'left')

const colorOptions = ['primary', 'secondary', 'success', 'error', 'neutral']
const variantOptions = ['solid', 'outline', 'ghost']
const sizeOptions = ['xs', 'sm', 'md', 'lg', 'xl']
const alignmentOptions = ['left', 'center', 'right']

function saveButton() {
  props.updateAttributes({
    label: label.value,
    url: url.value,
    color: color.value,
    variant: variant.value,
    size: size.value,
    alignment: alignment.value
  })
  isEditing.value = false
}
</script>

<template>
  <NodeViewWrapper class="button-block" :class="{ 'ring-2 ring-primary': selected }">
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-square" class="size-5 text-primary" />
          <h4 class="font-semibold">Button</h4>
        </div>
        <UButton 
          :label="isEditing ? 'Done' : 'Edit'" 
          :icon="isEditing ? 'i-lucide-check' : 'i-lucide-pencil'" 
          size="xs" 
          @click="isEditing ? saveButton() : isEditing = true" 
        />
      </div>

      <div v-if="isEditing" class="space-y-3 p-3 bg-muted/20 rounded-lg">
        <UFormGroup label="Button Label">
          <UInput v-model="label" placeholder="Click me" />
        </UFormGroup>

        <UFormGroup label="URL">
          <UInput v-model="url" placeholder="https://example.com" />
        </UFormGroup>

        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Color">
            <USelect v-model="color" :options="colorOptions" />
          </UFormGroup>
          <UFormGroup label="Variant">
            <USelect v-model="variant" :options="variantOptions" />
          </UFormGroup>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Size">
            <USelect v-model="size" :options="sizeOptions" />
          </UFormGroup>
          <UFormGroup label="Alignment">
            <USelect v-model="alignment" :options="alignmentOptions" />
          </UFormGroup>
        </div>

        <div class="flex gap-2">
          <UButton label="Save" @click="saveButton" size="sm" />
          <UButton label="Delete" color="error" variant="outline" @click="deleteNode" size="sm" />
        </div>
      </div>

      <div v-else :class="`flex justify-${alignment}`">
        <UButton 
          :label="node.attrs.label"
          :color="node.attrs.color"
          :variant="node.attrs.variant"
          :size="node.attrs.size"
          :to="node.attrs.url"
          target="_blank"
        />
      </div>
    </div>
  </NodeViewWrapper>
</template>

