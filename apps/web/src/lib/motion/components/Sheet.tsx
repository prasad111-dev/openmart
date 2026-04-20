import { motion, AnimatePresence } from 'framer-motion'

interface SheetProps {
  isOpen: boolean
  onClose: () => void
  side?: 'left' | 'right' | 'bottom' | 'top'
  children: React.ReactNode
}

const sheetVariants = {
  hidden: (side: string) => ({
    x: side === 'left' ? '-100%' : side === 'right' ? '100%' : 0,
    y: side === 'top' ? '-100%' : side === 'bottom' ? '100%' : 0,
  }),
  visible: { x: 0, y: 0, transition: { type: 'spring', damping: 30, stiffness: 300 } },
  exit: (side: string) => ({
    x: side === 'left' ? '-100%' : side === 'right' ? '100%' : 0,
    y: side === 'top' ? '-100%' : side === 'bottom' ? '100%' : 0,
    transition: { duration: 0.2, ease: 'easeIn' },
  }),
}

export function Sheet({ isOpen, onClose, side = 'right', children }: SheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={`absolute ${side === 'right' ? 'right-0 top-0 h-full' : side === 'left' ? 'left-0 top-0 h-full' : side === 'bottom' ? 'bottom-0 left-0 w-full' : 'top-0 left-0 w-full'}`}
            custom={side}
            variants={sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
