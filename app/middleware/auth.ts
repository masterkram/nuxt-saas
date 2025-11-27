export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser()

  // If not authenticated, redirect to login
  if (!user.value) {
    return navigateTo('/login')
  }
})

