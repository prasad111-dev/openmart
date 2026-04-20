import { useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useAuthStore } from '@/store'
import { useSeo } from '@/hooks/useSeo'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function ShopOrderDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  useSeo({ title: 'Order Detail' })
  useEffect(() => { if (!isAuthenticated || user?.role !== 'SHOP_OWNER') navigate('/login') }, [isAuthenticated, user, navigate])
  if (!isAuthenticated || user?.role !== 'SHOP_OWNER') return null
  return (
    <DashboardLayout role="shop_owner">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Link to="/shop/orders"><ArrowLeft className="size-4" /> Back</Link></Button>
          <h1 className="text-2xl font-bold text-foreground">Order #{id?.slice(0, 8)}</h1>
        </div>
      </div>
    </DashboardLayout>
  )
}
