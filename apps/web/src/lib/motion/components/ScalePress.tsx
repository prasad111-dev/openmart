import { motion } from 'framer-motion'

interface ScalePressProps {
  children: React.ReactNode
  className?: string
  scale?: number
  onClick?: () => void
}

export function ScalePress({ children, className, scale = 0.97, onClick }: ScalePressProps) {
  return (
    <motion.div
      className={className}
      whileTap={{ scale }}
      transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  )
}
