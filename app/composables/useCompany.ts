/**
 * Composable for managing the current company context across the application
 * Uses Nuxt's useState to share state globally
 * Note: Each user belongs to exactly one company (users.companyId in schema)
 */

export interface Company {
  id: string
  name: string
  slug: string
  logo?: string
  brandingConfig?: {
    logo?: string
    primaryColor?: string
    secondaryColor?: string
    fontFamily?: string
    fontHeadingFamily?: string
  }
}

export default function useCompany() {
  const user = useUser();
  const company = useFetch(`/api/companies/${user.value?.companyId}`, { watch: [user] })
  return {
    company: computed(() => company.data.value),
    isLoading: computed(() => company.status.value === 'pending'),
  }
}

