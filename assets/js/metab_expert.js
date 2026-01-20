(function () {
  window.__metabExpertFinal = "v11";

  const NAME_MIN_WORDS = 2;
  const RESULT_REFRESH_DELAY_MS = 9000;
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
    const emailInput = $("#email") || $("input[name=email]");
    const phoneInput =
      $("#phone") ||
      $("input[name=phone]") ||
      $("input[name=tel]") ||
      $("input[name=telefono]") ||
      $("input[type=tel]");

    return { fullNameInput, nombreInput, apellidoInput, emailInput, phoneInput };
  }

  function getLeadData() {
    const { fullNameInput, nombreInput, apellidoInput, emailInput, phoneInput } = getLeadInputs();
    let fullName = normalizeName(fullNameInput && fullNameInput.value);

    if (!nameHasSurname(fullName)) {
      const nombre = normalizeName(nombreInput && nombreInput.value);
      const apellido = normalizeName(apellidoInput && apellidoInput.value);
      if (nombre && apellido) {
        fullName = normalizeName(`${nombre} ${apellido}`);
      }
    }

    const email = cleanValue(emailInput && emailInput.value);
    const phone = cleanValue(phoneInput && phoneInput.value);

    const missing = [];
    if (!nameHasSurname(fullName)) {
      missing.push("Nombre y apellido");
    }
    if (!email) {
      missing.push("Email");
    }
    if (!phone) {
      missing.push("Teléfono");
    }

    return { fullName, email, phone, missing };
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
    const { fullName } = getLeadData();
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
    window.lastResultText = "";
  }

  function applyExpertResult() {
    const lead = getLeadData();
    if (lead.missing.length) {
      showGatingMessage(lead.missing);
      return "";
    }
    const text = buildResultText();
    setResultText(text);
    window.lastResultText = text;
    return text;
  }

  function ensureResultOverride() {
    applyExpertResult();
    setTimeout(() => applyExpertResult(), RESULT_REFRESH_DELAY_MS);
  }

  function interceptResultButton() {
    const button = $("button[onclick=\"computeTest()\"]");
    if (!button) {
      return;
    }

    button.addEventListener(
      "click",
      (event) => {
        const lead = getLeadData();
        if (lead.missing.length) {
          event.preventDefault();
          event.stopImmediatePropagation();
          showGatingMessage(lead.missing);
          return;
        }
        setTimeout(() => ensureResultOverride(), 150);
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
        const lead = getLeadData();
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
      const lead = getLeadData();
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
