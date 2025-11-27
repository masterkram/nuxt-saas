<script setup lang="ts">
const props = defineProps<{
  attrs: {
    title?: string
    message?: string
    required?: boolean
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
const isChecked = ref(props.validation?.response?.confirmed || false)
const isSubmitting = ref(false)
const isSubmitted = ref(props.validation?.hasResponded || false)

async function submitConfirmation() {
  if (!isChecked.value) {
    toast.add({
      title: 'Confirmation Required',
      description: 'Please check the box to confirm.',
      color: 'warning'
    })
    return
  }

  isSubmitting.value = true

  try {
    const response = await $fetch(`/api/employee/validations/${props.validation?.id}/respond`, {
      method: 'POST',
      body: {
        confirmed: true
      }
    })

    isSubmitted.value = true
    emit('complete', response.responseData)

    toast.add({
      title: 'Confirmed',
      description: 'Thank you for your confirmation.',
      color: 'success'
    })
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to submit confirmation. Please try again.',
      color: 'error'
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="confirm-block my-6 p-6 border-l-4 border-primary rounded-r-xl bg-elevated/30">
    <div class="flex items-center gap-3 mb-4">
      <div class="p-2 rounded-lg bg-primary/10">
        <UIcon name="i-lucide-check-circle" class="size-5 text-primary-500" />
      </div>
      <div class="flex-1">
        <h3 class="font-semibold text-lg">{{ attrs.title || 'Confirmation Required' }}</h3>
      </div>
      <UBadge v-if="attrs.required" color="error" variant="subtle">Required</UBadge>
      <UBadge v-if="isSubmitted" color="success" variant="subtle">
        <UIcon name="i-lucide-check" class="size-3 mr-1" />
        Confirmed
      </UBadge>
    </div>

    <div class="flex items-start gap-4">
      <div class="pt-0.5">
        <input
          v-model="isChecked"
          type="checkbox"
          :disabled="isSubmitted"
          class="size-5 rounded border-2 border-default text-primary-500 focus:ring-primary-500 cursor-pointer disabled:cursor-default disabled:opacity-75"
        >
      </div>
      <div class="flex-1">
        <p class="text-muted">{{ attrs.message || 'I confirm that I have read and understood this information.' }}</p>
      </div>
    </div>

    <!-- Submit Button -->
    <div v-if="!isSubmitted" class="mt-4 flex justify-end">
      <UButton
        label="Confirm"
        icon="i-lucide-check"
        :loading="isSubmitting"
        :disabled="!isChecked"
        @click="submitConfirmation"
      />
    </div>
  </div>
</template>

