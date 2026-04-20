import { create } from 'zustand'

export interface Order {
  id: string
  shopId: string
  shopName?: string
  status: string
  paymentMethod: string
  paymentStatus: string
  totalAmount: number
  deliveryAddress: string
  createdAt: string
  deliveryBoyName?: string
  items: OrderItem[]
}

export interface OrderItem {
  productId: string
  name: string
  imageUrl: string | null
  quantity: number
  price: number
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  isLoading: boolean
  error: string | null
  setOrders: (orders: Order[]) => void
  setCurrentOrder: (order: Order | null) => void
  addOrder: (order: Order) => void
  updateOrderStatus: (orderId: string, status: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useOrderStore = create<OrderState>()((set) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  setOrders: (orders) => set({ orders }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
      currentOrder:
        state.currentOrder?.id === orderId
          ? { ...state.currentOrder, status }
          : state.currentOrder,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
