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
    if (hasAny(q, ["symptom", "sign", "warning", "feel like", "presentation", "early signs"])) {
      return "symptoms";
    }
    if (
      hasAny(q, [
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
      hasAny(q, [
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
      "</p></div>" +
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
        bulletList(condition.citations),
        !intent,
      ) +
      "</div>" +
      '<div class="answer-actions">' +
      '<button class="btn btn-secondary btn-sm" type="button" data-action="pdf" data-cond="' +
      idx +
      '">' +
      icon("download") +
      " Download PDF</button>" +
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

  function noMatchCard() {
    return plainCard("Not enough information", [
      "I don&#39;t have enough evidence to answer that. Please consult a healthcare professional.",
      "Try naming a condition Zuuno covers — for example: lupus, asthma, type 2 diabetes, migraine, or COPD. Zuuno currently covers " +
        CONDITIONS.length +
        " conditions.",
    ]);
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
    if (isUnsafeQuery(text)) return guardrailCard(text);
    if (isGreeting(text)) return greetingCard();
    if (isThanks(text))
      return plainCard("You&#39;re welcome", [
        "Glad to help. Ask me anything else about a condition you have.",
      ]);
    if (isHelp(text)) return helpCard();

    var intent = detectIntent(text);
    var match = findCondition(text);
    if (!match && activeCondition) {
      match = { condition: activeCondition, score: 0.95 };
    }
    if (match) {
      setActiveCondition(match.condition);
      return answerCard(match.condition, match.score, intent);
    }
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
      chatStream.insertAdjacentHTML("beforeend", respondTo(text));
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
      "<h3>Citations</h3>" +
      ul(c.citations) +
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

  function shareCondition(condition, btn) {
    var text =
      "Zuuno — " +
      condition.name +
      "\n\n" +
      condition.summary +
      "\n\nEducational reference only; not medical advice.";
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

  if (chatStream && chatInput && chatSend) {
    chatSend.addEventListener("click", handleSend);
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
    chatStream.addEventListener("click", function (e) {
      var actionBtn = e.target.closest("[data-action]");
      if (actionBtn) {
        var act = actionBtn.getAttribute("data-action");
        var cond = CONDITIONS[Number(actionBtn.getAttribute("data-cond"))];
        if (act === "pdf" && cond) downloadPdf(cond);
        else if (act === "share" && cond) shareCondition(cond, actionBtn);
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
      '<span class="chip chip-teal">' +
      p.distanceMi.toFixed(1) +
      " mi</span>" +
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
      if (p.distanceMi > providerState.radius) return false;
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
      return a.distanceMi - b.distanceMi;
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
      (p.distanceMi != null
        ? '<span class="chip chip-teal">' + p.distanceMi.toFixed(1) + " mi</span>"
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
    for (var i = 0; i < locs.length && i < 4; i++) {
      var part = [locs[i].city, locs[i].state].filter(Boolean).join(", ");
      if (part) siteParts.push(part);
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
    return matched.length ? matched : FALLBACK_TRIALS;
  }

  var trialList = document.getElementById("trial-list");
  var trialMeta = document.getElementById("trial-meta");
  var trialSearch = document.getElementById("trial-search");
  var trialSearchBtn = document.getElementById("trial-search-btn");
  var trialPhase = document.getElementById("trial-phase");
  var trialStatus = document.getElementById("trial-status");
  var trialFilters = document.getElementById("trial-filters");
  var trialViewSearch = document.getElementById("trial-view-search");
  var trialViewWatching = document.getElementById("trial-view-watching");

  var trialState = {
    query: "",
    phase: "all",
    status: "all",
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
        renderTrials();
      })
      .catch(function () {
        trialState.loading = false;
        trialResults = fallbackTrialsFor(query);
        trialState.source = "curated";
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
    if (settingsConditions) {
      var names = conditionNames(profileConditions);
      settingsConditions.textContent = names.length ? names.join(", ") : "None selected";
    }
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

  if (onboarding && onboardConditions) {
    for (var oc = 0; oc < CONDITIONS.length; oc++) {
      var cbtn = document.createElement("button");
      cbtn.type = "button";
      cbtn.className = "pill-btn";
      cbtn.setAttribute("data-cond", String(oc));
      cbtn.textContent = CONDITIONS[oc].name;
      onboardConditions.appendChild(cbtn);
    }
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
      onboardFinish.disabled = !consentCheckbox.checked;
    });
    onboardFinish.addEventListener("click", function () {
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
