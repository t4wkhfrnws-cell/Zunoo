import { useMemo, useState } from 'react';
import { CONDITIONS } from '../data/conditions';
import { Icon } from './icons';

interface ConditionPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  singleSelect?: boolean;
}

export function ConditionPicker({ selected, onChange, singleSelect }: ConditionPickerProps) {
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CONDITIONS;
    return CONDITIONS.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.icd10.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.synonyms.some((s) => s.includes(q)),
    );
  }, [query]);

  const toggle = (id: string) => {
    if (singleSelect) {
      onChange(selected.includes(id) ? [] : [id]);
      return;
    }
    onChange(
      selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
    );
  };

  return (
    <div>
      <div className="search-box" style={{ marginBottom: 10 }}>
        <Icon name="search" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conditions or ICD-10 codes…"
          aria-label="Search conditions"
        />
      </div>
      <div className="cond-list">
        {list.map((c) => {
          const on = selected.includes(c.id);
          return (
            <button
              type="button"
              key={c.id}
              className={`cond-row ${on ? 'on' : ''}`}
              onClick={() => toggle(c.id)}
              aria-pressed={on}
            >
              <span className="consent-check" aria-hidden="true">
                {on && <Icon name="check" size={14} />}
              </span>
              <span className="cr-name">
                <b>{c.name}</b>
                <small>
                  ICD-10 {c.icd10} · {c.category}
                </small>
              </span>
            </button>
          );
        })}
        {list.length === 0 && (
          <p className="muted center" style={{ padding: '18px 0', fontSize: '0.84rem' }}>
            No conditions match “{query}”.
          </p>
        )}
      </div>
    </div>
  );
}
