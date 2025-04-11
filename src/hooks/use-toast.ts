
import { useState } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      dismissToast(id);
    }, 5000);
    
    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return {
    toasts,
    toast: {
      success: (title: string, description?: string) => 
        addToast({ title, description, type: 'success' }),
      error: (title: string, description?: string) => 
        addToast({ title, description, type: 'error' }),
      info: (title: string, description?: string) => 
        addToast({ title, description, type: 'info' }),
      dismiss: dismissToast
    }
  };
}

// Create a singleton instance of the toast for direct imports
const { toasts, toast } = useToast();
export { toast };

