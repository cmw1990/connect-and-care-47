import { useState, useEffect } from 'react';

interface GeolocationState {
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
    city?: string;
    country?: string;
  } | null;
  error: GeolocationPositionError | null;
}

export const useGeolocation = (options: PositionOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported',
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3
        }
      }));
      return;
    }

    const onSuccess = async (position: GeolocationPosition) => {
      // Reverse geocoding using Nominatim
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
        );
        const data = await response.json();

        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            city: data.address.city || data.address.town || data.address.village,
            country: data.address.country
          },
          error: null
        });
      } catch (error) {
        // Fall back to coordinates only if reverse geocoding fails
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          },
          error: null
        });
      }
    };

    const onError = (error: GeolocationPositionError) => {
      setState(prev => ({
        ...prev,
        error
      }));
    };

    const watchId = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      options
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options]);

  return state;
};
