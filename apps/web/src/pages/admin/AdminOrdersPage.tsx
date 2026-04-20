import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { adminApi } from '@/lib/api'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.getOrders()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setOrders(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load orders')
        setLoading(false)
      })
  }, [])

  const total = orders.length
  const pending = orders.filter((o) => o.status === 'PENDING').length
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length
  const cancelled = orders.filter((o) => o.status === 'CANCELLED').length

  const statusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'warning'
      case 'DELIVERED': return 'success'
      case 'CANCELLED': return 'destructive'
      case 'CONFIRMED': return 'default'
      default: return 'secondary'
    }
  }

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{total}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{delivered}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{cancelled}</div></CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Shop</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No orders found.</TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.slice(0, 8)}</TableCell>
                      <TableCell>{order.customer?.name || order.userName || '—'}</TableCell>
                      <TableCell>{order.shop?.name || order.shopName || '—'}</TableCell>
                      <TableCell>₹{order.totalAmount ?? order.amount ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
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
