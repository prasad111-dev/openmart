import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Store, Package, Settings, DollarSign, AlertTriangle, CheckCircle, XCircle, BarChart3, Truck, Shield, Activity, Eye, Ban, Edit, RefreshCw, MessageSquare, Globe, Lock, FileText, ShieldAlert, Plus, Tag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthStore } from '@/store'
import { adminApi, authApi, categoryApi } from '@/lib/api'

interface Shop {
  id: string
  ownerId: string
  name: string
  description: string
  address: string
  phone: string
  email: string
  isApproved: boolean
  isOpen: boolean
  category: string
  rating: number
}

interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isVerified: boolean
  isBlocked?: boolean
  createdAt: string
}

interface Order {
  id: string
  customerId: string
  shopId: string
  status: string
  totalAmount: number
  createdAt: string
  customerName?: string
  customerPhone?: string
  shopName?: string
}

interface Stats {
  totalUsers: number
  totalShops: number
  totalOrders: number
  totalProducts: number
  pendingShops: number
  pendingOrders: number
}

interface Category {
  id: string
  name: string
  description: string | null
  type: 'PRODUCT' | 'SHOP'
  isActive: boolean
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'shops' | 'orders' | 'users' | 'delivery' | 'settings' | 'security' | 'categories'>('dashboard')
  const [shops, setShops] = useState<Shop[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [, setStats] = useState<Stats>({ totalUsers: 0, totalShops: 0, totalOrders: 0, totalProducts: 0, pendingShops: 0, pendingOrders: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  
  // Modal states
  const [showUserModal, setShowUserModal] = useState(false)
  const [showShopModal, setShowShopModal] = useState(false)
  const [showDeliveryBoyModal, setShowDeliveryBoyModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showEditShopModal, setShowEditShopModal] = useState(false)
  const [showEditDeliveryBoyModal, setShowEditDeliveryBoyModal] = useState(false)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState<User | null>(null)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', role: 'SHOP_OWNER', password: '' })
  const [newDeliveryBoy, setNewDeliveryBoy] = useState({ name: '', email: '', phone: '', password: '' })
  const [newShop, setNewShop] = useState({ ownerName: '', ownerEmail: '', ownerPhone: '', ownerPassword: '', shopName: '', shopDescription: '', shopAddress: '', shopPincode: '', shopPhone: '', shopCategory: 'General', shopEmail: '' })
  const [newCategory, setNewCategory] = useState({ name: '', description: '', type: 'PRODUCT' as 'PRODUCT' | 'SHOP' })
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [editCategoryForm, setEditCategoryForm] = useState({ name: '', description: '', isActive: true })
  const [passwordForm, setPasswordForm] = useState({ newPassword: '' })
  const [editShopForm, setEditShopForm] = useState({ name: '', description: '', address: '', phone: '', email: '', category: '' })
  const [editDeliveryBoyForm, setEditDeliveryBoyForm] = useState({ name: '', phone: '', email: '' })
  const [savingUser, setSavingUser] = useState(false)
  const [savingShop, setSavingShop] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  useEffect(() => {
    // Wait for hydration and check auth
    const timer = setTimeout(() => {
      setAuthChecked(true)
      
      // Get user from store
      const currentUser = useAuthStore.getState().user
      
      if (!currentUser) {
        // Try to get from localStorage directly
        const stored = localStorage.getItem('auth-storage')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            const storedUser = parsed.state?.user
            if (storedUser && storedUser.role === 'ADMIN') {
              // User exists in storage, proceed
              fetchData()
              return
            }
          } catch (e) {}
        }
        navigate('/admin-login', { replace: true })
        return
      }
      
      if (currentUser.role !== 'ADMIN') {
        navigate('/admin-login', { replace: true })
        return
      }
      
      fetchData()
    }, 500) // Wait 500ms for hydration

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsRes = await adminApi.getStats()
      setStats(statsRes.data.data || { totalUsers: 0, totalShops: 0, totalOrders: 0, totalProducts: 0, pendingShops: 0, pendingOrders: 0 })
      
      // Fetch all shops (including pending)
      const shopsRes = await adminApi.getShops()
      setShops(shopsRes.data.data || [])
      
      // Fetch all orders
      const ordersRes = await adminApi.getOrders()
      setOrders(ordersRes.data.data || [])
      
      // Fetch all users
      const usersRes = await adminApi.getUsers()
      setUsers(usersRes.data.data || [])
      
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveShop = async (shopId: string) => {
    try {
      await adminApi.approveShop(shopId)
      setShops(shops.map(s => s.id === shopId ? { ...s, isApproved: true } : s))
    } catch (error) {
      console.error('Error approving shop:', error)
    }
  }

  const handleRejectShop = async (shopId: string) => {
    try {
      await adminApi.rejectShop(shopId)
      setShops(shops.map(s => s.id === shopId ? { ...s, isApproved: false, isOpen: false } : s))
    } catch (error) {
      console.error('Error rejecting shop:', error)
    }
  }

  const handleToggleShop = async (shopId: string) => {
    try {
      await adminApi.toggleShop(shopId)
      setShops(shops.map(s => s.id === shopId ? { ...s, isOpen: !s.isOpen } : s))
    } catch (error) {
      console.error('Error toggling shop:', error)
    }
  }

  const handleBlockUser = async (userId: string) => {
    try {
      await adminApi.blockUser(userId)
      setUsers(users.map(u => u.id === userId ? { ...u, isBlocked: !u.isBlocked } : u))
    } catch (error) {
      console.error('Error blocking user:', error)
    }
  }

  const handleCreateUser = async () => {
    if (!newUser.name || !newUser.role) {
      alert('Please fill required fields')
      return
    }
    setSavingUser(true)
    try {
      await authApi.registerUser(newUser)
      alert(`${newUser.role} created successfully!\nPassword: ${newUser.password || 'temp password'}`)
      setShowUserModal(false)
      setNewUser({ name: '', email: '', phone: '', role: 'SHOP_OWNER', password: '' })
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create user')
    } finally {
      setSavingUser(false)
    }
  }

  const handleCreateShop = async () => {
    if (!newShop.ownerName || !newShop.shopName || !newShop.shopAddress) {
      alert('Please fill required fields')
      return
    }
    setSavingShop(true)
    console.log('Creating shop with data:', newShop)
    try {
      const response = await adminApi.createShop(newShop)
      console.log('Shop created:', response.data)
      alert(`Shop created successfully!\nOwner Email: ${newShop.ownerEmail || 'N/A'}\nPassword: ${newShop.ownerPassword || 'temp password'}`)
      setShowShopModal(false)
      setNewShop({ ownerName: '', ownerEmail: '', ownerPhone: '', ownerPassword: '', shopName: '', shopDescription: '', shopAddress: '', shopPincode: '', shopPhone: '', shopCategory: 'General', shopEmail: '' })
      fetchData()
    } catch (error: any) {
      console.error('Create shop error:', error)
      alert(error.response?.data?.error || error.message || 'Failed to create shop')
    } finally {
      setSavingShop(false)
    }
  }

  const handleCreateDeliveryBoy = async () => {
    if (!newDeliveryBoy.name || !newDeliveryBoy.phone) {
      alert('Please fill name and phone')
      return
    }
    setSavingUser(true)
    try {
      await authApi.registerUser({
        name: newDeliveryBoy.name,
        phone: newDeliveryBoy.phone,
        email: newDeliveryBoy.email,
        role: 'DELIVERY_BOY',
        password: newDeliveryBoy.password || undefined,
      })
      alert(`Delivery Boy created successfully!`)
      setShowDeliveryBoyModal(false)
      setNewDeliveryBoy({ name: '', email: '', phone: '', password: '' })
      fetchData()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create delivery boy')
    } finally {
      setSavingUser(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      alert('Please enter category name')
      return
    }
    setSavingCategory(true)
    try {
      await categoryApi.create(newCategory)
      alert('Category created successfully!')
      setShowCategoryModal(false)
      setNewCategory({ name: '', description: '', type: 'PRODUCT' })
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create category')
    } finally {
      setSavingCategory(false)
    }
  }

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await categoryApi.delete(id)
      alert('Category deleted successfully!')
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete category')
    }
  }

  const openEditCategory = (category: Category) => {
    setEditingCategory(category)
    setEditCategoryForm({ name: category.name, description: category.description || '', isActive: category.isActive })
    setShowCategoryModal(true)
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editCategoryForm.name) return
    setSavingCategory(true)
    try {
      await categoryApi.update(editingCategory.id, editCategoryForm)
      alert('Category updated successfully!')
      setShowCategoryModal(false)
      setEditingCategory(null)
      setEditCategoryForm({ name: '', description: '', isActive: true })
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update category')
    } finally {
      setSavingCategory(false)
    }
  }

  const toggleCategoryActive = async (category: Category) => {
    try {
      await categoryApi.update(category.id, { isActive: !category.isActive })
      fetchCategories()
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update category')
    }
  }

  const openEditShop = (shop: Shop) => {
    setEditingShop(shop)
    setEditShopForm({
      name: shop.name,
      description: shop.description || '',
      address: shop.address || '',
      phone: shop.phone,
      email: shop.email || '',
      category: shop.category,
    })
    setShowEditShopModal(true)
  }

  const handleUpdateShop = async () => {
    if (!editingShop) return
    setSavingShop(true)
    try {
      await adminApi.updateShop(editingShop.id, editShopForm)
      setShops(shops.map(s => s.id === editingShop.id ? { ...s, ...editShopForm } : s))
      setShowEditShopModal(false)
      setEditingShop(null)
      alert('Shop updated successfully!')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update shop')
    } finally {
      setSavingShop(false)
    }
  }

  const openPasswordModal = (userId: string) => {
    setEditingUserId(userId)
    setPasswordForm({ newPassword: '' })
    setShowPasswordModal(true)
  }

  const handleUpdatePassword = async () => {
    if (!editingUserId || !passwordForm.newPassword) return
    setSavingPassword(true)
    try {
      await adminApi.updateUserPassword(editingUserId, passwordForm.newPassword)
      setShowPasswordModal(false)
      setEditingUserId(null)
      setPasswordForm({ newPassword: '' })
      alert('Password updated successfully!')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const openEditDeliveryBoy = (user: User) => {
    setEditingDeliveryBoy(user)
    setEditDeliveryBoyForm({
      name: user.name,
      phone: user.phone || '',
      email: user.email || '',
    })
    setShowEditDeliveryBoyModal(true)
  }

  const handleUpdateDeliveryBoy = async () => {
    if (!editingDeliveryBoy) return
    setSavingUser(true)
    try {
      await adminApi.updateDeliveryBoy(editingDeliveryBoy.id, editDeliveryBoyForm)
      setUsers(users.map(u => u.id === editingDeliveryBoy.id ? { ...u, ...editDeliveryBoyForm } : u))
      setShowEditDeliveryBoyModal(false)
      setEditingDeliveryBoy(null)
      alert('Delivery boy updated successfully!')
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to update delivery boy')
    } finally {
      setSavingUser(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.all()
      setCategories(res.data.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const deliveryBoys = users.filter(u => u.role === 'DELIVERY_BOY')
  const pendingShops = shops.filter(s => !s.isApproved)
  const activeOrders = orders.filter(o => o.status === 'PENDING' || o.status === 'ACCEPTED' || o.status === 'OUT_FOR_DELIVERY')
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0)

  // Show loading while auth is being checked
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
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Double check auth before rendering
  const currentUser = useAuthStore.getState().user
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h1 className="font-bold">Platform Admin</h1>
              <p className="text-xs text-muted-foreground">OpenMart Control Center</p>
            </div>
          </div>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
            <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
              <CardContent className="p-4">
                <Store className="w-5 h-5 text-purple-500 mb-2" />
                <p className="text-2xl font-bold">{shops.length}</p>
                <p className="text-sm text-muted-foreground">Total Shops</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5">
              <CardContent className="p-4">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mb-2" />
                <p className="text-2xl font-bold">{pendingShops.length}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
              <CardContent className="p-4">
                <Package className="w-5 h-5 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{orders.length}</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5">
              <CardContent className="p-4">
                <Activity className="w-5 h-5 text-orange-500 mb-2" />
                <p className="text-2xl font-bold">{activeOrders.length}</p>
                <p className="text-sm text-muted-foreground">Active Orders</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
              <CardContent className="p-4">
                <DollarSign className="w-5 h-5 text-green-500 mb-2" />
                <p className="text-2xl font-bold">₹{(totalRevenue / 1000).toFixed(1)}k</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5">
              <CardContent className="p-4">
                <Users className="w-5 h-5 text-cyan-500 mb-2" />
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button variant={activeTab === 'dashboard' ? 'default' : 'outline'} onClick={() => setActiveTab('dashboard')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
          <Button variant={activeTab === 'shops' ? 'default' : 'outline'} onClick={() => setActiveTab('shops')}>
            <Store className="w-4 h-4 mr-2" />
            Shops
          </Button>
          <Button variant={activeTab === 'orders' ? 'default' : 'outline'} onClick={() => setActiveTab('orders')}>
            <Package className="w-4 h-4 mr-2" />
            Orders
          </Button>
          <Button variant={activeTab === 'users' ? 'default' : 'outline'} onClick={() => setActiveTab('users')}>
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button variant={activeTab === 'delivery' ? 'default' : 'outline'} onClick={() => setActiveTab('delivery')}>
            <Truck className="w-4 h-4 mr-2" />
            Delivery
          </Button>
          <Button variant={activeTab === 'settings' ? 'default' : 'outline'} onClick={() => setActiveTab('settings')}>
            <Globe className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button variant={activeTab === 'security' ? 'default' : 'outline'} onClick={() => setActiveTab('security')}>
            <Lock className="w-4 h-4 mr-2" />
            Security
          </Button>
          <Button variant={activeTab === 'categories' ? 'default' : 'outline'} onClick={() => setActiveTab('categories')}>
            <Tag className="w-4 h-4 mr-2" />
            Categories
          </Button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  Pending Shop Approvals ({pendingShops.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingShops.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                    <p>No pending approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingShops.map((shop) => (
                      <div key={shop.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div>
                          <p className="font-medium">{shop.name}</p>
                          <p className="text-sm text-muted-foreground">{shop.category} • {shop.phone}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleApproveShop(shop.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleRejectShop(shop.id)}>
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-500" />
                  Recent Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.shopName} • {order.customerName}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">₹{order.totalAmount}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                          order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-500/20 text-orange-400' :
                          order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('shops')}>
                    <Store className="w-6 h-6" />
                    <span>Manage Shops</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('users')}>
                    <Users className="w-6 h-6" />
                    <span>Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => setActiveTab('orders')}>
                    <Package className="w-6 h-6" />
                    <span>View Orders</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/seller-settlements')}>
                    <DollarSign className="w-6 h-6" />
                    <span>Seller Settlements</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={() => navigate('/admin/platform-settings')}>
                    <Settings className="w-6 h-6" />
                    <span>Platform Settings</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> API Server</span>
                    <span className="text-green-500 font-medium">Online</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Database</span>
                    <span className="text-green-500 font-medium">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Payment Gateway</span>
                    <span className="text-green-500 font-medium">Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> SMS Service</span>
                    <span className="text-green-500 font-medium">Working</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Shops Tab */}
        {activeTab === 'shops' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Shops ({shops.length})</CardTitle>
              <div className="flex gap-2">
                <Input 
                  placeholder="Search shops..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button onClick={() => setShowShopModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Shop
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {shops.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((shop) => (
                  <div key={shop.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                        <Store className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">{shop.category} • {shop.address}</p>
                        <p className="text-xs text-muted-foreground">Phone: {shop.phone} • Rating: {shop.rating}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          shop.isApproved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {shop.isApproved ? 'Approved' : 'Pending'}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          shop.isOpen ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {shop.isOpen ? 'On' : 'Close'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditShop(shop)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleToggleShop(shop.id)}>
                          {shop.isOpen ? <Ban className="w-4 h-4" /> : <RefreshCw className="w-4 h-4" />}
                        </Button>
                        {!shop.isApproved && (
                          <Button size="sm" onClick={() => handleApproveShop(shop.id)}>
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>All Orders ({orders.length})</CardTitle>
              <Input placeholder="Search orders..." className="w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">{order.shopName} • {order.customerName}</p>
                      <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">₹{order.totalAmount}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                        order.status === 'OUT_FOR_DELIVERY' ? 'bg-orange-500/20 text-orange-400' :
                        order.status === 'DELIVERED' ? 'bg-green-500/20 text-green-400' :
                        order.status === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {order.status}
                      </span>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {order.status === 'PENDING' && (
                        <Button size="sm" variant="destructive">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>User Management ({users.length})</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search users..." className="w-64" />
                <Button onClick={() => setShowUserModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email} • {user.phone}</p>
                      <p className="text-xs text-muted-foreground">Joined: {user.createdAt}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-400' :
                        user.role === 'SHOP_OWNER' ? 'bg-blue-500/20 text-blue-400' :
                        user.role === 'DELIVERY_BOY' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {user.role}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.isVerified ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openPasswordModal(user.id)}>
                          <Lock className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleBlockUser(user.id)}>
                          <Ban className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Delivery Tab */}
        {activeTab === 'delivery' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Boys ({deliveryBoys.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deliveryBoys.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                      <p>No delivery boys yet</p>
                    </div>
                  ) : (
                    deliveryBoys.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <Truck className="w-5 h-5 text-orange-500" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email || user.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isBlocked ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {user.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                          <Button size="sm" variant="outline" onClick={() => openEditDeliveryBoy(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleBlockUser(user.id)}>
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <Button className="w-full mt-4" onClick={() => setShowDeliveryBoyModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Delivery Boy
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Delivery Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                    <span>Completed Today</span>
                    <span className="font-bold text-green-500">12</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                    <span>Pending</span>
                    <span className="font-bold text-yellow-500">5</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-500/10">
                    <span>Failed</span>
                    <span className="font-bold text-red-500">1</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Platform Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Platform Name</Label>
                  <Input defaultValue="OpenMart" />
                </div>
                <div>
                  <Label>Support Email</Label>
                  <Input defaultValue="support@openmart.com" />
                </div>
                <div>
                  <Label>Support Phone</Label>
                  <Input defaultValue="+91 98765 43210" />
                </div>
                <div>
                  <Label>Serviceable Pincodes</Label>
                  <Input defaultValue="442105" />
                </div>
                <div>
                  <Label>Delivery Radius (km)</Label>
                  <Input type="number" defaultValue="5" />
                </div>
                <Button>Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Business Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Minimum Order Value (₹)</Label>
                  <Input type="number" defaultValue="99" />
                </div>
                <div>
                  <Label>Maximum Order Value (₹)</Label>
                  <Input type="number" defaultValue="10000" />
                </div>
                <div>
                  <Label>Delivery Charge (₹)</Label>
                  <Input type="number" defaultValue="30" />
                </div>
                <div>
                  <Label>Platform Commission (%)</Label>
                  <Input type="number" defaultValue="10" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <Label>Enable COD</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <Label>Enable Online Payment</Label>
                </div>
                <Button>Save Rules</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <Label>Email Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <Label>SMS Notifications</Label>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <Label>Push Notifications</Label>
                </div>
                <div>
                  <Label>WhatsApp API Key</Label>
                  <Input type="password" defaultValue="********" />
                </div>
                <Button>Update Notifications</Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> SSL Certificate</span>
                  <span className="text-green-500 font-medium">Valid</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Admin Sessions</span>
                  <span className="text-green-500 font-medium">Secure</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
                  <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> API Rate Limiting</span>
                  <span className="text-green-500 font-medium">Enabled</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10">
                  <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-yellow-500" /> Failed Login Attempts</span>
                  <span className="text-yellow-500 font-medium">3 (24h)</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Audit Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-secondary/30 text-sm">
                    <p className="font-medium">Admin login</p>
                    <p className="text-muted-foreground">prasadghavghave0@gmail.com • 2 min ago</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-sm">
                    <p className="font-medium">Shop approved</p>
                    <p className="text-muted-foreground">Sindhi General Store • 1 hour ago</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 text-sm">
                    <p className="font-medium">Order status changed</p>
                    <p className="text-muted-foreground">ORD-003 → OUT_FOR_DELIVERY • 2 hours ago</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View Full Audit Log
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Category Management</h2>
                <p className="text-muted-foreground">Manage product and shop categories</p>
              </div>
              <Button onClick={() => setShowCategoryModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Product Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.filter(c => c.type === 'PRODUCT').map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-sm text-muted-foreground">{cat.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleCategoryActive(cat)} title={cat.isActive ? 'Deactivate' : 'Activate'}>
                            {cat.isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-5 h-5" />
                    Shop Categories
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.filter(c => c.type === 'SHOP').map(cat => (
                      <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <p className="text-sm text-muted-foreground">{cat.description || 'No description'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => toggleCategoryActive(cat)} title={cat.isActive ? 'Deactivate' : 'Activate'}>
                            {cat.isActive ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEditCategory(cat)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => deleteCategory(cat.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Add User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Add New User</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input 
                    value={newUser.name} 
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={newUser.email} 
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={newUser.phone} 
                    onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label>Role *</Label>
                  <select 
                    className="w-full p-2 border rounded-md bg-background"
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  >
                    <option value="ADMIN">Admin</option>
                    <option value="SHOP_OWNER">Shop Owner</option>
                    <option value="DELIVERY_BOY">Delivery Boy</option>
                  </select>
                </div>
                <div>
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={newUser.password} 
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="Leave blank for auto-generated"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleCreateUser} disabled={savingUser}>
                    {savingUser ? 'Creating...' : 'Create User'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowUserModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Shop Modal */}
        {showShopModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>Add New Shop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="border-b pb-4">
                  <p className="font-medium mb-3">Owner Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Owner Name *</Label>
                      <Input 
                        value={newShop.ownerName} 
                        onChange={(e) => setNewShop({...newShop, ownerName: e.target.value})}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <Label>Owner Email</Label>
                      <Input 
                        value={newShop.ownerEmail} 
                        onChange={(e) => setNewShop({...newShop, ownerEmail: e.target.value})}
                        placeholder="email@example.com"
                      />
                    </div>
                    <div>
                      <Label>Owner Phone</Label>
                      <Input 
                        value={newShop.ownerPhone} 
                        onChange={(e) => setNewShop({...newShop, ownerPhone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label>Password</Label>
                      <Input 
                        type="password"
                        value={newShop.ownerPassword} 
                        onChange={(e) => setNewShop({...newShop, ownerPassword: e.target.value})}
                        placeholder="Auto-generated if blank"
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-3">Shop Details</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Label>Shop Name *</Label>
                      <Input 
                        value={newShop.shopName} 
                        onChange={(e) => setNewShop({...newShop, shopName: e.target.value})}
                        placeholder="Shop name"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Input 
                        value={newShop.shopDescription} 
                        onChange={(e) => setNewShop({...newShop, shopDescription: e.target.value})}
                        placeholder="Shop description"
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Address *</Label>
                      <Input 
                        value={newShop.shopAddress} 
                        onChange={(e) => setNewShop({...newShop, shopAddress: e.target.value})}
                        placeholder="Full address"
                      />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input 
                        value={newShop.shopPincode} 
                        onChange={(e) => setNewShop({...newShop, shopPincode: e.target.value})}
                        placeholder="442105"
                      />
                    </div>
                    <div>
                      <Label>Category</Label>
                      <select 
                        className="w-full p-2 border rounded-md bg-background"
                        value={newShop.shopCategory}
                        onChange={(e) => setNewShop({...newShop, shopCategory: e.target.value})}
                      >
                        <option value="General">General</option>
                        <option value="Grocery">Grocery</option>
                        <option value="Dairy">Dairy</option>
                        <option value="Bakery">Bakery</option>
                        <option value="Fruits">Fruits & Vegetables</option>
                        <option value="Medical">Medical</option>
                        <option value="Electronics">Electronics</option>
                      </select>
                    </div>
                    <div>
                      <Label>Shop Phone</Label>
                      <Input 
                        value={newShop.shopPhone} 
                        onChange={(e) => setNewShop({...newShop, shopPhone: e.target.value})}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <Label>Shop Email</Label>
                      <Input 
                        value={newShop.shopEmail} 
                        onChange={(e) => setNewShop({...newShop, shopEmail: e.target.value})}
                        placeholder="shop@email.com"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleCreateShop} disabled={savingShop}>
                    {savingShop ? 'Creating...' : 'Create Shop & Owner'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowShopModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add Delivery Boy Modal */}
        {showDeliveryBoyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-500" />
                  Add New Delivery Boy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input 
                    value={newDeliveryBoy.name} 
                    onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, name: e.target.value})}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Phone *</Label>
                  <Input 
                    value={newDeliveryBoy.phone} 
                    onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, phone: e.target.value})}
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={newDeliveryBoy.email} 
                    onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label>Password</Label>
                  <Input 
                    type="password"
                    value={newDeliveryBoy.password} 
                    onChange={(e) => setNewDeliveryBoy({...newDeliveryBoy, password: e.target.value})}
                    placeholder="Leave blank for auto-generated"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleCreateDeliveryBoy} disabled={savingUser}>
                    {savingUser ? 'Creating...' : 'Add Delivery Boy'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowDeliveryBoyModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Add/Edit Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>{editingCategory ? 'Edit Category' : 'Add New Category'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Category Name *</Label> 
                  <Input 
                    value={editingCategory ? editCategoryForm.name : newCategory.name}
                    onChange={(e) => editingCategory 
                      ? setEditCategoryForm({...editCategoryForm, name: e.target.value})
                      : setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g., Electronics, Clothing"
                  />
                </div>
                <div>
                  <Label>Description</Label> 
                  <Input 
                    value={editingCategory ? editCategoryForm.description : newCategory.description}
                    onChange={(e) => editingCategory
                      ? setEditCategoryForm({...editCategoryForm, description: e.target.value})
                      : setNewCategory({...newCategory, description: e.target.value})}
                    placeholder="Category description"
                  />
                </div>
                {!editingCategory && (
                  <div>
                    <Label>Type</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      value={newCategory.type}
                      onChange={(e) => setNewCategory({...newCategory, type: e.target.value as 'PRODUCT' | 'SHOP'})}
                    >
                      <option value="PRODUCT">Product Category</option>
                      <option value="SHOP">Shop Category</option>
                    </select>
                  </div>
                )}
                {editingCategory && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={editCategoryForm.isActive}
                      onChange={(e) => setEditCategoryForm({...editCategoryForm, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="isActive" className="font-normal">Active</Label>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={editingCategory ? handleUpdateCategory : handleCreateCategory} disabled={savingCategory || !(editingCategory ? editCategoryForm.name : newCategory.name)}>
                    {savingCategory ? 'Saving...' : (editingCategory ? 'Update Category' : 'Add Category')}
                  </Button>
                  <Button variant="outline" onClick={() => { setShowCategoryModal(false); setEditingCategory(null); setEditCategoryForm({ name: '', description: '', isActive: true }) }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Shop Modal */}
        {showEditShopModal && editingShop && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Shop Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Shop Name</Label>
                  <Input 
                    value={editShopForm.name} 
                    onChange={(e) => setEditShopForm({...editShopForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input 
                    value={editShopForm.description} 
                    onChange={(e) => setEditShopForm({...editShopForm, description: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input 
                    value={editShopForm.address} 
                    onChange={(e) => setEditShopForm({...editShopForm, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={editShopForm.phone} 
                    onChange={(e) => setEditShopForm({...editShopForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={editShopForm.email} 
                    onChange={(e) => setEditShopForm({...editShopForm, email: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleUpdateShop} disabled={savingShop}>
                    {savingShop ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditShopModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Delivery Boy Modal */}
        {showEditDeliveryBoyModal && editingDeliveryBoy && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Edit Delivery Boy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input 
                    value={editDeliveryBoyForm.name} 
                    onChange={(e) => setEditDeliveryBoyForm({...editDeliveryBoyForm, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={editDeliveryBoyForm.phone} 
                    onChange={(e) => setEditDeliveryBoyForm({...editDeliveryBoyForm, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={editDeliveryBoyForm.email} 
                    onChange={(e) => setEditDeliveryBoyForm({...editDeliveryBoyForm, email: e.target.value})}
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleUpdateDeliveryBoy} disabled={savingUser}>
                    {savingUser ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowEditDeliveryBoyModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Update Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>Update Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>New Password</Label>
                  <Input 
                    type="password"
                    value={passwordForm.newPassword} 
                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    placeholder="Enter new password"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1" onClick={handleUpdatePassword} disabled={savingPassword || !passwordForm.newPassword}>
                    {savingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  )
}