# Embudo de Venta — Informe Maestro Consolidado (Servidor + GitHub + Validación)

**Generado (UTC):** 2026-01-22T15:39:53.126731+00:00

## 1) Alcance

- Inventario **read-only** del servidor privado (solo `Bariátrica Natural`, sin tocar RAI ni SniperMind).

- Snapshot del repo local/GitHub (estado git, ramas, últimos commits).

- Integración con lo validado en este chat (PRs mergeados, gobernanza, pendientes).


---

## 2) Servidor privado — Qué hay desplegado

- **Hostname:** `vmi2602631.contaboserver.net`

- **OS:** `PRETTY_NAME="Ubuntu 22.04.5 LTS"`

- **Timestamp audit (UTC):** `2026-01-22T14:34:24Z`

- **Base path:** `/var/www/bariatrica_natural`

- **Dominios detectados en nginx_refs:** No detectado en nginx_refs.txt


### 2.1 Archivos clave encontrados (por tipo)

**HTML**
- `/var/www/bariatrica_natural/embudo-premium/index.html`
- `/var/www/bariatrica_natural/embudo-premium/landing_corporativa.html`
- `/var/www/bariatrica_natural/embudo-premium/landing_venta.html`
- `/var/www/bariatrica_natural/index.html`
- `/var/www/bariatrica_natural/landing_corporativa.html`
- `/var/www/bariatrica_natural/landing_venta.html`


**JS**
- `/var/www/bariatrica_natural/assets/js/metab_expert.js`


**PHP (captura/endpoint)**
- `/var/www/bariatrica_natural/api/lead.php`
- `/var/www/bariatrica_natural/embudo-premium/api/lead.php`


**Datos (CSV)**
_(none)_


**ZIP/Deploy**
_(none)_


**Docs / .htaccess**
- `/var/www/bariatrica_natural/README_DEPLOY.md`
- `/var/www/bariatrica_natural/embudo-premium/README_DEPLOY.md`
- `/var/www/bariatrica_natural/.htaccess`
- `/var/www/bariatrica_natural/data/.htaccess`
- `/var/www/bariatrica_natural/embudo-premium/.htaccess`
- `/var/www/bariatrica_natural/embudo-premium/data/.htaccess`


### 2.2 Leads (sin exponer contenido)

- No se detectó metadata de leads.csv (o no existe en el deploy).


### 2.3 Integridad (hashes)

- Se capturaron hashes SHA-256 para archivos clave (excepto `leads.csv`, solo metadata).

- Total hashes registrados: **15**


---

## 3) GitHub/Repo — Snapshot local

- **Carpeta:** ``

- **Branch:** `main`

- **HEAD:** `aded3e2790429207b1fc6c27a95b13e4c04e61d1`


### 3.1 Remotes

```text
origin	https://github.com/rperez2571-rgb/embudo-premium.git (fetch)
origin	https://github.com/rperez2571-rgb/embudo-premium.git (push)
```

### 3.2 Status

```text
## main...origin/main
?? embudo-premium/
?? landing_venta.html.bak_ui26_1767370913
?? landing_venta.html.bak_ui27_1767371889
```

### 3.3 Últimos 50 commits (oneline)

```text
aded3e2 Merge pull request #22 from rperez2571-rgb/ui-27-restore-unicity-borders
282ea4d UI-27: restaurar bordes teal tabs Unicity (solo borde)
82347a0 Merge pull request #21 from rperez2571-rgb/ui-26-remove-video-pill
03a0ee9 UI-26: eliminar texto 'Testimonio en video más abajo' (mínimo)
25b69eb Merge pull request #20 from rperez2571-rgb/ui-24-fix-kit-card
68687c7 UI-24: fix definitivo SOLO cuadro 1 (kit) sin tocar los demás
0d6585e Merge pull request #19 from rperez2571-rgb/ui-23-header-mexico
5b86ad8 UI-23: header México + subtítulo más legible (mínimo)
c5a84ec Merge pull request #18 from rperez2571-rgb/ui-18v2-focus-tabs-cards
095c34e UI-18/19: foco tabs/cards + PDR legible + topbar centrada (CSS-only)
e4d055c UI-18: foco tabs (btnGhost) + cards (trustTile) CSS-only
2681664 Merge pull request #17 from rperez2571-rgb/ui-17-cta-mobile
950b11c UI-17: fix spacing bullets + aire CTA (mobile) + favicon
9c86616 Merge pull request #16 from rperez2571-rgb/hotfix-revert-pr8
af60a2e Revert "Ajustar bordes de botones en confianza (#8)"
742bf5e Ajustar bordes de botones en confianza (#8)
641afb3 UI: tabs aro color premium siempre visible (#15)
7069c24 UI: hotfix tabs bordes visibles (#14)
b93af37 UI: bordes premium tabs (Ciencia/Historia/Oportunidad) (#13)
52013aa UI: fix legibilidad residual + limpiar header video (#12)
a0f373a Merge pull request #11 from rperez2571-rgb/codex/update-typography-and-contrast-for-readability
22a2a2a Improve landing typography and contrast
4dfd7af Improve mobile readability and image handling (#9)
89e3f3e VENTA: botón WhatsApp (texto corto) (#10)
21fb604 VENTA: motion premium + tabs confianza + PDR legible (CSS-only (#7)
021672c Add landing variants: venta + corporativa (robot intacto)
6a84414 Resolve merge: keep landing version (ours)
9351c3e Landing final: video + confianza legible 40+; WhatsApp verde; CTA naranja; robot intacto
14401fc Subo index.html
cd21cd1 Subo assets
76399de Create .gitkeep
```

---

## 4) Validado en este chat — Lo aprobado/mergeado

### PRs mergeados

- **#10** — VENTA: botón WhatsApp (texto corto) — commit: `89e3f3e`
- **#9** — UI: legibilidad + imágenes mobile (CSS-only) — commit: `4dfd7af`
- **#11** — UI: tipografía 40+ + contraste (lectura fácil) — commit: `a0f373a`
- **#12** — UI: fix legibilidad residual + limpiar header video — commit: `52013aa`
- **#13** — UI: bordes premium tabs (Ciencia/Historia/Oportunidad) — commit: `b93af37`
- **#14** — UI: hotfix tabs — bordes color visibles (Ciencia/Historia/Oportunidad) — commit: `7069c24`
- **#15** — UI: tabs — aro color premium SIEMPRE visible (Ciencia/Historia/Oportunidad) — commit: `641afb3`


## 5) Pendientes recomendados (siguiente ejecución)

1) **Header superior**: espaciado/alineación del texto izquierdo y CTA “Empezar”.

2) **Test metabólico**: respuestas humano-científicas (educativo, no diagnóstico).

3) **Compartir test + captura de lead** (PR separado porque toca flujo/datos y consentimiento).

4) **URL pública para socios**: GitHub Pages o deploy (no 127.0.0.1).


---

## 6) Plan para automatización (WhatsApp + Email IA) — humano, no robótico

### 6.1 WhatsApp

- **Recomendado**: WhatsApp Business Platform (Cloud API) o proveedor (Twilio) + orquestación (n8n).

- **Reglas humanas**: mensajes cortos, personalizados por segmento, y **handoff a humano** cuando haya duda/objeción.

- **Compliance**: consentimiento explícito, opt-out (“Escribe STOP”), y mínima retención de PII.


### 6.2 Email

- **ESP**: ActiveCampaign / ConvertKit / Klaviyo (según stack) + segmentación por etapa.

- **Secuencia base**: Día 0 (bienvenida) → Día 1 (educación) → Día 3 (prueba social) → Día 7 (CTA).

- **IA**: generar variaciones de asunto/cuerpo por segmento con guardrails (sin sonar robótico), y revisión humana de plantillas.


### 6.3 Integración de datos

- Lead capture → CRM/lista → etiquetas por fuente (UTM) y comportamiento (click WhatsApp, submit, etc.).

- Todo cambio de endpoints/datos debe ir en PR separado (por método).


---

## 7) Cómo guardar esto en GitHub (recomendado)

1) Crear carpeta `docs/audits/2026-01-22/` en el repo.

2) Subir: `bn_audit_*.tar.gz`, `embudo_github_audit_*.tar.gz`, este informe (`.md`) y el JSON consolidado.

3) Hacer PR → aprobar → merge.
