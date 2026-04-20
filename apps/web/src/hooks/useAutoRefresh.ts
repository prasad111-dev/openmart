import { useEffect, useRef, useCallback } from 'react'

interface UseAutoRefreshOptions {
  interval?: number
  enabled?: boolean
  onRefresh: () => void | Promise<void>
}

export function useAutoRefresh({
  interval = 30000,
  enabled = true,
  onRefresh,
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const refresh = useCallback(async () => {
    try {
      await onRefresh()
    } catch (error) {
      console.error('Auto-refresh error:', error)
    }
  }, [onRefresh])

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    refresh()
    intervalRef.current = setInterval(refresh, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [enabled, interval, refresh])
}

export function usePolling(interval: number = 30000) {
  return useAutoRefresh({ interval, enabled: true, onRefresh: () => {} })
}

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): T {
  const lastRan = useRef(Date.now())

  return ((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastRan.current >= limit) {
      callback(...args)
      lastRan.current = now
    }
  }) as T
}
