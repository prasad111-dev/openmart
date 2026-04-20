import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, CheckCircle, XCircle, ArrowRight, Loader2, Truck, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store'
import { orderApi } from '@/lib/api'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useToastSuccess, useToastError } from '@/hooks/useToastAlerts'

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  PENDING: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400', icon: Clock },
  ACCEPTED: { label: 'Accepted', color: 'bg-blue-500/20 text-blue-400', icon: Package },
  REJECTED: { label: 'Rejected', color: 'bg-red-500/20 text-red-400', icon: XCircle },
  ASSIGNED: { label: 'Assigned', color: 'bg-purple-500/20 text-purple-400', icon: Package },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-orange-500/20 text-orange-400', icon: Package },
  DELIVERED: { label: 'Delivered', color: 'bg-green-500/20 text-green-400', icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400', icon: XCircle },
}

interface Order {
  id: string
  shopName: string
  status: string
  totalAmount: number
  createdAt: string
  deliveryAddress: string
  items: { name: string; quantity: number; price: number }[]
  deliveryBoyName?: string
}

export default function Orders() {
  const { isAuthenticated } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const toastSuccess = useToastSuccess()
  const toastError = useToastError()

  const fetchOrders = async () => {
    try {
      const { data } = await orderApi.list()
      setOrders(data.data || [])
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    setCancelling(orderId)
    try {
      await orderApi.cancel(orderId)
      toastSuccess('Order cancelled successfully')
      fetchOrders()
    } catch (error: any) {
      toastError(error.response?.data?.error || 'Failed to cancel order')
    } finally {
      setCancelling(null)
    }
  }

  useAutoRefresh({
    interval: 15000,
    enabled: isAuthenticated,
    onRefresh: fetchOrders,
  })

  useEffect(() => {
    if (!isAuthenticated) return
    fetchOrders()
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please login to view orders</h2>
          <Link to="/login">
            <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">Login</button>
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Orders</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <motion.div
              animate={{ rotate: loading ? 360 : 0 }}
              transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0 }}
            >
              <RefreshCw className="w-4 h-4" />
            </motion.div>
            {lastUpdated && (
              <span className="text-xs">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No orders yet</h2>
            <p className="text-muted-foreground mb-4">Start shopping to see your orders here</p>
            <Link to="/shops">
              <button className="px-6 py-2 bg-primary text-primary-foreground rounded-lg">Browse Shops</button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{order.shopName}</h3>
                        <p className="text-sm text-muted-foreground">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig[order.status]?.color || 'bg-gray-500/20 text-gray-400'}`}>
                        {statusConfig[order.status]?.label || order.status}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.quantity}x {item.name}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div>
                        <p className="font-bold text-lg">₹{order.totalAmount}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                        {order.deliveryBoyName && (
                          <p className="text-xs text-purple-400 flex items-center gap-1 mt-1">
                            <Truck className="w-3 h-3" />
                            {order.deliveryBoyName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {order.status === 'PENDING' && (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelling === order.id}
                          >
                            {cancelling === order.id ? 'Cancelling...' : 'Cancel'}
                          </Button>
                        )}
                        <Link to={`/orders/${order.id}`}>
                          <Button variant="outline" size="sm">
                            Details <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
