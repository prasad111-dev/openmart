import { useAuthStore } from '@/stores/auth.store'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Store, Users, ShoppingCart, BarChart3, Settings,
  Star, Truck, LogOut, User, Package, Tag, DollarSign,
} from 'lucide-react'

const navItems: Record<string, { icon: any; label: string; href: string }[]> = {
  admin: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Store, label: 'Shops', href: '/admin/shops' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: ShoppingCart, label: 'Orders', href: '/admin/orders' },
    { icon: BarChart3, label: 'Analytics', href: '/admin/analytics' },
    { icon: Tag, label: 'Categories', href: '/admin/categories' },
    { icon: Star, label: 'Reviews', href: '/admin/reviews' },
    { icon: DollarSign, label: 'Settlements', href: '/admin/seller-settlements' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
    { icon: Settings, label: 'Platform', href: '/admin/platform-settings' },
  ],
  shop_owner: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/shop/dashboard' },
    { icon: Package, label: 'Products', href: '/shop/products' },
    { icon: ShoppingCart, label: 'Orders', href: '/shop/orders' },
    { icon: BarChart3, label: 'Analytics', href: '/shop/analytics' },
    { icon: Settings, label: 'Settings', href: '/shop/settings' },
  ],
  delivery_boy: [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/delivery/dashboard' },
    { icon: Truck, label: 'Assignments', href: '/delivery/assignments' },
    { icon: BarChart3, label: 'History', href: '/delivery/history' },
    { icon: DollarSign, label: 'Earnings', href: '/delivery/earnings' },
  ],
}

interface DashboardSidebarProps {
  role: 'admin' | 'shop_owner' | 'delivery_boy'
  isOpen?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ role, isOpen = true, onClose }: DashboardSidebarProps) {
  const location = useLocation()
  const { logout } = useAuthStore()
  const items = navItems[role] || []

  if (!isOpen) return null

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link to="/" className="flex items-center gap-2" onClick={onClose}>
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">O</span>
            </div>
            <span className="text-lg font-semibold text-foreground">OpenMart</span>
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  }`}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
        <div className="border-t border-border p-3">
          <Link
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <User className="size-4" />
            <span>Profile</span>
          </Link>
          <button
            onClick={() => { logout(); onClose?.() }}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <LogOut className="size-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
