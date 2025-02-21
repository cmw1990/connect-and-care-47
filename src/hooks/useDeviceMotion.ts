import { useState, useEffect } from 'react';

interface DeviceMotionState {
  motion: {
    acceleration: {
      x: number | null;
      y: number | null;
      z: number | null;
    };
    rotationRate: {
      alpha: number | null;
      beta: number | null;
      gamma: number | null;
    };
    interval: number | null;
  } | null;
  isSupported: boolean;
  error: string | null;
}

export const useDeviceMotion = () => {
  const [state, setState] = useState<DeviceMotionState>({
    motion: null,
    isSupported: false,
    error: null
  });

  useEffect(() => {
    // Check if DeviceMotionEvent is supported
    if (!window.DeviceMotionEvent) {
      setState(prev => ({
        ...prev,
        error: 'Device motion is not supported'
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isSupported: true
    }));

    const handleMotion = (event: DeviceMotionEvent) => {
      setState(prev => ({
        ...prev,
        motion: {
          acceleration: {
            x: event.acceleration?.x || null,
            y: event.acceleration?.y || null,
            z: event.acceleration?.z || null
          },
          rotationRate: {
            alpha: event.rotationRate?.alpha || null,
            beta: event.rotationRate?.beta || null,
            gamma: event.rotationRate?.gamma || null
          },
          interval: event.interval
        }
      }));
    };

    // Request permission if needed (iOS 13+)
    const requestPermission = async () => {
      if (typeof DeviceMotionEvent.requestPermission === 'function') {
        try {
          const permission = await DeviceMotionEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('devicemotion', handleMotion);
          } else {
            setState(prev => ({
              ...prev,
              error: 'Permission denied'
            }));
          }
        } catch (error) {
          setState(prev => ({
            ...prev,
            error: 'Error requesting permission'
          }));
        }
      } else {
        // No permission needed
        window.addEventListener('devicemotion', handleMotion);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
    };
  }, []);

  return state;
};
