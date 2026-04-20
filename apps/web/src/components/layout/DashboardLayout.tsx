import { type ReactNode } from 'react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { motion, AnimatePresence } from 'framer-motion'
import { pageVariants } from '@/lib/motion/page-transitions'

const detailsPanelVariants = {
  hidden: { opacity: 0, x: 32, scale: 0.98 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 30, duration: 0.3 },
  },
  exit: {
    opacity: 0,
    x: 32,
    scale: 0.98,
    transition: { duration: 0.15, ease: 'easeIn' },
  },
}

interface DashboardLayoutProps {
  children: ReactNode
  role: 'admin' | 'shop_owner' | 'delivery_boy'
  detailsPanel?: ReactNode
  onDetailsClose?: () => void
}

export function DashboardLayout({ children, role, detailsPanel, onDetailsClose }: DashboardLayoutProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isTablet = useMediaQuery('(min-width: 768px)')
  const showDetailsDesktop = !!detailsPanel && isDesktop
  const showDetailsSheet = !!detailsPanel && !isDesktop

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar - 240px on desktop, icon-only on tablet, hidden on mobile */}
      <div className={`shrink-0 transition-all duration-300 ${
        isDesktop ? 'w-[240px]' : isTablet ? 'w-[64px]' : 'w-0'
      } overflow-hidden`}>
        <DashboardSidebar role={role} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <DashboardHeader role={role} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <motion.div
            variants={pageVariants}
            initial="initial"
            animate="animate"
            className={showDetailsDesktop ? 'flex gap-6' : ''}
          >
            <div className={showDetailsDesktop ? 'flex-1 min-w-0' : ''}>
              {children}
            </div>

            {/* Details Panel - 320px sticky right on desktop */}
            {showDetailsDesktop && (
              <motion.aside
                variants={detailsPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-[320px] shrink-0 sticky top-0 h-[calc(100vh-3.5rem)] overflow-y-auto border-l border-border bg-card"
              >
                {detailsPanel}
              </motion.aside>
            )}
          </motion.div>
        </main>
      </div>

      {/* Details Panel - Sheet on mobile/tablet */}
      <AnimatePresence>
        {showDetailsSheet && (
          <Sheet open={!!detailsPanel} onOpenChange={() => onDetailsClose?.()}>
            <SheetContent side="right" className="w-[320px] sm:w-[320px] p-0">
              {detailsPanel}
            </SheetContent>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
