import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface LocationMapProps {
  latitude: number;
  longitude: number;
}

export const LocationMap = ({ latitude, longitude }: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      mapboxgl.accessToken = 'YOUR_MAPBOX_TOKEN'; // Replace with your Mapbox token
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom: 15
      });

      marker.current = new mapboxgl.Marker()
        .setLngLat([longitude, latitude])
        .addTo(map.current);
    } else {
      map.current.setCenter([longitude, latitude]);
      marker.current?.setLngLat([longitude, latitude]);
    }
  }, [latitude, longitude]);

  return (
    <Card className="w-full h-[300px] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  );
};