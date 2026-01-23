(function () {
  window.__metabExpertFinal = "v11";

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

  function extractFirstName(name) {
    return normalizeName(name).split(" ").filter(Boolean)[0] || "";
  }

  function getLeadInputs() {
    const fullNameInput =
      $("#nombreCompleto") ||
      $("#fullName") ||
      $("#name") ||
      $("input[name=nombreCompleto]") ||
      $("input[name=fullName]") ||
      $("input[name=name]");
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
    if (!fullName && lead.nombre && lead.apellido) {
      fullName = `${lead.nombre} ${lead.apellido}`;
    }
    return normalizeName(fullName);
  }

  function getPhonePrefix(phoneDigits) {
    const digits = cleanValue(phoneDigits).replace(/\D/g, "");
    if (!digits) {
      return "N/D";
    }
    if (digits.startsWith("52")) {
      return "+52";
    }
    if (digits.startsWith("1")) {
      return "+1";
    }
    return "N/D";
  }

  function countryGuessFromPhone(phoneDigits) {
    const prefix = getPhonePrefix(phoneDigits);
    if (prefix === "+52") {
      return { country: "MX", prefix };
    }
    if (prefix === "+1") {
      return { country: "PR/USA", prefix };
    }
    return { country: "N/D", prefix: "N/D" };
  }

  function buildWhatsAppLeadHeader(lead, levelLabel, score) {
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
    const email = cleanValue(safeLead.email || safeLead.correo || safeLead.mail);
    const countryInfo = countryGuessFromPhone(phone);
    return `LEAD | ${fullName} | ${city} | ${countryInfo.country} (${countryInfo.prefix}) | ${
      phone || "Sin teléfono"
    } | ${email || "Sin email"} | ${levelLabel} (${score}/10)`;
  }

  function getLeadFresh() {
    const { lead, keyUsed } = getStoredLead();
    let fullName = buildFullNameFromLead(lead);

    if (!fullName) {
      const { fullNameInput, nombreInput, apellidoInput } = getLeadInputs();
      const inputFullName = normalizeName(fullNameInput && fullNameInput.value);
      if (inputFullName) {
        fullName = inputFullName;
      } else {
        const nombre = normalizeName(nombreInput && nombreInput.value);
        const apellido = normalizeName(apellidoInput && apellidoInput.value);
        if (nombre && apellido) {
          fullName = normalizeName(`${nombre} ${apellido}`);
        } else {
          fullName = nombre || "";
        }
      }
    }

    const firstName = extractFirstName(fullName);
    return { fullName, firstName, keyUsed };
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

  function getSymptoms(limit = MAX_SYMPTOMS) {
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
    return labels.slice(0, limit);
  }

  function tierForScore(score) {
    if (score <= 2) {
      return {
        title: "Balance metabólico en rango bajo",
        summary:
          "Las señales son leves y eso es una buena base para fortalecer hábitos sin presión.",
        educational:
          "Pequeñas variaciones en apetito, energía o sueño pueden aparecer cuando el ritmo del día está desordenado.",
        next72h: [
          "Agua al despertar + proteína en el primer alimento",
          "Camina 10-15 min después de la comida principal",
          "Reduce azúcar líquida (jugos, refrescos, café endulzado)",
        ],
        nextStepShort:
          "Agua al despertar + proteína temprano, camina 10-15 min post comida y baja azúcar líquida 72h.",
      };
    }
    if (score <= 5) {
      return {
        title: "Señales metabólicas intermedias",
        summary:
          "Tu cuerpo está haciendo esfuerzo extra para mantener equilibrio; es común y suele mejorar con estructura.",
        educational:
          "Picos de hambre, sueño post-comida o inflamación pueden indicar sensibilidad a carbohidratos y estrés.",
        next72h: [
          "Ordena platos: primero proteína/verduras, después carbohidratos",
          "Incluye 1 porción extra de fibra al día (legumbres o verduras)",
          "Movimiento diario 20 min (caminar rápido o fuerza ligera)",
        ],
        nextStepShort:
          "Ordena comidas (proteína/verduras primero), suma fibra diaria y muévete 20 min al día.",
      };
    }
    if (score <= 7) {
      return {
        title: "Señales metabólicas claras",
        summary:
          "Hay señales más consistentes; vale la pena actuar pronto para recuperar energía y control del apetito.",
        educational:
          "Cuando la respuesta a la insulina se vuelve menos eficiente, aparecen antojos, cansancio y cintura inflamada.",
        next72h: [
          "Proteína + verduras en cada comida por 72h",
          "Pausa ultraprocesados y harinas refinadas por 3 días",
          "Duerme 7-8 h y baja pantallas 60 min antes de dormir",
        ],
        nextStepShort:
          "Proteína+verduras cada comida, pausa ultraprocesados 72h y prioriza sueño 7-8 h.",
      };
    }
    return {
      title: "Señales metabólicas altas",
      summary:
        "Las señales son altas y merecen atención cercana para cuidarte con claridad.",
      educational:
        "Puede haber resistencia a la insulina o inflamación metabólica; no es diagnóstico, pero sí una alerta útil.",
      next72h: [
        "Comidas simples: proteína magra + verduras + grasa saludable",
        "Evita azúcar y bebidas endulzadas por 72h",
        "Hidratación constante y caminatas suaves post-comida",
      ],
      nextStepShort:
        "Comidas simples (proteína+verduras), evita azúcar 72h e hidrátate con caminatas suaves.",
    };
  }

  function buildMediterraneanHabitText() {
    return "Vegetales en cada comida, legumbres 3-4 veces/semana, aceite de oliva, pescado 2 veces/semana y menos ultraprocesados (muy respaldado por evidencia Harvard/PubMed).";
  }

  function buildResultPayload() {
    const { firstName } = getLeadFresh();
    const score = getScore();
    const tier = tierForScore(score);
    const symptomsForPanel = getSymptoms(6);
    const symptomsForCompact = getSymptoms(3);
    const greeting = firstName ? `Hola ${firstName}` : "Hola";
    const symptomLine = symptomsForPanel.length
      ? symptomsForPanel.join(", ")
      : "No marcaste señales en esta pasada.";
    const compactSymptoms = symptomsForCompact.length
      ? symptomsForCompact.join(", ")
      : "sin señales marcadas en esta pasada";
    const alertBlock =
      score >= 8
        ? `<p class="resultAlert">Si hay signos de alarma (sed intensa, orinas muy frecuentes, visión borrosa, debilidad marcada, confusión, vómitos) → evaluación urgente.</p>`
        : "";

    const html = `
      <div class="resultTitle">${tier.title}</div>
      <p>${greeting}. Gracias por completar el test.</p>
      <p>Registraste ${score} señal(es). ${tier.summary}</p>
      <p><strong>Señales marcadas:</strong> ${symptomLine}</p>
      <ul>
        <li><strong>Qué puede estar pasando (educativo):</strong> ${tier.educational}</li>
        <li><strong>Siguiente paso 72h:</strong> ${tier.next72h.join(" · ")}</li>
        <li><strong>Qué pedirle al médico:</strong> glucosa en ayunas, HbA1c, lípidos, presión.</li>
        <li><strong>Hábitos Mediterráneo:</strong> ${buildMediterraneanHabitText()}</li>
      </ul>
      ${alertBlock}
      <p>Educativo, no diagnóstico ni tratamiento; no sustituye asesoría médica personalizada.</p>
    `;

    const shareText = `Test Metabólico Express — Puntuación: ${score}/10. Señales: ${compactSymptoms}. Siguiente paso 72h: ${tier.nextStepShort} Educativo, no diagnóstico ni tratamiento; no sustituye asesoría médica personalizada.`;
    const whatsappText = `${greeting}. Puntuación: ${score}/10. Señales: ${compactSymptoms}. Siguiente paso 72h: ${tier.nextStepShort} Educativo, no diagnóstico ni tratamiento; no sustituye asesoría médica personalizada.`;

    return { html, shareText, whatsappText, score };
  }

  function setResultText(text) {
    const resultTarget = $("#lastResultText") || $("#resultText");
    if (resultTarget) {
      resultTarget.innerHTML = text;
      return;
    }
    const resultBox = $(".resultBox") || $("#resultBox");
    if (!resultBox) {
      return;
    }
    const paragraphs = $all("p", resultBox);
    const longParagraph = paragraphs.find((p) => cleanValue(p.textContent).length > 80);
    if (longParagraph) {
      longParagraph.innerHTML = text;
    }
  }

  function applyExpertResult() {
    const payload = buildResultPayload();
    setResultText(payload.html);
    window.lastResultText = payload.shareText;
    window.lastResultWhatsApp = payload.whatsappText;
    return payload.html;
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
        applyExpertResult();
        const payload = buildResultPayload();
        const message = payload.whatsappText;
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
