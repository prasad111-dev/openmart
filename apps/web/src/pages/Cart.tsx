import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogHeader, DialogTitle, DialogContent } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { cartApi, adminApi, productApi } from '@/lib/api'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useToastSuccess, useToastError } from '@/hooks/useToastAlerts'

interface CartItem {
  productId: string
  quantity: number
  price: number
  name?: string
}

interface Cart {
  shopId: string
  shopName?: string
  shopCategory?: string
  shopIsOpen?: boolean
  items: CartItem[]
  total: number
}

interface PlatformSettings {
  platformFee: number
  deliveryCharge: number
  freeDeliveryThreshold: number
  minimumOrderAmount: number
}

export default function Cart() {
  const [cart, setCart] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const [settings, setSettings] = useState<PlatformSettings>({
    platformFee: 20,
    deliveryCharge: 20,
    freeDeliveryThreshold: 150,
    minimumOrderAmount: 0
  })
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [allProducts, setAllProducts] = useState<any[]>([])
  const [searchProduct, setSearchProduct] = useState('')
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [addingProduct, setAddingProduct] = useState<string | null>(null)
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null)
  const toastSuccess = useToastSuccess()
  const toastError = useToastError()

  const fetchCartData = useCallback(async () => {
    try {
      const res = await cartApi.get()
      setCart(res.data.data || [])
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCartData()
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

  useAutoRefresh({
    interval: 10000,
    onRefresh: fetchCartData,
  })

  const updateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) {
      await removeItem(productId)
      return
    }
    setUpdating(productId)
    try {
      await cartApi.update(productId, newQty)
      await fetchCartData()
    } catch (error) {
      console.error('Error updating:', error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    setUpdating(productId)
    try {
      await cartApi.remove(productId)
      await fetchCartData()
    } catch (error) {
      console.error('Error removing:', error)
    } finally {
      setUpdating(null)
    }
  }

  const openAddProduct = async (shopId: string) => {
    setSelectedShopId(shopId)
    setShowAddProduct(true)
    setSearchProduct('')
    setLoadingProducts(true)
    setAllProducts([])
    try {
      const res = await productApi.list({ shopId })
      setAllProducts(res.data.data || [])
    } catch (error: any) {
      console.error('Error fetching products:', error)
      toastError(error.response?.data?.error || 'Failed to load products')
    } finally {
      setLoadingProducts(false)
    }
  }

  const addProductToCart = async (product: any) => {
    if (!selectedShopId) return
    setAddingProduct(product.id)
    try {
      await cartApi.add({
        shopId: selectedShopId,
        productId: product.id,
        quantity: 1,
        price: product.price
      })
      toastSuccess(`${product.name} added to cart!`)
      setShowAddProduct(false)
      await fetchCartData()
    } catch (error: any) {
      toastError(error.response?.data?.error || 'Failed to add product')
    } finally {
      setAddingProduct(null)
    }
  }

  const filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(searchProduct.toLowerCase())
  )

  const totalItems = cart.reduce((sum, c) => sum + c.items.reduce((s, i) => s + i.quantity, 0), 0)
  const totalPlatformFee = settings.platformFee || 20

  const getDelivery = (shopSubtotal: number) => {
    return shopSubtotal >= (settings.freeDeliveryThreshold || 150) ? 0 : (settings.deliveryCharge || 20)
  }
  const getShopTotal = (shopCart: Cart) => {
    const shopSubtotal = shopCart.total || 0
    const delivery = getDelivery(shopSubtotal)
    return shopSubtotal + delivery + totalPlatformFee
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some products to get started</p>
          <Link to="/shops">
            <Button>Browse Shops</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" />
          Shopping Cart
          <span className="text-sm text-muted-foreground">({totalItems} items)</span>
        </h1>

        <div className="space-y-4 mb-6">
          {cart.map((shopCart) => (
            <motion.div
              key={shopCart.shopId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{shopCart.shopName || `Shop ${shopCart.shopId.slice(0, 8)}`}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          shopCart.shopIsOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {shopCart.shopIsOpen ? 'On' : 'Close'}
                        </span>
                      </div>
                      {shopCart.shopCategory && (
                        <span className="text-xs text-muted-foreground">{shopCart.shopCategory}</span>
                      )}
                    </div>
                    {!shopCart.shopIsOpen && (
                      <span className="text-xs text-red-400">Shop closed - cannot modify</span>
                    )}
                  </div>
                  <div className="space-y-3">
                    {shopCart.items.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name || `Product ${item.productId.slice(0, 8)}`}</p>
                            <p className="text-sm text-muted-foreground">₹{item.price} x {item.quantity}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            disabled={updating === item.productId || !shopCart.shopIsOpen}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            disabled={updating === item.productId || !shopCart.shopIsOpen}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeItem(item.productId)}
                            disabled={updating === item.productId || !shopCart.shopIsOpen}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border mt-3 pt-3 flex justify-between text-sm">
                    <span className="text-muted-foreground">Shop Subtotal</span>
                    <span>₹{shopCart.total || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className={getDelivery(shopCart.total || 0) === 0 ? 'text-green-400' : ''}>
                      ₹{getDelivery(shopCart.total || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform Fee</span>
                    <span>₹{totalPlatformFee}</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between font-medium">
                    <span>Shop Total</span>
                    <span>₹{getShopTotal(shopCart)}</span>
                  </div>
                  {shopCart.total < (settings.minimumOrderAmount || 0) && (
                    <p className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                      Min order: ₹{settings.minimumOrderAmount || 0}
                    </p>
                  )}
                  <Button 
                    variant="outline"
                    className="w-full mt-2" 
                    size="sm"
                    onClick={() => openAddProduct(shopCart.shopId)}
                    disabled={!shopCart.shopIsOpen}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {shopCart.shopIsOpen ? 'Add Product from this shop' : 'Shop Closed'}
                  </Button>
                  <Link to={shopCart.total >= (settings.minimumOrderAmount || 0) && shopCart.shopIsOpen ? '/checkout' : '#'}>
                    <Button 
                      className="w-full mt-2" 
                      size="sm"
                      disabled={shopCart.total < (settings.minimumOrderAmount || 0) || !shopCart.shopIsOpen}
                    >
                      Checkout from this shop
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {showAddProduct && (
        <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product to Cart</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              <Input
                placeholder="Search products..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
              />
              <div className="space-y-2">
                {loadingProducts ? (
                  <p className="text-center p-4">Loading products...</p>
                ) : !selectedShopId ? (
                  <p className="text-center p-4 text-muted-foreground">Select a shop first</p>
                ) : filteredProducts.length === 0 ? (
                  <p className="text-center p-4 text-muted-foreground">No products found</p>
                ) : (
                  filteredProducts.map(product => (
                    <div key={product.id} className="p-3 rounded-lg border border-border hover:border-primary/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">₹{product.price} • {product.category}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => addProductToCart(product)}
                          disabled={addingProduct === product.id}
                        >
                          {addingProduct === product.id ? 'Adding...' : 'Add'}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}