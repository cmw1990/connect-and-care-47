
import { useState } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const toast = (props: ToastProps) => {
    const newToast = {
      ...props,
      id: Date.now().toString()
    };
    setToasts((prev) => [...prev, newToast]);
    
    // Auto-hide toast after duration
    if (props.duration !== Infinity) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, props.duration || 3000);
    }
  };

  const dismiss = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Convenience methods
  toast.success = (title: string, description?: string) => {
    toast({ title, description, variant: 'default' });
  };

  toast.error = (title: string, description?: string) => {
    toast({ title, description, variant: 'destructive' });
  };

  toast.info = (title: string, description?: string) => {
    toast({ title, description, variant: 'default' });
  };

  return { toast, toasts, dismiss };
};

// For components that need to use toast without hooks
export const toast = {
  success: (title: string, description?: string) => {
    console.log('Success Toast:', title, description);
  },
  error: (title: string, description?: string) => {
    console.log('Error Toast:', title, description);
  },
  info: (title: string, description?: string) => {
    console.log('Info Toast:', title, description);
  }
};
