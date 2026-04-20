export const ANIMATION = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
    page: 0.4,
  },
  easing: {
    enter: [0.22, 1, 0.36, 1] as const,
    move: [0.25, 1, 0.5, 1] as const,
    drawer: [0.32, 0.72, 0, 1] as const,
    spring: { type: "spring" as const, stiffness: 400, damping: 30 },
    springGentle: { type: "spring" as const, stiffness: 300, damping: 35 },
    springBouncy: { type: "spring" as const, stiffness: 500, damping: 25, bounce: 0.2 },
  },
  stagger: {
    base: 0.05,
    max: 0.3,
  },
} as const
