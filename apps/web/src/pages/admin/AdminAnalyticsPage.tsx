import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api'

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.getStats()
      .then((res) => {
        setStats(res.data.data || res.data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load analytics')
        setLoading(false)
      })
  }, [])

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <div className="grid gap-4 sm:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">₹{stats?.revenue ?? stats?.totalRevenue ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orders</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.orders ?? stats?.totalOrders ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shops</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.shops ?? stats?.totalShops ?? 0}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{stats?.users ?? stats?.totalUsers ?? 0}</div></CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>Charts</CardTitle></CardHeader>
          <CardContent className="flex h-64 items-center justify-center text-muted-foreground">
            Charts coming soon
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
