
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPin, Shield, ShieldCheck, Bell, Phone, Pencil, Circle, Square, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import mapboxgl from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

interface NotificationSettings {
  exitAlert: boolean;
  enterAlert: boolean;
  smsAlert: boolean;
}

interface DangerZone {
  type: string;
  coordinates: number[][];
  typeId: string;
  description?: string;
}

interface SafetyZoneSelectorProps {
  groupId: string;
  onZoneCreated: (zone: {
    name: string;
    radius: number;
    center: { lat: number; lng: number };
    notifications: NotificationSettings;
    boundaryType: 'circle' | 'polygon';
    polygonCoordinates?: number[][];
    dangerZones?: DangerZone[];
  }) => void;
}

export const SafetyZoneSelector: React.FC<SafetyZoneSelectorProps> = ({
  groupId,
  onZoneCreated
}) => {
  const [radius, setRadius] = useState<number>(100);
  const [zoneName, setZoneName] = useState<string>("");
  const [notifications, setNotifications] = useState<NotificationSettings>({
    exitAlert: true,
    enterAlert: false,
    smsAlert: true
  });
  const [boundaryType, setBoundaryType] = useState<'circle' | 'polygon'>('circle');
  const [dangerZones, setDangerZones] = useState<DangerZone[]>([]);
  const [dangerZoneTypes, setDangerZoneTypes] = useState<any[]>([]);
  const [selectedDangerType, setSelectedDangerType] = useState<string>("");
  const [isDrawing, setIsDrawing] = useState(false);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const draw = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Fetch danger zone types
    const fetchDangerZoneTypes = async () => {
      const { data, error } = await supabase
        .from('danger_zone_types')
        .select('*');
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to load danger zone types",
          variant: "destructive",
        });
        return;
      }

      setDangerZoneTypes(data);
      if (data.length > 0) {
        setSelectedDangerType(data[0].id);
      }
    };

    fetchDangerZoneTypes();
  }, []);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-74.5, 40],
      zoom: 9
    });

    // Initialize draw control
    draw.current = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true
      }
    });

    map.current.addControl(draw.current);

    // Add draw event listeners
    map.current.on('draw.create', handleDrawComplete);
    map.current.on('draw.delete', handleDrawDelete);

    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        if (map.current) {
          map.current.flyTo({
            center: [position.coords.longitude, position.coords.latitude],
            zoom: 15
          });
        }
      },
      (error) => {
        toast({
          title: "Location Error",
          description: "Could not get current location",
          variant: "destructive",
        });
      }
    );

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  const handleDrawComplete = (e: any) => {
    if (boundaryType === 'polygon') {
      const coordinates = e.features[0].geometry.coordinates[0];
      handleCreateZone(coordinates);
    } else if (selectedDangerType) {
      const coordinates = e.features[0].geometry.coordinates[0];
      setDangerZones([...dangerZones, {
        type: 'danger',
        coordinates,
        typeId: selectedDangerType
      }]);
    }
  };

  const handleDrawDelete = () => {
    if (isDrawing) {
      setIsDrawing(false);
    }
  };

  const startDrawing = (type: 'zone' | 'danger') => {
    setIsDrawing(true);
    if (draw.current) {
      draw.current.deleteAll();
      draw.current.changeMode('draw_polygon');
    }
  };

  const handleCreateZone = (polygonCoordinates?: number[][]) => {
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
        const zoneData = {
          name: zoneName,
          radius,
          center: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          notifications,
          boundaryType,
          polygonCoordinates,
          dangerZones: dangerZones
        };

        onZoneCreated(zoneData);
        
        toast({
          title: "Safety Zone Created",
          description: "The new safe zone has been set up successfully"
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

        <Tabs defaultValue="boundary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="boundary">Zone Boundary</TabsTrigger>
            <TabsTrigger value="danger">Danger Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="boundary">
            <div className="space-y-4">
              <RadioGroup
                value={boundaryType}
                onValueChange={(value: 'circle' | 'polygon') => setBoundaryType(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="circle" id="circle" />
                  <Label htmlFor="circle" className="flex items-center gap-1">
                    <Circle className="h-4 w-4" /> Circular Zone
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="polygon" id="polygon" />
                  <Label htmlFor="polygon" className="flex items-center gap-1">
                    <Pencil className="h-4 w-4" /> Draw Custom
                  </Label>
                </div>
              </RadioGroup>

              {boundaryType === 'circle' && (
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
              )}

              {boundaryType === 'polygon' && (
                <div className="space-y-4">
                  <Alert>
                    <AlertDescription>
                      Click the draw button below and create a custom boundary by clicking points on the map. Double-click to complete the shape.
                    </AlertDescription>
                  </Alert>
                  <Button
                    onClick={() => startDrawing('zone')}
                    variant="outline"
                    className="w-full"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Draw Zone Boundary
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="danger">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {dangerZoneTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant={selectedDangerType === type.id ? "default" : "outline"}
                    className="w-full"
                    onClick={() => setSelectedDangerType(type.id)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {type.name}
                  </Button>
                ))}
              </div>

              <Alert>
                <AlertDescription>
                  Select a danger zone type above, then click the button below to draw areas to avoid on the map.
                </AlertDescription>
              </Alert>

              <Button
                onClick={() => startDrawing('danger')}
                variant="outline"
                className="w-full"
                disabled={!selectedDangerType}
              >
                <Pencil className="mr-2 h-4 w-4" />
                Draw Danger Zone
              </Button>

              {dangerZones.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-base font-medium">Added Danger Zones:</Label>
                  {dangerZones.map((zone, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <span>{dangerZoneTypes.find(t => t.id === zone.typeId)?.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newZones = [...dangerZones];
                          newZones.splice(index, 1);
                          setDangerZones(newZones);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div ref={mapContainer} className="w-full h-[300px] rounded-lg" />

        <div className="space-y-4 border rounded-lg p-4">
          <Label className="text-base font-medium">Alert Settings</Label>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Exit Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when leaving zone
                </p>
              </div>
              <Switch
                checked={notifications.exitAlert}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, exitAlert: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enter Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Notify when entering zone
                </p>
              </div>
              <Switch
                checked={notifications.enterAlert}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, enterAlert: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>SMS Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Send SMS for critical alerts
                </p>
              </div>
              <Switch
                checked={notifications.smsAlert}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, smsAlert: checked }))
                }
              />
            </div>
          </div>
        </div>

        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Bell className="h-4 w-4 text-amber-500" />
            <span>Alerts will be sent if location moves outside safe zones</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-rose-500" />
            <span>Draw custom boundaries or use circular zones</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>Mark dangerous areas to avoid</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-emerald-500" />
            <span>SMS alerts for urgent notifications</span>
          </div>
        </div>

        <Button 
          onClick={() => boundaryType === 'circle' ? handleCreateZone() : undefined}
          className="w-full py-6 text-lg font-medium"
          disabled={isDrawing}
        >
          <ShieldCheck className="mr-2 h-5 w-5" />
          Create Safety Zone
        </Button>
      </CardContent>
    </Card>
  );
};
