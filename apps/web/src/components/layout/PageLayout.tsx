import { type ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className={className || ''}>
        {children}
      </main>
    </div>
  )
}
