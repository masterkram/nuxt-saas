<script setup lang="ts">
/**
 * PageViewer - Read-only renderer for Tiptap content
 * Renders the page content for employees to view
 */

const props = defineProps<{
  content: any
  pageSlug: string
  validations?: Array<{
    id: string
    type: string
    config: any
    required: boolean
    hasResponded: boolean
    response: any
  }>
}>()

const emit = defineEmits<{
  validationComplete: [validationId: string, response: any]
}>()

// Recursively render Tiptap content
function renderNode(node: any, index?: number): any {
  if (!node) return null

  // Text node
  if (node.type === 'text') {
    let text = node.text || ''
    
    // Apply marks (bold, italic, etc.)
    if (node.marks) {
      for (const mark of node.marks) {
        if (mark.type === 'bold') {
          text = `<strong>${text}</strong>`
        } else if (mark.type === 'italic') {
          text = `<em>${text}</em>`
        } else if (mark.type === 'underline') {
          text = `<u>${text}</u>`
        } else if (mark.type === 'strike') {
          text = `<s>${text}</s>`
        } else if (mark.type === 'code') {
          text = `<code class="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">${text}</code>`
        } else if (mark.type === 'link') {
          const href = mark.attrs?.href || '#'
          text = `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary-500 underline hover:text-primary-500/80">${text}</a>`
        } else if (mark.type === 'textStyle' && mark.attrs?.color) {
          text = `<span style="color: ${mark.attrs.color}">${text}</span>`
        }
      }
    }
    
    return text
  }

  return null
}

function getTextAlign(node: any): string {
  if (node.attrs?.textAlign) {
    return `text-${node.attrs.textAlign}`
  }
  return ''
}

function getHeadingClass(level: number): string {
  const classes: Record<number, string> = {
    1: 'text-4xl font-bold mt-8 mb-4',
    2: 'text-3xl font-bold mt-6 mb-3',
    3: 'text-2xl font-semibold mt-5 mb-2',
    4: 'text-xl font-semibold mt-4 mb-2',
    5: 'text-lg font-medium mt-3 mb-2',
    6: 'text-base font-medium mt-3 mb-2'
  }
  return classes[level] || classes[3]
}

// Get text content from node children
function getTextContent(node: any): string {
  if (!node.content) return ''
  return node.content.map((child: any) => {
    if (child.type === 'text') return child.text || ''
    return getTextContent(child)
  }).join('')
}
</script>

<template>
  <div class="page-viewer prose prose-lg max-w-none">
    <template v-for="(node, index) in (content?.content || [])" :key="index">
      <!-- Paragraph -->
      <p 
        v-if="node.type === 'paragraph'" 
        :class="['mb-4', getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || '&nbsp;'"
      />

      <!-- Headings -->
      <h1 
        v-else-if="node.type === 'heading' && node.attrs?.level === 1"
        :class="[getHeadingClass(1), getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || ''"
      />
      <h2 
        v-else-if="node.type === 'heading' && node.attrs?.level === 2"
        :class="[getHeadingClass(2), getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || ''"
      />
      <h3 
        v-else-if="node.type === 'heading' && node.attrs?.level === 3"
        :class="[getHeadingClass(3), getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || ''"
      />
      <h4 
        v-else-if="node.type === 'heading' && node.attrs?.level === 4"
        :class="[getHeadingClass(4), getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || ''"
      />
      <h5 
        v-else-if="node.type === 'heading' && node.attrs?.level === 5"
        :class="[getHeadingClass(5), getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || ''"
      />
      <h6 
        v-else-if="node.type === 'heading' && node.attrs?.level === 6"
        :class="[getHeadingClass(6), getTextAlign(node)]"
        v-html="node.content?.map(renderNode).join('') || ''"
      />

      <!-- Bullet List -->
      <ul v-else-if="node.type === 'bulletList'" class="list-disc list-inside mb-4 space-y-1">
        <li 
          v-for="(item, itemIndex) in node.content" 
          :key="itemIndex"
          v-html="item.content?.[0]?.content?.map(renderNode).join('') || ''"
        />
      </ul>

      <!-- Ordered List -->
      <ol v-else-if="node.type === 'orderedList'" class="list-decimal list-inside mb-4 space-y-1">
        <li 
          v-for="(item, itemIndex) in node.content" 
          :key="itemIndex"
          v-html="item.content?.[0]?.content?.map(renderNode).join('') || ''"
        />
      </ol>

      <!-- Blockquote -->
      <blockquote 
        v-else-if="node.type === 'blockquote'" 
        class="border-l-4 border-primary pl-4 italic my-4 text-muted"
      >
        <template v-for="(child, childIndex) in node.content" :key="childIndex">
          <p v-html="child.content?.map(renderNode).join('') || ''" />
        </template>
      </blockquote>

      <!-- Code Block -->
      <pre 
        v-else-if="node.type === 'codeBlock'" 
        class="bg-muted p-4 rounded-lg overflow-x-auto font-mono text-sm my-4"
      ><code>{{ getTextContent(node) }}</code></pre>

      <!-- Horizontal Rule -->
      <hr v-else-if="node.type === 'horizontalRule'" class="my-8 border-default" >

      <!-- Hard Break -->
      <br v-else-if="node.type === 'hardBreak'" >

      <!-- Image Block (Custom) -->
      <ViewerImageBlock 
        v-else-if="node.type === 'imageBlock'" 
        :attrs="node.attrs" 
      />

      <!-- Video Block (Custom) -->
      <ViewerVideoBlock 
        v-else-if="node.type === 'videoBlock'" 
        :attrs="node.attrs" 
      />

      <!-- Button Block (Custom) -->
      <ViewerButtonBlock 
        v-else-if="node.type === 'buttonBlock'" 
        :attrs="node.attrs" 
      />

      <!-- Grid Block (Custom) -->
      <ViewerGridBlock 
        v-else-if="node.type === 'gridBlock'" 
        :attrs="node.attrs" 
      />

      <!-- Quiz Block (Custom) -->
      <ViewerQuizBlock 
        v-else-if="node.type === 'quizBlock'" 
        :attrs="node.attrs"
        :validation="validations?.find(v => v.type === 'quiz')"
        :page-slug="pageSlug"
        @complete="(response) => emit('validationComplete', 'quiz', response)"
      />

      <!-- Confirm Block (Custom) -->
      <ViewerConfirmBlock 
        v-else-if="node.type === 'confirmBlock'" 
        :attrs="node.attrs"
        :validation="validations?.find(v => v.type === 'confirm')"
        :page-slug="pageSlug"
        @complete="(response) => emit('validationComplete', 'confirm', response)"
      />

      <!-- Standard Image -->
      <figure v-else-if="node.type === 'image'" class="my-4">
        <img 
          :src="node.attrs?.src" 
          :alt="node.attrs?.alt || ''" 
          :title="node.attrs?.title"
          class="max-w-full rounded-lg"
        >
      </figure>
    </template>
  </div>
</template>

<style scoped>
/* .page-viewer :deep(a) {
  @apply text-primary-500 underline hover:text-primary-500/80;
}

.page-viewer :deep(strong) {
  @apply font-bold;
}

.page-viewer :deep(em) {
  @apply italic;
}

.page-viewer :deep(u) {
  @apply underline;
} */
</style>

