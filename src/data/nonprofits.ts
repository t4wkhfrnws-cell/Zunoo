import type { Resource } from '../types';

// Curated directory of nonprofits, advocacy groups, patient-education hubs,
// peer-support communities, clinical-guideline bodies, and financial-aid
// programs (PRD §7). Websites point to established national organizations.

export const RESOURCES: Resource[] = [
  // ---- Nonprofit & Advocacy (condition-specific) ----
  {
    id: 'res-lupus',
    name: 'Lupus Foundation of America',
    category: 'Nonprofit & Advocacy',
    description:
      'National advocacy and research organization offering education, support programs, and a health-information helpline for people affected by lupus.',
    website: 'https://www.lupus.org',
    tags: ['lupus', 'autoimmune'],
    national: true,
  },
  {
    id: 'res-arthritis',
    name: 'Arthritis Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Resources, advocacy, and community programs for all forms of arthritis, including rheumatoid, psoriatic, and ankylosing spondylitis.',
    website: 'https://www.arthritis.org',
    tags: ['rheumatoid arthritis', 'arthritis', 'psoriatic arthritis', 'ankylosing spondylitis', 'autoimmune'],
    national: true,
  },
  {
    id: 'res-ada',
    name: 'American Diabetes Association',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, advocacy, and research funding for people living with type 1 and type 2 diabetes, plus practical day-to-day management guidance.',
    website: 'https://www.diabetes.org',
    tags: ['diabetes', 'type 1 diabetes', 'type 2 diabetes', 'endocrinology'],
    national: true,
  },
  {
    id: 'res-jdrf',
    name: 'JDRF / Breakthrough T1D',
    category: 'Nonprofit & Advocacy',
    description:
      'Leading global organization funding type 1 diabetes research and providing newly-diagnosed support resources and advocacy.',
    website: 'https://www.jdrf.org',
    tags: ['type 1 diabetes', 'diabetes', 'autoimmune'],
    national: true,
  },
  {
    id: 'res-nmss',
    name: 'National Multiple Sclerosis Society',
    category: 'Nonprofit & Advocacy',
    description:
      'Support navigators, education, financial guidance, and research funding for people living with multiple sclerosis.',
    website: 'https://www.nationalmssociety.org',
    tags: ['multiple sclerosis', 'neurology'],
    national: true,
  },
  {
    id: 'res-ccf',
    name: "Crohn's & Colitis Foundation",
    category: 'Nonprofit & Advocacy',
    description:
      'Education, local chapters, and research funding for inflammatory bowel disease, including Crohn’s disease and ulcerative colitis.',
    website: 'https://www.crohnscolitisfoundation.org',
    tags: ['crohns disease', 'ulcerative colitis', 'ibd', 'gastroenterology'],
    national: true,
  },
  {
    id: 'res-npf',
    name: 'National Psoriasis Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Patient navigation, treatment information, and advocacy for psoriasis and psoriatic arthritis.',
    website: 'https://www.psoriasis.org',
    tags: ['psoriasis', 'psoriatic arthritis', 'dermatology'],
    national: true,
  },
  {
    id: 'res-aafa',
    name: 'Asthma and Allergy Foundation of America',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, support, and advocacy for people with asthma and allergic conditions, including action-plan resources.',
    website: 'https://www.aafa.org',
    tags: ['asthma', 'allergy', 'respiratory'],
    national: true,
  },
  {
    id: 'res-copd',
    name: 'COPD Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, a patient-powered research network, and a community line for people living with COPD and their caregivers.',
    website: 'https://www.copdfoundation.org',
    tags: ['copd', 'respiratory', 'pulmonology'],
    national: true,
  },
  {
    id: 'res-aha',
    name: 'American Heart Association',
    category: 'Nonprofit & Advocacy',
    description:
      'Patient education and support for cardiovascular conditions, including heart failure, atrial fibrillation, and high blood pressure.',
    website: 'https://www.heart.org',
    tags: ['heart failure', 'atrial fibrillation', 'hypertension', 'cardiovascular'],
    national: true,
  },
  {
    id: 'res-lung',
    name: 'American Lung Association',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, support programs, and a Lung HelpLine for asthma, COPD, cystic fibrosis, and other respiratory conditions.',
    website: 'https://www.lung.org',
    tags: ['asthma', 'copd', 'cystic fibrosis', 'respiratory'],
    national: true,
  },
  {
    id: 'res-amf',
    name: 'American Migraine Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Trusted migraine education, a doctor-finder tool, and community resources backed by headache specialists.',
    website: 'https://americanmigrainefoundation.org',
    tags: ['migraine', 'headache', 'neurology'],
    national: true,
  },
  {
    id: 'res-epilepsy',
    name: 'Epilepsy Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'A 24/7 helpline, seizure first-aid training, and advocacy for people affected by epilepsy.',
    website: 'https://www.epilepsy.com',
    tags: ['epilepsy', 'seizures', 'neurology'],
    national: true,
  },
  {
    id: 'res-parkinson',
    name: "Parkinson's Foundation",
    category: 'Nonprofit & Advocacy',
    description:
      'A helpline, care resources, and research funding to improve care and advance research in Parkinson’s disease.',
    website: 'https://www.parkinson.org',
    tags: ['parkinsons disease', 'neurology', 'movement disorder'],
    national: true,
  },
  {
    id: 'res-mjff',
    name: 'The Michael J. Fox Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'The largest nonprofit funder of Parkinson’s research, with patient resources and clinical-trial matching.',
    website: 'https://www.michaeljfox.org',
    tags: ['parkinsons disease', 'neurology'],
    national: true,
  },
  {
    id: 'res-ata',
    name: 'American Thyroid Association',
    category: 'Nonprofit & Advocacy',
    description:
      'Patient education on thyroid conditions, including hypothyroidism, with clinician-reviewed guidance.',
    website: 'https://www.thyroid.org',
    tags: ['hypothyroidism', 'thyroid', 'endocrinology'],
    national: true,
  },
  {
    id: 'res-kidney',
    name: 'National Kidney Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, a patient helpline, and support programs for chronic kidney disease and kidney health.',
    website: 'https://www.kidney.org',
    tags: ['chronic kidney disease', 'kidney', 'nephrology'],
    national: true,
  },
  {
    id: 'res-scd',
    name: 'Sickle Cell Disease Association of America',
    category: 'Nonprofit & Advocacy',
    description:
      'Advocacy, education, and member organizations supporting individuals and families affected by sickle cell disease.',
    website: 'https://www.sicklecelldisease.org',
    tags: ['sickle cell disease', 'hematology', 'blood disorder'],
    national: true,
  },
  {
    id: 'res-bleeding',
    name: 'National Bleeding Disorders Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, advocacy, and chapter support for people with hemophilia and other inheritable bleeding disorders.',
    website: 'https://www.bleeding.org',
    tags: ['hemophilia', 'bleeding disorder', 'hematology'],
    national: true,
  },
  {
    id: 'res-cff',
    name: 'Cystic Fibrosis Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Accredited care-center network, education, and research funding for the cystic fibrosis community.',
    website: 'https://www.cff.org',
    tags: ['cystic fibrosis', 'respiratory', 'genetic'],
    national: true,
  },
  {
    id: 'res-spondylitis',
    name: 'Spondylitis Association of America',
    category: 'Nonprofit & Advocacy',
    description:
      'Education, exercise resources, and support specifically for ankylosing spondylitis and axial spondyloarthritis.',
    website: 'https://spondylitis.org',
    tags: ['ankylosing spondylitis', 'arthritis', 'rheumatology'],
    national: true,
  },
  {
    id: 'res-celiac',
    name: 'Celiac Disease Foundation',
    category: 'Nonprofit & Advocacy',
    description:
      'Gluten-free living guidance, symptom resources, and advocacy for the celiac disease community.',
    website: 'https://celiac.org',
    tags: ['celiac disease', 'gastroenterology'],
    national: true,
  },
  {
    id: 'res-nord',
    name: 'National Organization for Rare Disorders (NORD)',
    category: 'Nonprofit & Advocacy',
    description:
      'Rare-disease information, patient-assistance programs, and advocacy spanning thousands of conditions.',
    website: 'https://rarediseases.org',
    tags: ['general', 'genetic'],
    national: true,
  },

  // ---- Patient Education ----
  {
    id: 'res-medlineplus',
    name: 'MedlinePlus (U.S. National Library of Medicine)',
    category: 'Patient Education',
    description:
      'Authoritative, plain-language health information on conditions, medications, and tests from the National Institutes of Health.',
    website: 'https://medlineplus.gov',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-cdc',
    name: 'CDC — Chronic Disease Resources',
    category: 'Patient Education',
    description:
      'Public-health guidance and self-management resources for major chronic conditions from the Centers for Disease Control and Prevention.',
    website: 'https://www.cdc.gov/chronic-disease',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-clinicaltrials',
    name: 'ClinicalTrials.gov',
    category: 'Patient Education',
    description:
      'The U.S. registry of clinical studies — search for trials, review eligibility, and learn what participation involves.',
    website: 'https://clinicaltrials.gov',
    tags: ['general'],
    national: true,
  },

  // ---- Clinical Guidelines ----
  {
    id: 'res-nice',
    name: 'NICE — Clinical Guidelines',
    category: 'Clinical Guidelines',
    description:
      'Evidence-based clinical practice guidelines from the UK National Institute for Health and Care Excellence.',
    website: 'https://www.nice.org.uk/guidance',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-who',
    name: 'World Health Organization — Health Topics',
    category: 'Clinical Guidelines',
    description:
      'Global guidance, fact sheets, and disease information from the World Health Organization.',
    website: 'https://www.who.int/health-topics',
    tags: ['general'],
    national: true,
  },

  // ---- Peer Support ----
  {
    id: 'res-inspire',
    name: 'Inspire Health Communities',
    category: 'Peer Support',
    description:
      'Moderated online communities, organized by condition, where patients and caregivers share experiences and support.',
    website: 'https://www.inspire.com',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-smartpatients',
    name: 'Smart Patients',
    category: 'Peer Support',
    description:
      'An online community where patients and caregivers learn from each other about treatments, trials, and day-to-day life.',
    website: 'https://www.smartpatients.com',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-patientslikeme',
    name: 'PatientsLikeMe',
    category: 'Peer Support',
    description:
      'A community platform for tracking symptoms and connecting with others who share the same condition.',
    website: 'https://www.patientslikeme.com',
    tags: ['general'],
    national: true,
  },

  // ---- Financial Aid ----
  {
    id: 'res-paf',
    name: 'Patient Advocate Foundation',
    category: 'Financial Aid',
    description:
      'Case-management and co-pay relief programs that help patients resolve insurance, access, and medical-debt issues.',
    website: 'https://www.patientadvocate.org',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-needymeds',
    name: 'NeedyMeds',
    category: 'Financial Aid',
    description:
      'A free database of patient-assistance programs, drug-discount cards, and cost-saving resources for medications and care.',
    website: 'https://www.needymeds.org',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-healthwell',
    name: 'HealthWell Foundation',
    category: 'Financial Aid',
    description:
      'Grants that help insured patients afford copays, premiums, and other out-of-pocket treatment costs.',
    website: 'https://www.healthwellfoundation.org',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-pan',
    name: 'PAN Foundation',
    category: 'Financial Aid',
    description:
      'Disease-specific financial-assistance funds that help underinsured patients with out-of-pocket medication costs.',
    website: 'https://www.panfoundation.org',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-rxassist',
    name: 'RxAssist',
    category: 'Financial Aid',
    description:
      'A directory of pharmaceutical patient-assistance programs that provide free or low-cost medications.',
    website: 'https://www.rxassist.org',
    tags: ['general'],
    national: true,
  },
  {
    id: 'res-goodrx',
    name: 'GoodRx',
    category: 'Financial Aid',
    description:
      'Compares prescription prices across pharmacies and provides free discount coupons to lower medication costs.',
    website: 'https://www.goodrx.com',
    tags: ['general'],
    national: true,
  },
];

export const RESOURCE_CATEGORIES = Array.from(
  new Set(RESOURCES.map((r) => r.category)),
);
