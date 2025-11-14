import { useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import L, { Icon, LatLngExpression, Map as LeafletMap, LayerGroup, DivIcon, LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

interface Location {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
  placeId?: number;
  citySlug?: string;
  provinceSlug?: string;
}

interface MapViewProps {
  locations: Location[];
  center?: [number, number];
  zoom?: number;
}

const MapView = ({ locations, center = [52.3676, 4.9041], zoom = 6 }: MapViewProps) => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const mapRef = useRef<LeafletMap | null>(null);
  const markersLayerRef = useRef<LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Create custom marker icon
  const createCustomIcon = () => {
    return new DivIcon({
      className: 'custom-marker-icon',
      html: `
        <div class="relative">
          <div class="w-10 h-10 bg-primary rounded-full shadow-lg border-4 border-white flex items-center justify-center transform transition-all duration-200 hover:scale-110">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });
  };

  // Initialize map once
  useEffect(() => {
    if (containerRef.current && !mapRef.current) {
      const map = L.map(containerRef.current, {
        center: center as LatLngExpression,
        zoom,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
      }).addTo(map);

      // Create marker cluster group with custom options
      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = 'small';
          let colorClass = 'bg-primary';
          
          if (count > 10) {
            size = 'large';
            colorClass = 'bg-accent';
          } else if (count > 5) {
            size = 'medium';
            colorClass = 'bg-primary';
          }
          
          return new DivIcon({
            html: `<div class="cluster-marker ${size}"><span class="cluster-count">${count}</span></div>`,
            className: `marker-cluster ${colorClass}`,
            iconSize: [40, 40],
          });
        },
      });

      markersLayerRef.current = clusterGroup;
      map.addLayer(clusterGroup);
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
    if (!markersLayerRef.current || !mapRef.current) return;

    // Clear previous markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    locations.forEach((loc) => {
      const customIcon = createCustomIcon();
      const marker = L.marker([loc.lat, loc.lon] as LatLngExpression, {
        icon: customIcon,
      });

      // Create popup content with detail button
      const popupContent = document.createElement('div');
      popupContent.className = 'modern-popup';
      popupContent.innerHTML = `
        <div class="p-3 min-w-[200px]">
          <h3 class="font-semibold text-base mb-1 text-foreground">${loc.name}</h3>
          <p class="text-sm text-muted-foreground mb-3 line-clamp-2">${loc.display_name}</p>
          <button 
            class="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium text-sm flex items-center justify-center gap-2"
            data-place-id="${loc.placeId}"
            data-city-slug="${loc.citySlug}"
            data-province-slug="${loc.provinceSlug}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
            Bekijk details
          </button>
        </div>
      `;

      // Add click handler to the button
      const button = popupContent.querySelector('button');
      if (button) {
        button.addEventListener('click', () => {
          const placeId = button.getAttribute('data-place-id');
          const citySlug = button.getAttribute('data-city-slug');
          const provinceSlug = button.getAttribute('data-province-slug');
          if (placeId && citySlug && provinceSlug) {
            navigate(`/${lang}/restaurant/${provinceSlug}/${citySlug}/${placeId}`);
          }
        });
      }

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'modern-leaflet-popup',
      });

      markersLayerRef.current!.addLayer(marker);
    });

    // Auto-fit bounds to show all markers
    if (locations.length > 0) {
      const bounds = new LatLngBounds(
        locations.map(loc => [loc.lat, loc.lon] as LatLngExpression)
      );
      mapRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 15,
      });
    }
  }, [locations, navigate, lang]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-border bg-card">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default MapView;
