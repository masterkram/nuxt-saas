<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'

const props = defineProps<{
  editor: Editor | null
}>()

const emit = defineEmits<{
  'insert-component': [type: string]
}>()

const textFormats = [
  { label: 'Paragraph', action: () => props.editor?.chain().focus().setParagraph().run(), active: 'paragraph' },
  { label: 'Heading 1', action: () => props.editor?.chain().focus().toggleHeading({ level: 1 }).run(), active: 'heading', level: 1 },
  { label: 'Heading 2', action: () => props.editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: 'heading', level: 2 },
  { label: 'Heading 3', action: () => props.editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: 'heading', level: 3 }
]

const isActive = (name: string, attrs?: any) => {
  return props.editor?.isActive(name, attrs)
}
</script>

<template>
  <div v-if="editor" class="editor-toolbar sticky bg-white dark:bg-gray-900 top-0 z-10 bg-background border-b border-default p-4">
    <div class="flex flex-wrap gap-2">
      <!-- Text Formatting -->
      <div class="flex gap-1 border-r border-default pr-2">
        <UButton
          icon="tabler:bold"
          color="neutral"
          :variant="isActive('bold') ? 'solid' : 'ghost'"
          square
          title="Bold"
          @click="editor.chain().focus().toggleBold().run()"
        />
        <UButton
          icon="tabler:italic"
          color="neutral"
          :variant="isActive('italic') ? 'solid' : 'ghost'"
          square
          title="Italic"
          @click="editor.chain().focus().toggleItalic().run()"
        />
        <UButton
          icon="tabler:underline"
          color="neutral"
          :variant="isActive('underline') ? 'solid' : 'ghost'"
          square
          title="Underline"
          @click="editor.chain().focus().toggleUnderline().run()"
        />
        <UButton
          icon="tabler:strikethrough"
          color="neutral"
          :variant="isActive('strike') ? 'solid' : 'ghost'"
          square
          title="Strikethrough"
          @click="editor.chain().focus().toggleStrike().run()"
        />
      </div>

      <!-- Alignment -->
      <div class="flex gap-1 border-r border-default pr-2">
        <UButton
          icon="tabler:align-left"
          color="neutral"
          :variant="isActive({ textAlign: 'left' }) ? 'solid' : 'ghost'"
          square
          title="Align Left"
          @click="editor.chain().focus().setTextAlign('left').run()"
        />
        <UButton
          icon="tabler:align-center"
          color="neutral"
          :variant="isActive({ textAlign: 'center' }) ? 'solid' : 'ghost'"
          square
          title="Align Center"
          @click="editor.chain().focus().setTextAlign('center').run()"
        />
        <UButton
          icon="tabler:align-right"
          color="neutral"
          :variant="isActive({ textAlign: 'right' }) ? 'solid' : 'ghost'"
          square
          title="Align Right"
          @click="editor.chain().focus().setTextAlign('right').run()"
        />
      </div>

      <!-- Lists -->
      <div class="flex gap-1 border-r border-default pr-2">
        <UButton
          icon="tabler:list"
          color="neutral"
          :variant="isActive('bulletList') ? 'solid' : 'ghost'"
          square
          title="Bullet List"
          @click="editor.chain().focus().toggleBulletList().run()"
        />
        <UButton
          icon="tabler:list-numbers"
          color="neutral"
          :variant="isActive('orderedList') ? 'solid' : 'ghost'"
          square
          title="Ordered List"
          @click="editor.chain().focus().toggleOrderedList().run()"
        />
      </div>

      <!-- Content Components -->
      <div class="flex gap-1 border-r border-default pr-2">
        <UButton
          icon="tabler:photo"
          color="neutral"
          variant="ghost"
          square
          title="Insert Image"
          @click="emit('insert-component', 'image')"
        />
        <UButton
          icon="tabler:video"
          color="neutral"
          variant="ghost"
          square
          title="Insert Video"
          @click="emit('insert-component', 'video')"
        />
      </div>

      <!-- Layout Components -->
      <div class="flex gap-1 border-r border-default pr-2">
        <UButton
          icon="tabler:grid"
          color="neutral"
          variant="ghost"
          square
          title="Insert Grid"
          @click="emit('insert-component', 'grid')"
        />
        <UButton
          icon="tabler:square"
          color="neutral"
          variant="ghost"
          square
          title="Insert Button"
          @click="emit('insert-component', 'button')"
        />
      </div>

      <!-- Validation Components -->
      <div class="flex gap-1">
        <UButton
          icon="tabler:help-circle"
          color="neutral"
          variant="ghost"
          square
          title="Insert Quiz"
          @click="emit('insert-component', 'quiz')"
        />
        <UButton
          icon="tabler:circle-check"
          color="neutral"
          variant="ghost"
          square
          title="Insert Confirm"
          @click="emit('insert-component', 'confirm')"
        />
      </div>
    </div>
  </div>
</template>

