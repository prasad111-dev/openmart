import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Plus, Wallet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { orderApi, cartApi, adminApi, addressApi } from '@/lib/api'
import { useSeo } from '@/hooks/useSeo'
import { useToastSuccess, useToastError } from '@/hooks/useToastAlerts'

interface Address {
  id: string
  label: string
  street: string
  city: string
  state: string
  pincode: string
  isDefault: boolean
}

interface CartItem {
  productId: string
  quantity: number
  price: number
  name?: string
}

interface Cart {
  shopId: string
  shopName?: string
  shopIsOpen?: boolean
  items: CartItem[]
  total: number
}

export default function Checkout() {
  const navigate = useNavigate()
  const [cart, setCart] = useState<Cart[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState('')
  const [showNewAddress, setShowNewAddress] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetchingAddresses, setFetchingAddresses] = useState(true)
  const [fetchingCart, setFetchingCart] = useState(true)
  const [settings, setSettings] = useState({ 
    platformFee: 20, 
    deliveryCharge: 20, 
    freeDeliveryThreshold: 150,
    minimumOrderAmount: 0
  })
  
  const toastSuccess = useToastSuccess()
  const toastError = useToastError()

  useSeo({
    title: 'Checkout',
    description: 'Complete your order and choose payment method',
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await adminApi.getPlatformSettings()
        if (res.data.data) {
          setSettings(res.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch settings:', err)
      }
    }
    fetchSettings()
  }, [])

  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    state: 'Maharashtra',
    pincode: '',
  })

  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [addressesRes, cartRes] = await Promise.all([
          addressApi.list(),
          cartApi.get(),
        ])
        if (addressesRes.data.data && addressesRes.data.data.length > 0) {
          setAddresses(addressesRes.data.data)
          const defaultAddr = addressesRes.data.data.find((a: Address) => a.isDefault)
          setSelectedAddress(defaultAddr?.id || addressesRes.data.data[0].id)
        }
        setCart(cartRes.data.data || [])
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setFetchingAddresses(false)
        setFetchingCart(false)
      }
    }
    fetchData()
  }, [])

  const handleSaveAddress = async () => {
    if (!newAddress.label || !newAddress.street || !newAddress.pincode) {
      return
    }
    try {
      const { data } = await addressApi.create({
        ...newAddress,
        isDefault: addresses.length === 0,
      })
      setAddresses([...addresses, data.data])
      setSelectedAddress(data.data.id)
      setShowNewAddress(false)
      setNewAddress({ label: '', street: '', city: '', state: 'Maharashtra', pincode: '' })
    } catch (err) {
      console.error('Failed to save address:', err)
    }
  }

  const currentCart = cart[0]
  const subtotal = currentCart?.total || 0
  const minOrder = settings.minimumOrderAmount || 0
  const canPlaceOrder = subtotal >= minOrder
  const delivery = subtotal >= (settings.freeDeliveryThreshold || 150) ? 0 : (settings.deliveryCharge || 20)
  const platformFee = settings.platformFee || 20
  const total = subtotal + delivery + platformFee
  const totalItems = cart.reduce((sum, c) => sum + c.items.length, 0)

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !currentCart) {
      return
    }
    if (currentCart.shopIsOpen === false) {
      toastError('This shop is currently closed. Please remove items and add from an open shop.')
      return
    }
    if (!canPlaceOrder) {
      toastError(`Minimum order amount is ₹${minOrder}`)
      return
    }
    setLoading(true)
    try {
      const orderData = {
        shopId: currentCart.shopId,
        deliveryAddressId: selectedAddress,
        items: currentCart.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        specialInstructions: instructions,
        paymentMethod: 'COD',
      }
      
      await orderApi.create(orderData)
      await cartApi.clear()
      toastSuccess('Order placed successfully!')
      navigate('/orders')
    } catch (error: any) {
      console.error('Order failed:', error)
      toastError(error.response?.data?.error || 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  if (fetchingCart || fetchingAddresses) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
          <Link to="/shops">
            <Button>Browse Shops</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-6 pb-24">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Checkout</h1>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {fetchingAddresses ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                ) : addresses.length > 0 ? (
                  addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddress === addr.id}
                          onChange={() => setSelectedAddress(addr.id)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{addr.label}</span>
                            {addr.isDefault && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{addr.street}, {addr.city}, {addr.pincode}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No addresses saved. Add a new address below.</p>
                )}
                
                <button
                  onClick={() => setShowNewAddress(!showNewAddress)}
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add new address
                </button>

                {showNewAddress && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-4 rounded-xl border border-border space-y-4"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Label</Label>
                        <Input 
                          placeholder="Home, Office, etc." 
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        />
                      </div>
                      <div className="col-span-2">
                        <Label>Address</Label>
                        <Input 
                          placeholder="Street address" 
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Input 
                          placeholder="City" 
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Pincode</Label>
                        <Input 
                          placeholder="442105" 
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full" onClick={handleSaveAddress}>Save Address</Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-4 rounded-xl border-2 border-primary bg-primary/5 flex items-center gap-3">
                  <input type="radio" checked readOnly className="accent-primary" />
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="font-medium">Cash on Delivery</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Pay with cash when your order is delivered
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Special Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Any specific instructions for the delivery..."
                  className="w-full h-24 p-3 rounded-lg border border-border bg-secondary/50 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentCart?.items.map((item) => (
                  <div key={item.productId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.quantity}x {item.name || `Product ${item.productId}`}
                    </span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                
                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>₹{delivery}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span>₹{platformFee}</span>
                  </div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handlePlaceOrder}
                  disabled={loading || !selectedAddress || !canPlaceOrder}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Placing Order...
                    </span>
                  ) : (
                    'Place Order'
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
