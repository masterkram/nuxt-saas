<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

const props = defineProps<{
  node: any
  updateAttributes: (attrs: any) => void
  deleteNode: () => void
  selected: boolean
}>()

const isEditing = ref(false)
const title = ref(props.node.attrs.title || 'Quiz')
const required = ref(props.node.attrs.required || false)
const showResults = ref(props.node.attrs.showResults || true)
const questions = ref(props.node.attrs.questions || [
  {
    id: '1',
    question: 'What is the correct answer?',
    type: 'multiple_choice',
    options: ['Option A', 'Option B', 'Option C'],
    correctAnswer: 'Option A'
  }
])

function addQuestion() {
  questions.value.push({
    id: Date.now().toString(),
    question: 'New question',
    type: 'multiple_choice',
    options: ['Option A', 'Option B'],
    correctAnswer: 'Option A'
  })
}

function removeQuestion(id: string) {
  questions.value = questions.value.filter(q => q.id !== id)
}

function addOption(question: any) {
  question.options.push(`Option ${question.options.length + 1}`)
}

function removeOption(question: any, index: number) {
  question.options.splice(index, 1)
}

function saveQuiz() {
  props.updateAttributes({
    title: title.value,
    questions: questions.value,
    required: required.value,
    showResults: showResults.value
  })
  isEditing.value = false
}
</script>

<template>
  <NodeViewWrapper class="quiz-block" :class="{ 'ring-2 ring-primary': selected }">
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-help-circle" class="size-5 text-primary" />
          <h4 class="font-semibold">{{ node.attrs.title }}</h4>
          <UBadge v-if="node.attrs.required" color="error" variant="subtle" size="xs">Required</UBadge>
        </div>
        <UButton 
          :label="isEditing ? 'Done' : 'Edit'" 
          :icon="isEditing ? 'i-lucide-check' : 'i-lucide-pencil'" 
          size="xs" 
          @click="isEditing ? saveQuiz() : isEditing = true" 
        />
      </div>

      <div v-if="isEditing" class="space-y-4 p-3 bg-muted/20 rounded-lg">
        <UFormGroup label="Quiz Title">
          <UInput v-model="title" placeholder="Quiz title" />
        </UFormGroup>

        <div class="flex gap-4">
          <UCheckbox v-model="required" label="Required" />
          <UCheckbox v-model="showResults" label="Show Results" />
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-sm font-medium">Questions</label>
            <UButton label="Add Question" icon="i-lucide-plus" size="xs" @click="addQuestion" />
          </div>

          <div v-for="(question, qIndex) in questions" :key="question.id" class="p-3 bg-background rounded-lg border border-default space-y-3">
            <div class="flex gap-2">
              <div class="flex-1">
                <UFormGroup :label="`Question ${qIndex + 1}`">
                  <UInput v-model="question.question" placeholder="Enter question" />
                </UFormGroup>
              </div>
              <UButton 
                icon="i-lucide-trash" 
                size="xs" 
                color="error" 
                variant="ghost" 
                @click="removeQuestion(question.id)"
                class="mt-6"
              />
            </div>

            <UFormGroup label="Question Type">
              <USelect 
                v-model="question.type" 
                :options="[
                  { label: 'Multiple Choice', value: 'multiple_choice' },
                  { label: 'True/False', value: 'true_false' }
                ]"
              />
            </UFormGroup>

            <div v-if="question.type === 'multiple_choice'" class="space-y-2">
              <label class="text-sm font-medium">Options</label>
              <div v-for="(option, oIndex) in question.options" :key="oIndex" class="flex gap-2">
                <UInput v-model="question.options[oIndex]" class="flex-1" />
                <UButton 
                  icon="i-lucide-x" 
                  size="xs" 
                  color="error" 
                  variant="ghost" 
                  @click="removeOption(question, oIndex)"
                />
              </div>
              <UButton 
                label="Add Option" 
                icon="i-lucide-plus" 
                size="xs" 
                variant="ghost" 
                @click="addOption(question)" 
              />
            </div>

            <UFormGroup label="Correct Answer">
              <USelect 
                v-if="question.type === 'multiple_choice'"
                v-model="question.correctAnswer" 
                :options="question.options"
              />
              <USelect 
                v-else
                v-model="question.correctAnswer" 
                :options="['True', 'False']"
              />
            </UFormGroup>
          </div>
        </div>

        <div class="flex gap-2">
          <UButton label="Save" @click="saveQuiz" size="sm" />
          <UButton label="Delete Block" color="error" variant="outline" @click="deleteNode" size="sm" />
        </div>
      </div>

      <div v-else class="space-y-4 p-4 bg-muted/10 rounded-lg">
        <div v-for="(question, index) in node.attrs.questions" :key="question.id" class="space-y-2">
          <p class="font-medium">{{ index + 1 }}. {{ question.question }}</p>
          <div v-if="question.type === 'multiple_choice'" class="space-y-1 pl-4">
            <div v-for="option in question.options" :key="option" class="flex items-center gap-2">
              <div class="size-4 rounded-full border-2 border-default" />
              <span class="text-sm">{{ option }}</span>
            </div>
          </div>
          <div v-else class="space-y-1 pl-4">
            <div class="flex items-center gap-2">
              <div class="size-4 rounded-full border-2 border-default" />
              <span class="text-sm">True</span>
            </div>
            <div class="flex items-center gap-2">
              <div class="size-4 rounded-full border-2 border-default" />
              <span class="text-sm">False</span>
            </div>
          </div>
        </div>
        <p class="text-xs text-muted italic">Preview mode - answers will be interactive for employees</p>
      </div>
    </div>
  </NodeViewWrapper>
</template>

