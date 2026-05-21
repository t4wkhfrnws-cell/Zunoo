import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CITY_PRESETS, getBrowserLocation, nearestCity } from '../lib/geo';
import { JOURNALS, TEXTBOOKS } from '../data/sources';
import type { Sex } from '../types';
import { ConditionPicker } from './ConditionPicker';
import { Modal } from './Modal';
import { Icon } from './icons';

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export function SettingsPanel({
  onClose,
  onOpenPremium,
}: {
  onClose: () => void;
  onOpenPremium: () => void;
}) {
  const {
    profile,
    updateProfile,
    consent,
    updateConsent,
    premium,
    accessibility,
    updateAccessibility,
    exportAccountData,
    deleteAccount,
  } = useApp();

  const [medInput, setMedInput] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [locNote, setLocNote] = useState('');
  const [exported, setExported] = useState(false);

  const locationOptions = profile.location && !CITY_PRESETS.some((c) => c.name === profile.location)
    ? [profile.location, ...CITY_PRESETS.map((c) => c.name)]
    : CITY_PRESETS.map((c) => c.name);

  const addMed = () => {
    const v = medInput.trim();
    if (v && !profile.medications.includes(v)) {
      updateProfile({ medications: [...profile.medications, v] });
    }
    setMedInput('');
  };

  const removeMed = (m: string) => {
    updateProfile({ medications: profile.medications.filter((x) => x !== m) });
  };

  const useMyLocation = async () => {
    setLocNote('Locating…');
    try {
      const coords = await getBrowserLocation();
      const city = nearestCity(coords);
      updateProfile({ location: city.name, coords });
      updateConsent({ locationAccess: true });
      setLocNote(`Location set near ${city.name}`);
    } catch (err) {
      setLocNote(err instanceof Error ? err.message : 'Could not determine location.');
    }
  };

  const exportData = () => {
    try {
      const data = exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'zuuno-data-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setExported(true);
      setTimeout(() => setExported(false), 2600);
    } catch {
      setExported(false);
    }
  };

  const handleDelete = () => {
    deleteAccount();
    onClose();
  };

  return (
    <Modal title="Settings" onClose={onClose}>
      {/* Profile */}
      <div className="set-group">
        <div className="section-title">Your profile</div>
        <div className="field">
          <label htmlFor="set-name">Display name</label>
          <input
            id="set-name"
            className="input"
            value={profile.displayName}
            onChange={(e) => updateProfile({ displayName: e.target.value })}
            placeholder="Optional"
          />
        </div>
        <div className="grid-2">
          <div className="field">
            <label htmlFor="set-age">Age</label>
            <input
              id="set-age"
              className="input"
              type="number"
              min={0}
              max={120}
              value={profile.age}
              onChange={(e) => updateProfile({ age: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <label htmlFor="set-sex">Sex</label>
            <select
              id="set-sex"
              className="select"
              value={profile.sex}
              onChange={(e) => updateProfile({ sex: e.target.value as Sex })}
            >
              <option value="">Prefer not to say</option>
              {SEX_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label htmlFor="set-loc">Location</label>
          <select
            id="set-loc"
            className="select"
            value={profile.location}
            onChange={(e) => {
              const preset = CITY_PRESETS.find((c) => c.name === e.target.value);
              updateProfile({
                location: e.target.value,
                coords: preset ? preset.coords : profile.coords,
              });
            }}
          >
            <option value="">Select a metro area</option>
            {locationOptions.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <button
            className="link-btn"
            style={{ marginTop: 6, display: 'inline-block' }}
            onClick={useMyLocation}
          >
            Use my current location
          </button>
          {locNote && <div className="hint">{locNote}</div>}
        </div>
        <div className="field">
          <label>Medications</label>
          <div className="tag-input-row">
            <input
              className="input"
              value={medInput}
              onChange={(e) => setMedInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMed();
                }
              }}
              placeholder="Add a medication"
            />
            <button className="btn btn-secondary" onClick={addMed}>
              <Icon name="plus" size={16} /> Add
            </button>
          </div>
          {profile.medications.length > 0 && (
            <div className="tag-row" style={{ marginTop: 8 }}>
              {profile.medications.map((m) => (
                <span className="removable-chip" key={m}>
                  {m}
                  <button onClick={() => removeMed(m)} aria-label={`Remove ${m}`}>
                    <Icon name="close" size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="field">
          <label>Your conditions</label>
          <p className="hint" style={{ marginBottom: 8, marginTop: 0 }}>
            Conditions personalize the chatbot, maps, trials, and resources.
          </p>
          <ConditionPicker
            selected={profile.conditionIds}
            onChange={(ids) => updateProfile({ conditionIds: ids })}
          />
        </div>
      </div>

      {/* Subscription */}
      <div className="set-group">
        <div className="section-title">Subscription</div>
        <div className="set-row">
          <div className="sr-text">
            <h4>Zuuno {premium ? 'Premium' : 'Free'}</h4>
            <p>
              {premium
                ? 'All in-depth features are unlocked.'
                : 'Upgrade for in-depth answers, PDF reports, and trial alerts.'}
            </p>
          </div>
          <button
            className={premium ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
            onClick={onOpenPremium}
          >
            <Icon name="crown" size={15} /> {premium ? 'Manage' : 'Upgrade'}
          </button>
        </div>
      </div>

      {/* Accessibility */}
      <div className="set-group">
        <div className="section-title">Accessibility</div>
        <div className="set-row">
          <div className="sr-text">
            <h4>High-contrast mode</h4>
            <p>Increase contrast for better readability.</p>
          </div>
          <button
            className={`switch ${accessibility.highContrast ? 'on' : ''}`}
            role="switch"
            aria-checked={accessibility.highContrast}
            aria-label="High-contrast mode"
            onClick={() =>
              updateAccessibility({ highContrast: !accessibility.highContrast })
            }
          />
        </div>
        <div className="set-row">
          <div className="sr-text">
            <h4>Reduce motion</h4>
            <p>Minimize animations and transitions.</p>
          </div>
          <button
            className={`switch ${accessibility.reduceMotion ? 'on' : ''}`}
            role="switch"
            aria-checked={accessibility.reduceMotion}
            aria-label="Reduce motion"
            onClick={() => updateAccessibility({ reduceMotion: !accessibility.reduceMotion })}
          />
        </div>
        <div className="set-row">
          <div className="sr-text">
            <h4>Text size</h4>
            <p>Scale text across the whole app.</p>
          </div>
          <div className="stepper">
            <button
              onClick={() =>
                updateAccessibility({
                  fontScale: Math.max(0.9, Math.round((accessibility.fontScale - 0.1) * 10) / 10),
                })
              }
              aria-label="Decrease text size"
            >
              <Icon name="minus" size={15} />
            </button>
            <span>{Math.round(accessibility.fontScale * 100)}%</span>
            <button
              onClick={() =>
                updateAccessibility({
                  fontScale: Math.min(1.4, Math.round((accessibility.fontScale + 0.1) * 10) / 10),
                })
              }
              aria-label="Increase text size"
            >
              <Icon name="plus" size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy & data */}
      <div className="set-group">
        <div className="section-title">Privacy &amp; data</div>
        <div className="set-row">
          <div className="sr-text">
            <h4>Data processing consent</h4>
            <p>Allow Zuuno to process your profile to personalize content.</p>
          </div>
          <button
            className={`switch ${consent?.dataProcessing ? 'on' : ''}`}
            role="switch"
            aria-checked={Boolean(consent?.dataProcessing)}
            aria-label="Data processing consent"
            onClick={() => updateConsent({ dataProcessing: !consent?.dataProcessing })}
          />
        </div>
        <div className="set-row">
          <div className="sr-text">
            <h4>Location access</h4>
            <p>Allow location use to find nearby providers and pharmacies.</p>
          </div>
          <button
            className={`switch ${consent?.locationAccess ? 'on' : ''}`}
            role="switch"
            aria-checked={Boolean(consent?.locationAccess)}
            aria-label="Location access consent"
            onClick={() => updateConsent({ locationAccess: !consent?.locationAccess })}
          />
        </div>
        <p className="hint" style={{ marginTop: 4 }}>
          All data is stored locally on this device. Zuuno uses encryption in transit and does
          not sell personal data.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
          <button className="btn btn-secondary btn-sm" onClick={exportData}>
            <Icon name="download" size={15} /> {exported ? 'Exported' : 'Export my data'}
          </button>
        </div>
        {!confirmDelete ? (
          <button
            className="btn btn-danger btn-sm"
            style={{ marginTop: 8 }}
            onClick={() => setConfirmDelete(true)}
          >
            <Icon name="trash" size={15} /> Delete account &amp; data
          </button>
        ) : (
          <div className="banner banner-amber" style={{ marginTop: 10, flexDirection: 'column' }}>
            <span style={{ display: 'flex', gap: 8 }}>
              <Icon name="alert" size={16} />
              This permanently erases your profile, saved items, and chat history on this
              device.
            </span>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="btn btn-danger btn-sm" onClick={handleDelete}>
                Yes, delete everything
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setConfirmDelete(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* About */}
      <div className="set-group">
        <div className="section-title">About Zuuno</div>
        <p className="hint" style={{ marginTop: 0 }}>
          Version 1.0.0 · Knowledge base referenced to {TEXTBOOKS.length} medical textbooks and{' '}
          {JOURNALS.length} PubMed-indexed journals, plus current clinical practice guidelines.
        </p>
        <p className="hint">
          Zuuno provides educational reference information and is not a substitute for
          professional medical care.
        </p>
      </div>
    </Modal>
  );
}
