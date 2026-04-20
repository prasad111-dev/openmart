import { Menu } from 'lucide-react'

interface DashboardHeaderProps {
  role: 'admin' | 'shop_owner' | 'delivery_boy'
  onMenuToggle?: () => void
}

const roleLabels = {
  admin: 'Admin Panel',
  shop_owner: 'Shop Dashboard',
  delivery_boy: 'Delivery Dashboard',
}

export function DashboardHeader({ role, onMenuToggle }: DashboardHeaderProps) {
  return (
    <header className="flex h-14 items-center gap-4 border-b border-border bg-card px-4">
      <button
        onClick={onMenuToggle}
        className="rounded-md p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
      >
        <Menu className="size-5" />
      </button>
      <h1 className="text-lg font-semibold text-foreground">{roleLabels[role]}</h1>
    </header>
  )
}
