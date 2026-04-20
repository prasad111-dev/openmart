import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Search, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/store'

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  commission: number
  commissionRate: number
  customer: { name: string; phone: string }
  items: { product: { name: string }; quantity: number; price: number }[]
}

interface Payment {
  id: string
  amount: number
  note: string | null
  paymentDate: string
}

interface Shop {
  id: string
  name: string
  address: string
  phone: string
  email: string | null
  category: string
  commissionRate: number
  owner: { name: string; phone: string; email: string }
}

interface Summary {
  totalOrders: number
  deliveredOrders: number
  totalSales: number
  commissionRate: number
  totalCommission: number
  totalPaid: number
  pendingAmount: number
}

export default function SellerSettlementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shop, setShop] = useState<Shop | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState({ amount: '', note: '', paymentDate: '' })
  const [savingPayment, setSavingPayment] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    if (id) fetchSellerDetail()
  }, [id])

  const fetchSellerDetail = async () => {
    try {
      const res = await adminApi.getSellerSettlement(id!)
      setShop(res.data.data.shop)
      setOrders(res.data.data.orders)
      setPayments(res.data.data.payments)
      setSummary(res.data.data.summary)
    } catch (error) {
      console.error('Error fetching seller detail:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRecordPayment = async () => {
    if (!paymentForm.amount) return
    setSavingPayment(true)
    try {
      await adminApi.recordSellerPayment({
        shopId: id!,
        amount: Number(paymentForm.amount),
        note: paymentForm.note || undefined,
        paymentDate: paymentForm.paymentDate || undefined
      })
      setShowPaymentModal(false)
      setPaymentForm({ amount: '', note: '', paymentDate: '' })
      fetchSellerDetail()
    } catch (error) {
      console.error('Error recording payment:', error)
    } finally {
      setSavingPayment(false)
    }
  }

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(search.toLowerCase()) ||
                         o.customer.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{shop?.name}</h1>
                <p className="text-sm text-muted-foreground">{shop?.owner.name} • {shop?.owner.phone}</p>
              </div>
            </div>
            <Button onClick={() => setShowPaymentModal(true)}>
              <CreditCard className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Orders</p>
                <p className="text-2xl font-bold">{summary?.totalOrders || 0}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Total Sales</p>
                <p className="text-2xl font-bold">₹{(summary?.totalSales || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Commission ({summary?.commissionRate}%)</p>
                <p className="text-2xl font-bold">₹{(summary?.totalCommission || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="border-green-500/30">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Amount Paid</p>
                <p className="text-2xl font-bold text-green-400">₹{(summary?.totalPaid || 0).toLocaleString()}</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className={(summary?.pendingAmount || 0) > 0 ? 'border-red-500/50' : 'border-green-500/30'}>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className={`text-2xl font-bold ${(summary?.pendingAmount || 0) > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  ₹{(summary?.pendingAmount || 0).toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Orders</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search orders..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 w-40"
                    />
                  </div>
                  <select
                    className="p-2 rounded-md border border-border bg-background text-sm"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                {filteredOrders.length === 0 ? (
                  <p className="text-center p-4 text-muted-foreground">No orders found</p>
                ) : (
                  <div className="space-y-3">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="p-3 rounded-lg bg-secondary/30">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.customer.name} • {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === 'DELIVERED' || order.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                            order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {order.items?.length || 0} items
                          </span>
                          <div className="flex gap-4">
                            <span>₹{order.totalAmount.toLocaleString()}</span>
                            <span className="text-muted-foreground">Comm: ₹{order.commission?.toFixed(2) || 0}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Payment History</CardTitle>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <p className="text-center p-4 text-muted-foreground">No payments recorded</p>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <div key={payment.id} className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-green-400">₹{payment.amount.toLocaleString()}</span>
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.paymentDate).toLocaleDateString()}
                        </p>
                        {payment.note && (
                          <p className="text-xs text-muted-foreground mt-1">{payment.note}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Record Payment Received</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Amount *</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Date</label>
                <Input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Note</label>
                <Input
                  placeholder="Optional note"
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleRecordPayment} disabled={savingPayment || !paymentForm.amount}>
                  {savingPayment ? 'Saving...' : 'Record Payment'}
                </Button>
                <Button variant="outline" onClick={() => setShowPaymentModal(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
