/* ============================================================
   ZUUNO — script.js

   Milestone 2: The Moving Engine.
   Working features:
     - Bottom tab-bar navigation                        (v2-v3)
     - Chatbot: cited answers, sections, chips,
       condition context, safety guardrail              (v4-v5)
     - Providers, Pharmacy, Trials and Resources tabs:
       data-driven lists with search and filters        (v6)

   RESERVED HTML IDs — do not rename these. The JavaScript attaches
   event listeners and writes content to them.

   The medical content below is educational reference information only.
   It is not medical advice and does not diagnose or prescribe.
   ============================================================ */

(function () {
  "use strict";

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
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = tab.getAttribute("data-target");
      if (target) {
        showScreen(target);
      }
    });
  });

  showScreen("screen-chatbot");

  /* ========================================================
     2. SHARED HELPERS
     ======================================================== */
  /* Escape user-typed text before placing it in the page. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Phone number -> tel: link. */
  function telHref(phone) {
    return "tel:" + String(phone).replace(/[^0-9+]/g, "");
  }

  /* Address -> an OpenStreetMap search link for directions. */
  function mapsHref(address) {
    return "https://www.openstreetmap.org/search?query=" + encodeURIComponent(address);
  }

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
  };

  /* Small inline icon (16px) used inside cards. */
  function icon(name) {
    return (
      '<svg viewBox="0 0 24 24" class="ic-sm" aria-hidden="true">' +
      (ICON_PATHS[name] || "") +
      "</svg>"
    );
  }

  /* Friendly "nothing found" block. */
  function emptyState(iconName, title, message) {
    return (
      '<div class="empty-state">' +
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      (ICON_PATHS[iconName] || "") +
      "</svg>" +
      "<h3>" +
      escapeHtml(title) +
      "</h3><p>" +
      escapeHtml(message) +
      "</p></div>"
    );
  }

  /* Fill a <select> with options built from a list of values. */
  function fillSelect(selectEl, values) {
    for (var i = 0; i < values.length; i++) {
      var option = document.createElement("option");
      option.value = values[i];
      option.textContent = values[i];
      selectEl.appendChild(option);
    }
  }

  /* Unique, sorted values of one field across a list of objects. */
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
     4. CHATBOT
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
  var selectedCondition = null;

  function normalize(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
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
    var q = normalize(query);
    for (var i = 0; i < UNSAFE_PHRASES.length; i++) {
      if (q.indexOf(UNSAFE_PHRASES[i]) !== -1) return true;
    }
    return false;
  }

  function bulletList(items) {
    var html = '<ul class="bullets">';
    for (var i = 0; i < items.length; i++) {
      html += "<li>" + items[i] + "</li>";
    }
    return html + "</ul>";
  }

  function chatSection(iconKey, title, bodyHtml) {
    return (
      '<div class="acc acc-open">' +
      '<button class="acc-head" type="button" aria-expanded="true">' +
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

  function answerCard(condition, score) {
    var pct = Math.round(score * 100);
    var medsBody =
      '<span class="med-label first">First-line</span>' +
      bulletList(condition.medsFirst) +
      '<span class="med-label second">Second-line</span>' +
      bulletList(condition.medsSecond);

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
      '<p class="answer-summary">' +
      condition.summary +
      "</p></div>" +
      '<div class="answer-sections">' +
      chatSection("symptoms", "Symptoms &amp; Signs", bulletList(condition.symptoms)) +
      chatSection("medications", "Medications", medsBody) +
      chatSection(
        "prognosis",
        "Prognosis",
        '<p class="answer-summary" style="margin-top:0">' + condition.prognosis + "</p>",
      ) +
      chatSection(
        "citations",
        "Citations (" + condition.citations.length + ")",
        bulletList(condition.citations),
      ) +
      "</div></article>"
    );
  }

  function noMatchCard() {
    return (
      '<article class="answer-card">' +
      '<div class="answer-head" style="border-bottom:none">' +
      '<div class="answer-title-row"><h2>Not enough information</h2></div>' +
      '<p class="answer-summary">I don&#39;t have enough evidence to answer that. ' +
      "Please consult a healthcare professional.</p>" +
      '<p class="answer-summary">Try naming a condition Zuuno covers — for example: ' +
      "lupus, asthma, type 2 diabetes, migraine, or COPD. Zuuno currently covers " +
      CONDITIONS.length +
      " conditions.</p></div></article>"
    );
  }

  function guardrailCard(query) {
    var match = findCondition(query);
    var hint = match
      ? "To learn about " +
        match.condition.name +
        ', ask an educational question such as "symptoms of ' +
        match.condition.name +
        '".'
      : "Zuuno explains conditions you have already been diagnosed with — try naming one.";
    return (
      '<article class="answer-card">' +
      '<div class="answer-head" style="border-bottom:none">' +
      '<div class="answer-title-row"><h2>A clinician is needed for this</h2></div>' +
      '<p class="answer-summary">Zuuno provides general education about medical conditions. ' +
      "It cannot diagnose conditions or recommend personal treatment or doses. Please see a " +
      "licensed healthcare professional for a diagnosis or prescription.</p>" +
      '<p class="answer-summary">' +
      hint +
      "</p></div></article>"
    );
  }

  function respondTo(text) {
    if (isUnsafeQuery(text)) {
      return guardrailCard(text);
    }
    var match = findCondition(text);
    if (!match && selectedCondition) {
      match = { condition: selectedCondition, score: 0.95 };
    }
    return match ? answerCard(match.condition, match.score) : noMatchCard();
  }

  function sendMessage(text) {
    text = String(text).trim();
    if (!text) return;
    chatStream.insertAdjacentHTML(
      "beforeend",
      '<div class="msg-user">' + escapeHtml(text) + "</div>",
    );
    var userMessage = chatStream.lastElementChild;
    chatStream.insertAdjacentHTML("beforeend", respondTo(text));
    userMessage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleSend() {
    var text = chatInput.value.trim();
    if (!text) return;
    sendMessage(text);
    chatInput.value = "";
    chatInput.focus();
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
      selectedCondition = value === "" ? null : CONDITIONS[Number(value)];
    });
  }

  /* ========================================================
     5. PROVIDERS TAB
     ======================================================== */
  var PROVIDERS = [
    { id: "p1", name: "Dr. Elena Marquez, MD", specialty: "Rheumatology", city: "New York, NY", distanceMi: 2.4, telehealth: true, acceptingNew: true, address: "425 Madison Ave, New York, NY 10017", phone: "(212) 555-0143" },
    { id: "p2", name: "Dr. David Chen, MD", specialty: "Endocrinology", city: "New York, NY", distanceMi: 9.6, telehealth: true, acceptingNew: true, address: "52 E 72nd St, New York, NY 10021", phone: "(212) 555-0188" },
    { id: "p3", name: "Dr. Aisha Bello, MD", specialty: "Neurology", city: "New York, NY", distanceMi: 18.3, telehealth: false, acceptingNew: false, address: "1176 5th Ave, New York, NY 10029", phone: "(212) 555-0207" },
    { id: "p4", name: "Dr. Margaret O'Sullivan, MD", specialty: "Rheumatology", city: "Boston, MA", distanceMi: 1.9, telehealth: true, acceptingNew: true, address: "75 Francis St, Boston, MA 02115", phone: "(617) 555-0112" },
    { id: "p5", name: "Dr. James Whitfield, MD", specialty: "Neurology", city: "Boston, MA", distanceMi: 12.7, telehealth: true, acceptingNew: true, address: "55 Fruit St, Boston, MA 02114", phone: "(617) 555-0148" },
    { id: "p6", name: "Dr. Sofia Russo, DO", specialty: "Pulmonology", city: "Boston, MA", distanceMi: 31.5, telehealth: false, acceptingNew: true, address: "330 Brookline Ave, Boston, MA 02215", phone: "(617) 555-0173" },
    { id: "p7", name: "Dr. William Carter, MD", specialty: "Cardiology", city: "Chicago, IL", distanceMi: 3.1, telehealth: true, acceptingNew: true, address: "251 E Huron St, Chicago, IL 60611", phone: "(312) 555-0121" },
    { id: "p8", name: "Dr. Grace Park, MD", specialty: "Gastroenterology", city: "Chicago, IL", distanceMi: 22.0, telehealth: false, acceptingNew: true, address: "1725 W Harrison St, Chicago, IL 60612", phone: "(312) 555-0179" },
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
  var savedProviders = {};

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
      (p.telehealth ? '<span class="chip chip-blue">Telehealth</span>' : "") +
      '<span class="chip ' +
      (p.acceptingNew ? "chip-green" : "") +
      '">' +
      (p.acceptingNew ? "Accepting patients" : "Waitlist only") +
      "</span></div>" +
      '<div class="result-rows">' +
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
    rows.sort(function (a, b) {
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
      return;
    }
    var html = "";
    for (var i = 0; i < rows.length; i++) html += providerCard(rows[i]);
    providerList.innerHTML = html;
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
      renderProviders();
    });
  }

  /* ========================================================
     6. PHARMACY TAB
     ======================================================== */
  var PHARMACIES = [
    { id: "rx1", name: "Midtown Community Pharmacy", chain: "CVS Pharmacy", kind: "retail", distanceMi: 1.1, hours: "Mon–Fri 8 AM–10 PM, Sat–Sun 9 AM–7 PM", phone: "(212) 555-0301", address: "630 Lexington Ave, New York, NY 10022", info: "Prescriptions, immunizations, drive-thru, home delivery" },
    { id: "rx2", name: "Manhattan Specialty Pharmacy", chain: "Independent", kind: "specialty", distanceMi: 2.6, hours: "Mon–Fri 9 AM–6 PM", phone: "(212) 555-0322", address: "139 E 57th St, New York, NY 10022", info: "Specialty and biologic medications, prior-authorization support" },
    { id: "rx3", name: "East River Infusion Center", chain: "Independent", kind: "infusion", distanceMi: 3.0, hours: "Mon–Sat 7 AM–7 PM", phone: "(212) 555-0344", address: "530 1st Ave, New York, NY 10016", info: "Infusion specialties: Rheumatology, Neurology, Immunology" },
    { id: "rx4", name: "Longwood Pharmacy", chain: "Walgreens", kind: "retail", distanceMi: 0.8, hours: "Open 24 hours", phone: "(617) 555-0302", address: "350 Longwood Ave, Boston, MA 02115", info: "Prescriptions, immunizations, 24-hour service" },
    { id: "rx5", name: "Back Bay Specialty Pharmacy", chain: "Independent", kind: "specialty", distanceMi: 2.2, hours: "Mon–Fri 8:30 AM–6 PM", phone: "(617) 555-0323", address: "800 Boylston St, Boston, MA 02199", info: "Specialty medications, home delivery" },
    { id: "rx6", name: "Streeterville Pharmacy", chain: "Walgreens", kind: "retail", distanceMi: 1.5, hours: "Mon–Sun 7 AM–11 PM", phone: "(312) 555-0303", address: "300 E Ohio St, Chicago, IL 60611", info: "Prescriptions, immunizations, drive-thru" },
    { id: "rx7", name: "Express Scripts Mail Pharmacy", chain: "Express Scripts", kind: "online", distanceMi: null, hours: "Phone support 24/7", phone: "(800) 555-0911", address: "Nationwide mail-order service", info: "Mail-order prescriptions, 90-day supplies, automatic refills" },
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
      pharmacyList.innerHTML = emptyState(
        "pill",
        "No pharmacies found",
        "Try a different pharmacy type.",
      );
      return;
    }
    var html = "";
    for (var i = 0; i < rows.length; i++) html += pharmacyCard(rows[i]);
    pharmacyList.innerHTML = html;
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
      var pills = pharmacyKinds.querySelectorAll(".pill-btn");
      pills.forEach(function (b) {
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
     7. CLINICAL TRIALS TAB
     ======================================================== */
  var TRIALS = [
    { id: "NCT05000001", title: "Investigational Biologic for Moderate-to-Severe Lupus", sponsor: "Academic Rheumatology Research Network", phase: "Phase 3", status: "Recruiting", condition: "lupus", interventions: "Investigational biologic · Placebo · Standard of care", sites: "New York, NY · Chicago, IL", eligibility: "Adults aged 18–75 with a confirmed lupus diagnosis and active disease despite standard therapy." },
    { id: "NCT05000002", title: "Treat-to-Target Strategy Trial in Early Rheumatoid Arthritis", sponsor: "National Rheumatology Consortium", phase: "Phase 4", status: "Recruiting", condition: "rheumatoid arthritis", interventions: "Methotrexate-based strategy · Early biologic strategy", sites: "Boston, MA · Chicago, IL", eligibility: "Adults with rheumatoid arthritis diagnosed within the past 12 months who have not yet taken a DMARD." },
    { id: "NCT05000003", title: "Continuous Glucose Monitoring in Type 2 Diabetes", sponsor: "Endocrine Health Research Group", phase: "N/A", status: "Recruiting", condition: "type 2 diabetes", interventions: "Continuous glucose monitor · Usual care", sites: "New York, NY · Boston, MA", eligibility: "Adults with type 2 diabetes and an A1c above target on stable therapy." },
    { id: "NCT05000004", title: "Early High-Efficacy Therapy in Relapsing Multiple Sclerosis", sponsor: "Neuroimmunology Trials Network", phase: "Phase 3", status: "Recruiting", condition: "multiple sclerosis", interventions: "High-efficacy disease-modifying therapy · Escalation therapy", sites: "Boston, MA · Chicago, IL", eligibility: "Adults aged 18–55 with relapsing-remitting multiple sclerosis diagnosed within two years." },
    { id: "NCT05000005", title: "Maintenance Biologic Comparison in Crohn's Disease", sponsor: "Gastrointestinal Research Alliance", phase: "Phase 3", status: "Active, not recruiting", condition: "crohn's disease", interventions: "Anti-IL-23 biologic · Anti-TNF biologic", sites: "Chicago, IL", eligibility: "Adults with moderate-to-severe Crohn's disease who responded to induction therapy." },
    { id: "NCT05000006", title: "Biologic Therapy for Severe Eosinophilic Asthma", sponsor: "Respiratory Clinical Research Group", phase: "Phase 3", status: "Recruiting", condition: "asthma", interventions: "Investigational biologic · Placebo", sites: "New York, NY · Boston, MA", eligibility: "Patients aged 12 and older with severe asthma and elevated blood eosinophils." },
    { id: "NCT05000007", title: "SGLT2 Inhibitor Outcomes in Heart Failure", sponsor: "Cardiovascular Outcomes Institute", phase: "Phase 3", status: "Not yet recruiting", condition: "heart failure", interventions: "SGLT2 inhibitor · Placebo", sites: "New York, NY · Chicago, IL", eligibility: "Adults aged 40 and older with chronic heart failure and recent worsening symptoms." },
    { id: "NCT05000008", title: "CGRP-Targeted Preventive Therapy for Chronic Migraine", sponsor: "Headache Clinical Research Network", phase: "Phase 3", status: "Recruiting", condition: "migraine", interventions: "CGRP-targeted therapy · Placebo", sites: "Boston, MA", eligibility: "Adults aged 18–65 with chronic migraine and 15 or more headache days per month." },
  ];

  var trialList = document.getElementById("trial-list");
  var trialMeta = document.getElementById("trial-meta");
  var trialSearch = document.getElementById("trial-search");
  var trialSearchBtn = document.getElementById("trial-search-btn");
  var trialPhase = document.getElementById("trial-phase");
  var trialStatus = document.getElementById("trial-status");
  var trialFilters = document.getElementById("trial-filters");
  var trialViewSearch = document.getElementById("trial-view-search");
  var trialViewWatching = document.getElementById("trial-view-watching");

  var trialState = { search: "", phase: "all", status: "all", view: "search" };
  var savedTrials = {};
  var expandedTrials = {};

  function trialStatusChip(status) {
    if (status === "Recruiting") return "chip-green";
    if (status === "Completed") return "chip";
    return "chip-amber";
  }

  function trialCard(t) {
    var saved = savedTrials[t.id] === true;
    var expanded = expandedTrials[t.id] === true;
    var siteCount = t.sites.split(" · ").length;

    var html =
      '<article class="card result-card">' +
      '<div class="result-top"><div>' +
      '<h3 class="result-name">' +
      escapeHtml(t.title) +
      "</h3>" +
      '<p class="result-sub">' +
      t.id +
      " · " +
      escapeHtml(t.sponsor) +
      "</p></div></div>" +
      '<div class="chip-row">' +
      '<span class="chip chip-teal">' +
      t.phase +
      "</span>" +
      '<span class="chip ' +
      trialStatusChip(t.status) +
      '">' +
      t.status +
      "</span>" +
      '<span class="chip">' +
      siteCount +
      (siteCount === 1 ? " site" : " sites") +
      "</span></div>";

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
      t.id +
      '">' +
      (expanded ? "Less detail" : "More detail") +
      "</button>" +
      '<button class="btn ' +
      (saved ? "btn-secondary" : "btn-primary") +
      ' btn-sm" type="button" data-action="save-trial" data-id="' +
      t.id +
      '">' +
      (saved ? "✓ Watching" : "Save &amp; watch") +
      "</button>" +
      '<a class="btn btn-secondary btn-sm" href="https://clinicaltrials.gov/search?cond=' +
      encodeURIComponent(t.condition) +
      '" target="_blank" rel="noreferrer">ClinicalTrials.gov</a>' +
      "</div></article>";
    return html;
  }

  function renderTrials() {
    var savedCount = Object.keys(savedTrials).filter(function (k) {
      return savedTrials[k] === true;
    }).length;
    trialViewWatching.textContent = "Watching (" + savedCount + ")";
    trialViewSearch.classList.toggle("on", trialState.view === "search");
    trialViewWatching.classList.toggle("on", trialState.view === "watching");
    trialFilters.style.display = trialState.view === "watching" ? "none" : "";

    var rows;
    if (trialState.view === "watching") {
      rows = TRIALS.filter(function (t) {
        return savedTrials[t.id] === true;
      });
    } else {
      var q = trialState.search.toLowerCase();
      rows = TRIALS.filter(function (t) {
        if (trialState.phase !== "all" && t.phase !== trialState.phase) return false;
        if (trialState.status !== "all" && t.status !== trialState.status) return false;
        if (q) {
          var hay = (t.title + " " + t.condition + " " + t.sponsor).toLowerCase();
          if (hay.indexOf(q) === -1) return false;
        }
        return true;
      });
    }

    trialMeta.innerHTML =
      "<span>" +
      rows.length +
      " trial" +
      (rows.length === 1 ? "" : "s") +
      (trialState.view === "watching" ? " watched" : "") +
      "</span>";

    if (rows.length === 0) {
      trialList.innerHTML =
        trialState.view === "watching"
          ? emptyState(
              "star",
              "No watched trials yet",
              "Tap “Save & watch” on a trial to keep track of it here.",
            )
          : emptyState(
              "flask",
              "No active trials match your search",
              "Try broadening your search or clearing the phase and status filters.",
            );
      return;
    }
    var html = "";
    for (var i = 0; i < rows.length; i++) html += trialCard(rows[i]);
    trialList.innerHTML = html;
  }

  if (trialList) {
    fillSelect(trialPhase, uniqueField(TRIALS, "phase"));
    fillSelect(trialStatus, uniqueField(TRIALS, "status"));

    trialSearch.addEventListener("input", function () {
      trialState.search = trialSearch.value.trim();
      trialState.view = "search";
      renderTrials();
    });
    trialSearchBtn.addEventListener("click", function () {
      trialState.search = trialSearch.value.trim();
      trialState.view = "search";
      renderTrials();
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
        savedTrials[id] = !savedTrials[id];
      } else if (action === "toggle-detail") {
        expandedTrials[id] = !expandedTrials[id];
      }
      renderTrials();
    });
  }

  /* ========================================================
     8. RESEARCH & NONPROFITS TAB
     ======================================================== */
  var RESOURCES = [
    { id: "res1", name: "Lupus Foundation of America", site: "lupus.org", category: "Nonprofit & Advocacy", url: "https://www.lupus.org", description: "National advocacy and research organization offering education, support programs, and a health-information helpline for people affected by lupus." },
    { id: "res2", name: "Arthritis Foundation", site: "arthritis.org", category: "Nonprofit & Advocacy", url: "https://www.arthritis.org", description: "Resources, advocacy, and community programs for all forms of arthritis, including rheumatoid and psoriatic arthritis." },
    { id: "res3", name: "American Diabetes Association", site: "diabetes.org", category: "Nonprofit & Advocacy", url: "https://www.diabetes.org", description: "Education, advocacy, and day-to-day management guidance for people living with type 1 and type 2 diabetes." },
    { id: "res4", name: "National Multiple Sclerosis Society", site: "nationalmssociety.org", category: "Nonprofit & Advocacy", url: "https://www.nationalmssociety.org", description: "Support navigators, education, and research funding for people living with multiple sclerosis." },
    { id: "res5", name: "American Heart Association", site: "heart.org", category: "Nonprofit & Advocacy", url: "https://www.heart.org", description: "Patient education and support for cardiovascular conditions, including heart failure and high blood pressure." },
    { id: "res6", name: "MedlinePlus", site: "medlineplus.gov", category: "Patient Education", url: "https://medlineplus.gov", description: "Authoritative, plain-language health information on conditions, medications, and tests from the U.S. National Library of Medicine." },
    { id: "res7", name: "CDC — Chronic Disease Resources", site: "cdc.gov", category: "Patient Education", url: "https://www.cdc.gov/chronic-disease", description: "Public-health guidance and self-management resources for major chronic conditions from the Centers for Disease Control and Prevention." },
    { id: "res8", name: "ClinicalTrials.gov", site: "clinicaltrials.gov", category: "Patient Education", url: "https://clinicaltrials.gov", description: "The U.S. registry of clinical studies — search for trials, review eligibility, and learn what taking part involves." },
    { id: "res9", name: "Patient Advocate Foundation", site: "patientadvocate.org", category: "Financial Aid", url: "https://www.patientadvocate.org", description: "Case-management and co-pay relief programs that help patients resolve insurance, access, and medical-debt issues." },
    { id: "res10", name: "NeedyMeds", site: "needymeds.org", category: "Financial Aid", url: "https://www.needymeds.org", description: "A free database of patient-assistance programs, drug-discount cards, and cost-saving resources for medications and care." },
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
      var pills = resourceCategories.querySelectorAll(".pill-btn");
      pills.forEach(function (b) {
        b.classList.toggle("on", b === pill);
      });
      renderResources();
    });
  }

  /* ========================================================
     9. INITIAL RENDER
     ======================================================== */
  if (providerList) renderProviders();
  if (pharmacyList) renderPharmacies();
  if (trialList) renderTrials();
  if (resourceList) renderResources();
})();
