
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { cartApi } from "@/lib/api"

interface CartItem {
  productId: string
  quantity: number
  price: number
  name?: string
}

interface Cart {
  shopId: string
  items: CartItem[]
  total: number
}

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const [cart, setCart] = useState<Cart[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      fetchCart()
    }
  }, [open])

  const fetchCart = async () => {
    try {
      setLoading(true)
      const res = await cartApi.get()
      setCart(res.data.data || [])
    } catch (error) {
      console.error("Error fetching cart:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (productId: string, newQty: number) => {
    if (newQty < 1) {
      await removeItem(productId)
      return
    }
    setUpdating(productId)
    try {
      await cartApi.update(productId, newQty)
      await fetchCart()
    } catch (error) {
      console.error("Error updating:", error)
    } finally {
      setUpdating(null)
    }
  }

  const removeItem = async (productId: string) => {
    setUpdating(productId)
    try {
      await cartApi.remove(productId)
      await fetchCart()
    } catch (error) {
      console.error("Error removing:", error)
    } finally {
      setUpdating(null)
    }
  }

  const totalItems = cart.reduce((sum, c) => sum + c.items.length, 0)
  const totalAmount = cart.reduce((sum, c) => sum + c.total, 0)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Shopping Cart ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4">
            <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Link to="/shops">
              <Button onClick={() => onOpenChange(false)}>Browse Shops</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 py-4">
              {cart.map((shopCart, shopIndex) => (
                <div key={shopCart.shopId}>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Shop {shopIndex + 1}
                  </p>
                  {shopCart.items.map((item) => (
                    <motion.div
                      key={item.productId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3 py-3 border-b"
                    >
                      <div className="w-16 h-16 rounded-lg bg-secondary overflow-hidden shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1586201375761-83865001e31c?w=200&h=200&fit=crop"
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">
                          {item.name || `Product ${item.productId}`}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          ₹{item.price} each
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={updating === item.productId}
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center text-sm">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              disabled={updating === item.productId}
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="font-medium text-sm">
                            ₹{item.price * item.quantity}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        disabled={updating === item.productId}
                        onClick={() => removeItem(item.productId)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              ))}
            </div>

            <SheetFooter className="flex-col gap-4">
              <div className="w-full space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>₹20</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{totalAmount + 20}</span>
                </div>
              </div>
              <Link to="/checkout">
                <Button className="w-full" size="lg" onClick={() => onOpenChange(false)}>
                  Checkout
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}