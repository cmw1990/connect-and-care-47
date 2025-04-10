
import { useState } from 'react';

type ToastVariant = 'default' | 'success' | 'destructive';

interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Date.now().toString();
    const newToast = { id, ...options };
    setToasts((prevToasts) => [...prevToasts, newToast]);

    // Auto-dismiss toast after duration
    if (options.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, options.duration || 5000);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return { toast, toasts, dismissToast };
}
