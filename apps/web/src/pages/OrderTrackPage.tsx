import { PageLayout } from '@/components/layout/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Circle, Truck } from 'lucide-react'

export default function OrderTrackPage() {
  const { id } = useParams()

  const steps = [
    { label: 'Confirmed', done: true },
    { label: 'Preparing', done: true },
    { label: 'Out for Delivery', done: false },
    { label: 'Delivered', done: false },
  ]

  const progress = (steps.filter((s) => s.done).length / steps.length) * 100

  return (
    <PageLayout>
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Track Order</h1>
            <p className="text-sm text-muted-foreground">Order #{id?.slice(0, 8) || 'N/A'}</p>
          </div>
          <Badge variant="secondary">In Progress</Badge>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Delivery Progress</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Progress value={progress} className="h-2" />
            <div className="flex flex-col gap-4">
              {steps.map((step, i) => (
                <div key={step.label} className="flex items-center gap-3">
                  {step.done ? (
                    <CheckCircle2 className="size-5 text-success" />
                  ) : i === steps.findIndex((s) => !s.done) ? (
                    <Truck className="size-5 text-primary" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground" />
                  )}
                  <span className={step.done ? 'text-foreground' : 'text-muted-foreground'}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
