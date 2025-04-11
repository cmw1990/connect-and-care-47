
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

// Helper function to auto-dismiss toasts
const autoDismiss = (id: string) => {
  setTimeout(() => {
    toast.dismiss(id);
  }, 5000);
};

// Create type for toast function with callable functionality
interface ToastFunction {
  (options: ToastOptions): string;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  dismiss: (id: string) => void;
}

// Create the toast function
const toastFn = (options: ToastOptions): string => {
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
  
  autoDismiss(id);
  
  return id;
};

// Add methods to the toast function
toastFn.success = (title: string, description?: string): string => {
  const id = createToastId();
  const newToast: Toast = { id, title, description, type: 'success', variant: 'default' };
  toasts = [...toasts, newToast];
  notifyListeners();
  
  autoDismiss(id);
  
  return id;
};

toastFn.error = (title: string, description?: string): string => {
  const id = createToastId();
  const newToast: Toast = { id, title, description, type: 'error', variant: 'destructive' };
  toasts = [...toasts, newToast];
  notifyListeners();
  
  autoDismiss(id);
  
  return id;
};

toastFn.info = (title: string, description?: string): string => {
  const id = createToastId();
  const newToast: Toast = { id, title, description, type: 'info', variant: 'default' };
  toasts = [...toasts, newToast];
  notifyListeners();
  
  autoDismiss(id);
  
  return id;
};

toastFn.dismiss = (id: string): void => {
  toasts = toasts.filter(toast => toast.id !== id);
  notifyListeners();
};

// Export the toast function with the correct type
export const toast = toastFn as ToastFunction;

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
