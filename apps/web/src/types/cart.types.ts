export interface CartItem {
  productId: string
  name: string
  price: number
  imageUrl: string | null
  quantity: number
  stock: number
}

export interface Cart {
  shopId: string
  shopName?: string
  items: CartItem[]
  total: number
}
