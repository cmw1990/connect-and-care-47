import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MapPin, 
  Settings, 
  AlertTriangle, 
  Shield, 
  Battery, 
  BatteryCharging,
  Activity
} from "lucide-react";
import { LocationMap } from "./LocationMap";
import { SafetyZoneSelector } from "./SafetyZoneSelector";
import { LocationService } from "../location/LocationService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LocationTrackerProps {
  groupId: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  speed?: number;
  timestamp: string;
  battery_level?: number;
  activity_type?: 'still' | 'walking' | 'running' | 'driving';
}

interface PatientLocation {
  current_location: LocationData;
  location_history: LocationData[];
  location_enabled: boolean;
}

interface DangerZone {
  name: string;
  radius: number;
  center: { lat: number; lng: number };
  notifications: {
    exitAlert: boolean;
    enterAlert: boolean;
    smsAlert: boolean;
  };
  boundaryType: 'circle' | 'polygon';
  polygonCoordinates?: number[][];
  dangerZones?: DangerZone[];
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ groupId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showSafetyZone, setShowSafetyZone] = useState(false);
  const [batteryWarning, setBatteryWarning] = useState<string | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const updateBatteryInfo = async () => {
      if ('getBattery' in navigator) {
        const battery: any = await (navigator as any).getBattery();
        setBatteryLevel(battery.level * 100);
        setIsCharging(battery.charging);
        
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100);
        });
        
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      }
    };
    
    updateBatteryInfo();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel(`patient_locations_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'patient_locations',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          const data = payload.new as unknown as PatientLocation;
          if (data?.current_location) {
            setCurrentLocation(data.current_location);
            setLocationHistory(data.location_history || []);
          }
        }
      )
      .subscribe();

    fetchLocationData();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const fetchLocationData = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_locations')
        .select('*')
        .eq('group_id', groupId)
        .single();

      if (error) throw error;

      if (data) {
        const locationData = data as unknown as PatientLocation;
        setCurrentLocation(locationData.current_location);
        setLocationHistory(locationData.location_history || []);
        setIsTracking(locationData.location_enabled);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const handleZoneCreated = async (zone: { 
    name: string; 
    radius: number; 
    center: { lat: number; lng: number };
    notifications: {
      exitAlert: boolean;
      enterAlert: boolean;
      smsAlert: boolean;
    };
    boundaryType: 'circle' | 'polygon';
    polygonCoordinates?: number[][];
    dangerZones?: DangerZone[];
  }) => {
    try {
      const { error } = await supabase
        .from('geofences')
        .insert({
          group_id: groupId,
          name: zone.name,
          center_lat: zone.center.lat,
          center_lng: zone.center.lng,
          radius: zone.radius,
          boundary_type: zone.boundaryType,
          polygon_coordinates: zone.polygonCoordinates,
          active: true,
          notification_settings: zone.notifications,
          danger_zones: zone.dangerZones
        });

      if (error) throw error;

      setShowSafetyZone(false);
      toast({
        title: "Safety Zone Created",
        description: `${zone.name} has been set up successfully`,
      });
    } catch (error) {
      console.error('Error creating safety zone:', error);
      toast({
        title: "Error",
        description: "Failed to create safety zone",
        variant: "destructive",
      });
    }
  };

  const toggleLocationTracking = async () => {
    try {
      if (!isTracking) {
        if (batteryLevel !== null && batteryLevel < 20 && !isCharging) {
          toast({
            title: "Battery Warning",
            description: "Low battery may affect location tracking accuracy",
            variant: "warning",
          });
        }

        const success = await LocationService.startLocationTracking(groupId);
        if (success) {
          setIsTracking(true);
          toast({
            title: "Location Tracking Enabled",
            description: "Real-time location updates are now active",
          });
        }
      } else {
        const success = await LocationService.stopLocationTracking();
        if (success) {
          setIsTracking(false);
          toast({
            title: "Location Tracking Disabled",
            description: "Location tracking has been stopped",
          });
        }
      }
    } catch (error) {
      console.error('Error toggling location tracking:', error);
      toast({
        title: "Error",
        description: "Failed to toggle location tracking",
        variant: "destructive",
      });
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'still': return 'bg-gray-500';
      case 'walking': return 'bg-green-500';
      case 'running': return 'bg-yellow-500';
      case 'driving': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Tracking
              {isTracking && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Activity className="w-3 h-3 mr-1 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              {batteryLevel !== null && (
                <div className="flex items-center text-sm">
                  {isCharging ? (
                    <BatteryCharging className="w-4 h-4 mr-1 text-green-500" />
                  ) : (
                    <Battery className={`w-4 h-4 mr-1 ${batteryLevel < 20 ? 'text-red-500' : 'text-green-500'}`} />
                  )}
                  {Math.round(batteryLevel)}%
                </div>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSafetyZone(!showSafetyZone)}
              >
                <Shield className="h-4 w-4 mr-2" />
                Safety Zone
              </Button>
              <Switch
                checked={isTracking}
                onCheckedChange={toggleLocationTracking}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowHistory(!showHistory)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {batteryLevel !== null && batteryLevel < 20 && !isCharging && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Low battery ({Math.round(batteryLevel)}%). Location tracking accuracy may be affected.
              </AlertDescription>
            </Alert>
          )}

          {currentLocation && (
            <>
              <LocationMap
                latitude={currentLocation.latitude}
                longitude={currentLocation.longitude}
                zoom={15}
                markers={[
                  {
                    lat: currentLocation.latitude,
                    lng: currentLocation.longitude,
                    title: "Current Location",
                    description: `Last updated: ${new Date(currentLocation.timestamp).toLocaleString()}`
                  },
                  ...(showHistory ? locationHistory.map((loc: LocationData) => ({
                    lat: loc.latitude,
                    lng: loc.longitude,
                    title: `Previous Location`,
                    description: `${new Date(loc.timestamp).toLocaleString()}\nActivity: ${loc.activity_type || 'Unknown'}`
                  })) : [])
                ]}
              />
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Tracking Status:</span>
                  <span className={`px-2 py-1 rounded-full ${isTracking ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {isTracking ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span>Current Activity:</span>
                  <span className={`px-2 py-1 rounded-full text-white ${getActivityColor(currentLocation.activity_type || 'unknown')}`}>
                    {currentLocation.activity_type || 'Unknown'}
                  </span>
                </div>
                
                {currentLocation.battery_level && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Battery Level:</span>
                    <span className={`${currentLocation.battery_level < 20 ? 'text-red-500' : ''}`}>
                      {currentLocation.battery_level.toFixed(0)}%
                    </span>
                  </div>
                )}
                
                {currentLocation.speed && (
                  <div className="flex items-center justify-between text-sm">
                    <span>Speed:</span>
                    <span>{(currentLocation.speed * 3.6).toFixed(1)} km/h</span>
                  </div>
                )}
              </div>

              {currentLocation.battery_level && currentLocation.battery_level < 20 && (
                <Alert className="mt-4" variant="warning">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Low battery warning. Please charge your device to maintain accurate location tracking.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          {!currentLocation && (
            <div className="text-center py-8 text-gray-500">
              No location data available
            </div>
          )}
        </CardContent>
      </Card>

      {showSafetyZone && (
        <SafetyZoneSelector
          groupId={groupId}
          onZoneCreated={handleZoneCreated}
        />
      )}
    </div>
  );
};
