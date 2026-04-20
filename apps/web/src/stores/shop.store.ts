import { create } from 'zustand'

export interface Shop {
  id: string
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
  createdAt: string
}

interface ShopState {
  shops: Shop[]
  currentShop: Shop | null
  isLoading: boolean
  error: string | null
  setShops: (shops: Shop[]) => void
  setCurrentShop: (shop: Shop | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useShopStore = create<ShopState>()((set) => ({
  shops: [],
  currentShop: null,
  isLoading: false,
  error: null,
  setShops: (shops) => set({ shops }),
  setCurrentShop: (shop) => set({ currentShop: shop }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
