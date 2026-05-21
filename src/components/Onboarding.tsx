import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CITY_PRESETS } from '../lib/geo';
import type { ConsentSettings, Sex, UserProfile } from '../types';
import { ConditionPicker } from './ConditionPicker';
import { Icon, type IconName } from './icons';

const VALUE_PROPS: { icon: IconName; title: string; text: string }[] = [
  {
    icon: 'chat',
    title: 'Clinician-grade answers',
    text: 'Structured, cited information from leading textbooks, journals, and guidelines.',
  },
  {
    icon: 'providers',
    title: 'Care near you',
    text: 'Maps of providers, pharmacies, and infusion centers matched to your condition.',
  },
  {
    icon: 'flask',
    title: 'Clinical trials watch',
    text: 'Discover, filter, and watch trials tailored to your diagnosis and location.',
  },
  {
    icon: 'book',
    title: 'Trusted resources',
    text: 'Curated nonprofits, support networks, guidelines, and financial-aid programs.',
  },
];

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'intersex', label: 'Intersex' },
  { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];

export function Onboarding() {
  const { completeOnboarding } = useApp();
  const [step, setStep] = useState(0);

  const [dataConsent, setDataConsent] = useState(false);
  const [locationConsent, setLocationConsent] = useState(false);
  const [disclaimerConsent, setDisclaimerConsent] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    displayName: '',
    age: '',
    sex: '',
    conditionIds: [],
    medications: [],
    location: '',
  });
  const [medInput, setMedInput] = useState('');

  const patch = (p: Partial<UserProfile>) => setProfile((prev) => ({ ...prev, ...p }));

  const consentReady = dataConsent && disclaimerConsent;

  const finish = () => {
    const consent: ConsentSettings = {
      dataProcessing: dataConsent,
      locationAccess: locationConsent,
      medicalDisclaimer: disclaimerConsent,
      acceptedAt: new Date().toISOString(),
    };
    completeOnboarding(profile, consent);
  };

  const addMed = () => {
    const v = medInput.trim();
    if (v && !profile.medications.includes(v)) {
      patch({ medications: [...profile.medications, v] });
    }
    setMedInput('');
  };

  return (
    <div className="onboard">
      <div className="onboard-progress" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i <= step ? 'done' : ''} />
        ))}
      </div>

      <div className="onboard-body">
        {step === 0 && (
          <div>
            <div className="onboard-hero">
              <img src="/favicon.svg" alt="" className="brand-mark" width={78} height={78} />
              <h1>Welcome to Zuuno</h1>
              <p className="lede">
                A clinician-grade medical assistant and resource hub for people who already
                know their diagnosis — and for the people who care for them.
              </p>
            </div>
            <div className="value-list">
              {VALUE_PROPS.map((v) => (
                <div className="value-item" key={v.title}>
                  <span className="vi-icon">
                    <Icon name={v.icon} />
                  </span>
                  <div>
                    <h3>{v.title}</h3>
                    <p>{v.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2>Your consent</h2>
            <p className="step-sub">
              Zuuno stores your data locally on this device. Please review and accept the items
              below to continue.
            </p>

            <button
              type="button"
              className={`consent-item ${dataConsent ? 'checked' : ''}`}
              onClick={() => setDataConsent((v) => !v)}
              aria-pressed={dataConsent}
            >
              <span className="consent-check">{dataConsent && <Icon name="check" size={15} />}</span>
              <span>
                <h3>Data processing (required)</h3>
                <p>
                  I allow Zuuno to process the profile information I provide to personalize the
                  chatbot, maps, trials, and resources.
                </p>
              </span>
            </button>

            <button
              type="button"
              className={`consent-item ${locationConsent ? 'checked' : ''}`}
              onClick={() => setLocationConsent((v) => !v)}
              aria-pressed={locationConsent}
            >
              <span className="consent-check">
                {locationConsent && <Icon name="check" size={15} />}
              </span>
              <span>
                <h3>Location access (optional)</h3>
                <p>
                  I allow Zuuno to use my location to find nearby providers, pharmacies, and
                  infusion centers. You can change this anytime.
                </p>
              </span>
            </button>

            <button
              type="button"
              className={`consent-item ${disclaimerConsent ? 'checked' : ''}`}
              onClick={() => setDisclaimerConsent((v) => !v)}
              aria-pressed={disclaimerConsent}
            >
              <span className="consent-check">
                {disclaimerConsent && <Icon name="check" size={15} />}
              </span>
              <span>
                <h3>Medical disclaimer (required)</h3>
                <p>
                  I understand Zuuno provides educational information only, does not diagnose or
                  prescribe, and is not a substitute for professional medical care.
                </p>
              </span>
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Set up your profile</h2>
            <p className="step-sub">
              Optional, but it personalizes the entire app. You can edit or skip this anytime.
            </p>

            <div className="field">
              <label htmlFor="ob-name">Display name</label>
              <input
                id="ob-name"
                className="input"
                value={profile.displayName}
                onChange={(e) => patch({ displayName: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div className="grid-2">
              <div className="field">
                <label htmlFor="ob-age">Age</label>
                <input
                  id="ob-age"
                  className="input"
                  type="number"
                  min={0}
                  max={120}
                  value={profile.age}
                  onChange={(e) => patch({ age: e.target.value })}
                  placeholder="Optional"
                />
              </div>
              <div className="field">
                <label htmlFor="ob-sex">Sex</label>
                <select
                  id="ob-sex"
                  className="select"
                  value={profile.sex}
                  onChange={(e) => patch({ sex: e.target.value as Sex })}
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
              <label htmlFor="ob-loc">Location</label>
              <select
                id="ob-loc"
                className="select"
                value={profile.location}
                onChange={(e) => {
                  const preset = CITY_PRESETS.find((c) => c.name === e.target.value);
                  patch({
                    location: e.target.value,
                    coords: preset ? preset.coords : undefined,
                  });
                }}
              >
                <option value="">Select a metro area</option>
                {CITY_PRESETS.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
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
                <button type="button" className="btn btn-secondary" onClick={addMed}>
                  <Icon name="plus" size={16} /> Add
                </button>
              </div>
              {profile.medications.length > 0 && (
                <div className="tag-row" style={{ marginTop: 8 }}>
                  {profile.medications.map((m) => (
                    <span className="removable-chip" key={m}>
                      {m}
                      <button
                        onClick={() =>
                          patch({ medications: profile.medications.filter((x) => x !== m) })
                        }
                        aria-label={`Remove ${m}`}
                      >
                        <Icon name="close" size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="field">
              <label>Your conditions</label>
              <p className="hint" style={{ marginTop: 0, marginBottom: 8 }}>
                Choose any conditions you have been diagnosed with.
              </p>
              <ConditionPicker
                selected={profile.conditionIds}
                onChange={(ids) => patch({ conditionIds: ids })}
              />
            </div>
          </div>
        )}
      </div>

      <div className="onboard-footer">
        {step === 0 && (
          <button className="btn btn-primary btn-block" onClick={() => setStep(1)}>
            Get started <Icon name="arrow" size={17} />
          </button>
        )}
        {step === 1 && (
          <>
            <button
              className="btn btn-primary btn-block"
              disabled={!consentReady}
              onClick={() => setStep(2)}
            >
              Continue <Icon name="arrow" size={17} />
            </button>
            {!consentReady && (
              <p className="hint center" style={{ marginTop: 8 }}>
                Accept the required items to continue.
              </p>
            )}
            <div className="center" style={{ marginTop: 10 }}>
              <button className="link-btn" onClick={() => setStep(0)}>
                Back
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <button className="btn btn-primary btn-block" onClick={finish}>
              Enter Zuuno <Icon name="arrow" size={17} />
            </button>
            <div
              className="center"
              style={{ marginTop: 10, display: 'flex', gap: 16, justifyContent: 'center' }}
            >
              <button className="link-btn" onClick={() => setStep(1)}>
                Back
              </button>
              <button className="link-btn" onClick={finish}>
                Skip for now
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
