import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { deliveryApi } from '@/lib/api'

export default function DeliveryHistoryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    deliveryApi.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        const completed = data.filter((d: any) => d.status === 'DELIVERED')
        setDeliveries(completed)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load delivery history')
        setLoading(false)
      })
  }, [])

  if (loading) return <DashboardLayout role="delivery_boy"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="delivery_boy"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="delivery_boy">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Delivery History</h1>
        <Card>
          <CardHeader><CardTitle>Completed Deliveries</CardTitle></CardHeader>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deliveries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No delivery history yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">{delivery.orderId?.slice(0, 8) || delivery.order?.id?.slice(0, 8) || '—'}</TableCell>
                      <TableCell>{delivery.shop?.name || delivery.shopName || '—'}</TableCell>
                      <TableCell>{delivery.customer?.name || delivery.customerName || '—'}</TableCell>
                      <TableCell>{new Date(delivery.deliveredAt || delivery.updatedAt || delivery.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Badge variant="success">Delivered</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
