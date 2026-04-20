import { type Variants } from "framer-motion"

const EASE_ENTER = [0.22, 1, 0.36, 1] as const
const EASE_MOVE = [0.25, 1, 0.5, 1] as const

export const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  fadeInUp: {
    hidden: { opacity: 0, y: 6 },
    visible: { opacity: 1, y: 0 },
  },
  fadeInDown: {
    hidden: { opacity: 0, y: -6 },
    visible: { opacity: 1, y: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
  slideInLeft: {
    hidden: { opacity: 0, x: -6 },
    visible: { opacity: 1, x: 0 },
  },
  slideInRight: {
    hidden: { opacity: 0, x: 6 },
    visible: { opacity: 1, x: 0 },
  },
} as const

export const transitions = {
  micro: { duration: 0.1, ease: EASE_ENTER },
  fast: { duration: 0.15, ease: EASE_ENTER },
  normal: { duration: 0.2, ease: EASE_ENTER },
  smooth: { duration: 0.25, ease: EASE_ENTER },
  button: { duration: 0.15, ease: EASE_ENTER },
  tooltip: { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
  dropdown: { duration: 0.2, ease: EASE_ENTER },
  modal: { duration: 0.25, ease: EASE_ENTER },
  slide: { duration: 0.25, ease: EASE_MOVE },
  spring: { type: "spring" as const, stiffness: 500, damping: 20 },
  springBouncy: { type: "spring" as const, stiffness: 600, damping: 15 },
} as const

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0,
    },
  },
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 4 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.15, ease: EASE_ENTER }
  },
}

export const hoverScale: Variants = {
  hover: { scale: 1.03, transition: { duration: 0.15, ease: EASE_ENTER } },
}

export const tapScale: Variants = {
  tap: { scale: 0.97, transition: { duration: 0.1 } },
}

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
}

export const modalTransition: Variants = {
  initial: { opacity: 0, scale: 0.9, originX: 0.5, originY: 0.5, originZ: 0 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
}

export const sheetTransition: Variants = {
  initial: { x: "100%", opacity: 1 },
  animate: { x: "0%", opacity: 1 },
  exit: { x: "100%", opacity: 1 },
}

export const dialogBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

export const buttonPress: Variants = {
  tap: { scale: 0.97, transition: { duration: 0.1, ease: EASE_ENTER } },
  hover: { scale: 1.02, transition: { duration: 0.15, ease: EASE_ENTER } },
}

export const staggerDelay = (index: number) => ({
  delay: index * 0.03,
})

export function useReducedMotion() {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}