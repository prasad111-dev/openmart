import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/lib/api'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { token } = useAuthStore()

  // Set initial auth header on mount — subsequent requests use the axios interceptor
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }, []) // Only on mount

  return <>{children}</>
}
