
import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  variant?: 'default' | 'destructive';
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

// Create a global store for toasts
let toasts: Toast[] = [];
let listeners: Function[] = [];

const notifyListeners = () => {
  listeners.forEach(listener => listener(toasts));
};

// Create a method to create a toast ID
const createToastId = () => Math.random().toString(36).substring(2, 9);

// Create a singleton toast function
export const toast = {
  success: (title: string, description?: string) => {
    const id = createToastId();
    const newToast: Toast = { id, title, description, type: 'success', variant: 'default' };
    toasts = [...toasts, newToast];
    notifyListeners();
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  error: (title: string, description?: string) => {
    const id = createToastId();
    const newToast: Toast = { id, title, description, type: 'error', variant: 'destructive' };
    toasts = [...toasts, newToast];
    notifyListeners();
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  info: (title: string, description?: string) => {
    const id = createToastId();
    const newToast: Toast = { id, title, description, type: 'info', variant: 'default' };
    toasts = [...toasts, newToast];
    notifyListeners();
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  },
  dismiss: (id: string) => {
    toasts = toasts.filter(toast => toast.id !== id);
    notifyListeners();
  },
  // Add a method that accepts ToastOptions
  // This is the format being used in many components
  // Instead of toast.success(), they're using toast({ title, description, variant })
  // so we need to make this work
  (options: ToastOptions): string => {
    const id = createToastId();
    const variant = options.variant || 'default';
    const type = variant === 'destructive' ? 'error' : 'info';
    
    const newToast: Toast = { 
      id, 
      title: options.title, 
      description: options.description, 
      type, 
      variant 
    };
    
    toasts = [...toasts, newToast];
    notifyListeners();
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
      toast.dismiss(id);
    }, 5000);
    
    return id;
  }
};

// Create a hook to access the toasts
export function useToast() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>(toasts);
  
  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setCurrentToasts([...newToasts]);
    };
    
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);
  
  return {
    toasts: currentToasts,
    toast
  };
}
