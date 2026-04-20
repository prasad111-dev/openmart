export interface User {
  id: string
  email: string
  phone: string
  name: string
  role: string
  isVerified: boolean
  isBlocked: boolean
  shopId: string | null
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
  latitude: number | null
  longitude: number | null
  createdAt: string
  updatedAt: string
}

export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string | null
  address: string
  pincode: string
  phone: string
  email: string | null
  category: string
  isApproved: boolean
  isOpen: boolean
  deliveryRadius: number
  rating: number
  commissionRate: number
  shopType: string
  monthlySubscriptionFee: number
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  shopId: string
  name: string
  description: string | null
  price: number
  category: string
  stock: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  customerId: string
  shopId: string
  deliveryBoyId: string | null
  deliveryAddressId: string
  status: string
  paymentMethod: string
  paymentStatus: string
  totalAmount: number
  specialInstructions: string | null
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
}

export interface Delivery {
  id: string
  orderId: string
  deliveryBoyId: string
  shopId: string
  status: string
  pickupTime: string | null
  deliveredTime: string | null
  otpVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  userId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId: string
  type: string
  channel: string
  content: string
  status: string
  attempts: number
  createdAt: string
  updatedAt: string
}

export interface SellerPayment {
  id: string
  shopId: string
  amount: number
  note: string | null
  paymentDate: string
  createdAt: string
}

export interface PlatformSettings {
  id: string
  platformFee: number
  deliveryCharge: number
  freeDeliveryThreshold: number
  minimumOrderAmount: number
  basicPlanPrice: number
  basicPlanFeatures: string
  standardPlanPrice: number
  standardPlanFeatures: string
  premiumPlanPrice: number
  premiumPlanFeatures: string
  defaultCommissionRate: number
}

export interface Category {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  isActive: boolean
  type: string
  createdAt: string
  updatedAt: string
}
