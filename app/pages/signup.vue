<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'companyName',
  type: 'text',
  label: 'Company Name',
  placeholder: 'Enter your company name',
  required: true
}, {
  name: 'firstName',
  type: 'text',
  label: 'First Name',
  placeholder: 'Enter your first name',
  required: true
}, {
  name: 'lastName',
  type: 'text',
  label: 'Last Name',
  placeholder: 'Enter your last name',
  required: true
}, {
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Create a password',
  required: true
}, {
  name: 'confirmPassword',
  label: 'Confirm Password',
  type: 'password',
  placeholder: 'Confirm your password',
  required: true
}, {
  name: 'terms',
  label: 'I agree to the terms and conditions',
  type: 'checkbox',
  required: true
}]

const schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // TODO: Implement actual user registration
  try {
    console.log('Signup attempt:', event.data)
    
    toast.add({
      title: 'Success',
      description: 'Account created successfully',
      color: 'success'
    })
    
    // Redirect to dashboard
    router.push('/')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to create account',
      color: 'error'
    })
  }
}
</script>

<template>
  <UPageCard>
    <UAuthForm
      :schema="schema"
      title="Create your account"
      description="Get started with Enlace and engage your employees"
      icon="i-lucide-user-plus"
      :fields="fields"
      submit-label="Create account"
      @submit="onSubmit"
    >
      <template #footer>
        <p>
          Already have an account?
          <NuxtLink to="/login" class="font-medium text-primary hover:underline">
            Sign in
          </NuxtLink>
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
