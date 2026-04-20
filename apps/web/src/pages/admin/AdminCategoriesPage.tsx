import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { categoryApi } from '@/lib/api'

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    categoryApi.all()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setCategories(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load categories')
        setLoading(false)
      })
  }, [])

  const handleDelete = async (id: string) => {
    try {
      await categoryApi.delete(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch {
      setError('Failed to delete category')
    }
  }

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <Button>Add Category</Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No categories found.</TableCell>
                  </TableRow>
                ) : (
                  categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{cat.type || 'PRODUCT'}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={cat.isActive !== false ? 'success' : 'destructive'}>
                          {cat.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(cat.id)}>Delete</Button>
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
