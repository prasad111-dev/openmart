export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
}

export const pageTransition = {
  type: "tween" as const,
  ease: [0.22, 1, 0.36, 1] as const,
  duration: 0.4,
}
