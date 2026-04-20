import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store'

interface RoleRouteProps {
  children: React.ReactNode
  roles: string[]
}

export function RoleRoute({ children, roles }: RoleRouteProps) {
  const { isAuthenticated, user } = useAuthStore()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}
