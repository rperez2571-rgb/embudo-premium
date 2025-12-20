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
- Si quieres agregar notificación por email/webhook, usa el bloque TODO en `api/lead.php`.
- No cambies nombres de carpetas/rutas; todas las referencias son relativas.
