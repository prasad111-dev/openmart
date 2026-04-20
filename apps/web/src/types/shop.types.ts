export interface Shop {
  id: string
  ownerId: string
  name: string
  description: string | null
  imageUrl: string | null
  logoUrl: string | null
  address: string
  pincode: string
  phone: string
  email: string | null
  category: string
  isApproved: boolean
  isOpen: boolean
  deliveryRadius: number
  deliveryTime: string | null
  rating: number
  reviewCount: number
  commissionRate: number
  shopType: string
  monthlySubscriptionFee: number
  createdAt: string
  updatedAt: string
}
