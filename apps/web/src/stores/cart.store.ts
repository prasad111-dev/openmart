import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

interface CartState {
  carts: Record<string, Cart>
  addItem: (shopId: string, item: CartItem) => void
  updateQuantity: (shopId: string, productId: string, quantity: number) => void
  removeItem: (shopId: string, productId: string) => void
  clearCart: (shopId: string) => void
  clearAll: () => void
  getCart: (shopId: string) => Cart | null
  getAllCarts: () => Cart[]
  getTotalItemsCount: () => number
  getTotalAmount: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      carts: {},

      addItem: (shopId, item) => {
        set((state) => {
          const cart = state.carts[shopId] || { shopId, items: [], total: 0 }
          const existingItem = cart.items.find((i) => i.productId === item.productId)
          if (existingItem) {
            existingItem.quantity += item.quantity
          } else {
            cart.items.push(item)
          }
          cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
          return { carts: { ...state.carts, [shopId]: cart } }
        })
      },

      updateQuantity: (shopId, productId, quantity) => {
        set((state) => {
          const cart = state.carts[shopId]
          if (!cart) return state
          const item = cart.items.find((i) => i.productId === productId)
          if (item) {
            item.quantity = quantity
            cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
          }
          return { carts: { ...state.carts, [shopId]: { ...cart } } }
        })
      },

      removeItem: (shopId, productId) => {
        set((state) => {
          const cart = state.carts[shopId]
          if (!cart) return state
          cart.items = cart.items.filter((i) => i.productId !== productId)
          cart.total = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
          if (cart.items.length === 0) {
            const { [shopId]: removed, ...rest } = state.carts
            return { carts: rest }
          }
          return { carts: { ...state.carts, [shopId]: { ...cart } } }
        })
      },

      clearCart: (shopId) => {
        set((state) => {
          const { [shopId]: removed, ...rest } = state.carts
          return { carts: rest }
        })
      },

      clearAll: () => set({ carts: {} }),

      getCart: (shopId) => get().carts[shopId] || null,

      getAllCarts: () => Object.values(get().carts),

      getTotalItemsCount: () => {
        let count = 0
        Object.values(get().carts).forEach((cart) => {
          count += cart.items.length
        })
        return count
      },

      getTotalAmount: () => {
        let total = 0
        Object.values(get().carts).forEach((cart) => {
          total += cart.total
        })
        return total
      },
    }),
    { name: 'cart-storage' },
  )
)
