import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Truck } from 'lucide-react'
import { deliveryApi } from '@/lib/api'

export default function DeliveryAssignmentsPage() {
  const [assignments, setAssignments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    deliveryApi.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        const active = data.filter((a: any) => a.status !== 'DELIVERED')
        setAssignments(active)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load assignments')
        setLoading(false)
      })
  }, [])

  const pending = assignments.filter((a) => a.status === 'PENDING' || a.status === 'ASSIGNED').length
  const accepted = assignments.filter((a) => a.status === 'ACCEPTED').length
  const inTransit = assignments.filter((a) => a.status === 'IN_TRANSIT' || a.status === 'PICKED_UP').length

  const handleAction = async (id: string, action: string) => {
    try {
      await deliveryApi.updateStatus(id, action)
      setAssignments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: action } : a))
      )
    } catch {
      setError('Failed to update assignment')
    }
  }

  if (loading) return <DashboardLayout role="delivery_boy"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="delivery_boy"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="delivery_boy">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Assignments</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-yellow-600">{pending}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Accepted</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-blue-600">{accepted}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Transit</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-orange-600">{inTransit}</div></CardContent>
          </Card>
        </div>
        {assignments.length === 0 ? (
          <p className="text-center text-muted-foreground">No assignments yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {assignments.map((assignment) => (
              <Card key={assignment.id}>
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex flex-col gap-1">
                      <div className="font-medium">Order #{assignment.orderId?.slice(0, 8) || assignment.order?.id?.slice(0, 8) || '—'}</div>
                      <div className="text-sm text-muted-foreground">
                        Shop: {assignment.shop?.name || assignment.shopName || '—'} → Customer: {assignment.customer?.name || assignment.customerName || '—'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Distance: {assignment.distance || '—'} | Status: <Badge variant={assignment.status === 'PENDING' ? 'warning' : 'default'}>{assignment.status}</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {assignment.status === 'PENDING' || assignment.status === 'ASSIGNED' ? (
                        <>
                          <Button size="sm" onClick={() => handleAction(assignment.id, 'ACCEPTED')}>Accept</Button>
                          <Button variant="outline" size="sm" onClick={() => handleAction(assignment.id, 'REJECTED')}>Reject</Button>
                        </>
                      ) : assignment.status === 'ACCEPTED' ? (
                        <Button size="sm" onClick={() => handleAction(assignment.id, 'IN_TRANSIT')}>Start Delivery</Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
