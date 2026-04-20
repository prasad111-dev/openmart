import { useState, createContext, useContext, ReactNode, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const getStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-500/90', border: 'border-green-400', icon: '✓' }
      case 'error':
        return { bg: 'bg-red-500/90', border: 'border-red-400', icon: '✕' }
      case 'warning':
        return { bg: 'bg-yellow-500/90', border: 'border-yellow-400', icon: '!' }
      default:
        return { bg: 'bg-blue-500/90', border: 'border-blue-400', icon: 'i' }
    }
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => {
            const styles = getStyles(t.type)
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className={`${styles.bg} backdrop-blur-lg text-white px-4 py-3 rounded-lg shadow-lg border ${styles.border} flex items-center gap-3`}
              >
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0">
                  {styles.icon}
                </span>
                <p className="text-sm font-medium flex-1">{t.message}</p>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-white/70 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
