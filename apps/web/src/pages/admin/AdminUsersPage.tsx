import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminApi } from '@/lib/api'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    adminApi.getUsers()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setUsers(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load users')
        setLoading(false)
      })
  }, [])

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive !== false && u.status !== 'BLOCKED').length
  const blockedUsers = users.filter((u) => u.isActive === false || u.status === 'BLOCKED').length

  const handleBlock = async (userId: string) => {
    try {
      await adminApi.blockUser(userId)
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: u.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' } : u
        )
      )
    } catch {
      setError('Failed to update user')
    }
  }

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-green-600">{activeUsers}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold text-red-600">{blockedUsers}</div></CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No users found.</TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || '—'}</TableCell>
                      <TableCell><Badge variant="secondary">{user.role}</Badge></TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'BLOCKED' || user.isActive === false ? 'destructive' : 'success'}>
                          {user.status === 'BLOCKED' || user.isActive === false ? 'Blocked' : 'Active'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleBlock(user.id)}>
                            {user.status === 'BLOCKED' || user.isActive === false ? 'Unblock' : 'Block'}
                          </Button>
                        </div>
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
