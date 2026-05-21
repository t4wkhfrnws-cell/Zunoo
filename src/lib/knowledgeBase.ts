import { CONDITIONS, getConditionById } from '../data/conditions';
import {
  INSUFFICIENT_EVIDENCE,
  MEDICAL_DISCLAIMER,
  type ChatResponse,
  type Condition,
  type StructuredSection,
  type UserProfile,
} from '../types';

// Zuuno chatbot engine.
// A deterministic retrieval layer over the curated condition knowledge base:
// it matches a free-text query to a condition, detects the section the user
// is asking about, applies clinical guardrails, and assembles a structured,
// cited response. It never fabricates content beyond the curated database.

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'of', 'for', 'and', 'or', 'to', 'in', 'on', 'with', 'about',
  'what', 'is', 'are', 'how', 'do', 'does', 'my', 'me', 'i', 'tell', 'can', 'you',
  'please', 'whats', 'have', 'has', 'this', 'that', 'it', 'symptoms', 'treatment',
]);

export interface ConditionMatch {
  condition: Condition;
  score: number;
}

/** Match free text against the condition database (name, synonyms, ICD-10). */
export function matchCondition(query: string): ConditionMatch | null {
  const q = normalize(query);
  if (!q) return null;

  let best: ConditionMatch | null = null;

  for (const condition of CONDITIONS) {
    let score = 0;
    const terms = [
      normalize(condition.name),
      normalize(condition.icd10),
      ...condition.synonyms.map(normalize),
    ].filter(Boolean);

    for (const term of terms) {
      if (q === term) {
        score = Math.max(score, 1);
      } else if (term.length >= 3 && q.includes(term)) {
        score = Math.max(score, 0.92);
      } else if (q.length >= 4 && term.includes(q)) {
        score = Math.max(score, 0.74);
      }
    }

    // Token-overlap scoring for partial / reworded queries.
    const queryTokens = q.split(' ').filter((w) => w.length > 2 && !STOP_WORDS.has(w));
    const conditionTokens = new Set(
      [normalize(condition.name), ...condition.synonyms.map(normalize)]
        .join(' ')
        .split(' ')
        .filter((w) => w.length > 2),
    );
    if (queryTokens.length > 0) {
      let overlap = 0;
      for (const token of queryTokens) {
        if (conditionTokens.has(token)) overlap += 1;
      }
      const ratio = overlap / queryTokens.length;
      if (overlap > 0) {
        score = Math.max(score, 0.5 + ratio * 0.4);
      }
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { condition, score };
    }
  }

  return best && best.score >= 0.45 ? best : null;
}

export type IntentSection =
  | 'symptoms'
  | 'findings'
  | 'medications'
  | 'epidemiology'
  | 'prognosis'
  | 'pathophysiology'
  | 'redflags';

const INTENT_KEYWORDS: Record<IntentSection, string[]> = {
  symptoms: ['symptom', 'sign', 'feel', 'present', 'presentation', 'experience'],
  findings: ['physical', 'exam', 'examination', 'finding', 'on exam'],
  medications: [
    'medication', 'medicine', 'drug', 'treat', 'treatment', 'therapy', 'manage',
    'management', 'cure', 'prescription', 'first line', 'second line', 'biologic',
  ],
  epidemiology: [
    'epidemiology', 'common', 'prevalence', 'incidence', 'who gets', 'risk factor',
    'how many', 'demographic', 'statistics',
  ],
  prognosis: [
    'prognosis', 'outlook', 'life expectancy', 'survival', 'outcome', 'long term',
    'fatal', 'die', 'progression',
  ],
  pathophysiology: [
    'pathophysiology', 'cause', 'mechanism', 'why', 'how does', 'pathogenesis',
    'what happens', 'biology',
  ],
  redflags: [
    'red flag', 'emergency', 'urgent', 'when to', 'serious', 'warning sign',
    'dangerous', 'worry',
  ],
};

/** Detect which structured section the user is asking about, if any. */
export function detectIntent(query: string): IntentSection | null {
  const q = normalize(query);
  for (const section of Object.keys(INTENT_KEYWORDS) as IntentSection[]) {
    for (const keyword of INTENT_KEYWORDS[section]) {
      if (q.includes(keyword)) return section;
    }
  }
  return null;
}

const DIAGNOSIS_PATTERNS = [
  'do i have', 'do you think i have', 'am i having', 'could i have', 'could it be',
  'diagnose me', 'what is wrong with me', 'whats wrong with me', 'what do i have',
  'is it serious', 'should i be worried', 'is this cancer',
];

const DOSING_PATTERNS = [
  'what dose', 'what dosage', 'how much should i take', 'how many mg',
  'how many milligrams', 'should i take', 'can i stop taking', 'should i stop taking',
  'is it safe for me to take', 'prescribe me',
];

const EMERGENCY_PATTERNS = [
  'suicidal', 'suicide', 'kill myself', 'overdose', 'overdosed', '911',
  'unconscious', 'not breathing', "can't breathe", 'cant breathe',
];

const FIRST_PERSON = ['i have', "i'm having", 'im having', 'i am having', 'help me', 'right now'];
const ACUTE_SYMPTOMS = [
  'chest pain', "can't breathe", 'cant breathe', 'severe bleeding', 'passing out',
  'fainting', 'worst headache', 'face drooping', 'slurred speech',
];

export function isEmergencyQuery(query: string): boolean {
  const q = normalize(query);
  if (EMERGENCY_PATTERNS.some((p) => q.includes(normalize(p)))) return true;
  const firstPerson = FIRST_PERSON.some((p) => q.includes(normalize(p)));
  const acute = ACUTE_SYMPTOMS.some((p) => q.includes(normalize(p)));
  return firstPerson && acute;
}

export function isDiagnosisQuery(query: string): boolean {
  const q = normalize(query);
  return DIAGNOSIS_PATTERNS.some((p) => q.includes(normalize(p)));
}

export function isDosingQuery(query: string): boolean {
  const q = normalize(query);
  return DOSING_PATTERNS.some((p) => q.includes(normalize(p)));
}

const GREETING_PATTERNS = ['hi', 'hello', 'hey', 'help', 'start', 'what can you do', 'who are you'];

export function isGreeting(query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  if (q.split(' ').length <= 3 && GREETING_PATTERNS.includes(q)) return true;
  return GREETING_PATTERNS.some((p) => q === p);
}

const SECTION_TITLES: Record<IntentSection, string> = {
  symptoms: 'Symptoms & Signs',
  findings: 'Physical Findings',
  medications: 'Medications',
  epidemiology: 'Epidemiology & Demographics',
  prognosis: 'Prognosis',
  pathophysiology: 'Pathophysiology',
  redflags: 'When to Seek Urgent Care',
};

/** Build the structured sections that make up a condition answer. */
export function buildSections(condition: Condition): StructuredSection[] {
  return [
    {
      id: 'symptoms',
      title: SECTION_TITLES.symptoms,
      icon: 'symptoms',
      kind: 'bullets',
      bullets: condition.symptoms,
    },
    {
      id: 'findings',
      title: SECTION_TITLES.findings,
      icon: 'findings',
      kind: 'bullets',
      bullets: condition.physicalFindings,
      premium: true,
    },
    {
      id: 'medications',
      title: SECTION_TITLES.medications,
      icon: 'medications',
      kind: 'medications',
      medications: condition.medications,
    },
    {
      id: 'epidemiology',
      title: SECTION_TITLES.epidemiology,
      icon: 'epidemiology',
      kind: 'bullets',
      bullets: condition.epidemiology,
    },
    {
      id: 'prognosis',
      title: SECTION_TITLES.prognosis,
      icon: 'prognosis',
      kind: 'text',
      text: condition.prognosis,
    },
    {
      id: 'pathophysiology',
      title: SECTION_TITLES.pathophysiology,
      icon: 'pathophysiology',
      kind: 'diagram',
      diagram: condition.pathophysiology,
      premium: true,
    },
    {
      id: 'redflags',
      title: SECTION_TITLES.redflags,
      icon: 'redflags',
      kind: 'bullets',
      bullets: condition.redFlags,
    },
  ];
}

export interface GenerateOptions {
  conditionId?: string;
  profile?: UserProfile;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Produce a structured, cited chatbot response for a query. */
export function generateResponse(query: string, options: GenerateOptions = {}): ChatResponse {
  const trimmed = query.trim();

  // Emergency safety guardrail takes precedence.
  if (isEmergencyQuery(trimmed)) {
    return {
      kind: 'guardrail',
      summary:
        'This may describe a medical emergency. Zuuno cannot help in an emergency.',
      sections: [
        {
          id: 'emergency',
          title: 'Get Emergency Help Now',
          icon: 'redflags',
          kind: 'bullets',
          bullets: [
            'Call your local emergency number (911 in the U.S.) or go to the nearest emergency department.',
            'If you are in the U.S. and in crisis, call or text 988 to reach the Suicide & Crisis Lifeline.',
            'Do not wait for an online response — contact emergency services immediately.',
          ],
        },
      ],
      citations: [],
      confidence: 1,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Resolve the target condition: explicit selection wins over text matching.
  const selected = options.conditionId ? getConditionById(options.conditionId) : undefined;
  const textMatch = matchCondition(trimmed);
  const condition = selected ?? textMatch?.condition;

  // Diagnosis-seeking guardrail (only when no clear educational target).
  if (isDiagnosisQuery(trimmed)) {
    return {
      kind: 'guardrail',
      conditionId: condition?.id,
      conditionName: condition?.name,
      summary:
        'Zuuno does not diagnose conditions. A diagnosis requires evaluation by a licensed clinician.',
      sections: [
        {
          id: 'guardrail',
          title: 'Why Zuuno Cannot Answer This',
          icon: 'redflags',
          kind: 'bullets',
          bullets: [
            'Zuuno provides evidence-based education for conditions you already know you have — it cannot diagnose.',
            'Diagnosis depends on a clinical history, physical examination, and testing that an online tool cannot perform.',
            condition
              ? `If you would like to learn about ${condition.name}, ask an educational question such as "symptoms of ${condition.name}".`
              : 'Please consult a licensed healthcare professional for an evaluation.',
          ],
        },
      ],
      citations: [],
      confidence: 1,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Greeting / capability query.
  if (!condition && isGreeting(trimmed)) {
    return {
      kind: 'greeting',
      summary:
        'Hello — I am the Zuuno medical assistant. I provide evidence-based, cited information about conditions you already know you have.',
      sections: [
        {
          id: 'capabilities',
          title: 'How I Can Help',
          icon: 'symptoms',
          kind: 'bullets',
          bullets: [
            'Ask about a condition by name or ICD-10 code (for example, "lupus" or "M32.9").',
            'Ask focused questions such as "first-line medications for rheumatoid arthritis".',
            'Every answer includes structured sections, an interactive pathophysiology diagram, and citations.',
            'Use the condition selector below the message box to personalize the whole app.',
          ],
        },
      ],
      citations: [],
      confidence: 1,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // No condition could be identified — insufficient evidence guardrail.
  if (!condition) {
    return {
      kind: 'insufficient',
      summary: INSUFFICIENT_EVIDENCE,
      sections: [
        {
          id: 'insufficient',
          title: 'Try Rephrasing Your Question',
          icon: 'symptoms',
          kind: 'bullets',
          bullets: [
            'Zuuno covers a curated set of chronic and rare conditions.',
            'Name a specific condition, for example "Crohn\'s disease" or "atrial fibrillation".',
            'You can also choose a condition from the selector to browse its full profile.',
          ],
        },
      ],
      citations: [],
      confidence: 0.2,
      disclaimer: MEDICAL_DISCLAIMER,
    };
  }

  // Build a full structured answer.
  const intent = detectIntent(trimmed);
  let focusSectionId: string | undefined;
  if (intent === 'medications' || isDosingQuery(trimmed)) {
    focusSectionId = 'medications';
  } else if (intent) {
    focusSectionId = intent;
  }

  const baseScore = selected ? 0.95 : textMatch ? textMatch.score : 0.6;
  const confidence = round2(Math.min(0.98, Math.max(0.62, baseScore)));

  let summary = condition.summary;
  if (isDosingQuery(trimmed)) {
    summary = `${condition.summary} The medication classes below are educational reference only — Zuuno does not provide personal dosing or prescriptions.`;
  } else if (focusSectionId) {
    summary = `${condition.summary} Your question has been highlighted in the ${
      SECTION_TITLES[(focusSectionId as IntentSection)] ?? 'relevant'
    } section below.`;
  }

  return {
    kind: 'answer',
    conditionId: condition.id,
    conditionName: condition.name,
    icd10: condition.icd10,
    summary,
    sections: buildSections(condition),
    citations: condition.citations,
    confidence,
    focusSectionId,
    disclaimer: MEDICAL_DISCLAIMER,
  };
}

/** Curated example prompts shown in the empty chatbot state. */
export const SUGGESTED_PROMPTS: string[] = [
  'Tell me about systemic lupus erythematosus',
  'First-line medications for rheumatoid arthritis',
  'What is the prognosis of heart failure?',
  'Pathophysiology of type 2 diabetes',
  'Epidemiology of multiple sclerosis',
  "Symptoms of Crohn's disease",
];
