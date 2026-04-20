export type UserRole = 'CUSTOMER' | 'SHOP_OWNER' | 'DELIVERY_BOY' | 'ADMIN'

export interface User {
  id: string
  email: string
  phone: string
  name: string
  role: UserRole
  isVerified: boolean
  isBlocked?: boolean
  shopId?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface Address {
  id: string
  userId: string
  label: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  createdAt: string
  updatedAt: string
}

export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string
  address: string
  pincode: string
  phone: string
  email: string
  isApproved: boolean
  isOpen: boolean
  deliveryRadius: number
  createdAt: string
  updatedAt: string
  owner?: User
  products?: Product[]
}

export interface Product {
  id: string
  shopId: string
  name: string
  description: string
  price: number
  category: string
  stock: number
  imageUrl: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type OrderStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'REJECTED' 
  | 'ASSIGNED' 
  | 'OUT_FOR_DELIVERY' 
  | 'DELIVERED' 
  | 'CANCELLED'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED'
export type PaymentMethod = 'COD'

export interface Order {
  id: string
  customerId: string
  shopId: string
  deliveryBoyId: string | null
  deliveryAddressId: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  totalAmount: number
  specialInstructions: string | null
  createdAt: string
  updatedAt: string
  customer?: User
  shop?: Shop
  deliveryBoy?: User
  deliveryAddress?: Address
  items?: OrderItem[]
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  product?: Product
}

export interface Delivery {
  id: string
  orderId: string
  deliveryBoyId: string
  shopId: string
  status: 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED'
  pickupTime: string | null
  deliveredTime: string | null
  otpVerified: boolean
  createdAt: string
  updatedAt: string
  order?: Order
  deliveryBoy?: User
}

export interface CartItem {
  productId: string
  quantity: number
  price: number
  name?: string
  product?: Product
}

export interface Cart {
  shopId: string
  items: CartItem[]
  total: number
}

export interface AuthResponse {
  token: string
  refreshToken: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}