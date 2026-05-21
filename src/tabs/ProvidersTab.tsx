import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getConditionById } from '../data/conditions';
import {
  PROVIDERS,
  PROVIDER_INSURANCES,
  PROVIDER_LANGUAGES,
  PROVIDER_SPECIALTIES,
} from '../data/providers';
import { CITY_PRESETS, DEFAULT_CITY, getBrowserLocation, nearestCity } from '../lib/geo';
import { haversineMiles } from '../lib/geo';
import type { Coords } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/icons';
import { MapView, type MapMarker } from '../components/MapView';
import { ProviderCard } from '../components/ProviderCard';

const RADII: { label: string; value: number }[] = [
  { label: '25 mi', value: 25 },
  { label: '50 mi', value: 50 },
  { label: '100 mi', value: 100 },
  { label: '250 mi', value: 250 },
  { label: 'Any distance', value: 1e9 },
];

export function ProvidersTab({ onUpgrade }: { onUpgrade: () => void }) {
  const { profile, focusConditionId, premium } = useApp();
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
  const [specialty, setSpecialty] = useState('all');
  const [telehealthOnly, setTelehealthOnly] = useState(false);
  const [conditionRelevant, setConditionRelevant] = useState(false);
  const [insurance, setInsurance] = useState('all');
  const [language, setLanguage] = useState('all');
  const [gender, setGender] = useState('all');
  const [acceptingOnly, setAcceptingOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [locNote, setLocNote] = useState('');

  const ranked = useMemo(() => {
    return PROVIDERS.map((provider) => ({
      provider,
      distance: haversineMiles(center, provider.coords),
    }))
      .filter(({ provider, distance }) => {
        if (distance > radius) return false;
        if (specialty !== 'all' && provider.specialty !== specialty) return false;
        if (telehealthOnly && !provider.telehealth) return false;
        if (
          conditionRelevant &&
          focusCondition &&
          !provider.conditionsFocus.includes(focusCondition.id)
        ) {
          return false;
        }
        if (premium) {
          if (insurance !== 'all' && !provider.insurance.includes(insurance)) return false;
          if (language !== 'all' && !provider.languages.includes(language)) return false;
          if (gender !== 'all' && provider.gender !== gender) return false;
          if (acceptingOnly && !provider.acceptingNewPatients) return false;
        }
        return true;
      })
      .sort((a, b) => a.distance - b.distance);
  }, [
    center,
    radius,
    specialty,
    telehealthOnly,
    conditionRelevant,
    focusCondition,
    premium,
    insurance,
    language,
    gender,
    acceptingOnly,
  ]);

  const markers: MapMarker[] = ranked.map(({ provider }, i) => ({
    id: provider.id,
    lat: provider.coords.lat,
    lng: provider.coords.lng,
    kind: 'provider',
    label: String(i + 1),
    title: provider.name,
    subtitle: `${provider.specialty} · ${provider.city}, ${provider.state}`,
  }));

  const telehealthCount = ranked.filter((r) => r.provider.telehealth).length;

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

  return (
    <div>
      <div className="page-head">
        <h1>Medical Professionals</h1>
        <p>Find specialists near you, matched to your condition and care needs.</p>
      </div>

      <div className="filter-bar">
        <select
          className="select"
          value={locationName}
          onChange={(e) => changeCity(e.target.value)}
          aria-label="Search area"
          style={{ flex: 1, minWidth: 170 }}
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
        <button
          className={`pill-btn ${showFilters ? 'on' : ''}`}
          onClick={() => setShowFilters((v) => !v)}
        >
          <Icon name="filter" size={14} /> Filters
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <button className="link-btn" onClick={useMyLocation}>
          Use my current location
        </button>
        {locNote && <span className="hint">{locNote}</span>}
      </div>

      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <div className="section-title">Specialty</div>
            <select
              className="select"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="all">All specialties</option>
              {PROVIDER_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <div className="section-title">Quick filters</div>
            <div className="pill-row">
              <button
                className={`pill-btn ${telehealthOnly ? 'on' : ''}`}
                onClick={() => setTelehealthOnly((v) => !v)}
              >
                Telehealth available
              </button>
              {focusCondition && (
                <button
                  className={`pill-btn ${conditionRelevant ? 'on' : ''}`}
                  onClick={() => setConditionRelevant((v) => !v)}
                >
                  Treats {focusCondition.name}
                </button>
              )}
            </div>
          </div>

          <div className="filter-group">
            <div className="section-title">
              Advanced filters {!premium && '· Premium'}
            </div>
            {premium ? (
              <div className="grid-2">
                <select
                  className="select"
                  value={insurance}
                  onChange={(e) => setInsurance(e.target.value)}
                  aria-label="Insurance"
                >
                  <option value="all">Any insurance</option>
                  {PROVIDER_INSURANCES.map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  aria-label="Language"
                >
                  <option value="all">Any language</option>
                  {PROVIDER_LANGUAGES.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <select
                  className="select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  aria-label="Provider gender"
                >
                  <option value="all">Any gender</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
                <button
                  className={`pill-btn ${acceptingOnly ? 'on' : ''}`}
                  onClick={() => setAcceptingOnly((v) => !v)}
                >
                  Accepting new patients
                </button>
              </div>
            ) : (
              <div className="lock-overlay">
                <Icon name="lock" />
                <p>Filter by insurance, language, gender, and availability with Premium.</p>
                <button className="btn btn-ghost btn-sm" onClick={onUpgrade}>
                  <Icon name="crown" size={15} /> Unlock advanced filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {ranked.length > 0 && (
        <MapView
          center={center}
          markers={markers}
          activeId={activeId}
          onSelect={(id) => setActiveId(id)}
        />
      )}

      <div className="results-meta">
        <span>
          {ranked.length} provider{ranked.length === 1 ? '' : 's'} found
        </span>
        {ranked.length > 0 && <span>{telehealthCount} offer telehealth</span>}
      </div>

      {ranked.length === 0 ? (
        <EmptyState
          icon="providers"
          title="No providers found in your area"
          message="Try expanding your search radius or checking telehealth options."
          action={
            <button className="btn btn-primary btn-sm" onClick={() => setRadius(1e9)}>
              Expand to any distance
            </button>
          }
        />
      ) : (
        <div className="result-list">
          {ranked.map(({ provider, distance }) => (
            <ProviderCard
              key={provider.id}
              provider={provider}
              distance={distance}
              selected={activeId === provider.id}
              onSelect={() => setActiveId(provider.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
