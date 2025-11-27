export default function useUser() {
  const user = useSupabaseUser()
  const userProfile = useFetch(`/api/users/${user.value?.sub}`, { watch: [user] })


  return computed(() => {
    return {
      ...user.value,
      firstName: userProfile.data.value?.firstName,
      lastName: userProfile.data.value?.lastName,
      companyId: userProfile.data.value?.companyId,
    }
  })
}