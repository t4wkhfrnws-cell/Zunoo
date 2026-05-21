import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getConditionById } from '../data/conditions';
import { RESOURCES, RESOURCE_CATEGORIES } from '../data/nonprofits';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/icons';
import { ResourceCard } from '../components/ResourceCard';

export function ResearchTab() {
  const { focusConditionId } = useApp();
  const focusCondition = focusConditionId ? getConditionById(focusConditionId) : undefined;

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [personalized, setPersonalized] = useState(true);

  const userTags = focusCondition?.resourceTags ?? [];

  const matchesUser = (tags: string[]): boolean =>
    tags.some((t) => userTags.includes(t));

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = RESOURCES.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (q) {
        const hay = `${r.name} ${r.description} ${r.tags.join(' ')} ${r.category}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (personalized && focusCondition) {
        if (!r.tags.includes('general') && !matchesUser(r.tags)) return false;
      }
      return true;
    });
    // Condition-specific resources first, then general.
    return list.sort((a, b) => {
      const aMatch = matchesUser(a.tags) ? 0 : 1;
      const bMatch = matchesUser(b.tags) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.name.localeCompare(b.name);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, category, personalized, focusCondition, userTags.join(',')]);

  const conditionSpecific = filtered.filter((r) => matchesUser(r.tags));

  return (
    <div>
      <div className="page-head">
        <h1>Research &amp; Nonprofits</h1>
        <p>Trusted nonprofits, guidelines, peer support, and financial-aid programs.</p>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            aria-label="Search resources"
          />
        </div>
      </div>

      <div className="pill-row" style={{ marginBottom: 10 }}>
        <button
          className={`pill-btn ${category === 'all' ? 'on' : ''}`}
          onClick={() => setCategory('all')}
        >
          All
        </button>
        {RESOURCE_CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill-btn ${category === c ? 'on' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {focusCondition && (
        <div className="condition-summary-card">
          <span className="csc-icon">
            <Icon name="sparkle" size={18} />
          </span>
          <div style={{ flex: 1 }}>
            <h3>Personalized for {focusCondition.name}</h3>
            <p>
              {personalized
                ? `Showing resources matched to your condition${
                    conditionSpecific.length > 0
                      ? ` (${conditionSpecific.length} condition-specific)`
                      : ''
                  }, plus trusted general resources.`
                : 'Showing the full resource directory.'}
            </p>
          </div>
          <button
            className={`pill-btn ${personalized ? 'on' : ''}`}
            onClick={() => setPersonalized((v) => !v)}
          >
            {personalized ? 'Personalized' : 'Show all'}
          </button>
        </div>
      )}

      <div className="results-meta">
        <span>
          {filtered.length} resource{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon="book"
          title="No resources match your search"
          message="Try a different search term or clear the category filter to browse the full directory."
          action={
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                setQuery('');
                setCategory('all');
                setPersonalized(false);
              }}
            >
              Clear filters
            </button>
          }
        />
      ) : (
        <div className="result-list">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}
