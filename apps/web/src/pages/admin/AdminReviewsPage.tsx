import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { reviewApi } from '@/lib/api'

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    reviewApi.adminAll()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.data || []
        setReviews(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load reviews')
        setLoading(false)
      })
  }, [])

  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews).toFixed(1)
    : '0'

  const handleDelete = async (id: string) => {
    try {
      await reviewApi.delete(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch {
      setError('Failed to delete review')
    }
  }

  if (loading) return <DashboardLayout role="admin"><p>Loading...</p></DashboardLayout>
  if (error) return <DashboardLayout role="admin"><p className="text-destructive">{error}</p></DashboardLayout>

  return (
    <DashboardLayout role="admin">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-foreground">Reviews</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{totalReviews}</div></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent><div className="text-2xl font-bold">{avgRating} ★</div></CardContent>
          </Card>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Shop/Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">No reviews found.</TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => (
                    <TableRow key={review.id}>
                      <TableCell className="font-medium">{review.user?.name || review.userName || '—'}</TableCell>
                      <TableCell>{review.shop?.name || review.product?.name || '—'}</TableCell>
                      <TableCell>
                        <Badge variant={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'destructive'}>
                          {review.rating} ★
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{review.comment || '—'}</TableCell>
                      <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(review.id)}>Delete</Button>
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
