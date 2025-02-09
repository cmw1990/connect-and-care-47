
import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: string;
  battery_level?: number;
  activity_type?: 'still' | 'walking' | 'running' | 'driving';
}

export class LocationService {
  private static watchId: number | null = null;
  private static intervalId: NodeJS.Timeout | null = null;
  private static readonly HIGH_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  };

  static async startLocationTracking(groupId: string, updateInterval = 30000) {
    try {
      // Check if browser supports geolocation
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request permissions
      const permission = await this.requestLocationPermission();
      if (permission !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Start watching position with high accuracy
      this.watchId = navigator.geolocation.watchPosition(
        async (position) => {
          await this.handleLocationUpdate(position, groupId);
        },
        (error) => {
          console.error('Error watching position:', error);
        },
        this.HIGH_ACCURACY_OPTIONS
      );

      // Set up periodic background updates
      this.intervalId = setInterval(async () => {
        const position = await this.getCurrentPosition();
        if (position) {
          await this.handleLocationUpdate(position, groupId);
        }
      }, updateInterval);

      // Subscribe to geofence alerts
      await this.subscribeToGeofenceAlerts(groupId);

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  static async stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  static async handleLocationUpdate(position: GeolocationPosition, groupId: string) {
    try {
      const locationUpdate: LocationUpdate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        speed: position.coords.speed || undefined,
        timestamp: new Date().toISOString(),
        battery_level: await this.getBatteryLevel(),
        activity_type: await this.detectActivityType(position)
      };

      // Update location in database
      const { error } = await supabase
        .from('patient_locations')
        .upsert({
          group_id: groupId,
          location_enabled: true,
          current_location: locationUpdate,
          location_history: supabase.sql`array_append(COALESCE(location_history, '[]'::jsonb), ${locationUpdate}::jsonb)`
        });

      if (error) throw error;

      // Check geofences
      await this.checkGeofences(locationUpdate, groupId);

      return true;
    } catch (error) {
      console.error('Error updating location:', error);
      return false;
    }
  }

  private static async getBatteryLevel(): Promise<number | undefined> {
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        return battery.level * 100;
      }
      return undefined;
    } catch (error) {
      return undefined;
    }
  }

  private static async detectActivityType(position: GeolocationPosition): Promise<LocationUpdate['activity_type']> {
    const speed = position.coords.speed;
    if (!speed) return 'still';
    
    // Speed thresholds in meters/second
    if (speed < 0.2) return 'still';
    if (speed < 2) return 'walking';
    if (speed < 4) return 'running';
    return 'driving';
  }

  private static async requestLocationPermission(): Promise<PermissionState> {
    try {
      if (!('permissions' in navigator)) return 'granted';
      
      const result = await navigator.permissions.query({ name: 'geolocation' });
      return result.state;
    } catch (error) {
      return 'granted'; // Fallback for older browsers
    }
  }

  private static async getCurrentPosition(): Promise<GeolocationPosition | null> {
    try {
      return await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, this.HIGH_ACCURACY_OPTIONS);
      });
    } catch (error) {
      console.error('Error getting current position:', error);
      return null;
    }
  }

  static async checkGeofences(location: LocationUpdate, groupId: string) {
    try {
      // Get active geofences for the group
      const { data: geofences, error } = await supabase
        .from('geofences')
        .select('*')
        .eq('group_id', groupId)
        .eq('active', true);

      if (error) throw error;

      for (const fence of geofences || []) {
        const distance = calculateDistance(
          location.latitude,
          location.longitude,
          fence.center_lat,
          fence.center_lng
        );

        // Check if user has crossed the geofence boundary
        if (distance > fence.radius) {
          await this.handleGeofenceViolation(groupId, fence.id, location);
        }
      }
    } catch (error) {
      console.error('Error checking geofences:', error);
    }
  }

  private static async handleGeofenceViolation(groupId: string, fenceId: string, location: LocationUpdate) {
    try {
      // Create geofence alert
      await supabase
        .from('geofence_alerts')
        .insert({
          group_id: groupId,
          geofence_id: fenceId,
          location: location,
          status: 'unresolved'
        });

      // Create emergency check-in
      await supabase
        .from('patient_check_ins')
        .insert({
          group_id: groupId,
          check_in_type: 'emergency',
          status: 'urgent',
          response_data: {
            type: 'geofence_violation',
            location: location,
            geofence_id: fenceId,
            triggered_at: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('Error handling geofence violation:', error);
    }
  }

  private static async subscribeToGeofenceAlerts(groupId: string) {
    return supabase
      .channel('geofence_alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'geofence_alerts',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          // Handle new geofence alerts
          this.handleGeofenceAlert(payload.new);
        }
      )
      .subscribe();
  }

  private static async handleGeofenceAlert(alert: any) {
    // Implement any additional alert handling logic here
    console.log('New geofence alert:', alert);
  }
}
