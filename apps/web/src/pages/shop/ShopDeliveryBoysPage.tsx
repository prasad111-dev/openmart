import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useSeo } from '@/hooks/useSeo'
import { DashboardLayout } from '@/components/layout/DashboardLayout'

export default function ShopDeliveryBoysPage() {
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  useSeo({ title: 'Delivery Boys' })
  useEffect(() => { if (!isAuthenticated || user?.role !== 'SHOP_OWNER') navigate('/login') }, [isAuthenticated, user, navigate])
  if (!isAuthenticated || user?.role !== 'SHOP_OWNER') return null
  return (
    <DashboardLayout role="shop_owner">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Delivery Boys</h1>
      </div>
    </DashboardLayout>
  )
}
