import { describe, expect, it } from 'vitest';
import {
  buildSections,
  detectIntent,
  generateResponse,
  isDiagnosisQuery,
  isEmergencyQuery,
  matchCondition,
} from '../lib/knowledgeBase';
import { getConditionById } from '../data/conditions';

describe('matchCondition', () => {
  it('matches a condition by name', () => {
    expect(matchCondition('tell me about lupus')?.condition.id).toBe('lupus');
  });

  it('matches a condition by ICD-10 code', () => {
    expect(matchCondition('M32.9')?.condition.id).toBe('lupus');
  });

  it('matches a condition by abbreviation synonym', () => {
    expect(matchCondition('RA')?.condition.id).toBe('rheumatoid-arthritis');
  });

  it('matches a multi-word condition inside a question', () => {
    expect(matchCondition('how common is multiple sclerosis')?.condition.id).toBe(
      'multiple-sclerosis',
    );
  });

  it('returns null for unrelated text', () => {
    expect(matchCondition('what is the weather today')).toBeNull();
  });
});

describe('detectIntent', () => {
  it('detects a medications question', () => {
    expect(detectIntent('first-line medications for lupus')).toBe('medications');
  });
  it('detects a prognosis question', () => {
    expect(detectIntent('what is the prognosis of heart failure')).toBe('prognosis');
  });
  it('detects a pathophysiology question', () => {
    expect(detectIntent('what causes type 2 diabetes')).toBe('pathophysiology');
  });
  it('returns null when no section is implied', () => {
    expect(detectIntent('lupus')).toBeNull();
  });
});

describe('safety guardrails', () => {
  it('flags emergency queries', () => {
    expect(isEmergencyQuery("I have chest pain and can't breathe")).toBe(true);
    expect(isEmergencyQuery('tell me about asthma')).toBe(false);
  });

  it('flags diagnosis-seeking queries', () => {
    expect(isDiagnosisQuery('do i have lupus')).toBe(true);
    expect(isDiagnosisQuery('symptoms of lupus')).toBe(false);
  });
});

describe('generateResponse', () => {
  it('produces a structured, cited answer for a known condition', () => {
    const res = generateResponse('tell me about lupus');
    expect(res.kind).toBe('answer');
    expect(res.conditionId).toBe('lupus');
    expect(res.sections.length).toBe(7);
    expect(res.citations.length).toBeGreaterThan(0);
    expect(res.confidence).toBeGreaterThan(0.6);
    expect(res.disclaimer).toMatch(/not a substitute/i);
  });

  it('always includes citations for a condition answer', () => {
    const res = generateResponse('rheumatoid arthritis');
    expect(res.citations.length).toBeGreaterThan(0);
  });

  it('returns a guardrail for diagnosis-seeking queries', () => {
    expect(generateResponse('do i have lupus').kind).toBe('guardrail');
  });

  it('returns a guardrail for emergency queries', () => {
    expect(generateResponse('I have severe chest pain right now').kind).toBe('guardrail');
  });

  it('returns the insufficient-evidence response when nothing matches', () => {
    const res = generateResponse('qwerty zxcvb nonsense text');
    expect(res.kind).toBe('insufficient');
    expect(res.summary).toMatch(/enough evidence/i);
  });

  it('focuses the medications section for a treatment question', () => {
    const res = generateResponse('what are the first-line medications for asthma');
    expect(res.focusSectionId).toBe('medications');
  });

  it('honors an explicitly selected condition', () => {
    const res = generateResponse('what is the prognosis', { conditionId: 'epilepsy' });
    expect(res.conditionId).toBe('epilepsy');
    expect(res.focusSectionId).toBe('prognosis');
  });

  it('greets on an empty or greeting message', () => {
    expect(generateResponse('hello').kind).toBe('greeting');
  });
});

describe('buildSections', () => {
  it('marks physical findings and pathophysiology as premium', () => {
    const lupus = getConditionById('lupus');
    expect(lupus).toBeDefined();
    const sections = buildSections(lupus!);
    const premiumIds = sections.filter((s) => s.premium).map((s) => s.id);
    expect(premiumIds).toContain('findings');
    expect(premiumIds).toContain('pathophysiology');
  });
});
