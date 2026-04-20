import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { adminApi } from '@/lib/api'
import { ArrowLeft, Store, User, Phone, Mail, MapPin } from 'lucide-react'

export default function AdminShopDetailPage() {
  const { id } = useParams()
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => { fetchShop() }, [id])

  const fetchShop = async () => {
    setLoading(true)
    try {
      const shopsRes = await adminApi.getShops()
      const allShops = shopsRes.data.data || []
      const found = allShops.find((s: any) => s.id === id)
      setShop(found || null)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) return <DashboardLayout role="admin"><p className="text-center py-8">Loading...</p></DashboardLayout>
  if (!shop) return <DashboardLayout role="admin"><p className="text-center py-8">Shop not found.</p></DashboardLayout>

  const detailsPanel = (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Store className="size-5 text-primary" />
        <h3 className="font-semibold text-foreground">{shop.name}</h3>
      </div>
      <Separator />
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User className="size-4" />
          <span>{shop.owner?.name}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone className="size-4" />
          <span>{shop.owner?.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail className="size-4" />
          <span>{shop.owner?.email}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="size-4" />
          <span>{shop.address}, {shop.pincode}</span>
        </div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <Badge variant={shop.isApproved ? 'default' : 'secondary'}>
          {shop.isApproved ? (shop.isOpen ? 'Active' : 'Closed') : 'Pending'}
        </Badge>
        <p className="text-xs text-muted-foreground">Category: {shop.category}</p>
        <p className="text-xs text-muted-foreground">Commission: {shop.commissionRate}%</p>
      </div>
    </div>
  )

  return (
    <DashboardLayout role="admin" detailsPanel={detailsPanel}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Link to="/admin/shops"><ArrowLeft className="size-4" /> Back</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{shop.name}</h1>
            <p className="text-sm text-muted-foreground">Shop Details</p>
          </div>
        </div>

        <div className="flex gap-2">
          {['info', 'orders', 'products'].map(tab => (
            <Button key={tab} variant={activeTab === tab ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab(tab)}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Button>
          ))}
        </div>

        {activeTab === 'info' && (
          <Card>
            <CardHeader><CardTitle>Shop Information</CardTitle><CardDescription>Details about this shop</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Name:</span><p className="font-medium">{shop.name}</p></div>
                <div><span className="text-muted-foreground">Category:</span><p className="font-medium">{shop.category}</p></div>
                <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{shop.phone}</p></div>
                <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{shop.email || '—'}</p></div>
                <div><span className="text-muted-foreground">Address:</span><p className="font-medium">{shop.address}</p></div>
                <div><span className="text-muted-foreground">Pincode:</span><p className="font-medium">{shop.pincode}</p></div>
                <div><span className="text-muted-foreground">Delivery Radius:</span><p className="font-medium">{shop.deliveryRadius} km</p></div>
                <div><span className="text-muted-foreground">Commission:</span><p className="font-medium">{shop.commissionRate}%</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card>
            <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Order history coming soon.</p>
            </CardContent>
          </Card>
        )}

        {activeTab === 'products' && (
          <Card>
            <CardHeader><CardTitle>Products</CardTitle></CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground py-8">Product list coming soon.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
