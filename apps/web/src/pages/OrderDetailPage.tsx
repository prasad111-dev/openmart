import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Link, useParams } from 'react-router-dom'
import { Package, MapPin, Phone, Clock } from 'lucide-react'

export default function OrderDetailPage() {
  const { id } = useParams()

  return (
    <PageLayout>
      <div className="container mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Details</h1>
            <p className="text-sm text-muted-foreground">Order #{id?.slice(0, 8) || 'N/A'}</p>
          </div>
          <Badge>Pending</Badge>
        </div>
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="size-4" />
                <span>Placed on Jan 15, 2025</span>
              </div>
              <Separator />
              <div className="flex items-center gap-2 text-sm">
                <Package className="size-4 text-muted-foreground" />
                <span>2 items</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>123 Main Road, Sindhi Railway</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="size-4 text-muted-foreground" />
                <span>+91 98765 43210</span>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-3">
            <Link to="/orders">
              <Button variant="outline">Back to Orders</Button>
            </Link>
            <Link to={`/orders/${id}/track`}>
              <Button>Track Order</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
