<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
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
  isOpen: boolean
  content: Record<string, unknown> | null
  title: string
}>()

defineEmits<{
  'update:isOpen': [value: boolean]
}>()

const viewMode = ref<'desktop' | 'mobile'>('desktop')

// Create a read-only editor for preview
const previewEditor = useEditor({
  editable: false,
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
      openOnClick: true,
      HTMLAttributes: {
        class: 'text-primary underline'
      }
    }),
    Image,
    ImageBlock,
    VideoBlock,
    GridBlock,
    ButtonBlock,
    QuizBlock,
    ConfirmBlock
  ],
  content: props.content || '',
  editorProps: {
    attributes: {
      class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none'
    }
  }
})

// Update preview when content changes
watch(() => props.content, (newContent) => {
  if (previewEditor.value && newContent) {
    previewEditor.value.commands.setContent(newContent, { emitUpdate: false })
  }
}, { deep: true })

// Update preview when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen && previewEditor.value && props.content) {
    previewEditor.value.commands.setContent(props.content, { emitUpdate: false })
  }
})

onUnmounted(() => {
  previewEditor.value?.destroy()
})
</script>

<template>
  <UModal :open="isOpen" @update:open="$emit('update:isOpen', $event)">
    <template #content>
    <div class="w-full h-full bg-gray-100 dark:bg-gray-900 flex flex-col">
      <!-- Header Controls -->
      <div class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div>
          <h3 class="text-lg font-semibold">Preview</h3>
          <p class="text-sm text-gray-500">{{ title || 'Untitled Page' }}</p>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            icon="i-lucide-monitor"
            label="Desktop"
            size="sm"
            :variant="viewMode === 'desktop' ? 'solid' : 'outline'"
            @click="viewMode = 'desktop'"
          />
          <UButton
            icon="i-lucide-smartphone"
            label="Mobile"
            size="sm"
            :variant="viewMode === 'mobile' ? 'solid' : 'outline'"
            @click="viewMode = 'mobile'"
          />
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            square
            @click="$emit('update:isOpen', false)"
          />
        </div>
      </div>

      <!-- Preview Area -->
      <div class="flex-1 flex items-center justify-center p-8 overflow-auto">
        <!-- Desktop Mockup -->
        <div v-if="viewMode === 'desktop'" class="desktop-mockup">
          <!-- Monitor Frame -->
          <div class="monitor-frame">
            <!-- Screen Bezel -->
            <div class="screen-bezel">
              <!-- Browser Chrome -->
              <div class="browser-chrome">
                <div class="flex items-center gap-2 px-4 py-2">
                  <div class="flex gap-1.5">
                    <div class="w-3 h-3 rounded-full bg-red-500" />
                    <div class="w-3 h-3 rounded-full bg-yellow-500" />
                    <div class="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div class="flex-1 mx-4 px-4 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400">
                    {{ title || 'Untitled Page' }}
                  </div>
                </div>
              </div>
              
              <!-- Content Area -->
              <div class="content-area">
                <div class="p-8">
                  <h1 class="text-3xl font-bold mb-6">{{ title || 'Untitled Page' }}</h1>
                  <div v-if="!content || Object.keys(content).length === 0" class="text-gray-500 italic text-center py-12">
                    No content yet. Start adding components to see them here.
                  </div>
                  <EditorContent v-else :editor="previewEditor" class="preview-content" />
                </div>
              </div>
            </div>
          </div>
          
          <!-- Monitor Stand -->
          <div class="monitor-stand">
            <div class="stand-neck" />
            <div class="stand-base" />
          </div>
        </div>

        <!-- Mobile Mockup -->
        <div v-else class="mobile-mockup">
          <!-- Phone Frame -->
          <div class="phone-frame">
            <!-- Notch -->
            <div class="phone-notch" />
            
            <!-- Screen -->
            <div class="phone-screen">
              <!-- Status Bar -->
              <div class="status-bar">
                <div class="text-xs font-medium">9:41</div>
                <div class="flex items-center gap-1">
                  <div class="i-lucide-signal w-3 h-3" />
                  <div class="i-lucide-wifi w-3 h-3" />
                  <div class="i-lucide-battery-charging w-3 h-3" />
                </div>
              </div>
              
              <!-- Content Area -->
              <div class="mobile-content">
                <div class="p-6">
                  <h1 class="text-2xl font-bold mb-4">{{ title || 'Untitled Page' }}</h1>
                  <div v-if="!content || Object.keys(content).length === 0" class="text-gray-500 italic text-center py-12 text-sm">
                    No content yet. Start adding components to see them here.
                  </div>
                  <EditorContent v-else :editor="previewEditor" class="preview-content" />
                </div>
              </div>
            </div>
            
            <!-- Home Indicator -->
            <div class="home-indicator" />
          </div>
        </div>
      </div>
    </div>
</template>
  </UModal>
</template>

<style scoped>
.preview-content :deep(.ProseMirror) {
  outline: none;
}

/* Desktop Mockup Styles */
.desktop-mockup {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 1200px;
  width: 100%;
}

.monitor-frame {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.screen-bezel {
  width: 100%;
  background: linear-gradient(145deg, #1f2937, #111827);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.browser-chrome {
  background: #e5e7eb;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  border-bottom: 1px solid #d1d5db;
}

.dark .browser-chrome {
  background: #374151;
  border-bottom-color: #4b5563;
}

.content-area {
  background: white;
  max-height: 600px;
  overflow-y: auto;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
}

.dark .content-area {
  background: #1f2937;
}

.monitor-stand {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -8px;
}

.stand-neck {
  width: 80px;
  height: 40px;
  background: linear-gradient(180deg, #6b7280, #4b5563);
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
}

.stand-base {
  width: 200px;
  height: 12px;
  background: linear-gradient(180deg, #4b5563, #374151);
  border-radius: 6px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* Mobile Mockup Styles */
.mobile-mockup {
  display: flex;
  align-items: center;
  justify-content: center;
}

.phone-frame {
  width: 375px;
  background: linear-gradient(145deg, #1f2937, #111827);
  border-radius: 36px;
  padding: 12px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  position: relative;
}

.phone-notch {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 24px;
  background: #111827;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  z-index: 10;
}

.phone-notch::before {
  content: '';
  position: absolute;
  top: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 4px;
  background: #374151;
  border-radius: 2px;
}

.phone-screen {
  background: white;
  border-radius: 28px;
  overflow: hidden;
  height: 667px;
  position: relative;
}

.dark .phone-screen {
  background: #1f2937;
}

.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  padding-top: 32px;
  background: white;
  color: #111827;
}

.dark .status-bar {
  background: #1f2937;
  color: white;
}

.mobile-content {
  height: calc(667px - 48px - 20px);
  overflow-y: auto;
  background: white;
}

.dark .mobile-content {
  background: #1f2937;
}

.home-indicator {
  position: absolute;
  bottom: 8px;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
}
</style>

