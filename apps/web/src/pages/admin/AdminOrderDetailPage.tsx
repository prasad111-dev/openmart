import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Package, User, Store, MapPin } from 'lucide-react'

export default function AdminOrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchOrder() }, [id])

  const fetchOrder = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getOrders()
      const found = (res.data.data || []).find((o: any) => o.id === id)
      setOrder(found || null)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) return <DashboardLayout role="admin"><p className="text-center py-8">Loading...</p></DashboardLayout>
  if (!order) return <DashboardLayout role="admin"><p className="text-center py-8">Order not found.</p></DashboardLayout>

  const detailsPanel = (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2"><Package className="size-5 text-primary" /><h3 className="font-semibold">Order #{order.id?.slice(0, 8)}</h3></div>
      <Separator />
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><User className="size-4" /><span>{order.customerName || order.customer?.name}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Store className="size-4" /><span>{order.shopName || order.shop?.name}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="size-4" /><span>{order.deliveryAddress || order.deliveryAddress?.street}</span></div>
      </div>
      <Separator />
      <Badge variant="default" className="w-fit">{order.status}</Badge>
      <p className="text-lg font-bold">Rs.{order.totalAmount}</p>
    </div>
  )

  return (
    <DashboardLayout role="admin" detailsPanel={detailsPanel}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Link to="/admin/orders"><ArrowLeft className="size-4" /> Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order #{order.id?.slice(0, 8)}</h1>
            <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.customerName || order.customer?.name}</p>
              <p className="text-muted-foreground">{order.customer?.phone}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Shop</CardTitle></CardHeader>
            <CardContent className="text-sm">
              <p className="font-medium">{order.shopName || order.shop?.name}</p>
              <p className="text-muted-foreground">{order.deliveryAddress || order.deliveryAddress?.street}</p>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status:</span><Badge>{order.status}</Badge></div>
            <div className="flex justify-between text-sm mt-2"><span className="text-muted-foreground">Payment:</span><Badge variant="secondary">{order.paymentStatus || 'PENDING'}</Badge></div>
            <div className="flex justify-between text-lg font-bold mt-4"><span>Total:</span><span>Rs.{order.totalAmount}</span></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
