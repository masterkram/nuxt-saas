<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient();

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const toast = useToast()

const fields: AuthFormField[] = [{
  name: 'email',
  type: 'email',
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password',
  placeholder: 'Enter your password',
  required: true
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox',
  description: 'Stay logged in for 30 days'
}]

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

type Schema = z.output<typeof schema>

async function onSubmit(event: FormSubmitEvent<Schema>) {
  // TODO: Implement actual authentication
  try {
    console.log('Login attempt:', event.data)

    await supabase.auth.signInWithPassword({
      email: event.data.email,
      password: event.data.password
    })
    toast.add({
      title: 'Success',
      description: 'Logged in successfully',
      color: 'success'
    })
    
    // Redirect to dashboard
    router.push('/')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Invalid credentials',
      color: 'error'
    })
  }
}
</script>

<template>
  <UPageCard>
    <UAuthForm
      :schema="schema"
      title="Welcome back"
      description="Enter your credentials to access your account"
      icon="i-lucide-shield-check"
      :fields="fields"
      submit-label="Sign in"
      @submit="onSubmit"
    >
      <template #footer>
        <p>
          Don't have an account?
          <NuxtLink to="/signup" class="font-medium text-primary hover:underline">
            Sign up
          </NuxtLink>
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
