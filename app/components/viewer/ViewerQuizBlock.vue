<script setup lang="ts">
const props = defineProps<{
  attrs: {
    title?: string
    questions?: Array<{
      id: string
      question: string
      type: 'multiple_choice' | 'true_false'
      options?: string[]
      correctAnswer?: string
    }>
    required?: boolean
    showResults?: boolean
  }
  validation?: {
    id: string
    hasResponded: boolean
    response: any
  }
  pageSlug: string
}>()

const emit = defineEmits<{
  complete: [response: any]
}>()

const toast = useToast()
const answers = ref<Record<string, string>>({})
const isSubmitting = ref(false)
const isSubmitted = ref(props.validation?.hasResponded || false)
const result = ref<{ score: number; passed: boolean } | null>(
  props.validation?.response || null
)

const questions = computed(() => props.attrs.questions || [])

async function submitQuiz() {
  // Check if all questions are answered
  const unanswered = questions.value.filter(q => !answers.value[q.id])
  if (unanswered.length > 0) {
    toast.add({
      title: 'Incomplete',
      description: 'Please answer all questions before submitting.',
      color: 'warning'
    })
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch(`/api/employee/validations/${props.validation?.id}/respond`, {
      method: 'POST',
      body: {
        answers: answers.value
      }
    })

    result.value = response.responseData
    isSubmitted.value = true
    emit('complete', response.responseData)

    toast.add({
      title: 'Quiz Submitted',
      description: result.value?.passed 
        ? `Congratulations! You scored ${result.value.score}%` 
        : `You scored ${result.value?.score}%. Keep learning!`,
      color: result.value?.passed ? 'success' : 'warning'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to submit quiz. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}

// Initialize answers from previous response
onMounted(() => {
  if (props.validation?.response?.answers) {
    answers.value = props.validation.response.answers
  }
})
</script>

<template>
  <div class="quiz-block my-6 p-6 border border-default rounded-xl bg-elevated/30">
    <div class="flex items-center gap-3 mb-4">
      <div class="p-2 rounded-lg bg-primary/10">
        <UIcon name="i-lucide-help-circle" class="size-5 text-primary-500" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ attrs.title || 'Quiz' }}</h3>
        <p class="text-sm text-muted">Test your knowledge</p>
      </div>
      <UBadge v-if="attrs.required" color="error" variant="subtle">Required</UBadge>
      <UBadge v-if="isSubmitted" color="success" variant="subtle">
        <UIcon name="i-lucide-check" class="size-3 mr-1" />
        Completed
      </UBadge>
    </div>

    <!-- Results Summary (if submitted and showResults is true) -->
    <div v-if="isSubmitted && result && attrs.showResults" class="mb-6 p-4 rounded-lg" :class="result.passed ? 'bg-success/10' : 'bg-warning/10'">
      <div class="flex items-center gap-3">
        <div class="p-2 rounded-full" :class="result.passed ? 'bg-success/20' : 'bg-warning/20'">
          <UIcon 
            :name="result.passed ? 'i-lucide-check-circle' : 'i-lucide-alert-circle'" 
            class="size-6" 
            :class="result.passed ? 'text-success' : 'text-warning'"
          />
        </div>
        <div>
          <p class="font-semibold" :class="result.passed ? 'text-success' : 'text-warning'">
            {{ result.passed ? 'Passed!' : 'Not Passed' }}
          </p>
          <p class="text-sm text-muted">Score: {{ result.score }}%</p>
        </div>
      </div>
    </div>

    <!-- Questions -->
    <div class="space-y-6">
      <div 
        v-for="(question, qIndex) in questions" 
        :key="question.id"
        class="space-y-3"
      >
        <p class="font-medium">
          <span class="text-primary-500 mr-2">{{ qIndex + 1 }}.</span>
          {{ question.question }}
        </p>

        <!-- Multiple Choice Options -->
        <div v-if="question.type === 'multiple_choice'" class="space-y-2 pl-6">
          <label 
            v-for="option in question.options" 
            :key="option"
            class="flex items-center gap-3 p-3 rounded-lg border border-default cursor-pointer transition-colors"
            :class="{
              'bg-primary/10 border-primary': answers[question.id] === option,
              'hover:bg-muted/30': !isSubmitted,
              'opacity-75 cursor-default': isSubmitted
            }"
          >
            <input
              v-model="answers[question.id]"
              type="radio"
              :name="`question-${question.id}`"
              :value="option"
              :disabled="isSubmitted"
              class="sr-only"
            >
            <div 
              class="size-5 rounded-full border-2 flex items-center justify-center transition-colors"
              :class="answers[question.id] === option ? 'border-primary bg-primary' : 'border-default'"
            >
              <div v-if="answers[question.id] === option" class="size-2 rounded-full bg-white" />
            </div>
            <span class="flex-1">{{ option }}</span>
            
            <!-- Show correct/incorrect indicators after submission -->
            <UIcon 
              v-if="isSubmitted && attrs.showResults && option === question.correctAnswer"
              name="i-lucide-check" 
              class="size-5 text-success"
            />
            <UIcon 
              v-if="isSubmitted && attrs.showResults && answers[question.id] === option && option !== question.correctAnswer"
              name="i-lucide-x" 
              class="size-5 text-error"
            />
          </label>
        </div>

        <!-- True/False Options -->
        <div v-else-if="question.type === 'true_false'" class="flex gap-3 pl-6">
          <label 
            v-for="option in ['True', 'False']" 
            :key="option"
            class="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border border-default cursor-pointer transition-colors"
            :class="{
              'bg-primary/10 border-primary': answers[question.id] === option,
              'hover:bg-muted/30': !isSubmitted,
              'opacity-75 cursor-default': isSubmitted
            }"
          >
            <input
              v-model="answers[question.id]"
              type="radio"
              :name="`question-${question.id}`"
              :value="option"
              :disabled="isSubmitted"
              class="sr-only"
            >
            <span class="font-medium">{{ option }}</span>
            
            <!-- Show correct/incorrect indicators after submission -->
            <UIcon 
              v-if="isSubmitted && attrs.showResults && option === question.correctAnswer"
              name="i-lucide-check" 
              class="size-4 text-success"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div v-if="!isSubmitted" class="mt-6 flex justify-end">
      <UButton
        label="Submit Quiz"
        icon="i-lucide-send"
        :loading="isSubmitting"
        @click="submitQuiz"
      />
    </div>
  </div>
</template>

