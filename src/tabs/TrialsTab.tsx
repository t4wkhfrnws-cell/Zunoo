import { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getConditionById } from '../data/conditions';
import { formatStatus, searchTrials } from '../lib/clinicalTrials';
import type { Trial } from '../types';
import { EmptyState } from '../components/EmptyState';
import { Icon } from '../components/icons';
import { TrialCard } from '../components/TrialCard';

export function TrialsTab({ onUpgrade }: { onUpgrade: () => void }) {
  const { focusConditionId, premium, savedTrials } = useApp();
  const focusCondition = focusConditionId ? getConditionById(focusConditionId) : undefined;

  const [query, setQuery] = useState(focusCondition?.trialQuery ?? '');
  const [searchTerm, setSearchTerm] = useState(focusCondition?.trialQuery ?? '');
  const [trials, setTrials] = useState<Trial[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<'live' | 'fallback' | null>(null);
  const [notice, setNotice] = useState('');
  const [view, setView] = useState<'search' | 'watching'>('search');

  const [phase, setPhase] = useState('all');
  const [status, setStatus] = useState('all');
  const [sponsor, setSponsor] = useState('all');
  const [locationText, setLocationText] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!searchTerm.trim()) {
      setTrials([]);
      setSource(null);
      return;
    }
    setLoading(true);
    setNotice('');
    searchTrials(searchTerm)
      .then((result) => {
        if (cancelled) return;
        setTrials(result.trials);
        setSource(result.source);
        setNotice(result.message ?? '');
      })
      .catch(() => {
        if (cancelled) return;
        setTrials([]);
        setSource(null);
        setNotice('Trial search is temporarily unavailable. Please try again shortly.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  const phases = useMemo(
    () => Array.from(new Set(trials.map((t) => t.phase))).sort(),
    [trials],
  );
  const statuses = useMemo(
    () => Array.from(new Set(trials.map((t) => t.status))).sort(),
    [trials],
  );
  const sponsors = useMemo(
    () => Array.from(new Set(trials.map((t) => t.sponsor))).sort(),
    [trials],
  );

  const filtered = useMemo(() => {
    return trials.filter((t) => {
      if (phase !== 'all' && t.phase !== phase) return false;
      if (status !== 'all' && t.status !== status) return false;
      if (premium) {
        if (sponsor !== 'all' && t.sponsor !== sponsor) return false;
        if (locationText.trim()) {
          const q = locationText.trim().toLowerCase();
          const hit = t.locations.some(
            (l) =>
              l.city.toLowerCase().includes(q) ||
              l.state.toLowerCase().includes(q) ||
              l.facility.toLowerCase().includes(q),
          );
          if (!hit) return false;
        }
      }
      return true;
    });
  }, [trials, phase, status, premium, sponsor, locationText]);

  const submit = () => {
    setView('search');
    setPhase('all');
    setStatus('all');
    setSponsor('all');
    setLocationText('');
    setSearchTerm(query.trim());
  };

  const recruitingCount = filtered.filter((t) => t.status === 'RECRUITING').length;

  return (
    <div>
      <div className="page-head">
        <h1>Clinical Trials Watch</h1>
        <p>Search active studies from ClinicalTrials.gov and watch the ones that fit.</p>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Icon name="search" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submit();
            }}
            placeholder="Search trials by condition…"
            aria-label="Search clinical trials"
          />
        </div>
        <button className="btn btn-primary" onClick={submit} disabled={!query.trim()}>
          Search
        </button>
      </div>

      <div className="pill-row" style={{ marginBottom: 12 }}>
        <button
          className={`pill-btn ${view === 'search' ? 'on' : ''}`}
          onClick={() => setView('search')}
        >
          Search results
        </button>
        <button
          className={`pill-btn ${view === 'watching' ? 'on' : ''}`}
          onClick={() => setView('watching')}
        >
          Watching ({savedTrials.length})
        </button>
      </div>

      {view === 'watching' ? (
        savedTrials.length === 0 ? (
          <EmptyState
            icon="star"
            title="No watched trials yet"
            message="Save trials from the search results to track them here. Premium unlocks status-change alerts."
          />
        ) : (
          <div className="result-list">
            {savedTrials.map((s) => (
              <TrialCard key={s.trial.nctId} trial={s.trial} onUpgrade={onUpgrade} />
            ))}
          </div>
        )
      ) : (
        <>
          {trials.length > 0 && (
            <div className="filter-panel">
              <div className="grid-2">
                <div className="filter-group">
                  <div className="section-title">Phase</div>
                  <select
                    className="select"
                    value={phase}
                    onChange={(e) => setPhase(e.target.value)}
                  >
                    <option value="all">All phases</option>
                    {phases.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <div className="section-title">Status</div>
                  <select
                    className="select"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="all">All statuses</option>
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {formatStatus(s)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="filter-group">
                <div className="section-title">
                  Sponsor &amp; location filters {!premium && '· Premium'}
                </div>
                {premium ? (
                  <div className="grid-2">
                    <select
                      className="select"
                      value={sponsor}
                      onChange={(e) => setSponsor(e.target.value)}
                      aria-label="Sponsor"
                    >
                      <option value="all">All sponsors</option>
                      {sponsors.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <input
                      className="input"
                      value={locationText}
                      onChange={(e) => setLocationText(e.target.value)}
                      placeholder="Filter by city or state"
                      aria-label="Location filter"
                    />
                  </div>
                ) : (
                  <div className="lock-overlay">
                    <Icon name="lock" />
                    <p>Filter trials by sponsor and study location with Premium.</p>
                    <button className="btn btn-ghost btn-sm" onClick={onUpgrade}>
                      <Icon name="crown" size={15} /> Unlock advanced filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {source === 'fallback' && notice && (
            <div className="banner banner-amber">
              <Icon name="info" size={17} />
              <span>{notice}</span>
            </div>
          )}
          {source === 'live' && (
            <div className="banner banner-teal">
              <Icon name="check" size={17} />
              <span>Live results from ClinicalTrials.gov.</span>
            </div>
          )}

          {loading ? (
            <div className="loading-block">
              <div className="spinner" />
              Searching ClinicalTrials.gov…
            </div>
          ) : !searchTerm.trim() ? (
            <EmptyState
              icon="flask"
              title="Search for clinical trials"
              message="Enter a condition above, or set a condition in the Assistant tab to personalize results."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="flask"
              title="No active clinical trials match your condition"
              message="Try broadening your search or checking again later. New studies are posted continuously."
            />
          ) : (
            <>
              <div className="results-meta">
                <span>
                  {filtered.length} trial{filtered.length === 1 ? '' : 's'}
                </span>
                <span>{recruitingCount} recruiting now</span>
              </div>
              <div className="result-list">
                {filtered.map((t) => (
                  <TrialCard key={t.nctId} trial={t} onUpgrade={onUpgrade} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
