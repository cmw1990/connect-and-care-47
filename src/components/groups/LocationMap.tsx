
import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card } from '@/components/ui/card';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    title?: string;
  }>;
  onMarkerClick?: (marker: { lat: number; lng: number; title?: string }) => void;
}

export const LocationMap = ({ 
  latitude, 
  longitude, 
  zoom = 15,
  markers = [],
  onMarkerClick 
}: LocationMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    if (!map.current) {
      mapboxgl.accessToken = process.env.MAPBOX_TOKEN || '';
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [longitude, latitude],
        zoom
      });

      // Add navigation controls
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        'top-right'
      );
    } else {
      map.current.setCenter([longitude, latitude]);
    }

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach(marker => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = 'url(https://docs.mapbox.com/mapbox-gl-js/assets/pin.png)';
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = 'cover';
      el.style.cursor = 'pointer';

      if (marker.title) {
        el.title = marker.title;
      }

      const mapMarker = new mapboxgl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .addTo(map.current!);

      if (onMarkerClick) {
        el.addEventListener('click', () => onMarkerClick(marker));
      }

      markersRef.current.push(mapMarker);
    });

    return () => {
      markersRef.current.forEach(marker => marker.remove());
      map.current?.remove();
    };
  }, [latitude, longitude, zoom, markers, onMarkerClick]);

  return (
    <Card className="w-full h-[300px] overflow-hidden">
      <div ref={mapContainer} className="w-full h-full" />
    </Card>
  );
};
