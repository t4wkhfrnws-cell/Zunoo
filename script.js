/* ============================================================
   ZUUNO — script.js

   Working features:
     - Bottom tab-bar navigation                        (v2-v3)
     - Chatbot with intent detection, typing indicator,
       cited answers, safety guardrail                  (v4-v9)
     - Providers, Pharmacy, Trials, Resources tabs       (v6)
     - Settings, Premium, onboarding, accessibility,
       persistence, personalization                     (v7)
     - Interactive maps, PDF report, share, account     (v8)
     - Live ClinicalTrials.gov trials, multi-condition
       onboarding, expanded data                        (v9)

   The medical content is educational reference information only.
   It is not medical advice and does not diagnose or prescribe.
   ============================================================ */

(function () {
  "use strict";

  /* ========================================================
     2. SHARED HELPERS + LOCAL STORAGE
     ======================================================== */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function telHref(phone) {
    return "tel:" + String(phone).replace(/[^0-9+]/g, "");
  }

  function mapsHref(address) {
    return "https://www.openstreetmap.org/search?query=" + encodeURIComponent(address);
  }

  function truncate(str, max) {
    str = String(str || "").replace(/\s+/g, " ").trim();
    return str.length > max ? str.slice(0, max).trim() + "…" : str;
  }

  /* v12 — render a distance chip; shows real distance when the user
     has opted into geolocation, otherwise falls back to the sample
     distance baked into the record. */
  function distanceChip(item) {
    var d = (typeof distanceMiFor === "function") ? distanceMiFor(item) : item.distanceMi;
    if (d == null) return "";
    var label = d.toFixed(1) + " mi";
    if (typeof userLocation !== "undefined" && userLocation && userLocation.on) {
      label += " away";
    }
    return '<span class="chip chip-teal">' + label + "</span>";
  }

  var STORE = {
    get: function (key, fallback) {
      try {
        var raw = localStorage.getItem("zuuno_" + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch (e) {
        return fallback;
      }
    },
    set: function (key, value) {
      try {
        localStorage.setItem("zuuno_" + key, JSON.stringify(value));
      } catch (e) {
        /* storage unavailable — non-fatal */
      }
    },
  };

  var ICON_PATHS = {
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>',
    phone:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    star: '<path d="M12 2l3 6.3 6.9 1-5 4.9 1.2 6.9L12 18.8 5.9 21l1.2-6.9-5-4.9 6.9-1z"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    pill: '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4a2 2 0 0 0 1.8-3l-5-9V3"/><path d="M7 15h10"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    sparkle: '<path d="M12 3l2.2 6.3L20.5 12l-6.3 2.2L12 21l-2.2-6.8L3.5 12l6.3-2.2z"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    share:
      '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5"/>',
    copy:
      '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    building:
      '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M9 6h.01M15 6h.01M9 10h.01M15 10h.01M9 14h.01M15 14h.01"/>',
  };

  function icon(name) {
    return (
      '<svg viewBox="0 0 24 24" class="ic-sm" aria-hidden="true">' +
      (ICON_PATHS[name] || "") +
      "</svg>"
    );
  }

  function emptyState(iconName, title, message) {
    return (
      '<div class="empty-state">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      (ICON_PATHS[iconName] || "") +
      "</svg><h3>" +
      escapeHtml(title) +
      "</h3><p>" +
      escapeHtml(message) +
      "</p></div>"
    );
  }

  function fillSelect(selectEl, values) {
    for (var i = 0; i < values.length; i++) {
      var option = document.createElement("option");
      option.value = values[i];
      option.textContent = values[i];
      selectEl.appendChild(option);
    }
  }

  function uniqueField(list, field) {
    var seen = {};
    var out = [];
    for (var i = 0; i < list.length; i++) {
      var v = list[i][field];
      if (v && !seen[v]) {
        seen[v] = true;
        out.push(v);
      }
    }
    out.sort();
    return out;
  }

  function countTrue(map) {
    var n = 0;
    for (var k in map) {
      if (map[k] === true) n += 1;
    }
    return n;
  }

  /* ========================================================
     1. TAB NAVIGATION
     ======================================================== */
  var tabs = document.querySelectorAll(".tab");
  var screens = document.querySelectorAll(".screen");

  function showScreen(targetId) {
    screens.forEach(function (screen) {
      screen.classList.toggle("active", screen.id === targetId);
    });
    tabs.forEach(function (tab) {
      tab.classList.toggle("on", tab.getAttribute("data-target") === targetId);
    });
    window.scrollTo(0, 0);

    if (targetId === "screen-providers") {
      ensureProviderMap();
      if (providerMap) {
        window.setTimeout(function () {
          providerMap.invalidateSize();
          drawProviderMarkers();
        }, 80);
      }
    }
    if (targetId === "screen-pharmacy") {
      ensurePharmacyMap();
      if (pharmacyMap) {
        window.setTimeout(function () {
          pharmacyMap.invalidateSize();
          drawPharmacyMarkers();
        }, 80);
      }
    }
    if (targetId === "screen-trials") {
      maybeAutoSearchTrials();
    }
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      if (target) {
        showScreen(target);
      }
    });
  });

  /* ========================================================
     3. CONDITION KNOWLEDGE BASE
     ======================================================== */
  var CONDITIONS = [
    {
      name: "Systemic Lupus Erythematosus",
      icd10: "M32.9",
      synonyms: ["lupus", "sle", "systemic lupus"],
      summary:
        "Systemic lupus erythematosus is a chronic autoimmune disease in which the immune system attacks multiple organs, producing a relapsing and remitting course.",
      symptoms: [
        "Fatigue and general malaise",
        "Joint pain and morning stiffness",
        "Photosensitive skin rashes, including the malar (butterfly) rash",
        "Recurrent low-grade fevers",
        "Hair loss and mouth ulcers",
      ],
      medsFirst: [
        "Hydroxychloroquine for nearly all patients to reduce flares",
        "NSAIDs for mild joint and muscle symptoms",
        "Short courses of corticosteroids for active disease",
      ],
      medsSecond: [
        "Immunosuppressants such as mycophenolate or azathioprine",
        "Biologic therapy (belimumab, anifrolumab) for moderate-to-severe disease",
      ],
      prognosis:
        "With modern treatment, more than 90% of people live well beyond ten years after diagnosis. Outcomes depend mainly on kidney and neurological involvement, so regular monitoring is important.",
      citations: [
        "Harrison's Principles of Internal Medicine, 21st ed. (2022)",
        "EULAR recommendations for the management of SLE (2023)",
      ],
    },
    {
      name: "Rheumatoid Arthritis",
      icd10: "M06.9",
      synonyms: ["rheumatoid arthritis", "ra", "rheumatoid"],
      summary:
        "Rheumatoid arthritis is a chronic autoimmune disease that causes symmetric inflammation of the joints and can lead to joint damage if untreated.",
      symptoms: [
        "Symmetric pain and swelling of the small joints of the hands and feet",
        "Morning stiffness lasting more than an hour",
        "Fatigue and low-grade fever",
        "Reduced grip strength",
        "Symptoms that improve with movement during the day",
      ],
      medsFirst: [
        "Methotrexate, the anchor disease-modifying drug (DMARD)",
        "Short-term low-dose corticosteroids as a bridge",
        "Folic acid taken alongside methotrexate",
      ],
      medsSecond: [
        "Biologic DMARDs such as TNF inhibitors (adalimumab, etanercept)",
        "JAK inhibitors (tofacitinib, upadacitinib)",
      ],
      prognosis:
        "Early treatment aimed at remission lets most people stay active and avoid joint damage. Untreated disease can cause permanent joint deformity.",
      citations: [
        "Kelley & Firestein's Textbook of Rheumatology, 11th ed. (2021)",
        "ACR Guideline for the Treatment of Rheumatoid Arthritis (2021)",
      ],
    },
    {
      name: "Type 2 Diabetes Mellitus",
      icd10: "E11.9",
      synonyms: ["type 2 diabetes", "diabetes", "t2dm", "adult onset diabetes"],
      summary:
        "Type 2 diabetes is a chronic condition in which the body becomes resistant to insulin and blood sugar rises over time.",
      symptoms: [
        "Increased thirst and frequent urination",
        "Unexplained fatigue",
        "Blurred vision",
        "Slow-healing wounds and frequent infections",
        "Often no symptoms early on — found on routine screening",
      ],
      medsFirst: [
        "Metformin together with lifestyle change (diet and activity)",
        "SGLT2 inhibitors when heart or kidney disease is present",
        "GLP-1 receptor agonists when weight loss is a priority",
      ],
      medsSecond: [
        "Sulfonylureas or DPP-4 inhibitors as add-on therapy",
        "Insulin when blood sugar targets are not met",
      ],
      prognosis:
        "With good control of blood sugar, blood pressure and cholesterol, complications can be greatly reduced. Poorly controlled diabetes can damage the eyes, kidneys, nerves and heart.",
      citations: [
        "ADA Standards of Care in Diabetes — 2024",
        "Harrison's Principles of Internal Medicine, 21st ed. (2022)",
      ],
    },
    {
      name: "Type 1 Diabetes Mellitus",
      icd10: "E10.9",
      synonyms: ["type 1 diabetes", "t1d", "juvenile diabetes", "insulin dependent diabetes"],
      summary:
        "Type 1 diabetes is an autoimmune condition in which the pancreas stops making insulin, so lifelong insulin treatment is required.",
      symptoms: [
        "Rapid onset of excessive thirst and urination",
        "Unintentional weight loss",
        "Increased hunger",
        "Fatigue and weakness",
        "Blurred vision",
      ],
      medsFirst: [
        "Basal-bolus insulin (long-acting plus mealtime insulin)",
        "Insulin pump therapy as an alternative",
        "Carbohydrate counting and dose-adjustment education",
      ],
      medsSecond: [
        "Automated insulin delivery (hybrid closed-loop) systems",
        "Continuous glucose monitoring to guide dosing",
      ],
      prognosis:
        "With modern insulin and glucose monitoring, people with type 1 diabetes can live long, full lives. Tight glucose control lowers the long-term risk of complications.",
      citations: [
        "ADA Standards of Care in Diabetes — 2024",
        "The Lancet Seminar: Type 1 Diabetes (2023)",
      ],
    },
    {
      name: "Asthma",
      icd10: "J45.909",
      synonyms: ["asthma", "bronchial asthma", "reactive airway disease"],
      summary:
        "Asthma is a chronic condition in which the airways become inflamed and narrow, causing episodes of breathing difficulty.",
      symptoms: [
        "Episodic wheezing",
        "Shortness of breath",
        "Chest tightness",
        "Cough, often worse at night or early morning",
        "Symptoms triggered by allergens, exercise, cold air or infection",
      ],
      medsFirst: [
        "Inhaled corticosteroid, the foundation of long-term control",
        "Inhaled corticosteroid combined with formoterol as reliever and maintenance",
        "Short-acting bronchodilator (albuterol) for quick relief",
      ],
      medsSecond: [
        "Long-acting bronchodilator added to the inhaled steroid",
        "Biologic therapy for severe asthma",
      ],
      prognosis:
        "Most people achieve good control with inhaled medication and by avoiding triggers, and can live normally. Poorly controlled asthma raises the risk of dangerous flare-ups.",
      citations: [
        "GINA Global Strategy for Asthma Management and Prevention (2024)",
        "Murray and Nadel's Textbook of Respiratory Medicine, 7th ed. (2022)",
      ],
    },
    {
      name: "Chronic Obstructive Pulmonary Disease",
      icd10: "J44.9",
      synonyms: ["copd", "chronic obstructive pulmonary disease", "emphysema", "chronic bronchitis"],
      summary:
        "COPD is a progressive lung disease, usually caused by smoking, that makes breathing increasingly difficult.",
      symptoms: [
        "Shortness of breath, especially with activity",
        "Chronic cough",
        "Sputum (phlegm) production",
        "Wheezing and chest tightness",
        "Frequent chest infections",
      ],
      medsFirst: [
        "Long-acting bronchodilator inhalers (LABA and/or LAMA)",
        "Short-acting bronchodilator for quick relief",
        "Smoking cessation — the single most important step",
      ],
      medsSecond: [
        "Inhaled corticosteroid added for frequent flare-ups",
        "Pulmonary rehabilitation and, when needed, long-term oxygen",
      ],
      prognosis:
        "COPD cannot be cured, but stopping smoking, using inhalers and pulmonary rehabilitation can slow it down and improve quality of life.",
      citations: [
        "GOLD Global Strategy for the Diagnosis and Management of COPD (2024)",
        "Murray and Nadel's Textbook of Respiratory Medicine, 7th ed. (2022)",
      ],
    },
    {
      name: "Hypertension",
      icd10: "I10",
      synonyms: ["hypertension", "high blood pressure", "htn"],
      summary:
        "Hypertension is persistently high blood pressure, and a major risk factor for stroke, heart attack and kidney disease.",
      symptoms: [
        "Usually no symptoms — often called a silent condition",
        "Headache can occur with very high readings",
        "Most cases are found on routine blood pressure checks",
      ],
      medsFirst: [
        "Thiazide-type diuretics",
        "ACE inhibitors or angiotensin receptor blockers (ARBs)",
        "Calcium-channel blockers",
      ],
      medsSecond: [
        "Combination therapy when one medication is not enough",
        "Spironolactone for resistant high blood pressure",
      ],
      prognosis:
        "Controlling blood pressure greatly lowers the risk of stroke and heart disease. The outlook is excellent with treatment and lifestyle changes.",
      citations: [
        "ACC/AHA Guideline for the Management of High Blood Pressure (2017)",
        "Harrison's Principles of Internal Medicine, 21st ed. (2022)",
      ],
    },
    {
      name: "Heart Failure",
      icd10: "I50.9",
      synonyms: ["heart failure", "chf", "congestive heart failure"],
      summary:
        "Heart failure is a condition in which the heart cannot pump blood as well as it should, causing fluid build-up and fatigue.",
      symptoms: [
        "Shortness of breath with activity or when lying flat",
        "Swelling of the legs, ankles or abdomen",
        "Fatigue and reduced exercise tolerance",
        "Waking at night short of breath",
        "Rapid weight gain from fluid retention",
      ],
      medsFirst: [
        "An ARNI (sacubitril/valsartan) or an ACE inhibitor/ARB",
        "An evidence-based beta-blocker",
        "A mineralocorticoid receptor antagonist (spironolactone)",
        "An SGLT2 inhibitor",
      ],
      medsSecond: [
        "Loop diuretics to relieve fluid build-up",
        "Device therapy (such as an ICD) for selected patients",
      ],
      prognosis:
        "Modern combination therapy markedly improves survival and reduces hospital stays. Daily weight checks and taking medication consistently are important.",
      citations: [
        "AHA/ACC/HFSA Guideline for the Management of Heart Failure (2022)",
        "Braunwald's Heart Disease, 12th ed. (2022)",
      ],
    },
    {
      name: "Migraine",
      icd10: "G43.909",
      synonyms: ["migraine", "migraines", "migraine headache"],
      summary:
        "Migraine is a neurological condition causing recurrent, often disabling headaches with sensitivity to light and sound.",
      symptoms: [
        "Moderate-to-severe, often one-sided throbbing headache",
        "Headache that worsens with physical activity",
        "Nausea or vomiting",
        "Sensitivity to light and sound",
        "Visual or sensory aura in some people",
      ],
      medsFirst: [
        "NSAIDs and triptans for acute attacks",
        "Anti-nausea medication as an add-on",
        "Gepants (such as ubrogepant) as another acute option",
      ],
      medsSecond: [
        "Preventive therapy with CGRP monoclonal antibodies",
        "Oral preventives such as topiramate, beta-blockers or amitriptyline",
      ],
      prognosis:
        "Migraine is not life-threatening, and most people improve with a mix of acute and preventive treatment plus trigger management. New CGRP-targeted drugs have improved outcomes.",
      citations: [
        "American Headache Society Consensus Statement on Migraine Therapy (2024)",
        "Bradley and Daroff's Neurology in Clinical Practice, 8th ed. (2022)",
      ],
    },
    {
      name: "Multiple Sclerosis",
      icd10: "G35",
      synonyms: ["multiple sclerosis", "ms"],
      summary:
        "Multiple sclerosis is an immune-mediated disease in which the protective covering of nerves in the brain and spinal cord is damaged.",
      symptoms: [
        "Numbness, tingling or weakness, often on one side",
        "Vision loss or pain in one eye",
        "Double vision",
        "Balance problems and unsteady walking",
        "Fatigue that worsens with heat",
      ],
      medsFirst: [
        "High-efficacy disease-modifying therapy, often started early",
        "Anti-CD20 antibodies (ocrelizumab, ofatumumab)",
        "Oral disease-modifying drugs",
      ],
      medsSecond: [
        "High-dose corticosteroids for acute relapses",
        "Symptom treatments for spasticity, fatigue and bladder problems",
      ],
      prognosis:
        "Early treatment reduces relapses and delays disability. Most people start with a relapsing course, and many keep good function for decades.",
      citations: [
        "Bradley and Daroff's Neurology in Clinical Practice, 8th ed. (2022)",
        "AAN Practice Guideline: Disease-Modifying Therapies for MS (2018)",
      ],
    },
    {
      name: "Crohn's Disease",
      icd10: "K50.90",
      synonyms: ["crohns disease", "crohn disease", "crohns", "crohn"],
      summary:
        "Crohn's disease is a chronic inflammatory bowel disease that can affect any part of the digestive tract.",
      symptoms: [
        "Crampy abdominal pain, often in the lower right side",
        "Diarrhea, sometimes with blood",
        "Unintentional weight loss",
        "Fatigue and low-grade fever",
        "Mouth ulcers and joint pain",
      ],
      medsFirst: [
        "Corticosteroids (such as budesonide) to bring on remission",
        "Anti-TNF biologics (infliximab, adalimumab)",
        "Early biologic therapy for higher-risk disease",
      ],
      medsSecond: [
        "Other biologics: ustekinumab, risankizumab or vedolizumab",
        "Immunomodulators such as azathioprine; surgery for complications",
      ],
      prognosis:
        "Crohn's disease is lifelong with flare-ups and remissions, but modern therapy aimed at healing the bowel lining reduces complications and the need for surgery.",
      citations: [
        "Sleisenger and Fordtran's Gastrointestinal and Liver Disease, 11th ed. (2021)",
        "ECCO Guidelines on Therapeutics in Crohn's Disease (2020)",
      ],
    },
    {
      name: "Hypothyroidism",
      icd10: "E03.9",
      synonyms: ["hypothyroidism", "underactive thyroid", "hashimoto", "low thyroid"],
      summary:
        "Hypothyroidism is an underactive thyroid gland that does not make enough thyroid hormone, which slows the body's metabolism.",
      symptoms: [
        "Fatigue and sluggishness",
        "Feeling cold easily",
        "Weight gain",
        "Constipation",
        "Dry skin and hair, low mood and poor concentration",
      ],
      medsFirst: [
        "Levothyroxine, a synthetic thyroid hormone, taken once daily",
        "Dose adjusted to symptoms and blood tests",
      ],
      medsSecond: [
        "Dose increases during pregnancy",
        "Separating levothyroxine from interfering foods and supplements",
      ],
      prognosis:
        "Hypothyroidism is easily and effectively treated with daily levothyroxine, and most people feel completely well once the dose is right. Treatment is usually lifelong.",
      citations: [
        "American Thyroid Association Guidelines for Hypothyroidism (2014)",
        "Williams Textbook of Endocrinology, 14th ed. (2020)",
      ],
    },
  ];

  /* v12 — group conditions in the picker by body system. */
  var CONDITION_CATEGORY = {
    "Systemic Lupus Erythematosus": "Autoimmune",
    "Rheumatoid Arthritis": "Autoimmune",
    "Multiple Sclerosis": "Autoimmune",
    "Crohn's Disease": "Gastrointestinal",
    "Type 1 Diabetes Mellitus": "Endocrine & Metabolic",
    "Type 2 Diabetes Mellitus": "Endocrine & Metabolic",
    Hypothyroidism: "Endocrine & Metabolic",
    Asthma: "Respiratory",
    "Chronic Obstructive Pulmonary Disease": "Respiratory",
    Hypertension: "Cardiovascular",
    "Heart Failure": "Cardiovascular",
    Migraine: "Neurologic",
  };
  var CATEGORY_ORDER = [
    "Autoimmune",
    "Cardiovascular",
    "Endocrine & Metabolic",
    "Gastrointestinal",
    "Neurologic",
    "Respiratory",
  ];

  /* ========================================================
     4. PERSONALIZATION
     ======================================================== */
  var CONDITION_SPECIALTY = {
    "Systemic Lupus Erythematosus": "Rheumatology",
    "Rheumatoid Arthritis": "Rheumatology",
    "Type 2 Diabetes Mellitus": "Endocrinology",
    "Type 1 Diabetes Mellitus": "Endocrinology",
    Asthma: "Pulmonology",
    "Chronic Obstructive Pulmonary Disease": "Pulmonology",
    Hypertension: "Cardiology",
    "Heart Failure": "Cardiology",
    Migraine: "Neurology",
    "Multiple Sclerosis": "Neurology",
    "Crohn's Disease": "Gastroenterology",
    Hypothyroidism: "Endocrinology",
  };
  var CONDITION_TRIAL = {
    "Systemic Lupus Erythematosus": "lupus",
    "Rheumatoid Arthritis": "rheumatoid arthritis",
    "Type 2 Diabetes Mellitus": "type 2 diabetes",
    "Type 1 Diabetes Mellitus": "type 1 diabetes",
    Asthma: "asthma",
    "Chronic Obstructive Pulmonary Disease": "copd",
    Hypertension: "hypertension",
    "Heart Failure": "heart failure",
    Migraine: "migraine",
    "Multiple Sclerosis": "multiple sclerosis",
    "Crohn's Disease": "crohn",
    Hypothyroidism: "hypothyroidism",
  };

  var providerPerso = document.getElementById("provider-perso");
  var trialPerso = document.getElementById("trial-perso");
  var resourcePerso = document.getElementById("resource-perso");
  var activeCondition = null;
  var profileConditions = STORE.get("profileConditions", []);

  function persoBanner(detail) {
    return (
      '<div class="perso-banner">' +
      icon("sparkle") +
      "<span><strong>Personalized for " +
      escapeHtml(activeCondition.name) +
      "</strong>" +
      escapeHtml(detail) +
      "</span>" +
      '<button class="link-btn" type="button" data-action="clear-perso">Show all</button>' +
      "</div>"
    );
  }

  function renderPersoBanners() {
    if (providerPerso) {
      providerPerso.innerHTML = activeCondition
        ? persoBanner(
            (CONDITION_SPECIALTY[activeCondition.name] || "Relevant") +
              " specialists are shown first.",
          )
        : "";
    }
    if (trialPerso) {
      trialPerso.innerHTML = activeCondition
        ? persoBanner("Trials matching your condition are shown first.")
        : "";
    }
    if (resourcePerso) {
      resourcePerso.innerHTML = activeCondition
        ? persoBanner("Resources for your condition are shown first.")
        : "";
    }
  }

  function setActiveCondition(condition) {
    activeCondition = condition || null;
    var idx = condition ? CONDITIONS.indexOf(condition) : -1;
    STORE.set("activeCondition", idx);
    if (conditionSelect) {
      conditionSelect.value = idx < 0 ? "" : String(idx);
    }
    renderPersoBanners();
    if (providerList) renderProviders();
    if (trialList) renderTrials();
    if (resourceList) renderResources();
  }

  /* ========================================================
     5. CHATBOT
     ======================================================== */
  var SECTION_ICONS = {
    symptoms: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    medications:
      '<path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/>',
    prognosis: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
    citations:
      '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  };

  var chatStream = document.getElementById("chat-stream");
  var chatInput = document.getElementById("chat-input");
  var chatSend = document.getElementById("chat-send");
  var conditionSelect = document.getElementById("condition-select");
  var suggestedPrompts = document.getElementById("suggested-prompts");
  var printArea = document.getElementById("print-area");

  function normalize(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function hasAny(text, words) {
    for (var i = 0; i < words.length; i++) {
      if (text.indexOf(words[i]) !== -1) return true;
    }
    return false;
  }

  /* v12 — true if `term` appears in `text`, but is preceded by a
     negation token within the previous ~3 words. Used so "I don't
     want to exercise" doesn't match the exercise FAQ. */
  var NEGATION_TOKENS = {
    not: 1, no: 1, never: 1, without: 1, cant: 1, "can t": 1,
    dont: 1, "don t": 1, doesnt: 1, "doesn t": 1, didnt: 1, "didn t": 1,
    wont: 1, "won t": 1, isnt: 1, "isn t": 1, arent: 1, "aren t": 1,
    wasnt: 1, "wasn t": 1, werent: 1, "weren t": 1, hate: 1, avoid: 1,
    avoiding: 1, stopped: 1, quit: 1, refuse: 1, refused: 1,
  };
  function isNegated(text, term) {
    var idx = text.indexOf(term);
    if (idx === -1) return false;
    var before = text.slice(0, idx).trim();
    if (!before) return false;
    var words = before.split(/\s+/);
    var window = words.slice(Math.max(0, words.length - 4)).join(" ");
    for (var key in NEGATION_TOKENS) {
      if ((" " + window + " ").indexOf(" " + key + " ") !== -1) return true;
    }
    return false;
  }
  function hasAnyUnnegated(text, words) {
    for (var i = 0; i < words.length; i++) {
      if (text.indexOf(words[i]) !== -1 && !isNegated(text, words[i])) return true;
    }
    return false;
  }

  function findCondition(query) {
    var q = normalize(query);
    if (!q) return null;
    var words = q.split(" ");
    var best = null;

    for (var i = 0; i < CONDITIONS.length; i++) {
      var condition = CONDITIONS[i];
      var terms = [normalize(condition.name), normalize(condition.icd10)];
      for (var s = 0; s < condition.synonyms.length; s++) {
        terms.push(normalize(condition.synonyms[s]));
      }
      var score = 0;
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        if (!term) continue;
        if (q === term) {
          score = Math.max(score, 0.98);
        } else if (term.length <= 3) {
          if (words.indexOf(term) !== -1) score = Math.max(score, 0.88);
        } else if (q.indexOf(term) !== -1) {
          score = Math.max(score, 0.9);
        }
      }
      if (score > 0 && (!best || score > best.score)) {
        best = { condition: condition, score: score };
      }
    }
    return best;
  }

  /* Detect which part of a condition the user is asking about. */
  function detectIntent(query) {
    var q = normalize(query);
    if (hasAnyUnnegated(q, ["symptom", "sign", "warning", "feel like", "presentation", "early signs"])) {
      return "symptoms";
    }
    if (
      hasAnyUnnegated(q, [
        "medication",
        "medicine",
        "drug",
        "treat",
        "therapy",
        "manage",
        "cure",
        "first line",
        "second line",
      ])
    ) {
      return "medications";
    }
    if (
      hasAnyUnnegated(q, [
        "prognosis",
        "outlook",
        "outcome",
        "survival",
        "life expectancy",
        "long term",
        "get better",
        "will i",
        "fatal",
      ])
    ) {
      return "prognosis";
    }
    return null;
  }

  var UNSAFE_PHRASES = [
    "do i have",
    "do you think i have",
    "could i have",
    "might i have",
    "am i having",
    "could it be",
    "diagnose me",
    "diagnose my",
    "what is wrong with me",
    "whats wrong with me",
    "what do i have",
    "is this serious",
    "should i be worried",
    "what should i take",
    "what medicine should i take",
    "what dose",
    "what dosage",
    "how much should i take",
    "how many mg",
    "prescribe me",
    "should i stop taking",
    "can i stop taking",
  ];

  function isUnsafeQuery(query) {
    return hasAny(normalize(query), UNSAFE_PHRASES);
  }

  function isGreeting(query) {
    var q = normalize(query);
    var greetings = ["hi", "hello", "hey", "yo", "hiya", "howdy", "hey there", "hi there",
      "good morning", "good afternoon", "good evening", "greetings"];
    if (greetings.indexOf(q) !== -1) return true;
    return q.split(" ").length <= 2 && /^(hi|hello|hey)\b/.test(q);
  }

  function isThanks(query) {
    var q = normalize(query);
    return q === "thanks" || q === "ty" || q.indexOf("thank you") !== -1 || q.indexOf("thank") === 0;
  }

  function isHelp(query) {
    var q = normalize(query);
    return (
      q === "help" ||
      hasAny(q, ["what can you do", "how do you work", "how does this work", "who are you", "what are you"])
    );
  }

  function bulletList(items) {
    var html = '<ul class="bullets">';
    for (var i = 0; i < items.length; i++) {
      html += "<li>" + items[i] + "</li>";
    }
    return html + "</ul>";
  }

  /* v12 — premium-gated schematic diagram for each condition. The
     diagrams are intentionally simple schematics, not anatomical
     illustrations. */
  var CONDITION_DIAGRAMS = {
    "Systemic Lupus Erythematosus":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><ellipse cx="120" cy="58" rx="30" ry="38"/><path d="M90 70 Q120 84 150 70" stroke-linecap="round"/><ellipse cx="100" cy="68" rx="9" ry="5" fill="currentColor" opacity=".25"/><ellipse cx="140" cy="68" rx="9" ry="5" fill="currentColor" opacity=".25"/><circle cx="70" cy="118" r="5" fill="currentColor" opacity=".8"/><circle cx="120" cy="118" r="5" fill="currentColor" opacity=".8"/><circle cx="170" cy="118" r="5" fill="currentColor" opacity=".8"/></g><text x="120" y="148" text-anchor="middle" font-size="11" fill="currentColor">Skin · joints · kidneys · multi-organ</text></svg>',
    "Rheumatoid Arthritis":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M70 110 L70 60 Q70 50 80 50 Q90 50 90 60 L90 110"/><path d="M95 110 L95 50 Q95 40 105 40 Q115 40 115 50 L115 110"/><path d="M120 110 L120 45 Q120 35 130 35 Q140 35 140 45 L140 110"/><path d="M145 110 L145 55 Q145 45 155 45 Q165 45 165 55 L165 110"/><circle cx="80" cy="78" r="6" fill="currentColor" opacity=".4"/><circle cx="105" cy="68" r="6" fill="currentColor" opacity=".4"/><circle cx="130" cy="64" r="6" fill="currentColor" opacity=".4"/><circle cx="155" cy="72" r="6" fill="currentColor" opacity=".4"/></g><text x="120" y="148" text-anchor="middle" font-size="11" fill="currentColor">Symmetric inflammation of small joints</text></svg>',
    "Type 2 Diabetes Mellitus":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M40 80 Q90 50 140 70 Q190 90 200 70" stroke-linecap="round"/><circle cx="60" cy="80" r="4" fill="currentColor"/><circle cx="100" cy="62" r="4" fill="currentColor"/><circle cx="140" cy="70" r="4" fill="currentColor"/><circle cx="180" cy="78" r="4" fill="currentColor"/><path d="M80 110 Q100 95 120 110" stroke-dasharray="3 3"/><text x="120" y="135" text-anchor="middle" font-size="11" fill="currentColor">Insulin resistance · blunted response</text></g></svg>',
    "Type 1 Diabetes Mellitus":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M50 80 Q70 50 110 50 Q170 50 190 80 Q170 110 110 110 Q70 110 50 80 Z"/><circle cx="80" cy="80" r="5" fill="currentColor" opacity=".35"/><circle cx="105" cy="78" r="5" fill="currentColor" opacity=".35"/><circle cx="130" cy="82" r="5" fill="currentColor" opacity=".35"/><circle cx="155" cy="80" r="5" fill="currentColor" opacity=".35"/><line x1="75" y1="75" x2="85" y2="85" stroke-width="2"/><line x1="85" y1="75" x2="75" y2="85" stroke-width="2"/><line x1="100" y1="73" x2="110" y2="83" stroke-width="2"/><line x1="110" y1="73" x2="100" y2="83" stroke-width="2"/></g><text x="120" y="135" text-anchor="middle" font-size="11" fill="currentColor">Autoimmune destruction of beta cells</text></svg>',
    Asthma:
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="80" cy="80" r="32"/><circle cx="80" cy="80" r="18"/><text x="80" y="125" text-anchor="middle" font-size="10" fill="currentColor">Open</text><circle cx="170" cy="80" r="32"/><circle cx="170" cy="80" r="8" fill="currentColor" opacity=".4"/><text x="170" y="125" text-anchor="middle" font-size="10" fill="currentColor">Constricted</text></g><text x="120" y="148" text-anchor="middle" font-size="11" fill="currentColor">Airway narrowing in an attack</text></svg>',
    "Chronic Obstructive Pulmonary Disease":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M120 30 V 80"/><path d="M120 50 Q90 60 80 90 Q70 120 95 130 Q105 122 110 100"/><path d="M120 50 Q150 60 160 90 Q170 120 145 130 Q135 122 130 100"/><circle cx="92" cy="100" r="6" fill="currentColor" opacity=".3"/><circle cx="105" cy="115" r="6" fill="currentColor" opacity=".3"/><circle cx="138" cy="115" r="6" fill="currentColor" opacity=".3"/><circle cx="150" cy="100" r="6" fill="currentColor" opacity=".3"/></g><text x="120" y="150" text-anchor="middle" font-size="11" fill="currentColor">Damaged alveoli · airflow obstruction</text></svg>',
    Hypertension:
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="120" cy="70" r="42"/><text x="120" y="68" text-anchor="middle" font-size="22" fill="currentColor" font-weight="600">140</text><text x="120" y="86" text-anchor="middle" font-size="12" fill="currentColor">/ 90</text><path d="M78 130 H 162" stroke-width="3"/><path d="M78 130 V 120 M162 130 V 120"/></g><text x="120" y="150" text-anchor="middle" font-size="11" fill="currentColor">Sustained elevated arterial pressure</text></svg>',
    "Heart Failure":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M120 110 C 70 80 80 40 110 50 C 120 55 120 60 120 65 C 120 60 120 55 130 50 C 160 40 170 80 120 110 Z"/><path d="M100 75 Q120 60 140 75" stroke-dasharray="3 3"/><path d="M170 90 L 200 90 M195 84 L 200 90 L 195 96"/></g><text x="120" y="150" text-anchor="middle" font-size="11" fill="currentColor">Weakened pump · reduced output</text></svg>',
    Migraine:
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M75 100 C 75 50 165 50 165 100 L 165 115 Q 165 120 160 120 L 150 120 L 150 130 L 95 130 L 95 120 L 80 120 Q 75 120 75 115 Z"/><path d="M90 75 Q 100 70 110 80 Q 120 90 130 80 Q 140 70 150 80" stroke-dasharray="2 2"/><path d="M180 60 L 200 50 M180 70 L 205 70 M180 80 L 200 90" stroke-linecap="round"/></g><text x="120" y="150" text-anchor="middle" font-size="11" fill="currentColor">Unilateral throbbing · aura · photophobia</text></svg>',
    "Multiple Sclerosis":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><line x1="30" y1="80" x2="210" y2="80" stroke-width="3"/><rect x="40" y="68" width="20" height="24" rx="6"/><rect x="80" y="68" width="20" height="24" rx="6" fill="currentColor" opacity=".25"/><rect x="120" y="68" width="20" height="24" rx="6"/><rect x="160" y="68" width="20" height="24" rx="6" fill="currentColor" opacity=".25"/></g><text x="120" y="135" text-anchor="middle" font-size="11" fill="currentColor">Demyelination of CNS nerve sheaths</text></svg>',
    "Crohn's Disease":
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><path d="M60 40 Q 110 40 110 80 Q 110 120 60 120"/><path d="M180 40 Q 130 40 130 80 Q 130 120 180 120"/><circle cx="98" cy="60" r="6" fill="currentColor" opacity=".35"/><circle cx="110" cy="95" r="6" fill="currentColor" opacity=".35"/><circle cx="135" cy="70" r="6" fill="currentColor" opacity=".35"/><circle cx="138" cy="110" r="6" fill="currentColor" opacity=".35"/></g><text x="120" y="148" text-anchor="middle" font-size="11" fill="currentColor">Patchy transmural GI-tract inflammation</text></svg>',
    Hypothyroidism:
      '<svg viewBox="0 0 240 160" class="diagram-svg" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.6"><line x1="120" y1="30" x2="120" y2="80"/><path d="M100 70 Q 80 80 78 110 Q 78 122 95 122 Q 110 122 115 105 Z" fill="currentColor" opacity=".18"/><path d="M140 70 Q 160 80 162 110 Q 162 122 145 122 Q 130 122 125 105 Z" fill="currentColor" opacity=".18"/><path d="M100 70 Q 80 80 78 110 Q 78 122 95 122 Q 110 122 115 105 Z"/><path d="M140 70 Q 160 80 162 110 Q 162 122 145 122 Q 130 122 125 105 Z"/></g><text x="120" y="148" text-anchor="middle" font-size="11" fill="currentColor">Underactive butterfly-shaped thyroid</text></svg>',
  };
  function diagramSection(condition) {
    var svg = CONDITION_DIAGRAMS[condition.name];
    if (!svg) return "";
    if (premium) {
      return (
        '<div class="cond-diagram">' +
        '<p class="diagram-label">Schematic</p>' +
        svg +
        "</div>"
      );
    }
    return (
      '<div class="cond-diagram cond-diagram-locked" data-action="premium-prompt">' +
      '<p class="diagram-label">Schematic <span class="lock-tag">Premium</span></p>' +
      '<div class="diagram-lock-overlay">' + svg + "</div>" +
      '<button class="btn btn-secondary btn-sm" type="button" data-action="premium-prompt">Unlock with Premium</button>' +
      "</div>"
    );
  }

  /* v12 — citations rendered as clickable links to the source. */
  var CITATION_LINKS = {
    "Harrison's Principles of Internal Medicine, 21st ed. (2022)":
      "https://accessmedicine.mhmedical.com/book.aspx?bookID=3095",
    "EULAR recommendations for the management of SLE (2023)":
      "https://ard.bmj.com/content/83/1/15",
    "Kelley & Firestein's Textbook of Rheumatology, 11th ed. (2021)":
      "https://www.elsevier.com/books/kelley-and-firesteins-textbook-of-rheumatology-2-volume-set/firestein/978-0-323-63920-0",
    "ACR Guideline for the Treatment of Rheumatoid Arthritis (2021)":
      "https://rheumatology.org/clinical-practice-guidelines",
    "ADA Standards of Care in Diabetes — 2024":
      "https://diabetesjournals.org/care/issue/47/Supplement_1",
    "Williams Textbook of Endocrinology, 14th ed. (2020)":
      "https://www.elsevier.com/books/williams-textbook-of-endocrinology/melmed/978-0-323-55596-8",
    "The Lancet Seminar: Type 1 Diabetes (2023)":
      "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01218-2/fulltext",
    "GINA Global Strategy for Asthma Management and Prevention (2024)":
      "https://ginasthma.org/2024-report/",
    "Murray and Nadel's Textbook of Respiratory Medicine, 7th ed. (2022)":
      "https://www.elsevier.com/books/murray-and-nadels-textbook-of-respiratory-medicine-2-volume-set/broaddus/978-0-323-65587-3",
    "GOLD Global Strategy for the Diagnosis and Management of COPD (2024)":
      "https://goldcopd.org/2024-gold-report/",
    "ACC/AHA Guideline for the Management of High Blood Pressure (2017)":
      "https://www.ahajournals.org/doi/10.1161/HYP.0000000000000065",
    "Braunwald's Heart Disease, 12th ed. (2022)":
      "https://www.elsevier.com/books/braunwalds-heart-disease-a-textbook-of-cardiovascular-medicine-2-volume-set/libby/978-0-323-72219-3",
    "AHA/ACC/HFSA Guideline for the Management of Heart Failure (2022)":
      "https://www.ahajournals.org/doi/10.1161/CIR.0000000000001063",
    "American Headache Society Consensus Statement on Migraine Therapy (2024)":
      "https://onlinelibrary.wiley.com/doi/10.1111/head.14692",
    "Bradley and Daroff's Neurology in Clinical Practice, 8th ed. (2022)":
      "https://www.elsevier.com/books/bradley-and-daroffs-neurology-in-clinical-practice/jankovic/978-0-323-64261-3",
    "AAN Practice Guideline: Disease-Modifying Therapies for MS (2018)":
      "https://www.aan.com/Guidelines/home/GuidelineDetail/898",
    "Sleisenger and Fordtran's Gastrointestinal and Liver Disease, 11th ed. (2021)":
      "https://www.elsevier.com/books/sleisenger-and-fordtrans-gastrointestinal-and-liver-disease-2-volume-set/feldman/978-0-323-60962-3",
    "ECCO Guidelines on Therapeutics in Crohn's Disease (2020)":
      "https://academic.oup.com/ecco-jcc/article/14/1/4/5650418",
    "American Thyroid Association Guidelines for Hypothyroidism (2014)":
      "https://www.thyroid.org/professionals/ata-professional-guidelines/",
  };
  function citationsList(items) {
    var html = '<ul class="bullets bullets-citations">';
    for (var i = 0; i < items.length; i++) {
      var c = items[i];
      var url = CITATION_LINKS[c];
      if (url) {
        html +=
          '<li><a href="' +
          escapeHtml(url) +
          '" target="_blank" rel="noopener noreferrer" class="cite-link">' +
          escapeHtml(c) +
          ' <svg viewBox="0 0 24 24" class="ic-xs cite-ext" aria-hidden="true"><path d="M14 3h7v7M10 14 21 3M5 21h14a2 2 0 0 0 2-2v-7M19 12v7H5V5h7"/></svg></a></li>';
      } else {
        html += "<li>" + escapeHtml(c) + "</li>";
      }
    }
    return html + "</ul>";
  }

  function chatSection(iconKey, sectionId, title, bodyHtml, open) {
    return (
      '<div class="acc' +
      (open ? " acc-open" : "") +
      '" data-section="' +
      sectionId +
      '">' +
      '<button class="acc-head" type="button" aria-expanded="' +
      (open ? "true" : "false") +
      '">' +
      '<span class="acc-ic"><svg viewBox="0 0 24 24" class="ic-sm" aria-hidden="true">' +
      SECTION_ICONS[iconKey] +
      "</svg></span>" +
      '<span class="acc-title">' +
      title +
      "</span>" +
      '<svg viewBox="0 0 24 24" class="ic-sm acc-chevron" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>' +
      "</button>" +
      '<div class="acc-body">' +
      bodyHtml +
      "</div></div>"
    );
  }

  var INTENT_INTRO = {
    symptoms: "Here are the symptoms and signs to know.",
    medications: "Here's how it is typically treated.",
    prognosis: "Here's the general outlook.",
  };

  function answerCard(condition, score, intent) {
    var pct = Math.round(score * 100);
    var idx = CONDITIONS.indexOf(condition);
    var medsBody =
      '<span class="med-label first">First-line</span>' +
      bulletList(condition.medsFirst) +
      '<span class="med-label second">Second-line</span>' +
      bulletList(condition.medsSecond);

    function openFor(sectionId) {
      return intent ? intent === sectionId : true;
    }

    var introHtml =
      intent && INTENT_INTRO[intent]
        ? '<p class="answer-intro">' + escapeHtml(INTENT_INTRO[intent]) + "</p>"
        : "";

    return (
      '<article class="answer-card">' +
      '<div class="answer-head">' +
      '<div class="answer-title-row"><h2>' +
      condition.name +
      '</h2><span class="chip chip-teal">ICD-10 ' +
      condition.icd10 +
      "</span></div>" +
      '<div class="confidence" title="Match confidence">' +
      '<span class="confidence-track"><span class="confidence-fill" style="width:' +
      pct +
      '%"></span></span><span>' +
      pct +
      "%</span></div>" +
      introHtml +
      '<p class="answer-summary">' +
      condition.summary +
      "</p>" +
      diagramSection(condition) +
      "</div>" +
      '<div class="answer-sections">' +
      chatSection(
        "symptoms",
        "symptoms",
        "Symptoms &amp; Signs",
        bulletList(condition.symptoms),
        openFor("symptoms"),
      ) +
      chatSection("medications", "medications", "Medications", medsBody, openFor("medications")) +
      chatSection(
        "prognosis",
        "prognosis",
        "Prognosis",
        '<p class="answer-summary" style="margin-top:0">' + condition.prognosis + "</p>",
        openFor("prognosis"),
      ) +
      chatSection(
        "citations",
        "citations",
        "Citations (" + condition.citations.length + ")",
        citationsList(condition.citations),
        !intent,
      ) +
      "</div>" +
      followupChipsHtml(condition, null) +
      '<div class="answer-actions">' +
      '<button class="btn btn-secondary btn-sm" type="button" data-action="pdf" data-cond="' +
      idx +
      '">' +
      icon("download") +
      " Download PDF</button>" +
      '<button class="btn btn-secondary btn-sm" type="button" data-action="copy" data-cond="' +
      idx +
      '">' +
      icon("copy") +
      " Copy</button>" +
      '<button class="btn btn-secondary btn-sm" type="button" data-action="share" data-cond="' +
      idx +
      '">' +
      icon("share") +
      " Share</button>" +
      "</div></article>"
    );
  }

  function plainCard(title, paragraphs) {
    var body = "";
    for (var i = 0; i < paragraphs.length; i++) {
      body += '<p class="answer-summary">' + paragraphs[i] + "</p>";
    }
    return (
      '<article class="answer-card">' +
      '<div class="answer-head" style="border-bottom:none">' +
      '<div class="answer-title-row"><h2>' +
      escapeHtml(title) +
      "</h2></div>" +
      body +
      "</div></article>"
    );
  }

  /* ========================================================
     5.5 CHATBOT FAQ LAYER (v10)
     Curated short answers to the questions people actually ask.
     Each condition has 6 universal Q&amp;A entries; a "people also
     ask" chip row follows every answer so the conversation can
     keep exploring.
     ======================================================== */
  var CONDITION_SHORT = {
    "Systemic Lupus Erythematosus": "lupus",
    "Rheumatoid Arthritis": "rheumatoid arthritis",
    "Type 2 Diabetes Mellitus": "type 2 diabetes",
    "Type 1 Diabetes Mellitus": "type 1 diabetes",
    Asthma: "asthma",
    "Chronic Obstructive Pulmonary Disease": "COPD",
    Hypertension: "hypertension",
    "Heart Failure": "heart failure",
    Migraine: "migraine",
    "Multiple Sclerosis": "multiple sclerosis",
    "Crohn's Disease": "Crohn's disease",
    Hypothyroidism: "hypothyroidism",
  };

  var FAQ_TOPICS = [
    { id: "causes", keys: ["what cause", "causes", "why do people", "why does", "reason for"], q: function (s) { return "What causes " + s + "?"; } },
    { id: "genetic", keys: ["genetic", "hereditary", "inherit", "run in fam", "runs in fam", "passed down"], q: function (s) { return "Is " + s + " genetic?"; } },
    { id: "curable", keys: ["cure", "curable", "go away", "permanent", "reversible", "get rid of"], q: function (s) { return "Is " + s + " curable?"; } },
    { id: "diagnosis", keys: ["diagnos", "tested for", "test for", "what test", "how do you know", "confirmed"], q: function (s) { return "How is " + s + " diagnosed?"; } },
    { id: "exercise", keys: ["exercise", "work out", "workout", "physical activity", "sport", "gym", "running"], q: function (s) { return "Can I exercise with " + s + "?"; } },
    { id: "diet", keys: ["diet", "food", "what to eat", "what should i eat", "nutrition", "drink alcohol", "what to avoid"], q: function (s) { return "What about diet and " + s + "?"; } },
    { id: "triggers", keys: ["trigger", "flare up", "flares", "what flares", "what sets off", "set off", "make it worse", "worsens", "makes worse", "cause a flare", "cause flares", "what worsen"], q: function (s) { return "What triggers " + s + " flares?"; } },
    { id: "pregnancy", keys: ["pregnan", "fertility", "conceive", "conception", "having a baby", "trying for a baby", "while pregnant", "during pregnancy", "tubal", "breastfeed", "breast feed"], q: function (s) { return "Can I be pregnant with " + s + "?"; } },
    { id: "redflags", keys: ["red flag", "emergency", "when to see", "when should i see", "when do i see", "go to the er", "go to er", "go to the hospital", "urgent care", "warning sign", "when to call", "when to worry", "is it dangerous", "life threat"], q: function (s) { return "When should I see a doctor about " + s + "?"; } },
  ];

  var CONDITION_FAQ = {
    "Systemic Lupus Erythematosus": {
      causes: "Lupus is an autoimmune disease in which the immune system attacks the body's own tissues. The exact trigger isn't known, but it involves genetic risk plus factors like sunlight, infections, hormones, and some medications.",
      genetic: "Lupus isn't directly inherited, but genes play a role — having a relative with lupus or another autoimmune disease raises your risk. Most people with that genetic background never develop lupus.",
      curable: "There is no cure for lupus, but it is highly treatable. Many people reach long remissions with hydroxychloroquine and, when needed, immunosuppressants or biologics.",
      diagnosis: "Lupus is diagnosed by a clinical evaluation plus blood tests (antinuclear antibodies, anti-dsDNA, complement levels), urinalysis, and assessment of organ involvement. It often takes time and specialist input.",
      exercise: "Moderate exercise is encouraged — it helps fatigue, joints, mood, and heart health. Ease off during flares and protect your skin from sun exposure.",
      diet: "There's no specific lupus diet, but a balanced diet rich in fruits, vegetables, whole grains, and omega-3 fats is recommended. Avoid alfalfa supplements, keep up vitamin D, and limit alcohol.",
    },
    "Rheumatoid Arthritis": {
      causes: "RA is an autoimmune disease — the immune system attacks the joint lining. The exact cause is unknown, but it combines genetic susceptibility with triggers like smoking, gum disease, and infections.",
      genetic: "RA isn't inherited in a simple pattern, but certain genes (especially HLA-DRB1) raise risk. Family history modestly increases your chance, but most people with RA have no affected relatives.",
      curable: "RA can't be cured, but modern medications — methotrexate, biologics, JAK inhibitors — can put it into deep remission. Starting treatment early is key to preventing joint damage.",
      diagnosis: "RA is diagnosed clinically with symptoms (symmetric joint swelling, morning stiffness over an hour) plus blood tests (rheumatoid factor, anti-CCP, inflammatory markers) and imaging.",
      exercise: "Exercise is strongly recommended — gentle aerobic activity, swimming, cycling, and range-of-motion work reduce stiffness and protect joints. Skip high-impact activity during active flares.",
      diet: "No diet cures RA, but a Mediterranean-style pattern (vegetables, fish, olive oil, whole grains) is linked to less inflammation. Smoking and heavy alcohol worsen RA.",
    },
    "Type 2 Diabetes Mellitus": {
      causes: "Type 2 diabetes develops when the body becomes resistant to insulin and the pancreas can't keep up. Major contributors are excess weight, inactivity, genetics, age, and some ethnic backgrounds.",
      genetic: "Genetics matter — a parent or sibling with type 2 diabetes roughly doubles your risk. But lifestyle has a big impact on whether and when the genes lead to disease.",
      curable: "Type 2 diabetes isn't formally curable, but it can go into remission with significant weight loss — through diet, bariatric surgery, or newer GLP-1 medications. Most people manage it lifelong.",
      diagnosis: "Diagnosed by a fasting glucose at 126 mg/dL or higher, an A1c of 6.5% or higher, an oral glucose tolerance test, or a random glucose at 200 mg/dL or higher with symptoms — usually confirmed with two tests.",
      exercise: "Exercise is one of the most powerful treatments — aerobic activity and resistance training both lower blood sugar and improve insulin sensitivity. Aim for about 150 minutes a week.",
      diet: "A diet rich in vegetables, whole grains, lean protein, and healthy fats — and low in refined carbs and sugary drinks — improves blood sugar. The Mediterranean and DASH diets work well.",
    },
    "Type 1 Diabetes Mellitus": {
      causes: "Type 1 diabetes is autoimmune — the immune system destroys the insulin-producing beta cells. It usually appears in childhood or young adulthood, triggered by a mix of genetics and likely environmental factors.",
      genetic: "There's a genetic component, but type 1 isn't simply hereditary — most people who develop it have no family history. Certain HLA genes raise risk, and relatives have slightly elevated odds.",
      curable: "Type 1 diabetes can't be cured. Insulin replacement is required for life. Disease-modifying immune therapies and cell therapies are active areas of research.",
      diagnosis: "Diagnosed by high blood glucose with classic symptoms (thirst, urination, weight loss), often confirmed by positive islet autoantibodies (anti-GAD, anti-IA-2) and a low C-peptide.",
      exercise: "Exercise is safe and encouraged — just plan around it. Adjust insulin and carbs, monitor glucose, and always carry fast-acting sugar in case of lows.",
      diet: "There's no special diet — most people use carbohydrate counting to match insulin to meals. Balanced eating with consistent carbs makes glucose easier to control.",
    },
    Asthma: {
      causes: "Asthma is caused by chronic airway inflammation that makes the airways twitchy and prone to narrowing. It comes from a mix of genetics, allergies, and environmental exposures (smoke, pollution, infections).",
      genetic: "Asthma runs in families — a parent with asthma significantly raises your risk. But whether asthma develops depends a lot on environmental exposures (allergens, smoking, viruses).",
      curable: "Asthma isn't curable but is very controllable. Many children's asthma improves with age, and with proper inhalers most people live without daily symptoms.",
      diagnosis: "Diagnosed by a history of wheeze, cough, or shortness of breath plus spirometry showing airflow obstruction that reverses with a bronchodilator. Allergy testing can help find triggers.",
      exercise: "Exercise is good for asthma. Use your reliever inhaler 15 minutes before, warm up well, and avoid cold or polluted air. Exercise-induced symptoms can be specifically managed.",
      diet: "No asthma-specific diet, but a diet rich in fruits, vegetables, and omega-3 fats supports lung health. Keep a healthy weight and identify any food triggers (rare).",
    },
    "Chronic Obstructive Pulmonary Disease": {
      causes: "COPD is most often caused by long-term smoking. Other causes include air pollution, occupational dusts and chemicals, biomass smoke, and a rare inherited alpha-1 antitrypsin deficiency.",
      genetic: "Most COPD comes from smoking, not genes. A rare inherited condition — alpha-1 antitrypsin deficiency — causes early-onset COPD and is worth testing for in younger or never-smoker cases.",
      curable: "COPD can't be cured, and damaged lung tissue doesn't reverse. But progression slows dramatically with quitting smoking, inhalers, and pulmonary rehabilitation.",
      diagnosis: "Diagnosed by spirometry showing fixed airflow obstruction (FEV1/FVC under 0.70 after a bronchodilator), in someone with risk factors and symptoms.",
      exercise: "Pulmonary rehabilitation is one of the most effective COPD treatments — it improves breathlessness, fitness, and quality of life. Don't be put off by initial shortness of breath.",
      diet: "Keep a healthy weight — both underweight and overweight worsen COPD. Smaller, frequent meals are easier when breathing is hard. Adequate protein helps preserve muscle.",
    },
    Hypertension: {
      causes: "Most hypertension is 'essential' — no single cause. It comes from a mix of genetics, age, weight, salt intake, alcohol, inactivity, and stress. Less commonly, it's caused by kidney, hormonal, or sleep-apnea conditions.",
      genetic: "Hypertension runs in families — having parents with it roughly doubles your risk. Lifestyle factors (weight, salt, alcohol, activity) strongly affect whether it develops and how severely.",
      curable: "Hypertension usually isn't curable but is highly controllable. With medication and lifestyle changes, blood pressure can stay in a safe range and dramatically lower stroke and heart-disease risk.",
      diagnosis: "Diagnosed by repeated office readings at 130/80 mmHg or higher, confirmed by home monitoring or 24-hour ambulatory monitoring. A single high reading doesn't confirm it.",
      exercise: "Regular aerobic exercise lowers blood pressure by about 5–8 mmHg. Aim for about 150 minutes a week of moderate activity. Avoid heavy weightlifting when pressure is very high.",
      diet: "The DASH diet — rich in fruits, vegetables, whole grains, and low-fat dairy, low in sodium — is the most studied. Aim for under 2,300 mg sodium a day, limit alcohol, and keep a healthy weight.",
    },
    "Heart Failure": {
      causes: "Heart failure usually develops from another heart condition — most often coronary artery disease (a past heart attack), high blood pressure, valve disease, or diabetes.",
      genetic: "Some forms (familial cardiomyopathies) are inherited, but most heart failure isn't. Family history of heart disease still raises overall cardiovascular risk.",
      curable: "Heart failure usually can't be cured, but modern combination therapy (ARNI, beta-blocker, MRA, SGLT2 inhibitor) markedly improves survival and quality of life. Some causes (valve disease, certain rhythm problems) are reversible.",
      diagnosis: "Diagnosed by symptoms (shortness of breath, swelling, fatigue) plus an elevated BNP or NT-proBNP and an echocardiogram showing reduced or preserved ejection fraction.",
      exercise: "Exercise is encouraged in stable heart failure — cardiac rehab improves symptoms and survival. Start slow, weigh yourself daily, and stop if you get chest pain or severe breathlessness.",
      diet: "Limit sodium (about 2,000–3,000 mg/day) to reduce fluid retention. Some patients need a fluid limit. Keep a healthy weight and avoid heavy alcohol.",
    },
    Migraine: {
      causes: "Migraine arises from genetically determined brain hyperexcitability. Attacks involve activation of trigeminal nerves and release of peptides like CGRP, producing the pain and the nausea, light, and sound sensitivity.",
      genetic: "Migraine is strongly hereditary — about 60% of people with migraine have a family history. Specific gene variants raise risk, especially in migraine with aura.",
      curable: "Migraine isn't curable, but it is highly treatable. Acute drugs (triptans, gepants) stop attacks; preventives (CGRP antibodies, topiramate, beta-blockers) reduce frequency. Many people improve dramatically.",
      diagnosis: "Migraine is a clinical diagnosis based on the pattern of attacks (severe, often one-sided, throbbing, with nausea or light/sound sensitivity, lasting 4–72 hours). Imaging is only needed for warning features.",
      exercise: "Regular aerobic exercise reduces migraine frequency for many people. Sudden intense activity can trigger an attack — start gently, stay hydrated, and don't skip meals.",
      diet: "Common triggers include skipped meals, dehydration, alcohol (especially red wine), aged cheeses, chocolate, MSG, and aspartame — but triggers vary. A diary helps identify your patterns.",
    },
    "Multiple Sclerosis": {
      causes: "MS is an immune-mediated disease in which the immune system attacks the myelin sheath around nerves. The trigger is unknown but involves genetic susceptibility, Epstein-Barr virus infection, low vitamin D, and smoking.",
      genetic: "MS isn't directly inherited. Having a first-degree relative with MS raises lifetime risk to about 2–5% (vs. 0.5% in the general population), but most people with MS have no family history.",
      curable: "MS isn't curable, but disease-modifying therapies can substantially reduce relapses and slow disability. Many people stay stable for decades on modern treatment.",
      diagnosis: "MS is diagnosed using the McDonald criteria — a mix of clinical episodes and MRI showing characteristic lesions, sometimes with cerebrospinal fluid analysis.",
      exercise: "Exercise is strongly beneficial — it reduces fatigue, preserves strength, and may help slow progression. Heat can transiently worsen symptoms, so swimming and cool environments work well.",
      diet: "No specific diet has been proven to change MS, but a Mediterranean-style diet with adequate vitamin D, fruits, vegetables, and fish is generally recommended.",
    },
    "Crohn's Disease": {
      causes: "Crohn's is caused by an abnormal immune response to gut bacteria in genetically susceptible people. Smoking, certain medications (NSAIDs), and infections may contribute.",
      genetic: "Crohn's has a clear genetic component — multiple gene variants (including NOD2) raise risk. About 15% of people with Crohn's have a relative with inflammatory bowel disease.",
      curable: "Crohn's can't be cured medically, but it can go into deep remission with biologics, immunosuppressants, and lifestyle changes. Surgery may be needed for complications, but isn't curative.",
      diagnosis: "Diagnosed by symptoms, colonoscopy with biopsies, imaging (CT or MR enterography), and blood/stool tests. The hallmark is patchy transmural inflammation anywhere in the GI tract.",
      exercise: "Exercise helps in Crohn's — moderate activity reduces stress, improves bone health, and may reduce inflammation. Ease off during severe flares.",
      diet: "No single Crohn's diet works for everyone. Low-fiber or low-residue eating is often easier during flares. Identify your personal triggers; a dietitian familiar with IBD is valuable.",
    },
    Hypothyroidism: {
      causes: "Worldwide, the main cause is iodine deficiency. In iodine-replete countries, it's most often Hashimoto's thyroiditis (an autoimmune attack on the thyroid). Other causes include thyroid surgery, radioiodine, and some medications.",
      genetic: "Autoimmune thyroid disease runs in families — risk is higher if relatives have hypothyroidism or other autoimmune conditions. Women are 5–10 times more likely than men to develop it.",
      curable: "Hypothyroidism usually isn't curable, but it's easily and effectively treated — daily levothyroxine replaces the missing hormone, and most people feel completely well at the right dose. Treatment is typically lifelong.",
      diagnosis: "Diagnosed by a blood test showing elevated TSH and, in overt cases, a low free T4. Anti-TPO antibodies confirm Hashimoto's.",
      exercise: "Exercise is safe and helpful once thyroid levels are normalized. Untreated hypothyroidism makes activity hard; once treated, energy returns and regular activity is encouraged.",
      diet: "No special diet is needed. Adequate iodine (iodized salt, seafood) is enough. Take levothyroxine on an empty stomach away from calcium, iron, and coffee, which block absorption.",
    },
  };

  /* v11 — three more FAQ topics per condition: triggers, pregnancy,
     red flags. Merged into CONDITION_FAQ below so the rest of the
     chatbot keeps working unchanged. */
  var CONDITION_FAQ_EXTRAS = {
    "Systemic Lupus Erythematosus": {
      triggers: "Common lupus flare triggers include sun exposure, infections, stress, poor sleep, hormonal changes (pregnancy, menstruation), and certain medications (sulfa antibiotics). Sunscreen, rest, and staying on hydroxychloroquine reduce flare risk.",
      pregnancy: "Pregnancy is possible with lupus and is safest when the disease has been quiet for ~6 months. Hydroxychloroquine is continued through pregnancy, but mycophenolate, methotrexate, and cyclophosphamide must be stopped before conception. Lupus pregnancies are higher-risk for preeclampsia and preterm birth and are co-managed by rheumatology and maternal-fetal medicine.",
      redflags: "Seek urgent care for chest pain, severe shortness of breath, a sudden severe headache, vision changes, seizure, signs of stroke, fever over 38.5°C (101.3°F), or new severe joint pain with swelling — these can signal serious organ involvement.",
    },
    "Rheumatoid Arthritis": {
      triggers: "RA flares can be set off by stress, infections, overdoing physical activity, missed medication doses, smoking, and sometimes weather changes. A steady routine — sleep, gentle activity, scheduled medications — keeps flares less frequent.",
      pregnancy: "Most people with RA have healthy pregnancies. Plan ahead — methotrexate and JAK inhibitors must be stopped well before conception. RA often improves during pregnancy and may flare in the months after delivery, so rheumatology follow-up is important.",
      redflags: "Seek urgent care for a single hot, severely swollen joint with fever (possible joint infection), sudden numbness or weakness, severe chest pain, or new fever, mouth sores, or unusual fatigue — these can signal infection or medication side effects, especially on biologics.",
    },
    "Type 2 Diabetes Mellitus": {
      triggers: "Blood sugar tends to spike with high-carb meals, sugary drinks, stress, illness, certain medications (steroids), missed doses, and inactivity. Tracking sugars at flagged moments helps you spot your patterns.",
      pregnancy: "Pregnancy is possible with type 2 diabetes and is safest when blood sugar is tightly controlled before conception — high A1c at conception raises the risk of birth defects and miscarriage. Most oral medications are switched to insulin during pregnancy, with care shared by a high-risk obstetrician.",
      redflags: "Seek urgent care for blood sugar persistently over 250 mg/dL with vomiting or trouble breathing (possible DKA or HHS), severe low blood sugar, chest pain, sudden weakness or speech changes (stroke), or a foot wound that isn't healing.",
    },
    "Type 1 Diabetes Mellitus": {
      triggers: "Highs are often triggered by missed insulin, infections, stress, and very high-carb meals. Lows are triggered by extra insulin, skipped meals, alcohol, or exercise. Keep fast-acting sugar with you and check often.",
      pregnancy: "Pregnancy is safe with type 1 diabetes when blood sugar is tightly controlled before conception — high A1c at conception raises the risk of birth defects. Insulin needs change throughout pregnancy and require close monitoring by an endocrinologist and obstetrician.",
      redflags: "Seek urgent care for nausea, vomiting, abdominal pain, fruity breath, or fast breathing — these suggest diabetic ketoacidosis (DKA). Severe low blood sugar with confusion, seizure, or inability to eat is also an emergency.",
    },
    Asthma: {
      triggers: "Common asthma triggers are allergens (pollen, dust mites, pets), cold air, exercise, smoke, strong scents, respiratory infections, and stress. Identify your triggers, avoid them where possible, and use your controller inhaler daily.",
      pregnancy: "Asthma usually does well in pregnancy with continued inhalers — uncontrolled asthma is more dangerous to the baby than the medications. Inhaled steroids and short-acting beta agonists are considered safe; severe asthma needs specialist input.",
      redflags: "Seek emergency care if your reliever inhaler isn't lasting four hours, you can't speak in full sentences, your lips or fingernails turn blue, you feel drowsy or confused, or peak flow drops below 50% of your best — these are signs of a severe attack.",
    },
    "Chronic Obstructive Pulmonary Disease": {
      triggers: "COPD flares are most often triggered by respiratory infections (viruses, bacteria) and air pollution. Stop smoking, get yearly flu and pneumococcal vaccines, and follow a written action plan from your doctor.",
      pregnancy: "COPD in pregnancy is uncommon since it usually develops later in life. If it occurs, most inhalers are continued — uncontrolled COPD lowers oxygen to the baby. Quitting smoking is critical.",
      redflags: "Seek urgent care for worsening shortness of breath at rest, blue lips, confusion, new ankle swelling, or fever — these suggest a severe flare or infection. Persistent very low oxygen needs hospital care.",
    },
    Hypertension: {
      triggers: "Blood pressure rises with high-sodium foods, alcohol, stress, poor sleep, missed doses, decongestants in cold medicines, and NSAIDs (ibuprofen, naproxen). A home blood-pressure cuff helps track patterns.",
      pregnancy: "Some blood-pressure medications — ACE inhibitors and ARBs — cause birth defects and must be switched before conception. Methyldopa, labetalol, and nifedipine are typically used in pregnancy. Chronic hypertension raises preeclampsia risk, so prenatal care is closer.",
      redflags: "Seek emergency care for blood pressure over 180/120 with chest pain, a severe headache, vision changes, shortness of breath, weakness, or speech changes — this can mean stroke, heart attack, or organ damage.",
    },
    "Heart Failure": {
      triggers: "Heart-failure flares are often triggered by salty meals, fluid overload, missed medications, infections, arrhythmias, or uncontrolled blood pressure. Daily weights catch fluid build-up early.",
      pregnancy: "Heart failure raises pregnancy risk significantly and needs preconception counseling with a cardiologist. Several heart-failure medications (ARNI, ACE inhibitors, ARBs, SGLT2 inhibitors) must be stopped before conception. Some heart conditions make pregnancy dangerous.",
      redflags: "Seek urgent care for a weight gain of 2 kg in three days, severe shortness of breath, chest pain, fainting, palpitations, or new swelling above the ankles. Weighing yourself daily catches early fluid build-up.",
    },
    Migraine: {
      triggers: "Common migraine triggers are stress (and stress let-down), skipped meals, dehydration, poor sleep, hormonal changes, alcohol (especially red wine), aged cheeses, MSG, and bright lights. A trigger diary helps you find your personal pattern.",
      pregnancy: "Many people's migraine improves during pregnancy, especially in the second and third trimesters. Triptans are used cautiously; preventives like topiramate and valproate are stopped before conception. Acetaminophen is the first-line acute treatment.",
      redflags: "Seek urgent care for the 'worst headache of your life,' a headache with fever and stiff neck, sudden weakness or speech changes, confusion, seizure, or a headache after a head injury. New headache patterns after age 50 also warrant evaluation.",
    },
    "Multiple Sclerosis": {
      triggers: "MS relapses can be triggered by infections, stress, and lack of sleep. Heat doesn't cause real relapses but can temporarily worsen symptoms (Uhthoff's phenomenon). Stay current on vaccines and treat infections early.",
      pregnancy: "Pregnancy is generally safe in MS — relapses are less common during pregnancy but more common in the months after delivery. Most disease-modifying therapies are stopped before conception; planning with a neurologist matters.",
      redflags: "Seek urgent care for any new sudden neurologic symptom lasting more than 24 hours (vision loss, weakness, severe dizziness), a severe headache, seizure, or signs of infection while on disease-modifying therapy.",
    },
    "Crohn's Disease": {
      triggers: "Crohn's flares can be triggered by stress, smoking, NSAIDs (ibuprofen, naproxen), infections, and missed medications. Some foods worsen symptoms during flares but they don't cause the disease.",
      pregnancy: "Pregnancy is best planned when Crohn's is in remission for at least 3–6 months — active disease at conception raises complication risk. Most biologics (infliximab, adalimumab) are continued, but methotrexate must be stopped at least three months before.",
      redflags: "Seek urgent care for severe abdominal pain, persistent vomiting, fever over 38.5°C (101.3°F), heavy rectal bleeding, signs of dehydration, or no bowel movement with a swollen belly — these can mean obstruction or perforation.",
    },
    Hypothyroidism: {
      triggers: "Symptoms can return if levothyroxine dose drifts — usually after weight changes, pregnancy, or new medications (iron, calcium, antacids, some antidepressants). A yearly TSH check catches drift.",
      pregnancy: "Hypothyroidism in pregnancy is common and easily managed — levothyroxine is safe and continued. Doses usually need to be increased early in pregnancy, and TSH is checked every 4 weeks. Untreated hypothyroidism raises miscarriage and developmental risk.",
      redflags: "Seek urgent care for severe lethargy, confusion, a slow heart rate, a very low body temperature, or new chest pain. Rarely, untreated severe hypothyroidism leads to myxedema coma — a medical emergency.",
    },
  };
  (function mergeFaqExtras() {
    for (var name in CONDITION_FAQ_EXTRAS) {
      if (!CONDITION_FAQ[name]) continue;
      var extras = CONDITION_FAQ_EXTRAS[name];
      for (var key in extras) CONDITION_FAQ[name][key] = extras[key];
    }
  })();

  /* v11 — glossary of common terms patients hear in clinic. Look-up
     happens when the user asks "what is X" / "what does X mean" /
     "define X". */
  var GLOSSARY = [
    { term: "ANA", aliases: ["antinuclear antibody", "antinuclear antibodies"], def: "ANA (antinuclear antibody) is a blood test that's commonly positive in lupus and several other autoimmune diseases. A positive ANA alone doesn't diagnose any disease — it has to be interpreted with symptoms and other tests." },
    { term: "DMARD", aliases: ["dmards", "disease modifying antirheumatic drug", "disease-modifying antirheumatic drug"], def: "DMARDs are 'disease-modifying antirheumatic drugs' — medications that slow autoimmune disease itself, not just symptoms. Methotrexate, hydroxychloroquine, and sulfasalazine are common conventional DMARDs; biologics and JAK inhibitors are newer types." },
    { term: "A1c", aliases: ["hba1c", "hemoglobin a1c", "haemoglobin a1c"], def: "A1c (also called HbA1c) is a blood test that reflects average blood sugar over about the past three months. A normal A1c is under 5.7%; 5.7–6.4% is prediabetes; 6.5% or higher is diabetes." },
    { term: "BNP", aliases: ["b-type natriuretic peptide", "brain natriuretic peptide"], def: "BNP is a blood test for heart failure — the heart releases more of it when it is stretched or strained. A high BNP supports the diagnosis; a low BNP usually rules it out." },
    { term: "NT-proBNP", aliases: ["nt probnp", "ntprobnp", "n-terminal probnp"], def: "NT-proBNP is a longer-lasting cousin of BNP used to diagnose and monitor heart failure. It's interpreted the same way: higher levels suggest more cardiac strain." },
    { term: "anti-CCP", aliases: ["anti ccp", "ccp antibody", "anti cyclic citrullinated peptide"], def: "Anti-CCP is a blood antibody that's highly specific for rheumatoid arthritis. A positive anti-CCP often appears before joint symptoms and predicts more severe disease." },
    { term: "rheumatoid factor", aliases: ["rf"], def: "Rheumatoid factor (RF) is an antibody that can be positive in rheumatoid arthritis, but also in other autoimmune diseases, infections, and even healthy older adults. It is not as specific as anti-CCP." },
    { term: "ICD-10", aliases: ["icd 10", "icd10"], def: "ICD-10 is the international diagnostic code system used to label conditions on charts and insurance claims. Each Zuuno condition card shows the relevant ICD-10 code." },
    { term: "spirometry", aliases: ["pulmonary function test", "pft"], def: "Spirometry is a breathing test that measures how much and how fast you can exhale. It is used to diagnose asthma and COPD and to track lung function over time." },
    { term: "FEV1", aliases: ["fev 1", "fev-one"], def: "FEV1 is the volume of air you can blow out in the first second of a forced exhalation. It is lowered in asthma (reversible) and COPD (largely fixed)." },
    { term: "ejection fraction", aliases: ["ef", "lvef"], def: "Ejection fraction is the percentage of blood the left ventricle pumps out with each beat. Normal is roughly 55–70%. Low EF (under ~40%) defines heart failure with reduced ejection fraction." },
    { term: "echocardiogram", aliases: ["echo", "echocardiograph", "echocardiography"], def: "An echocardiogram, or 'echo,' is an ultrasound of the heart. It shows the chambers, valves, and how strongly the heart pumps — including ejection fraction." },
    { term: "MRI", aliases: ["magnetic resonance imaging"], def: "MRI uses magnets and radio waves to create detailed images of the body without radiation. It's the standard test for diagnosing MS and is also used for many other conditions." },
    { term: "C-peptide", aliases: ["c peptide"], def: "C-peptide is a marker of how much insulin your own pancreas is making. A low C-peptide with high blood sugar suggests type 1 diabetes; a normal or high C-peptide suggests type 2." },
    { term: "HLA", aliases: ["human leukocyte antigen", "hla typing"], def: "HLA refers to a set of genes that tag your cells as 'self' to the immune system. Certain HLA variants raise risk for autoimmune diseases like type 1 diabetes, RA, lupus, and celiac." },
    { term: "biologic", aliases: ["biologics", "biological"], def: "A biologic is a protein-based medication (often a monoclonal antibody) that targets a specific part of the immune system. Examples include adalimumab, infliximab, rituximab, and dupilumab." },
    { term: "JAK inhibitor", aliases: ["jak inhibitors", "jaki"], def: "JAK inhibitors are oral pills that block intracellular immune signaling. They're used in RA, psoriatic arthritis, ulcerative colitis, and other immune-mediated diseases." },
    { term: "CGRP", aliases: ["calcitonin gene-related peptide", "cgrp antibody", "cgrp inhibitor"], def: "CGRP is a peptide released by nerves that plays a key role in migraine. CGRP-blocking antibodies (erenumab, fremanezumab, galcanezumab) and oral 'gepants' (rimegepant, ubrogepant) are newer migraine treatments." },
    { term: "GLP-1", aliases: ["glp 1", "glp1", "glp-1 agonist", "glucagon-like peptide-1"], def: "GLP-1 receptor agonists (semaglutide, liraglutide, tirzepatide) are injectable or oral medications used in type 2 diabetes and obesity. They lower blood sugar, slow stomach emptying, reduce appetite, and improve heart and kidney outcomes." },
    { term: "SGLT2 inhibitor", aliases: ["sglt 2 inhibitor", "sglt2"], def: "SGLT2 inhibitors (empagliflozin, dapagliflozin) make the kidneys excrete extra sugar in the urine. They lower blood sugar in diabetes and improve outcomes in heart failure and chronic kidney disease." },
    { term: "ARNI", aliases: ["arni therapy", "sacubitril valsartan", "sacubitril/valsartan"], def: "ARNI stands for angiotensin receptor–neprilysin inhibitor (sacubitril/valsartan). It's a foundational therapy for heart failure with reduced ejection fraction." },
    { term: "MRA", aliases: ["mineralocorticoid receptor antagonist", "spironolactone", "eplerenone"], def: "MRAs (spironolactone, eplerenone) block aldosterone. They're used in heart failure and resistant hypertension and improve survival in heart failure with reduced ejection fraction." },
    { term: "beta-blocker", aliases: ["beta blocker", "betablocker", "b blocker"], def: "Beta-blockers (metoprolol, carvedilol, atenolol) slow the heart rate and lower blood pressure by blocking adrenaline's effect on the heart. They're used in heart failure, arrhythmias, and after heart attacks." },
    { term: "ACE inhibitor", aliases: ["ace inhibitors", "ace-i", "acei"], def: "ACE inhibitors (lisinopril, enalapril, ramipril) lower blood pressure and protect the kidneys and heart. They are first-line for many people with hypertension, heart failure, or diabetic kidney disease." },
    { term: "ARB", aliases: ["arbs", "angiotensin receptor blocker"], def: "ARBs (losartan, valsartan, irbesartan) work similarly to ACE inhibitors but without causing the cough side effect. They're used for hypertension, heart failure, and kidney protection." },
    { term: "statin", aliases: ["statins"], def: "Statins (atorvastatin, rosuvastatin, simvastatin) lower LDL cholesterol and reduce the risk of heart attack and stroke. They are recommended for people at increased cardiovascular risk." },
    { term: "NSAID", aliases: ["nsaids", "non steroidal anti inflammatory drug", "nonsteroidal anti-inflammatory"], def: "NSAIDs are non-steroidal anti-inflammatory drugs like ibuprofen, naproxen, and diclofenac. They reduce pain and inflammation but can raise blood pressure, irritate the stomach, strain the kidneys, and worsen heart failure." },
    { term: "corticosteroid", aliases: ["steroid", "steroids", "prednisone", "prednisolone"], def: "Corticosteroids (prednisone, methylprednisolone) are powerful anti-inflammatory medications used to control flares of many autoimmune and inflammatory diseases. Long-term use causes weight gain, bone loss, and blood-sugar elevation." },
    { term: "flare", aliases: ["flare up", "flares", "flare-up"], def: "A 'flare' is a temporary worsening of a chronic disease — for example, a return of lupus rash and joint pain after a stable period, or a sudden increase in asthma symptoms." },
    { term: "remission", aliases: ["in remission"], def: "Remission means a disease has become quiet — symptoms are gone or minimal and lab markers have improved. It doesn't necessarily mean cured; relapses can occur." },
    { term: "autoimmune", aliases: ["autoimmunity", "autoimmune disease"], def: "Autoimmune disease is when the immune system mistakenly attacks the body's own tissues. Examples include lupus, RA, type 1 diabetes, multiple sclerosis, Crohn's, and Hashimoto's." },
    { term: "myelin", aliases: ["myelin sheath"], def: "Myelin is the insulating sheath around nerves that lets electrical signals travel quickly. In multiple sclerosis the immune system attacks myelin, slowing or blocking nerve signals." },
    { term: "TSH", aliases: ["thyroid stimulating hormone"], def: "TSH (thyroid-stimulating hormone) is the main test of thyroid function. High TSH usually means an underactive thyroid (hypothyroidism); low TSH usually means an overactive thyroid (hyperthyroidism)." },
    { term: "levothyroxine", aliases: ["synthroid", "thyroxine", "t4"], def: "Levothyroxine is synthetic thyroid hormone (T4) taken once daily to replace what an underactive thyroid is not making. Most people feel completely well at the right dose." },
    { term: "EBV", aliases: ["epstein barr virus", "epstein-barr"], def: "EBV (Epstein-Barr virus) is the cause of mononucleosis. EBV infection appears to be required for multiple sclerosis to develop, though most people who get EBV never develop MS." },
    { term: "DASH diet", aliases: ["dash"], def: "The DASH diet (Dietary Approaches to Stop Hypertension) is rich in fruits, vegetables, whole grains, and low-fat dairy and low in sodium. It can lower blood pressure by about 11/5 mmHg." },
    { term: "aura", aliases: ["migraine aura"], def: "Migraine aura is a brief neurologic warning before or during a migraine — most often shimmering lights, blind spots, or zigzag lines, sometimes numbness or speech changes — lasting 5 to 60 minutes." },
    { term: "triptan", aliases: ["triptans", "sumatriptan", "rizatriptan"], def: "Triptans (sumatriptan, rizatriptan) are acute migraine medications that stop attacks. They work best taken early in an attack and aren't used more than 2–3 days a week." },
    { term: "ICS", aliases: ["inhaled corticosteroid", "inhaled steroid"], def: "ICS (inhaled corticosteroid) is the controller component of most asthma inhalers — fluticasone, budesonide, beclomethasone. It calms airway inflammation and is taken every day even when feeling well." },
    { term: "LABA", aliases: ["long acting beta agonist", "long-acting beta agonist"], def: "LABA (long-acting beta agonist) is a long-lasting bronchodilator like salmeterol or formoterol. In asthma it is always combined with an inhaled steroid; in COPD it can be used alone or with a steroid." },
    { term: "bronchodilator", aliases: ["bronchodilators"], def: "A bronchodilator is a medication that opens narrowed airways. Short-acting bronchodilators (albuterol) act in minutes; long-acting ones (salmeterol, formoterol, tiotropium) last 12–24 hours." },
    { term: "pulmonary rehab", aliases: ["pulmonary rehabilitation", "pulm rehab"], def: "Pulmonary rehabilitation is a structured program of exercise, education, and breathing techniques for people with chronic lung disease. It's one of the most effective treatments for COPD." },
  ];
  /* Only treat the query as a glossary lookup if it looks like a
     definition request (e.g. "what is BNP", "define A1c") or the
     query is just a glossary term on its own. */
  function isDefineQuery(q) {
    return /^(what is |what s |whats |what does |what means |define |defn |meaning of |explain |tell me what )/.test(q);
  }
  function findGlossary(query) {
    var q = normalize(query);
    if (!q) return null;
    var stripped = q
      .replace(/^(what is an? |what is the |what is |what s an? |what s |whats an? |whats |what does an? |what does |what means |define |defn |meaning of an? |meaning of |explain an? |explain |tell me what an? |tell me what )/, "")
      .replace(/\s+(mean|means|do|stand for|stands for)$/, "")
      .replace(/\?+$/, "")
      .trim();
    var isDefine = isDefineQuery(q);
    for (var i = 0; i < GLOSSARY.length; i++) {
      var entry = GLOSSARY[i];
      var terms = [normalize(entry.term)];
      for (var a = 0; a < entry.aliases.length; a++) terms.push(normalize(entry.aliases[a]));
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        if (!term) continue;
        if (stripped === term) return entry;
        if (term.length >= 3 && (stripped === term + "s" || stripped + "s" === term)) return entry;
        if (isDefine) {
          var pad = " " + stripped + " ";
          if (pad.indexOf(" " + term + " ") !== -1) return entry;
        }
      }
    }
    return null;
  }
  function glossaryCard(entry) {
    return (
      '<article class="answer-card">' +
      '<div class="answer-head">' +
      '<div class="answer-title-row"><h2>' +
      escapeHtml(entry.term) +
      '</h2><span class="chip chip-teal">Glossary</span></div>' +
      '<p class="answer-summary">' +
      escapeHtml(entry.def) +
      "</p></div></article>"
    );
  }

  /* v12 — after rendering an answer, scan its text nodes for known
     glossary terms and wrap each first occurrence in a clickable chip. */
  var GLOSSARY_PATTERN = (function () {
    var alts = [];
    for (var i = 0; i < GLOSSARY.length; i++) {
      var entry = GLOSSARY[i];
      var terms = [entry.term].concat(entry.aliases);
      for (var t = 0; t < terms.length; t++) {
        var clean = String(terms[t]).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        if (clean.length >= 2) alts.push(clean);
      }
    }
    alts.sort(function (a, b) { return b.length - a.length; });
    return new RegExp("\\b(" + alts.join("|") + ")\\b", "i");
  })();
  function decorateGlossary(root) {
    if (!root || !root.querySelectorAll) return;
    if (root.classList && root.classList.contains("history-echo")) return;
    var targets = root.querySelectorAll(
      ".answer-summary, .acc-body p, .acc-body li, .cmp-summary, .cmp-prog",
    );
    var seen = {};
    for (var i = 0; i < targets.length; i++) {
      decorateNode(targets[i], seen);
    }
  }
  function decorateNode(node, seen) {
    var walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentElement;
        while (p) {
          if (p.tagName === "A" || p.tagName === "BUTTON" ||
              (p.classList && (p.classList.contains("glossary-chip") || p.classList.contains("chip")))) {
            return NodeFilter.FILTER_REJECT;
          }
          if (p === node) break;
          p = p.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    var textNodes = [];
    var n;
    while ((n = walker.nextNode())) textNodes.push(n);
    for (var i = 0; i < textNodes.length; i++) {
      var tn = textNodes[i];
      var text = tn.nodeValue;
      var m = GLOSSARY_PATTERN.exec(text);
      if (!m) continue;
      var key = m[1].toLowerCase();
      if (seen[key]) continue;
      seen[key] = true;
      var before = text.slice(0, m.index);
      var matched = m[1];
      var after = text.slice(m.index + matched.length);
      var span = document.createElement("button");
      span.type = "button";
      span.className = "glossary-chip";
      span.setAttribute("data-term", matched);
      span.textContent = matched;
      var parent = tn.parentNode;
      parent.insertBefore(document.createTextNode(before), tn);
      parent.insertBefore(span, tn);
      parent.insertBefore(document.createTextNode(after), tn);
      parent.removeChild(tn);
    }
  }

  /* v11 — identity, empathy, crisis, and follow-up intents. */
  function isIdentity(query) {
    var q = normalize(query);
    return hasAny(q, [
      "are you ai",
      "are you a ai",
      "are you an ai",
      "are you a bot",
      "are you a robot",
      "are you human",
      "are you a real",
      "are you real",
      "is this ai",
      "is this a bot",
      "is this real",
      "are you chatgpt",
      "are you a chatbot",
      "are you a person",
      "who made you",
      "who built you",
      "who created you",
      "who programmed you",
    ]);
  }
  function identityCard() {
    return plainCard("About Zuuno", [
      "I&#39;m Zuuno&#39;s assistant — not a generative AI like ChatGPT. I&#39;m a rule-based program that matches your question against a curated, cited knowledge base of conditions. That means I can&#39;t make up answers, but I also can&#39;t answer questions outside that knowledge base.",
      "I cover " + CONDITIONS.length + " conditions in depth, plus a glossary of common medical terms. Type a condition or a term to get started.",
    ]);
  }

  function isCrisis(query) {
    var q = normalize(query);
    /* Require first-person + present-tense intent so "this homework is
       killing me" and lyrics quotes don't trip the crisis response. */
    var firstPerson = [
      "i want to die",
      "i wanna die",
      "i m going to die",
      "im going to die",
      "i want to kill myself",
      "i wanna kill myself",
      "i m going to kill myself",
      "im going to kill myself",
      "i want to end my life",
      "i m ending my life",
      "im ending my life",
      "i want to end it all",
      "i m thinking about suicide",
      "im thinking about suicide",
      "i m thinking of suicide",
      "im thinking of suicide",
      "i feel suicidal",
      "i m suicidal",
      "im suicidal",
      "i want to harm myself",
      "i want to hurt myself",
      "i m going to harm myself",
      "im going to harm myself",
      "i m going to hurt myself",
      "im going to hurt myself",
      "i have no reason to live",
      "i d be better off dead",
      "id be better off dead",
      "i would be better off dead",
      "i m better off dead",
      "im better off dead",
      "i don t want to live",
      "i dont want to live",
      "i can t go on",
      "i cant go on",
    ];
    return hasAny(q, firstPerson);
  }
  function crisisCard() {
    return plainCard("Please reach out — you don't have to do this alone", [
      "If you are in immediate danger, please call your local emergency number now. In the US and Canada you can call or text <strong>988</strong> for the Suicide &amp; Crisis Lifeline; in the UK, call <strong>116 123</strong> for Samaritans; elsewhere, <a href=\"https://findahelpline.com\" target=\"_blank\" rel=\"noopener\">findahelpline.com</a> lists free, confidential helplines by country.",
      "I&#39;m a medical-information assistant and not equipped to support a mental-health crisis. A trained person on the other end of those lines is.",
    ]);
  }

  function isEmpathy(query) {
    var q = normalize(query);
    return hasAny(q, [
      "i m scared",
      "im scared",
      "i am scared",
      "i m afraid",
      "im afraid",
      "i am afraid",
      "i m worried",
      "im worried",
      "i am worried",
      "i m anxious",
      "im anxious",
      "i am anxious",
      "i feel hopeless",
      "i feel alone",
      "i feel lost",
      "i feel sad",
      "i m sad",
      "im sad",
      "i am sad",
      "i m depressed",
      "im depressed",
      "i am depressed",
      "i m exhausted",
      "im exhausted",
      "i am exhausted",
      "i m overwhelmed",
      "im overwhelmed",
      "i am overwhelmed",
      "this sucks",
      "this is hard",
      "i m struggling",
      "im struggling",
      "i am struggling",
      "i can t sleep",
      "i cant sleep",
      "i can t cope",
      "i cant cope",
      "i m tired of",
      "im tired of",
      "i am tired of",
      "i m in pain",
      "im in pain",
      "i am in pain",
      "i hate this",
      "i don t know what to do",
      "i dont know what to do",
    ]);
  }
  function empathyCard() {
    var who = STORE.get("name", "");
    var greet = who ? "I hear you, " + escapeHtml(who) + "." : "I hear you.";
    return plainCard(greet, [
      "Living with a chronic condition is genuinely hard, and what you&#39;re feeling is real. I&#39;m a medical-information tool — I can&#39;t replace a person — but if it would help, I can pull up plain-English information about your condition, share what others have found helpful, or point you to the Resources tab where there are patient communities and support lines.",
      "If you&#39;re having thoughts of hurting yourself, please call or text 988 (US/Canada), 116 123 (UK Samaritans), or visit findahelpline.com for a local helpline.",
    ]);
  }

  function isMore(query) {
    var q = normalize(query);
    return (
      q === "more" ||
      q === "go on" ||
      q === "continue" ||
      q === "tell me more" ||
      q === "tell me more please" ||
      q === "more info" ||
      q === "more information" ||
      q === "more please" ||
      q === "more detail" ||
      q === "more details" ||
      q === "and" ||
      q === "and?" ||
      q === "keep going"
    );
  }

  /* v12 — small-talk, off-topic, "are you sure", acknowledgement,
     conversation memory, and compare-X-and-Y. */
  function isSmallTalk(query) {
    var q = normalize(query);
    var exact = [
      "whats up", "what s up", "wassup", "sup", "yo", "hru", "wyd",
      "how are you", "how r u", "how are u", "how are ya", "how are things",
      "how is it going", "how s it going", "hows it going",
      "how have you been", "how ve you been", "how you doing",
      "you good", "u good", "you there", "are you there",
      "good morning", "good afternoon", "good evening", "good night",
      "nice to meet you", "nice talking to you",
    ];
    if (exact.indexOf(q) !== -1) return true;
    if (q.length <= 16 && /^(yo+|sup+|hey+|hi+|hello+)$/.test(q)) return true;
    return false;
  }
  function smallTalkCard() {
    var who = STORE.get("name", "");
    var hi = who ? "Hey " + escapeHtml(who) + " — " : "Hey — ";
    return plainCard(hi + "I'm here", [
      "I'm doing fine, thanks for asking. I'm a medical-information assistant, so small talk isn't really my thing, but I'm always ready to look up a condition for you.",
      "Try something like &ldquo;symptoms of lupus,&rdquo; &ldquo;what triggers asthma flares,&rdquo; or &ldquo;what is BNP.&rdquo;",
    ]);
  }

  function isAck(query) {
    var q = normalize(query);
    var acks = [
      "ok", "okay", "alright", "k", "kk", "cool", "nice", "got it",
      "i see", "makes sense", "fair", "fair enough", "right", "true",
      "sure", "sounds good", "great", "good", "perfect", "lol",
      "haha", "ha", "huh", "interesting", "wow", "oh", "ah", "hmm",
      "noted", "understood", "k thanks", "okay thanks", "ok thank you",
    ];
    return acks.indexOf(q) !== -1;
  }
  function ackCard() {
    return plainCard("Anytime", [
      "Let me know if there's anything else you want to look up — symptoms, treatment, triggers, pregnancy, red flags, or a medical term.",
    ]);
  }

  function isAreYouSure(query) {
    var q = normalize(query);
    return (
      q === "are you sure" ||
      q === "really" ||
      q === "really?" ||
      q === "for real" ||
      q === "for real?" ||
      q === "seriously" ||
      q === "is that true" ||
      q === "is that right" ||
      q === "are you sure about that" ||
      q === "how do you know" ||
      q === "where did you get that" ||
      q === "where does that come from" ||
      q === "what s your source" ||
      q === "whats your source" ||
      q === "what is your source" ||
      q === "prove it" ||
      q === "source" ||
      q === "sources" ||
      q === "citation" ||
      q === "citations"
    );
  }
  function sourceCard() {
    var cond = activeCondition;
    if (!cond) {
      return plainCard("Where my answers come from", [
        "Zuuno's answers are pulled from a curated knowledge base built from medical textbooks (Harrison's, Robbins, Kelley & Firestein, Braunwald's, Williams Endocrinology) and society guidelines (ACR, EULAR, ADA, GINA, GOLD, AHA, ECCO, ATA). Each condition card lists the specific sources used. Ask me about a condition and I'll show you the citations.",
      ]);
    }
    var html =
      '<article class="answer-card">' +
      '<div class="answer-head">' +
      '<div class="answer-title-row"><h2>Sources for ' +
      escapeHtml(cond.name) +
      '</h2><span class="chip chip-teal">Citations</span></div>' +
      '<p class="answer-summary">These are the references behind the answers Zuuno gives about ' +
      escapeHtml(cond.name) +
      '. Each one links to the original source.</p>' +
      citationsList(cond.citations) +
      "</div></article>";
    return html;
  }

  function isOffTopic(query) {
    var q = normalize(query);
    if (!q) return false;
    var topics = [
      "weather", "sports", "score", "football", "soccer", "basketball",
      "baseball", "hockey", "oilers", "lakers", "yankees", "knicks",
      "nfl", "nba", "mlb", "nhl", "ufc", "fifa", "world cup",
      "stocks", "stock market", "crypto", "bitcoin", "ethereum",
      "politics", "election", "president", "trump", "biden",
      "movie", "movies", "film", "netflix", "spotify", "song",
      "lyrics", "joke", "tell me a joke", "sing", "rap",
      "recipe", "cook", "code", "programming", "javascript", "python",
      "math problem", "homework", "essay", "summarize this",
      "translate", "translation",
      "capital of", "tallest", "biggest", "richest", "fastest",
      "video game", "minecraft", "roblox", "fortnite",
    ];
    return hasAny(q, topics);
  }
  function offTopicCard() {
    return plainCard("I'm medical-only", [
      "I'm Zuuno's medical-information assistant — I only answer questions about medical conditions, symptoms, treatments, and related topics. I can't help with sports, weather, news, math, code, or general trivia.",
      "Try a medical question like &ldquo;what triggers asthma flares,&rdquo; &ldquo;how is lupus diagnosed,&rdquo; or &ldquo;what is A1c.&rdquo;",
    ]);
  }

  /* Conversation memory — keeps last few exchanges so the user can
     reference earlier turns. */
  var CHAT_HISTORY = [];
  function rememberExchange(userText, replyHtml) {
    CHAT_HISTORY.push({ user: String(userText || ""), html: String(replyHtml || "") });
    if (CHAT_HISTORY.length > 8) CHAT_HISTORY.shift();
  }
  function lastUserMessage() {
    if (!CHAT_HISTORY.length) return null;
    return CHAT_HISTORY[CHAT_HISTORY.length - 1].user;
  }
  function priorUserMessage() {
    if (CHAT_HISTORY.length < 2) return null;
    return CHAT_HISTORY[CHAT_HISTORY.length - 2].user;
  }
  function priorAssistantHtml() {
    if (CHAT_HISTORY.length < 2) return null;
    return CHAT_HISTORY[CHAT_HISTORY.length - 2].html;
  }
  function isAskingAboutHistory(query) {
    var q = normalize(query);
    if (
      hasAny(q, [
        "what did i say",
        "what did i ask",
        "what did i just say",
        "what did i just ask",
        "what was my question",
        "what was my last question",
        "my previous question",
        "my last question",
        "my last message",
        "what i said",
        "what i just said",
        "what i just asked",
        "what i asked",
        "previous question",
        "earlier question",
        "what was that question",
      ])
    ) {
      return true;
    }
    return /^(what|tell me what) did i (just )?(say|ask|type|write)/.test(q);
  }
  function isAskingAboutAssistantHistory(query) {
    var q = normalize(query);
    return hasAny(q, [
      "what did you say",
      "what was your answer",
      "what was your last answer",
      "previous answer",
      "the last answer",
      "the previous answer",
      "the answer before",
      "your last answer",
      "your previous answer",
      "say that again",
      "repeat that",
      "repeat the last",
      "show that again",
    ]);
  }
  function historyEchoCard(role) {
    if (role === "assistant") {
      var prev = priorAssistantHtml();
      if (!prev) {
        return plainCard("Nothing earlier to repeat", [
          "I don&#39;t have a previous answer to show yet. Ask me something and I&#39;ll respond.",
        ]);
      }
      return (
        '<article class="answer-card history-echo">' +
        '<p class="followup-label" style="margin:14px 14px 0">Your previous answer</p>' +
        '<div style="padding:0 14px 14px">' +
        prev +
        "</div></article>"
      );
    }
    var prevU = priorUserMessage();
    if (!prevU) {
      return plainCard("Nothing earlier to show", [
        "I don&#39;t have a previous question on file yet.",
      ]);
    }
    return plainCard("You just asked", ['&ldquo;' + escapeHtml(prevU) + '&rdquo;']);
  }

  /* Compare two conditions side by side. */
  function isCompare(query) {
    var q = normalize(query);
    return (
      /\bcompare\b/.test(q) ||
      /\bvs\b/.test(q) ||
      /\bversus\b/.test(q) ||
      /difference between/.test(q) ||
      /\bdifferences? between\b/.test(q)
    );
  }
  function extractTwoConditions(query) {
    var q = normalize(query)
      .replace(/^(compare|whats|what s|what is|tell me|please)\s+/, "")
      .replace(/\b(the|a|an)\b/g, " ");
    var parts = q.split(/\s+(?:vs|versus|and|or|to|with|from|between)\s+/);
    if (parts.length < 2) return null;
    var found = [];
    for (var i = 0; i < parts.length && found.length < 2; i++) {
      var m = findCondition(parts[i]) || fuzzyFindCondition(parts[i]);
      if (m && !found.some(function (f) { return f.condition.name === m.condition.name; })) {
        found.push(m);
      }
    }
    if (found.length < 2) {
      var all = [];
      for (var c = 0; c < CONDITIONS.length; c++) {
        var cond = CONDITIONS[c];
        var terms = [normalize(cond.name)];
        for (var s = 0; s < cond.synonyms.length; s++) terms.push(normalize(cond.synonyms[s]));
        for (var t = 0; t < terms.length; t++) {
          if (terms[t] && q.indexOf(terms[t]) !== -1) {
            if (!all.some(function (a) { return a.name === cond.name; })) {
              all.push(cond);
            }
            break;
          }
        }
      }
      if (all.length >= 2) found = [{ condition: all[0], score: 0.9 }, { condition: all[1], score: 0.9 }];
    }
    return found.length >= 2 ? [found[0].condition, found[1].condition] : null;
  }
  function compareCard(a, b) {
    function col(c) {
      return (
        '<div class="cmp-col">' +
        '<h3 class="cmp-title">' + escapeHtml(c.name) + "</h3>" +
        '<span class="chip chip-teal">ICD-10 ' + escapeHtml(c.icd10) + "</span>" +
        '<p class="cmp-summary">' + escapeHtml(c.summary) + "</p>" +
        '<p class="section-label">Key symptoms</p>' +
        bulletList(c.symptoms.slice(0, 3).map(escapeHtml)) +
        '<p class="section-label">First-line treatment</p>' +
        bulletList(c.medsFirst.slice(0, 2).map(escapeHtml)) +
        '<p class="section-label">Prognosis</p>' +
        '<p class="cmp-prog">' + escapeHtml(c.prognosis) + "</p>" +
        "</div>"
      );
    }
    return (
      '<article class="answer-card compare-card">' +
      '<div class="answer-head">' +
      '<div class="answer-title-row"><h2>' +
      escapeHtml(a.name) + " vs " + escapeHtml(b.name) +
      "</h2></div></div>" +
      '<div class="cmp-grid">' + col(a) + col(b) + "</div>" +
      "</article>"
    );
  }
  function compareNeedTwoCard() {
    return plainCard("Pick two conditions to compare", [
      "I need two conditions from my knowledge base to make a comparison. Try &ldquo;compare lupus and RA&rdquo; or &ldquo;type 1 vs type 2 diabetes.&rdquo;",
    ]);
  }

  /* v11 — Levenshtein distance for typo-tolerant condition matching. */
  function levenshtein(a, b) {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = new Array(b.length + 1);
    for (var i = 0; i <= b.length; i++) prev[i] = i;
    for (var i = 1; i <= a.length; i++) {
      var curr = [i];
      for (var j = 1; j <= b.length; j++) {
        var cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      prev = curr;
    }
    return prev[b.length];
  }
  function fuzzyFindCondition(query) {
    var q = normalize(query);
    if (!q || q.length < 4) return null;
    var qWords = q.split(" ").filter(function (w) { return w.length >= 4; });
    if (!qWords.length) return null;
    var best = null;
    for (var i = 0; i < CONDITIONS.length; i++) {
      var c = CONDITIONS[i];
      var terms = [normalize(c.name)];
      for (var s = 0; s < c.synonyms.length; s++) terms.push(normalize(c.synonyms[s]));
      for (var t = 0; t < terms.length; t++) {
        var term = terms[t];
        if (!term || term.length < 4) continue;
        var termWords = term.split(" ");
        for (var qw = 0; qw < qWords.length; qw++) {
          var qWord = qWords[qw];
          for (var tw = 0; tw < termWords.length; tw++) {
            var tWord = termWords[tw];
            if (tWord.length < 4) continue;
            var d = levenshtein(qWord, tWord);
            var maxLen = Math.max(qWord.length, tWord.length);
            var allowed = maxLen <= 5 ? 1 : maxLen <= 8 ? 2 : 3;
            if (d > 0 && d <= allowed) {
              var score = 0.7 + (1 - d / maxLen) * 0.15;
              if (!best || score > best.score) {
                best = { condition: c, score: score, fuzzy: true, typed: qWord, suggested: tWord };
              }
            }
          }
        }
      }
    }
    return best;
  }

  function findFaq(condition, query) {
    var answers = CONDITION_FAQ[condition.name];
    if (!answers) return null;
    var q = normalize(query);
    for (var i = 0; i < FAQ_TOPICS.length; i++) {
      var topic = FAQ_TOPICS[i];
      if (answers[topic.id] && hasAnyUnnegated(q, topic.keys)) return topic;
    }
    return null;
  }

  function followupChipsHtml(condition, currentTopicId) {
    var answers = CONDITION_FAQ[condition.name];
    if (!answers) return "";
    var short = CONDITION_SHORT[condition.name] || condition.name;
    var chips = "";
    var count = 0;
    for (var i = 0; i < FAQ_TOPICS.length && count < 4; i++) {
      var topic = FAQ_TOPICS[i];
      if (topic.id === currentTopicId) continue;
      if (!answers[topic.id]) continue;
      chips +=
        '<button class="suggest-chip" type="button">' +
        escapeHtml(topic.q(short)) +
        "</button>";
      count++;
    }
    if (!chips) return "";
    return (
      '<div class="answer-followups">' +
      '<p class="followup-label">People also ask</p>' +
      '<div class="chip-row">' +
      chips +
      "</div></div>"
    );
  }

  function faqAnswerCard(condition, topic) {
    var short = CONDITION_SHORT[condition.name] || condition.name;
    var answer = CONDITION_FAQ[condition.name][topic.id];
    return (
      '<article class="answer-card">' +
      '<div class="answer-head">' +
      '<div class="answer-title-row"><h2>' +
      escapeHtml(topic.q(short)) +
      '</h2><span class="chip chip-teal">' +
      escapeHtml(condition.name) +
      "</span></div>" +
      '<p class="answer-summary">' +
      escapeHtml(answer) +
      "</p></div>" +
      followupChipsHtml(condition, topic.id) +
      "</article>"
    );
  }

  function noMatchCard(opts) {
    opts = opts || {};
    var paragraphs = [
      "I don&#39;t have enough evidence to answer that. Please consult a healthcare professional.",
      "I&#39;m a rule-based assistant, not a search engine — I can only answer about the " +
        CONDITIONS.length +
        " conditions in my knowledge base. Try one of these:",
    ];
    if (opts.typoSuggestion) {
      paragraphs.unshift(
        "Did you mean <strong>" +
          escapeHtml(opts.typoSuggestion) +
          "</strong>? Try the question again with that spelling.",
      );
    }
    var samples = [
      "What causes lupus?",
      "How is asthma treated?",
      "Symptoms of type 2 diabetes",
    ];
    var chips = "";
    for (var i = 0; i < samples.length; i++) {
      chips += '<button class="suggest-chip" type="button">' + escapeHtml(samples[i]) + "</button>";
    }
    var body = "";
    for (var p = 0; p < paragraphs.length; p++) {
      body += '<p class="answer-summary">' + paragraphs[p] + "</p>";
    }
    return (
      '<article class="answer-card">' +
      '<div class="answer-head" style="border-bottom:none">' +
      '<div class="answer-title-row"><h2>Not enough information</h2></div>' +
      body +
      "</div>" +
      '<div class="answer-followups">' +
      '<p class="followup-label">Try one of these</p>' +
      '<div class="chip-row">' +
      chips +
      "</div></div></article>"
    );
  }

  function guardrailCard(query) {
    var match = findCondition(query);
    var hint = match
      ? "To learn about " +
        escapeHtml(match.condition.name) +
        ", ask an educational question such as &ldquo;symptoms of " +
        escapeHtml(match.condition.name) +
        "&rdquo;."
      : "Zuuno explains conditions you have already been diagnosed with — try naming one.";
    return plainCard("A clinician is needed for this", [
      "Zuuno provides general education about medical conditions. It cannot diagnose conditions or recommend personal treatment or doses. Please see a licensed healthcare professional for a diagnosis or prescription.",
      hint,
    ]);
  }

  function greetingCard() {
    var who = STORE.get("name", "");
    return plainCard(who ? "Hi, " + escapeHtml(who) : "Hi there", [
      "I&#39;m the Zuuno assistant. I give cited, evidence-based information about conditions you have already been diagnosed with.",
      "Ask me something like &ldquo;symptoms of lupus&rdquo;, &ldquo;how is asthma treated&rdquo;, or just type a condition name.",
    ]);
  }

  function helpCard() {
    return plainCard("How Zuuno works", [
      "Type a question about a condition and I&#39;ll show a structured, cited answer. I understand what you&#39;re asking about — symptoms, treatment, or prognosis — and focus the answer on it.",
      "I cannot diagnose you or recommend personal doses. For anything like that, please see a licensed clinician.",
    ]);
  }

  function respondTo(text) {
    if (isCrisis(text)) return crisisCard();
    if (isUnsafeQuery(text)) return guardrailCard(text);
    if (isAskingAboutAssistantHistory(text)) return historyEchoCard("assistant");
    if (isAskingAboutHistory(text)) return historyEchoCard("user");
    if (isAreYouSure(text)) return sourceCard();
    if (isIdentity(text)) return identityCard();
    if (isEmpathy(text)) return empathyCard();
    if (isGreeting(text)) return greetingCard();
    if (isSmallTalk(text)) return smallTalkCard();
    if (isThanks(text))
      return plainCard("You're welcome", [
        "Glad to help. Ask me anything else about a condition you have.",
      ]);
    if (isAck(text)) return ackCard();
    if (isHelp(text)) return helpCard();
    if (isMore(text)) {
      if (activeCondition) return answerCard(activeCondition, 0.95, null);
      return plainCard("Ask me a question first", [
        "I&#39;d love to expand, but you haven&#39;t asked about a condition yet. Try typing a condition name like &ldquo;lupus&rdquo; or &ldquo;asthma&rdquo;, or pick one from the dropdown.",
      ]);
    }

    if (isCompare(text)) {
      var pair = extractTwoConditions(text);
      if (!pair) return compareNeedTwoCard();
      setActiveCondition(pair[0]);
      return compareCard(pair[0], pair[1]);
    }

    var intent = detectIntent(text);
    var match = findCondition(text);
    if (!match) {
      var fuzzy = fuzzyFindCondition(text);
      if (fuzzy) match = fuzzy;
    }
    if (!match) {
      var gloss = findGlossary(text);
      if (gloss) return glossaryCard(gloss);
    }
    if (!match && activeCondition) {
      var nq = normalize(text);
      var pronounRef = /^(is it|does it|can it|will it|won t it|how about it|what about it|and it|for it|with it|of it|in it|its )/.test(nq);
      var faqOnActive = findFaq(activeCondition, text);
      if (pronounRef || intent || faqOnActive) {
        match = { condition: activeCondition, score: 0.92 };
      }
    }
    if (match) {
      setActiveCondition(match.condition);
      var faqHit = findFaq(match.condition, text);
      if (faqHit) {
        return faqAnswerCard(match.condition, faqHit);
      }
      return answerCard(match.condition, match.score, intent);
    }
    if (isOffTopic(text)) return offTopicCard();
    return noMatchCard();
  }

  function sendMessage(text) {
    text = String(text).trim();
    if (!text) return;
    chatStream.insertAdjacentHTML(
      "beforeend",
      '<div class="msg-user">' + escapeHtml(text) + "</div>",
    );
    var userMessage = chatStream.lastElementChild;
    chatStream.insertAdjacentHTML(
      "beforeend",
      '<div class="typing"><span></span><span></span><span></span></div>',
    );
    var typingEl = chatStream.lastElementChild;
    userMessage.scrollIntoView({ behavior: "smooth", block: "start" });

    window.setTimeout(function () {
      typingEl.remove();
      var html = respondTo(text);
      chatStream.insertAdjacentHTML("beforeend", html);
      var newCard = chatStream.lastElementChild;
      if (newCard) decorateGlossary(newCard);
      rememberExchange(text, html);
    }, 650);
  }

  function handleSend() {
    var text = chatInput.value.trim();
    if (!text) return;
    sendMessage(text);
    chatInput.value = "";
    chatInput.focus();
  }

  function buildPrintReport(c) {
    function ul(items) {
      var h = "<ul>";
      for (var i = 0; i < items.length; i++) h += "<li>" + escapeHtml(items[i]) + "</li>";
      return h + "</ul>";
    }
    var faq = CONDITION_FAQ[c.name];
    var faqHtml = "";
    if (faq) {
      var short = CONDITION_SHORT[c.name] || c.name;
      var seen = false;
      for (var i = 0; i < FAQ_TOPICS.length; i++) {
        var topic = FAQ_TOPICS[i];
        if (!faq[topic.id]) continue;
        if (!seen) {
          faqHtml += "<h3>Frequently Asked Questions</h3>";
          seen = true;
        }
        faqHtml +=
          "<h4>" + escapeHtml(topic.q(short)) + "</h4>" +
          "<p>" + escapeHtml(faq[topic.id]) + "</p>";
      }
    }
    var citationsHtml = "<ul>";
    for (var ci = 0; ci < c.citations.length; ci++) {
      var ref = c.citations[ci];
      var url = CITATION_LINKS[ref];
      citationsHtml += "<li>" + escapeHtml(ref) +
        (url ? ' &mdash; <span class="cite-url">' + escapeHtml(url) + "</span>" : "") +
        "</li>";
    }
    citationsHtml += "</ul>";
    return (
      '<div class="print-report">' +
      "<h1>Zuuno — Condition Report</h1>" +
      "<h2>" +
      escapeHtml(c.name) +
      " (ICD-10 " +
      escapeHtml(c.icd10) +
      ")</h2>" +
      "<p>" +
      escapeHtml(c.summary) +
      "</p>" +
      "<h3>Symptoms &amp; Signs</h3>" +
      ul(c.symptoms) +
      "<h3>Medications — First-line</h3>" +
      ul(c.medsFirst) +
      "<h3>Medications — Second-line</h3>" +
      ul(c.medsSecond) +
      "<h3>Prognosis</h3><p>" +
      escapeHtml(c.prognosis) +
      "</p>" +
      faqHtml +
      "<h3>Citations</h3>" +
      citationsHtml +
      '<p class="print-disclaimer">This report is educational reference information only. ' +
      "It is not medical advice and does not diagnose or prescribe. Consult a licensed " +
      "healthcare professional.</p>" +
      '<p class="print-foot">Generated by Zuuno · zuuno medical assistant</p>' +
      "</div>"
    );
  }

  function downloadPdf(condition) {
    if (!premium) {
      refreshPremiumModal();
      openModal(premiumModal);
      return;
    }
    if (printArea) {
      printArea.innerHTML = buildPrintReport(condition);
    }
    window.print();
  }

  function flashButton(btn, message) {
    if (!btn) return;
    var original = btn.innerHTML;
    btn.textContent = message;
    window.setTimeout(function () {
      btn.innerHTML = original;
    }, 1700);
  }

  function buildShareText(condition) {
    var parts = [
      "Zuuno — " + condition.name + " (ICD-10 " + condition.icd10 + ")",
      "",
      condition.summary,
      "",
      "Symptoms:",
    ];
    for (var i = 0; i < condition.symptoms.length; i++) {
      parts.push("• " + condition.symptoms[i]);
    }
    parts.push("", "First-line treatment:");
    for (var f = 0; f < condition.medsFirst.length; f++) {
      parts.push("• " + condition.medsFirst[f]);
    }
    parts.push("", "Prognosis: " + condition.prognosis);
    parts.push("", "Educational reference only; not medical advice.");
    return parts.join("\n");
  }
  function shareCondition(condition, btn) {
    var text = buildShareText(condition);
    if (navigator.share) {
      navigator.share({ title: "Zuuno — " + condition.name, text: text }).catch(function () {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () {
          flashButton(btn, "Copied to clipboard");
        },
        function () {
          flashButton(btn, "Could not copy");
        },
      );
    } else {
      flashButton(btn, "Sharing not supported");
    }
  }
  function copyCondition(condition, btn) {
    var text = buildShareText(condition);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        function () { flashButton(btn, "Copied"); },
        function () { flashButton(btn, "Could not copy"); },
      );
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        flashButton(btn, "Copied");
      } catch (e) {
        flashButton(btn, "Could not copy");
      }
    }
  }

  if (chatStream && chatInput && chatSend) {
    chatSend.addEventListener("click", handleSend);
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    chatStream.addEventListener("click", function (e) {
      var chip = e.target.closest(".suggest-chip");
      if (chip && chatStream.contains(chip)) {
        sendMessage(chip.textContent);
        return;
      }
      var actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        var act = actionBtn.getAttribute("data-action");
        var cond = CONDITIONS[Number(actionBtn.getAttribute("data-cond"))];
        if (act === "pdf" && cond) downloadPdf(cond);
        else if (act === "share" && cond) shareCondition(cond, actionBtn);
        else if (act === "copy" && cond) copyCondition(cond, actionBtn);
        else if (act === "premium-prompt") openModal(premiumModal);
        return;
      }
      var gloss = e.target.closest(".glossary-chip");
      if (gloss) {
        var term = gloss.getAttribute("data-term");
        if (term) sendMessage("define " + term);
        return;
      }
      var head = e.target.closest(".acc-head");
      if (!head || !chatStream.contains(head)) return;
      var acc = head.closest(".acc");
      if (!acc) return;
      var isOpen = acc.classList.toggle("acc-open");
      head.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  if (suggestedPrompts) {
    suggestedPrompts.addEventListener("click", function (e) {
      var chip = e.target.closest(".suggest-chip");
      if (chip) sendMessage(chip.textContent);
    });
  }

  if (conditionSelect) {
    for (var c = 0; c < CONDITIONS.length; c++) {
      var option = document.createElement("option");
      option.value = String(c);
      option.textContent = CONDITIONS[c].name + " · " + CONDITIONS[c].icd10;
      conditionSelect.appendChild(option);
    }
    conditionSelect.addEventListener("change", function () {
      var value = conditionSelect.value;
      setActiveCondition(value === "" ? null : CONDITIONS[Number(value)]);
    });
  }

  /* ========================================================
     6. PROVIDERS TAB
     ======================================================== */
  var PROVIDERS = [
    { id: "p1", name: "Dr. Elena Marquez, MD", specialty: "Rheumatology", city: "New York, NY", distanceMi: 2.4, telehealth: true, acceptingNew: true, affiliation: "Manhattan Rheumatology Associates", rating: 4.9, address: "425 Madison Ave, New York, NY 10017", phone: "(212) 555-0143", lat: 40.7561, lng: -73.9772 },
    { id: "p2", name: "Dr. Margaret O'Sullivan, MD", specialty: "Rheumatology", city: "Boston, MA", distanceMi: 1.9, telehealth: true, acceptingNew: true, affiliation: "Longwood Arthritis Center", rating: 4.8, address: "75 Francis St, Boston, MA 02115", phone: "(617) 555-0112", lat: 42.336, lng: -71.1057 },
    { id: "p3", name: "Dr. Samuel Adeyemi, MD", specialty: "Rheumatology", city: "Chicago, IL", distanceMi: 3.1, telehealth: true, acceptingNew: true, affiliation: "Chicago Rheumatic Disease Institute", rating: 4.7, address: "1611 W Harrison St, Chicago, IL 60612", phone: "(312) 555-0227", lat: 41.8741, lng: -87.6664 },
    { id: "p4", name: "Dr. Hannah Weiss, MD", specialty: "Rheumatology", city: "New York, NY", distanceMi: 11.2, telehealth: false, acceptingNew: true, affiliation: "East Side Arthritis & Autoimmune Clinic", rating: 4.6, address: "16 E 60th St, New York, NY 10022", phone: "(212) 555-0231", lat: 40.7637, lng: -73.9712 },
    { id: "p5", name: "Dr. David Chen, MD", specialty: "Endocrinology", city: "New York, NY", distanceMi: 9.6, telehealth: true, acceptingNew: true, affiliation: "NewYork Endocrine Partners", rating: 4.7, address: "52 E 72nd St, New York, NY 10021", phone: "(212) 555-0188", lat: 40.77, lng: -73.9647 },
    { id: "p6", name: "Dr. Priya Nair, MD", specialty: "Endocrinology", city: "Boston, MA", distanceMi: 4.4, telehealth: true, acceptingNew: true, affiliation: "Boston Diabetes & Thyroid Center", rating: 4.8, address: "330 Brookline Ave, Boston, MA 02215", phone: "(617) 555-0190", lat: 42.3449, lng: -71.1009 },
    { id: "p7", name: "Dr. Robert Kane, MD", specialty: "Endocrinology", city: "Chicago, IL", distanceMi: 7.0, telehealth: false, acceptingNew: true, affiliation: "Lakeshore Endocrinology Group", rating: 4.5, address: "259 E Erie St, Chicago, IL 60611", phone: "(312) 555-0241", lat: 41.8939, lng: -87.6207 },
    { id: "p8", name: "Dr. Aisha Bello, MD", specialty: "Neurology", city: "New York, NY", distanceMi: 18.3, telehealth: false, acceptingNew: false, affiliation: "Upper East Side Neurology", rating: 4.6, address: "1176 5th Ave, New York, NY 10029", phone: "(212) 555-0207", lat: 40.7902, lng: -73.9519 },
    { id: "p9", name: "Dr. James Whitfield, MD", specialty: "Neurology", city: "Boston, MA", distanceMi: 12.7, telehealth: true, acceptingNew: true, affiliation: "Beacon Neurology Associates", rating: 4.7, address: "55 Fruit St, Boston, MA 02114", phone: "(617) 555-0148", lat: 42.3632, lng: -71.0686 },
    { id: "p10", name: "Dr. Carmen Ortiz, MD", specialty: "Neurology", city: "Chicago, IL", distanceMi: 5.5, telehealth: true, acceptingNew: true, affiliation: "Chicago Headache & MS Center", rating: 4.9, address: "710 N Lake Shore Dr, Chicago, IL 60611", phone: "(312) 555-0263", lat: 41.8955, lng: -87.6175 },
    { id: "p11", name: "Dr. Thomas Reed, MD", specialty: "Neurology", city: "New York, NY", distanceMi: 6.8, telehealth: true, acceptingNew: true, affiliation: "Midtown Neurology Partners", rating: 4.6, address: "530 1st Ave, New York, NY 10016", phone: "(212) 555-0274", lat: 40.7423, lng: -73.9745 },
    { id: "p12", name: "Dr. Sofia Russo, DO", specialty: "Pulmonology", city: "Boston, MA", distanceMi: 31.5, telehealth: false, acceptingNew: true, affiliation: "Allston Pulmonary & Asthma Clinic", rating: 4.5, address: "736 Cambridge St, Boston, MA 02135", phone: "(617) 555-0173", lat: 42.3539, lng: -71.1337 },
    { id: "p13", name: "Dr. Daniel Park, MD", specialty: "Pulmonology", city: "New York, NY", distanceMi: 8.1, telehealth: true, acceptingNew: true, affiliation: "Manhattan Lung & Asthma Center", rating: 4.7, address: "462 1st Ave, New York, NY 10016", phone: "(212) 555-0285", lat: 40.7411, lng: -73.9762 },
    { id: "p14", name: "Dr. Olivia Grant, MD", specialty: "Pulmonology", city: "Chicago, IL", distanceMi: 14.2, telehealth: false, acceptingNew: true, affiliation: "Lakeview Respiratory Group", rating: 4.6, address: "836 W Wellington Ave, Chicago, IL 60657", phone: "(312) 555-0296", lat: 41.9363, lng: -87.6529 },
    { id: "p15", name: "Dr. William Carter, MD", specialty: "Cardiology", city: "Chicago, IL", distanceMi: 3.1, telehealth: true, acceptingNew: true, affiliation: "Chicago Heart & Vascular Group", rating: 4.8, address: "251 E Huron St, Chicago, IL 60611", phone: "(312) 555-0121", lat: 41.8948, lng: -87.623 },
    { id: "p16", name: "Dr. Grace Liu, MD", specialty: "Cardiology", city: "New York, NY", distanceMi: 5.2, telehealth: true, acceptingNew: true, affiliation: "East River Cardiology", rating: 4.7, address: "1283 York Ave, New York, NY 10065", phone: "(212) 555-0308", lat: 40.7634, lng: -73.9554 },
    { id: "p17", name: "Dr. Marcus Bell, MD", specialty: "Cardiology", city: "Boston, MA", distanceMi: 9.9, telehealth: false, acceptingNew: true, affiliation: "Fenway Heart Center", rating: 4.6, address: "185 Pilgrim Rd, Boston, MA 02215", phone: "(617) 555-0319", lat: 42.3389, lng: -71.1052 },
    { id: "p18", name: "Dr. Nina Petrova, MD", specialty: "Cardiology", city: "Chicago, IL", distanceMi: 19.6, telehealth: true, acceptingNew: true, affiliation: "Lincoln Park Cardiology", rating: 4.5, address: "2515 N Clark St, Chicago, IL 60614", phone: "(312) 555-0320", lat: 41.9285, lng: -87.6428 },
    { id: "p19", name: "Dr. Grace Park, MD", specialty: "Gastroenterology", city: "Chicago, IL", distanceMi: 22.0, telehealth: false, acceptingNew: true, affiliation: "Illinois Digestive Health", rating: 4.7, address: "1725 W Harrison St, Chicago, IL 60612", phone: "(312) 555-0179", lat: 41.8743, lng: -87.6685 },
    { id: "p20", name: "Dr. Henry Cole, MD", specialty: "Gastroenterology", city: "New York, NY", distanceMi: 7.4, telehealth: true, acceptingNew: true, affiliation: "Midtown GI & IBD Center", rating: 4.8, address: "16 E 60th St, New York, NY 10022", phone: "(212) 555-0331", lat: 40.7638, lng: -73.9711 },
    { id: "p21", name: "Dr. Laura Simmons, MD", specialty: "Gastroenterology", city: "Boston, MA", distanceMi: 6.3, telehealth: true, acceptingNew: true, affiliation: "Boston Digestive & IBD Associates", rating: 4.7, address: "800 Washington St, Boston, MA 02111", phone: "(617) 555-0342", lat: 42.3493, lng: -71.0635 },
  ];

  var providerList = document.getElementById("provider-list");
  var providerMeta = document.getElementById("provider-meta");
  var providerLocation = document.getElementById("provider-location");
  var providerRadius = document.getElementById("provider-radius");
  var providerFilterBtn = document.getElementById("provider-filter-btn");
  var providerFilters = document.getElementById("provider-filters");
  var providerSpecialty = document.getElementById("provider-specialty");
  var providerTelehealth = document.getElementById("provider-telehealth");
  var providerAccepting = document.getElementById("provider-accepting");

  var providerState = {
    location: "all",
    radius: 50,
    specialty: "all",
    telehealthOnly: false,
    acceptingOnly: false,
  };
  var savedProviders = STORE.get("savedProviders", {});
  var lastProviderRows = [];

  function providerCard(p) {
    var saved = savedProviders[p.id] === true;
    return (
      '<article class="card result-card">' +
      '<div class="result-top"><div>' +
      '<h3 class="result-name">' +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="result-sub">' +
      escapeHtml(p.specialty) +
      " · " +
      escapeHtml(p.city) +
      "</p></div>" +
      '<button class="star-btn' +
      (saved ? " on" : "") +
      '" type="button" data-action="save-provider" data-id="' +
      p.id +
      '" aria-pressed="' +
      saved +
      '" aria-label="Save provider">' +
      icon("star") +
      "</button></div>" +
      '<div class="chip-row">' +
      distanceChip(p) +
      '<span class="chip"><span class="rating">&#9733;</span> ' +
      p.rating.toFixed(1) +
      "</span>" +
      (p.telehealth ? '<span class="chip chip-blue">Telehealth</span>' : "") +
      '<span class="chip ' +
      (p.acceptingNew ? "chip-green" : "") +
      '">' +
      (p.acceptingNew ? "Accepting patients" : "Waitlist only") +
      "</span></div>" +
      '<div class="result-rows">' +
      '<p class="result-row">' +
      icon("building") +
      escapeHtml(p.affiliation) +
      "</p>" +
      '<p class="result-row">' +
      icon("pin") +
      escapeHtml(p.address) +
      "</p>" +
      '<p class="result-row">' +
      icon("phone") +
      escapeHtml(p.phone) +
      "</p></div>" +
      '<div class="result-actions">' +
      '<a class="btn btn-primary btn-sm" href="' +
      telHref(p.phone) +
      '">Call</a>' +
      '<a class="btn btn-secondary btn-sm" href="' +
      mapsHref(p.address) +
      '" target="_blank" rel="noreferrer">Directions</a>' +
      "</div></article>"
    );
  }

  function renderProviders() {
    var rows = PROVIDERS.filter(function (p) {
      if (providerState.location !== "all" && p.city !== providerState.location) return false;
      var d = distanceMiFor(p);
      if (d != null && d > providerState.radius) return false;
      if (providerState.specialty !== "all" && p.specialty !== providerState.specialty) return false;
      if (providerState.telehealthOnly && !p.telehealth) return false;
      if (providerState.acceptingOnly && !p.acceptingNew) return false;
      return true;
    });

    var persoSpecialty = activeCondition ? CONDITION_SPECIALTY[activeCondition.name] : null;
    rows.sort(function (a, b) {
      if (persoSpecialty) {
        var aM = a.specialty === persoSpecialty ? 0 : 1;
        var bM = b.specialty === persoSpecialty ? 0 : 1;
        if (aM !== bM) return aM - bM;
      }
      var da = distanceMiFor(a);
      var db = distanceMiFor(b);
      if (da == null) return db == null ? 0 : 1;
      if (db == null) return -1;
      return da - db;
    });

    providerMeta.innerHTML =
      "<span>" + rows.length + " provider" + (rows.length === 1 ? "" : "s") + " found</span>";

    if (rows.length === 0) {
      providerList.innerHTML = emptyState(
        "search",
        "No providers found in your area",
        "Try expanding your search radius, changing the location, or clearing filters.",
      );
    } else {
      var html = "";
      for (var i = 0; i < rows.length; i++) html += providerCard(rows[i]);
      providerList.innerHTML = html;
    }
    lastProviderRows = rows;
    drawProviderMarkers();
  }

  if (providerList) {
    fillSelect(providerSpecialty, uniqueField(PROVIDERS, "specialty"));
    providerLocation.addEventListener("change", function () {
      providerState.location = providerLocation.value;
      renderProviders();
    });
    providerRadius.addEventListener("change", function () {
      providerState.radius = Number(providerRadius.value);
      renderProviders();
    });
    providerFilterBtn.addEventListener("click", function () {
      providerFilters.classList.toggle("open");
      providerFilterBtn.classList.toggle("on");
    });
    providerSpecialty.addEventListener("change", function () {
      providerState.specialty = providerSpecialty.value;
      renderProviders();
    });
    providerTelehealth.addEventListener("click", function () {
      providerState.telehealthOnly = !providerState.telehealthOnly;
      providerTelehealth.classList.toggle("on", providerState.telehealthOnly);
      renderProviders();
    });
    providerAccepting.addEventListener("click", function () {
      providerState.acceptingOnly = !providerState.acceptingOnly;
      providerAccepting.classList.toggle("on", providerState.acceptingOnly);
      renderProviders();
    });
    providerList.addEventListener("click", function (e) {
      var btn = e.target.closest('[data-action="save-provider"]');
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      savedProviders[id] = !savedProviders[id];
      STORE.set("savedProviders", savedProviders);
      renderProviders();
    });
  }

  /* ========================================================
     7. PHARMACY TAB
     ======================================================== */
  var PHARMACIES = [
    { id: "rx1", name: "Midtown Community Pharmacy", chain: "CVS Pharmacy", kind: "retail", distanceMi: 1.1, hours: "Mon–Fri 8 AM–10 PM, Sat–Sun 9 AM–7 PM", phone: "(212) 555-0301", address: "630 Lexington Ave, New York, NY 10022", info: "Prescriptions, immunizations, drive-thru, home delivery", lat: 40.7586, lng: -73.971 },
    { id: "rx2", name: "Manhattan Specialty Pharmacy", chain: "Independent", kind: "specialty", distanceMi: 2.6, hours: "Mon–Fri 9 AM–6 PM", phone: "(212) 555-0322", address: "139 E 57th St, New York, NY 10022", info: "Specialty and biologic medications, prior-authorization support", lat: 40.7616, lng: -73.969 },
    { id: "rx3", name: "East River Infusion Center", chain: "Independent", kind: "infusion", distanceMi: 3.0, hours: "Mon–Sat 7 AM–7 PM", phone: "(212) 555-0344", address: "530 1st Ave, New York, NY 10016", info: "Infusion specialties: Rheumatology, Neurology, Gastroenterology, Immunology", lat: 40.7423, lng: -73.9745 },
    { id: "rx4", name: "Gramercy Care Pharmacy", chain: "Walgreens", kind: "retail", distanceMi: 4.2, hours: "Mon–Sun 7 AM–11 PM", phone: "(212) 555-0356", address: "215 Park Ave S, New York, NY 10003", info: "Prescriptions, immunizations, home delivery", lat: 40.7384, lng: -73.9876 },
    { id: "rx5", name: "Longwood Pharmacy", chain: "Walgreens", kind: "retail", distanceMi: 0.8, hours: "Open 24 hours", phone: "(617) 555-0302", address: "350 Longwood Ave, Boston, MA 02115", info: "Prescriptions, immunizations, 24-hour service", lat: 42.3378, lng: -71.1042 },
    { id: "rx6", name: "Back Bay Specialty Pharmacy", chain: "Independent", kind: "specialty", distanceMi: 2.2, hours: "Mon–Fri 8:30 AM–6 PM", phone: "(617) 555-0323", address: "800 Boylston St, Boston, MA 02199", info: "Specialty medications, biologics, home delivery", lat: 42.3479, lng: -71.0826 },
    { id: "rx7", name: "Charles River Infusion Center", chain: "Independent", kind: "infusion", distanceMi: 3.7, hours: "Mon–Sat 7 AM–6 PM", phone: "(617) 555-0367", address: "125 Nashua St, Boston, MA 02114", info: "Infusion specialties: Rheumatology, Neurology, Gastroenterology", lat: 42.3669, lng: -71.0658 },
    { id: "rx8", name: "Streeterville Pharmacy", chain: "Walgreens", kind: "retail", distanceMi: 1.5, hours: "Mon–Sun 7 AM–11 PM", phone: "(312) 555-0303", address: "300 E Ohio St, Chicago, IL 60611", info: "Prescriptions, immunizations, drive-thru", lat: 41.8924, lng: -87.6211 },
    { id: "rx9", name: "West Loop Specialty Pharmacy", chain: "Independent", kind: "specialty", distanceMi: 4.0, hours: "Mon–Fri 9 AM–6 PM", phone: "(312) 555-0388", address: "910 W Van Buren St, Chicago, IL 60607", info: "Specialty medications, biologics, financial-assistance support", lat: 41.8765, lng: -87.6513 },
    { id: "rx10", name: "Illinois Medical District Infusion Center", chain: "Independent", kind: "infusion", distanceMi: 2.9, hours: "Mon–Sat 7 AM–7 PM", phone: "(312) 555-0399", address: "1801 W Taylor St, Chicago, IL 60612", info: "Infusion specialties: Rheumatology, Gastroenterology, Neurology, Immunology", lat: 41.8693, lng: -87.6731 },
    { id: "rx11", name: "Lincoln Park Pharmacy", chain: "CVS Pharmacy", kind: "retail", distanceMi: 8.3, hours: "Mon–Sun 8 AM–10 PM", phone: "(312) 555-0410", address: "2418 N Clark St, Chicago, IL 60614", info: "Prescriptions, immunizations, home delivery", lat: 41.9266, lng: -87.6422 },
    { id: "rx12", name: "Express Scripts Mail Pharmacy", chain: "Express Scripts", kind: "online", distanceMi: null, hours: "Phone support 24/7", phone: "(800) 555-0911", address: "Nationwide mail-order service", info: "Mail-order prescriptions, 90-day supplies, automatic refills", lat: null, lng: null },
    { id: "rx13", name: "Accredo Specialty Pharmacy", chain: "Accredo", kind: "online", distanceMi: null, hours: "Phone support 24/7", phone: "(800) 555-0922", address: "Nationwide specialty mail-order service", info: "Specialty and biologic medications shipped nationwide, nurse support", lat: null, lng: null },
    { id: "rx14", name: "CenterWell Pharmacy", chain: "CenterWell", kind: "online", distanceMi: null, hours: "Phone support 24/7", phone: "(800) 555-0933", address: "Nationwide mail-order service", info: "Mail-order prescriptions, automatic refills, pharmacist consultations", lat: null, lng: null },
  ];

  var PHARMACY_KIND_LABELS = {
    retail: "Retail pharmacy",
    specialty: "Specialty pharmacy",
    infusion: "Infusion center",
    online: "Online / mail-order",
  };
  var PHARMACY_KIND_CHIPS = {
    retail: "chip",
    specialty: "chip-blue",
    infusion: "chip-violet",
    online: "chip-teal",
  };

  var pharmacyList = document.getElementById("pharmacy-list");
  var pharmacyMeta = document.getElementById("pharmacy-meta");
  var pharmacyKinds = document.getElementById("pharmacy-kinds");
  var medCheckInput = document.getElementById("med-check-input");
  var medCheckBtn = document.getElementById("med-check-btn");
  var medCheckMsg = document.getElementById("med-check-msg");
  var pharmacyKind = "all";
  var lastPharmacyRows = [];

  function pharmacyCard(p) {
    return (
      '<article class="card result-card">' +
      '<div class="result-top"><div>' +
      '<h3 class="result-name">' +
      escapeHtml(p.name) +
      "</h3>" +
      '<p class="result-sub">' +
      escapeHtml(p.chain) +
      " · " +
      PHARMACY_KIND_LABELS[p.kind] +
      "</p></div></div>" +
      '<div class="chip-row">' +
      (distanceMiFor(p) != null
        ? '<span class="chip chip-teal">' + distanceMiFor(p).toFixed(1) +
          (userLocation && userLocation.on ? " mi away" : " mi") +
          "</span>"
        : '<span class="chip chip-teal">Ships nationwide</span>') +
      '<span class="chip ' +
      PHARMACY_KIND_CHIPS[p.kind] +
      '">' +
      PHARMACY_KIND_LABELS[p.kind] +
      "</span></div>" +
      '<div class="result-rows">' +
      '<p class="result-row">' +
      icon("clock") +
      escapeHtml(p.hours) +
      "</p>" +
      '<p class="result-row">' +
      icon("phone") +
      escapeHtml(p.phone) +
      "</p>" +
      '<p class="result-row">' +
      icon("pin") +
      escapeHtml(p.address) +
      "</p>" +
      '<p class="result-row">' +
      icon("pill") +
      escapeHtml(p.info) +
      "</p></div>" +
      '<div class="result-actions">' +
      '<a class="btn btn-primary btn-sm" href="' +
      telHref(p.phone) +
      '">Call pharmacy</a>' +
      (p.kind !== "online"
        ? '<a class="btn btn-secondary btn-sm" href="' +
          mapsHref(p.address) +
          '" target="_blank" rel="noreferrer">Directions</a>'
        : "") +
      "</div></article>"
    );
  }

  function renderPharmacies() {
    var rows = PHARMACIES.filter(function (p) {
      return pharmacyKind === "all" || p.kind === pharmacyKind;
    });
    pharmacyMeta.innerHTML =
      "<span>" + rows.length + " result" + (rows.length === 1 ? "" : "s") + "</span>";
    if (rows.length === 0) {
      pharmacyList.innerHTML = emptyState("pill", "No pharmacies found", "Try a different pharmacy type.");
    } else {
      var html = "";
      for (var i = 0; i < rows.length; i++) html += pharmacyCard(rows[i]);
      pharmacyList.innerHTML = html;
    }
    lastPharmacyRows = rows;
    drawPharmacyMarkers();
  }

  function runMedCheck() {
    var value = medCheckInput.value.trim();
    if (!value) {
      medCheckMsg.innerHTML = "";
      return;
    }
    medCheckMsg.innerHTML =
      '<div class="notice">' +
      icon("info") +
      "<span>Live stock for <strong>" +
      escapeHtml(value) +
      "</strong> is not in our feed yet. Call a pharmacy below to confirm availability — " +
      "most can also order it or transfer your prescription.</span></div>";
  }

  if (pharmacyList) {
    pharmacyKinds.addEventListener("click", function (e) {
      var pill = e.target.closest("[data-kind]");
      if (!pill) return;
      pharmacyKind = pill.getAttribute("data-kind");
      pharmacyKinds.querySelectorAll(".pill-btn").forEach(function (b) {
        b.classList.toggle("on", b === pill);
      });
      renderPharmacies();
    });
    medCheckBtn.addEventListener("click", runMedCheck);
    medCheckInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        runMedCheck();
      }
    });
  }

  /* ========================================================
     8. CLINICAL TRIALS TAB (live ClinicalTrials.gov)
     ======================================================== */
  var FALLBACK_TRIALS = [
    { id: "NCT05000001", title: "Investigational Biologic for Moderate-to-Severe Lupus", sponsor: "Academic Rheumatology Research Network", phase: "Phase 3", status: "Recruiting", condition: "lupus", interventions: "Investigational biologic · Placebo", sites: "New York, NY · Chicago, IL", siteCount: 2, eligibility: "Adults aged 18–75 with a confirmed lupus diagnosis and active disease despite standard therapy." },
    { id: "NCT05000002", title: "Treat-to-Target Strategy Trial in Early Rheumatoid Arthritis", sponsor: "National Rheumatology Consortium", phase: "Phase 4", status: "Recruiting", condition: "rheumatoid arthritis", interventions: "Methotrexate strategy · Early biologic strategy", sites: "Boston, MA · Chicago, IL", siteCount: 2, eligibility: "Adults with rheumatoid arthritis diagnosed within the past 12 months who have not yet taken a DMARD." },
    { id: "NCT05000003", title: "Continuous Glucose Monitoring in Type 2 Diabetes", sponsor: "Endocrine Health Research Group", phase: "N/A", status: "Recruiting", condition: "type 2 diabetes", interventions: "Continuous glucose monitor · Usual care", sites: "New York, NY · Boston, MA", siteCount: 2, eligibility: "Adults with type 2 diabetes and an A1c above target on stable therapy." },
    { id: "NCT05000004", title: "Early High-Efficacy Therapy in Relapsing Multiple Sclerosis", sponsor: "Neuroimmunology Trials Network", phase: "Phase 3", status: "Recruiting", condition: "multiple sclerosis", interventions: "High-efficacy therapy · Escalation therapy", sites: "Boston, MA · Chicago, IL", siteCount: 2, eligibility: "Adults aged 18–55 with relapsing-remitting multiple sclerosis diagnosed within two years." },
    { id: "NCT05000005", title: "Maintenance Biologic Comparison in Crohn's Disease", sponsor: "Gastrointestinal Research Alliance", phase: "Phase 3", status: "Active, not recruiting", condition: "crohn's disease", interventions: "Anti-IL-23 biologic · Anti-TNF biologic", sites: "Chicago, IL", siteCount: 1, eligibility: "Adults with moderate-to-severe Crohn's disease who responded to induction therapy." },
    { id: "NCT05000006", title: "Biologic Therapy for Severe Eosinophilic Asthma", sponsor: "Respiratory Clinical Research Group", phase: "Phase 3", status: "Recruiting", condition: "asthma", interventions: "Investigational biologic · Placebo", sites: "New York, NY · Boston, MA", siteCount: 2, eligibility: "Patients aged 12 and older with severe asthma and elevated blood eosinophils." },
    { id: "NCT05000007", title: "SGLT2 Inhibitor Outcomes in Heart Failure", sponsor: "Cardiovascular Outcomes Institute", phase: "Phase 3", status: "Not yet recruiting", condition: "heart failure", interventions: "SGLT2 inhibitor · Placebo", sites: "New York, NY · Chicago, IL", siteCount: 2, eligibility: "Adults aged 40 and older with chronic heart failure and recent worsening symptoms." },
    { id: "NCT05000008", title: "CGRP-Targeted Preventive Therapy for Chronic Migraine", sponsor: "Headache Clinical Research Network", phase: "Phase 3", status: "Recruiting", condition: "migraine", interventions: "CGRP-targeted therapy · Placebo", sites: "Boston, MA", siteCount: 1, eligibility: "Adults aged 18–65 with chronic migraine and 15 or more headache days per month." },
  ];

  var PHASE_LABELS = {
    EARLY_PHASE1: "Early Phase 1",
    PHASE1: "Phase 1",
    PHASE2: "Phase 2",
    PHASE3: "Phase 3",
    PHASE4: "Phase 4",
    NA: "N/A",
  };

  function formatPhases(phases) {
    if (!phases || !phases.length) return "N/A";
    var labels = [];
    for (var i = 0; i < phases.length; i++) {
      labels.push(PHASE_LABELS[phases[i]] || phases[i]);
    }
    var nums = [];
    for (var j = 0; j < labels.length; j++) {
      var m = /^Phase (\d)$/.exec(labels[j]);
      if (m) nums.push(m[1]);
    }
    if (nums.length === labels.length && nums.length > 1) return "Phase " + nums.join("/");
    return labels.join(", ");
  }

  function formatStatus(status) {
    if (!status) return "Unknown";
    var t = String(status).toLowerCase().split("_").join(" ");
    t = t.charAt(0).toUpperCase() + t.slice(1);
    return t.replace("Active not recruiting", "Active, not recruiting");
  }

  function parseStudy(raw) {
    var p = raw && raw.protocolSection;
    if (!p) return null;
    var id = p.identificationModule && p.identificationModule.nctId;
    if (!id) return null;
    var locs = (p.contactsLocationsModule && p.contactsLocationsModule.locations) || [];
    var siteParts = [];
    var countrySet = {};
    for (var i = 0; i < locs.length; i++) {
      if (i < 4) {
        var part = [locs[i].city, locs[i].state].filter(Boolean).join(", ");
        if (part) siteParts.push(part);
      }
      if (locs[i].country) countrySet[locs[i].country] = true;
    }
    var ivs = (p.armsInterventionsModule && p.armsInterventionsModule.interventions) || [];
    var ivNames = [];
    for (var k = 0; k < ivs.length && k < 4; k++) {
      if (ivs[k].name) ivNames.push(ivs[k].name);
    }
    var conds = (p.conditionsModule && p.conditionsModule.conditions) || [];
    return {
      id: id,
      title:
        (p.identificationModule && p.identificationModule.briefTitle) ||
        (p.identificationModule && p.identificationModule.officialTitle) ||
        id,
      sponsor:
        (p.sponsorCollaboratorsModule &&
          p.sponsorCollaboratorsModule.leadSponsor &&
          p.sponsorCollaboratorsModule.leadSponsor.name) ||
        "Not specified",
      phase: formatPhases(p.designModule && p.designModule.phases),
      status: formatStatus(p.statusModule && p.statusModule.overallStatus),
      condition: conds.join(", ").toLowerCase(),
      interventions: ivNames.length ? ivNames.join(" · ") : "See the study record",
      sites: siteParts.length ? siteParts.join(" · ") : "See ClinicalTrials.gov for locations",
      siteCount: locs.length,
      countries: Object.keys(countrySet),
      eligibility: truncate(
        (p.eligibilityModule && p.eligibilityModule.eligibilityCriteria) ||
          "See the study record for full eligibility criteria.",
        340,
      ),
    };
  }

  function searchTrialsLive(query) {
    var url =
      "https://clinicaltrials.gov/api/v2/studies?format=json&pageSize=30&query.cond=" +
      encodeURIComponent(query);
    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var studies = (data && data.studies) || [];
        var out = [];
        for (var i = 0; i < studies.length; i++) {
          var t = parseStudy(studies[i]);
          if (t) out.push(t);
        }
        return out;
      });
  }

  function fallbackTrialsFor(query) {
    var q = String(query || "").toLowerCase();
    var matched = FALLBACK_TRIALS.filter(function (t) {
      return t.condition.indexOf(q) !== -1 || t.title.toLowerCase().indexOf(q) !== -1;
    });
    var list = matched.length ? matched : FALLBACK_TRIALS;
    return list.map(function (t) {
      var copy = {};
      for (var k in t) copy[k] = t[k];
      if (!copy.countries) copy.countries = ["United States"];
      return copy;
    });
  }

  var trialList = document.getElementById("trial-list");
  var trialMeta = document.getElementById("trial-meta");
  var trialSearch = document.getElementById("trial-search");
  var trialSearchBtn = document.getElementById("trial-search-btn");
  var trialPhase = document.getElementById("trial-phase");
  var trialStatus = document.getElementById("trial-status");
  var trialCountry = document.getElementById("trial-country");
  var trialFilters = document.getElementById("trial-filters");
  var trialViewSearch = document.getElementById("trial-view-search");
  var trialViewWatching = document.getElementById("trial-view-watching");

  var trialState = {
    query: "",
    phase: "all",
    status: "all",
    country: "all",
    view: "search",
    loading: false,
    source: "live",
    autoQuery: "",
    searched: false,
  };
  var trialResults = [];
  var savedTrials = STORE.get("savedTrials", {});
  var expandedTrials = {};
  var lastRenderedTrials = [];

  function trialStatusChip(status) {
    if (status === "Recruiting") return "chip-green";
    if (status === "Completed") return "chip";
    return "chip-amber";
  }

  function trialCard(t) {
    var saved = !!savedTrials[t.id];
    var expanded = expandedTrials[t.id] === true;
    var siteCount = typeof t.siteCount === "number" ? t.siteCount : 0;

    var html =
      '<article class="card result-card">' +
      '<div class="result-top"><div>' +
      '<h3 class="result-name">' +
      escapeHtml(t.title) +
      "</h3>" +
      '<p class="result-sub">' +
      escapeHtml(t.id) +
      " · " +
      escapeHtml(t.sponsor) +
      "</p></div></div>" +
      '<div class="chip-row">' +
      '<span class="chip chip-teal">' +
      escapeHtml(t.phase) +
      "</span>" +
      '<span class="chip ' +
      trialStatusChip(t.status) +
      '">' +
      escapeHtml(t.status) +
      "</span>" +
      (siteCount > 0
        ? '<span class="chip">' + siteCount + (siteCount === 1 ? " site" : " sites") + "</span>"
        : "") +
      "</div>";

    if (expanded) {
      html +=
        '<div class="detail-block">' +
        '<p class="section-label">Eligibility</p><p>' +
        escapeHtml(t.eligibility) +
        "</p>" +
        '<p class="section-label">Interventions</p><p>' +
        escapeHtml(t.interventions) +
        "</p>" +
        '<p class="section-label">Study locations</p><p>' +
        escapeHtml(t.sites) +
        "</p></div>";
    }

    html +=
      '<div class="result-actions">' +
      '<button class="btn btn-secondary btn-sm" type="button" data-action="toggle-detail" data-id="' +
      escapeHtml(t.id) +
      '">' +
      (expanded ? "Less detail" : "More detail") +
      "</button>" +
      '<button class="btn ' +
      (saved ? "btn-secondary" : "btn-primary") +
      ' btn-sm" type="button" data-action="save-trial" data-id="' +
      escapeHtml(t.id) +
      '">' +
      (saved ? "✓ Watching" : "Save &amp; watch") +
      "</button>" +
      '<a class="btn btn-secondary btn-sm" href="https://clinicaltrials.gov/study/' +
      encodeURIComponent(t.id) +
      '" target="_blank" rel="noreferrer">ClinicalTrials.gov</a>' +
      "</div></article>";
    return html;
  }

  function renderTrials() {
    var savedCount = Object.keys(savedTrials).length;
    trialViewWatching.textContent = "Watching (" + savedCount + ")";
    trialViewSearch.classList.toggle("on", trialState.view === "search");
    trialViewWatching.classList.toggle("on", trialState.view === "watching");
    trialFilters.style.display = trialState.view === "watching" ? "none" : "";

    if (trialState.loading) {
      trialMeta.innerHTML = "";
      trialList.innerHTML =
        '<div class="loading-state"><div class="spinner"></div>Searching ClinicalTrials.gov…</div>';
      return;
    }

    var rows;
    if (trialState.view === "watching") {
      rows = Object.keys(savedTrials).map(function (k) {
        return savedTrials[k];
      });
    } else {
      rows = trialResults.filter(function (t) {
        if (trialState.phase !== "all" && t.phase !== trialState.phase) return false;
        if (trialState.status !== "all" && t.status !== trialState.status) return false;
        if (trialState.country !== "all") {
          var cs = t.countries || [];
          if (cs.indexOf(trialState.country) === -1) return false;
        }
        return true;
      });
      if (activeCondition) {
        var key = CONDITION_TRIAL[activeCondition.name];
        rows.sort(function (a, b) {
          var aM = key && a.condition.indexOf(key) !== -1 ? 0 : 1;
          var bM = key && b.condition.indexOf(key) !== -1 ? 0 : 1;
          return aM - bM;
        });
      }
    }

    var metaText =
      rows.length + " trial" + (rows.length === 1 ? "" : "s") +
      (trialState.view === "watching" ? " watched" : "");
    var note = "";
    if (trialState.view === "search" && trialState.searched) {
      note =
        trialState.source === "live"
          ? '<span class="source-note">Live results from ClinicalTrials.gov</span>'
          : '<span class="source-note">Offline — showing saved example trials</span>';
    }
    trialMeta.innerHTML = "<span>" + metaText + "</span>" + note;

    if (rows.length === 0) {
      if (trialState.view === "watching") {
        trialList.innerHTML = emptyState(
          "star",
          "No watched trials yet",
          "Tap “Save & watch” on a trial to keep track of it here.",
        );
      } else if (!trialState.searched) {
        trialList.innerHTML = emptyState(
          "flask",
          "Search for clinical trials",
          "Enter a condition above, or pick a condition in the Assistant tab to see matching trials.",
        );
      } else {
        trialList.innerHTML = emptyState(
          "flask",
          "No active trials match your search",
          "Try broadening your search or clearing the phase and status filters.",
        );
      }
      lastRenderedTrials = [];
      return;
    }
    lastRenderedTrials = rows;
    var html = "";
    for (var i = 0; i < rows.length; i++) html += trialCard(rows[i]);
    trialList.innerHTML = html;
  }

  function refreshCountryOptions() {
    if (!trialCountry) return;
    var set = {};
    for (var i = 0; i < trialResults.length; i++) {
      var cs = trialResults[i].countries || [];
      for (var j = 0; j < cs.length; j++) set[cs[j]] = true;
    }
    var countries = Object.keys(set).sort();
    var current = trialState.country;
    var html = '<option value="all">All countries</option>';
    for (var k = 0; k < countries.length; k++) {
      html +=
        '<option value="' +
        escapeHtml(countries[k]) +
        '">' +
        escapeHtml(countries[k]) +
        "</option>";
    }
    trialCountry.innerHTML = html;
    if (countries.indexOf(current) !== -1) {
      trialCountry.value = current;
    } else {
      trialCountry.value = "all";
      trialState.country = "all";
    }
  }

  function runTrialSearch(query) {
    query = String(query || "").trim();
    if (!query) return;
    trialState.query = query;
    trialState.view = "search";
    trialState.loading = true;
    trialState.searched = true;
    renderTrials();
    searchTrialsLive(query)
      .then(function (results) {
        trialState.loading = false;
        trialResults = results;
        trialState.source = "live";
        refreshCountryOptions();
        renderTrials();
      })
      .catch(function () {
        trialState.loading = false;
        trialResults = fallbackTrialsFor(query);
        trialState.source = "curated";
        refreshCountryOptions();
        renderTrials();
      });
  }

  function maybeAutoSearchTrials() {
    if (trialState.loading) return;
    var want = activeCondition ? activeCondition.name : "";
    if (want && trialState.autoQuery !== want) {
      trialState.autoQuery = want;
      trialSearch.value = want;
      runTrialSearch(want);
    } else if (!trialState.searched) {
      renderTrials();
    }
  }

  if (trialList) {
    fillSelect(trialPhase, ["Early Phase 1", "Phase 1", "Phase 2", "Phase 3", "Phase 4", "N/A"]);
    fillSelect(trialStatus, [
      "Recruiting",
      "Not yet recruiting",
      "Active, not recruiting",
      "Enrolling by invitation",
      "Completed",
      "Terminated",
    ]);

    trialSearchBtn.addEventListener("click", function () {
      runTrialSearch(trialSearch.value);
    });
    trialSearch.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        runTrialSearch(trialSearch.value);
      }
    });
    trialPhase.addEventListener("change", function () {
      trialState.phase = trialPhase.value;
      renderTrials();
    });
    trialStatus.addEventListener("change", function () {
      trialState.status = trialStatus.value;
      renderTrials();
    });
    if (trialCountry) {
      trialCountry.addEventListener("change", function () {
        trialState.country = trialCountry.value;
        renderTrials();
      });
    }
    trialViewSearch.addEventListener("click", function () {
      trialState.view = "search";
      renderTrials();
    });
    trialViewWatching.addEventListener("click", function () {
      trialState.view = "watching";
      renderTrials();
    });
    trialList.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var id = btn.getAttribute("data-id");
      var action = btn.getAttribute("data-action");
      if (action === "save-trial") {
        if (savedTrials[id]) {
          delete savedTrials[id];
        } else {
          var found = null;
          for (var i = 0; i < lastRenderedTrials.length; i++) {
            if (lastRenderedTrials[i].id === id) {
              found = lastRenderedTrials[i];
              break;
            }
          }
          if (found) savedTrials[id] = found;
        }
        STORE.set("savedTrials", savedTrials);
      } else if (action === "toggle-detail") {
        expandedTrials[id] = !expandedTrials[id];
      }
      renderTrials();
    });
  }

  /* ========================================================
     9. RESEARCH & NONPROFITS TAB
     ======================================================== */
  var RESOURCES = [
    { id: "r1", name: "Lupus Foundation of America", site: "lupus.org", category: "Nonprofit & Advocacy", url: "https://www.lupus.org", conditions: ["Systemic Lupus Erythematosus"], description: "National advocacy and research organization with education, support programs, and a health-information helpline for people affected by lupus." },
    { id: "r2", name: "Lupus Research Alliance", site: "lupusresearch.org", category: "Nonprofit & Advocacy", url: "https://www.lupusresearch.org", conditions: ["Systemic Lupus Erythematosus"], description: "The largest non-governmental funder of lupus research, with plain-language updates on new science and treatments." },
    { id: "r3", name: "Lupus and Allied Diseases Association", site: "ladainc.org", category: "Nonprofit & Advocacy", url: "https://www.ladainc.org", conditions: ["Systemic Lupus Erythematosus"], description: "Patient-led advocacy organization focused on lupus awareness, support, and access to care." },
    { id: "r4", name: "Arthritis Foundation", site: "arthritis.org", category: "Nonprofit & Advocacy", url: "https://www.arthritis.org", conditions: ["Rheumatoid Arthritis"], description: "Education, advocacy, and community programs covering rheumatoid arthritis and other forms of arthritis." },
    { id: "r5", name: "CreakyJoints", site: "creakyjoints.org", category: "Patient Education", url: "https://creakyjoints.org", conditions: ["Rheumatoid Arthritis"], description: "A patient community offering practical, day-to-day guidance for living with rheumatoid arthritis and other arthritis types." },
    { id: "r6", name: "Global Healthy Living Foundation", site: "ghlf.org", category: "Nonprofit & Advocacy", url: "https://www.ghlf.org", conditions: ["Rheumatoid Arthritis", "Crohn's Disease"], description: "Support and advocacy for people living with chronic inflammatory and autoimmune conditions." },
    { id: "r7", name: "American Diabetes Association", site: "diabetes.org", category: "Nonprofit & Advocacy", url: "https://www.diabetes.org", conditions: ["Type 2 Diabetes Mellitus", "Type 1 Diabetes Mellitus"], description: "Education, advocacy, and day-to-day management guidance for people living with type 1 and type 2 diabetes." },
    { id: "r8", name: "JDRF / Breakthrough T1D", site: "jdrf.org", category: "Nonprofit & Advocacy", url: "https://www.jdrf.org", conditions: ["Type 1 Diabetes Mellitus"], description: "Leading global funder of type 1 diabetes research, with newly-diagnosed support resources and advocacy." },
    { id: "r9", name: "Beyond Type 1", site: "beyondtype1.org", category: "Patient Education", url: "https://www.beyondtype1.org", conditions: ["Type 1 Diabetes Mellitus", "Type 2 Diabetes Mellitus"], description: "A digital community and education hub for people living with diabetes and their families." },
    { id: "r10", name: "Diabetes Research Institute Foundation", site: "diabetesresearch.org", category: "Nonprofit & Advocacy", url: "https://www.diabetesresearch.org", conditions: ["Type 1 Diabetes Mellitus", "Type 2 Diabetes Mellitus"], description: "Funds research aimed at better treatments and a cure for diabetes." },
    { id: "r11", name: "Asthma and Allergy Foundation of America", site: "aafa.org", category: "Nonprofit & Advocacy", url: "https://www.aafa.org", conditions: ["Asthma"], description: "Education, support, and advocacy for people with asthma and allergic conditions, including action-plan resources." },
    { id: "r12", name: "American Lung Association", site: "lung.org", category: "Nonprofit & Advocacy", url: "https://www.lung.org", conditions: ["Asthma", "Chronic Obstructive Pulmonary Disease"], description: "Education, support programs, and a Lung HelpLine for asthma, COPD, and other respiratory conditions." },
    { id: "r13", name: "COPD Foundation", site: "copdfoundation.org", category: "Nonprofit & Advocacy", url: "https://www.copdfoundation.org", conditions: ["Chronic Obstructive Pulmonary Disease"], description: "Education, a patient-powered research network, and a community line for people living with COPD." },
    { id: "r14", name: "American Heart Association", site: "heart.org", category: "Nonprofit & Advocacy", url: "https://www.heart.org", conditions: ["Heart Failure", "Hypertension"], description: "Patient education and support for cardiovascular conditions, including heart failure and high blood pressure." },
    { id: "r15", name: "Heart Failure Society of America", site: "hfsa.org", category: "Patient Education", url: "https://hfsa.org", conditions: ["Heart Failure"], description: "Clinician-reviewed patient resources and education focused specifically on heart failure." },
    { id: "r16", name: "American Migraine Foundation", site: "americanmigrainefoundation.org", category: "Nonprofit & Advocacy", url: "https://americanmigrainefoundation.org", conditions: ["Migraine"], description: "Trusted migraine education, a doctor-finder tool, and community resources backed by headache specialists." },
    { id: "r17", name: "National Headache Foundation", site: "headaches.org", category: "Patient Education", url: "https://headaches.org", conditions: ["Migraine"], description: "Education and support resources for people living with migraine and other headache disorders." },
    { id: "r18", name: "National Multiple Sclerosis Society", site: "nationalmssociety.org", category: "Nonprofit & Advocacy", url: "https://www.nationalmssociety.org", conditions: ["Multiple Sclerosis"], description: "Support navigators, education, financial guidance, and research funding for people living with multiple sclerosis." },
    { id: "r19", name: "Multiple Sclerosis Association of America", site: "mymsaa.org", category: "Patient Education", url: "https://mymsaa.org", conditions: ["Multiple Sclerosis"], description: "Free programs and services, including education, equipment, and a helpline for the MS community." },
    { id: "r20", name: "Crohn's & Colitis Foundation", site: "crohnscolitisfoundation.org", category: "Nonprofit & Advocacy", url: "https://www.crohnscolitisfoundation.org", conditions: ["Crohn's Disease"], description: "Education, local chapters, and research funding for inflammatory bowel disease, including Crohn's disease." },
    { id: "r21", name: "American Thyroid Association", site: "thyroid.org", category: "Patient Education", url: "https://www.thyroid.org", conditions: ["Hypothyroidism"], description: "Clinician-reviewed patient education on thyroid conditions, including hypothyroidism." },
    { id: "r22", name: "Graves' Disease & Thyroid Foundation", site: "gdatf.org", category: "Nonprofit & Advocacy", url: "https://www.gdatf.org", conditions: ["Hypothyroidism"], description: "Support, education, and a helpline for people living with thyroid disease." },
    { id: "r23", name: "MedlinePlus", site: "medlineplus.gov", category: "Patient Education", url: "https://medlineplus.gov", conditions: [], description: "Authoritative, plain-language health information on conditions, medications, and tests from the U.S. National Library of Medicine." },
    { id: "r24", name: "CDC — Chronic Disease Resources", site: "cdc.gov", category: "Patient Education", url: "https://www.cdc.gov/chronic-disease", conditions: [], description: "Public-health guidance and self-management resources for major chronic conditions from the CDC." },
    { id: "r25", name: "ClinicalTrials.gov", site: "clinicaltrials.gov", category: "Patient Education", url: "https://clinicaltrials.gov", conditions: [], description: "The U.S. registry of clinical studies — search for trials, review eligibility, and learn what taking part involves." },
    { id: "r26", name: "National Institutes of Health (NIH)", site: "nih.gov", category: "Patient Education", url: "https://www.nih.gov/health-information", conditions: [], description: "Health information and the latest research updates across virtually every medical condition." },
    { id: "r27", name: "National Organization for Rare Disorders", site: "rarediseases.org", category: "Nonprofit & Advocacy", url: "https://rarediseases.org", conditions: [], description: "Rare-disease information, patient-assistance programs, and advocacy spanning thousands of conditions." },
    { id: "r28", name: "Patient Advocate Foundation", site: "patientadvocate.org", category: "Financial Aid", url: "https://www.patientadvocate.org", conditions: [], description: "Case-management and co-pay relief programs that help patients resolve insurance, access, and medical-debt issues." },
    { id: "r29", name: "NeedyMeds", site: "needymeds.org", category: "Financial Aid", url: "https://www.needymeds.org", conditions: [], description: "A free database of patient-assistance programs, drug-discount cards, and cost-saving resources for medications and care." },
    { id: "r30", name: "RxAssist", site: "rxassist.org", category: "Financial Aid", url: "https://www.rxassist.org", conditions: [], description: "A directory of pharmaceutical patient-assistance programs that provide free or low-cost medications." },
    { id: "r31", name: "HealthWell Foundation", site: "healthwellfoundation.org", category: "Financial Aid", url: "https://www.healthwellfoundation.org", conditions: [], description: "Grants that help insured patients afford copays, premiums, and other out-of-pocket treatment costs." },
    { id: "r32", name: "GoodRx", site: "goodrx.com", category: "Financial Aid", url: "https://www.goodrx.com", conditions: [], description: "Compares prescription prices across pharmacies and provides free discount coupons to lower medication costs." },
  ];

  var RESOURCE_CATEGORY_CHIPS = {
    "Nonprofit & Advocacy": "chip-teal",
    "Patient Education": "chip-blue",
    "Financial Aid": "chip-amber",
  };

  var resourceList = document.getElementById("resource-list");
  var resourceMeta = document.getElementById("resource-meta");
  var resourceSearch = document.getElementById("resource-search");
  var resourceCategories = document.getElementById("resource-categories");
  var resourceState = { search: "", category: "all" };

  function resourceCard(r) {
    return (
      '<article class="card result-card">' +
      '<div class="result-top"><div>' +
      '<h3 class="result-name">' +
      escapeHtml(r.name) +
      "</h3>" +
      '<p class="result-sub">' +
      escapeHtml(r.site) +
      "</p></div>" +
      '<span class="chip ' +
      (RESOURCE_CATEGORY_CHIPS[r.category] || "chip") +
      '">' +
      escapeHtml(r.category) +
      "</span></div>" +
      '<p class="result-text">' +
      escapeHtml(r.description) +
      "</p>" +
      '<div class="result-actions">' +
      '<a class="btn btn-primary btn-sm" href="' +
      r.url +
      '" target="_blank" rel="noreferrer">Visit website</a>' +
      "</div></article>"
    );
  }

  function renderResources() {
    var q = resourceState.search.toLowerCase();
    var rows = RESOURCES.filter(function (r) {
      if (resourceState.category !== "all" && r.category !== resourceState.category) return false;
      if (q) {
        var hay = (r.name + " " + r.description + " " + r.category).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });

    if (activeCondition) {
      var cn = activeCondition.name;
      rows.sort(function (a, b) {
        var aM = a.conditions.indexOf(cn) !== -1 ? 0 : 1;
        var bM = b.conditions.indexOf(cn) !== -1 ? 0 : 1;
        return aM - bM;
      });
    }

    resourceMeta.innerHTML =
      "<span>" + rows.length + " resource" + (rows.length === 1 ? "" : "s") + "</span>";

    if (rows.length === 0) {
      resourceList.innerHTML = emptyState(
        "search",
        "No resources match your search",
        "Try a different search term or category.",
      );
      return;
    }
    var html = "";
    for (var i = 0; i < rows.length; i++) html += resourceCard(rows[i]);
    resourceList.innerHTML = html;
  }

  if (resourceList) {
    resourceSearch.addEventListener("input", function () {
      resourceState.search = resourceSearch.value.trim();
      renderResources();
    });
    resourceCategories.addEventListener("click", function (e) {
      var pill = e.target.closest("[data-category]");
      if (!pill) return;
      resourceState.category = pill.getAttribute("data-category");
      resourceCategories.querySelectorAll(".pill-btn").forEach(function (b) {
        b.classList.toggle("on", b === pill);
      });
      renderResources();
    });
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest('[data-action="clear-perso"]')) {
      setActiveCondition(null);
    }
  });

  /* ========================================================
     10. INTERACTIVE MAPS (Leaflet)
     ======================================================== */
  var MAP_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  var MAP_ATTR =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var providerMap = null;
  var providerMarkers = null;
  var pharmacyMap = null;
  var pharmacyMarkers = null;

  function zPin(color) {
    return L.divIcon({
      className: "z-pin",
      html: '<span style="background:' + color + '"></span>',
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10],
    });
  }

  function makeMap(elementId) {
    var el = document.getElementById(elementId);
    if (!el) return null;
    var map = L.map(el, { scrollWheelZoom: false });
    L.tileLayer(MAP_TILES, { attribution: MAP_ATTR, maxZoom: 18 }).addTo(map);
    map.setView([39.8, -95.5], 3);
    return map;
  }

  function fitMap(map, points) {
    if (!map) return;
    if (points.length === 1) {
      map.setView(points[0], 12);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [30, 30], maxZoom: 12 });
    } else {
      map.setView([39.8, -95.5], 3);
    }
  }

  function drawProviderMarkers() {
    if (!providerMap || !providerMarkers) return;
    providerMarkers.clearLayers();
    var points = [];
    for (var i = 0; i < lastProviderRows.length; i++) {
      var p = lastProviderRows[i];
      if (typeof p.lat !== "number") continue;
      L.marker([p.lat, p.lng], { icon: zPin("#0e7c86") })
        .bindPopup("<strong>" + escapeHtml(p.name) + "</strong><br>" + escapeHtml(p.specialty))
        .addTo(providerMarkers);
      points.push([p.lat, p.lng]);
    }
    fitMap(providerMap, points);
  }

  function ensureProviderMap() {
    if (providerMap || typeof L === "undefined") return;
    providerMap = makeMap("provider-map");
    if (providerMap) {
      providerMarkers = L.layerGroup().addTo(providerMap);
      drawProviderMarkers();
    }
  }

  function drawPharmacyMarkers() {
    if (!pharmacyMap || !pharmacyMarkers) return;
    pharmacyMarkers.clearLayers();
    var points = [];
    for (var i = 0; i < lastPharmacyRows.length; i++) {
      var p = lastPharmacyRows[i];
      if (typeof p.lat !== "number") continue;
      var color = p.kind === "infusion" ? "#563b9c" : "#2f6fb0";
      L.marker([p.lat, p.lng], { icon: zPin(color) })
        .bindPopup("<strong>" + escapeHtml(p.name) + "</strong><br>" + escapeHtml(p.chain))
        .addTo(pharmacyMarkers);
      points.push([p.lat, p.lng]);
    }
    fitMap(pharmacyMap, points);
  }

  function ensurePharmacyMap() {
    if (pharmacyMap || typeof L === "undefined") return;
    pharmacyMap = makeMap("pharmacy-map");
    if (pharmacyMap) {
      pharmacyMarkers = L.layerGroup().addTo(pharmacyMap);
      drawPharmacyMarkers();
    }
  }

  /* ========================================================
     11. ACCESSIBILITY
     ======================================================== */
  var TEXT_SIZES = { small: "15px", normal: "16px", large: "18px" };
  var a11y = STORE.get("a11y", { contrast: "normal", textsize: "normal" });

  function applyA11y() {
    document.documentElement.setAttribute(
      "data-contrast",
      a11y.contrast === "high" ? "high" : "normal",
    );
    document.documentElement.setAttribute(
      "data-theme",
      a11y.theme === "dark" ? "dark" : "light",
    );
    document.documentElement.style.fontSize = TEXT_SIZES[a11y.textsize] || "16px";
  }

  /* ========================================================
     12. PREMIUM + MODALS + ACCOUNT
     ======================================================== */
  var premium = STORE.get("premium", false);
  var premiumBtn = document.getElementById("premium-btn");
  var settingsBtn = document.getElementById("settings-btn");
  var settingsModal = document.getElementById("settings-modal");
  var premiumModal = document.getElementById("premium-modal");
  var premiumHeadline = document.getElementById("premium-headline");
  var premiumPrice = document.getElementById("premium-price");
  var premiumAction = document.getElementById("premium-action");
  var contrastToggle = document.getElementById("contrast-toggle");
  var textSizeButtons = document.querySelectorAll("[data-textsize]");
  var settingsPlan = document.getElementById("settings-plan");
  var settingsPlanSub = document.getElementById("settings-plan-sub");
  var settingsPremiumBtn = document.getElementById("settings-premium-btn");
  var settingsSaved = document.getElementById("settings-saved");
  var settingsConditions = document.getElementById("settings-conditions");
  var clearDataBtn = document.getElementById("clear-data-btn");
  var accountName = document.getElementById("account-name");

  function openModal(modal) {
    if (modal) modal.classList.add("open");
  }
  function closeModal(modal) {
    if (modal) modal.classList.remove("open");
  }
  function applyPremium() {
    if (premiumBtn) premiumBtn.classList.toggle("active", premium);
  }

  function refreshPremiumModal() {
    if (!premiumHeadline) return;
    if (premium) {
      premiumHeadline.textContent = "Premium is active";
      premiumPrice.textContent = "Thank you for supporting Zuuno";
      premiumAction.textContent = "Cancel Premium";
      premiumAction.classList.remove("btn-primary");
      premiumAction.classList.add("btn-secondary");
    } else {
      premiumHeadline.textContent = "Unlock the full Zuuno experience";
      premiumPrice.innerHTML = "$6.99 <span>/ month</span>";
      premiumAction.textContent = "Start Premium";
      premiumAction.classList.add("btn-primary");
      premiumAction.classList.remove("btn-secondary");
    }
  }

  function conditionNames(indices) {
    var names = [];
    for (var i = 0; i < indices.length; i++) {
      if (CONDITIONS[indices[i]]) names.push(CONDITIONS[indices[i]].name);
    }
    return names;
  }

  function refreshSettings() {
    if (!contrastToggle) return;
    contrastToggle.textContent = a11y.contrast === "high" ? "On" : "Off";
    contrastToggle.classList.toggle("on", a11y.contrast === "high");
    if (darkmodeToggle) {
      darkmodeToggle.textContent = a11y.theme === "dark" ? "On" : "Off";
      darkmodeToggle.classList.toggle("on", a11y.theme === "dark");
    }
    textSizeButtons.forEach(function (b) {
      b.classList.toggle("on", b.getAttribute("data-textsize") === a11y.textsize);
    });
    settingsPlan.textContent = premium ? "Zuuno Premium" : "Zuuno Free";
    settingsPlanSub.textContent = premium
      ? "All premium features are unlocked"
      : "Upgrade for premium features";
    settingsPremiumBtn.textContent = premium ? "Manage" : "View";
    var pc = countTrue(savedProviders);
    var tc = Object.keys(savedTrials).length;
    settingsSaved.textContent =
      pc + tc === 0
        ? "No saved items yet"
        : pc + " provider" + (pc === 1 ? "" : "s") + " and " + tc + " trial" + (tc === 1 ? "" : "s") + " saved";
    fillSettingsConditions();
    if (accountName) accountName.value = STORE.get("name", "");
  }

  if (settingsBtn) {
    settingsBtn.addEventListener("click", function () {
      refreshSettings();
      openModal(settingsModal);
    });
  }
  if (premiumBtn) {
    premiumBtn.addEventListener("click", function () {
      refreshPremiumModal();
      openModal(premiumModal);
    });
  }
  document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      closeModal(btn.closest(".modal-backdrop"));
    });
  });
  [settingsModal, premiumModal].forEach(function (modal) {
    if (!modal) return;
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal(modal);
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeModal(settingsModal);
      closeModal(premiumModal);
    }
  });
  if (contrastToggle) {
    contrastToggle.addEventListener("click", function () {
      a11y.contrast = a11y.contrast === "high" ? "normal" : "high";
      STORE.set("a11y", a11y);
      applyA11y();
      refreshSettings();
    });
  }
  textSizeButtons.forEach(function (b) {
    b.addEventListener("click", function () {
      a11y.textsize = b.getAttribute("data-textsize");
      STORE.set("a11y", a11y);
      applyA11y();
      refreshSettings();
    });
  });
  if (accountName) {
    accountName.addEventListener("input", function () {
      STORE.set("name", accountName.value.trim());
    });
  }
  if (settingsPremiumBtn) {
    settingsPremiumBtn.addEventListener("click", function () {
      closeModal(settingsModal);
      refreshPremiumModal();
      openModal(premiumModal);
    });
  }
  if (premiumAction) {
    premiumAction.addEventListener("click", function () {
      premium = !premium;
      STORE.set("premium", premium);
      applyPremium();
      refreshPremiumModal();
      refreshSettings();
    });
  }
  if (clearDataBtn) {
    clearDataBtn.addEventListener("click", function () {
      savedProviders = {};
      savedTrials = {};
      STORE.set("savedProviders", savedProviders);
      STORE.set("savedTrials", savedTrials);
      if (providerList) renderProviders();
      if (trialList) renderTrials();
      refreshSettings();
      clearDataBtn.textContent = "Cleared";
      window.setTimeout(function () {
        clearDataBtn.textContent = "Clear";
      }, 1600);
    });
  }

  /* Dark mode toggle */
  var darkmodeToggle = document.getElementById("darkmode-toggle");
  if (darkmodeToggle) {
    darkmodeToggle.addEventListener("click", function () {
      a11y.theme = a11y.theme === "dark" ? "light" : "dark";
      STORE.set("a11y", a11y);
      applyA11y();
      refreshSettings();
    });
  }

  /* v12 — opt-in geolocation. Stored in the user's profile and used
     to compute real distance on provider and pharmacy cards. */
  var userLocation = STORE.get("location", { on: false, lat: null, lng: null });
  var locationToggle = document.getElementById("location-toggle");
  var locationSub = document.getElementById("location-sub");
  function refreshLocationToggle() {
    if (!locationToggle) return;
    var on = !!(userLocation && userLocation.on && userLocation.lat != null);
    locationToggle.textContent = on ? "On" : "Off";
    locationToggle.classList.toggle("on", on);
    if (locationSub) {
      if (on) {
        locationSub.textContent =
          "Using your location · " +
          userLocation.lat.toFixed(2) + ", " + userLocation.lng.toFixed(2);
      } else {
        locationSub.textContent = "Sort providers and pharmacies by real distance from you";
      }
    }
  }
  function setUserLocation(loc) {
    userLocation = loc;
    STORE.set("location", userLocation);
    refreshLocationToggle();
    if (typeof renderProviders === "function") renderProviders();
    if (typeof renderPharmacies === "function") renderPharmacies();
  }
  function requestUserLocation() {
    if (!navigator.geolocation) {
      if (locationSub) locationSub.textContent = "Geolocation is not supported on this device";
      return;
    }
    if (locationSub) locationSub.textContent = "Requesting your location…";
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        setUserLocation({ on: true, lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      function (err) {
        if (locationSub) {
          locationSub.textContent =
            err && err.code === 1
              ? "Permission denied — turn on location in your browser"
              : "Couldn’t get your location — try again";
        }
        userLocation = { on: false, lat: null, lng: null };
        STORE.set("location", userLocation);
        if (locationToggle) {
          locationToggle.textContent = "Off";
          locationToggle.classList.remove("on");
        }
      },
      { enableHighAccuracy: false, maximumAge: 5 * 60 * 1000, timeout: 10000 },
    );
  }
  if (locationToggle) {
    locationToggle.addEventListener("click", function () {
      if (userLocation && userLocation.on) {
        setUserLocation({ on: false, lat: null, lng: null });
      } else {
        requestUserLocation();
      }
    });
  }
  refreshLocationToggle();

  /* Haversine distance in miles between two lat/lng pairs. */
  function haversineMiles(lat1, lng1, lat2, lng2) {
    if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) return null;
    var R = 3958.8;
    var toRad = function (d) { return (d * Math.PI) / 180; };
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
  function distanceMiFor(item) {
    if (userLocation && userLocation.on && userLocation.lat != null && item.lat != null) {
      return haversineMiles(userLocation.lat, userLocation.lng, item.lat, item.lng);
    }
    if (typeof item.distanceMi === "number") return item.distanceMi;
    return null;
  }

  /* Edit-your-conditions picker inside Settings */
  /* v12 — shared, categorized condition-picker renderer.
     selectedIdxFn(i) → bool decides which pills start "on". */
  function renderConditionPicker(container, selectedIdxFn) {
    if (!container) return;
    container.innerHTML = "";
    var grouped = {};
    for (var i = 0; i < CONDITIONS.length; i++) {
      var cat = CONDITION_CATEGORY[CONDITIONS[i].name] || "Other";
      (grouped[cat] = grouped[cat] || []).push(i);
    }
    var order = CATEGORY_ORDER.concat(["Other"]);
    for (var k = 0; k < order.length; k++) {
      var cat2 = order[k];
      if (!grouped[cat2]) continue;
      var group = document.createElement("div");
      group.className = "cond-cat-group";
      var header = document.createElement("p");
      header.className = "cond-cat-label";
      header.textContent = cat2;
      group.appendChild(header);
      var pills = document.createElement("div");
      pills.className = "cond-cat-pills";
      for (var p = 0; p < grouped[cat2].length; p++) {
        var idx = grouped[cat2][p];
        var b = document.createElement("button");
        b.type = "button";
        b.className = "pill-btn" + (selectedIdxFn(idx) ? " on" : "");
        b.setAttribute("data-cond", String(idx));
        b.textContent = CONDITIONS[idx].name;
        pills.appendChild(b);
      }
      group.appendChild(pills);
      container.appendChild(group);
    }
  }
  function attachPickerSearch(input, container) {
    if (!input || !container) return;
    input.addEventListener("input", function () {
      var q = String(input.value || "").toLowerCase().trim();
      var groups = container.querySelectorAll(".cond-cat-group");
      for (var i = 0; i < groups.length; i++) {
        var group = groups[i];
        var pills = group.querySelectorAll(".pill-btn");
        var anyShown = false;
        for (var j = 0; j < pills.length; j++) {
          var name = pills[j].textContent.toLowerCase();
          var hit = q === "" || name.indexOf(q) !== -1;
          pills[j].style.display = hit ? "" : "none";
          if (hit) anyShown = true;
        }
        group.style.display = anyShown ? "" : "none";
      }
    });
  }

  var settingsConditionsPick = document.getElementById("settings-conditions-pick");
  var settingsConditionsSearch = document.getElementById("settings-conditions-search");
  function fillSettingsConditions() {
    renderConditionPicker(settingsConditionsPick, function (i) {
      return profileConditions.indexOf(i) !== -1;
    });
  }
  if (settingsConditionsPick) {
    attachPickerSearch(settingsConditionsSearch, settingsConditionsPick);
    settingsConditionsPick.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cond]");
      if (!b) return;
      var idx = Number(b.getAttribute("data-cond"));
      var pos = profileConditions.indexOf(idx);
      if (pos === -1) profileConditions.push(idx);
      else profileConditions.splice(pos, 1);
      STORE.set("profileConditions", profileConditions);
      b.classList.toggle("on");
      var activeIdx = activeCondition ? CONDITIONS.indexOf(activeCondition) : -1;
      if (activeIdx === -1 || profileConditions.indexOf(activeIdx) === -1) {
        setActiveCondition(profileConditions.length ? CONDITIONS[profileConditions[0]] : null);
      }
    });
  }

  /* Logout — clears account data and returns to onboarding */
  var logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      if (logoutBtn.getAttribute("data-confirming") !== "yes") {
        logoutBtn.setAttribute("data-confirming", "yes");
        logoutBtn.textContent = "Tap again to confirm";
        window.setTimeout(function () {
          if (logoutBtn && logoutBtn.getAttribute("data-confirming") === "yes") {
            logoutBtn.removeAttribute("data-confirming");
            logoutBtn.textContent = "Log out";
          }
        }, 3000);
        return;
      }
      try {
        var keys = [];
        for (var i = 0; i < localStorage.length; i++) {
          var k = localStorage.key(i);
          if (k && k.indexOf("zuuno_") === 0 && k !== "zuuno_a11y") keys.push(k);
        }
        keys.forEach(function (kk) {
          localStorage.removeItem(kk);
        });
      } catch (e) {
        /* storage unavailable — non-fatal */
      }
      window.location.reload();
    });
  }

  /* ========================================================
     13. ONBOARDING (first visit)
     ======================================================== */
  var onboarding = document.getElementById("onboarding");
  var onboardStep1 = document.getElementById("onboard-step-1");
  var onboardStep2 = document.getElementById("onboard-step-2");
  var onboardStep3 = document.getElementById("onboard-step-3");
  var onboardNext = document.getElementById("onboard-next");
  var onboardNext2 = document.getElementById("onboard-next-2");
  var onboardBack1 = document.getElementById("onboard-back-1");
  var onboardBack2 = document.getElementById("onboard-back-2");
  var onboardFinish = document.getElementById("onboard-finish");
  var consentCheckbox = document.getElementById("consent-checkbox");
  var onboardName = document.getElementById("onboard-name");
  var onboardConditions = document.getElementById("onboard-conditions");

  function showOnboardStep(n) {
    if (onboardStep1) onboardStep1.hidden = n !== 1;
    if (onboardStep2) onboardStep2.hidden = n !== 2;
    if (onboardStep3) onboardStep3.hidden = n !== 3;
  }

  var onboardConditionsSearch = document.getElementById("onboard-conditions-search");
  if (onboarding && onboardConditions) {
    renderConditionPicker(onboardConditions, function () { return false; });
    attachPickerSearch(onboardConditionsSearch, onboardConditions);
    onboardConditions.addEventListener("click", function (e) {
      var b = e.target.closest("[data-cond]");
      if (b) b.classList.toggle("on");
    });

    onboardNext.addEventListener("click", function () {
      showOnboardStep(2);
    });
    onboardNext2.addEventListener("click", function () {
      showOnboardStep(3);
    });
    onboardBack1.addEventListener("click", function () {
      showOnboardStep(1);
    });
    onboardBack2.addEventListener("click", function () {
      showOnboardStep(2);
    });
    consentCheckbox.addEventListener("change", function () {
      var err = document.getElementById("consent-error");
      if (consentCheckbox.checked && err) err.style.display = "none";
    });
    onboardFinish.addEventListener("click", function () {
      if (!consentCheckbox.checked) {
        var err = document.getElementById("consent-error");
        if (err) err.style.display = "block";
        consentCheckbox.focus();
        return;
      }
      var name = onboardName ? onboardName.value.trim() : "";
      if (name) STORE.set("name", name);
      var selected = [];
      onboardConditions.querySelectorAll(".pill-btn.on").forEach(function (b) {
        selected.push(Number(b.getAttribute("data-cond")));
      });
      profileConditions = selected;
      STORE.set("profileConditions", profileConditions);
      STORE.set("onboarded", true);
      onboarding.classList.remove("show");
      onboarding.setAttribute("aria-hidden", "true");
      if (selected.length) {
        setActiveCondition(CONDITIONS[selected[0]]);
      }
    });
  }

  /* ========================================================
     14. INITIAL RENDER
     ======================================================== */
  (function restoreActiveCondition() {
    var idx = STORE.get("activeCondition", -1);
    if (typeof idx === "number" && idx >= 0 && CONDITIONS[idx]) {
      activeCondition = CONDITIONS[idx];
    } else if (profileConditions.length && CONDITIONS[profileConditions[0]]) {
      activeCondition = CONDITIONS[profileConditions[0]];
    }
    if (activeCondition && conditionSelect) {
      conditionSelect.value = String(CONDITIONS.indexOf(activeCondition));
    }
  })();

  applyA11y();
  applyPremium();
  renderPersoBanners();
  if (providerList) renderProviders();
  if (pharmacyList) renderPharmacies();
  if (trialList) renderTrials();
  if (resourceList) renderResources();

  showScreen("screen-chatbot");

  if (onboarding && STORE.get("onboarded", false) !== true) {
    onboarding.classList.add("show");
    onboarding.setAttribute("aria-hidden", "false");
  }
})();
