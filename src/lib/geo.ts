import type { Coords } from '../types';

export interface CityPreset {
  name: string;
  coords: Coords;
}

// Metro areas covered by the curated provider / pharmacy directories.
export const CITY_PRESETS: CityPreset[] = [
  { name: 'New York, NY', coords: { lat: 40.7128, lng: -74.006 } },
  { name: 'Boston, MA', coords: { lat: 42.3601, lng: -71.0589 } },
  { name: 'Chicago, IL', coords: { lat: 41.8781, lng: -87.6298 } },
  { name: 'Houston, TX', coords: { lat: 29.7604, lng: -95.3698 } },
  { name: 'Atlanta, GA', coords: { lat: 33.749, lng: -84.388 } },
  { name: 'Denver, CO', coords: { lat: 39.7392, lng: -104.9903 } },
  { name: 'Seattle, WA', coords: { lat: 47.6062, lng: -122.3321 } },
  { name: 'Los Angeles, CA', coords: { lat: 34.0522, lng: -118.2437 } },
];

export const DEFAULT_CITY = CITY_PRESETS[0];

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Great-circle distance in miles between two coordinates. */
export function haversineMiles(a: Coords, b: Coords): number {
  const R = 3958.8;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Resolve the nearest known metro to a coordinate (used after geolocation). */
export function nearestCity(coords: Coords): CityPreset {
  let best = CITY_PRESETS[0];
  let bestDist = Infinity;
  for (const city of CITY_PRESETS) {
    const d = haversineMiles(coords, city.coords);
    if (d < bestDist) {
      bestDist = d;
      best = city;
    }
  }
  return best;
}

export function getBrowserLocation(): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message || 'Unable to determine your location.')),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  });
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'Less than 0.1 mi';
  if (miles < 10) return `${miles.toFixed(1)} mi`;
  return `${Math.round(miles)} mi`;
}
