/* ============================================================
   ZUUNO — script.js

   Milestone 2: The Moving Engine.
   Working features:
     - Bottom tab-bar navigation        (versions 2-3)
     - Chatbot: type a question and get a cited, structured answer
       from a built-in knowledge base   (version 4)

   RESERVED HTML IDs — do not rename these:
     tabs:    tab-chatbot, tab-providers, tab-pharmacy, tab-trials,
              tab-resources
     screens: screen-chatbot, screen-providers, screen-pharmacy,
              screen-trials, screen-resources
     chat:    chat-stream, chat-input, chat-send, condition-select

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

  /* Show one screen, hide the rest, and highlight the matching tab. */
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
     2. CONDITION KNOWLEDGE BASE
     Curated, clinician-grade reference information.
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
     3. CHATBOT
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

  /* Escape user-typed text before placing it in the page. */
  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* Lower-case and strip punctuation for matching. */
  function normalize(str) {
    return String(str)
      .toLowerCase()
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /* Match a typed question to a condition. Returns { condition, score }. */
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

  /* Build a bulleted list. Content comes from the trusted knowledge base. */
  function bulletList(items) {
    var html = '<ul class="bullets">';
    for (var i = 0; i < items.length; i++) {
      html += "<li>" + items[i] + "</li>";
    }
    return html + "</ul>";
  }

  /* Build one collapsible answer section (rendered open). */
  function section(iconKey, title, bodyHtml) {
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

  /* Build a full structured answer card for a matched condition. */
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
      section("symptoms", "Symptoms &amp; Signs", bulletList(condition.symptoms)) +
      section("medications", "Medications", medsBody) +
      section(
        "prognosis",
        "Prognosis",
        '<p class="answer-summary" style="margin-top:0">' + condition.prognosis + "</p>",
      ) +
      section(
        "citations",
        "Citations (" + condition.citations.length + ")",
        bulletList(condition.citations),
      ) +
      "</div></article>"
    );
  }

  /* Build the response shown when no condition is recognized. */
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

  /* Handle a sent message: show the question, then show the answer. */
  function handleSend() {
    var text = chatInput.value.trim();
    if (!text) return;

    chatStream.insertAdjacentHTML(
      "beforeend",
      '<div class="msg-user">' + escapeHtml(text) + "</div>",
    );
    var userMessage = chatStream.lastElementChild;

    var match = findCondition(text);
    chatStream.insertAdjacentHTML(
      "beforeend",
      match ? answerCard(match.condition, match.score) : noMatchCard(),
    );

    chatInput.value = "";
    chatInput.focus();
    userMessage.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  if (chatStream && chatInput && chatSend) {
    chatSend.addEventListener("click", handleSend);
    chatInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    });
  }
})();
