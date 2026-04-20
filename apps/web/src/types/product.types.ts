export interface Product {
  id: string
  shopId: string
  name: string
  description: string | null
  price: number
  mrp: number | null
  category: string
  stock: number
  imageUrl: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}
