import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, MapPin, Phone, CheckCircle, Navigation, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { deliveryApi } from '@/lib/api'
import { useToastSuccess, useToastError } from '@/hooks/useToastAlerts'

interface DeliveryAssignment {
  id: string
  orderId: string
  status: string
  pickupTime?: string
  deliveredTime?: string
  order?: {
    id: string
    customerName?: string
    deliveryAddress?: any
    customerPhone?: string
    totalAmount: number
    items?: Array<{ name: string; quantity: number }>
  }
}

export default function DeliveryDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned')
  const [assignments, setAssignments] = useState<DeliveryAssignment[]>([])
  const [isOnline, setIsOnline] = useState(true)
  const [, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)
  const locationIntervalRef = useRef<number | null>(null)

  const toastSuccess = useToastSuccess()
  const toastError = useToastError()

  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthChecked(true)
      
      const currentUser = useAuthStore.getState().user
      
      if (!currentUser) {
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const storedUser = parsed.state?.user
            if (storedUser && storedUser.role === 'DELIVERY_BOY') {
              fetchDeliveries()
              return
            }
          } catch (e) {}
        }
        navigate('/login', { replace: true })
        return
      }
      
      if (currentUser.role !== 'DELIVERY_BOY') {
        navigate('/login', { replace: true })
        return
      }
      
      fetchDeliveries()
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const res = await deliveryApi.list()
      setAssignments(res.data.data || [])
    } catch (error) {
      console.error('Error fetching deliveries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (assignmentId: string, newStatus: string) => {
    try {
      await deliveryApi.updateStatus(assignmentId, newStatus)
      setAssignments(assignments.map(a => 
        a.id === assignmentId ? { ...a, status: newStatus } : a
      ))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const handleVerifyOtp = async (assignmentId: string, otp: string) => {
    try {
      await deliveryApi.verifyOtp(assignmentId, otp)
      toastSuccess('Order delivered successfully!')
      fetchDeliveries()
    } catch (error) {
      toastError('Invalid OTP')
    }
  }

  const assignedDeliveries = assignments.filter(a => 
    a.status === 'ASSIGNED' || a.status === 'ACCEPTED' || a.status === 'PICKED_UP' || a.status === 'IN_TRANSIT'
  )
  const completedDeliveries = assignments.filter(a => 
    a.status === 'DELIVERED'
  )

  // Location sharing
  const updateLocation = async () => {
    if (!navigator.geolocation) return
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setCurrentLocation({ lat, lng })
        try {
          await deliveryApi.updateLocation(lat, lng)
        } catch (e) {
          console.error('Failed to update location:', e)
        }
      },
      (err) => console.error('Location error:', err),
      { enableHighAccuracy: true }
    )
  }

  // Start/stop location sharing when online status changes
  useEffect(() => {
    if (isOnline && assignedDeliveries.length > 0) {
      // Start sharing location every 10 seconds
      updateLocation() // Initial update
      locationIntervalRef.current = window.setInterval(updateLocation, 10000)
    } else {
      // Stop sharing
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }
    }

    return () => {
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
    }
  }, [isOnline, assignedDeliveries.length])

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Double check auth before rendering
  const currentUser = useAuthStore.getState().user
  if (!currentUser || currentUser.role !== 'DELIVERY_BOY') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">Delivery Dashboard</h1>
              <p className="text-xs text-muted-foreground">{user?.name}</p>
            </div>
          </div>
          <Button
            variant={isOnline ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsOnline(!isOnline)}
          >
            {isOnline ? 'Online' : 'Offline'}
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{assignedDeliveries.length}</p>
                <p className="text-sm text-muted-foreground">Assigned</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">{completedDeliveries.length}</p>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold">₹{completedDeliveries.reduce((sum, d) => sum + (d.order?.totalAmount || 0), 0)}</p>
                <p className="text-sm text-muted-foreground">Today's Earnings</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === 'assigned' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('assigned')}
          >
            Assigned ({assignedDeliveries.length})
          </Button>
          <Button 
            variant={activeTab === 'completed' ? 'default' : 'outline'} 
            onClick={() => setActiveTab('completed')}
          >
            Completed ({completedDeliveries.length})
          </Button>
        </div>

        {activeTab === 'assigned' && (
          <Card>
            <CardHeader>
              <CardTitle>Assigned Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {assignedDeliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No deliveries assigned</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedDeliveries.map((delivery) => (
                    <div key={delivery.id} className="p-4 rounded-xl bg-secondary/30">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-medium">{delivery.order?.customerName || 'Customer'}</p>
                          <p className="text-sm text-muted-foreground">
                            Order: {delivery.orderId} • {delivery.order?.items?.length || 0} items
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          delivery.status === 'ASSIGNED' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>
                          {delivery.status === 'ASSIGNED' ? 'Assigned' : 'Out for Delivery'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        {delivery.order?.deliveryAddress 
                          ? `${delivery.order.deliveryAddress.street}, ${delivery.order.deliveryAddress.city} - ${delivery.order.deliveryAddress.pincode}`
                          : 'No address'}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" />
                          <span className="text-sm">{delivery.order?.customerPhone || 'N/A'}</span>
                        </div>
                        <span className="font-bold">₹{delivery.order?.totalAmount || 0}</span>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        {delivery.status === 'ASSIGNED' && (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleUpdateStatus(delivery.id, 'OUT_FOR_DELIVERY')}
                          >
                            <Navigation className="w-4 h-4 mr-1" />
                            Start Delivery
                          </Button>
                        )}
                        {delivery.status === 'OUT_FOR_DELIVERY' && (
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => {
                              const otp = prompt('Enter delivery OTP:')
                              if (otp) handleVerifyOtp(delivery.id, otp)
                            }}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Complete Delivery
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Completed Deliveries</CardTitle>
            </CardHeader>
            <CardContent>
              {completedDeliveries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No completed deliveries</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-medium">{delivery.order?.customerName || 'Customer'}</p>
                        <p className="text-sm text-muted-foreground">{delivery.orderId}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">₹{delivery.order?.totalAmount || 0}</span>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
                          Delivered
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}