import { motion, AnimatePresence } from 'framer-motion'

interface TabContentProps {
  isActive: boolean
  children: React.ReactNode
  className?: string
}

export function TabContent({ isActive, children, className }: TabContentProps) {
  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          className={className}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
