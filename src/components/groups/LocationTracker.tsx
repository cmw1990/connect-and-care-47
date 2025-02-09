
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MapPin, Settings, AlertTriangle } from "lucide-react";
import { LocationMap } from "./LocationMap";
import { LocationService } from "../location/LocationService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LocationTrackerProps {
  groupId: string;
}

export const LocationTracker: React.FC<LocationTrackerProps> = ({ groupId }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [locationHistory, setLocationHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Subscribe to location updates
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
          if (payload.new) {
            setCurrentLocation(payload.new.current_location);
            setLocationHistory(payload.new.location_history || []);
          }
        }
      )
      .subscribe();

    // Fetch initial location data
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
        setCurrentLocation(data.current_location);
        setLocationHistory(data.location_history || []);
        setIsTracking(data.location_enabled);
      }
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  };

  const toggleLocationTracking = async () => {
    try {
      if (!isTracking) {
        const success = await LocationService.startLocationTracking(groupId);
        if (success) {
          setIsTracking(true);
          toast({
            title: "Location Tracking Enabled",
            description: "Real-time location updates are now active.",
          });
        }
      } else {
        await LocationService.stopLocationTracking();
        setIsTracking(false);
        toast({
          title: "Location Tracking Disabled",
          description: "Location tracking has been stopped.",
        });
      }
    } catch (error) {
      console.error('Error toggling location tracking:', error);
      toast({
        title: "Error",
        description: "Failed to toggle location tracking.",
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
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Location Tracking
          </div>
          <div className="flex items-center gap-4">
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
                ...(showHistory ? locationHistory.map((loc: any) => ({
                  lat: loc.latitude,
                  lng: loc.longitude,
                  title: `Previous Location`,
                  description: `${new Date(loc.timestamp).toLocaleString()}\nActivity: ${loc.activity_type || 'Unknown'}`
                })) : [])
              ]}
            />
            
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Current Activity:</span>
                <span className={`px-2 py-1 rounded-full text-white ${getActivityColor(currentLocation.activity_type)}`}>
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
              <div className="mt-4 p-2 bg-red-100 rounded-lg flex items-center gap-2 text-sm text-red-700">
                <AlertTriangle className="h-4 w-4" />
                Low battery warning
              </div>
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
  );
};
