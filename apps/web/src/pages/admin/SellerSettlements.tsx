import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { DollarSign, Store, AlertTriangle, Filter, Search, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/store'

interface Settlement {
  shopId: string
  shopName: string
  shopType: string
  ownerName: string
  ownerPhone: string
  ownerEmail: string
  totalOrders: number
  totalSales: number
  commissionRate: number
  monthlySubscriptionFee: number
  platformEarnings: number
  totalPaid: number
  pendingAmount: number
  hasPendingDues: boolean
}

export default function SellerSettlements() {
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterPending, setFilterPending] = useState(false)
  const { isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    fetchSettlements()
  }, [])

  const fetchSettlements = async () => {
    try {
      const res = await adminApi.getSellerSettlements()
      setSettlements(res.data.data)
    } catch (error) {
      console.error('Error fetching settlements:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredSettlements = settlements.filter(s => {
    const matchesSearch = s.shopName.toLowerCase().includes(search.toLowerCase()) || 
                         s.ownerName.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filterPending ? s.hasPendingDues : true
    return matchesSearch && matchesFilter
  })

  const totalPending = filteredSettlements.reduce((sum, s) => sum + s.pendingAmount, 0)
  const totalPlatformEarnings = filteredSettlements.reduce((sum, s) => sum + s.platformEarnings, 0)

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Access denied. Admin access required.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Seller Settlement & Commission</h1>
              <p className="text-sm text-muted-foreground">Track seller earnings and platform commission</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sellers</p>
                    <p className="text-2xl font-bold">{filteredSettlements.length}</p>
                  </div>
                  <Store className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Sales</p>
                    <p className="text-2xl font-bold">₹{filteredSettlements.reduce((s, s2) => s + s2.totalSales, 0).toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Platform Earnings</p>
                    <p className="text-2xl font-bold">₹{totalPlatformEarnings.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className={totalPending > 0 ? 'border-red-500/50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Amount</p>
                    <p className={`text-2xl font-bold ${totalPending > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ₹{totalPending.toLocaleString()}
                    </p>
                  </div>
                  <AlertTriangle className={`w-8 h-8 ${totalPending > 0 ? 'text-red-400' : 'text-green-400'}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by shop or owner name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button 
                variant={filterPending ? 'default' : 'outline'}
                onClick={() => setFilterPending(!filterPending)}
                className={filterPending ? 'bg-red-600 hover:bg-red-700' : ''}
              >
                <Filter className="w-4 h-4 mr-2" />
                {filterPending ? 'Show All' : 'Pending Only'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sellers List */}
        <Card>
          <CardHeader>
            <CardTitle>Seller Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredSettlements.length === 0 ? (
              <div className="text-center p-8 text-muted-foreground">
                No sellers found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSettlements.map((seller) => (
                  <motion.div
                    key={seller.shopId}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`p-4 rounded-xl border transition-all hover:border-primary/50 ${
                      seller.hasPendingDues ? 'bg-red-500/5 border-red-500/30' : 'bg-secondary/30 border-border'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                          <Store className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <Link to={`/admin/seller-settlements/${seller.shopId}`} className="font-medium hover:text-primary hover:underline">
                            {seller.shopName}
                          </Link>
                          <p className="text-sm text-muted-foreground">{seller.ownerName} • {seller.ownerPhone}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Type</p>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            seller.shopType === 'SUBSCRIPTION' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {seller.shopType === 'SUBSCRIPTION' ? 'Subscription' : 'Commission'}
                          </span>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Orders</p>
                          <p className="font-medium">{seller.totalOrders}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Sales</p>
                          <p className="font-medium">₹{seller.totalSales.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Platform Earned</p>
                          <p className="font-medium">₹{seller.platformEarnings.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Paid</p>
                          <p className="font-medium text-green-400">₹{seller.totalPaid.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className={`font-medium ${seller.pendingAmount > 0 ? 'text-red-400' : 'text-green-400'}`}>
                            ₹{seller.pendingAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Link to={`/admin/seller-settlements/${seller.shopId}`}>
                        <Button size="sm">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
