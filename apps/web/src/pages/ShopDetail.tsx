import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Phone, ShoppingCart, Search, ArrowLeft, Minus, Plus, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cartApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { shopApi } from '@/lib/api'
import { useSeo } from '@/hooks/useSeo'
import { useToastSuccess, useToastError, useToastInfo } from '@/hooks/useToastAlerts'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  imageUrl: string
  description?: string
}

interface Shop {
  id: string
  name: string
  description: string
  address: string
  phone: string
  rating: number
  isOpen: boolean
  category: string
  deliveryTime?: string
}

export default function ShopDetail() {
  const navigate = useNavigate()
  const { id: shopId } = useParams()
  const [shop, setShop] = useState<Shop | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [quantities, setQuantities] = useState<Record<string, number>>({})
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  const toastSuccess = useToastSuccess()
  const toastError = useToastError()
  const toastInfo = useToastInfo()

  useSeo({
    title: shop?.name || 'Shop',
    description: shop?.description || 'Browse products at this shop',
  })

  useEffect(() => {
    fetchShopData()
  }, [shopId])

  const fetchShopData = async () => {
    try {
      setLoading(true)
      const [shopRes, productsRes] = await Promise.all([
        shopApi.get(shopId!),
        shopApi.getProducts(shopId!)
      ])
      setShop(shopRes.data.data)
      setProducts(productsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching shop:', error)
    } finally {
      setLoading(false)
    }
  }

  const categories = ['All', ...new Set(products.map(p => p.category))]
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const addToCart = async (product: Product) => {
    const user = useAuthStore.getState().user
    if (!user) {
      toastError('Please login first')
      navigate('/login')
      return
    }

    const qty = quantities[product.id] || 1
    setAddingToCart(product.id)

    try {
      await cartApi.add({
        shopId: shopId!,
        productId: product.id,
        quantity: qty,
        price: product.price
      })
      toastSuccess(`${product.name} added to cart! (Qty: ${qty})`)
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || ''
      if (errorMsg.includes('cart cleared') || errorMsg.includes('different shop')) {
        toastInfo('Your cart was cleared - you can only shop from one shop at a time')
      } else {
        toastError(errorMsg || 'Failed to add to cart')
      }
    } finally {
      setAddingToCart(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 gradient-mesh opacity-30" />
        <main className="relative z-10 max-w-7xl mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <Card key={i}>
                  <Skeleton className="aspect-square rounded-t-lg" />
                  <CardContent className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Shop not found</h2>
          <Link to="/shops">
            <Button className="mt-4">Browse Shops</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 pb-24">
        <div className="relative h-48 overflow-hidden">
          <img 
            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=400&fit=crop" 
            alt={shop.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link to="/shops">
              <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          {/* Cart Button */}
          <div className="absolute top-4 right-4">
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="bg-background/80 backdrop-blur-sm">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 -mt-20 relative">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center">
              <span className="text-4xl">🏪</span>
            </div>
            <div className="flex-1">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-2 ${
                shop.isOpen ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {shop.isOpen ? 'On' : 'Close'}
              </span>
              {!shop.isOpen && (
                <p className="text-sm text-red-400 mt-1">This shop is currently closed. You cannot add products to cart.</p>
              )}
              <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{shop.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {shop.address}
            </span>
            <a href={`tel:${shop.phone}`} className="flex items-center gap-1 text-primary">
              <Phone className="w-4 h-4" />
              {shop.phone}
            </a>
          </div>

          <div className="mb-6">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
              >
                <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300">
                  <Link to={`/products/${product.id}`}>
                    <div className="aspect-square overflow-hidden">
                      <img 
                        src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop'} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-3">
                    <p className="text-xs text-muted-foreground mb-1">{product.category}</p>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-medium text-sm mb-2 line-clamp-2 hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold">₹{product.price}</span>
                        <div className="flex items-center gap-1">
                          {product.stock === 0 ? (
                            <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                          ) : product.stock <= 10 ? (
                            <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-400">Low Stock: {product.stock}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Package className="w-3 h-3" />{product.stock} in stock
                            </span>
                          )}
                        </div>
                      </div>
                      {product.stock > 0 && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuantities({...quantities, [product.id]: (quantities[product.id] || 1) - 1 })}
                            disabled={(quantities[product.id] || 1) <= 1}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="w-8 text-center">{quantities[product.id] || 1}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setQuantities({...quantities, [product.id]: (quantities[product.id] || 1) + 1 })}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    {product.stock > 0 && shop.isOpen && (
                      <Button
                        className="w-full mt-3"
                        onClick={() => addToCart(product)}
                        disabled={addingToCart === product.id}
                      >
                        {addingToCart === product.id ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart ({quantities[product.id] || 1})
                          </span>
                        )}
                      </Button>
                    )}
                    {product.stock === 0 && (
                      <Button className="w-full mt-3" disabled variant="outline">
                        Out of Stock
                      </Button>
                    )}
                    {product.stock > 0 && !shop.isOpen && (
                      <Button className="w-full mt-3" disabled variant="outline">
                        Shop Closed
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}