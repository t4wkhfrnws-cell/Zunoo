import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatStatus } from '../lib/clinicalTrials';
import type { Trial } from '../types';
import { Icon } from './icons';

const STATUS_CHIP: Record<string, string> = {
  RECRUITING: 'chip-green',
  NOT_YET_RECRUITING: 'chip-amber',
  ENROLLING_BY_INVITATION: 'chip-blue',
  ACTIVE_NOT_RECRUITING: 'chip-blue',
  COMPLETED: 'chip',
  SUSPENDED: 'chip-amber',
  TERMINATED: 'chip-red',
  WITHDRAWN: 'chip-red',
};

export function TrialCard({
  trial,
  onUpgrade,
}: {
  trial: Trial;
  onUpgrade: () => void;
}) {
  const { isTrialSaved, toggleSaveTrial, savedTrials, toggleTrialAlert, premium } = useApp();
  const [expanded, setExpanded] = useState(false);
  const saved = isTrialSaved(trial.nctId);
  const savedEntry = savedTrials.find((s) => s.trial.nctId === trial.nctId);
  const alertsOn = savedEntry?.alertsEnabled ?? false;

  const handleAlerts = () => {
    if (!premium) {
      onUpgrade();
      return;
    }
    const turningOn = !alertsOn;
    toggleTrialAlert(trial.nctId);
    if (turningOn && typeof Notification !== 'undefined') {
      try {
        if (Notification.permission === 'default') {
          void Notification.requestPermission();
        }
      } catch {
        // Notification API unavailable — flag is still stored.
      }
    }
  };

  return (
    <article className="r-card">
      <div className="r-top">
        <div>
          <div className="r-name">{trial.title}</div>
          <div className="r-sub">{trial.nctId} · {trial.sponsor}</div>
        </div>
        <button
          className={`star-btn ${saved ? 'on' : ''}`}
          onClick={() => toggleSaveTrial(trial)}
          aria-pressed={saved}
          aria-label={saved ? 'Remove from watch list' : 'Save and watch trial'}
        >
          <Icon name={saved ? 'star-filled' : 'star'} size={18} />
        </button>
      </div>

      <div className="r-meta">
        <span className="chip chip-teal trial-phase">{trial.phase}</span>
        <span className={`chip ${STATUS_CHIP[trial.status] ?? 'chip'}`}>
          {formatStatus(trial.status)}
        </span>
        <span className="chip">{trial.source}</span>
        {trial.locations.length > 0 && (
          <span className="chip">
            <Icon name="pin" size={12} /> {trial.locations.length} site
            {trial.locations.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      <div className="r-rows">
        {trial.interventions.length > 0 && (
          <div className="r-row">
            <Icon name="pill" size={15} />
            <span>{trial.interventions.slice(0, 4).join(' · ')}</span>
          </div>
        )}
        {trial.locations[0] && (
          <div className="r-row">
            <Icon name="building" size={15} />
            <span>
              {trial.locations[0].facility}
              {trial.locations[0].city ? `, ${trial.locations[0].city}` : ''}
              {trial.locations[0].state ? `, ${trial.locations[0].state}` : ''}
            </span>
          </div>
        )}
      </div>

      {expanded && (
        <div className="expand-block">
          <dl className="t-detail-grid">
            <div className="t-detail">
              <dt>Ages</dt>
              <dd>
                {trial.minAge}
                {trial.maxAge && trial.maxAge !== 'N/A' ? ` – ${trial.maxAge}` : '+'}
              </dd>
            </div>
            <div className="t-detail">
              <dt>Sex</dt>
              <dd>{trial.sex === 'ALL' ? 'All' : trial.sex}</dd>
            </div>
            <div className="t-detail">
              <dt>Enrollment</dt>
              <dd>{trial.enrollmentCount != null ? trial.enrollmentCount : 'Not stated'}</dd>
            </div>
            <div className="t-detail">
              <dt>Last updated</dt>
              <dd>{trial.updated ?? 'Not stated'}</dd>
            </div>
          </dl>

          <div style={{ marginTop: 11 }}>
            <div className="section-title">Eligibility</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--ink-700)' }}>{trial.eligibility}</p>
          </div>

          {trial.conditions.length > 0 && (
            <div style={{ marginTop: 11 }}>
              <div className="section-title">Conditions studied</div>
              <div className="tag-row">
                {trial.conditions.slice(0, 6).map((c) => (
                  <span className="chip" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {trial.locations.length > 0 && (
            <div style={{ marginTop: 11 }}>
              <div className="section-title">Study locations</div>
              <ul className="bullet-list">
                {trial.locations.slice(0, 6).map((loc, i) => (
                  <li key={i}>
                    {loc.facility}
                    {loc.city ? ` — ${loc.city}` : ''}
                    {loc.state ? `, ${loc.state}` : ''}
                    {loc.country && loc.country !== 'United States' ? `, ${loc.country}` : ''}
                  </li>
                ))}
              </ul>
              {trial.locations.length > 6 && (
                <p className="muted" style={{ fontSize: '0.78rem' }}>
                  + {trial.locations.length - 6} more site(s) on ClinicalTrials.gov
                </p>
              )}
            </div>
          )}

          {(trial.contactName || trial.contactPhone || trial.contactEmail) && (
            <div style={{ marginTop: 11 }}>
              <div className="section-title">Study contact</div>
              <div className="r-rows">
                {trial.contactName && (
                  <div className="r-row">
                    <Icon name="user" size={15} />
                    <span>{trial.contactName}</span>
                  </div>
                )}
                {trial.contactPhone && (
                  <div className="r-row">
                    <Icon name="phone" size={15} />
                    <span>{trial.contactPhone}</span>
                  </div>
                )}
                {trial.contactEmail && (
                  <div className="r-row">
                    <Icon name="mail" size={15} />
                    <span>{trial.contactEmail}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {saved && (
        <div className="set-row" style={{ marginTop: 8 }}>
          <div className="sr-text">
            <h4>Trial alerts</h4>
            <p>
              {premium
                ? 'Get notified when this trial’s status changes.'
                : 'Status-change alerts are a Premium feature.'}
            </p>
          </div>
          <button
            className={`switch ${alertsOn ? 'on' : ''}`}
            onClick={handleAlerts}
            role="switch"
            aria-checked={alertsOn}
            aria-label="Toggle trial alerts"
          />
        </div>
      )}

      <div className="r-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => setExpanded((v) => !v)}>
          <Icon name="chevron" size={15} /> {expanded ? 'Less detail' : 'More detail'}
        </button>
        <button
          className={saved ? 'btn btn-ghost btn-sm' : 'btn btn-primary btn-sm'}
          onClick={() => toggleSaveTrial(trial)}
        >
          <Icon name={saved ? 'check' : 'star'} size={15} />
          {saved ? 'Watching' : 'Save & watch'}
        </button>
        <a
          className="btn btn-secondary btn-sm"
          href={trial.url}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="globe" size={15} /> ClinicalTrials.gov
        </a>
      </div>
    </article>
  );
}
