import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Minus, Star, ShoppingCart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useCartStore } from '@/store'
import { cn } from '@/lib/utils'

export interface ProductCardData {
  id: string
  name: string
  price: number
  mrp?: number | null
  imageUrl?: string | null
  rating?: number
  reviewCount?: number
  unit: string
  category: string
  shopId: string
  shopName?: string
  discount?: number
  badge?: string
  inStock: boolean
}

interface ProductCardProps {
  product: ProductCardData
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const [adding, setAdding] = useState(false)
  const { addItem, carts } = useCartStore()

  const cartItem = carts[product.shopId]?.items.find(i => i.productId === product.id)
  const inCart = !!cartItem

  const handleAdd = async () => {
    setAdding(true)
    addItem(product.shopId, {
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || null,
      quantity: 1,
      stock: 99,
    })
    setTimeout(() => setAdding(false), 300)
  }

  const discount = product.mrp && product.mrp > product.price
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : product.discount

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={cn(
        "group relative flex flex-col w-[180px] rounded-xl border border-border bg-card overflow-hidden transition-shadow hover:shadow-md",
        className
      )}
    >
      {/* Image */}
      <Link to={`/products/${product.id}`} className="relative block">
        <div className="aspect-square bg-secondary/30 overflow-hidden">
          <img
            src={product.imageUrl || '/placeholder-product.webp'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />
        </div>

        {/* Badge */}
        {product.badge && (
          <Badge variant="secondary" className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5">
            {product.badge}
          </Badge>
        )}

        {/* Discount */}
        {discount && discount > 0 && (
          <Badge className="absolute top-2 right-2 bg-success text-success-foreground text-[10px] px-1.5 py-0.5">
            {discount}% OFF
          </Badge>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-col gap-1 p-3 flex-1">
        {/* Rating */}
        {product.rating && (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-success/10">
              <Star className="w-3 h-3 fill-success text-success" />
              <span className="text-[10px] font-medium text-success">{product.rating}</span>
            </div>
            {product.reviewCount && (
              <span className="text-[10px] text-muted-foreground">({product.reviewCount > 1000 ? `${(product.reviewCount / 1000).toFixed(1)}k` : product.reviewCount})</span>
            )}
          </div>
        )}

        {/* Name */}
        <Link to={`/products/${product.id}`}>
          <p className="text-sm font-medium text-foreground line-clamp-2 leading-tight hover:text-primary transition-colors">
            {product.name}
          </p>
        </Link>

        {/* Unit */}
        <p className="text-xs text-muted-foreground">{product.unit}</p>

        {/* Price + Add Button */}
        <div className="flex items-center justify-between mt-auto pt-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-foreground">₹{product.price}</span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-muted-foreground line-through">₹{product.mrp}</span>
            )}
          </div>

          {inCart ? (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-primary-foreground">
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-primary-foreground hover:bg-primary/80 p-0 h-auto"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                }}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="text-xs font-medium w-4 text-center">{cartItem.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-primary-foreground hover:bg-primary/80 p-0 h-auto"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAdd()
                }}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <motion.div whileTap={{ scale: 0.95 }}>
              <Button
                size="sm"
                className="h-7 px-3 text-xs gap-1"
                disabled={adding || !product.inStock}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleAdd()
                }}
              >
                <ShoppingCart className="w-3 h-3" />
                ADD
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
