import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type {
  Accessibility,
  ChatMessage,
  ConsentSettings,
  SavedTrial,
  TabId,
  Trial,
  UserProfile,
} from '../types';
import { STORAGE_KEYS, clearAll, exportAll, load, save } from '../lib/storage';

const EMPTY_PROFILE: UserProfile = {
  displayName: '',
  age: '',
  sex: '',
  conditionIds: [],
  medications: [],
  location: '',
};

const DEFAULT_A11Y: Accessibility = {
  highContrast: false,
  fontScale: 1,
  reduceMotion: false,
};

const TRANSCRIPT_LIMIT = 80;

interface AppContextValue {
  // Lifecycle
  onboarded: boolean;
  completeOnboarding: (profile: UserProfile, consent: ConsentSettings) => void;
  // Profile & consent
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  consent: ConsentSettings | null;
  updateConsent: (patch: Partial<ConsentSettings>) => void;
  // Premium
  premium: boolean;
  setPremium: (value: boolean) => void;
  // Navigation
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  focusConditionId: string | null;
  setFocusCondition: (id: string | null) => void;
  // Saved items
  savedTrials: SavedTrial[];
  isTrialSaved: (nctId: string) => boolean;
  toggleSaveTrial: (trial: Trial) => void;
  toggleTrialAlert: (nctId: string) => void;
  savedProviders: string[];
  isProviderSaved: (id: string) => boolean;
  toggleSaveProvider: (id: string) => void;
  // Chat transcripts
  transcripts: ChatMessage[];
  addTranscript: (message: ChatMessage) => void;
  clearTranscripts: () => void;
  // Accessibility
  accessibility: Accessibility;
  updateAccessibility: (patch: Partial<Accessibility>) => void;
  // Account
  exportAccountData: () => Record<string, unknown>;
  deleteAccount: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [onboarded, setOnboarded] = useState<boolean>(() =>
    load(STORAGE_KEYS.onboarded, false),
  );
  const [profile, setProfile] = useState<UserProfile>(() =>
    load(STORAGE_KEYS.profile, EMPTY_PROFILE),
  );
  const [consent, setConsent] = useState<ConsentSettings | null>(() =>
    load<ConsentSettings | null>(STORAGE_KEYS.consent, null),
  );
  const [premium, setPremiumState] = useState<boolean>(() =>
    load(STORAGE_KEYS.premium, false),
  );
  const [savedTrials, setSavedTrials] = useState<SavedTrial[]>(() =>
    load<SavedTrial[]>(STORAGE_KEYS.savedTrials, []),
  );
  const [savedProviders, setSavedProviders] = useState<string[]>(() =>
    load<string[]>(STORAGE_KEYS.savedProviders, []),
  );
  const [transcripts, setTranscripts] = useState<ChatMessage[]>(() =>
    load<ChatMessage[]>(STORAGE_KEYS.transcripts, []),
  );
  const [accessibility, setAccessibility] = useState<Accessibility>(() =>
    load(STORAGE_KEYS.accessibility, DEFAULT_A11Y),
  );

  const [activeTab, setActiveTab] = useState<TabId>('chatbot');
  const [focusConditionId, setFocusConditionId] = useState<string | null>(
    () => load<UserProfile>(STORAGE_KEYS.profile, EMPTY_PROFILE).conditionIds[0] ?? null,
  );

  // ---- Persistence ----
  useEffect(() => save(STORAGE_KEYS.onboarded, onboarded), [onboarded]);
  useEffect(() => save(STORAGE_KEYS.profile, profile), [profile]);
  useEffect(() => save(STORAGE_KEYS.consent, consent), [consent]);
  useEffect(() => save(STORAGE_KEYS.premium, premium), [premium]);
  useEffect(() => save(STORAGE_KEYS.savedTrials, savedTrials), [savedTrials]);
  useEffect(() => save(STORAGE_KEYS.savedProviders, savedProviders), [savedProviders]);
  useEffect(() => save(STORAGE_KEYS.transcripts, transcripts), [transcripts]);
  useEffect(() => save(STORAGE_KEYS.accessibility, accessibility), [accessibility]);

  // ---- Apply accessibility settings to the document ----
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.contrast = accessibility.highContrast ? 'high' : 'normal';
    root.dataset.motion = accessibility.reduceMotion ? 'reduced' : 'full';
    root.style.setProperty('--font-scale', String(accessibility.fontScale));
  }, [accessibility]);

  // ---- Actions ----
  const completeOnboarding = useCallback(
    (nextProfile: UserProfile, nextConsent: ConsentSettings) => {
      setProfile(nextProfile);
      setConsent(nextConsent);
      setOnboarded(true);
      setFocusConditionId(nextProfile.conditionIds[0] ?? null);
    },
    [],
  );

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...patch };
      setFocusConditionId((current) => {
        if (current && next.conditionIds.includes(current)) return current;
        return next.conditionIds[0] ?? current ?? null;
      });
      return next;
    });
  }, []);

  const updateConsent = useCallback((patch: Partial<ConsentSettings>) => {
    setConsent((prev) => ({
      dataProcessing: prev?.dataProcessing ?? false,
      locationAccess: prev?.locationAccess ?? false,
      medicalDisclaimer: prev?.medicalDisclaimer ?? false,
      acceptedAt: prev?.acceptedAt ?? new Date().toISOString(),
      ...patch,
    }));
  }, []);

  const setPremium = useCallback((value: boolean) => setPremiumState(value), []);

  const isTrialSaved = useCallback(
    (nctId: string) => savedTrials.some((s) => s.trial.nctId === nctId),
    [savedTrials],
  );

  const toggleSaveTrial = useCallback((trial: Trial) => {
    setSavedTrials((prev) => {
      if (prev.some((s) => s.trial.nctId === trial.nctId)) {
        return prev.filter((s) => s.trial.nctId !== trial.nctId);
      }
      return [
        { trial, savedAt: new Date().toISOString(), alertsEnabled: false },
        ...prev,
      ];
    });
  }, []);

  const toggleTrialAlert = useCallback((nctId: string) => {
    setSavedTrials((prev) =>
      prev.map((s) =>
        s.trial.nctId === nctId ? { ...s, alertsEnabled: !s.alertsEnabled } : s,
      ),
    );
  }, []);

  const isProviderSaved = useCallback(
    (id: string) => savedProviders.includes(id),
    [savedProviders],
  );

  const toggleSaveProvider = useCallback((id: string) => {
    setSavedProviders((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [id, ...prev],
    );
  }, []);

  const addTranscript = useCallback((message: ChatMessage) => {
    setTranscripts((prev) => [...prev, message].slice(-TRANSCRIPT_LIMIT));
  }, []);

  const clearTranscripts = useCallback(() => setTranscripts([]), []);

  const updateAccessibility = useCallback((patch: Partial<Accessibility>) => {
    setAccessibility((prev) => ({ ...prev, ...patch }));
  }, []);

  const setFocusCondition = useCallback((id: string | null) => {
    setFocusConditionId(id);
  }, []);

  const exportAccountData = useCallback(() => exportAll(), []);

  const deleteAccount = useCallback(() => {
    clearAll();
    setOnboarded(false);
    setProfile(EMPTY_PROFILE);
    setConsent(null);
    setPremiumState(false);
    setSavedTrials([]);
    setSavedProviders([]);
    setTranscripts([]);
    setAccessibility(DEFAULT_A11Y);
    setActiveTab('chatbot');
    setFocusConditionId(null);
  }, []);

  const value = useMemo<AppContextValue>(
    () => ({
      onboarded,
      completeOnboarding,
      profile,
      updateProfile,
      consent,
      updateConsent,
      premium,
      setPremium,
      activeTab,
      setActiveTab,
      focusConditionId,
      setFocusCondition,
      savedTrials,
      isTrialSaved,
      toggleSaveTrial,
      toggleTrialAlert,
      savedProviders,
      isProviderSaved,
      toggleSaveProvider,
      transcripts,
      addTranscript,
      clearTranscripts,
      accessibility,
      updateAccessibility,
      exportAccountData,
      deleteAccount,
    }),
    [
      onboarded,
      completeOnboarding,
      profile,
      updateProfile,
      consent,
      updateConsent,
      premium,
      setPremium,
      activeTab,
      focusConditionId,
      setFocusCondition,
      savedTrials,
      isTrialSaved,
      toggleSaveTrial,
      toggleTrialAlert,
      savedProviders,
      isProviderSaved,
      toggleSaveProvider,
      transcripts,
      addTranscript,
      clearTranscripts,
      accessibility,
      updateAccessibility,
      exportAccountData,
      deleteAccount,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
