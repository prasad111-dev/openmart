import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, MapPin, Star, Clock, Filter, Store, X, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { shopApi, categoryApi, productApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import { useSeo } from '@/hooks/useSeo'

const defaultCategories = ['All', 'Grocery', 'Dairy', 'Fruits', 'Vegetables', 'Bakery', 'General Store', 'Personal Care', 'Household', 'Beverages']

interface Shop {
  id: string
  name: string
  description: string
  rating?: number
  deliveryTime?: string
  distance?: string
  category?: string
  imageUrl?: string
  isOpen: boolean
  phone?: string
  address?: string
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number
  category: string
  stock: number
  imageUrl: string | null
  shop: { name: string }
}

interface Filters {
  category: string
  sortBy: string
  status: string
  maxDeliveryTime: string
  minRating: string
}

export default function ShopList() {
  const [searchParams] = useSearchParams()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [shops, setShops] = useState<Shop[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(defaultCategories)
  const [loading, setLoading] = useState(true)
  const [searchMode, setSearchMode] = useState<'shops' | 'products'>('shops')
  
  useSeo({
    title: 'Browse Shops',
    description: 'Find local grocery shops, supermarkets, and convenience stores near you.',
    keywords: 'local shops, grocery, supermarket, convenience store, near me',
  })
  
  const [filters, setFilters] = useState<Filters>({
    category: 'All',
    sortBy: 'name',
    status: 'all',
    maxDeliveryTime: '60',
    minRating: '0',
  })

  useEffect(() => {
    fetchCategories()
    fetchShops()
  }, [])

  const refreshData = useCallback(async () => {
    if (!search) {
      await fetchShops()
    }
  }, [search, filters.category])

  useAutoRefresh({
    interval: 15000,
    enabled: isAuthenticated,
    onRefresh: refreshData,
  })

  useEffect(() => {
    if (search) {
      fetchProducts()
    } else {
      setProducts([])
      fetchShops()
    }
  }, [search, filters.category])

  const fetchCategories = async () => {
    try {
      const res = await categoryApi.list('SHOP')
      if (res.data.data && res.data.data.length > 0) {
        setCategories(['All', ...res.data.data.map((c: any) => c.name)])
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await productApi.list({ 
        search: search || undefined,
        category: filters.category === 'All' ? undefined : filters.category,
        pincode: '442105'
      })
      setProducts(res.data.data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchShops = async () => {
    try {
      setLoading(true)
      const res = await shopApi.list({ 
        search: search || undefined,
        category: filters.category === 'All' ? undefined : filters.category,
        pincode: '442105'
      })
      setShops(res.data.data || [])
    } catch (error) {
      console.error('Error fetching shops:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearFilters = () => {
    setFilters({
      category: 'All',
      sortBy: 'name',
      status: 'all',
      maxDeliveryTime: '60',
      minRating: '0',
    })
    setSearch('')
  }

  const filteredShops = shops
    .filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = filters.category === 'All' || shop.category === filters.category || !shop.category
      
      // Status filter
      let matchesStatus = true
      if (filters.status === 'open') matchesStatus = shop.isOpen
      else if (filters.status === 'closed') matchesStatus = !shop.isOpen
      
      // Rating filter
      const shopRating = shop.rating || 4.5
      const matchesRating = shopRating >= Number(filters.minRating)
      
      // Delivery time filter (extract minutes from deliveryTime string like "15-25 min")
      let matchesDelivery = true
      if (shop.deliveryTime && filters.maxDeliveryTime !== '60') {
        const match = shop.deliveryTime.match(/(\d+)/)
        if (match) {
          const maxTime = parseInt(match[1])
          matchesDelivery = maxTime <= Number(filters.maxDeliveryTime)
        }
      }
      
      return matchesSearch && matchesCategory && matchesStatus && matchesRating && matchesDelivery
    })
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 4.5) - (a.rating || 4.5)
        case 'delivery':
          const aTime = parseInt(a.deliveryTime?.match(/(\d+)/)?.[1] || '20')
          const bTime = parseInt(b.deliveryTime?.match(/(\d+)/)?.[1] || '20')
          return aTime - bTime
        case 'name':
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const getShopImage = (shop: Shop) => {
    if (shop.imageUrl) return shop.imageUrl
    const categoryImages: Record<string, string> = {
      'Grocery': 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop',
      'Dairy': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop',
      'Fruits': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=300&fit=crop',
      'Vegetables': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop',
      'Bakery': 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&h=300&fit=crop',
    }
    return categoryImages[shop.category || ''] || 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop'
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      {/* Search and Filters Bar */}
      <div className="sticky top-0 md:top-0 z-40 glass border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search shops or products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-border/50"
              />
            </div>
            <Button 
              variant={showFilters ? 'default' : 'outline'} 
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          
          {search && (
            <div className="flex gap-2 pt-3">
              <Button
                variant={searchMode === 'shops' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('shops')}
              >
                <Store className="w-4 h-4 mr-1" />
                Shops
              </Button>
              <Button
                variant={searchMode === 'products' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSearchMode('products')}
              >
                <Package className="w-4 h-4 mr-1" />
                Products
              </Button>
            </div>
          )}

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 pb-1">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Category</label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                      value={filters.category}
                      onChange={(e) => setFilters({...filters, category: e.target.value})}
                    >
                      <option value="All">All Categories</option>
                      {categories.filter(c => c !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Sort By</label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                      value={filters.sortBy}
                      onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    >
                      <option value="name">Name (A-Z)</option>
                      <option value="rating">Rating (High to Low)</option>
                      <option value="delivery">Delivery Time (Fast)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Status</label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                      <option value="all">All</option>
                      <option value="open">On</option>
                      <option value="closed">Close</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Min Rating</label>
                    <select
                      className="w-full h-9 px-3 rounded-md border border-border bg-background text-sm"
                      value={filters.minRating}
                      onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                    >
                      <option value="0">Any Rating</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="4.5">4.5+ Stars</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <p className="text-xs text-muted-foreground">
                    Showing {filteredShops.length} of {shops.length} shops
                  </p>
                  <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                    <X className="w-3 h-3 mr-1" />
                    Clear Filters
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-2 overflow-x-auto py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilters({...filters, category: cat})}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  filters.category === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>Sindhi Railway, 442105</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-square" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : search && searchMode === 'products' ? (
          products.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">Found {products.length} products</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {products.map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.01 }}
                    whileHover={{ y: -2 }}
                  >
                    <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300 cursor-pointer">
                      <div className="aspect-square overflow-hidden relative">
                        <motion.img 
                          src={product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300'} 
                          alt={product.name}
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.15 }}
                          className="w-full h-full object-cover"
                        />
                        <motion.div 
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 1 }}
                          className="absolute inset-0 bg-primary/20 flex items-center justify-center opacity-0"
                        >
                          <Button size="sm">View</Button>
                        </motion.div>
                        <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                          ₹{product.price}
                        </div>
                        {product.stock === 0 && (
                          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-destructive/80 text-destructive-foreground text-xs font-medium">
                            Out of Stock
                          </div>
                        )}
                        {product.stock > 0 && product.stock <= 10 && (
                          <div className="absolute bottom-3 left-3 px-2 py-1 rounded-full bg-yellow-500/80 text-yellow-foreground text-xs font-medium">
                            Only {product.stock} left
                          </div>
                        )}
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{product.shop.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{product.category}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </>
          )
        ) : filteredShops.length === 0 ? (
          <div className="text-center py-20">
            <Store className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No shops found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredShops.map((shop, i) => (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                whileHover={{ y: -2 }}
              >
                <Link to={`/shops/${shop.id}`}>
                  <Card className="overflow-hidden group hover:border-primary/50 transition-all duration-300 cursor-pointer hover-lift">
                    <div className="aspect-video overflow-hidden relative">
                      <motion.img 
                        src={getShopImage(shop)} 
                        alt={shop.name}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.15 }}
                        className="w-full h-full object-cover"
                      />
                      <motion.div 
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-4 opacity-0"
                      >
                        <Button size="sm" variant="secondary">View Shop</Button>
                      </motion.div>
                      <div className="absolute top-3 right-3">
                        <motion.span 
                          whileHover={{ scale: 1.1 }}
                          className={`px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm cursor-default ${
                            shop.isOpen 
                              ? 'bg-green-500/80 text-white' 
                              : 'bg-red-500/80 text-white'
                          }`}>
                          {shop.isOpen ? 'On' : 'Close'}
                        </motion.span>
                      </div>
                      {shop.category && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium">
                          {shop.category}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold">{shop.name}</h3>
                        <motion.div 
                          whileHover={{ scale: 1.2 }}
                          className="flex items-center gap-1 text-sm"
                        >
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span>{shop.rating || '4.5'}</span>
                        </motion.div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <motion.span 
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1"
                        >
                          <Clock className="w-4 h-4" />
                          {shop.deliveryTime || '15-25 min'}
                        </motion.span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {shop.distance || '< 1 km'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}