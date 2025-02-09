import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Shield, ShieldCheck, Bell } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SafetyZoneSelectorProps {
  groupId: string;
  onZoneCreated: (zone: {
    name: string;
    radius: number;
    center: { lat: number; lng: number };
  }) => void;
}

export const SafetyZoneSelector: React.FC<SafetyZoneSelectorProps> = ({
  groupId,
  onZoneCreated
}) => {
  const [radius, setRadius] = useState<number>(100);
  const [zoneName, setZoneName] = useState<string>("");
  const { toast } = useToast();

  const handleCreateZone = () => {
    if (!zoneName) {
      toast({
        title: "Zone Name Required",
        description: "Please give this safe zone a name",
        variant: "destructive",
      });
      return;
    }

    // Get current location for zone center
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onZoneCreated({
          name: zoneName,
          radius,
          center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          }
        });
        
        toast({
          title: "Safety Zone Created",
          description: "The new safe zone has been set up successfully",
        });
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Could not get current location. Please try again.",
          variant: "destructive",
        });
      }
    );
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Create Safety Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="zone-name" className="text-base font-medium">
            Zone Name
          </Label>
          <Input
            id="zone-name"
            placeholder="e.g., Home, Park, Community Center"
            value={zoneName}
            onChange={(e) => setZoneName(e.target.value)}
            className="text-lg p-6"
          />
        </div>

        <div className="space-y-4">
          <Label className="text-base font-medium">
            Safe Zone Size: {radius} meters
          </Label>
          <Slider
            value={[radius]}
            onValueChange={(value) => setRadius(value[0])}
            max={1000}
            min={50}
            step={50}
            className="py-4"
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Small (50m)</span>
            <span>Medium (500m)</span>
            <span>Large (1000m)</span>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-amber-500" />
            <span>Alerts will be sent if location moves outside this zone</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-rose-500" />
            <span>Zone will be centered on current location</span>
          </div>
        </div>

        <Button 
          onClick={handleCreateZone}
          className="w-full py-6 text-lg font-medium"
        >
          <ShieldCheck className="mr-2 h-5 w-5" />
          Create Safety Zone
        </Button>
      </CardContent>
    </Card>
  );
};
