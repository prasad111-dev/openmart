import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Truck } from 'lucide-react'
import { deliveryApi } from '@/lib/api'

export default function DeliveryEarningsPage() {
  const [earnings, setEarnings] = useState({ today: 0, week: 0, month: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    deliveryApi.list()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        const completed = data.filter((d: any) => d.status === 'DELIVERED')
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const weekStart = new Date(todayStart)
        weekStart.setDate(weekStart.getDate() - todayStart.getDay())
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

        let todayTotal = 0
        let weekTotal = 0
        let monthTotal = 0

        completed.forEach((d: any) => {
          const date = new Date(d.deliveredAt || d.updatedAt || d.createdAt)
          const earning = d.earning ?? d.deliveryCharge ?? 30
          if (date >= todayStart) todayTotal += earning
          if (date >= weekStart) weekTotal += earning
          if (date >= monthStart) monthTotal += earning
        })

        setEarnings({ today: todayTotal, week: weekTotal, month: monthTotal })
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load earnings')
        setLoading(false)
      })
  }, [])

  if (loading) return <DashboardLayout role="delivery_boy"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="delivery_boy"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="delivery_boy">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Earnings</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{earnings.today}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{earnings.week}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <Truck className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{earnings.month}</div></CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
