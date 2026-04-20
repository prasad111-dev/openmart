import { useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useDeliveryStore } from '@/stores/delivery.store'

export function useDeliveries() {
  const { deliveries, currentDelivery, isLoading, error, setDeliveries, updateDeliveryStatus, setLoading, setError } = useDeliveryStore()

  const fetchDeliveries = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/delivery/assignments')
      setDeliveries(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setDeliveries])

  const updateStatus = useCallback(async (deliveryId: string, status: string) => {
    try {
      await api.put(`/api/delivery/${deliveryId}/update-status`, { status })
      updateDeliveryStatus(deliveryId, status)
    } catch (err: any) {
      setError(err.message)
    }
  }, [updateDeliveryStatus, setError])

  const verifyOtp = useCallback(async (deliveryId: string, otp: string) => {
    try {
      const { data } = await api.post(`/api/delivery/${deliveryId}/verify-otp`, { otp })
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }, [setError])

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

  return {
    deliveries,
    currentDelivery,
    isLoading,
    error,
    fetchDeliveries,
    updateStatus,
    verifyOtp,
  }
}
