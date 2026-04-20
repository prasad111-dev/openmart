import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/motion/page-transitions'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...pageTransition, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
