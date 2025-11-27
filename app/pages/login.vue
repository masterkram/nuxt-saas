<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent, AuthFormField } from '@nuxt/ui'

const supabase = useSupabaseClient()

definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const toast = useToast()
const isLoading = ref(false)

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
  isLoading.value = true
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: event.data.email,
      password: event.data.password
    })

    if (error) throw error

    // Get user role from our database
    const userProfile = await $fetch(`/api/users/${data.user?.id}`)
    
    toast.add({
      title: 'Success',
      description: 'Logged in successfully',
      color: 'success'
    })
    
    // Redirect based on role
    if (userProfile?.role === 'admin' || userProfile?.role === 'super_admin' || userProfile?.role === 'editor') {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.message || 'Invalid credentials',
      color: 'error'
    })
  } finally {
    isLoading.value = false
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
          <NuxtLink to="/signup" class="font-medium text-primary-500 hover:underline">
            Sign up
          </NuxtLink>
        </p>
      </template>
    </UAuthForm>
  </UPageCard>
</template>
