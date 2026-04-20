export type UserRole = 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_BOY' | 'ADMIN'

export interface User {
  id: string
  email: string
  phone: string
  name: string
  role: UserRole
  avatar: string | null
  isVerified: boolean
  isBlocked: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}
