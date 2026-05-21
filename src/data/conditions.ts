import type { Condition } from '../types';

// Curated, clinician-grade condition database.
// Content is referenced to standard medical textbooks, current clinical
// practice guidelines, and landmark journal reviews. It is educational
// reference material — not individualized medical advice.

export const CONDITIONS: Condition[] = [
  {
    id: 'lupus',
    name: 'Systemic Lupus Erythematosus',
    icd10: 'M32.9',
    synonyms: ['lupus', 'sle', 'systemic lupus'],
    category: 'Rheumatology',
    summary:
      'Systemic lupus erythematosus is a chronic multisystem autoimmune disease driven by autoantibodies and immune-complex deposition, with a relapsing–remitting course.',
    symptoms: [
      'Fatigue and generalized malaise',
      'Joint pain and morning stiffness, often symmetric',
      'Photosensitive skin rashes, including the malar (butterfly) rash',
      'Recurrent low-grade fevers',
      'Oral or nasal ulcers, frequently painless',
      'Raynaud phenomenon (color change of fingers in cold)',
      'Hair loss (non-scarring alopecia)',
      'Chest pain that worsens with deep breathing (pleuritic)',
    ],
    physicalFindings: [
      'Fixed malar erythema sparing the nasolabial folds',
      'Non-erosive synovitis of small joints',
      'Mucosal ulceration of the hard palate',
      'Pericardial or pleural friction rub',
      'Peripheral edema when lupus nephritis is present',
    ],
    medications: {
      firstLine: [
        'Hydroxychloroquine — recommended for nearly all patients to reduce flares and organ damage',
        'NSAIDs for mild musculoskeletal and serositis symptoms',
        'Short courses of oral glucocorticoids for active disease',
      ],
      secondLine: [
        'Immunosuppressants: mycophenolate mofetil, azathioprine, or methotrexate',
        'Belimumab (anti-BLyS biologic) for active disease despite standard therapy',
        'Anifrolumab (type I interferon receptor antagonist) for moderate–severe disease',
        'Cyclophosphamide or rituximab for severe organ-threatening disease',
      ],
      monitoring: [
        'CBC, creatinine, urinalysis with protein/creatinine ratio for nephritis',
        'Complement (C3/C4) and anti-dsDNA titers to track activity',
        'Annual ophthalmologic exam while on hydroxychloroquine',
        'Blood pressure and lipid monitoring given accelerated cardiovascular risk',
      ],
    },
    epidemiology: [
      'Prevalence roughly 20–150 per 100,000; higher in many studied populations',
      'Female-to-male ratio approximately 9:1 during reproductive years',
      'Peak onset between ages 15 and 45',
      'Higher incidence and severity reported in Black, Hispanic, and Asian populations',
    ],
    prognosis:
      'Ten-year survival now exceeds 90% with modern therapy. Outcomes are driven largely by renal and neuropsychiatric involvement, infection, and accelerated cardiovascular disease. Sustained remission or low disease activity is an achievable treatment target.',
    pathophysiology: {
      overview:
        'Loss of immune tolerance leads to autoantibodies against nuclear antigens. Immune complexes deposit in tissues, activate complement, and recruit inflammatory cells, producing multi-organ injury.',
      steps: [
        {
          id: 'lupus-1',
          label: 'Genetic & environmental triggers',
          detail:
            'Susceptibility genes, UV light, infections, and hormonal factors promote loss of self-tolerance.',
          kind: 'trigger',
        },
        {
          id: 'lupus-2',
          label: 'Defective clearance of apoptotic cells',
          detail:
            'Nuclear antigens persist and are presented to the immune system, breaking tolerance.',
          kind: 'mechanism',
        },
        {
          id: 'lupus-3',
          label: 'Autoantibody production',
          detail:
            'B cells generate antibodies to dsDNA, Smith antigen, and other nuclear components.',
          kind: 'mechanism',
        },
        {
          id: 'lupus-4',
          label: 'Immune-complex deposition',
          detail:
            'Antigen–antibody complexes lodge in kidneys, skin, joints, and serosal surfaces.',
          kind: 'effect',
        },
        {
          id: 'lupus-5',
          label: 'Complement activation & inflammation',
          detail:
            'Complement consumption and cytokine release (including type I interferon) drive tissue damage.',
          kind: 'effect',
        },
        {
          id: 'lupus-6',
          label: 'Multi-organ injury',
          detail:
            'Nephritis, dermatitis, arthritis, serositis, and neuropsychiatric disease result.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'New foamy urine, leg swelling, or rising blood pressure — possible lupus nephritis',
      'Confusion, seizure, or focal weakness — possible neuropsychiatric lupus',
      'Severe shortness of breath or chest pain',
    ],
    citations: [
      {
        id: 'lupus-c1',
        type: 'textbook',
        reference: "Harrison's Principles of Internal Medicine, 21st ed.",
        detail: 'Chapter on Systemic Lupus Erythematosus',
        year: 2022,
      },
      {
        id: 'lupus-c2',
        type: 'textbook',
        reference: "Kelley & Firestein's Textbook of Rheumatology, 11th ed.",
        detail: 'Etiology and pathogenesis of SLE',
        year: 2021,
      },
      {
        id: 'lupus-c3',
        type: 'guideline',
        reference: 'EULAR recommendations for the management of SLE (2023 update)',
        detail: 'Treat-to-target and hydroxychloroquine recommendations',
        year: 2023,
      },
      {
        id: 'lupus-c4',
        type: 'journal',
        reference: 'N Engl J Med — Review: Systemic Lupus Erythematosus',
        detail: 'Pathogenesis and contemporary management',
        year: 2020,
      },
    ],
    specialties: ['Rheumatology', 'Nephrology', 'Dermatology'],
    infusionSpecialty: 'rheumatology',
    trialQuery: 'systemic lupus erythematosus',
    resourceTags: ['lupus', 'autoimmune', 'rheumatology'],
  },

  {
    id: 'rheumatoid-arthritis',
    name: 'Rheumatoid Arthritis',
    icd10: 'M06.9',
    synonyms: ['ra', 'rheumatoid', 'inflammatory arthritis'],
    category: 'Rheumatology',
    summary:
      'Rheumatoid arthritis is a chronic, symmetric inflammatory polyarthritis that can cause progressive joint erosion and systemic complications if untreated.',
    symptoms: [
      'Symmetric pain and swelling of small joints of the hands and feet',
      'Morning stiffness lasting longer than one hour',
      'Fatigue and low-grade fever',
      'Reduced grip strength and joint function',
      'Symptoms that improve with movement during the day',
    ],
    physicalFindings: [
      'Boggy synovial swelling of MCP, PIP, and wrist joints',
      'Ulnar deviation, swan-neck, and boutonnière deformities in advanced disease',
      'Rheumatoid nodules over extensor surfaces',
      'Symmetric joint-line tenderness',
      'Reduced range of motion',
    ],
    medications: {
      firstLine: [
        'Methotrexate — anchor conventional synthetic DMARD',
        'Short-term low-dose glucocorticoids as a bridge to DMARD effect',
        'Folic acid supplementation alongside methotrexate',
      ],
      secondLine: [
        'TNF inhibitors (adalimumab, etanercept, infliximab)',
        'Non-TNF biologics: abatacept, tocilizumab, rituximab',
        'JAK inhibitors (tofacitinib, baricitinib, upadacitinib)',
        'Triple conventional DMARD therapy as an alternative strategy',
      ],
      monitoring: [
        'CBC and liver enzymes on methotrexate and other DMARDs',
        'Disease activity scores (DAS28, CDAI) to guide treat-to-target',
        'Tuberculosis and hepatitis screening before biologics',
        'Lipids and infection surveillance on IL-6 and JAK inhibitors',
      ],
    },
    epidemiology: [
      'Affects roughly 0.5–1% of adults worldwide',
      'Two to three times more common in women',
      'Peak onset between ages 40 and 60',
      'Smoking and anti-CCP antibodies are strong risk and severity markers',
    ],
    prognosis:
      'Early diagnosis and treat-to-target therapy allow most patients to reach low disease activity or remission and prevent erosive damage. Untreated disease leads to joint destruction, disability, and increased cardiovascular mortality.',
    pathophysiology: {
      overview:
        'An autoimmune response targets the synovium, creating an invasive, inflamed pannus that erodes cartilage and bone.',
      steps: [
        {
          id: 'ra-1',
          label: 'Genetic & environmental risk',
          detail:
            'Shared-epitope HLA-DRB1 alleles and smoking promote citrullination of self-proteins.',
          kind: 'trigger',
        },
        {
          id: 'ra-2',
          label: 'Loss of tolerance & autoantibodies',
          detail: 'Anti-citrullinated protein antibodies and rheumatoid factor develop.',
          kind: 'mechanism',
        },
        {
          id: 'ra-3',
          label: 'Synovial inflammation',
          detail: 'T cells, B cells, and macrophages infiltrate the synovium releasing TNF and IL-6.',
          kind: 'mechanism',
        },
        {
          id: 'ra-4',
          label: 'Pannus formation',
          detail: 'Proliferating synovium forms invasive tissue over cartilage.',
          kind: 'effect',
        },
        {
          id: 'ra-5',
          label: 'Cartilage & bone erosion',
          detail: 'Osteoclast activation and proteases destroy joint structures.',
          kind: 'effect',
        },
        {
          id: 'ra-6',
          label: 'Joint deformity & disability',
          detail: 'Untreated inflammation leads to permanent deformity and functional loss.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden severe single-joint pain with fever — rule out septic arthritis',
      'New numbness or weakness — possible nerve compression or cervical spine involvement',
      'Shortness of breath — possible rheumatoid lung disease',
    ],
    citations: [
      {
        id: 'ra-c1',
        type: 'textbook',
        reference: "Kelley & Firestein's Textbook of Rheumatology, 11th ed.",
        detail: 'Pathogenesis and treatment of rheumatoid arthritis',
        year: 2021,
      },
      {
        id: 'ra-c2',
        type: 'guideline',
        reference: 'ACR Guideline for the Treatment of Rheumatoid Arthritis',
        detail: 'Treat-to-target and DMARD sequencing',
        year: 2021,
      },
      {
        id: 'ra-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Rheumatoid Arthritis',
        detail: 'Contemporary epidemiology and management',
        year: 2023,
      },
      {
        id: 'ra-c4',
        type: 'textbook',
        reference: "Harrison's Principles of Internal Medicine, 21st ed.",
        detail: 'Chapter on Rheumatoid Arthritis',
        year: 2022,
      },
    ],
    specialties: ['Rheumatology', 'Physical Medicine & Rehabilitation'],
    infusionSpecialty: 'rheumatology',
    trialQuery: 'rheumatoid arthritis',
    resourceTags: ['rheumatoid arthritis', 'autoimmune', 'rheumatology', 'arthritis'],
  },

  {
    id: 'type-2-diabetes',
    name: 'Type 2 Diabetes Mellitus',
    icd10: 'E11.9',
    synonyms: ['type 2 diabetes', 't2dm', 'diabetes', 'adult onset diabetes'],
    category: 'Endocrinology',
    summary:
      'Type 2 diabetes is a chronic metabolic disorder of insulin resistance and progressive beta-cell dysfunction leading to sustained hyperglycemia.',
    symptoms: [
      'Increased thirst and frequent urination',
      'Unexplained fatigue',
      'Blurred vision',
      'Slow-healing wounds and recurrent infections',
      'Tingling or numbness in the feet',
      'Many patients are asymptomatic and found on screening',
    ],
    physicalFindings: [
      'Elevated body mass index and central adiposity',
      'Acanthosis nigricans in body folds',
      'Diminished distal sensation and ankle reflexes (neuropathy)',
      'Foot ulcers or calluses at pressure points',
      'Retinopathy on dilated fundoscopic exam',
    ],
    medications: {
      firstLine: [
        'Metformin plus comprehensive lifestyle modification',
        'SGLT2 inhibitors when heart failure, kidney disease, or ASCVD is present',
        'GLP-1 receptor agonists when weight loss or cardiovascular benefit is prioritized',
      ],
      secondLine: [
        'Sulfonylureas or DPP-4 inhibitors as add-on glucose-lowering agents',
        'Pioglitazone in selected patients',
        'Basal insulin when glycemic targets are not met',
        'Dual GIP/GLP-1 agonist (tirzepatide) for glycemic and weight goals',
      ],
      monitoring: [
        'Hemoglobin A1c every 3–6 months',
        'Annual urine albumin-to-creatinine ratio and eGFR',
        'Annual dilated retinal exam and comprehensive foot exam',
        'Blood pressure and lipid panel with statin therapy as indicated',
      ],
    },
    epidemiology: [
      'Affects more than 400 million adults worldwide',
      'Strongly associated with obesity, physical inactivity, and family history',
      'Incidence rising in younger adults and adolescents',
      'Disproportionately affects several racial and ethnic groups',
    ],
    prognosis:
      'With early glycemic, blood pressure, and lipid control, complications can be substantially reduced. Poorly controlled disease leads to cardiovascular events, kidney failure, retinopathy, and neuropathy. Remission is possible with significant weight loss in some patients.',
    pathophysiology: {
      overview:
        'Insulin resistance in muscle, liver, and fat increases insulin demand; beta cells eventually fail to compensate, producing hyperglycemia.',
      steps: [
        {
          id: 't2d-1',
          label: 'Genetic & lifestyle risk',
          detail: 'Family history, excess caloric intake, and inactivity drive adiposity.',
          kind: 'trigger',
        },
        {
          id: 't2d-2',
          label: 'Insulin resistance',
          detail: 'Muscle, liver, and fat respond poorly to insulin signaling.',
          kind: 'mechanism',
        },
        {
          id: 't2d-3',
          label: 'Compensatory hyperinsulinemia',
          detail: 'Beta cells increase insulin output to maintain normal glucose.',
          kind: 'mechanism',
        },
        {
          id: 't2d-4',
          label: 'Beta-cell dysfunction',
          detail: 'Beta cells progressively fail and insulin secretion declines.',
          kind: 'effect',
        },
        {
          id: 't2d-5',
          label: 'Sustained hyperglycemia',
          detail: 'Glucose rises as hepatic output increases and uptake falls.',
          kind: 'effect',
        },
        {
          id: 't2d-6',
          label: 'Micro- & macrovascular complications',
          detail: 'Chronic hyperglycemia damages vessels, nerves, kidneys, and the retina.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Confusion, fruity breath, vomiting — possible hyperglycemic emergency',
      'Chest pain or sudden weakness — diabetes raises cardiovascular and stroke risk',
      'Non-healing foot wound with redness or drainage — possible infection',
    ],
    citations: [
      {
        id: 't2d-c1',
        type: 'guideline',
        reference: 'ADA Standards of Care in Diabetes — 2024',
        detail: 'Pharmacologic approaches to glycemic management',
        year: 2024,
      },
      {
        id: 't2d-c2',
        type: 'textbook',
        reference: 'Williams Textbook of Endocrinology, 14th ed.',
        detail: 'Pathophysiology of type 2 diabetes',
        year: 2020,
      },
      {
        id: 't2d-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Type 2 Diabetes',
        detail: 'Mechanisms, complications, and management',
        year: 2022,
      },
      {
        id: 't2d-c4',
        type: 'textbook',
        reference: "Harrison's Principles of Internal Medicine, 21st ed.",
        detail: 'Chapter on Diabetes Mellitus',
        year: 2022,
      },
    ],
    specialties: ['Endocrinology', 'Primary Care', 'Ophthalmology'],
    trialQuery: 'type 2 diabetes',
    resourceTags: ['diabetes', 'type 2 diabetes', 'endocrinology', 'metabolic'],
  },

  {
    id: 'type-1-diabetes',
    name: 'Type 1 Diabetes Mellitus',
    icd10: 'E10.9',
    synonyms: ['type 1 diabetes', 't1dm', 'juvenile diabetes', 'insulin dependent diabetes'],
    category: 'Endocrinology',
    summary:
      'Type 1 diabetes is an autoimmune destruction of pancreatic beta cells causing absolute insulin deficiency and lifelong dependence on exogenous insulin.',
    symptoms: [
      'Rapid onset of excessive thirst and urination',
      'Unintentional weight loss',
      'Increased hunger',
      'Fatigue and weakness',
      'Blurred vision',
      'Symptoms can progress quickly to diabetic ketoacidosis',
    ],
    physicalFindings: [
      'Often normal or low body weight at diagnosis',
      'Signs of dehydration when presenting with ketoacidosis',
      'Deep, rapid (Kussmaul) breathing in ketoacidosis',
      'Acetone (fruity) odor on the breath',
    ],
    medications: {
      firstLine: [
        'Basal–bolus insulin regimen (long-acting plus mealtime rapid-acting insulin)',
        'Continuous subcutaneous insulin infusion (insulin pump) as an alternative',
        'Carbohydrate counting and insulin dose adjustment education',
      ],
      secondLine: [
        'Hybrid closed-loop (automated insulin delivery) systems',
        'Pramlintide as an adjunct to mealtime insulin in selected patients',
        'Teplizumab to delay progression in at-risk, early-stage disease',
      ],
      monitoring: [
        'Continuous glucose monitoring with time-in-range targets',
        'Hemoglobin A1c every 3 months',
        'Annual screening for retinopathy, nephropathy, and neuropathy',
        'Thyroid and celiac screening given associated autoimmunity',
      ],
    },
    epidemiology: [
      'Accounts for roughly 5–10% of all diabetes',
      'Most often diagnosed in children and young adults, but can occur at any age',
      'Incidence varies widely by geography and is rising globally',
      'Associated with HLA susceptibility genes and islet autoantibodies',
    ],
    prognosis:
      'With modern insulin delivery and glucose monitoring, life expectancy continues to improve. Tight glycemic control reduces long-term microvascular and cardiovascular complications. Hypoglycemia and ketoacidosis remain important acute risks.',
    pathophysiology: {
      overview:
        'A T-cell-mediated autoimmune process destroys insulin-producing beta cells, eliminating endogenous insulin.',
      steps: [
        {
          id: 't1d-1',
          label: 'Genetic susceptibility & trigger',
          detail: 'HLA-linked risk plus an environmental trigger initiates autoimmunity.',
          kind: 'trigger',
        },
        {
          id: 't1d-2',
          label: 'Islet autoimmunity',
          detail: 'Autoantibodies to insulin, GAD65, and other islet antigens appear.',
          kind: 'mechanism',
        },
        {
          id: 't1d-3',
          label: 'T-cell-mediated beta-cell destruction',
          detail: 'Cytotoxic T cells infiltrate islets and destroy beta cells.',
          kind: 'mechanism',
        },
        {
          id: 't1d-4',
          label: 'Insulin deficiency',
          detail: 'Loss of beta-cell mass leads to absolute insulin deficiency.',
          kind: 'effect',
        },
        {
          id: 't1d-5',
          label: 'Hyperglycemia & ketogenesis',
          detail: 'Without insulin, glucose rises and fat breakdown produces ketones.',
          kind: 'effect',
        },
        {
          id: 't1d-6',
          label: 'Lifelong insulin dependence',
          detail: 'Exogenous insulin is required to sustain life and prevent ketoacidosis.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Vomiting, abdominal pain, rapid breathing — possible diabetic ketoacidosis (emergency)',
      'Severe confusion, sweating, shakiness — possible severe hypoglycemia',
      'Persistent high glucose with ketones in urine or blood',
    ],
    citations: [
      {
        id: 't1d-c1',
        type: 'guideline',
        reference: 'ADA Standards of Care in Diabetes — 2024',
        detail: 'Type 1 diabetes management and technology',
        year: 2024,
      },
      {
        id: 't1d-c2',
        type: 'journal',
        reference: 'The Lancet — Seminar: Type 1 Diabetes',
        detail: 'Immunopathogenesis and disease-modifying therapy',
        year: 2023,
      },
      {
        id: 't1d-c3',
        type: 'textbook',
        reference: 'Williams Textbook of Endocrinology, 14th ed.',
        detail: 'Type 1 diabetes immunology and treatment',
        year: 2020,
      },
    ],
    specialties: ['Endocrinology', 'Primary Care'],
    trialQuery: 'type 1 diabetes',
    resourceTags: ['diabetes', 'type 1 diabetes', 'endocrinology', 'autoimmune'],
  },

  {
    id: 'multiple-sclerosis',
    name: 'Multiple Sclerosis',
    icd10: 'G35',
    synonyms: ['ms', 'multiple sclerosis', 'demyelinating disease'],
    category: 'Neurology',
    summary:
      'Multiple sclerosis is a chronic immune-mediated demyelinating disease of the central nervous system, most commonly following a relapsing–remitting course.',
    symptoms: [
      'Numbness, tingling, or weakness, often on one side',
      'Vision loss or pain in one eye (optic neuritis)',
      'Double vision',
      'Imbalance and unsteady gait',
      'Fatigue that worsens with heat',
      'Bladder urgency and bowel dysfunction',
    ],
    physicalFindings: [
      'Afferent pupillary defect after optic neuritis',
      'Internuclear ophthalmoplegia on lateral gaze',
      'Hyperreflexia, spasticity, and extensor plantar responses',
      'Sensory level or impaired vibration and proprioception',
      'Lhermitte sign on neck flexion',
    ],
    medications: {
      firstLine: [
        'High-efficacy disease-modifying therapy increasingly used early',
        'Anti-CD20 monoclonal antibodies (ocrelizumab, ofatumumab)',
        'Oral agents: fumarates, sphingosine-1-phosphate modulators, cladribine',
      ],
      secondLine: [
        'Natalizumab for highly active disease',
        'Platform injectables (interferon beta, glatiramer acetate)',
        'High-dose corticosteroids for acute relapses',
        'Plasma exchange for steroid-refractory severe relapses',
      ],
      monitoring: [
        'Periodic brain and spinal cord MRI to track lesion activity',
        'JC virus antibody testing before and during natalizumab',
        'CBC and infection surveillance on immunosuppressive therapy',
        'Disability tracking and symptomatic care for spasticity and bladder',
      ],
    },
    epidemiology: [
      'Affects an estimated 2.8 million people worldwide',
      'Two to three times more common in women',
      'Typical onset between ages 20 and 40',
      'Prevalence increases with distance from the equator; low vitamin D and smoking are risk factors',
    ],
    prognosis:
      'Early high-efficacy therapy reduces relapses and delays disability. Most patients begin with a relapsing course; a subset transitions to progressive disease. Outcomes vary widely, and many people maintain good function for decades.',
    pathophysiology: {
      overview:
        'Autoreactive lymphocytes cross the blood–brain barrier and attack myelin, causing demyelination, axonal injury, and neurodegeneration.',
      steps: [
        {
          id: 'ms-1',
          label: 'Genetic & environmental risk',
          detail: 'HLA risk alleles, Epstein–Barr virus, smoking, and low vitamin D contribute.',
          kind: 'trigger',
        },
        {
          id: 'ms-2',
          label: 'Autoreactive immune activation',
          detail: 'Myelin-reactive T and B cells become activated in the periphery.',
          kind: 'mechanism',
        },
        {
          id: 'ms-3',
          label: 'Blood–brain barrier breach',
          detail: 'Activated lymphocytes cross into the central nervous system.',
          kind: 'mechanism',
        },
        {
          id: 'ms-4',
          label: 'Demyelination',
          detail: 'Immune attack strips myelin, slowing or blocking nerve conduction.',
          kind: 'effect',
        },
        {
          id: 'ms-5',
          label: 'Axonal injury & gliosis',
          detail: 'Repeated inflammation damages axons and forms sclerotic plaques.',
          kind: 'effect',
        },
        {
          id: 'ms-6',
          label: 'Accumulating disability',
          detail: 'Incomplete repair leads to progressive neurologic impairment over time.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden severe weakness, vision loss, or difficulty speaking',
      'New relapse symptoms lasting more than 24 hours',
      'Fever with new neurologic symptoms while on immunosuppression',
    ],
    citations: [
      {
        id: 'ms-c1',
        type: 'textbook',
        reference: "Bradley and Daroff's Neurology in Clinical Practice, 8th ed.",
        detail: 'Multiple sclerosis and demyelinating disease',
        year: 2022,
      },
      {
        id: 'ms-c2',
        type: 'journal',
        reference: 'N Engl J Med — Review: Multiple Sclerosis',
        detail: 'Immunopathology and disease-modifying therapy',
        year: 2021,
      },
      {
        id: 'ms-c3',
        type: 'guideline',
        reference: 'AAN Practice Guideline: Disease-Modifying Therapies for MS',
        detail: 'Initiation and switching of therapy',
        year: 2018,
      },
    ],
    specialties: ['Neurology', 'Ophthalmology', 'Physical Medicine & Rehabilitation'],
    infusionSpecialty: 'neurology',
    trialQuery: 'multiple sclerosis',
    resourceTags: ['multiple sclerosis', 'neurology', 'autoimmune'],
  },

  {
    id: 'crohns-disease',
    name: "Crohn's Disease",
    icd10: 'K50.90',
    synonyms: ['crohn', 'crohns', 'crohns disease', 'ibd', 'inflammatory bowel disease'],
    category: 'Gastroenterology',
    summary:
      "Crohn's disease is a chronic inflammatory bowel disease that can affect any part of the gastrointestinal tract with transmural, often patchy, inflammation.",
    symptoms: [
      'Chronic or recurrent abdominal pain, often right lower quadrant',
      'Diarrhea, sometimes with blood',
      'Unintentional weight loss',
      'Fatigue and low-grade fever',
      'Perianal pain, fistulas, or abscesses',
      'Mouth ulcers and joint pain (extraintestinal features)',
    ],
    physicalFindings: [
      'Abdominal tenderness or a palpable mass',
      'Perianal skin tags, fissures, or fistula openings',
      'Aphthous oral ulcers',
      'Signs of malnutrition or anemia',
      'Erythema nodosum or episcleritis',
    ],
    medications: {
      firstLine: [
        'Budesonide or systemic corticosteroids to induce remission',
        'Anti-TNF biologics (infliximab, adalimumab) for moderate–severe disease',
        'Early biologic therapy in patients with poor-prognosis features',
      ],
      secondLine: [
        'Ustekinumab (anti-IL-12/23) or risankizumab (anti-IL-23)',
        'Vedolizumab (gut-selective anti-integrin)',
        'Immunomodulators (azathioprine, methotrexate) often combined with biologics',
        'Surgery for strictures, fistulas, or medically refractory disease',
      ],
      monitoring: [
        'Fecal calprotectin and C-reactive protein to track inflammation',
        'Therapeutic drug monitoring of biologic levels and antibodies',
        'Periodic colonoscopy for mucosal healing and dysplasia surveillance',
        'Tuberculosis and hepatitis screening before biologics',
      ],
    },
    epidemiology: [
      'Prevalence is highest in North America and Europe and rising globally',
      'Bimodal onset with a peak in the teens to 30s',
      'Smoking worsens disease course and recurrence',
      'Family history is a significant risk factor',
    ],
    prognosis:
      'Crohn’s disease is lifelong with a relapsing course. Early effective therapy and a treat-to-target approach aimed at mucosal healing reduce complications and surgery. Many patients still require at least one operation over their lifetime.',
    pathophysiology: {
      overview:
        'A dysregulated mucosal immune response to gut microbes in a genetically susceptible host produces transmural intestinal inflammation.',
      steps: [
        {
          id: 'crohn-1',
          label: 'Genetic susceptibility',
          detail: 'Variants such as NOD2 impair handling of intestinal bacteria.',
          kind: 'trigger',
        },
        {
          id: 'crohn-2',
          label: 'Barrier dysfunction & dysbiosis',
          detail: 'A leaky epithelium and altered microbiome expose immune cells to microbes.',
          kind: 'mechanism',
        },
        {
          id: 'crohn-3',
          label: 'Dysregulated immune response',
          detail: 'Th1/Th17 responses and cytokines including TNF and IL-23 are amplified.',
          kind: 'mechanism',
        },
        {
          id: 'crohn-4',
          label: 'Transmural inflammation',
          detail: 'Inflammation penetrates the full bowel wall in a patchy distribution.',
          kind: 'effect',
        },
        {
          id: 'crohn-5',
          label: 'Strictures & fistulas',
          detail: 'Chronic inflammation produces fibrosis, narrowing, and abnormal tracts.',
          kind: 'effect',
        },
        {
          id: 'crohn-6',
          label: 'Complications & surgery',
          detail: 'Obstruction, abscess, and fistulizing disease may require operation.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Severe abdominal pain with vomiting and inability to pass stool — possible obstruction',
      'High fever with localized abdominal pain — possible abscess',
      'Heavy rectal bleeding or signs of significant anemia',
    ],
    citations: [
      {
        id: 'crohn-c1',
        type: 'textbook',
        reference: "Sleisenger and Fordtran's Gastrointestinal and Liver Disease, 11th ed.",
        detail: "Crohn's disease pathophysiology and management",
        year: 2021,
      },
      {
        id: 'crohn-c2',
        type: 'guideline',
        reference: 'ECCO Guidelines on Therapeutics in Crohn’s Disease',
        detail: 'Induction and maintenance of remission',
        year: 2020,
      },
      {
        id: 'crohn-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Crohn’s Disease',
        detail: 'Epidemiology and treat-to-target strategy',
        year: 2022,
      },
    ],
    specialties: ['Gastroenterology', 'Colorectal Surgery'],
    infusionSpecialty: 'gastroenterology',
    trialQuery: "Crohn's disease",
    resourceTags: ['crohns disease', 'ibd', 'gastroenterology', 'autoimmune'],
  },

  {
    id: 'ulcerative-colitis',
    name: 'Ulcerative Colitis',
    icd10: 'K51.90',
    synonyms: ['ulcerative colitis', 'uc', 'ibd', 'colitis'],
    category: 'Gastroenterology',
    summary:
      'Ulcerative colitis is a chronic inflammatory bowel disease causing continuous mucosal inflammation of the colon that begins in the rectum.',
    symptoms: [
      'Bloody diarrhea',
      'Urgency and tenesmus (feeling of incomplete evacuation)',
      'Lower abdominal cramping, often relieved by defecation',
      'Fatigue and weight loss in active disease',
      'Nocturnal bowel movements',
    ],
    physicalFindings: [
      'Lower abdominal tenderness',
      'Pallor from anemia',
      'Blood on rectal examination',
      'Extraintestinal signs: arthritis, episcleritis, skin lesions',
    ],
    medications: {
      firstLine: [
        'Oral and topical 5-aminosalicylates (mesalamine) for mild–moderate disease',
        'Topical or systemic corticosteroids for flares',
        'Budesonide MMX for mild–moderate disease',
      ],
      secondLine: [
        'Anti-TNF biologics (infliximab, adalimumab, golimumab)',
        'Vedolizumab, ustekinumab, or anti-IL-23 agents',
        'JAK inhibitors (tofacitinib, upadacitinib) and S1P modulators (ozanimod)',
        'Colectomy for refractory disease or dysplasia',
      ],
      monitoring: [
        'Fecal calprotectin and CRP to monitor activity',
        'Surveillance colonoscopy for dysplasia in long-standing colitis',
        'CBC and iron studies for anemia',
        'Drug-specific monitoring and infection screening for biologics and JAK inhibitors',
      ],
    },
    epidemiology: [
      'Slightly more common than Crohn’s disease in many populations',
      'Peak onset in the second to fourth decades',
      'Risk is paradoxically lower in current smokers',
      'Higher incidence in North America and Northern Europe',
    ],
    prognosis:
      'Most patients have a relapsing–remitting course controlled with medical therapy. Mucosal healing improves outcomes and reduces colectomy and cancer risk. Colectomy is curative of colonic disease when needed.',
    pathophysiology: {
      overview:
        'An abnormal immune response to the gut microbiome produces continuous inflammation limited to the colonic mucosa and submucosa.',
      steps: [
        {
          id: 'uc-1',
          label: 'Genetic & environmental risk',
          detail: 'Susceptibility genes and environmental factors prime an abnormal response.',
          kind: 'trigger',
        },
        {
          id: 'uc-2',
          label: 'Epithelial barrier defect',
          detail: 'A compromised mucus layer and epithelium expose the immune system to microbes.',
          kind: 'mechanism',
        },
        {
          id: 'uc-3',
          label: 'Mucosal immune activation',
          detail: 'Th2-skewed and innate immune responses release inflammatory cytokines.',
          kind: 'mechanism',
        },
        {
          id: 'uc-4',
          label: 'Continuous mucosal inflammation',
          detail: 'Inflammation spreads continuously from the rectum proximally.',
          kind: 'effect',
        },
        {
          id: 'uc-5',
          label: 'Ulceration & bleeding',
          detail: 'Friable, ulcerated mucosa produces bloody diarrhea.',
          kind: 'effect',
        },
        {
          id: 'uc-6',
          label: 'Long-term dysplasia risk',
          detail: 'Long-standing colitis raises colorectal cancer risk, requiring surveillance.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'More than 6 bloody stools daily with fever or rapid heart rate — possible severe colitis',
      'Severe abdominal distension and pain — possible toxic megacolon (emergency)',
      'Lightheadedness or fainting from blood loss',
    ],
    citations: [
      {
        id: 'uc-c1',
        type: 'guideline',
        reference: 'ACG Clinical Guideline: Ulcerative Colitis in Adults',
        detail: 'Management of mild to severe disease',
        year: 2019,
      },
      {
        id: 'uc-c2',
        type: 'textbook',
        reference: "Sleisenger and Fordtran's Gastrointestinal and Liver Disease, 11th ed.",
        detail: 'Ulcerative colitis',
        year: 2021,
      },
      {
        id: 'uc-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Ulcerative Colitis',
        detail: 'Pathogenesis and modern therapeutics',
        year: 2023,
      },
    ],
    specialties: ['Gastroenterology', 'Colorectal Surgery'],
    infusionSpecialty: 'gastroenterology',
    trialQuery: 'ulcerative colitis',
    resourceTags: ['ulcerative colitis', 'ibd', 'gastroenterology', 'autoimmune'],
  },

  {
    id: 'psoriasis',
    name: 'Psoriasis',
    icd10: 'L40.0',
    synonyms: ['psoriasis', 'plaque psoriasis', 'psoriasis vulgaris'],
    category: 'Dermatology',
    summary:
      'Psoriasis is a chronic immune-mediated inflammatory skin disease characterized by well-demarcated, scaly plaques and associated systemic inflammation.',
    symptoms: [
      'Raised, red plaques with silvery scale',
      'Itching, burning, or soreness of affected skin',
      'Plaques commonly on scalp, elbows, knees, and lower back',
      'Nail pitting, ridging, or separation from the nail bed',
      'Joint pain or stiffness when psoriatic arthritis coexists',
    ],
    physicalFindings: [
      'Sharply demarcated erythematous plaques with adherent scale',
      'Auspitz sign (pinpoint bleeding when scale is removed)',
      'Koebner phenomenon (lesions at sites of skin trauma)',
      'Nail pitting and onycholysis',
      'Scalp and intertriginous (inverse) involvement',
    ],
    medications: {
      firstLine: [
        'Topical corticosteroids, often combined with vitamin D analogues',
        'Topical calcineurin inhibitors for face and skin folds',
        'Phototherapy (narrowband UVB) for more extensive disease',
      ],
      secondLine: [
        'Biologics targeting TNF, IL-17, or IL-23 for moderate–severe disease',
        'Oral systemic agents: methotrexate, apremilast, deucravacitinib',
        'Acitretin in selected cases',
        'Cyclosporine for short-term control of severe flares',
      ],
      monitoring: [
        'Periodic skin assessment using body surface area or PASI',
        'Screening for psoriatic arthritis at each visit',
        'Cardiometabolic risk assessment (blood pressure, lipids, glucose)',
        'Drug-specific labs and tuberculosis screening before biologics',
      ],
    },
    epidemiology: [
      'Affects roughly 2–3% of the global population',
      'Bimodal onset peaks in the late teens–20s and again around the 50s–60s',
      'Strong genetic component; associated with HLA-Cw6',
      'Linked to obesity, cardiovascular disease, and metabolic syndrome',
    ],
    prognosis:
      'Psoriasis is chronic but highly controllable; modern biologics achieve clear or nearly clear skin for many patients. It is associated with psoriatic arthritis and increased cardiovascular risk, so it is managed as a systemic disease.',
    pathophysiology: {
      overview:
        'An activated IL-23/Th17 immune axis drives keratinocyte hyperproliferation and inflammation, producing characteristic plaques.',
      steps: [
        {
          id: 'pso-1',
          label: 'Genetic predisposition & trigger',
          detail: 'Genetic risk plus triggers such as infection, trauma, or stress initiate disease.',
          kind: 'trigger',
        },
        {
          id: 'pso-2',
          label: 'Dendritic cell activation',
          detail: 'Dendritic cells release IL-23 and TNF, activating T cells.',
          kind: 'mechanism',
        },
        {
          id: 'pso-3',
          label: 'Th17 response',
          detail: 'IL-17-producing T cells amplify cutaneous inflammation.',
          kind: 'mechanism',
        },
        {
          id: 'pso-4',
          label: 'Keratinocyte hyperproliferation',
          detail: 'Cytokines drive rapid, abnormal keratinocyte turnover.',
          kind: 'effect',
        },
        {
          id: 'pso-5',
          label: 'Plaque formation',
          detail: 'Thickened epidermis with retained nuclei and scale forms visible plaques.',
          kind: 'effect',
        },
        {
          id: 'pso-6',
          label: 'Systemic inflammation',
          detail: 'Chronic inflammation contributes to arthritis and cardiometabolic risk.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden widespread redness covering most of the body — possible erythrodermic psoriasis (emergency)',
      'Widespread pustules with fever — possible generalized pustular psoriasis',
      'New joint swelling and stiffness — evaluate for psoriatic arthritis',
    ],
    citations: [
      {
        id: 'pso-c1',
        type: 'guideline',
        reference: 'AAD–NPF Guidelines of Care for Psoriasis',
        detail: 'Topical, systemic, and biologic therapy',
        year: 2021,
      },
      {
        id: 'pso-c2',
        type: 'textbook',
        reference: "Bolognia's Dermatology, 5th ed.",
        detail: 'Psoriasis and psoriasiform dermatoses',
        year: 2024,
      },
      {
        id: 'pso-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Psoriasis',
        detail: 'Immunopathogenesis and biologic therapy',
        year: 2021,
      },
    ],
    specialties: ['Dermatology', 'Rheumatology'],
    infusionSpecialty: 'immunology',
    trialQuery: 'plaque psoriasis',
    resourceTags: ['psoriasis', 'dermatology', 'autoimmune'],
  },

  {
    id: 'asthma',
    name: 'Asthma',
    icd10: 'J45.909',
    synonyms: ['asthma', 'bronchial asthma', 'reactive airway disease'],
    category: 'Pulmonology',
    summary:
      'Asthma is a chronic inflammatory airway disease causing variable, reversible airflow obstruction and bronchial hyperresponsiveness.',
    symptoms: [
      'Episodic wheezing',
      'Shortness of breath',
      'Chest tightness',
      'Cough, often worse at night or early morning',
      'Symptoms triggered by allergens, exercise, cold air, or infection',
    ],
    physicalFindings: [
      'Expiratory wheezing on auscultation',
      'Prolonged expiratory phase',
      'Use of accessory muscles during exacerbations',
      'Often a normal exam between episodes',
      'Allergic features such as nasal polyps or eczema',
    ],
    medications: {
      firstLine: [
        'Inhaled corticosteroid–formoterol used as reliever and maintenance (preferred strategy)',
        'Daily inhaled corticosteroid for persistent asthma',
        'Short-acting beta-agonist for rapid symptom relief',
      ],
      secondLine: [
        'Long-acting beta-agonist added to inhaled corticosteroid',
        'Leukotriene receptor antagonists',
        'Long-acting muscarinic antagonist (tiotropium) add-on',
        'Biologics (anti-IgE, anti-IL-5, anti-IL-4/13) for severe type 2 asthma',
      ],
      monitoring: [
        'Spirometry to confirm reversible obstruction and track lung function',
        'Symptom control assessment (e.g., Asthma Control Test)',
        'Inhaler technique and adherence review at each visit',
        'Blood eosinophils and FeNO to phenotype severe asthma',
      ],
    },
    epidemiology: [
      'Affects an estimated 260 million people worldwide',
      'Common in children; can begin or persist at any age',
      'Associated with atopy, allergic rhinitis, and eczema',
      'Exacerbations triggered by viral infection, allergens, and air pollution',
    ],
    prognosis:
      'With appropriate inhaled therapy and trigger management, most people achieve good symptom control and normal activity. Poorly controlled asthma risks exacerbations and airway remodeling; severe asthma may require biologic therapy.',
    pathophysiology: {
      overview:
        'Chronic airway inflammation produces bronchial hyperresponsiveness, bronchoconstriction, mucus, and — over time — airway remodeling.',
      steps: [
        {
          id: 'asthma-1',
          label: 'Trigger exposure',
          detail: 'Allergens, viruses, irritants, or exercise provoke the airway.',
          kind: 'trigger',
        },
        {
          id: 'asthma-2',
          label: 'Airway inflammation',
          detail: 'Type 2 inflammation recruits eosinophils, mast cells, and Th2 lymphocytes.',
          kind: 'mechanism',
        },
        {
          id: 'asthma-3',
          label: 'Bronchial hyperresponsiveness',
          detail: 'Airways become twitchy and overreact to stimuli.',
          kind: 'mechanism',
        },
        {
          id: 'asthma-4',
          label: 'Bronchoconstriction & mucus',
          detail: 'Smooth muscle contracts and mucus secretion increases, narrowing airways.',
          kind: 'effect',
        },
        {
          id: 'asthma-5',
          label: 'Reversible airflow obstruction',
          detail: 'Airflow falls during episodes and improves with bronchodilators.',
          kind: 'effect',
        },
        {
          id: 'asthma-6',
          label: 'Airway remodeling',
          detail: 'Untreated chronic inflammation can cause fixed structural airway changes.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Severe breathlessness, difficulty speaking in full sentences, or blue lips — emergency',
      'Reliever inhaler not working or needed every few hours',
      'Silent chest or exhaustion during an attack',
    ],
    citations: [
      {
        id: 'asthma-c1',
        type: 'guideline',
        reference: 'GINA Global Strategy for Asthma Management and Prevention',
        detail: 'Stepwise pharmacotherapy and reliever strategy',
        year: 2024,
      },
      {
        id: 'asthma-c2',
        type: 'textbook',
        reference: "Murray and Nadel's Textbook of Respiratory Medicine, 7th ed.",
        detail: 'Asthma pathophysiology and management',
        year: 2022,
      },
      {
        id: 'asthma-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Asthma',
        detail: 'Phenotypes and biologic therapy',
        year: 2023,
      },
    ],
    specialties: ['Pulmonology', 'Allergy & Immunology', 'Primary Care'],
    infusionSpecialty: 'immunology',
    trialQuery: 'asthma',
    resourceTags: ['asthma', 'pulmonology', 'respiratory', 'allergy'],
  },

  {
    id: 'copd',
    name: 'Chronic Obstructive Pulmonary Disease',
    icd10: 'J44.9',
    synonyms: ['copd', 'emphysema', 'chronic bronchitis', 'chronic obstructive pulmonary disease'],
    category: 'Pulmonology',
    summary:
      'COPD is a chronic, progressive respiratory disease defined by persistent airflow limitation due to airway and alveolar damage, most often from tobacco smoke.',
    symptoms: [
      'Progressive shortness of breath, especially with exertion',
      'Chronic cough',
      'Sputum production',
      'Wheezing and chest tightness',
      'Frequent respiratory infections',
      'Fatigue and reduced exercise tolerance',
    ],
    physicalFindings: [
      'Prolonged expiration and diminished breath sounds',
      'Wheezes or coarse crackles',
      'Barrel-shaped chest in advanced emphysema',
      'Pursed-lip breathing and accessory muscle use',
      'Cyanosis or peripheral edema in advanced disease',
    ],
    medications: {
      firstLine: [
        'Long-acting bronchodilators (LABA and/or LAMA)',
        'Short-acting bronchodilators for rapid relief',
        'Smoking cessation support — the single most important intervention',
      ],
      secondLine: [
        'Inhaled corticosteroid added for frequent exacerbations or high eosinophils',
        'Roflumilast for chronic bronchitis with exacerbations',
        'Azithromycin in selected patients to reduce exacerbations',
        'Long-term oxygen therapy for chronic hypoxemia',
      ],
      monitoring: [
        'Spirometry to confirm and stage airflow limitation',
        'Symptom and exacerbation history (CAT score, mMRC scale)',
        'Pulse oximetry and assessment for oxygen need',
        'Vaccination status (influenza, pneumococcal, COVID-19, RSV)',
      ],
    },
    epidemiology: [
      'A leading cause of death worldwide',
      'Tobacco smoke is the dominant risk factor; biomass fuel and air pollution also contribute',
      'Usually diagnosed after age 40',
      'Alpha-1 antitrypsin deficiency causes early-onset disease in a minority',
    ],
    prognosis:
      'COPD is progressive but its trajectory can be substantially modified. Smoking cessation, bronchodilators, pulmonary rehabilitation, oxygen when indicated, and exacerbation prevention improve symptoms, function, and survival.',
    pathophysiology: {
      overview:
        'Chronic exposure to noxious particles drives airway inflammation, mucus hypersecretion, and alveolar destruction, producing fixed airflow limitation.',
      steps: [
        {
          id: 'copd-1',
          label: 'Noxious inhalational exposure',
          detail: 'Tobacco smoke or other pollutants repeatedly injure the airways.',
          kind: 'trigger',
        },
        {
          id: 'copd-2',
          label: 'Chronic airway inflammation',
          detail: 'Neutrophils, macrophages, and CD8 T cells infiltrate the airways.',
          kind: 'mechanism',
        },
        {
          id: 'copd-3',
          label: 'Protease–antiprotease imbalance',
          detail: 'Excess proteases degrade elastin and lung connective tissue.',
          kind: 'mechanism',
        },
        {
          id: 'copd-4',
          label: 'Small-airway disease & emphysema',
          detail: 'Airways narrow and alveolar walls are destroyed, reducing elastic recoil.',
          kind: 'effect',
        },
        {
          id: 'copd-5',
          label: 'Air trapping & hyperinflation',
          detail: 'Loss of recoil traps air, increasing the work of breathing.',
          kind: 'effect',
        },
        {
          id: 'copd-6',
          label: 'Fixed airflow limitation',
          detail: 'Progressive, largely irreversible airflow obstruction develops.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden severe breathlessness with confusion or blue lips — emergency',
      'Marked increase in sputum volume, purulence, or breathlessness — exacerbation',
      'New chest pain or coughing up blood',
    ],
    citations: [
      {
        id: 'copd-c1',
        type: 'guideline',
        reference: 'GOLD Global Strategy for the Diagnosis and Management of COPD',
        detail: 'Classification and pharmacologic management',
        year: 2024,
      },
      {
        id: 'copd-c2',
        type: 'textbook',
        reference: "Murray and Nadel's Textbook of Respiratory Medicine, 7th ed.",
        detail: 'COPD pathophysiology',
        year: 2022,
      },
      {
        id: 'copd-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Chronic Obstructive Pulmonary Disease',
        detail: 'Contemporary management',
        year: 2020,
      },
    ],
    specialties: ['Pulmonology', 'Primary Care'],
    trialQuery: 'COPD',
    resourceTags: ['copd', 'pulmonology', 'respiratory'],
  },

  {
    id: 'heart-failure',
    name: 'Heart Failure',
    icd10: 'I50.9',
    synonyms: ['heart failure', 'chf', 'congestive heart failure', 'hfref', 'hfpef'],
    category: 'Cardiology',
    summary:
      'Heart failure is a clinical syndrome in which the heart cannot pump or fill adequately to meet the body’s needs, causing congestion and reduced perfusion.',
    symptoms: [
      'Shortness of breath with exertion or when lying flat',
      'Waking at night short of breath (paroxysmal nocturnal dyspnea)',
      'Leg, ankle, or abdominal swelling',
      'Fatigue and reduced exercise tolerance',
      'Rapid weight gain from fluid retention',
    ],
    physicalFindings: [
      'Elevated jugular venous pressure',
      'Pulmonary crackles',
      'Peripheral (pitting) edema',
      'Third heart sound (S3 gallop)',
      'Displaced apical impulse and hepatomegaly',
    ],
    medications: {
      firstLine: [
        'For reduced ejection fraction: ARNI (sacubitril/valsartan) or ACE inhibitor/ARB',
        'Evidence-based beta-blocker (carvedilol, metoprolol succinate, bisoprolol)',
        'Mineralocorticoid receptor antagonist (spironolactone or eplerenone)',
        'SGLT2 inhibitor — beneficial across the ejection-fraction spectrum',
      ],
      secondLine: [
        'Loop diuretics for congestion and symptom relief',
        'Hydralazine plus nitrate in selected patients',
        'Ivabradine for persistent elevated heart rate in sinus rhythm',
        'Device therapy (ICD, cardiac resynchronization) for appropriate candidates',
      ],
      monitoring: [
        'Daily weights and symptom tracking for early decompensation',
        'Electrolytes and kidney function on diuretics and neurohormonal therapy',
        'Natriuretic peptides (BNP/NT-proBNP) to support diagnosis and management',
        'Periodic echocardiography to reassess ejection fraction',
      ],
    },
    epidemiology: [
      'Affects an estimated 64 million people worldwide',
      'Prevalence rises sharply with age',
      'Common causes include coronary disease, hypertension, and valvular disease',
      'A leading cause of hospitalization in older adults',
    ],
    prognosis:
      'Guideline-directed medical therapy markedly improves survival and reduces hospitalizations in heart failure with reduced ejection fraction. Prognosis depends on cause, ejection fraction, comorbidities, and treatment adherence; early up-titration of therapy improves outcomes.',
    pathophysiology: {
      overview:
        'An initial cardiac injury reduces output, triggering neurohormonal activation that initially compensates but ultimately worsens remodeling and congestion.',
      steps: [
        {
          id: 'hf-1',
          label: 'Index cardiac injury',
          detail: 'Myocardial infarction, hypertension, or valve disease impairs the heart.',
          kind: 'trigger',
        },
        {
          id: 'hf-2',
          label: 'Reduced cardiac output',
          detail: 'The heart cannot meet metabolic demand.',
          kind: 'mechanism',
        },
        {
          id: 'hf-3',
          label: 'Neurohormonal activation',
          detail: 'The renin–angiotensin–aldosterone and sympathetic systems are activated.',
          kind: 'mechanism',
        },
        {
          id: 'hf-4',
          label: 'Fluid retention & afterload rise',
          detail: 'Sodium and water retention and vasoconstriction increase cardiac load.',
          kind: 'effect',
        },
        {
          id: 'hf-5',
          label: 'Adverse cardiac remodeling',
          detail: 'The ventricle dilates and hypertrophies, further reducing function.',
          kind: 'effect',
        },
        {
          id: 'hf-6',
          label: 'Progressive congestion',
          detail: 'A self-perpetuating cycle of congestion and low output develops.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Severe breathlessness at rest or pink frothy sputum — possible acute pulmonary edema (emergency)',
      'Chest pain, fainting, or rapid weight gain over a few days',
      'Confusion, cold extremities, or very low blood pressure',
    ],
    citations: [
      {
        id: 'hf-c1',
        type: 'guideline',
        reference: 'AHA/ACC/HFSA Guideline for the Management of Heart Failure',
        detail: 'Guideline-directed medical therapy',
        year: 2022,
      },
      {
        id: 'hf-c2',
        type: 'textbook',
        reference: "Braunwald's Heart Disease, 12th ed.",
        detail: 'Pathophysiology of heart failure',
        year: 2022,
      },
      {
        id: 'hf-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Heart Failure with Reduced Ejection Fraction',
        detail: 'Four pillars of medical therapy',
        year: 2021,
      },
    ],
    specialties: ['Cardiology', 'Primary Care'],
    trialQuery: 'heart failure',
    resourceTags: ['heart failure', 'cardiology', 'cardiovascular'],
  },

  {
    id: 'atrial-fibrillation',
    name: 'Atrial Fibrillation',
    icd10: 'I48.91',
    synonyms: ['atrial fibrillation', 'afib', 'a-fib', 'af'],
    category: 'Cardiology',
    summary:
      'Atrial fibrillation is the most common sustained cardiac arrhythmia, marked by disorganized atrial activity, an irregular pulse, and increased stroke risk.',
    symptoms: [
      'Palpitations or an irregular, racing heartbeat',
      'Fatigue and reduced exercise tolerance',
      'Shortness of breath',
      'Lightheadedness or dizziness',
      'Chest discomfort',
      'Some patients have no symptoms (silent AF)',
    ],
    physicalFindings: [
      'Irregularly irregular pulse',
      'Variable intensity of the first heart sound',
      'Pulse deficit between apical and radial rates',
      'Signs of heart failure if rate is poorly controlled',
    ],
    medications: {
      firstLine: [
        'Oral anticoagulation guided by stroke-risk score (CHA₂DS₂-VASc)',
        'Direct oral anticoagulants preferred over warfarin for most patients',
        'Rate control with beta-blockers or non-dihydropyridine calcium-channel blockers',
      ],
      secondLine: [
        'Rhythm control with antiarrhythmic drugs (flecainide, sotalol, amiodarone, dronedarone)',
        'Catheter ablation, particularly for symptomatic or paroxysmal AF',
        'Left atrial appendage occlusion when anticoagulation is contraindicated',
        'Digoxin as adjunctive rate control in selected patients',
      ],
      monitoring: [
        'Periodic ECG and assessment of symptom burden',
        'Renal function to guide anticoagulant dosing',
        'INR monitoring if warfarin is used',
        'Screening and management of risk factors (hypertension, sleep apnea, alcohol)',
      ],
    },
    epidemiology: [
      'Affects tens of millions worldwide, with prevalence rising',
      'Risk increases markedly with age',
      'Associated with hypertension, heart failure, obesity, and sleep apnea',
      'Accounts for a substantial share of ischemic strokes',
    ],
    prognosis:
      'With appropriate anticoagulation, stroke risk is greatly reduced. Rate or rhythm control relieves symptoms, and early rhythm control plus risk-factor modification improves outcomes. Prognosis depends heavily on underlying heart disease.',
    pathophysiology: {
      overview:
        'Atrial structural and electrical remodeling sustains chaotic re-entrant activity; stasis in the fibrillating atrium promotes clot formation.',
      steps: [
        {
          id: 'af-1',
          label: 'Risk-factor burden',
          detail: 'Hypertension, aging, obesity, and sleep apnea stress the atria.',
          kind: 'trigger',
        },
        {
          id: 'af-2',
          label: 'Atrial remodeling',
          detail: 'Fibrosis and stretch alter atrial structure and conduction.',
          kind: 'mechanism',
        },
        {
          id: 'af-3',
          label: 'Ectopic triggers & re-entry',
          detail: 'Pulmonary-vein ectopy and re-entrant circuits initiate and sustain AF.',
          kind: 'mechanism',
        },
        {
          id: 'af-4',
          label: 'Disorganized atrial activity',
          detail: 'The atria quiver instead of contracting, producing an irregular ventricular rate.',
          kind: 'effect',
        },
        {
          id: 'af-5',
          label: 'Blood stasis in the atrium',
          detail: 'Loss of organized contraction causes stasis, especially in the appendage.',
          kind: 'effect',
        },
        {
          id: 'af-6',
          label: 'Thromboembolism risk',
          detail: 'Clots can form and embolize, causing stroke.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden weakness, facial droop, or speech difficulty — possible stroke (call emergency services)',
      'Severe chest pain, fainting, or severe breathlessness',
      'Very fast heart rate with lightheadedness',
    ],
    citations: [
      {
        id: 'af-c1',
        type: 'guideline',
        reference: 'ACC/AHA/ACCP/HRS Guideline for the Diagnosis and Management of Atrial Fibrillation',
        detail: 'Anticoagulation and rhythm management',
        year: 2023,
      },
      {
        id: 'af-c2',
        type: 'textbook',
        reference: "Braunwald's Heart Disease, 12th ed.",
        detail: 'Atrial fibrillation',
        year: 2022,
      },
      {
        id: 'af-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Atrial Fibrillation',
        detail: 'Stroke prevention and rhythm control',
        year: 2021,
      },
    ],
    specialties: ['Cardiology', 'Electrophysiology', 'Primary Care'],
    trialQuery: 'atrial fibrillation',
    resourceTags: ['atrial fibrillation', 'cardiology', 'cardiovascular', 'arrhythmia'],
  },

  {
    id: 'hypertension',
    name: 'Hypertension',
    icd10: 'I10',
    synonyms: ['hypertension', 'high blood pressure', 'htn'],
    category: 'Cardiology',
    summary:
      'Hypertension is persistently elevated arterial blood pressure and a leading modifiable risk factor for stroke, heart disease, and kidney disease.',
    symptoms: [
      'Usually asymptomatic — often called a silent condition',
      'Headache may occur with very high pressures',
      'Visual changes or chest discomfort in severe cases',
      'Most often detected on routine measurement',
    ],
    physicalFindings: [
      'Repeatedly elevated blood pressure on standardized measurement',
      'Hypertensive retinopathy on fundoscopic exam',
      'Left ventricular heave from hypertrophy',
      'Bruits or signs of secondary causes in selected patients',
    ],
    medications: {
      firstLine: [
        'Thiazide or thiazide-like diuretics',
        'ACE inhibitors or angiotensin receptor blockers',
        'Dihydropyridine calcium-channel blockers',
        'Combination therapy is often needed to reach goal',
      ],
      secondLine: [
        'Mineralocorticoid receptor antagonists (e.g., spironolactone) for resistant hypertension',
        'Beta-blockers when a compelling indication is present',
        'Additional agents: alpha-blockers, central agents, vasodilators',
        'Evaluation for secondary causes if resistant or atypical',
      ],
      monitoring: [
        'Home and ambulatory blood pressure monitoring',
        'Electrolytes and kidney function on diuretics and RAAS inhibitors',
        'Periodic assessment of cardiovascular risk and target-organ damage',
        'Lifestyle counseling: sodium reduction, weight, activity, alcohol',
      ],
    },
    epidemiology: [
      'Affects more than 1 billion adults worldwide',
      'Prevalence increases with age',
      'A leading contributor to global cardiovascular death and disability',
      'Often undiagnosed, untreated, or inadequately controlled',
    ],
    prognosis:
      'Effective blood pressure control substantially reduces stroke, heart attack, heart failure, and kidney disease. Prognosis is excellent with sustained control and lifestyle measures; untreated hypertension causes progressive target-organ damage.',
    pathophysiology: {
      overview:
        'Increased cardiac output or systemic vascular resistance — driven by neurohormonal, renal, and vascular factors — raises arterial pressure and damages target organs.',
      steps: [
        {
          id: 'htn-1',
          label: 'Genetic & lifestyle factors',
          detail: 'Genetics, high sodium intake, obesity, and inactivity raise risk.',
          kind: 'trigger',
        },
        {
          id: 'htn-2',
          label: 'Neurohormonal & renal dysregulation',
          detail: 'RAAS and sympathetic activation and altered renal sodium handling occur.',
          kind: 'mechanism',
        },
        {
          id: 'htn-3',
          label: 'Increased vascular resistance',
          detail: 'Vasoconstriction and vascular remodeling raise resistance.',
          kind: 'mechanism',
        },
        {
          id: 'htn-4',
          label: 'Sustained pressure elevation',
          detail: 'Arterial pressure remains persistently elevated.',
          kind: 'effect',
        },
        {
          id: 'htn-5',
          label: 'Vascular & cardiac stress',
          detail: 'Chronic high pressure stiffens arteries and thickens the ventricle.',
          kind: 'effect',
        },
        {
          id: 'htn-6',
          label: 'Target-organ damage',
          detail: 'Stroke, coronary disease, heart failure, and kidney disease can result.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Blood pressure above 180/120 with chest pain, breathlessness, or neurologic symptoms — emergency',
      'Sudden severe headache, vision loss, or weakness',
      'Pregnancy with high blood pressure — seek urgent evaluation',
    ],
    citations: [
      {
        id: 'htn-c1',
        type: 'guideline',
        reference: 'ACC/AHA Guideline for the Prevention, Detection, and Management of High Blood Pressure',
        detail: 'Diagnosis thresholds and treatment targets',
        year: 2017,
      },
      {
        id: 'htn-c2',
        type: 'textbook',
        reference: "Harrison's Principles of Internal Medicine, 21st ed.",
        detail: 'Hypertensive vascular disease',
        year: 2022,
      },
      {
        id: 'htn-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Hypertension',
        detail: 'Global burden and management',
        year: 2021,
      },
    ],
    specialties: ['Cardiology', 'Primary Care', 'Nephrology'],
    trialQuery: 'hypertension',
    resourceTags: ['hypertension', 'cardiology', 'cardiovascular'],
  },

  {
    id: 'migraine',
    name: 'Migraine',
    icd10: 'G43.909',
    synonyms: ['migraine', 'migraine headache', 'migraines'],
    category: 'Neurology',
    summary:
      'Migraine is a common neurologic disorder of recurrent, often disabling headache attacks accompanied by sensory sensitivity and, in some people, aura.',
    symptoms: [
      'Moderate to severe, often one-sided, throbbing headache',
      'Worsening with physical activity',
      'Nausea or vomiting',
      'Sensitivity to light and sound',
      'Visual or sensory aura in a subset of patients',
      'Attacks lasting 4–72 hours',
    ],
    physicalFindings: [
      'Normal neurologic examination between attacks',
      'Photophobia and phonophobia during attacks',
      'Scalp or neck muscle tenderness',
      'Reversible aura findings in some patients',
    ],
    medications: {
      firstLine: [
        'Acute therapy: NSAIDs and triptans',
        'Gepants (ubrogepant, rimegepant) or lasmiditan as acute options',
        'Antiemetics as adjuncts for nausea',
      ],
      secondLine: [
        'Preventive therapy: CGRP monoclonal antibodies',
        'Oral preventives: topiramate, beta-blockers, candesartan, amitriptyline',
        'OnabotulinumtoxinA for chronic migraine',
        'Rimegepant or atogepant for preventive use',
      ],
      monitoring: [
        'Headache diary tracking frequency, triggers, and medication use',
        'Surveillance for medication-overuse headache',
        'Assessment of disability (e.g., MIDAS score)',
        'Review of lifestyle factors: sleep, hydration, stress, caffeine',
      ],
    },
    epidemiology: [
      'One of the most common and disabling neurologic disorders worldwide',
      'Roughly two to three times more common in women',
      'Peak prevalence between ages 25 and 55',
      'Strong familial and genetic component',
    ],
    prognosis:
      'Migraine is generally not life-threatening, and most people improve with a combination of acute and preventive therapy and trigger management. A minority develop chronic migraine; new CGRP-targeted therapies have improved outcomes substantially.',
    pathophysiology: {
      overview:
        'Migraine arises from a hyperexcitable brain; activation of the trigeminovascular system and release of CGRP produce pain and associated symptoms.',
      steps: [
        {
          id: 'mig-1',
          label: 'Genetic susceptibility & triggers',
          detail: 'A genetically hyperexcitable brain reacts to triggers such as stress or sleep change.',
          kind: 'trigger',
        },
        {
          id: 'mig-2',
          label: 'Cortical spreading depression',
          detail: 'A wave of neuronal depolarization underlies aura in many patients.',
          kind: 'mechanism',
        },
        {
          id: 'mig-3',
          label: 'Trigeminovascular activation',
          detail: 'The trigeminal system is activated and releases CGRP and other peptides.',
          kind: 'mechanism',
        },
        {
          id: 'mig-4',
          label: 'Neurogenic inflammation & vasodilation',
          detail: 'Meningeal vessels dilate and inflammatory mediators sensitize pain pathways.',
          kind: 'effect',
        },
        {
          id: 'mig-5',
          label: 'Central sensitization',
          detail: 'Pain pathways become sensitized, causing throbbing pain and allodynia.',
          kind: 'effect',
        },
        {
          id: 'mig-6',
          label: 'Disabling headache attack',
          detail: 'The full attack with nausea and sensory sensitivity emerges.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden, severe "thunderclap" headache reaching peak intensity within seconds',
      'New headache with fever, stiff neck, weakness, or confusion',
      'Headache that is new or markedly different after age 50',
    ],
    citations: [
      {
        id: 'mig-c1',
        type: 'guideline',
        reference: 'American Headache Society Consensus Statement on Migraine Therapy',
        detail: 'Acute and preventive treatment',
        year: 2024,
      },
      {
        id: 'mig-c2',
        type: 'textbook',
        reference: "Bradley and Daroff's Neurology in Clinical Practice, 8th ed.",
        detail: 'Headache and migraine',
        year: 2022,
      },
      {
        id: 'mig-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Migraine',
        detail: 'CGRP biology and targeted therapy',
        year: 2020,
      },
    ],
    specialties: ['Neurology', 'Primary Care'],
    trialQuery: 'migraine',
    resourceTags: ['migraine', 'neurology', 'headache'],
  },

  {
    id: 'epilepsy',
    name: 'Epilepsy',
    icd10: 'G40.909',
    synonyms: ['epilepsy', 'seizure disorder', 'seizures'],
    category: 'Neurology',
    summary:
      'Epilepsy is a chronic brain disorder characterized by an enduring predisposition to recurrent, unprovoked seizures.',
    symptoms: [
      'Recurrent seizures, focal or generalized',
      'Brief lapses of awareness or staring spells',
      'Convulsive movements with loss of consciousness',
      'Unusual sensations, automatisms, or focal motor activity',
      'Postictal confusion, fatigue, or weakness',
    ],
    physicalFindings: [
      'Often a normal exam between seizures',
      'Tongue biting or injuries suggesting a recent convulsion',
      'Postictal focal weakness (Todd paresis)',
      'Focal neurologic signs if a structural lesion is present',
    ],
    medications: {
      firstLine: [
        'Antiseizure medications chosen by seizure and epilepsy type',
        'Levetiracetam and lamotrigine — broad-spectrum, commonly used first-line',
        'Focal epilepsy options include lacosamide and carbamazepine/oxcarbazepine',
      ],
      secondLine: [
        'Combination antiseizure therapy for drug-resistant epilepsy',
        'Epilepsy surgery evaluation when two appropriate drugs fail',
        'Neurostimulation: vagus nerve, responsive, or deep brain stimulation',
        'Ketogenic dietary therapy in selected patients',
      ],
      monitoring: [
        'Seizure diary and assessment of treatment response',
        'EEG and MRI as part of classification and workup',
        'Drug levels and side-effect monitoring when relevant',
        'Counseling on driving rules, safety, and sleep',
      ],
    },
    epidemiology: [
      'Affects an estimated 50 million people worldwide',
      'Bimodal incidence, highest in young children and older adults',
      'Causes include genetic, structural, metabolic, infectious, and unknown',
      'A large share of the global burden is in low- and middle-income countries',
    ],
    prognosis:
      'About two thirds of people with epilepsy achieve good seizure control with medication. Drug-resistant epilepsy may benefit from surgery or neurostimulation. Prognosis depends on the underlying cause and epilepsy syndrome.',
    pathophysiology: {
      overview:
        'Seizures result from abnormal, hypersynchronous neuronal discharges caused by an imbalance between excitation and inhibition.',
      steps: [
        {
          id: 'epi-1',
          label: 'Underlying cause',
          detail: 'Genetic, structural, metabolic, or infectious factors predispose the brain.',
          kind: 'trigger',
        },
        {
          id: 'epi-2',
          label: 'Excitation–inhibition imbalance',
          detail: 'Excess excitatory or deficient inhibitory signaling develops.',
          kind: 'mechanism',
        },
        {
          id: 'epi-3',
          label: 'Hyperexcitable neuronal network',
          detail: 'Networks of neurons become prone to synchronous firing.',
          kind: 'mechanism',
        },
        {
          id: 'epi-4',
          label: 'Hypersynchronous discharge',
          detail: 'A burst of synchronized activity initiates a seizure.',
          kind: 'effect',
        },
        {
          id: 'epi-5',
          label: 'Seizure propagation',
          detail: 'Activity spreads locally or generalizes across the brain.',
          kind: 'effect',
        },
        {
          id: 'epi-6',
          label: 'Recurrent unprovoked seizures',
          detail: 'An enduring predisposition defines epilepsy.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'A seizure lasting longer than 5 minutes, or repeated seizures without recovery — status epilepticus (emergency)',
      'First-ever seizure',
      'Seizure with fever, head injury, or failure to wake afterward',
    ],
    citations: [
      {
        id: 'epi-c1',
        type: 'guideline',
        reference: 'ILAE Classification of the Epilepsies',
        detail: 'Seizure and epilepsy classification framework',
        year: 2017,
      },
      {
        id: 'epi-c2',
        type: 'textbook',
        reference: "Bradley and Daroff's Neurology in Clinical Practice, 8th ed.",
        detail: 'Epilepsy and seizures',
        year: 2022,
      },
      {
        id: 'epi-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Epilepsy',
        detail: 'Diagnosis and management',
        year: 2019,
      },
    ],
    specialties: ['Neurology', 'Epileptology'],
    trialQuery: 'epilepsy',
    resourceTags: ['epilepsy', 'neurology', 'seizures'],
  },

  {
    id: 'parkinsons-disease',
    name: "Parkinson's Disease",
    icd10: 'G20',
    synonyms: ['parkinson', 'parkinsons', 'parkinsons disease', 'pd'],
    category: 'Neurology',
    summary:
      "Parkinson's disease is a progressive neurodegenerative disorder caused by loss of dopaminergic neurons, producing motor and non-motor symptoms.",
    symptoms: [
      'Resting tremor, often beginning in one hand',
      'Slowness of movement (bradykinesia)',
      'Muscle rigidity',
      'Impaired balance and postural instability',
      'Reduced facial expression and soft speech',
      'Non-motor symptoms: constipation, reduced smell, sleep disturbance, mood changes',
    ],
    physicalFindings: [
      'Asymmetric resting "pill-rolling" tremor',
      'Cogwheel rigidity on passive movement',
      'Bradykinesia with decremental finger tapping',
      'Stooped posture and shuffling, festinating gait',
      'Hypomimia (masked facies) and reduced arm swing',
    ],
    medications: {
      firstLine: [
        'Levodopa combined with carbidopa — most effective symptomatic therapy',
        'Dopamine agonists in selected, often younger patients',
        'MAO-B inhibitors (rasagiline, selegiline) for early or adjunctive use',
      ],
      secondLine: [
        'COMT inhibitors (entacapone, opicapone) to extend levodopa effect',
        'Amantadine for dyskinesia',
        'Advanced therapies: deep brain stimulation, levodopa intestinal gel, infusions',
        'Targeted treatment of non-motor symptoms',
      ],
      monitoring: [
        'Tracking of motor fluctuations, "off" time, and dyskinesia',
        'Assessment of non-motor symptoms and quality of life',
        'Falls risk and gait assessment',
        'Screening for cognitive change and mood disorders',
      ],
    },
    epidemiology: [
      'The second most common neurodegenerative disease after Alzheimer disease',
      'Risk increases with age; typical onset after 60',
      'Slightly more common in men',
      'Risk is influenced by genetic and environmental factors',
    ],
    prognosis:
      'Parkinson’s disease is progressive, but symptoms are often well controlled for years with medication, and deep brain stimulation helps selected patients. Disability accrues over time, particularly from gait, balance, and non-motor symptoms; lifespan is modestly reduced.',
    pathophysiology: {
      overview:
        'Misfolded alpha-synuclein accumulates and dopaminergic neurons of the substantia nigra degenerate, depleting striatal dopamine and disrupting motor circuits.',
      steps: [
        {
          id: 'pd-1',
          label: 'Genetic & environmental risk',
          detail: 'Aging plus genetic and environmental factors increase vulnerability.',
          kind: 'trigger',
        },
        {
          id: 'pd-2',
          label: 'Alpha-synuclein misfolding',
          detail: 'Alpha-synuclein aggregates into Lewy bodies within neurons.',
          kind: 'mechanism',
        },
        {
          id: 'pd-3',
          label: 'Mitochondrial & oxidative stress',
          detail: 'Cellular stress and impaired protein clearance injure neurons.',
          kind: 'mechanism',
        },
        {
          id: 'pd-4',
          label: 'Nigral dopaminergic neuron loss',
          detail: 'Neurons of the substantia nigra progressively degenerate.',
          kind: 'effect',
        },
        {
          id: 'pd-5',
          label: 'Striatal dopamine depletion',
          detail: 'Loss of dopamine disrupts basal ganglia motor control.',
          kind: 'effect',
        },
        {
          id: 'pd-6',
          label: 'Motor & non-motor symptoms',
          detail: 'Tremor, rigidity, bradykinesia, and non-motor features emerge.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden severe worsening with high fever and rigidity — possible neuroleptic-related emergency',
      'Frequent falls or fainting',
      'Rapid cognitive decline or hallucinations',
    ],
    citations: [
      {
        id: 'pd-c1',
        type: 'textbook',
        reference: "Bradley and Daroff's Neurology in Clinical Practice, 8th ed.",
        detail: "Parkinson's disease and movement disorders",
        year: 2022,
      },
      {
        id: 'pd-c2',
        type: 'journal',
        reference: 'The Lancet — Seminar: Parkinson’s Disease',
        detail: 'Pathophysiology and management',
        year: 2021,
      },
      {
        id: 'pd-c3',
        type: 'guideline',
        reference: 'MDS Evidence-Based Review: Treatments for Motor Symptoms of PD',
        detail: 'Symptomatic pharmacotherapy',
        year: 2018,
      },
    ],
    specialties: ['Neurology', 'Movement Disorders', 'Physical Medicine & Rehabilitation'],
    trialQuery: "Parkinson disease",
    resourceTags: ['parkinsons disease', 'neurology', 'movement disorder'],
  },

  {
    id: 'hypothyroidism',
    name: 'Hypothyroidism',
    icd10: 'E03.9',
    synonyms: ['hypothyroidism', 'underactive thyroid', 'hashimoto', 'hashimotos thyroiditis'],
    category: 'Endocrinology',
    summary:
      'Hypothyroidism is a deficiency of thyroid hormone that slows metabolism; in iodine-sufficient regions it is most often caused by autoimmune thyroiditis.',
    symptoms: [
      'Fatigue and sluggishness',
      'Cold intolerance',
      'Weight gain despite stable appetite',
      'Constipation',
      'Dry skin and hair, hair thinning',
      'Low mood, slowed thinking, and poor concentration',
    ],
    physicalFindings: [
      'Bradycardia',
      'Dry, coarse skin and brittle hair',
      'Delayed relaxation phase of deep tendon reflexes',
      'Periorbital puffiness and non-pitting edema',
      'Goiter or a firm thyroid in autoimmune thyroiditis',
    ],
    medications: {
      firstLine: [
        'Levothyroxine (synthetic T4) — standard replacement therapy',
        'Weight-based dosing with adjustment to symptoms and labs',
        'Lower starting doses in older adults and those with heart disease',
      ],
      secondLine: [
        'Dose adjustment for pregnancy, which increases requirements',
        'Combination T4/T3 therapy considered only in selected, persistently symptomatic patients',
        'Careful separation of levothyroxine from interfering medications and supplements',
      ],
      monitoring: [
        'TSH measured 6–8 weeks after dose changes, then periodically',
        'Tighter TSH targets and earlier dose increases in pregnancy',
        'Symptom review at follow-up',
        'Awareness of drugs and foods that reduce levothyroxine absorption',
      ],
    },
    epidemiology: [
      'One of the most common endocrine disorders',
      'Several times more common in women',
      'Prevalence increases with age',
      'Hashimoto thyroiditis is the leading cause where iodine intake is adequate',
    ],
    prognosis:
      'Hypothyroidism is readily and effectively treated with levothyroxine, and most patients become symptom-free with appropriate dosing. It usually requires lifelong therapy; untreated severe disease can rarely progress to myxedema.',
    pathophysiology: {
      overview:
        'Reduced thyroid hormone production lowers metabolic rate across organ systems; in autoimmune disease, immune attack destroys thyroid tissue.',
      steps: [
        {
          id: 'hypo-1',
          label: 'Autoimmune or other insult',
          detail: 'Autoimmune thyroiditis, surgery, radioiodine, or drugs impair the thyroid.',
          kind: 'trigger',
        },
        {
          id: 'hypo-2',
          label: 'Thyroid tissue damage',
          detail: 'Lymphocytic infiltration and antibodies (anti-TPO) destroy thyroid cells.',
          kind: 'mechanism',
        },
        {
          id: 'hypo-3',
          label: 'Reduced T4/T3 production',
          detail: 'Thyroid hormone output falls below physiologic needs.',
          kind: 'mechanism',
        },
        {
          id: 'hypo-4',
          label: 'Compensatory TSH rise',
          detail: 'The pituitary increases TSH in an attempt to stimulate the thyroid.',
          kind: 'effect',
        },
        {
          id: 'hypo-5',
          label: 'Slowed metabolism',
          detail: 'Low hormone levels slow metabolic processes throughout the body.',
          kind: 'effect',
        },
        {
          id: 'hypo-6',
          label: 'Systemic symptoms',
          detail: 'Fatigue, cold intolerance, weight gain, and other features develop.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Profound lethargy, low body temperature, and confusion — possible myxedema (emergency)',
      'Chest pain or marked breathlessness',
      'Pregnancy with untreated or undertreated hypothyroidism',
    ],
    citations: [
      {
        id: 'hypo-c1',
        type: 'guideline',
        reference: 'American Thyroid Association Guidelines for Hypothyroidism',
        detail: 'Diagnosis and levothyroxine therapy',
        year: 2014,
      },
      {
        id: 'hypo-c2',
        type: 'textbook',
        reference: 'Williams Textbook of Endocrinology, 14th ed.',
        detail: 'Hypothyroidism',
        year: 2020,
      },
      {
        id: 'hypo-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Hypothyroidism',
        detail: 'Causes, diagnosis, and management',
        year: 2017,
      },
    ],
    specialties: ['Endocrinology', 'Primary Care'],
    trialQuery: 'hypothyroidism',
    resourceTags: ['hypothyroidism', 'endocrinology', 'thyroid'],
  },

  {
    id: 'chronic-kidney-disease',
    name: 'Chronic Kidney Disease',
    icd10: 'N18.9',
    synonyms: ['chronic kidney disease', 'ckd', 'kidney disease', 'renal failure'],
    category: 'Nephrology',
    summary:
      'Chronic kidney disease is a sustained reduction in kidney function or evidence of kidney damage lasting at least three months, classified by GFR and albuminuria.',
    symptoms: [
      'Often asymptomatic in early stages',
      'Fatigue and reduced energy',
      'Swelling of the legs or around the eyes',
      'Foamy urine from protein loss',
      'Poor appetite, nausea, and itching in advanced disease',
      'Difficulty concentrating',
    ],
    physicalFindings: [
      'Hypertension',
      'Peripheral edema',
      'Pallor from anemia',
      'Signs of fluid overload in advanced disease',
      'Uremic features (e.g., pericardial rub) in kidney failure',
    ],
    medications: {
      firstLine: [
        'ACE inhibitor or ARB to lower blood pressure and reduce albuminuria',
        'SGLT2 inhibitors to slow progression in diabetic and non-diabetic CKD',
        'Blood pressure and glycemic control of underlying disease',
      ],
      secondLine: [
        'Nonsteroidal mineralocorticoid receptor antagonist (finerenone) in diabetic CKD',
        'Management of anemia with iron and erythropoiesis-stimulating agents',
        'Treatment of mineral and bone disorder (phosphate binders, vitamin D)',
        'Preparation for kidney replacement therapy in advanced disease',
      ],
      monitoring: [
        'eGFR and urine albumin-to-creatinine ratio at least annually, more often if progressing',
        'Blood pressure, potassium, and bicarbonate',
        'Hemoglobin, iron studies, calcium, phosphate, and PTH',
        'Medication review and dose adjustment for kidney function',
      ],
    },
    epidemiology: [
      'Affects an estimated 10% of adults worldwide',
      'Diabetes and hypertension are the leading causes',
      'Prevalence increases with age',
      'Often underdiagnosed because early disease is silent',
    ],
    prognosis:
      'Many people with CKD never progress to kidney failure, especially with blood pressure control, RAAS blockade, and SGLT2 inhibitors. Risk of cardiovascular disease is high. Advanced CKD may require dialysis or transplantation.',
    pathophysiology: {
      overview:
        'An initial renal insult reduces functioning nephrons; remaining nephrons hyperfilter, accelerating injury in a self-perpetuating cycle.',
      steps: [
        {
          id: 'ckd-1',
          label: 'Initial kidney insult',
          detail: 'Diabetes, hypertension, glomerular disease, or other causes injure the kidney.',
          kind: 'trigger',
        },
        {
          id: 'ckd-2',
          label: 'Nephron loss',
          detail: 'Functioning nephrons are progressively lost.',
          kind: 'mechanism',
        },
        {
          id: 'ckd-3',
          label: 'Compensatory hyperfiltration',
          detail: 'Remaining nephrons increase filtration to maintain output.',
          kind: 'mechanism',
        },
        {
          id: 'ckd-4',
          label: 'Glomerular injury & proteinuria',
          detail: 'Hyperfiltration damages glomeruli, causing scarring and protein leak.',
          kind: 'effect',
        },
        {
          id: 'ckd-5',
          label: 'Declining GFR',
          detail: 'Filtration capacity falls and wastes and fluid accumulate.',
          kind: 'effect',
        },
        {
          id: 'ckd-6',
          label: 'Kidney failure & complications',
          detail: 'Advanced disease causes anemia, bone disease, and uremia.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Little or no urine output, severe swelling, or breathlessness',
      'Confusion, severe nausea, or chest pain in advanced CKD',
      'Symptoms of high potassium: muscle weakness or palpitations',
    ],
    citations: [
      {
        id: 'ckd-c1',
        type: 'guideline',
        reference: 'KDIGO Clinical Practice Guideline for the Evaluation and Management of CKD',
        detail: 'Classification, risk, and management',
        year: 2024,
      },
      {
        id: 'ckd-c2',
        type: 'textbook',
        reference: "Brenner and Rector's The Kidney, 11th ed.",
        detail: 'Pathophysiology of chronic kidney disease',
        year: 2020,
      },
      {
        id: 'ckd-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Chronic Kidney Disease',
        detail: 'Progression and therapy',
        year: 2021,
      },
    ],
    specialties: ['Nephrology', 'Primary Care'],
    trialQuery: 'chronic kidney disease',
    resourceTags: ['chronic kidney disease', 'nephrology', 'kidney'],
  },

  {
    id: 'sickle-cell-disease',
    name: 'Sickle Cell Disease',
    icd10: 'D57.1',
    synonyms: ['sickle cell disease', 'sickle cell anemia', 'scd'],
    category: 'Hematology',
    summary:
      'Sickle cell disease is an inherited disorder of hemoglobin in which red blood cells deform under stress, causing hemolysis, vaso-occlusion, and chronic organ damage.',
    symptoms: [
      'Episodes of severe pain (vaso-occlusive crises)',
      'Fatigue and pallor from chronic anemia',
      'Jaundice',
      'Swelling of the hands and feet in young children (dactylitis)',
      'Frequent infections',
      'Delayed growth in childhood',
    ],
    physicalFindings: [
      'Scleral icterus and pallor',
      'Splenomegaly in young children; functional asplenia later',
      'Signs of acute chest syndrome during crises',
      'Leg ulcers',
      'Findings of stroke or avascular necrosis in some patients',
    ],
    medications: {
      firstLine: [
        'Hydroxyurea to reduce pain crises and acute chest syndrome',
        'Penicillin prophylaxis in young children and vaccination against encapsulated organisms',
        'Folic acid supplementation and prompt pain management during crises',
      ],
      secondLine: [
        'L-glutamine, crizanlizumab, or voxelotor as disease-modifying options',
        'Chronic transfusion therapy for stroke prevention',
        'Hematopoietic stem-cell transplantation — potentially curative in selected patients',
        'Gene-based therapies for eligible patients',
      ],
      monitoring: [
        'Transcranial Doppler screening in children to assess stroke risk',
        'CBC, reticulocyte count, and iron status with transfusions',
        'Annual eye, kidney, and pulmonary assessments',
        'Vaccination and infection prevention',
      ],
    },
    epidemiology: [
      'One of the most common inherited blood disorders worldwide',
      'Most prevalent in people of African, Mediterranean, Middle Eastern, and South Asian ancestry',
      'Inherited in an autosomal recessive pattern',
      'Sickle cell trait is common and generally benign but is relevant for genetic counseling',
    ],
    prognosis:
      'Survival has improved dramatically with newborn screening, penicillin prophylaxis, vaccination, hydroxyurea, and transcranial Doppler screening. Disease-modifying therapies and curative transplantation or gene therapy continue to change the outlook.',
    pathophysiology: {
      overview:
        'A single beta-globin mutation produces hemoglobin S, which polymerizes when deoxygenated, deforming red cells and causing hemolysis and vaso-occlusion.',
      steps: [
        {
          id: 'scd-1',
          label: 'Beta-globin mutation',
          detail: 'A point mutation produces abnormal hemoglobin S.',
          kind: 'trigger',
        },
        {
          id: 'scd-2',
          label: 'Hemoglobin S polymerization',
          detail: 'When deoxygenated, hemoglobin S polymerizes into rigid fibers.',
          kind: 'mechanism',
        },
        {
          id: 'scd-3',
          label: 'Red-cell sickling',
          detail: 'Red cells become rigid and sickle-shaped, losing flexibility.',
          kind: 'mechanism',
        },
        {
          id: 'scd-4',
          label: 'Hemolysis & adhesion',
          detail: 'Sickled cells are destroyed early and adhere to blood vessel walls.',
          kind: 'effect',
        },
        {
          id: 'scd-5',
          label: 'Vaso-occlusion',
          detail: 'Cells obstruct small vessels, causing ischemia and pain crises.',
          kind: 'effect',
        },
        {
          id: 'scd-6',
          label: 'Chronic organ damage',
          detail: 'Repeated ischemia damages the brain, lungs, kidneys, and bones.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Fever — a medical emergency due to infection risk from functional asplenia',
      'Chest pain, breathlessness, or low oxygen — possible acute chest syndrome',
      'Sudden weakness, speech difficulty, or severe headache — possible stroke',
    ],
    citations: [
      {
        id: 'scd-c1',
        type: 'guideline',
        reference: 'ASH Clinical Practice Guidelines on Sickle Cell Disease',
        detail: 'Management of complications and transfusion',
        year: 2020,
      },
      {
        id: 'scd-c2',
        type: 'textbook',
        reference: "Hoffman's Hematology: Basic Principles and Practice, 8th ed.",
        detail: 'Sickle cell disease',
        year: 2023,
      },
      {
        id: 'scd-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Sickle Cell Disease',
        detail: 'Pathophysiology and emerging therapies',
        year: 2021,
      },
    ],
    specialties: ['Hematology', 'Primary Care'],
    infusionSpecialty: 'hematology',
    trialQuery: 'sickle cell disease',
    resourceTags: ['sickle cell disease', 'hematology', 'genetic', 'blood disorder'],
  },

  {
    id: 'hemophilia-a',
    name: 'Hemophilia A',
    icd10: 'D66',
    synonyms: ['hemophilia a', 'hemophilia', 'factor viii deficiency'],
    category: 'Hematology',
    summary:
      'Hemophilia A is an X-linked bleeding disorder caused by deficient or defective clotting factor VIII, leading to spontaneous and prolonged bleeding.',
    symptoms: [
      'Easy bruising',
      'Prolonged bleeding after injury, surgery, or dental work',
      'Spontaneous bleeding into joints causing pain and swelling',
      'Bleeding into muscles',
      'Blood in urine or stool',
      'Severity correlates with the degree of factor VIII deficiency',
    ],
    physicalFindings: [
      'Hemarthrosis with a warm, swollen, painful joint',
      'Limited joint range of motion and chronic arthropathy',
      'Muscle hematomas',
      'Signs of compartment syndrome with severe muscle bleeds',
    ],
    medications: {
      firstLine: [
        'Factor VIII replacement, including extended-half-life products',
        'Emicizumab — a subcutaneous bispecific antibody for routine prophylaxis',
        'Routine prophylaxis to prevent bleeds and protect joints',
      ],
      secondLine: [
        'Bypassing agents for patients with factor VIII inhibitors',
        'Desmopressin for selected patients with mild hemophilia A',
        'Antifibrinolytics (tranexamic acid) as adjuncts, especially for mucosal bleeding',
        'Gene therapy for eligible adults',
      ],
      monitoring: [
        'Factor VIII activity levels and bleed diary',
        'Periodic screening for factor VIII inhibitors',
        'Joint health assessment and imaging',
        'Infectious disease screening and vaccination',
      ],
    },
    epidemiology: [
      'Affects roughly 1 in 5,000 male births',
      'X-linked recessive inheritance; females are usually carriers but can have symptoms',
      'Occurs in all populations',
      'A meaningful proportion of cases arise from new mutations',
    ],
    prognosis:
      'With modern prophylaxis, many people with hemophilia A have few bleeds and near-normal life expectancy. Joint disease from past bleeds remains a concern. Emicizumab and gene therapy have substantially improved outcomes.',
    pathophysiology: {
      overview:
        'A deficiency of factor VIII impairs the intrinsic coagulation pathway, reducing thrombin generation and producing inadequate, unstable clots.',
      steps: [
        {
          id: 'hemo-1',
          label: 'F8 gene mutation',
          detail: 'A mutation in the factor VIII gene on the X chromosome causes deficiency.',
          kind: 'trigger',
        },
        {
          id: 'hemo-2',
          label: 'Reduced factor VIII activity',
          detail: 'Factor VIII is absent, low, or dysfunctional.',
          kind: 'mechanism',
        },
        {
          id: 'hemo-3',
          label: 'Impaired intrinsic pathway',
          detail: 'The coagulation cascade cannot proceed efficiently.',
          kind: 'mechanism',
        },
        {
          id: 'hemo-4',
          label: 'Reduced thrombin generation',
          detail: 'Insufficient thrombin is produced to stabilize a clot.',
          kind: 'effect',
        },
        {
          id: 'hemo-5',
          label: 'Inadequate clot formation',
          detail: 'Clots are weak and unstable, allowing continued bleeding.',
          kind: 'effect',
        },
        {
          id: 'hemo-6',
          label: 'Spontaneous & prolonged bleeding',
          detail: 'Joint, muscle, and other bleeding occurs, risking chronic arthropathy.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Head injury or sudden severe headache — risk of intracranial bleeding (emergency)',
      'Neck or throat swelling that threatens the airway',
      'Severe abdominal pain or a rapidly enlarging hematoma',
    ],
    citations: [
      {
        id: 'hemo-c1',
        type: 'guideline',
        reference: 'WFH Guidelines for the Management of Hemophilia, 3rd ed.',
        detail: 'Prophylaxis and bleed management',
        year: 2020,
      },
      {
        id: 'hemo-c2',
        type: 'textbook',
        reference: "Hoffman's Hematology: Basic Principles and Practice, 8th ed.",
        detail: 'Hemophilia A and B',
        year: 2023,
      },
      {
        id: 'hemo-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Hemophilia',
        detail: 'Non-factor therapy and gene therapy',
        year: 2021,
      },
    ],
    specialties: ['Hematology', 'Physical Medicine & Rehabilitation'],
    infusionSpecialty: 'hematology',
    trialQuery: 'hemophilia A',
    resourceTags: ['hemophilia', 'hematology', 'genetic', 'bleeding disorder'],
  },

  {
    id: 'cystic-fibrosis',
    name: 'Cystic Fibrosis',
    icd10: 'E84.9',
    synonyms: ['cystic fibrosis', 'cf'],
    category: 'Genetic',
    summary:
      'Cystic fibrosis is an inherited multisystem disease caused by CFTR dysfunction, producing thick secretions that affect the lungs, pancreas, and other organs.',
    symptoms: [
      'Chronic cough with thick sputum',
      'Recurrent lung infections',
      'Wheezing and shortness of breath',
      'Poor weight gain and growth despite good appetite',
      'Greasy, bulky stools from pancreatic insufficiency',
      'Salty-tasting skin',
    ],
    physicalFindings: [
      'Crackles and wheezes; digital clubbing',
      'Nasal polyps and chronic sinus disease',
      'Signs of malnutrition or fat-soluble vitamin deficiency',
      'Hyperinflation on chest examination',
      'Hepatosplenomegaly in CF-related liver disease',
    ],
    medications: {
      firstLine: [
        'CFTR modulator therapy (e.g., elexacaftor/tezacaftor/ivacaftor) for eligible genotypes',
        'Airway clearance techniques and inhaled mucolytics (dornase alfa, hypertonic saline)',
        'Pancreatic enzyme replacement and fat-soluble vitamin supplementation',
      ],
      secondLine: [
        'Inhaled antibiotics for chronic Pseudomonas infection',
        'Aggressive treatment of pulmonary exacerbations',
        'Management of CF-related diabetes and liver disease',
        'Lung transplantation for advanced lung disease',
      ],
      monitoring: [
        'Regular spirometry and sputum cultures',
        'Nutritional status and growth tracking',
        'Annual screening for CF-related diabetes',
        'Liver, bone, and sinus assessments',
      ],
    },
    epidemiology: [
      'Most common in people of Northern European ancestry but occurs in all groups',
      'Autosomal recessive inheritance of CFTR mutations',
      'Identified in most regions through newborn screening',
      'Median survival has risen substantially into adulthood',
    ],
    prognosis:
      'Outcomes have transformed with multidisciplinary care and, for eligible patients, highly effective CFTR modulators that improve lung function, nutrition, and quality of life. Lung disease remains the leading cause of morbidity.',
    pathophysiology: {
      overview:
        'Mutations in the CFTR chloride channel impair ion and water transport, producing thick, sticky secretions that obstruct and damage multiple organs.',
      steps: [
        {
          id: 'cf-1',
          label: 'CFTR gene mutations',
          detail: 'Inherited CFTR mutations impair the chloride channel.',
          kind: 'trigger',
        },
        {
          id: 'cf-2',
          label: 'Defective ion transport',
          detail: 'Abnormal chloride and sodium transport alters secretions.',
          kind: 'mechanism',
        },
        {
          id: 'cf-3',
          label: 'Thick, dehydrated secretions',
          detail: 'Mucus and other secretions become viscous and sticky.',
          kind: 'mechanism',
        },
        {
          id: 'cf-4',
          label: 'Airway obstruction & infection',
          detail: 'Mucus plugs airways and promotes chronic bacterial infection.',
          kind: 'effect',
        },
        {
          id: 'cf-5',
          label: 'Organ damage',
          detail: 'Chronic inflammation damages lungs; ducts in the pancreas obstruct.',
          kind: 'effect',
        },
        {
          id: 'cf-6',
          label: 'Multisystem disease',
          detail: 'Lung disease, pancreatic insufficiency, and other complications develop.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Coughing up significant blood (hemoptysis)',
      'Sudden sharp chest pain and breathlessness — possible pneumothorax',
      'Rapidly worsening cough, breathlessness, or fever — pulmonary exacerbation',
    ],
    citations: [
      {
        id: 'cf-c1',
        type: 'guideline',
        reference: 'Cystic Fibrosis Foundation Clinical Care Guidelines',
        detail: 'Pulmonary and nutritional management',
        year: 2023,
      },
      {
        id: 'cf-c2',
        type: 'textbook',
        reference: "Murray and Nadel's Textbook of Respiratory Medicine, 7th ed.",
        detail: 'Cystic fibrosis',
        year: 2022,
      },
      {
        id: 'cf-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Cystic Fibrosis and CFTR Modulators',
        detail: 'Modulator therapy outcomes',
        year: 2021,
      },
    ],
    specialties: ['Pulmonology', 'Gastroenterology', 'Genetics'],
    trialQuery: 'cystic fibrosis',
    resourceTags: ['cystic fibrosis', 'genetic', 'pulmonology', 'respiratory'],
  },

  {
    id: 'ankylosing-spondylitis',
    name: 'Ankylosing Spondylitis',
    icd10: 'M45.9',
    synonyms: ['ankylosing spondylitis', 'as', 'axial spondyloarthritis', 'spondylitis'],
    category: 'Rheumatology',
    summary:
      'Ankylosing spondylitis is a chronic inflammatory arthritis of the axial skeleton that can lead to spinal fusion and reduced mobility.',
    symptoms: [
      'Chronic low back and buttock pain with insidious onset before age 45',
      'Inflammatory features: morning stiffness and improvement with exercise',
      'Pain that worsens with rest and at night',
      'Hip, shoulder, or peripheral joint pain',
      'Heel pain from enthesitis',
      'Fatigue',
    ],
    physicalFindings: [
      'Reduced spinal mobility (e.g., abnormal Schober test)',
      'Tenderness over the sacroiliac joints',
      'Reduced chest expansion',
      'Enthesitis at the heel or other sites',
      'Loss of lumbar lordosis and increased thoracic kyphosis in advanced disease',
    ],
    medications: {
      firstLine: [
        'NSAIDs — first-line and often effective for symptom control',
        'Structured exercise and physical therapy',
        'Patient education on posture and activity',
      ],
      secondLine: [
        'TNF inhibitors for active disease despite NSAIDs',
        'IL-17 inhibitors (secukinumab, ixekizumab)',
        'JAK inhibitors (upadacitinib, tofacitinib)',
        'Local glucocorticoid injections for enthesitis or sacroiliitis',
      ],
      monitoring: [
        'Disease activity indices (e.g., ASDAS, BASDAI)',
        'Spinal mobility and function assessment',
        'Screening for uveitis, inflammatory bowel disease, and psoriasis',
        'Tuberculosis screening and infection surveillance with biologics',
      ],
    },
    epidemiology: [
      'Part of the axial spondyloarthritis spectrum',
      'Strongly associated with HLA-B27',
      'Typical onset in late adolescence and early adulthood',
      'Historically diagnosed more in men, though it affects women as well',
    ],
    prognosis:
      'Course is variable; many patients maintain good function with exercise and modern therapy. TNF and IL-17 inhibitors relieve symptoms and may slow progression. Untreated disease can cause spinal fusion and disability.',
    pathophysiology: {
      overview:
        'Inflammation centered at entheses, driven in part by the IL-17/IL-23 axis, leads to new bone formation and, over time, spinal ankylosis.',
      steps: [
        {
          id: 'as-1',
          label: 'Genetic predisposition',
          detail: 'HLA-B27 and other genes confer susceptibility.',
          kind: 'trigger',
        },
        {
          id: 'as-2',
          label: 'Enthesitis',
          detail: 'Inflammation begins where tendons and ligaments attach to bone.',
          kind: 'mechanism',
        },
        {
          id: 'as-3',
          label: 'IL-23/IL-17 immune activation',
          detail: 'Cytokine pathways amplify inflammation at the axial skeleton.',
          kind: 'mechanism',
        },
        {
          id: 'as-4',
          label: 'Sacroiliac & spinal inflammation',
          detail: 'Inflammation involves the sacroiliac joints and spine.',
          kind: 'effect',
        },
        {
          id: 'as-5',
          label: 'New bone formation',
          detail: 'Healing inflammation triggers syndesmophyte (new bone) formation.',
          kind: 'effect',
        },
        {
          id: 'as-6',
          label: 'Spinal ankylosis',
          detail: 'Progressive fusion reduces spinal mobility.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden severe back pain after minor trauma — fused spine is prone to fracture',
      'New eye redness and pain with light sensitivity — possible acute uveitis',
      'New leg weakness, numbness, or bladder changes',
    ],
    citations: [
      {
        id: 'as-c1',
        type: 'guideline',
        reference: 'ACR/SAA/SPARTAN Guideline for Axial Spondyloarthritis',
        detail: 'Pharmacologic and non-pharmacologic management',
        year: 2019,
      },
      {
        id: 'as-c2',
        type: 'textbook',
        reference: "Kelley & Firestein's Textbook of Rheumatology, 11th ed.",
        detail: 'Spondyloarthritis',
        year: 2021,
      },
      {
        id: 'as-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Axial Spondyloarthritis',
        detail: 'Diagnosis and treatment',
        year: 2021,
      },
    ],
    specialties: ['Rheumatology', 'Physical Medicine & Rehabilitation'],
    infusionSpecialty: 'rheumatology',
    trialQuery: 'ankylosing spondylitis',
    resourceTags: ['ankylosing spondylitis', 'rheumatology', 'autoimmune', 'arthritis'],
  },

  {
    id: 'psoriatic-arthritis',
    name: 'Psoriatic Arthritis',
    icd10: 'L40.50',
    synonyms: ['psoriatic arthritis', 'psa'],
    category: 'Rheumatology',
    summary:
      'Psoriatic arthritis is an inflammatory arthritis associated with psoriasis that can involve joints, entheses, the spine, skin, and nails.',
    symptoms: [
      'Joint pain, swelling, and stiffness',
      'Sausage-like swelling of an entire finger or toe (dactylitis)',
      'Heel or other enthesitis pain',
      'Skin psoriasis and nail changes',
      'Inflammatory back pain in some patients',
      'Fatigue',
    ],
    physicalFindings: [
      'Synovitis, which may be asymmetric',
      'Dactylitis of digits',
      'Enthesitis at the Achilles tendon or plantar fascia',
      'Nail pitting and onycholysis',
      'Skin plaques of psoriasis',
    ],
    medications: {
      firstLine: [
        'NSAIDs for mild disease and symptom relief',
        'Conventional DMARDs (methotrexate) for peripheral arthritis',
        'Early referral and treat-to-target management',
      ],
      secondLine: [
        'TNF inhibitors',
        'IL-17 inhibitors and IL-23 inhibitors',
        'JAK inhibitors and apremilast (PDE4 inhibitor)',
        'Local injections for isolated enthesitis or dactylitis',
      ],
      monitoring: [
        'Assessment of joints, entheses, skin, and nails',
        'Disease activity measures for arthritis and psoriasis',
        'Cardiometabolic risk assessment',
        'Drug-specific labs and tuberculosis screening before biologics',
      ],
    },
    epidemiology: [
      'Develops in roughly a quarter to a third of people with psoriasis',
      'Onset typically between ages 30 and 50',
      'Affects men and women similarly',
      'Skin psoriasis usually precedes arthritis, but joint disease can come first',
    ],
    prognosis:
      'With early diagnosis and modern targeted therapy, many patients control both joint and skin disease and avoid erosive damage. Untreated disease can cause joint damage and disability; it is managed as a systemic inflammatory condition.',
    pathophysiology: {
      overview:
        'Immune activation involving the TNF and IL-23/IL-17 axes drives inflammation at synovium and entheses, with both bone erosion and new bone formation.',
      steps: [
        {
          id: 'psa-1',
          label: 'Genetic & psoriatic background',
          detail: 'Genetic risk and skin psoriasis set the stage for joint disease.',
          kind: 'trigger',
        },
        {
          id: 'psa-2',
          label: 'Enthesis & synovial immune activation',
          detail: 'Inflammation arises at entheses and synovium.',
          kind: 'mechanism',
        },
        {
          id: 'psa-3',
          label: 'TNF and IL-23/IL-17 signaling',
          detail: 'Key cytokine pathways amplify joint and skin inflammation.',
          kind: 'mechanism',
        },
        {
          id: 'psa-4',
          label: 'Synovitis, enthesitis, dactylitis',
          detail: 'Characteristic joint, enthesis, and digit inflammation develops.',
          kind: 'effect',
        },
        {
          id: 'psa-5',
          label: 'Bone erosion & new bone formation',
          detail: 'PsA uniquely shows both joint erosion and abnormal new bone.',
          kind: 'effect',
        },
        {
          id: 'psa-6',
          label: 'Joint damage & disability',
          detail: 'Untreated inflammation leads to structural damage.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Sudden hot, severely swollen single joint with fever — rule out infection or gout',
      'New eye pain and redness — possible uveitis',
      'Rapidly progressive joint deformity',
    ],
    citations: [
      {
        id: 'psa-c1',
        type: 'guideline',
        reference: 'ACR/NPF Guideline for the Treatment of Psoriatic Arthritis',
        detail: 'Treatment recommendations',
        year: 2018,
      },
      {
        id: 'psa-c2',
        type: 'textbook',
        reference: "Kelley & Firestein's Textbook of Rheumatology, 11th ed.",
        detail: 'Psoriatic arthritis',
        year: 2021,
      },
      {
        id: 'psa-c3',
        type: 'journal',
        reference: 'The Lancet — Seminar: Psoriatic Arthritis',
        detail: 'Domains of disease and targeted therapy',
        year: 2020,
      },
    ],
    specialties: ['Rheumatology', 'Dermatology'],
    infusionSpecialty: 'rheumatology',
    trialQuery: 'psoriatic arthritis',
    resourceTags: ['psoriatic arthritis', 'rheumatology', 'autoimmune', 'psoriasis'],
  },

  {
    id: 'celiac-disease',
    name: 'Celiac Disease',
    icd10: 'K90.0',
    synonyms: ['celiac disease', 'coeliac disease', 'celiac', 'gluten enteropathy'],
    category: 'Gastroenterology',
    summary:
      'Celiac disease is an immune-mediated enteropathy triggered by dietary gluten in genetically susceptible people, causing small-intestinal damage.',
    symptoms: [
      'Diarrhea, bloating, and abdominal pain',
      'Weight loss or poor growth',
      'Fatigue',
      'Iron-deficiency anemia',
      'An itchy, blistering rash (dermatitis herpetiformis)',
      'Many patients have minimal or non-classical symptoms',
    ],
    physicalFindings: [
      'Signs of nutrient deficiency (pallor, glossitis)',
      'Abdominal distension',
      'Dermatitis herpetiformis on extensor surfaces',
      'Low bone density in long-standing disease',
      'Often a normal examination',
    ],
    medications: {
      firstLine: [
        'A strict, lifelong gluten-free diet — the cornerstone of treatment',
        'Dietitian-supported education on hidden gluten and cross-contact',
        'Correction of nutritional deficiencies (iron, folate, vitamin D, calcium)',
      ],
      secondLine: [
        'Evaluation for non-responsive celiac disease, often due to gluten exposure',
        'Assessment for refractory celiac disease when symptoms persist on a strict diet',
        'Bone density evaluation and management',
      ],
      monitoring: [
        'Celiac serology (tissue transglutaminase IgG/IgA) to assess dietary adherence',
        'Symptom review and nutritional assessment',
        'Repeat duodenal biopsy in selected cases',
        'Screening for associated autoimmune conditions',
      ],
    },
    epidemiology: [
      'Affects roughly 1% of people in many populations',
      'Requires the HLA-DQ2 or HLA-DQ8 genotype',
      'Often underdiagnosed because presentations are varied',
      'Associated with type 1 diabetes and autoimmune thyroid disease',
    ],
    prognosis:
      'A strict gluten-free diet allows intestinal healing and resolution of symptoms in most patients, and reduces long-term complications. A small proportion have non-responsive or refractory disease requiring further evaluation.',
    pathophysiology: {
      overview:
        'In genetically susceptible people, gluten peptides trigger an adaptive immune response that damages the small-intestinal mucosa.',
      steps: [
        {
          id: 'cel-1',
          label: 'Genetic susceptibility & gluten',
          detail: 'HLA-DQ2/DQ8 genotype plus dietary gluten exposure is required.',
          kind: 'trigger',
        },
        {
          id: 'cel-2',
          label: 'Gluten peptide modification',
          detail: 'Tissue transglutaminase modifies gluten peptides, increasing immunogenicity.',
          kind: 'mechanism',
        },
        {
          id: 'cel-3',
          label: 'Adaptive immune activation',
          detail: 'Gluten-specific T cells drive an inflammatory response.',
          kind: 'mechanism',
        },
        {
          id: 'cel-4',
          label: 'Mucosal inflammation',
          detail: 'Immune attack damages the small-intestinal lining.',
          kind: 'effect',
        },
        {
          id: 'cel-5',
          label: 'Villous atrophy',
          detail: 'Loss of intestinal villi reduces absorptive surface.',
          kind: 'effect',
        },
        {
          id: 'cel-6',
          label: 'Malabsorption & deficiencies',
          detail: 'Impaired absorption causes anemia, deficiencies, and symptoms.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Severe ongoing weight loss or symptoms despite a strict gluten-free diet',
      'New abdominal mass, severe pain, or significant bleeding',
      'Persistent severe deficiencies requiring evaluation',
    ],
    citations: [
      {
        id: 'cel-c1',
        type: 'guideline',
        reference: 'ACG Clinical Guideline: Diagnosis and Management of Celiac Disease',
        detail: 'Diagnosis and dietary management',
        year: 2023,
      },
      {
        id: 'cel-c2',
        type: 'textbook',
        reference: "Sleisenger and Fordtran's Gastrointestinal and Liver Disease, 11th ed.",
        detail: 'Celiac disease',
        year: 2021,
      },
      {
        id: 'cel-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Celiac Disease',
        detail: 'Immunopathogenesis and diagnosis',
        year: 2019,
      },
    ],
    specialties: ['Gastroenterology', 'Primary Care'],
    trialQuery: 'celiac disease',
    resourceTags: ['celiac disease', 'gastroenterology', 'autoimmune'],
  },

  {
    id: 'gerd',
    name: 'Gastroesophageal Reflux Disease',
    icd10: 'K21.9',
    synonyms: ['gerd', 'acid reflux', 'reflux', 'gastroesophageal reflux disease', 'heartburn'],
    category: 'Gastroenterology',
    summary:
      'GERD is a chronic condition in which reflux of stomach contents into the esophagus causes troublesome symptoms or mucosal injury.',
    symptoms: [
      'Heartburn, often after meals or when lying down',
      'Regurgitation of acid or food',
      'Chest discomfort',
      'Difficulty or pain with swallowing',
      'Chronic cough, hoarseness, or sore throat',
      'Symptoms worse at night',
    ],
    physicalFindings: [
      'Often a normal examination',
      'Dental erosion in long-standing reflux',
      'Epigastric tenderness in some patients',
      'Findings of complications (e.g., stricture) on endoscopy',
    ],
    medications: {
      firstLine: [
        'Lifestyle measures: weight loss, head-of-bed elevation, avoiding late meals',
        'Proton pump inhibitors for frequent or severe symptoms or esophagitis',
        'H2-receptor antagonists for milder or intermittent symptoms',
      ],
      secondLine: [
        'Optimizing PPI timing and dosing for inadequate response',
        'Potassium-competitive acid blockers where available',
        'Evaluation for refractory symptoms, including pH and motility testing',
        'Anti-reflux surgery or endoscopic therapy in selected patients',
      ],
      monitoring: [
        'Symptom response and step-down to the lowest effective therapy',
        'Endoscopy for alarm features or long-standing symptoms',
        'Barrett esophagus surveillance when indicated',
        'Review of medications and foods that worsen reflux',
      ],
    },
    epidemiology: [
      'One of the most common gastrointestinal conditions',
      'Affects a substantial share of adults at least weekly',
      'Risk factors include obesity, hiatal hernia, pregnancy, and smoking',
      'Prevalence is high across many regions worldwide',
    ],
    prognosis:
      'GERD is usually well controlled with lifestyle changes and acid-suppressing therapy. A minority develop complications such as stricture or Barrett esophagus. With appropriate management, quality of life is typically good.',
    pathophysiology: {
      overview:
        'A weak or transiently relaxing lower esophageal sphincter allows gastric contents to reflux, exposing the esophagus to acid and causing injury.',
      steps: [
        {
          id: 'gerd-1',
          label: 'Predisposing factors',
          detail: 'Obesity, hiatal hernia, and other factors promote reflux.',
          kind: 'trigger',
        },
        {
          id: 'gerd-2',
          label: 'Lower esophageal sphincter dysfunction',
          detail: 'Transient relaxations or low sphincter tone allow reflux.',
          kind: 'mechanism',
        },
        {
          id: 'gerd-3',
          label: 'Reflux of gastric contents',
          detail: 'Acid and other contents move retrograde into the esophagus.',
          kind: 'mechanism',
        },
        {
          id: 'gerd-4',
          label: 'Esophageal acid exposure',
          detail: 'Prolonged acid contact irritates the esophageal lining.',
          kind: 'effect',
        },
        {
          id: 'gerd-5',
          label: 'Mucosal injury & symptoms',
          detail: 'Inflammation produces heartburn, regurgitation, and possible esophagitis.',
          kind: 'effect',
        },
        {
          id: 'gerd-6',
          label: 'Complications',
          detail: 'Untreated reflux can cause stricture or Barrett esophagus.',
          kind: 'outcome',
        },
      ],
    },
    redFlags: [
      'Difficulty swallowing, food sticking, or unintentional weight loss',
      'Vomiting blood or black, tarry stools',
      'Chest pain that could be cardiac — seek urgent evaluation',
    ],
    citations: [
      {
        id: 'gerd-c1',
        type: 'guideline',
        reference: 'ACG Clinical Guideline for the Diagnosis and Management of GERD',
        detail: 'Diagnosis and acid-suppressive therapy',
        year: 2022,
      },
      {
        id: 'gerd-c2',
        type: 'textbook',
        reference: "Sleisenger and Fordtran's Gastrointestinal and Liver Disease, 11th ed.",
        detail: 'Gastroesophageal reflux disease',
        year: 2021,
      },
      {
        id: 'gerd-c3',
        type: 'journal',
        reference: 'N Engl J Med — Review: Gastroesophageal Reflux Disease',
        detail: 'Management strategies',
        year: 2020,
      },
    ],
    specialties: ['Gastroenterology', 'Primary Care'],
    trialQuery: 'gastroesophageal reflux disease',
    resourceTags: ['gerd', 'gastroenterology', 'reflux'],
  },
];

export function getConditionById(id: string): Condition | undefined {
  return CONDITIONS.find((c) => c.id === id);
}

export const CONDITION_CATEGORIES = Array.from(
  new Set(CONDITIONS.map((c) => c.category)),
).sort();
