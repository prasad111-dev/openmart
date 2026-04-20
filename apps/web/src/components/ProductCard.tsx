
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useState } from "react"
import { staggerItem } from "@/lib/animations"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image?: string | null
  category?: string
  shopName?: string
  rating?: number
  stock?: number
  onAddToCart?: (id: string) => void
}

export function ProductCard({
  id,
  name,
  price,
  image,
  category,
  shopName,
  stock = 999,
  onAddToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const isOutOfStock = stock === 0

  const handleAddToCart = async () => {
    if (isOutOfStock) return
    setIsAdding(true)
    if (onAddToCart) {
      await onAddToCart(id)
    }
    setTimeout(() => setIsAdding(false), 500)
  }

  return (
    <motion.div
      variants={staggerItem}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className="overflow-hidden group h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop"}
            alt={name}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.15 }}
            className="w-full h-full object-cover"
          />
          
          {/* Quick add button overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              {isAdding ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ShoppingCart className="w-4 h-4" />
              )}
              Add to Cart
            </motion.button>
          </motion.div>

          {/* Category badge */}
          {category && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2"
            >
              {category}
            </Badge>
          )}

          {/* Wishlist button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8 bg-background/80 backdrop-blur-sm hover:bg-background"
          >
            <Heart className="w-4 h-4" />
          </Button>

          {/* Stock badge */}
          {isOutOfStock ? (
            <Badge variant="destructive" className="absolute bottom-2 left-2">
              Out of Stock
            </Badge>
          ) : stock <= 10 ? (
            <Badge variant="outline" className="absolute bottom-2 left-2 bg-yellow-500/10 border-yellow-500/50 text-yellow-500">
              Only {stock} left
            </Badge>
          ) : null}
        </div>

        <CardContent className="flex-1 p-4">
          <Link to={`/products/${id}`}>
            <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </Link>
          {shopName && (
            <p className="text-sm text-muted-foreground mt-1">{shopName}</p>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">₹{price}</span>
            {!isOutOfStock && stock <= 50 && (
              <p className="text-xs text-muted-foreground">{stock} in stock</p>
            )}
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAdding}
            className={isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            {isOutOfStock ? "Sold Out" : "Add"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}