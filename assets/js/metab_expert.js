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

  function countryGuessFromPhone(phoneDigits) {
    const digits = cleanValue(phoneDigits).replace(/\D/g, "");
    if (!digits) {
      return "País no identificado";
    }
    if (digits.startsWith("52")) {
      return "México (+52)";
    }
    if (digits.startsWith("1")) {
      return "USA/PR (+1)";
    }
    if (digits.startsWith("57")) {
      return "Colombia (+57)";
    }
    if (digits.startsWith("34")) {
      return "España (+34)";
    }
    if (digits.startsWith("54")) {
      return "Argentina (+54)";
    }
    if (digits.startsWith("56")) {
      return "Chile (+56)";
    }
    if (digits.startsWith("51")) {
      return "Perú (+51)";
    }
    if (digits.startsWith("58")) {
      return "Venezuela (+58)";
    }
    return "LatAm";
  }

  function buildWhatsAppLeadHeader(lead) {
    const safeLead = lead && typeof lead === "object" ? lead : {};
    const fullName = buildFullNameFromLead(safeLead) || "Sin nombre";
    const city =
      cleanValue(
        safeLead.city ||
          safeLead.ciudad ||
          safeLead.area ||
          safeLead.region ||
          safeLead.location
      ) || "Sin ciudad";
    const phone = cleanValue(
      safeLead.phone || safeLead.telefono || safeLead.phoneNumber || safeLead.phone_number
    );
    const country = countryGuessFromPhone(phone);
    return `METABOLISMO | ${fullName} | ${city} | ${country}`;
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
      return {
        label: "Nivel Bajo",
        meaning:
          "Tus señales actuales sugieren que tu metabolismo está respondiendo bastante bien. Aun así, pequeños hábitos diarios pueden sumar o restar energía, apetito y claridad mental.",
        risk:
          "Si se ignora, podrías normalizar molestias sutiles (antojos, bajones de energía) que con el tiempo impactan en peso, sueño y rendimiento.",
        plan: [
          "Hidrátate temprano y suma 20-30 g de proteína en el desayuno.",
          "Camina 10-15 min después de la comida principal.",
          "Reduce azúcar líquida 72h (jugos, refrescos, café con azúcar).",
        ],
      };
    }
    if (score <= 6) {
      return {
        label: "Nivel Intermedio",
        meaning:
          "Hay señales de que tu metabolismo podría estar trabajando de más para mantener el equilibrio. Con ajustes simples, suele mejorar cómo te sientes día a día.",
        risk:
          "Si se ignora, los picos de hambre, fatiga o inflamación pueden volverse más frecuentes y afectar tu composición corporal.",
        plan: [
          "Ordena tus comidas: primero proteína/vegetales, luego carbohidratos.",
          "Suma 1 porción extra de fibra/día (legumbres o verduras).",
          "Mueve el cuerpo 20 min diarios (caminar rápido o fuerza ligera).",
        ],
      };
    }
    return {
      label: "Nivel Alto",
      meaning:
        "Tus respuestas sugieren señales claras de desbalance metabólico. Esto no es diagnóstico, pero sí una alerta útil para priorizar hábitos y seguimiento.",
      risk:
        "Si se ignora, podría aumentar el riesgo de resistencia a la insulina, aumento de grasa abdominal y cansancio persistente.",
      plan: [
        "Prioriza proteína magra + verduras en cada comida por 72h.",
        "Corta ultraprocesados y harinas refinadas por 3 días.",
        "Duerme 7-8 h y evita pantallas 60 min antes de dormir.",
      ],
    };
  }

  function buildMediterraneanBullets() {
    return [
      "Vegetales en cada comida y fruta entera diaria.",
      "Legumbres 3-4 veces por semana.",
      "Granos integrales (avena, quinoa, arroz integral).",
      "Aceite de oliva extra virgen y nueces como grasas principales.",
      "Limitar ultraprocesados y azúcares añadidos.",
    ];
  }

  function buildClinicalSuggestions() {
    return [
      "HbA1c (A1C)",
      "Glucosa en ayunas",
      "Curva de tolerancia a la glucosa 2h (OGTT)",
      "Lípidos (opcional)",
    ];
  }

  function buildResultText() {
    const { fullName } = getLeadFresh();
    const score = getScore();
    const level = levelForScore(score);
    const symptoms = getSymptoms();
    const mediterranean = buildMediterraneanBullets();
    const clinical = buildClinicalSuggestions();

    const symptomsText = symptoms.length
      ? symptoms.map((s) => `- ${s}`).join("\n")
      : "- No marcaste síntomas en esta pasada.";

    const mediterraneanText = mediterranean.map((b) => `• ${b}`).join("\n");
    const clinicalText = clinical.map((t) => `- ${t}`).join("\n");

    return [
      `Hola ${fullName},`,
      "",
      `${level.label}. Puntuación: ${score}. (Educativo, no diagnóstico).`,
      "",
      "Lo que marcaste:",
      symptomsText,
      "",
      "Qué significa:",
      level.meaning,
      "",
      "Riesgo si se ignora:",
      level.risk,
      "",
      "Plan práctico 72h:",
      level.plan.map((item) => `- ${item}`).join("\n"),
      "",
      "Mediterráneo (Harvard):",
      mediterraneanText,
      "",
      "Habla con tu médico sobre labs:",
      clinicalText,
      "",
      "Educativo, no diagnóstico, no sustituye evaluación médica personalizada.",
      "Compártelo con 2 personas que quieran mejorar su salud metabólica.",
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
        const { lead: storedLead } = getStoredLead();
        const lead = getLeadFresh();
        maybeRenderDebugInfo(lead);
        if (lead.missing.length) {
          alert(`Falta completar: ${lead.missing.join(", ")}.`);
          showGatingMessage(lead.missing);
          return;
        }
        const text = applyExpertResult() || buildResultText();
        const headerLine = buildWhatsAppLeadHeader(
          storedLead || { fullName: lead.fullName }
        );
        const message = `${headerLine}\n\n${text}`;
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
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
