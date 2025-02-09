import { supabase } from "@/integrations/supabase/client";
import { calculateDistance } from "@/utils/locationUtils";
import { useToast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

interface LocationUpdate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: string;
  battery_level?: number;
  activity_type?: 'still' | 'walking' | 'running' | 'driving';
}

interface NotificationSettings {
  exitAlert: boolean;
  enterAlert: boolean;
  smsAlert: boolean;
}

interface DangerZone {
  coordinates: number[][];
  typeId: string;
  type: string;
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  exitAlert: true,
  enterAlert: false,
  smsAlert: false
};

export class LocationService {
  private static watchId: number | null = null;
  private static intervalId: NodeJS.Timeout | null = null;
  private static isTrackingActive = false;
  private static readonly HIGH_ACCURACY_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    maximumAge: 0,
    timeout: 5000
  };

  static isTracking() {
    return this.isTrackingActive;
  }

  static async startLocationTracking(groupId: string, updateInterval = 30000) {
    try {
      if (this.isTrackingActive) {
        console.log('Location tracking is already active');
        return false;
      }

      // Check if browser supports geolocation
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by your browser');
      }

      // Request permissions
      const permission = await this.requestLocationPermission();
      if (permission !== 'granted') {
        throw new Error('Location permission denied');
      }

      // Check battery status if available
      const batteryWarning = await this.checkBatteryStatus();
      if (batteryWarning) {
        console.warn('Battery warning:', batteryWarning);
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

      this.isTrackingActive = true;
      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  private static async checkBatteryStatus(): Promise<string | null> {
    try {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        if (!battery.charging && battery.level < 0.2) {
          return `Battery level is low (${Math.round(battery.level * 100)}%). Location tracking may be affected.`;
        }
        if (!battery.charging && battery.level < 0.1) {
          return `Critical battery level (${Math.round(battery.level * 100)}%). Please charge your device to maintain location tracking.`;
        }
      }
      return null;
    } catch (error) {
      return null;
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
          current_location: locationUpdate as unknown as Json,
          location_history: [locationUpdate] as unknown as Json[]
        }, {
          onConflict: 'group_id'
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

      const violations: Array<{
        fenceId: string;
        isExit: boolean;
        dangerZone?: string;
      }> = [];

      for (const fence of geofences || []) {
        let isOutside = true;

        if (fence.boundary_type === 'circle') {
          const distance = calculateDistance(
            location.latitude,
            location.longitude,
            fence.center_lat,
            fence.center_lng
          );
          isOutside = distance > fence.radius;
        } else if (fence.boundary_type === 'polygon' && fence.polygon_coordinates) {
          isOutside = !LocationService.isPointInPolygon(
            [location.longitude, location.latitude],
            fence.polygon_coordinates as number[][]
          );
        }

        // Check if point is in any danger zones
        let inDangerZone = false;
        let dangerZoneType = '';
        
        if (fence.danger_zones) {
          const dangerZones = (fence.danger_zones as unknown as DangerZone[]);
          for (const zone of dangerZones) {
            if (LocationService.isPointInPolygon(
              [location.longitude, location.latitude],
              zone.coordinates
            )) {
              inDangerZone = true;
              dangerZoneType = zone.typeId;
              break;
            }
          }
        }

        const fenceNotifications = ((fence.notification_settings as unknown) as NotificationSettings) || DEFAULT_NOTIFICATION_SETTINGS;

        // Check if user has crossed the geofence boundary or entered danger zone
        if ((isOutside && fenceNotifications.exitAlert) || 
            (!isOutside && fenceNotifications.enterAlert) || 
            inDangerZone) {
          violations.push({
            fenceId: fence.id,
            isExit: isOutside,
            dangerZone: inDangerZone ? dangerZoneType : undefined
          });
        }
      }

      // Handle all violations
      for (const violation of violations) {
        await this.handleGeofenceViolation(
          groupId,
          violation.fenceId,
          location,
          violation.isExit,
          fenceNotifications.smsAlert,
          violation.dangerZone
        );
      }

      return violations.length > 0;
    } catch (error) {
      console.error('Error checking geofences:', error);
      return false;
    }
  }

  private static isPointInPolygon(point: number[], polygon: number[][]): boolean {
    const x = point[0];
    const y = point[1];
    let inside = false;

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const xi = polygon[i][0];
      const yi = polygon[i][1];
      const xj = polygon[j][0];
      const yj = polygon[j][1];

      const intersect = ((yi > y) !== (yj > y))
          && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }

    return inside;
  }

  private static async handleGeofenceViolation(
    groupId: string, 
    fenceId: string, 
    location: LocationUpdate,
    isExit: boolean,
    sendSms: boolean,
    dangerZoneType?: string
  ) {
    try {
      // Create geofence alert
      const { data: alert } = await supabase
        .from('geofence_alerts')
        .insert({
          group_id: groupId,
          geofence_id: fenceId,
          location: location as unknown as Json,
          alert_type: dangerZoneType ? 'danger' : (isExit ? 'exit' : 'enter'),
          status: 'unresolved',
          danger_zone_type: dangerZoneType
        })
        .select()
        .single();

      // Create emergency check-in for exits or danger zones
      if (isExit || dangerZoneType) {
        await supabase
          .from('patient_check_ins')
          .insert({
            group_id: groupId,
            check_in_type: 'emergency',
            status: 'urgent',
            response_data: {
              type: dangerZoneType ? 'danger_zone' : 'geofence_violation',
              location: location,
              geofence_id: fenceId,
              danger_zone_type: dangerZoneType,
              triggered_at: new Date().toISOString()
            } as unknown as Json
          });

        // Send SMS if enabled
        if (sendSms) {
          console.log('SMS alert would be sent here');
        }
      }
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

  static async stopLocationTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isTrackingActive = false;
    return true;
  }
}
