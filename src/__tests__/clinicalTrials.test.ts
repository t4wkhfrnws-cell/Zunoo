import { describe, expect, it } from 'vitest';
import { formatPhase, formatStatus, parseStudies, parseStudy } from '../lib/clinicalTrials';

const SAMPLE_PAYLOAD = {
  studies: [
    {
      protocolSection: {
        identificationModule: {
          nctId: 'NCT01234567',
          briefTitle: 'A Study of an Investigational Therapy in Lupus',
          officialTitle: 'A Phase 3 Randomized Study of an Investigational Therapy in SLE',
        },
        statusModule: {
          overallStatus: 'RECRUITING',
          lastUpdatePostDateStruct: { date: '2026-02-10' },
        },
        sponsorCollaboratorsModule: { leadSponsor: { name: 'Example Research Network' } },
        designModule: { phases: ['PHASE3'], enrollmentInfo: { count: 240 } },
        conditionsModule: { conditions: ['Systemic Lupus Erythematosus'] },
        armsInterventionsModule: {
          interventions: [
            { type: 'DRUG', name: 'Investigational therapy' },
            { type: 'DRUG', name: 'Placebo' },
          ],
        },
        eligibilityModule: {
          eligibilityCriteria: 'Adults aged 18 years or older with active disease.',
          sex: 'ALL',
          minimumAge: '18 Years',
          maximumAge: '75 Years',
        },
        contactsLocationsModule: {
          locations: [
            { facility: 'University Center', city: 'New York', state: 'NY', country: 'United States' },
          ],
          centralContacts: [
            { name: 'Trial Office', phone: '(800) 555-0000', email: 'office@example.org' },
          ],
        },
      },
    },
    // Missing identification module → must be skipped, not crash.
    { protocolSection: {} },
  ],
};

describe('parseStudy', () => {
  it('converts a raw v2 study record into a Trial', () => {
    const trial = parseStudy(SAMPLE_PAYLOAD.studies[0]);
    expect(trial).not.toBeNull();
    expect(trial?.nctId).toBe('NCT01234567');
    expect(trial?.status).toBe('RECRUITING');
    expect(trial?.phase).toBe('Phase 3');
    expect(trial?.sponsor).toBe('Example Research Network');
    expect(trial?.interventions).toEqual(['Investigational therapy', 'Placebo']);
    expect(trial?.enrollmentCount).toBe(240);
    expect(trial?.locations).toHaveLength(1);
    expect(trial?.url).toContain('NCT01234567');
    expect(trial?.source).toBe('ClinicalTrials.gov');
  });

  it('returns null when the NCT id is missing', () => {
    expect(parseStudy(SAMPLE_PAYLOAD.studies[1])).toBeNull();
  });
});

describe('parseStudies', () => {
  it('parses a full payload and drops invalid records', () => {
    expect(parseStudies(SAMPLE_PAYLOAD)).toHaveLength(1);
  });

  it('handles malformed payloads gracefully', () => {
    expect(parseStudies(null)).toEqual([]);
    expect(parseStudies({})).toEqual([]);
    expect(parseStudies({ studies: 'not-an-array' })).toEqual([]);
  });
});

describe('formatPhase', () => {
  it('formats a single phase', () => {
    expect(formatPhase(['PHASE3'])).toBe('Phase 3');
  });
  it('collapses multiple numeric phases', () => {
    expect(formatPhase(['PHASE1', 'PHASE2'])).toBe('Phase 1/2');
  });
  it('returns N/A when no phase is present', () => {
    expect(formatPhase(undefined)).toBe('N/A');
    expect(formatPhase([])).toBe('N/A');
    expect(formatPhase(['NA'])).toBe('N/A');
  });
});

describe('formatStatus', () => {
  it('formats enrollment statuses for display', () => {
    expect(formatStatus('RECRUITING')).toBe('Recruiting');
    expect(formatStatus('ACTIVE_NOT_RECRUITING')).toBe('Active not recruiting');
    expect(formatStatus('ENROLLING_BY_INVITATION')).toBe('Enrolling by invitation');
    expect(formatStatus(undefined)).toBe('Unknown');
  });
});
