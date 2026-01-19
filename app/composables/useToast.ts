
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title?: string
  description: string
  type: ToastType
  duration?: number
}

const toasts = ref<Toast[]>([])

export const useToast = () => {
  const add = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    const duration = toast.duration ?? 5000

    const newToast: Toast = {
      ...toast,
      id,
      duration
    }

    toasts.value.push(newToast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }
  }

  const remove = (id: string) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const success = (description: string, title?: string) => {
    add({ description, title, type: 'success' })
  }

  const error = (description: string, title?: string) => {
    add({ description, title, type: 'error' })
  }

  const info = (description: string, title?: string) => {
    add({ description, title, type: 'info' })
  }

  const warning = (description: string, title?: string) => {
    add({ description, title, type: 'warning' })
  }

  return {
    toasts,
    add,
    remove,
    success,
    error,
    info,
    warning
  }
}
