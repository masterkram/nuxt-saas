<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import { ImageBlock } from './extensions/ImageBlock'
import { VideoBlock } from './extensions/VideoBlock'
import { GridBlock } from './extensions/GridBlock'
import { ButtonBlock } from './extensions/ButtonBlock'
import { QuizBlock } from './extensions/QuizBlock'
import { ConfirmBlock } from './extensions/ConfirmBlock'

const props = defineProps<{
  modelValue: any
  autosave?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
  'save': []
}>()

const editor = useEditor({
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3, 4, 5, 6]
      }
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph']
    }),
    TextStyle,
    Color,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-primary-500 underline'
      }
    }),
    Placeholder.configure({
      placeholder: 'Start writing your content or add components...'
    }),
    Image,
    ImageBlock,
    VideoBlock,
    GridBlock,
    ButtonBlock,
    QuizBlock,
    ConfirmBlock
  ],
  content: props.modelValue || '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[500px] p-8'
    }
  },
  onUpdate: ({ editor }) => {
    const json = editor.getJSON()
    emit('update:modelValue', json)
  }
})

// Auto-save every 30 seconds
let autosaveInterval: NodeJS.Timeout | null = null

onMounted(() => {
  if (props.autosave) {
    autosaveInterval = setInterval(() => {
      emit('save')
    }, 30000)
  }
})

onUnmounted(() => {
  if (autosaveInterval) {
    clearInterval(autosaveInterval)
  }
  editor.value?.destroy()
})

// Watch for external content changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && JSON.stringify(editor.value.getJSON()) !== JSON.stringify(newValue)) {
    editor.value.commands.setContent(newValue, false)
  }
})

defineExpose({
  editor
})
</script>

<template>
  <div class="tiptap-editor">
    <EditorContent :editor="editor" />
  </div>
</template>

<style>
.tiptap-editor {
  @apply w-full;
}

.tiptap-editor .ProseMirror {
  @apply focus:outline-none;
}

/* Custom block styles 
.tiptap-editor .image-block,
.tiptap-editor .video-block,
.tiptap-editor .grid-block,
.tiptap-editor .button-block,
.tiptap-editor .quiz-block,
.tiptap-editor .confirm-block {
  @apply my-4 p-4 border-2 border-dashed border-default rounded-lg;
}


.tiptap-editor .image-block:hover,
.tiptap-editor .video-block:hover,
.tiptap-editor .grid-block:hover,
.tiptap-editor .button-block:hover,
.tiptap-editor .quiz-block:hover,
.tiptap-editor .confirm-block:hover {
  @apply border-primary bg-muted/10;
}
*/
</style>

