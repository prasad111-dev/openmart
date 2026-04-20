import { useCartStore } from '@/stores/cart.store'

export function useCart() {
  const {
    carts,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    clearAll,
    getCart,
    getAllCarts,
    getTotalItemsCount,
    getTotalAmount,
  } = useCartStore()

  return {
    carts,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    clearAll,
    getCart,
    getAllCarts,
    getTotalItemsCount,
    getTotalAmount,
  }
}
