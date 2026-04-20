import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { deliveryApi } from '@/lib/api'
import { ArrowLeft, MapPin, User, Phone, Package, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function DeliveryDetailPage() {
  const { id } = useParams()
  const [delivery, setDelivery] = useState<any>(null)
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDelivery() }, [id])

  const fetchDelivery = async () => {
    setLoading(true)
    try {
      const res = await deliveryApi.list()
      const found = (res.data.data || []).find((d: any) => d.id === id)
      setDelivery(found || null)
    } catch { /* ignore */ } finally { setLoading(false) }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 6) return
    try {
      await deliveryApi.verifyOtp(id!, otp)
      toast.success('OTP verified! Delivery completed.')
      fetchDelivery()
    } catch {
      toast.error('Invalid OTP')
    }
  }

  const handleStatusUpdate = async (status: string) => {
    try {
      await deliveryApi.updateStatus(id!, status)
      toast.success(`Status updated to ${status}`)
      fetchDelivery()
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) return <DashboardLayout role="delivery_boy"><p className="text-center py-8">Loading...</p></DashboardLayout>
  if (!delivery) return <DashboardLayout role="delivery_boy"><p className="text-center py-8">Delivery not found.</p></DashboardLayout>

  const statusSteps = ['ASSIGNED', 'ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED']
  const currentStep = statusSteps.indexOf(delivery.status)

  return (
    <DashboardLayout role="delivery_boy">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm"><Link to="/delivery/assignments"><ArrowLeft className="size-4" /> Back</Link></Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Delivery #{delivery.id?.slice(0, 8)}</h1>
            <Badge variant={delivery.status === 'DELIVERED' ? 'default' : 'secondary'}>{delivery.status}</Badge>
          </div>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader><CardTitle>Delivery Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center flex-1">
                  <div className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                    i <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {i <= currentStep ? <CheckCircle className="size-4" /> : i + 1}
                  </div>
                  {i < statusSteps.length - 1 && (
                    <div className={`flex-1 h-1 mx-1 rounded ${i < currentStep ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Pickup</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2"><Package className="size-4 text-muted-foreground" /><span>{delivery.order?.shop?.name}</span></div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /><span>{delivery.order?.shop?.address}</span></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Drop-off</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2"><User className="size-4 text-muted-foreground" /><span>{delivery.order?.customer?.name}</span></div>
              <div className="flex items-center gap-2"><Phone className="size-4 text-muted-foreground" /><span>{delivery.order?.customer?.phone}</span></div>
              <div className="flex items-center gap-2"><MapPin className="size-4 text-muted-foreground" /><span>{delivery.order?.deliveryAddress?.street}</span></div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {delivery.status !== 'DELIVERED' && (
          <Card>
            <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-2 flex-wrap">
                {delivery.status === 'ASSIGNED' && (
                  <Button onClick={() => handleStatusUpdate('ACCEPTED')}>Accept Delivery</Button>
                )}
                {(delivery.status === 'ACCEPTED') && (
                  <Button onClick={() => handleStatusUpdate('PICKED_UP')}>Mark Picked Up</Button>
                )}
                {(delivery.status === 'PICKED_UP') && (
                  <Button onClick={() => handleStatusUpdate('IN_TRANSIT')}>Start Delivery</Button>
                )}
                {delivery.status === 'IN_TRANSIT' && (
                  <div className="flex flex-col gap-3 w-full">
                    <p className="text-sm text-muted-foreground">Enter the OTP provided by the customer:</p>
                    <div className="flex items-center gap-4">
                      <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <Button onClick={handleVerifyOtp}>Verify & Complete</Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
