<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}>()

const columns = ref(props.node.attrs.columns || 2)
const gap = ref(props.node.attrs.gap || 4)
const items = ref(props.node.attrs.items || [
  { id: '1', title: 'Item 1', content: 'Description' },
  { id: '2', title: 'Item 2', content: 'Description' }
])

const isEditing = ref(false)

function addItem() {
  items.value.push({
    id: Date.now().toString(),
    title: `Item ${items.value.length + 1}`,
    content: 'Description'
  })
}

function removeItem(id: string) {
  items.value = items.value.filter(item => item.id !== id)
}

function saveGrid() {
  props.updateAttributes({
    columns: columns.value,
    gap: gap.value,
    items: items.value
  })
  isEditing.value = false
}
</script>

<template>
  <NodeViewWrapper class="grid-block" :class="{ 'ring-2 ring-primary': selected }">
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-grid-2x2" class="size-5 text-primary-500" />
          <h4 class="font-semibold">Grid Layout</h4>
        </div>
        <UButton 
          :label="isEditing ? 'Done' : 'Edit'" 
          :icon="isEditing ? 'i-lucide-check' : 'i-lucide-pencil'" 
          size="xs" 
          @click="isEditing ? saveGrid() : isEditing = true" 
        />
      </div>

      <div v-if="isEditing" class="space-y-3 p-3 bg-muted/20 rounded-lg">
        <div class="grid grid-cols-2 gap-3">
          <UFormGroup label="Columns">
            <USelect v-model="columns" :options="[1, 2, 3, 4]" />
          </UFormGroup>
          <UFormGroup label="Gap">
            <USelect v-model="gap" :options="[2, 4, 6, 8]" />
          </UFormGroup>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Grid Items</label>
            <UButton label="Add Item" icon="i-lucide-plus" size="xs" @click="addItem" />
          </div>
          
          <div v-for="item in items" :key="item.id" class="flex gap-2 p-2 bg-background rounded border border-default">
            <div class="flex-1 space-y-2">
              <UInput v-model="item.title" placeholder="Item title" size="sm" />
              <UInput v-model="item.content" placeholder="Item content" size="sm" />
            </div>
            <UButton icon="i-lucide-trash" size="xs" color="error" variant="ghost" @click="removeItem(item.id)" />
          </div>
        </div>

        <div class="flex gap-2">
          <UButton label="Save" size="sm" @click="saveGrid" />
          <UButton label="Delete Block" color="error" variant="outline" size="sm" @click="deleteNode" />
        </div>
      </div>

      <div v-else :class="`grid grid-cols-${columns} gap-${gap}`">
        <div 
          v-for="item in items" 
          :key="item.id" 
          class="p-4 border border-default rounded-lg"
        >
          <h5 class="font-semibold mb-2">{{ item.title }}</h5>
          <p class="text-sm text-muted">{{ item.content }}</p>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

