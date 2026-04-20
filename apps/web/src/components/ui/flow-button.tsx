import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface FlowButtonProps {
  children: React.ReactNode
  className?: string
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  href?: string
}

const sizeStyles: Record<string, React.CSSProperties> = {
  sm: {
    height: '40px',
    padding: '0 20px',
    fontSize: '14px',
    fontWeight: 500,
  },
  md: {
    height: '48px',
    padding: '0 28px',
    fontSize: '15px',
    fontWeight: 600,
  },
  lg: {
    height: '56px',
    padding: '0 36px',
    fontSize: '16px',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
}

const variantStyles: Record<string, {
  base: React.CSSProperties
  glow: React.CSSProperties
  gradient: React.CSSProperties
  sweep: React.CSSProperties
}> = {
  primary: {
    base: {
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2)',
    },
    glow: {
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, transparent 70%)',
    },
    gradient: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
    },
    sweep: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
    },
  },
  secondary: {
    base: {
      background: 'rgba(51, 65, 85, 0.6)',
      color: '#e2e8f0',
      border: '1px solid rgba(100, 116, 139, 0.3)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), 0 1px 3px rgba(0, 0, 0, 0.15)',
    },
    glow: {
      background: 'radial-gradient(circle, rgba(100, 116, 139, 0.3) 0%, transparent 70%)',
    },
    gradient: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
    },
    sweep: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.08) 50%, transparent 100%)',
    },
  },
  outline: {
    base: {
      background: 'transparent',
      color: '#10b981',
      border: '2px solid rgba(16, 185, 129, 0.5)',
      boxShadow: '0 0 0 0 rgba(16, 185, 129, 0)',
    },
    glow: {
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)',
    },
    gradient: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.3) 50%, transparent 100%)',
    },
    sweep: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.15) 50%, transparent 100%)',
    },
  },
  ghost: {
    base: {
      background: 'transparent',
      color: '#10b981',
      border: 'none',
      boxShadow: 'none',
    },
    glow: {
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
    },
    gradient: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.2) 50%, transparent 100%)',
    },
    sweep: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(16, 185, 129, 0.1) 50%, transparent 100%)',
    },
  },
  glass: {
    base: {
      background: 'rgba(255, 255, 255, 0.05)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      color: '#ffffff',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
    },
    glow: {
      background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
    },
    gradient: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.15) 50%, transparent 100%)',
    },
    sweep: {
      background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
    },
  },
}

function FlowButton({ children, className, variant = 'primary', size = 'lg', onClick, href }: FlowButtonProps) {
  const [isHovered, setIsHovered] = React.useState(false)
  const [isPressed, setIsPressed] = React.useState(false)
  const [sweepX, setSweepX] = React.useState('-100%')

  const styles = variantStyles[variant]
  const sizeStyle = sizeStyles[size]

  const buttonContent = (
    <motion.div
      className={cn('relative inline-block', className)}
      style={{
        ...sizeStyle,
        borderRadius: '12px',
        cursor: 'pointer',
        position: 'relative',
      }}
      animate={{
        scale: isPressed ? 0.97 : isHovered ? 1.02 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 30,
      }}
      onMouseEnter={() => {
        setIsHovered(true)
        setSweepX('200%')
      }}
      onMouseLeave={() => {
        setIsHovered(false)
        setIsPressed(false)
        setSweepX('-100%')
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onClick={onClick}
    >
      {/* Glow effect behind button */}
      <div
        style={{
          position: 'absolute',
          inset: '-4px',
          borderRadius: '16px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          ...styles.glow,
          filter: 'blur(8px)',
          zIndex: 0,
        }}
      />

      {/* Border gradient effect */}
      <div
        style={{
          position: 'absolute',
          inset: '-2px',
          borderRadius: '14px',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.5s ease',
          ...styles.gradient,
          zIndex: 0,
        }}
      />

      {/* Main button */}
      <button
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          height: '100%',
          ...sizeStyle,
          ...styles.base,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          overflow: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
          boxShadow: isHovered
            ? variant === 'primary'
              ? '0 8px 25px rgba(16, 185, 129, 0.4), 0 2px 6px rgba(0, 0, 0, 0.3)'
              : variant === 'outline'
              ? '0 0 20px rgba(16, 185, 129, 0.2), 0 4px 15px rgba(0, 0, 0, 0.2)'
              : styles.base.boxShadow
            : styles.base.boxShadow,
          border: variant === 'outline' && isHovered
            ? '2px solid rgba(16, 185, 129, 0.8)'
            : styles.base.border,
          background: variant === 'primary' && isHovered
            ? 'linear-gradient(135deg, #059669 0%, #047857 100%)'
            : styles.base.background,
        }}
      >
        {/* Shine sweep effect */}
        <motion.div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            ...styles.sweep,
            zIndex: 0,
          }}
          animate={{ x: sweepX }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Button text/content */}
        <span style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {children}
        </span>
      </button>
    </motion.div>
  )

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none' }}>
        {buttonContent}
      </a>
    )
  }

  return buttonContent
}

// Preset variants for common use cases
function PrimaryFlowButton({ children, className, size = 'lg', ...props }: Omit<FlowButtonProps, 'variant'>) {
  return (
    <FlowButton variant="primary" size={size} className={className} {...props}>
      {children}
    </FlowButton>
  )
}

function SecondaryFlowButton({ children, className, size = 'lg', ...props }: Omit<FlowButtonProps, 'variant'>) {
  return (
    <FlowButton variant="secondary" size={size} className={className} {...props}>
      {children}
    </FlowButton>
  )
}

function OutlineFlowButton({ children, className, size = 'lg', ...props }: Omit<FlowButtonProps, 'variant'>) {
  return (
    <FlowButton variant="outline" size={size} className={className} {...props}>
      {children}
    </FlowButton>
  )
}

function GhostFlowButton({ children, className, size = 'lg', ...props }: Omit<FlowButtonProps, 'variant'>) {
  return (
    <FlowButton variant="ghost" size={size} className={className} {...props}>
      {children}
    </FlowButton>
  )
}

function GlassFlowButton({ children, className, size = 'lg', ...props }: Omit<FlowButtonProps, 'variant'>) {
  return (
    <FlowButton variant="glass" size={size} className={className} {...props}>
      {children}
    </FlowButton>
  )
}

export { PrimaryFlowButton, SecondaryFlowButton, OutlineFlowButton, GhostFlowButton, GlassFlowButton, FlowButton, type FlowButtonProps }
