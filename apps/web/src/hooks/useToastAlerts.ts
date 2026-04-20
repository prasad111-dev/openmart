import { useToast } from '@/components/Toast'

export function useToastSuccess() {
  const { toast } = useToast()
  return (message: string) => toast(message, 'success')
}

export function useToastError() {
  const { toast } = useToast()
  return (message: string) => toast(message, 'error')
}

export function useToastInfo() {
  const { toast } = useToast()
  return (message: string) => toast(message, 'info')
}

export function useToastWarning() {
  const { toast } = useToast()
  return (message: string) => toast(message, 'warning')
}
