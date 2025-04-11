
/**
 * Get the current location (latitude and longitude) of the user
 * @returns A promise that resolves to a GeolocationPosition
 */
export const getCurrentLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
    } else {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    }
  });
};

/**
 * Calculate the distance between two points on the Earth's surface using the Haversine formula
 * @param lat1 Latitude of the first point
 * @param lon1 Longitude of the first point
 * @param lat2 Latitude of the second point
 * @param lon2 Longitude of the second point
 * @returns Distance in miles
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  // Radius of the Earth in miles
  const R = 3958.8;
  
  // Convert latitude and longitude from degrees to radians
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  
  // Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
};

/**
 * Convert degrees to radians
 * @param deg Angle in degrees
 * @returns Angle in radians
 */
const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

/**
 * Format a distance in a user-friendly way
 * @param distance Distance in miles
 * @returns Formatted distance string
 */
export const formatDistance = (distance: number): string => {
  if (distance < 0.1) {
    return 'Less than 0.1 miles';
  } else if (distance < 1) {
    return `${(distance * 10).toFixed(0) / 10} miles`;
  } else {
    return `${Math.round(distance)} miles`;
  }
};

/**
 * Get a location description from coordinates using reverse geocoding
 * This is a mock implementation that would normally use a geocoding service
 * @param lat Latitude
 * @param lng Longitude
 * @returns A promise that resolves to a location description
 */
export const getLocationDescription = async (
  lat: number,
  lng: number
): Promise<string> => {
  // This would normally use a geocoding service like Google Maps or OpenStreetMap
  // For mock purposes, we'll just return the coordinates
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
};
