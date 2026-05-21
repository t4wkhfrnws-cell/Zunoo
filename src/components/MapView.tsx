import 'leaflet/dist/leaflet.css';
import * as L from 'leaflet';
import { useEffect } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Coords } from '../types';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  kind: 'provider' | 'pharmacy' | 'infusion';
  label: string;
  title: string;
  subtitle: string;
}

interface MapViewProps {
  center: Coords;
  markers: MapMarker[];
  activeId?: string | null;
  onSelect?: (id: string) => void;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pinIcon(kind: string, active: boolean, label: string): L.DivIcon {
  return L.divIcon({
    className: 'map-pin-wrap',
    html: `<div class="map-pin ${kind} ${active ? 'active' : ''}"><span>${escapeHtml(
      label,
    )}</span></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -24],
  });
}

function MapController({ center, markers }: { center: Coords; markers: MapMarker[] }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.lat, center.lng], map.getZoom() ?? 11, { animate: true });
    // Ensure tiles render correctly after layout settles.
    const t = setTimeout(() => map.invalidateSize(), 180);
    return () => clearTimeout(t);
  }, [center, map]);

  useEffect(() => {
    if (markers.length === 0) return;
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    bounds.extend([center.lat, center.lng]);
    map.fitBounds(bounds, { padding: [38, 38], maxZoom: 13 });
  }, [markers, center, map]);

  return null;
}

export function MapView({ center, markers, activeId, onSelect }: MapViewProps) {
  return (
    <div className="map-shell">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} markers={markers} />
        {markers.map((m) => (
          <Marker
            key={m.id}
            position={[m.lat, m.lng]}
            icon={pinIcon(m.kind, m.id === activeId, m.label)}
            eventHandlers={{ click: () => onSelect?.(m.id) }}
          >
            <Popup>
              <strong>{m.title}</strong>
              <br />
              {m.subtitle}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
