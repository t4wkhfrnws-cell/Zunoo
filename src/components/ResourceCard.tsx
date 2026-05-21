import type { Resource } from '../types';
import { Icon } from './icons';

const CATEGORY_CHIP: Record<string, string> = {
  'Nonprofit & Advocacy': 'chip-teal',
  'Patient Education': 'chip-blue',
  'Peer Support': 'chip-green',
  'Financial Aid': 'chip-amber',
  'Clinical Guidelines': 'chip-violet',
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export function ResourceCard({ resource }: { resource: Resource }) {
  return (
    <article className="r-card">
      <div className="r-top">
        <div>
          <div className="r-name">{resource.name}</div>
          <div className="r-sub">{hostname(resource.website)}</div>
        </div>
        <span className={`chip ${CATEGORY_CHIP[resource.category] ?? 'chip'}`}>
          {resource.category}
        </span>
      </div>

      <p style={{ fontSize: '0.84rem', color: 'var(--ink-700)', marginTop: 9 }}>
        {resource.description}
      </p>

      <div className="r-actions">
        <a
          className="btn btn-primary btn-sm"
          href={resource.website}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="globe" size={15} /> Visit website
        </a>
        {resource.phone && (
          <a
            className="btn btn-secondary btn-sm"
            href={`tel:${resource.phone.replace(/[^\d+]/g, '')}`}
          >
            <Icon name="phone" size={15} /> Call
          </a>
        )}
      </div>
    </article>
  );
}
