import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function OrderConfirmationPage() {
  const { id } = useParams()

  return (
    <PageLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="size-8 text-success" />
            </div>
            <CardTitle>Order Confirmed!</CardTitle>
            <CardDescription>Your order has been placed successfully.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm text-muted-foreground">Order ID:</span>
              <Badge variant="secondary">{id || 'N/A'}</Badge>
            </div>
            <Separator />
            <div className="flex flex-col gap-3">
              <Link to={`/orders/${id}/track`}>
                <Button>Track Order</Button>
              </Link>
              <Link to="/shops">
                <Button variant="outline">Continue Shopping</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
