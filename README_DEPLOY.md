# Despliegue Bariátrica Natural — lasaludesriqueza.com/bariatrica/

## Requisitos mínimos
- Hosting con PHP 7.4+ y Apache (mod_headers, mod_expires, mod_authz_core).
- Carpeta public_html en cPanel o acceso FTP/SFTP.

## Estructura a subir
```
/public_html/bariatrica/
  |- index.html
  |- assets/ (imágenes, videos, pdf)
  |- api/lead.php
  |- data/ (contendrá leads.csv)
  |- .htaccess
  |- README_DEPLOY.md
  |- bariatrica.zip (opcional, solo como backup)
```

## Pasos de despliegue (cPanel / FTP)
1) Conéctate al hosting y entra a `/public_html/`.
2) Crea la carpeta `bariatrica/` si no existe.
3) Sube el contenido del ZIP generado (ver más abajo) dentro de `bariatrica/` y descomprímelo manteniendo la estructura.
4) Verifica que `data/` conserve su `.htaccess` y permisos de escritura (755 en carpeta, 644 en archivos). El archivo `data/leads.csv` se creará solo cuando llegue el primer lead.
5) Prueba en navegador: https://lasaludesriqueza.com/bariatrica/
   - Envía un lead de prueba. Debe responder `ok:true` y abrir WhatsApp.
   - Revisa que `/data/` devuelva acceso denegado (no debe listar nada).

## Generar el ZIP listo para producción
Desde la raíz del proyecto:
```bash
zip -r bariatrica.zip index.html assets api data .htaccess README_DEPLOY.md
```
El archivo `bariatrica.zip` contendrá todo lo necesario para subir a `/public_html/bariatrica/`.

## Notas de operación
- El endpoint guarda los leads en `data/leads.csv` con timestamp ISO-8601.
- No cambies nombres de carpetas/rutas; todas las referencias son relativas.

## Analytics (GTM)
1) Reemplaza `GTM-XXXXXXX` en `index.html` (script en `<head>` y `<noscript>` al inicio de `<body>`).
2) Eventos enviados a `dataLayer`:
   - `lead_submit_attempt`, `lead_submit_success`, `lead_submit_error`
   - `click_whatsapp` (todos los botones que abren WhatsApp)
   - `video_play` (video hero)
   - `scroll_depth` (25/50/75/100)

## CRM / Email (placeholders)
- Configura en `api/lead.php`:
  - `webhook_url` (ej. n8n/zapier)
  - `crm.provider`: `hubspot` o `brevo` (si vacío, no se envía)
  - Credenciales: `api_key`, `list_id`, `endpoint` según proveedor.
- Segmento: se toma de `segment`/`lead_type` en el payload; por defecto `consumo`.
- Envío de email de bienvenida: función placeholder (añade tu SMTP/API antes de usar).
- Logging de errores de integración: `data/logs/lead_errors.log` (se crea on-demand).

### Plantillas de bienvenida (ejemplos, sin claims médicos)
1) **Consumo — Inicio claro**
   - Asunto: “Tu guía de inicio — Sistema Metabólico Bariátrica Natural”
   - Cuerpo breve: agradece el interés, indica que recibirán paso a paso por WhatsApp, recuerda completar el test y confirmar ciudad/teléfono para coordinar.
2) **Negocio — Equipo Fundador**
   - Asunto: “Paso 1 para evaluar si encajas en el Equipo Fundador”
   - Cuerpo breve: agradece, pide confirmar disponibilidad y objetivo, incluye siguiente paso: llamada breve / checklist, sin prometer ingresos.
3) **Recordatorio neutro (24–48h)**
   - Asunto: “¿Listo para el siguiente paso?”
   - Cuerpo breve: invita a responder con “METABOLISMO” o “NEGOCIO” para priorizar la conversación; sin promesas de resultados.

## WhatsApp (click-to-chat + preparación API)
- Click-to-WhatsApp ya funciona. Eventos `click_whatsapp` listos para GTM.
- Placeholders para futura API de WhatsApp Business: completar credenciales/IDs en el código/documentación cuando se tenga BSP aprobado.
- Flow sugerido (no implementado): mensaje de bienvenida, 3 preguntas de perfilado, handoff humano. Asegúrate de consentimiento y de no usar datos para entrenar modelos ni perfilar (política Jan 15 2026).

## Backups y monitoring
- Script opcional: `scripts/backup_leads.sh` crea `backups/leads_<timestamp>.tar.gz`. Ejecuta desde la raíz:
  ```bash
  ./scripts/backup_leads.sh
  ```
- Puedes automatizar con cron (ejemplo diario): `0 2 * * * /ruta/al/proyecto/scripts/backup_leads.sh`.
- Logs de errores de integraciones: `data/logs/lead_errors.log` (se crea solo si hay fallos).
