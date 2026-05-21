// Zuuno — shared data models.
// These mirror the Data Models section of the Zuuno PRD.

export type Coords = { lat: number; lng: number };

export type Sex = 'female' | 'male' | 'intersex' | 'prefer-not-to-say';

export type ConditionCategory =
  | 'Rheumatology'
  | 'Endocrinology'
  | 'Neurology'
  | 'Gastroenterology'
  | 'Cardiology'
  | 'Pulmonology'
  | 'Nephrology'
  | 'Hematology'
  | 'Dermatology'
  | 'Genetic';

export interface Citation {
  id: string;
  type: 'textbook' | 'journal' | 'guideline';
  reference: string;
  detail?: string;
  year?: number;
}

export interface DiagramNode {
  id: string;
  label: string;
  detail: string;
  kind: 'trigger' | 'mechanism' | 'effect' | 'outcome';
}

export interface Pathophysiology {
  overview: string;
  steps: DiagramNode[];
}

export interface Medications {
  firstLine: string[];
  secondLine: string[];
  monitoring: string[];
}

export interface Condition {
  id: string;
  name: string;
  icd10: string;
  synonyms: string[];
  category: ConditionCategory;
  summary: string;
  symptoms: string[];
  physicalFindings: string[];
  medications: Medications;
  epidemiology: string[];
  prognosis: string;
  pathophysiology: Pathophysiology;
  redFlags: string[];
  citations: Citation[];
  specialties: string[];
  infusionSpecialty?: string;
  trialQuery: string;
  resourceTags: string[];
}

export interface UserProfile {
  displayName: string;
  age: string;
  sex: Sex | '';
  conditionIds: string[];
  medications: string[];
  location: string;
  coords?: Coords;
}

export interface ConsentSettings {
  dataProcessing: boolean;
  locationAccess: boolean;
  medicalDisclaimer: boolean;
  acceptedAt: string;
}

export interface Provider {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  npi: string;
  conditionsFocus: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  coords: Coords;
  phone: string;
  website?: string;
  insurance: string[];
  telehealth: boolean;
  languages: string[];
  gender: 'female' | 'male';
  acceptingNewPatients: boolean;
  rating: number;
}

export type PharmacyKind = 'retail' | 'online' | 'specialty' | 'compounding' | 'infusion';

export interface Pharmacy {
  id: string;
  name: string;
  chain: string;
  kind: PharmacyKind;
  address: string;
  city: string;
  state: string;
  zip: string;
  coords: Coords;
  phone: string;
  website?: string;
  orderUrl?: string;
  hours: string;
  open24h: boolean;
  services: string[];
  infusionSpecialties: string[];
  deliveryAvailable: boolean;
}

export interface TrialLocation {
  facility: string;
  city: string;
  state: string;
  country: string;
}

export interface Trial {
  nctId: string;
  title: string;
  officialTitle?: string;
  status: string;
  phase: string;
  sponsor: string;
  conditions: string[];
  interventions: string[];
  eligibility: string;
  minAge: string;
  maxAge: string;
  sex: string;
  enrollmentCount?: number;
  locations: TrialLocation[];
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  url: string;
  updated?: string;
  source: 'ClinicalTrials.gov' | 'Curated';
}

export interface SavedTrial {
  trial: Trial;
  savedAt: string;
  alertsEnabled: boolean;
}

export type ResourceCategory =
  | 'Nonprofit & Advocacy'
  | 'Patient Education'
  | 'Peer Support'
  | 'Financial Aid'
  | 'Clinical Guidelines';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  website: string;
  phone?: string;
  email?: string;
  tags: string[];
  national: boolean;
}

export type ChatRole = 'user' | 'assistant';

export interface StructuredSection {
  id: string;
  title: string;
  icon: string;
  kind: 'bullets' | 'text' | 'medications' | 'diagram';
  bullets?: string[];
  text?: string;
  medications?: Medications;
  diagram?: Pathophysiology;
  premium?: boolean;
}

export type ChatResponseKind = 'answer' | 'guardrail' | 'insufficient' | 'greeting';

export interface ChatResponse {
  kind: ChatResponseKind;
  conditionId?: string;
  conditionName?: string;
  icd10?: string;
  summary: string;
  sections: StructuredSection[];
  citations: Citation[];
  confidence: number;
  focusSectionId?: string;
  disclaimer: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text: string;
  response?: ChatResponse;
  timestamp: string;
}

export interface Accessibility {
  highContrast: boolean;
  fontScale: number;
  reduceMotion: boolean;
}

export type TabId = 'chatbot' | 'providers' | 'pharmacy' | 'trials' | 'research';

export const MEDICAL_DISCLAIMER =
  'This app is not a substitute for medical advice. Consult a licensed provider.';

export const INSUFFICIENT_EVIDENCE =
  "I don't have enough evidence to answer that. Please consult a healthcare professional.";
