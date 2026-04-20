export const ROLES = {
  ADMIN: 'ADMIN',
  SHOP_OWNER: 'SHOP_OWNER',
  DELIVERY_BOY: 'DELIVERY_BOY',
  CUSTOMER: 'CUSTOMER',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]
