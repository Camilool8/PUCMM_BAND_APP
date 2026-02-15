"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, Loader2, X } from "lucide-react";

// Fix Leaflet default marker icons (broken in Webpack/Next.js bundlers)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Default center: PUCMM Campus Santiago
const DEFAULT_CENTER: [number, number] = [19.4517, -70.6879];
const DEFAULT_ZOOM = 16;

interface MapPickerProps {
  latitude: number | null;
  longitude: number | null;
  radiusMeters: number;
  onLocationChange: (lat: number, lng: number) => void;
  onAddressFound?: (address: string) => void;
  className?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

// Internal component: fix map sizing when rendered inside modals/animated containers
function MapReady() {
  const map = useMap();

  useEffect(() => {
    // Leaflet needs invalidateSize() when rendered inside containers that animate in (modals)
    // Without this, tiles may not load or the map shows grey
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
}

// Internal component: handles map click events
function ClickHandler({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Internal component: flies the map to new coordinates when they change externally
function MapCenterUpdater({ lat, lng }: { lat: number | null; lng: number | null }) {
  const map = useMap();
  const prevRef = useRef<string>("");

  useEffect(() => {
    if (lat !== null && lng !== null) {
      const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
      if (key !== prevRef.current) {
        prevRef.current = key;
        map.flyTo([lat, lng], Math.max(map.getZoom(), DEFAULT_ZOOM), { duration: 0.8 });
      }
    }
  }, [lat, lng, map]);

  return null;
}

// Internal component: address search bar using Nominatim
function AddressSearch({
  onSelect,
}: {
  onSelect: (lat: number, lng: number, address: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 3) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=do&limit=5`,
        { headers: { "Accept-Language": "es" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowResults(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 500);
  };

  const handleSelect = (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    onSelect(lat, lng, result.display_name);
    setQuery(result.display_name.split(",")[0]);
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute top-3 right-3 z-1000 w-64"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Buscar dirección..."
          className="w-full bg-surface-0/95 backdrop-blur-sm border border-surface-200 rounded-lg pl-8 pr-8 py-2 text-xs text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 outline-none transition-all"
        />
        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        {isSearching && (
          <Loader2 size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
        )}
        {!isSearching && query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setShowResults(false);
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="mt-1 bg-surface-0/95 backdrop-blur-sm border border-surface-200 rounded-lg overflow-hidden shadow-xl">
          {results.map((result) => (
            <button
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="w-full text-left px-3 py-2 text-xs text-gray-300 hover:bg-surface-100 hover:text-white transition-colors border-b border-surface-200/30 last:border-0"
            >
              <span className="line-clamp-2">{result.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MapPicker({
  latitude,
  longitude,
  radiusMeters,
  onLocationChange,
  onAddressFound,
  className = "",
}: MapPickerProps) {
  const center: [number, number] =
    latitude !== null && longitude !== null ? [latitude, longitude] : DEFAULT_CENTER;

  const handleSearchSelect = (lat: number, lng: number, address: string) => {
    onLocationChange(lat, lng);
    onAddressFound?.(address);
  };

  return (
    <div className={`relative rounded-xl overflow-hidden border border-surface-200/50 ${className}`}>
      <MapContainer
        center={center}
        zoom={DEFAULT_ZOOM}
        style={{ height: "300px", width: "100%" }}
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        <MapReady />
        <ClickHandler onLocationChange={onLocationChange} />
        <MapCenterUpdater lat={latitude} lng={longitude} />

        {latitude !== null && longitude !== null && (
          <>
            <Marker position={[latitude, longitude]} />
            <Circle
              center={[latitude, longitude]}
              radius={radiusMeters}
              pathOptions={{
                color: "#10B981",
                fillColor: "#10B981",
                fillOpacity: 0.15,
                weight: 2,
              }}
            />
          </>
        )}

        <AddressSearch onSelect={handleSearchSelect} />
      </MapContainer>

      {/* Hint overlay when no pin is placed */}
      {latitude === null && (
        <div className="absolute bottom-3 left-3 z-1000 pointer-events-none">
          <div className="bg-surface-0/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-surface-200/50">
            <span className="text-[10px] text-gray-400">Haz clic en el mapa para colocar un pin</span>
          </div>
        </div>
      )}
    </div>
  );
}
