import { useEffect, useRef } from "react";
import L, { Icon, LatLngExpression, Map as LeafletMap, LayerGroup } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Location {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
}

interface MapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

const MapView = ({ locations, center = [52.3676, 4.9041], zoom = 6 }: MapViewProps) => {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Initialize map once
  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, {
        center: center as LatLngExpression,
        zoom,
        scrollWheelZoom: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        // attribution intentionally omitted to avoid SSR/TS issues in our setup
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    return () => {
      // optional cleanup when component unmounts
      // mapRef.current?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update view when center/zoom change
  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(center as LatLngExpression, zoom);
    }
  }, [center, zoom]);

  // Render markers when locations change
  useEffect(() => {
    if (!markersLayerRef.current) return;

    // Clear previous markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    locations.forEach((loc) => {
      const marker = L.marker([loc.lat, loc.lon] as LatLngExpression).bindPopup(
        `<div style="font-size: 0.875rem">
          <div style="font-weight: 600; margin-bottom: 0.25rem">${loc.name}</div>
          <div style="color: #6b7280; font-size: 0.75rem">${loc.display_name}</div>
        </div>`
      );
      markersLayerRef.current!.addLayer(marker);
    });
  }, [locations]);

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg border border-border">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default MapView;
