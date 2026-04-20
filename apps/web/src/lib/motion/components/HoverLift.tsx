import { motion } from 'framer-motion'

interface HoverLiftProps {
  children: React.ReactNode
  className?: string
  yOffset?: number
}

export function HoverLift({ children, className, yOffset = -4 }: HoverLiftProps) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: yOffset, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
    >
      {children}
    </motion.div>
  )
}
