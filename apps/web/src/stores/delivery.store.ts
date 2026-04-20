import { create } from 'zustand'

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
}

interface DeliveryState {
  deliveries: Delivery[]
  currentDelivery: Delivery | null
  isLoading: boolean
  error: string | null
  setDeliveries: (deliveries: Delivery[]) => void
  setCurrentDelivery: (delivery: Delivery | null) => void
  updateDeliveryStatus: (deliveryId: string, status: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useDeliveryStore = create<DeliveryState>()((set) => ({
  deliveries: [],
  currentDelivery: null,
  isLoading: false,
  error: null,
  setDeliveries: (deliveries) => set({ deliveries }),
  setCurrentDelivery: (delivery) => set({ currentDelivery: delivery }),
  updateDeliveryStatus: (deliveryId, status) =>
    set((state) => ({
      deliveries: state.deliveries.map((d) =>
        d.id === deliveryId ? { ...d, status } : d,
      ),
      currentDelivery:
        state.currentDelivery?.id === deliveryId
          ? { ...state.currentDelivery, status }
          : state.currentDelivery,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}))
