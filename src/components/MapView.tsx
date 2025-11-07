import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon, LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
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

// Component to handle map view changes
const MapController = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

const MapView = ({ locations, center = [52.3676, 4.9041], zoom = 6 }: MapViewProps) => {
  const mapProps = {
    center: center as LatLngExpression,
    zoom,
    scrollWheelZoom: true,
    className: "h-full w-full"
  };

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-lg border border-border">
      <MapContainer {...mapProps}>
        <MapController center={center} zoom={zoom} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker 
            key={index} 
            position={[location.lat, location.lon] as LatLngExpression}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-semibold mb-1">{location.name}</h3>
                <p className="text-xs text-gray-600">{location.display_name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapView;
