import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, MapPin, LogOut, Plus, Edit, Trash2, Store, Mail, Phone, Shield, Package, Truck, Save, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuthStore } from '@/store'
import { addressApi } from '@/lib/api'
import MapPicker from '@/components/MapPicker'
import { useToastSuccess, useToastError } from '@/hooks/useToastAlerts'

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
  latitude?: number
  longitude?: number
}

export default function Profile() {
  const navigate = useNavigate()
  const { user, logout, setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'orders'>('profile')
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showAddAddress, setShowAddAddress] = useState(false)
  
  const toastSuccess = useToastSuccess()
  const toastError = useToastError()
  
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
  })

  const [addressForm, setAddressForm] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    latitude: 0,
    longitude: 0,
  })

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    setProfileForm({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
    })
    fetchAddresses()
  }, [user])

  const fetchAddresses = async () => {
    try {
      const res = await addressApi.list()
      setAddresses(res.data.data || [])
    } catch (error) {
      // Use mock addresses if API fails
      setAddresses([
        { id: '1', label: 'Home', street: '123 Main Road, Sindhi Railway', city: 'Sindhi Railway', state: 'Maharashtra', pincode: '442105', isDefault: true },
      ])
    }
  }

  const handleProfileSave = async () => {
    setLoading(true)
    try {
      if (!user) return
      const updatedUser = {
        ...user,
        name: profileForm.name,
        email: profileForm.email,
        phone: profileForm.phone,
        avatar: user.avatar ?? null,
      }
      setAuth(updatedUser as any, useAuthStore.getState().token || '')
      setIsEditing(false)
      toastSuccess('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAddress = async () => {
    if (!addressForm.label || !addressForm.street || !addressForm.city || !addressForm.pincode) {
      toastError('Please fill all required fields')
      return
    }
    
    try {
      const newAddress = {
        ...addressForm,
        state: addressForm.state || 'Maharashtra',
        isDefault: addresses.length === 0,
      }
      const res = await addressApi.create(newAddress)
      setAddresses([...addresses, res.data.data])
      setShowAddAddress(false)
      setAddressForm({ label: '', street: '', city: '', state: '', pincode: '', latitude: 0, longitude: 0 })
    } catch (error) {
      // Add locally if API fails
      const newAddress = {
        ...addressForm,
        state: addressForm.state || 'Maharashtra',
        isDefault: addresses.length === 0,
        id: String(Date.now()),
      }
      setAddresses([...addresses, newAddress])
      setShowAddAddress(false)
    }
  }

  const handleDeleteAddress = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    
    try {
      await addressApi.delete(id)
      setAddresses(addresses.filter(a => a.id !== id))
    } catch (error) {
      setAddresses(addresses.filter(a => a.id !== id))
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      await addressApi.setDefault(id)
      setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })))
    } catch (error) {
      setAddresses(addresses.map(a => ({ ...a, isDefault: a.id === id })))
    }
  }

  const handleLogout = () => {
    logout()
    window.location.href = '/'
  }

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      'CUSTOMER': 'bg-green-500/20 text-green-400',
      'SHOP_OWNER': 'bg-blue-500/20 text-blue-400',
      'DELIVERY_BOY': 'bg-orange-500/20 text-orange-400',
      'ADMIN': 'bg-purple-500/20 text-purple-400',
    }
    return colors[role] || 'bg-gray-500/20 text-gray-400'
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-6">
        {/* User Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-primary/20 flex items-center justify-center">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {user?.name}
                {user?.isVerified && <CheckCircle className="w-5 h-5 text-green-500" />}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4" /> {user?.email}
              </p>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Phone className="w-4 h-4" /> {user?.phone || 'No phone added'}
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadge(user?.role || 'CUSTOMER')}`}>
                  {user?.role === 'SHOP_OWNER' && <Store className="w-3 h-3 inline mr-1" />}
                  {user?.role === 'DELIVERY_BOY' && <Truck className="w-3 h-3 inline mr-1" />}
                  {user?.role === 'ADMIN' && <Shield className="w-3 h-3 inline mr-1" />}
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'profile' ? 'default' : 'outline'}
            onClick={() => setActiveTab('profile')}
          >
            <User className="w-4 h-4 mr-2" />
            Profile
          </Button>
          <Button
            variant={activeTab === 'addresses' ? 'default' : 'outline'}
            onClick={() => setActiveTab('addresses')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Addresses ({addresses.length})
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'outline'}
            onClick={() => setActiveTab('orders')}
          >
            <Package className="w-4 h-4 mr-2" />
            My Orders
          </Button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Profile Information</CardTitle>
              <Button 
                variant={isEditing ? 'destructive' : 'outline'} 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? <X className="w-4 h-4 mr-1" /> : <Edit className="w-4 h-4 mr-1" />}
                {isEditing ? 'Cancel' : 'Edit'}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <Input 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    disabled={!isEditing}
                    className={isEditing ? '' : 'bg-secondary/50'}
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    disabled={!isEditing}
                    type="email"
                    className={isEditing ? '' : 'bg-secondary/50'}
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    disabled={!isEditing}
                    type="tel"
                    className={isEditing ? '' : 'bg-secondary/50'}
                  />
                </div>
                <div>
                  <Label>Account Type</Label>
                  <Input 
                    value={user?.role || 'CUSTOMER'}
                    disabled
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label>Member Since</Label>
                  <Input 
                    value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    disabled
                    className="bg-secondary/50"
                  />
                </div>
                <div>
                  <Label>Account Status</Label>
                  <Input 
                    value={user?.isVerified ? 'Verified' : 'Pending Verification'}
                    disabled
                    className="bg-secondary/50"
                  />
                </div>
              </div>
              
              {isEditing && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button onClick={handleProfileSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Addresses Tab */}
        {activeTab === 'addresses' && (
          <div className="space-y-4">
            {addresses.map((addr) => (
              <motion.div
                key={addr.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className={addr.isDefault ? 'border-primary/50' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          addr.isDefault ? 'bg-primary/20' : 'bg-secondary'
                        }`}>
                          <MapPin className={`w-5 h-5 ${addr.isDefault ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {addr.street}, {addr.city}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {!addr.isDefault && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleSetDefault(addr.id)}
                          >
                            Set Default
                          </Button>
                        )}
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDeleteAddress(addr.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {showAddAddress ? (
              <Card>
                <CardHeader>
                  <CardTitle>Add New Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Map Picker */}
                  <div>
                    <Label className="mb-2 block">Select Location on Map</Label>
                    <MapPicker 
                      onLocationSelect={(lat, lng) => {
                        setAddressForm({ ...addressForm, latitude: lat, longitude: lng })
                      }}
                      height="250px"
                    />
                    <p className="text-xs text-muted-foreground mt-2">
                      📍 Click on the map or use "My Location" to set your delivery location
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Label (Home/Office/Other)</Label>
                      <Input
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        placeholder="e.g., Home"
                      />
                    </div>
                    <div>
                      <Label>Pincode</Label>
                      <Input
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="442105"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Street Address</Label>
                      <Input
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="House No., Road, Area"
                      />
                    </div>
                    <div>
                      <Label>City</Label>
                      <Input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Sindhi Railway"
                      />
                    </div>
                    <div>
                      <Label>State</Label>
                      <Input
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        placeholder="Maharashtra"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button onClick={handleAddAddress}>
                      <Save className="w-4 h-4 mr-2" />
                      Save Address
                    </Button>
                    <Button variant="outline" onClick={() => setShowAddAddress(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => setShowAddAddress(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Address
              </Button>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card>
            <CardHeader>
              <CardTitle>My Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No orders yet</p>
                <p className="text-sm">Start shopping to see your orders here!</p>
                <Link to="/home">
                  <Button className="mt-4">Browse Shops</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Logout Section */}
        <div className="mt-8 pt-6 border-t">
          <Button variant="destructive" onClick={handleLogout} className="w-full md:w-auto">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </main>
    </div>
  )
}