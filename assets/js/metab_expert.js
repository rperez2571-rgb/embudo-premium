(function () {
  window.__metabExpertFinal = "v11";

  const NAME_MIN_WORDS = 2;
  const MAX_SYMPTOMS = 4;
  const WA_NUMBER = "17872321516";

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
  }

  function cleanValue(value) {
    return (value || "").trim();
  }

  function normalizeName(name) {
    return cleanValue(name).replace(/\s+/g, " ");
  }

  function nameHasSurname(name) {
    return normalizeName(name).split(" ").filter(Boolean).length >= NAME_MIN_WORDS;
  }

  function getLeadInputs() {
    const fullNameInput = $("#nombreCompleto") || $("#fullName") || $("input[name=nombreCompleto]") || $("input[name=fullName]");
    const nombreInput = $("#nombre") || $("input[name=nombre]");
    const apellidoInput = $("#apellido") || $("input[name=apellido]");
    return { fullNameInput, nombreInput, apellidoInput };
  }

  function getStoredLead() {
    const keys = ["bn_lead", "bnLead", "lead"];
    for (const key of keys) {
      let stored = "";
      try {
        stored = localStorage.getItem(key) || "";
      } catch (_) {
        stored = "";
      }
      if (!stored) {
        continue;
      }
      try {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === "object") {
          return { lead: parsed, keyUsed: key };
        }
      } catch (_) {
        continue;
      }
    }
    return { lead: null, keyUsed: "" };
  }

  function buildFullNameFromLead(lead) {
    if (!lead || typeof lead !== "object") {
      return "";
    }
    let fullName = lead.fullName || lead.name || lead.nombreCompleto || lead.full_name || "";
    if (!nameHasSurname(fullName) && lead.nombre && lead.apellido) {
      fullName = `${lead.nombre} ${lead.apellido}`;
    }
    return normalizeName(fullName);
  }

  function getLeadFresh() {
    const { lead, keyUsed } = getStoredLead();
    let fullName = buildFullNameFromLead(lead);

    if (!nameHasSurname(fullName)) {
      const { fullNameInput, nombreInput, apellidoInput } = getLeadInputs();
      const inputFullName = normalizeName(fullNameInput && fullNameInput.value);
      if (nameHasSurname(inputFullName)) {
        fullName = inputFullName;
      } else {
        const nombre = normalizeName(nombreInput && nombreInput.value);
        const apellido = normalizeName(apellidoInput && apellidoInput.value);
        if (nombre && apellido) {
          fullName = normalizeName(`${nombre} ${apellido}`);
        }
      }
    }

    const missing = [];
    if (!nameHasSurname(fullName)) {
      missing.push("Nombre y apellido");
    }

    return { fullName, missing, keyUsed };
  }

  function getScore() {
    const scoreNode = $("#scoreNum");
    if (scoreNode) {
      const parsed = parseInt(scoreNode.textContent, 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    const checks = $all('#checkList input[type="checkbox"]');
    return checks.filter((c) => c.checked).length;
  }

  function getSymptoms() {
    const checks = $all('#checkList input[type="checkbox"]');
    const checked = checks.filter((c) => c.checked);
    const labels = checked
      .map((input) => {
        const label = input.closest("label");
        if (!label) {
          return "";
        }
        const strong = label.querySelector("strong");
        return cleanValue(strong ? strong.textContent : label.textContent);
      })
      .filter(Boolean);
    return labels.slice(0, MAX_SYMPTOMS);
  }

  function levelForScore(score) {
    if (score <= 2) {
      return { label: "Leve", descriptor: "señales leves" };
    }
    if (score <= 5) {
      return { label: "Moderado", descriptor: "señales moderadas" };
    }
    if (score <= 7) {
      return { label: "Alto", descriptor: "señales altas" };
    }
    return { label: "Muy alto", descriptor: "señales muy altas" };
  }

  function buildMediterraneanBullets() {
    return [
      "Base vegetal: verduras en cada comida, legumbres 3-4 veces/semana y fruta entera diaria.",
      "Grasas saludables: aceite de oliva extra virgen, aguacate, nueces y semillas.",
      "Proteína limpia: pescado 2-3 veces/semana, huevo y yogur natural; limitar carnes procesadas.",
      "Carbohidrato inteligente: integrales y porciones moderadas, priorizando fibra y saciedad.",
    ];
  }

  function buildClinicalSuggestions(score) {
    const tests = ["Glucosa en ayunas", "Insulina en ayunas", "HbA1c"];
    if (score >= 6) {
      tests.push("HOMA-IR (si aplica)");
    } else {
      tests.push("HOMA-IR (si aplica)");
    }
    return tests;
  }

  function buildResultText() {
    const { fullName } = getLeadFresh();
    const score = getScore();
    const level = levelForScore(score);
    const symptoms = getSymptoms();
    const mediterranean = buildMediterraneanBullets();
    const clinical = buildClinicalSuggestions(score);

    const symptomsText = symptoms.length
      ? symptoms.map((s) => `- ${s}`).join("\n")
      : "- No marcaste síntomas en esta pasada.";

    const mediterraneanText = mediterranean.map((b) => `• ${b}`).join("\n");
    const clinicalText = clinical.map((t) => `- ${t}`).join("\n");

    return [
      `Hola ${fullName},`,
      "",
      `Nivel: ${level.label} (${level.descriptor}). Puntuación: ${score}. (Educativo, no diagnóstico).`,
      "",
      "Lo que marcaste:",
      symptomsText,
      "",
      "Recomendación estilo Mediterráneo (Harvard):",
      mediterraneanText,
      "",
      "Sugerencia clínica (educativo):",
      clinicalText,
      "",
      "Responde METABOLISMO",
      "",
      "Educativo, no diagnóstico, no sustituye evaluación médica personalizada.",
    ].join("\n");
  }

  function setResultText(text) {
    const resultTarget = $("#lastResultText") || $("#resultText");
    if (resultTarget) {
      resultTarget.textContent = text;
      return;
    }
    const resultBox = $(".resultBox") || $("#resultBox");
    if (!resultBox) {
      return;
    }
    const paragraphs = $all("p", resultBox);
    const longParagraph = paragraphs.find((p) => cleanValue(p.textContent).length > 80);
    if (longParagraph) {
      longParagraph.textContent = text;
    }
  }

  function showGatingMessage(missing) {
    const message = `Para darte tu resultado necesitas completar: ${missing.join(", ")}.`;
    setResultText(message);
  }

  function applyExpertResult() {
    const lead = getLeadFresh();
    if (lead.missing.length) {
      showGatingMessage(lead.missing);
      return "";
    }
    const text = buildResultText();
    setResultText(text);
    window.lastResultText = text;
    return text;
  }

  function getResultPanel() {
    const resultTarget = $("#lastResultText") || $("#resultText");
    if (resultTarget) {
      return resultTarget.parentElement || resultTarget;
    }
    return $(".resultBox") || $("#resultBox");
  }

  function maybeRenderDebugInfo(lead) {
    const params = new URLSearchParams(window.location.search);
    if (params.get("debug") !== "1") {
      return;
    }
    const panel = getResultPanel();
    if (!panel) {
      return;
    }
    let debugEl = panel.querySelector(".metab-debug-lead");
    if (!debugEl) {
      debugEl = document.createElement("div");
      debugEl.className = "metab-debug-lead";
      debugEl.style.marginBottom = "8px";
      debugEl.style.fontSize = "13px";
      debugEl.style.opacity = "0.8";
      panel.insertBefore(debugEl, panel.firstChild);
    }
    const marker = window.__metabExpertFinal || "unknown";
    const nameForDebug = lead.fullName || "N/A";
    const keyUsed = lead.keyUsed || "none";
    debugEl.textContent = `Lead detectado: ${nameForDebug} | key usada: ${keyUsed} | v: ${marker}`;
  }

  function interceptResultButton() {
    const button = $("button[onclick=\"computeTest()\"]");
    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        const lead = getLeadFresh();
        maybeRenderDebugInfo(lead);
        if (lead.missing.length) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showGatingMessage(lead.missing);
          return;
        }
        applyExpertResult();
      },
      true
    );
  }

  function interceptWhatsAppButton() {
    const button = $("button[onclick=\"sendResultToWhatsApp()\"]");
    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        const lead = getLeadFresh();
        maybeRenderDebugInfo(lead);
        if (lead.missing.length) {
          alert(`Falta completar: ${lead.missing.join(", ")}.`);
          showGatingMessage(lead.missing);
          return;
        }
        const text = applyExpertResult() || buildResultText();
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        window.open(url, "_blank", "noopener");
      },
      true
    );
  }

  function setupResultObserver() {
    const target = $("#lastResultText") || $("#resultText") || $(".resultBox");
    if (!target || !window.MutationObserver) {
      return;
    }

    const observer = new MutationObserver(() => {
      const lead = getLeadFresh();
      maybeRenderDebugInfo(lead);
      if (lead.missing.length) {
        return;
      }
      applyExpertResult();
    });

    observer.observe(target, { childList: true, characterData: true, subtree: true });
  }

  function init() {
    interceptResultButton();
    interceptWhatsAppButton();
    setupResultObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
