import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'

export interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  createdAt: string
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAddresses = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/addresses')
      setAddresses(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createAddress = useCallback(async (addressData: any) => {
    setIsLoading(true)
    setError(null)
    try {
      const { data } = await api.post('/addresses', addressData)
      setAddresses((prev) => [...prev, data.data])
      return data.data
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteAddress = useCallback(async (id: string) => {
    try {
      await api.delete(`/api/addresses/${id}`)
      setAddresses((prev) => prev.filter((a) => a.id !== id))
    } catch (err: any) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  return {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    createAddress,
    deleteAddress,
  }
}
