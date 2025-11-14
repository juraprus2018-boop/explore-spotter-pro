import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin } from "lucide-react";

// Leaflet loaded via CDN in index.html
declare const L: any;

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
  highlightedPlaceId?: number | null;
}

const MapView = ({ locations, center = [52.3676, 4.9041], zoom = 6, highlightedPlaceId = null }: MapViewProps) => {
  const navigate = useNavigate();
  const { lang } = useParams();
  const mapRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mapInfo, setMapInfo] = useState<{
    center: { lat: number; lng: number };
    zoom: number;
    bounds: { north: number; south: number; east: number; west: number } | null;
  }>({
    center: { lat: center[0], lng: center[1] },
    zoom: zoom,
    bounds: null,
  });

  // Create custom marker icon
  const createCustomIcon = (isHighlighted: boolean = false) => {
    if (typeof L === 'undefined') return null;
    return new L.DivIcon({
      className: 'custom-marker-icon',
      html: `
        <div class="relative ${isHighlighted ? 'highlighted-marker' : ''}">
          <div class="w-10 h-10 ${isHighlighted ? 'bg-accent' : 'bg-primary'} rounded-full shadow-lg border-4 border-white flex items-center justify-center transform transition-all duration-200 hover:scale-110 ${isHighlighted ? 'scale-125 animate-pulse' : ''}">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
          </div>
          <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isHighlighted ? 'border-t-accent' : 'border-t-primary'}"></div>
        </div>
      `,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
      popupAnchor: [0, -48],
    });
  };

  // Initialize map once  
  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;
    
    // Wait for Leaflet CDN to load (with quick check)
    if (typeof L === 'undefined' || typeof (L as any).markerClusterGroup !== 'function') {
      const timer = setTimeout(() => {
        // Retry once after CDN loads
        if (typeof L !== 'undefined' && typeof (L as any).markerClusterGroup === 'function') {
          initMap();
        }
      }, 50);
      return () => clearTimeout(timer);
    }

    initMap();

    function initMap() {
      if (!container || mapRef.current) return;

      // Clear any existing Leaflet instance
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        center,
        zoom,
        scrollWheelZoom: true,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const clusterGroup = (L as any).markerClusterGroup({
        maxClusterRadius: 60,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = "small";
          let colorClass = "bg-primary";
          if (count > 10) {
            size = "large";
            colorClass = "bg-accent";
          } else if (count > 5) {
            size = "medium";
            colorClass = "bg-primary";
          }
          return new L.DivIcon({
            html: `<div class="cluster-marker ${size}"><span class="cluster-count">${count}</span></div>`,
            className: `marker-cluster ${colorClass}`,
            iconSize: [40, 40],
          });
        },
      });

      markersLayerRef.current = clusterGroup;
      map.addLayer(clusterGroup);
      mapRef.current = map;

      setTimeout(() => map.invalidateSize(), 50);

      map.on("moveend zoomend", () => {
        const c = map.getCenter();
        const b = map.getBounds();
        setMapInfo({
          center: { lat: c.lat, lng: c.lng },
          zoom: map.getZoom(),
          bounds: { north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() },
        });
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersLayerRef.current = null;
    };
  }, [center, zoom]);

  // Update view when center/zoom change (only if no locations to fit)
  useEffect(() => {
    if (mapRef.current && locations.length === 0) {
      mapRef.current.setView(center, zoom);
    }
  }, [center, zoom, locations.length]);

  // Render markers when locations change
  useEffect(() => {
    if (!markersLayerRef.current || !mapRef.current) return;

    // Clear previous markers
    markersLayerRef.current.clearLayers();

    // Add new markers
    locations.forEach((loc) => {
      const isHighlighted = loc.placeId === highlightedPlaceId;
      const customIcon = createCustomIcon(isHighlighted);
      if (!customIcon) return;

      const marker = L.marker([loc.lat, loc.lon], {
        icon: customIcon,
      });

      // Create popup content
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

      // Add click handler
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

      // Auto-open popup for highlighted marker
      if (isHighlighted) {
        marker.openPopup();
      }

      markersLayerRef.current.addLayer(marker);
    });

    // Auto-fit bounds to show all markers
    if (locations.length > 0 && mapRef.current) {
      setTimeout(() => {
        if (mapRef.current && locations.length > 0) {
          const bounds = L.latLngBounds(
            locations.map(loc => [loc.lat, loc.lon])
          );
          mapRef.current.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: highlightedPlaceId ? 15 : 13,
            animate: true,
          });
        }
      }, 200);
    }
  }, [locations, navigate, lang, highlightedPlaceId]);

  return (
    <div className="w-full h-full min-h-[420px] md:min-h-[520px] rounded-lg overflow-hidden shadow-lg border border-border bg-card relative">
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Map Info Panel */}
      <div className="absolute top-4 left-4 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
        <div className="flex items-center gap-2 mb-2">
          <MapPin className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Kaart Positie</h3>
        </div>
        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex justify-between gap-4">
            <span className="font-medium">Centrum:</span>
            <span className="font-mono">
              {mapInfo.center.lat.toFixed(4)}, {mapInfo.center.lng.toFixed(4)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium">Zoom:</span>
            <span className="font-mono">{mapInfo.zoom}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="font-medium">Markers:</span>
            <span className="font-mono">{locations.length}</span>
          </div>
          {mapInfo.bounds && (
            <div className="pt-2 mt-2 border-t border-border">
              <div className="font-medium mb-1">Gebied:</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px]">
                <span>N: {mapInfo.bounds.north.toFixed(3)}</span>
                <span>S: {mapInfo.bounds.south.toFixed(3)}</span>
                <span>E: {mapInfo.bounds.east.toFixed(3)}</span>
                <span>W: {mapInfo.bounds.west.toFixed(3)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
