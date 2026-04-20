import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { adminApi } from '@/lib/api'
import { Search, Store } from 'lucide-react'

export default function AdminShopsPage() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => { fetchShops() }, [statusFilter])

  const fetchShops = async () => {
    setLoading(true)
    try {
      const res = await adminApi.getShops(statusFilter !== 'all' ? statusFilter : undefined)
      setShops(res.data.data || [])
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const filtered = shops.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.owner?.name?.toLowerCase().includes(search.toLowerCase())
  )

  const statusCounts = {
    all: shops.length,
    pending: shops.filter((s: any) => !s.isApproved).length,
    approved: shops.filter((s: any) => s.isApproved && s.isOpen).length,
    closed: shops.filter((s: any) => s.isApproved && !s.isOpen).length,
  }

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Shops</h1>

        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { label: 'Total', count: statusCounts.all },
            { label: 'Pending', count: statusCounts.pending },
            { label: 'Approved', count: statusCounts.approved },
            { label: 'Closed', count: statusCounts.closed },
          ].map(s => (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{s.label}</CardTitle>
                <Store className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{s.count}</div></CardContent>
            </Card>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Search shops..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <div className="flex gap-2">
            {['all', 'pending', 'approved', 'closed'].map(status => (
              <Button key={status} variant={statusFilter === status ? 'default' : 'outline'} size="sm" onClick={() => setStatusFilter(status)}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No shops found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Shop</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((shop: any) => (
                    <TableRow key={shop.id}>
                      <TableCell className="font-medium">{shop.name}</TableCell>
                      <TableCell>{shop.owner?.name || '—'}</TableCell>
                      <TableCell>{shop.category}</TableCell>
                      <TableCell>
                        <Badge variant={shop.isApproved ? 'default' : 'secondary'}>
                          {shop.isApproved ? (shop.isOpen ? 'Active' : 'Closed') : 'Pending'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Link to={`/admin/shops/${shop.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
