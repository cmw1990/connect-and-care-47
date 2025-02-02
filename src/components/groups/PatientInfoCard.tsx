import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, MapPin } from "lucide-react";
import { LocationMap } from "./LocationMap";
import { Geolocation, PermissionStatus } from '@capacitor/geolocation';

interface PatientInfoCardProps {
  groupId: string;
  patientInfo?: {
    basic_info: {
      name?: string;
      age?: string;
      condition?: string;
    };
    diseases?: string[];
    medicines?: {
      name: string;
      dosage: string;
      frequency: string;
    }[];
    care_tips?: string[];
  };
}

interface LocationData {
  location_enabled: boolean;
  current_location: {
    latitude: number;
    longitude: number;
    last_updated?: string;
  };
}

export const PatientInfoCard = ({ groupId, patientInfo }: PatientInfoCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [formData, setFormData] = useState({
    name: patientInfo?.basic_info?.name || "",
    age: patientInfo?.basic_info?.age || "",
    condition: patientInfo?.basic_info?.condition || "",
    diseases: patientInfo?.diseases?.join(", ") || "",
    careTips: patientInfo?.care_tips?.join("\n") || "",
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLocationSettings();
    const channel = supabase
      .channel('location_updates')
      .on(
        'postgres_changes' as any,
        {
          event: '*',
          schema: 'public',
          table: 'patient_locations',
          filter: `group_id=eq.${groupId}`,
        },
        (payload: { new: LocationData }) => {
          if (payload.new) {
            setLocationEnabled(payload.new.location_enabled);
            const location = payload.new.current_location;
            if (location && typeof location === 'object' && 'latitude' in location && 'longitude' in location) {
              setCurrentLocation({
                latitude: location.latitude,
                longitude: location.longitude,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId]);

  const checkPermissions = async () => {
    try {
      const permissionStatus = await Geolocation.checkPermissions();
      
      if (permissionStatus.location === 'prompt' || permissionStatus.location === 'prompt-with-rationale') {
        const requestStatus = await Geolocation.requestPermissions();
        return requestStatus.location === 'granted';
      }
      
      return permissionStatus.location === 'granted';
    } catch (error) {
      console.error('Error checking location permissions:', error);
      return false;
    }
  };

  const fetchLocationSettings = async () => {
    try {
      let { data, error } = await supabase
        .from('patient_locations')
        .select('*')
        .eq('group_id', groupId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newData, error: insertError } = await supabase
          .from('patient_locations')
          .insert({
            group_id: groupId,
            location_enabled: false,
            current_location: {
              latitude: 0,
              longitude: 0,
              last_updated: null
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      }

      if (data) {
        setLocationEnabled(data.location_enabled);
        if (data.current_location && typeof data.current_location === 'object') {
          const location = data.current_location as { latitude: number; longitude: number };
          setCurrentLocation({
            latitude: location.latitude,
            longitude: location.longitude,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching location settings:', error);
    }
  };

  const updateLocation = async () => {
    if (!locationEnabled) return;

    try {
      const hasPermission = await checkPermissions();
      if (!hasPermission) {
        toast({
          title: "Permission Denied",
          description: "Location permission is required to update location",
          variant: "destructive",
        });
        return;
      }

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 30000,
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        last_updated: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('patient_locations')
        .upsert({
          group_id: groupId,
          current_location: newLocation,
          location_enabled: true,
        });

      if (error) throw error;

      setCurrentLocation(newLocation);
    } catch (error) {
      console.error('Error updating location:', error);
      toast({
        title: "Error",
        description: "Failed to update location",
        variant: "destructive",
      });
    }
  };

  const toggleLocationSharing = async () => {
    try {
      if (!locationEnabled) {
        const hasPermission = await checkPermissions();
        if (!hasPermission) {
          toast({
            title: "Permission Denied",
            description: "Location permission is required to enable location sharing",
            variant: "destructive",
          });
          return;
        }
      }

      const { error } = await supabase
        .from('patient_locations')
        .upsert({
          group_id: groupId,
          location_enabled: !locationEnabled,
        });

      if (error) throw error;

      setLocationEnabled(!locationEnabled);
      if (!locationEnabled) {
        updateLocation();
      }

      toast({
        title: "Success",
        description: `Location sharing ${!locationEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('Error toggling location sharing:', error);
      toast({
        title: "Error",
        description: "Failed to toggle location sharing",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (locationEnabled) {
      intervalId = setInterval(updateLocation, 60000);
      updateLocation();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [locationEnabled]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('patient_info')
        .upsert({
          group_id: groupId,
          basic_info: {
            name: formData.name,
            age: formData.age,
            condition: formData.condition,
          },
          diseases: formData.diseases.split(",").map(d => d.trim()),
          care_tips: formData.careTips.split("\n").map(t => t.trim()),
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating patient info:', error);
      toast({
        title: "Error",
        description: "Failed to update patient information",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Patient Information</CardTitle>
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Patient Information</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="condition">Current Condition</Label>
                  <Textarea
                    id="condition"
                    value={formData.condition}
                    onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="diseases">Diseases (comma-separated)</Label>
                  <Input
                    id="diseases"
                    value={formData.diseases}
                    onChange={(e) => setFormData({ ...formData, diseases: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="careTips">Care Tips (one per line)</Label>
                  <Textarea
                    id="careTips"
                    value={formData.careTips}
                    onChange={(e) => setFormData({ ...formData, careTips: e.target.value })}
                    rows={4}
                  />
                </div>
                <Button type="submit" className="w-full">Save Changes</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">Basic Information</h4>
            <p>Name: {patientInfo?.basic_info?.name || "Not specified"}</p>
            <p>Age: {patientInfo?.basic_info?.age || "Not specified"}</p>
            <p>Current Condition: {patientInfo?.basic_info?.condition || "Not specified"}</p>
          </div>
          <div>
            <h4 className="font-medium">Diseases</h4>
            {patientInfo?.diseases && patientInfo.diseases.length > 0 ? (
              <ul className="list-disc pl-5">
                {patientInfo.diseases.map((disease, index) => (
                  <li key={index}>{disease}</li>
                ))}
              </ul>
            ) : (
              <p>No diseases listed</p>
            )}
          </div>
          <div>
            <h4 className="font-medium">Care Tips</h4>
            {patientInfo?.care_tips && patientInfo.care_tips.length > 0 ? (
              <ul className="list-disc pl-5">
                {patientInfo.care_tips.map((tip, index) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            ) : (
              <p>No care tips listed</p>
            )}
          </div>
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <h4 className="font-medium">Location Sharing</h4>
              </div>
              <Switch
                checked={locationEnabled}
                onCheckedChange={toggleLocationSharing}
              />
            </div>
            {locationEnabled && currentLocation && (
              <div className="mt-4">
                <LocationMap
                  latitude={currentLocation.latitude}
                  longitude={currentLocation.longitude}
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
