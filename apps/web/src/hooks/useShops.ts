import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/api'
import { useShopStore } from '@/stores/shop.store'

export function useShops() {
  const { shops, currentShop, isLoading, error, setShops, setCurrentShop, setLoading, setError } = useShopStore()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')

  const fetchShops = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (category) params.set('category', category)
      const { data } = await api.get(`/api/shops?${params}`)
      setShops(data.data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [search, category, setLoading, setError, setShops])

  const fetchShop = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get(`/api/shops/${id}`)
      setCurrentShop(data.data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [setLoading, setError, setCurrentShop])

  useEffect(() => {
    fetchShops()
  }, [fetchShops])

  return {
    shops,
    currentShop,
    isLoading,
    error,
    search,
    setSearch,
    category,
    setCategory,
    fetchShops,
    fetchShop,
  }
}
