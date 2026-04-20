import { useAuthStore } from '@/stores/auth.store'

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout, updateUser } = useAuthStore()

  return {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
    updateUser,
  }
}
