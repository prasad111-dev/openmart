import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { 
  Store, ShoppingCart, User, LogOut, Menu, X, 
  Truck, Search, Bell, ClipboardList
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '@/store'
import { useUIStore } from '@/stores/ui.store'
import { motion, AnimatePresence } from 'framer-motion'
import { cartApi } from '@/lib/api'
import { useAutoRefresh } from '@/hooks/useAutoRefresh'
import CategoryBar from '@/components/CategoryBar'

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuthStore()
  const { activeCategory, setActiveCategory } = useUIStore()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const profileRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const fetchCartCount = async () => {
    try {
      const res = await cartApi.get()
      const carts = res.data.data || []
      const count = carts.reduce((sum: number, c: any) => sum + c.items.reduce((s: number, i: any) => s + i.quantity, 0), 0)
      setCartCount(count)
    } catch { /* ignore */ }
  }

  useAutoRefresh({
    interval: 5000,
    enabled: isAuthenticated && user?.role === 'CUSTOMER',
    onRefresh: fetchCartCount,
  })

  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      fetchCartCount()
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    setMobileOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}${activeCategory !== 'All' ? `&category=${encodeURIComponent(activeCategory)}` : ''}`)
    }
  }

  const role = user?.role

  const dashboardPath = isAuthenticated
    ? role === 'SHOP_OWNER' ? '/shop/dashboard'
    : role === 'DELIVERY_BOY' ? '/delivery/dashboard'
    : role === 'ADMIN' ? '/admin'
    : '/shops'
    : '/'

  // Don't show navbar on landing page or dashboard pages
  const isDashboardPath = location.pathname.startsWith('/admin') || 
                          location.pathname.startsWith('/shop/') || 
                          location.pathname.startsWith('/delivery/')
  if (location.pathname === '/' || isDashboardPath) return null

  return (
    <>
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border hidden md:block" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main bar */}
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Left: Logo */}
            <Link 
              to={dashboardPath} 
              className="flex items-center gap-2 shrink-0"
              aria-label="OpenMart home"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center">
                {role === 'DELIVERY_BOY' ? <Truck className="w-5 h-5 text-primary" /> : <Store className="w-5 h-5 text-primary" />}
              </div>
              <span className="text-lg font-bold hidden sm:inline">OpenMart</span>
              {role && role !== 'CUSTOMER' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                  {role === 'SHOP_OWNER' ? 'Shop' : role === 'DELIVERY_BOY' ? 'Delivery' : 'Admin'}
                </span>
              )}
            </Link>

            {/* Center: Search */}
            <div className="flex items-center gap-3 flex-1 max-w-xl">
              {/* Search Bar */}
              <form role="search" aria-label="Search shops and products" onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchRef}
                    type="search"
                    placeholder="Search shops or products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-10 bg-secondary/50 border-border/50 focus:border-primary transition-colors"
                    aria-label="Search shops and products"
                  />
                </div>
              </form>
            </div>

            {/* Right: Icons + Profile */}
            <div className="flex items-center gap-1 shrink-0">
              {isAuthenticated && role === 'CUSTOMER' && (
                <>
                  {/* Notifications */}
                  <Link to="/notifications">
                    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                      <Bell className="w-5 h-5" />
                    </Button>
                  </Link>

                  {/* Cart */}
                  <Link to="/cart">
                    <Button variant="ghost" size="icon" className="relative" aria-label={`Shopping cart, ${cartCount} items`}>
                      <ShoppingCart className="w-5 h-5" />
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
                          {cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                </>
              )}

              {/* Profile Dropdown */}
              {isAuthenticated ? (
                <div ref={profileRef} className="relative">
                  <Button 
                    variant="ghost" 
                    className="gap-2"
                    onClick={() => setProfileOpen(!profileOpen)}
                    aria-haspopup="menu"
                    aria-expanded={profileOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="max-w-[100px] truncate hidden sm:inline">{user?.name}</span>
                  </Button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-background shadow-lg overflow-hidden z-50"
                      >
                        <Link to="/profile" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors">
                          <User className="w-4 h-4" />
                          Profile
                        </Link>
                        {role === 'CUSTOMER' && (
                          <Link to="/orders" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors">
                            <ClipboardList className="w-4 h-4" />
                            My Orders
                          </Link>
                        )}
                        {role === 'CUSTOMER' && (
                          <Link to="/addresses" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors">
                            <Store className="w-4 h-4" />
                            Addresses
                          </Link>
                        )}
                        <Link to="/settings" role="menuitem" className="flex items-center gap-2 px-4 py-3 text-sm hover:bg-secondary/50 transition-colors">
                          <Store className="w-4 h-4" />
                          Settings
                        </Link>
                        <div className="border-t border-border" />
                        <button 
                          role="menuitem"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-3 text-sm hover:bg-destructive/10 text-destructive transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Sign In</Button>
                  </Link>
                  <Link to="/register">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>


        </div>
      </header>

      {/* Category Bar (Customer only) */}
      {isAuthenticated && role === 'CUSTOMER' && (
        <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
      )}

      {/* Mobile Navbar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border md:hidden" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to={dashboardPath} className="flex items-center gap-2" aria-label="OpenMart home">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                {role === 'DELIVERY_BOY' ? <Truck className="w-4 h-4 text-primary" /> : <Store className="w-4 h-4 text-primary" />}
              </div>
              <span className="font-bold text-sm">OpenMart</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-1">
              {isAuthenticated && role === 'CUSTOMER' && (
                <Link to="/cart">
                  <Button variant="ghost" size="icon" className="relative" aria-label={`Cart, ${cartCount} items`}>
                    <ShoppingCart className="w-5 h-5" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu" aria-expanded={mobileOpen}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <form role="search" aria-label="Search shops and products" onSubmit={handleSearch} className="pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder="Search shops or products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 bg-secondary/50 border-border/50"
                aria-label="Search shops and products"
              />
            </div>
          </form>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-border/50"
            >
              <div className="px-4 py-3 flex flex-col gap-1">
                {isAuthenticated && (
                  <>
                    <Link to="/profile">
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Profile</span>
                      </div>
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-destructive/10 text-destructive"
                    >
                      <LogOut className="w-5 h-5" />
                      <span className="font-medium">Logout</span>
                    </button>
                  </>
                )}

                {!isAuthenticated && (
                  <>
                    <Link to="/login">
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-secondary/50">
                        <User className="w-5 h-5" />
                        <span className="font-medium">Sign In</span>
                      </div>
                    </Link>
                    <Link to="/register">
                      <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 text-primary">
                        <Store className="w-5 h-5" />
                        <span className="font-medium">Get Started</span>
                      </div>
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

    </>
  )
}
