import { useState, useEffect, useCallback } from 'react'

interface UseScrollAnimationOptions {
  threshold?: number
  rootMargin?: string
  once?: boolean
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const { threshold = 0.1, rootMargin = '0px', once = true } = options
  const [isVisible, setIsVisible] = useState(false)
  const [ref, setRef] = useState<HTMLElement | null>(null)

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries
      if (entry.isIntersecting) {
        setIsVisible(true)
        if (once && ref) {
          observer.disconnect()
        }
      } else if (!once) {
        setIsVisible(false)
      }
    },
    [once, ref]
  )

  const observer = new IntersectionObserver(handleObserver, {
    threshold,
    rootMargin,
  })

  useEffect(() => {
    if (ref) {
      observer.observe(ref)
    }
    return () => {
      if (ref) {
        observer.unobserve(ref)
      }
    }
  }, [ref])

  return { ref: setRef, isVisible }
}
