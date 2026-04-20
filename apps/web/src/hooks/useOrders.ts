import { useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useOrderStore } from '@/stores/order.store'

export function useOrders() {
  const { orders, currentOrder, isLoading, error, setOrders, setCurrentOrder, addOrder, updateOrderStatus, setLoading, setError } = useOrderStore()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/orders')
      setOrders(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setOrders])

  const fetchOrder = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/orders/${id}`)
      setCurrentOrder(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setCurrentOrder])

  const createOrder = useCallback(async (orderData: any) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/orders', orderData)
      addOrder(data.data)
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, addOrder])

  const updateStatus = useCallback(async (orderId: string, status: string) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status })
      updateOrderStatus(orderId, status)
    } catch (err: any) {
      setError(err.message)
    }
  }, [updateOrderStatus, setError])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    fetchOrders,
    fetchOrder,
    createOrder,
    updateStatus,
  }
}
