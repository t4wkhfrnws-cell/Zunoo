import type { MouseEvent } from 'react';
import { useApp } from '../context/AppContext';
import { formatDistance } from '../lib/geo';
import type { Provider } from '../types';
import { Icon } from './icons';

interface ProviderCardProps {
  provider: Provider;
  distance: number | null;
  selected?: boolean;
  onSelect?: () => void;
}

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function directionsHref(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export function ProviderCard({ provider, distance, selected, onSelect }: ProviderCardProps) {
  const { isProviderSaved, toggleSaveProvider } = useApp();
  const saved = isProviderSaved(provider.id);
  const stop = (e: MouseEvent) => e.stopPropagation();

  return (
    <article
      className={`r-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      aria-label={`${provider.name}, ${provider.specialty}`}
    >
      <div className="r-top">
        <div>
          <div className="r-name">
            {provider.name}
            {provider.credentials ? `, ${provider.credentials}` : ''}
          </div>
          <div className="r-sub">{provider.specialty}</div>
        </div>
        <button
          className={`star-btn ${saved ? 'on' : ''}`}
          onClick={(e) => {
            stop(e);
            toggleSaveProvider(provider.id);
          }}
          aria-pressed={saved}
          aria-label={saved ? 'Remove saved provider' : 'Save provider'}
        >
          <Icon name={saved ? 'star-filled' : 'star'} size={18} />
        </button>
      </div>

      <div className="r-meta">
        {distance != null && (
          <span className="chip chip-teal">
            <Icon name="pin" size={12} /> {formatDistance(distance)}
          </span>
        )}
        <span className="rating">
          <Icon name="star-filled" size={14} /> {provider.rating.toFixed(1)}
        </span>
        {provider.telehealth && <span className="chip chip-blue">Telehealth</span>}
        <span className={`chip ${provider.acceptingNewPatients ? 'chip-green' : 'chip-amber'}`}>
          {provider.acceptingNewPatients ? 'Accepting patients' : 'Waitlist only'}
        </span>
      </div>

      <div className="r-rows">
        <div className="r-row">
          <Icon name="pin" size={15} />
          <span>
            {provider.address}, {provider.city}, {provider.state} {provider.zip}
          </span>
        </div>
        <div className="r-row">
          <Icon name="phone" size={15} />
          <span>{provider.phone}</span>
        </div>
        <div className="r-row">
          <Icon name="user" size={15} />
          <span>Languages: {provider.languages.join(', ')}</span>
        </div>
        <div className="r-row">
          <Icon name="shield" size={15} />
          <span>
            Insurance: {provider.insurance.slice(0, 3).join(', ')}
            {provider.insurance.length > 3 ? ` +${provider.insurance.length - 3} more` : ''}
          </span>
        </div>
        <div className="r-row">
          <Icon name="findings" size={15} />
          <span>NPI {provider.npi}</span>
        </div>
      </div>

      <div className="r-actions">
        <a className="btn btn-primary btn-sm" href={telHref(provider.phone)} onClick={stop}>
          <Icon name="phone" size={15} /> Call
        </a>
        <a
          className="btn btn-secondary btn-sm"
          href={directionsHref(provider.coords.lat, provider.coords.lng)}
          target="_blank"
          rel="noreferrer"
          onClick={stop}
        >
          <Icon name="navigation" size={15} /> Directions
        </a>
        {provider.telehealth && (
          <a className="btn btn-ghost btn-sm" href={telHref(provider.phone)} onClick={stop}>
            <Icon name="chat" size={15} /> Request telehealth
          </a>
        )}
      </div>
    </article>
  );
}
