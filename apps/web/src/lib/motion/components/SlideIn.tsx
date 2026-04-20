import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/motion/page-transitions'

interface SlideInProps {
  children: React.ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  className?: string
}

export function SlideIn({ children, direction = 'up', delay = 0, className }: SlideInProps) {
  const directions = {
    left: { x: -20, y: 0 },
    right: { x: 20, y: 0 },
    up: { x: 0, y: 20 },
    down: { x: 0, y: -20 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ ...pageTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
