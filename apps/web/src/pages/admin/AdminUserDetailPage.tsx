import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { adminApi } from '@/lib/api'
import { ArrowLeft, User, Mail, Phone } from 'lucide-react'

export default function AdminUserDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchUser() }, [id])

  const fetchUser = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers()
      const found = (res.data.data || []).find((u: any) => u.id === id)
      setUser(found || null)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  if (loading) return <DashboardLayout role="admin"><p className="text-center py-8">Loading...</p></DashboardLayout>
  if (!user) return <DashboardLayout role="admin"><p className="text-center py-8">User not found.</p></DashboardLayout>

  const roleColors: Record<string, string> = { CUSTOMER: 'default', SHOP_OWNER: 'secondary', DELIVERY_BOY: 'outline', ADMIN: 'destructive' }

  const detailsPanel = (
    <div className="p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <User className="size-5 text-primary" />
        <h3 className="font-semibold">{user.name}</h3>
      </div>
      <Separator />
      <div className="flex flex-col gap-3 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" /><span>{user.email}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" /><span>{user.phone}</span></div>
      </div>
      <Separator />
      <div className="flex flex-col gap-2">
        <Badge variant={(roleColors[user.role] || 'outline') as any}>{user.role}</Badge>
        <Badge variant={(user.isBlocked ? 'destructive' : 'default') as any}>{user.isBlocked ? 'Blocked' : 'Active'}</Badge>
      </div>
    </div>
  )

  return (
    <DashboardLayout role="admin" detailsPanel={detailsPanel}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Link to="/admin/users"><ArrowLeft className="size-4" /> Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.name}</h1>
            <p className="text-sm text-muted-foreground">User Details</p>
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-muted-foreground">Email:</span><p className="font-medium">{user.email}</p></div>
            <div><span className="text-muted-foreground">Phone:</span><p className="font-medium">{user.phone}</p></div>
            <div><span className="text-muted-foreground">Role:</span><p className="font-medium">{user.role}</p></div>
            <div><span className="text-muted-foreground">Status:</span><p className="font-medium">{user.isBlocked ? 'Blocked' : 'Active'}</p></div>
            <div><span className="text-muted-foreground">Verified:</span><p className="font-medium">{user.isVerified ? 'Yes' : 'No'}</p></div>
            <div><span className="text-muted-foreground">Joined:</span><p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p></div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
