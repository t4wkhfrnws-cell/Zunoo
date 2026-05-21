import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getConditionById } from '../data/conditions';
import { INFUSION_SPECIALTIES, PHARMACIES } from '../data/pharmacies';
import { CITY_PRESETS, DEFAULT_CITY, getBrowserLocation, haversineMiles, nearestCity } from '../lib/geo';
import type { Coords } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/icons';
import { MapView, type MapMarker } from '../components/MapView';
import { PharmacyCard } from '../components/PharmacyCard';

const RADII: { label: string; value: number }[] = [
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
  { label: '100 mi', value: 100 },
  { label: 'Any distance', value: 1e9 },
];

const KINDS: { label: string; value: string }[] = [
  { label: 'All', value: 'all' },
  { label: 'Retail', value: 'retail' },
  { label: 'Specialty', value: 'specialty' },
  { label: 'Compounding', value: 'compounding' },
  { label: 'Infusion centers', value: 'infusion' },
];

export function PharmacyTab() {
  const { profile, focusConditionId } = useApp();
  const focusCondition = focusConditionId ? getConditionById(focusConditionId) : undefined;

  const initialCenter: Coords =
    profile.coords ??
    CITY_PRESETS.find((c) => c.name === profile.location)?.coords ??
    DEFAULT_CITY.coords;
  const initialName =
    profile.location && CITY_PRESETS.some((c) => c.name === profile.location)
      ? profile.location
      : DEFAULT_CITY.name;

  const [center, setCenter] = useState<Coords>(initialCenter);
  const [locationName, setLocationName] = useState(initialName);
  const [radius, setRadius] = useState(100);
  const [kind, setKind] = useState('all');
  const [infusionSpec, setInfusionSpec] = useState(focusCondition?.infusionSpecialty ?? 'all');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [medInput, setMedInput] = useState('');
  const [medChecked, setMedChecked] = useState('');
  const [locNote, setLocNote] = useState('');

  const physical = useMemo(
    () =>
      PHARMACIES.filter((p) => p.city !== 'Nationwide')
        .map((pharmacy) => ({ pharmacy, distance: haversineMiles(center, pharmacy.coords) }))
        .filter(({ pharmacy, distance }) => {
          if (distance > radius) return false;
          if (kind !== 'all' && pharmacy.kind !== kind) return false;
          if (infusionSpec !== 'all' && !pharmacy.infusionSpecialties.includes(infusionSpec)) {
            return false;
          }
          return true;
        })
        .sort((a, b) => a.distance - b.distance),
    [center, radius, kind, infusionSpec],
  );

  const nationwide = useMemo(() => {
    if (kind !== 'all' && kind !== 'online') return [];
    return PHARMACIES.filter((p) => p.city === 'Nationwide').filter(
      (p) => infusionSpec === 'all' || p.infusionSpecialties.includes(infusionSpec),
    );
  }, [kind, infusionSpec]);

  const markers: MapMarker[] = physical.map(({ pharmacy }, i) => ({
    id: pharmacy.id,
    lat: pharmacy.coords.lat,
    lng: pharmacy.coords.lng,
    kind: pharmacy.kind === 'infusion' ? 'infusion' : 'pharmacy',
    label: String(i + 1),
    title: pharmacy.name,
    subtitle: `${pharmacy.chain} · ${pharmacy.city}, ${pharmacy.state}`,
  }));

  const changeCity = (name: string) => {
    const preset = CITY_PRESETS.find((c) => c.name === name);
    if (preset) {
      setLocationName(name);
      setCenter(preset.coords);
      setActiveId(null);
    }
  };

  const useMyLocation = async () => {
    setLocNote('Locating…');
    try {
      const coords = await getBrowserLocation();
      setCenter(coords);
      setLocationName(`Near ${nearestCity(coords).name}`);
      setLocNote('');
    } catch (err) {
      setLocNote(err instanceof Error ? err.message : 'Could not determine location.');
    }
  };

  const totalShown = physical.length + nationwide.length;

  return (
    <div>
      <div className="page-head">
        <h1>Pharmacy &amp; Infusion</h1>
        <p>Local and online pharmacies, plus infusion centers tagged by specialty.</p>
      </div>

      <div className="card" style={{ padding: 12, marginBottom: 13 }}>
        <div className="section-title">Check medication availability</div>
        <div className="tag-input-row">
          <input
            className="input"
            value={medInput}
            onChange={(e) => setMedInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setMedChecked(medInput.trim());
              }
            }}
            placeholder="Enter a medication name"
          />
          <button
            className="btn btn-primary"
            onClick={() => setMedChecked(medInput.trim())}
            disabled={!medInput.trim()}
          >
            Check
          </button>
        </div>
        {medChecked && (
          <div className="banner banner-info" style={{ marginTop: 10, marginBottom: 0 }}>
            <Icon name="info" size={17} />
            <span>
              Live stock data for <strong>{medChecked}</strong> isn’t in our feed. Call a
              pharmacy below to confirm availability — most can also transfer or order it for
              you.
            </span>
          </div>
        )}
      </div>

      <div className="filter-bar">
        <select
          className="select"
          value={locationName}
          onChange={(e) => changeCity(e.target.value)}
          aria-label="Search area"
          style={{ flex: 1, minWidth: 160 }}
        >
          {!CITY_PRESETS.some((c) => c.name === locationName) && (
            <option value={locationName}>{locationName}</option>
          )}
          {CITY_PRESETS.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="select"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          aria-label="Search radius"
          style={{ width: 130 }}
        >
          {RADII.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      <div className="pill-row" style={{ marginBottom: 11 }}>
        {KINDS.map((k) => (
          <button
            key={k.value}
            className={`pill-btn ${kind === k.value ? 'on' : ''}`}
            onClick={() => setKind(k.value)}
          >
            {k.label}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <select
          className="select"
          value={infusionSpec}
          onChange={(e) => setInfusionSpec(e.target.value)}
          aria-label="Infusion specialty"
          style={{ flex: 1, minWidth: 200 }}
        >
          <option value="all">All infusion specialties</option>
          {INFUSION_SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)} infusion
            </option>
          ))}
        </select>
        <button className="link-btn" onClick={useMyLocation}>
          Use my location
        </button>
      </div>
      {locNote && <p className="hint" style={{ marginBottom: 8 }}>{locNote}</p>}

      {physical.length > 0 && (
        <MapView
          center={center}
          markers={markers}
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
        />
      )}

      <div className="results-meta">
        <span>
          {totalShown} result{totalShown === 1 ? '' : 's'}
        </span>
        {physical.length > 0 && <span>{physical.length} within {radius >= 1e9 ? 'any distance' : `${radius} mi`}</span>}
      </div>

      {totalShown === 0 ? (
        <EmptyState
          icon="pill"
          title="No pharmacies found"
          message="Try expanding your search radius, changing the pharmacy type, or viewing online pharmacies."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setRadius(1e9)}>
              Expand to any distance
            </button>
          }
        />
      ) : (
        <div className="result-list">
          {physical.map(({ pharmacy, distance }) => (
            <PharmacyCard
              key={pharmacy.id}
              pharmacy={pharmacy}
              distance={distance}
              selected={activeId === pharmacy.id}
              onSelect={() => setActiveId(pharmacy.id)}
            />
          ))}

          {nationwide.length > 0 && (
            <>
              <div className="section-title" style={{ marginTop: 6 }}>
                Online &amp; mail-order pharmacies
              </div>
              {nationwide.map((pharmacy) => (
                <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} distance={null} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
