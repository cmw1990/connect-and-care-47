import { useState, useEffect } from 'react';

interface NotificationState {
  hasPermission: boolean;
  isSupported: boolean;
  error: string | null;
}

export const useNotifications = () => {
  const [state, setState] = useState<NotificationState>({
    hasPermission: false,
    isSupported: false,
    error: null
  });

  useEffect(() => {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      setState(prev => ({
        ...prev,
        error: 'Notifications are not supported'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSupported: true
    }));

    // Check existing permission
    if (Notification.permission === 'granted') {
      setState(prev => ({
        ...prev,
        hasPermission: true
      }));
    }
  }, []);

  const requestPermission = async () => {
    if (!state.isSupported) {
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({
        ...prev,
        hasPermission: permission === 'granted',
        error: permission === 'denied' ? 'Permission denied' : null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Error requesting permission'
      }));
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!state.hasPermission) {
      return;
    }

    try {
      const notification = new Notification(title, options);
      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  return {
    ...state,
    requestPermission,
    sendNotification
  };
};
