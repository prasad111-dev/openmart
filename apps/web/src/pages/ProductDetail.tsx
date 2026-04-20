import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, ShoppingCart, Minus, Plus, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCartStore } from '@/store'
import { cartApi, productApi } from '@/lib/api'
import { useAuthStore } from '@/store'
import { useSeo } from '@/hooks/useSeo'
import { useToastSuccess } from '@/hooks/useToastAlerts'

interface Product {
  id: string
  name: string
  price: number
  mrp: number | null
  category: string
  stock: number
  imageUrl: string
  description?: string
  shopId?: string
}

export default function ProductDetail() {
  const { id: productId } = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [adding, setAdding] = useState(false)
  const [loading, setLoading] = useState(true)
  
  const addItem = useCartStore((state) => state.addItem)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const toastSuccess = useToastSuccess()

  useSeo({
    title: product?.name || 'Product',
    description: product?.description || `Buy ${product?.name} at best price`,
    image: product?.imageUrl,
  })

  useEffect(() => {
    fetchProduct()
  }, [productId])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const res = await productApi.get(productId!)
      setProduct(res.data.data)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (delta: number) => {
    if (!product) return
    setQuantity(Math.max(1, Math.min(product.stock, quantity + delta)))
  }

  const handleAddToCart = async () => {
    if (!product || !product.shopId) return
    
    if (!isAuthenticated) {
      window.location.href = '/login'
      return
    }

    setAdding(true)
    
    try {
      await cartApi.add({
        shopId: product.shopId,
        productId: product.id,
        quantity: quantity,
        price: product.price
      })
    } catch (error) {
      console.log('Server failed, using local cart')
    }

    addItem(product.shopId, {
      productId: product.id,
      quantity: quantity,
      price: product.price,
      name: product.name,
      imageUrl: product.imageUrl,
      stock: product.stock
    })

    setAdding(false)
    toastSuccess(`${product.name} added to cart! (Qty: ${quantity})`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold">Product not found</h2>
          <Link to="/shops">
            <Button className="mt-4">Browse Shops</Button>
          </Link>
        </div>
      </div>
    )
  }

  const images = product.imageUrl ? [product.imageUrl] : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&h=600&fit=crop']

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 gradient-mesh opacity-30" />
      
      <main className="relative z-10 pb-24">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Back Button */}
          <div className="flex items-center gap-3 mb-6">
            <Link to={`/shops/${product.shopId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Product Details</h1>
            <div className="flex-1" />
            <Link to="/cart">
              <Button variant="outline" size="icon">
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="aspect-square rounded-2xl overflow-hidden bg-card mb-4">
                <img 
                  src={images[selectedImage]} 
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === i ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4"
            >
              <div>
                <span className="text-sm text-muted-foreground">{product.category}</span>
                <h1 className="text-2xl font-bold mt-1">{product.name}</h1>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-medium">4.5</span>
                </div>
                <span className="text-muted-foreground">(128 reviews)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold">₹{product.price}</span>
                {product.mrp && product.mrp > product.price && (
                  <>
                    <span className="text-lg text-muted-foreground line-through">₹{product.mrp}</span>
                    <span className="text-sm text-green-400 font-medium">
                      {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% off
                    </span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground">{product.description || 'Fresh and quality product'}</p>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                <span className="text-sm text-muted-foreground">Sold by:</span>
                <Link 
                  to={`/shops/${product.shopId}`}
                  className="text-primary font-medium hover:underline"
                >
                  View Shop
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Quantity:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => updateQuantity(1)}
                    disabled={quantity >= product.stock}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.stock} available)
                </span>
              </div>

              <div className="flex gap-3 pt-4">
                <Button 
                  size="lg" 
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={adding || product.stock === 0}
                >
                  {adding ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Adding...
                    </span>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" className="flex-1">
                  Buy Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  )
}