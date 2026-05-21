import type { MouseEvent } from 'react';
import { formatDistance } from '../lib/geo';
import type { Pharmacy } from '../types';
import { Icon } from './icons';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
  distance: number | null;
  selected?: boolean;
  onSelect?: () => void;
}

const KIND_LABELS: Record<string, string> = {
  retail: 'Retail pharmacy',
  online: 'Online / mail-order',
  specialty: 'Specialty pharmacy',
  compounding: 'Compounding pharmacy',
  infusion: 'Infusion center',
};

function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

function directionsHref(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=16/${lat}/${lng}`;
}

export function PharmacyCard({ pharmacy, distance, selected, onSelect }: PharmacyCardProps) {
  const stop = (e: MouseEvent) => e.stopPropagation();
  const isInfusion = pharmacy.kind === 'infusion';
  const isOnline = pharmacy.kind === 'online';

  return (
    <article
      className={`r-card ${selected ? 'selected' : ''}`}
      onClick={onSelect}
      aria-label={pharmacy.name}
    >
      <div className="r-top">
        <div>
          <div className="r-name">{pharmacy.name}</div>
          <div className="r-sub">
            {pharmacy.chain} · {KIND_LABELS[pharmacy.kind] ?? pharmacy.kind}
          </div>
        </div>
      </div>

      <div className="r-meta">
        {distance != null && !isOnline && (
          <span className="chip chip-teal">
            <Icon name="pin" size={12} /> {formatDistance(distance)}
          </span>
        )}
        {isOnline && <span className="chip chip-blue">Ships nationwide</span>}
        {isInfusion && <span className="chip chip-violet">Infusion center</span>}
        {pharmacy.open24h && <span className="chip chip-green">Open 24 hours</span>}
        {pharmacy.deliveryAvailable && <span className="chip">Delivery</span>}
      </div>

      <div className="r-rows">
        {!isOnline && (
          <div className="r-row">
            <Icon name="pin" size={15} />
            <span>
              {pharmacy.address}, {pharmacy.city}, {pharmacy.state} {pharmacy.zip}
            </span>
          </div>
        )}
        <div className="r-row">
          <Icon name="clock" size={15} />
          <span>{pharmacy.hours}</span>
        </div>
        <div className="r-row">
          <Icon name="phone" size={15} />
          <span>{pharmacy.phone}</span>
        </div>
        <div className="r-row">
          <Icon name="pill" size={15} />
          <span>{pharmacy.services.join(' · ')}</span>
        </div>
        {isInfusion && pharmacy.infusionSpecialties.length > 0 && (
          <div className="r-row">
            <Icon name="flask" size={15} />
            <span>
              Infusion specialties:{' '}
              {pharmacy.infusionSpecialties
                .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
                .join(', ')}
            </span>
          </div>
        )}
      </div>

      <div className="r-actions">
        <a className="btn btn-primary btn-sm" href={telHref(pharmacy.phone)} onClick={stop}>
          <Icon name="phone" size={15} /> Call pharmacy
        </a>
        {pharmacy.orderUrl && (
          <a
            className="btn btn-ghost btn-sm"
            href={pharmacy.orderUrl}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
          >
            <Icon name="globe" size={15} /> Order online
          </a>
        )}
        {!isOnline && (
          <a
            className="btn btn-secondary btn-sm"
            href={directionsHref(pharmacy.coords.lat, pharmacy.coords.lng)}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
          >
            <Icon name="navigation" size={15} /> Directions
          </a>
        )}
        {pharmacy.website && !pharmacy.orderUrl && (
          <a
            className="btn btn-secondary btn-sm"
            href={pharmacy.website}
            target="_blank"
            rel="noreferrer"
            onClick={stop}
          >
            <Icon name="globe" size={15} /> Website
          </a>
        )}
      </div>
    </article>
  );
}
