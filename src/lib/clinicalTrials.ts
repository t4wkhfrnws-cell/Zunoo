import { FALLBACK_TRIALS } from '../data/trialsFallback';
import type { Trial, TrialLocation } from '../types';

// ClinicalTrials.gov API v2 client (PRD §6).
// In development a Vite proxy fronts the API; in production the public API is
// called directly. Any failure falls back to the curated trial dataset so the
// Trials tab always functions.

const API_BASE = import.meta.env.DEV ? '/ctgov' : 'https://clinicaltrials.gov/api/v2';

interface RawStudy {
  protocolSection?: {
    identificationModule?: { nctId?: string; briefTitle?: string; officialTitle?: string };
    statusModule?: {
      overallStatus?: string;
      lastUpdatePostDateStruct?: { date?: string };
    };
    sponsorCollaboratorsModule?: { leadSponsor?: { name?: string } };
    designModule?: {
      phases?: string[];
      enrollmentInfo?: { count?: number };
    };
    conditionsModule?: { conditions?: string[] };
    armsInterventionsModule?: { interventions?: Array<{ type?: string; name?: string }> };
    eligibilityModule?: {
      eligibilityCriteria?: string;
      sex?: string;
      minimumAge?: string;
      maximumAge?: string;
    };
    contactsLocationsModule?: {
      locations?: Array<{ facility?: string; city?: string; state?: string; country?: string }>;
      centralContacts?: Array<{ name?: string; phone?: string; email?: string }>;
    };
  };
}

const PHASE_LABELS: Record<string, string> = {
  EARLY_PHASE1: 'Early Phase 1',
  PHASE1: 'Phase 1',
  PHASE2: 'Phase 2',
  PHASE3: 'Phase 3',
  PHASE4: 'Phase 4',
  NA: 'N/A',
};

export function formatPhase(phases?: string[]): string {
  if (!phases || phases.length === 0) return 'N/A';
  const mapped = phases.map((p) => PHASE_LABELS[p] ?? p.replace(/_/g, ' '));
  // Collapse e.g. ["Phase 1","Phase 2"] -> "Phase 1/2".
  const numbers = mapped
    .map((m) => m.match(/Phase (\d)/)?.[1])
    .filter((n): n is string => Boolean(n));
  if (numbers.length === mapped.length && numbers.length > 1) {
    return `Phase ${numbers.join('/')}`;
  }
  return mapped.join(', ');
}

export function formatStatus(status?: string): string {
  if (!status) return 'Unknown';
  const joined = status.toLowerCase().split('_').join(' ').trim();
  if (!joined) return 'Unknown';
  return joined.charAt(0).toUpperCase() + joined.slice(1);
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Convert a raw ClinicalTrials.gov v2 study record into a Zuuno Trial. */
export function parseStudy(raw: RawStudy): Trial | null {
  const p = raw.protocolSection;
  const nctId = p?.identificationModule?.nctId;
  if (!nctId) return null;

  const locations: TrialLocation[] = (p?.contactsLocationsModule?.locations ?? [])
    .slice(0, 25)
    .map((l) => ({
      facility: l.facility ?? 'Study site',
      city: l.city ?? '',
      state: l.state ?? '',
      country: l.country ?? '',
    }));

  const contact = p?.contactsLocationsModule?.centralContacts?.[0];
  const eligibilityRaw = p?.eligibilityModule?.eligibilityCriteria ?? '';

  return {
    nctId,
    title: p?.identificationModule?.briefTitle ?? p?.identificationModule?.officialTitle ?? nctId,
    officialTitle: p?.identificationModule?.officialTitle,
    status: p?.statusModule?.overallStatus ?? 'UNKNOWN',
    phase: formatPhase(p?.designModule?.phases),
    sponsor: p?.sponsorCollaboratorsModule?.leadSponsor?.name ?? 'Not specified',
    conditions: p?.conditionsModule?.conditions ?? [],
    interventions: (p?.armsInterventionsModule?.interventions ?? [])
      .map((i) => i.name)
      .filter((n): n is string => Boolean(n)),
    eligibility: eligibilityRaw
      ? truncate(eligibilityRaw, 600)
      : 'Eligibility details are available on the study record.',
    minAge: p?.eligibilityModule?.minimumAge ?? 'N/A',
    maxAge: p?.eligibilityModule?.maximumAge ?? 'N/A',
    sex: p?.eligibilityModule?.sex ?? 'ALL',
    enrollmentCount: p?.designModule?.enrollmentInfo?.count,
    locations,
    contactName: contact?.name,
    contactPhone: contact?.phone,
    contactEmail: contact?.email,
    url: `https://clinicaltrials.gov/study/${nctId}`,
    updated: p?.statusModule?.lastUpdatePostDateStruct?.date,
    source: 'ClinicalTrials.gov',
  };
}

/** Parse a full ClinicalTrials.gov v2 response payload. */
export function parseStudies(payload: unknown): Trial[] {
  if (!payload || typeof payload !== 'object') return [];
  const studies = (payload as { studies?: RawStudy[] }).studies;
  if (!Array.isArray(studies)) return [];
  return studies
    .map(parseStudy)
    .filter((t): t is Trial => t !== null);
}

export interface TrialSearchResult {
  trials: Trial[];
  source: 'live' | 'fallback';
  message?: string;
}

function fallbackFor(condition: string): Trial[] {
  const q = condition.toLowerCase().trim();
  if (!q) return FALLBACK_TRIALS;
  const matched = FALLBACK_TRIALS.filter((t) =>
    t.conditions.some((c) => {
      const lc = c.toLowerCase();
      return lc.includes(q) || q.includes(lc) || lc.split(' ').some((w) => w.length > 3 && q.includes(w));
    }),
  );
  return matched.length > 0 ? matched : FALLBACK_TRIALS;
}

/** Search ClinicalTrials.gov for a condition, with curated fallback on failure. */
export async function searchTrials(
  condition: string,
  pageSize = 50,
): Promise<TrialSearchResult> {
  const term = condition.trim();
  if (!term) {
    return { trials: [], source: 'live' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 13000);

  try {
    const qs = new URLSearchParams({
      'query.cond': term,
      pageSize: String(pageSize),
      format: 'json',
      countTotal: 'true',
    });
    const res = await fetch(`${API_BASE}/studies?${qs.toString()}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`ClinicalTrials.gov responded ${res.status}`);
    const payload = await res.json();
    const trials = parseStudies(payload);
    return { trials, source: 'live' };
  } catch {
    return {
      trials: fallbackFor(term),
      source: 'fallback',
      message:
        'Showing curated reference trials — the live ClinicalTrials.gov feed could not be reached.',
    };
  } finally {
    clearTimeout(timeout);
  }
}

export const ENROLLMENT_STATUSES = [
  'RECRUITING',
  'NOT_YET_RECRUITING',
  'ENROLLING_BY_INVITATION',
  'ACTIVE_NOT_RECRUITING',
  'COMPLETED',
  'SUSPENDED',
  'TERMINATED',
  'WITHDRAWN',
];
