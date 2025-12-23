## Respaldo de leads y logging

Este proyecto guarda la base de leads en `data/leads.csv`. Los pasos siguientes documentan cómo generar respaldos manuales o programados, y cómo registrar errores en un archivo rotativo dentro de `data/logs/`.

> Importante: las rutas usan el directorio raíz del repositorio. No se incluyen binarios en control de versiones; los ejemplos asumen que el archivo `data/leads.csv` ya existe en el entorno donde se ejecutan.

### Respaldos manuales por CLI

1. Asegúrate de tener el archivo `data/leads.csv` disponible en el entorno.
2. Ejecuta un backup puntual con `tar` (sin depender de scripts externos):

   ```bash
   mkdir -p data/backups
   tar -czf data/backups/leads-$(date +%Y%m%d-%H%M%S).tar.gz -C data leads.csv
   ```

   El comando crea un archivo comprimido fechado en `data/backups/` sin dejar archivos temporales en otras rutas.

3. Verifica el contenido (opcional):

   ```bash
   tar -tzf data/backups/leads-YYYYMMDD-hhmmss.tar.gz
   ```

### Respaldos programados (cron)

> Sólo se documenta la configuración; no se activa ningún cron job por defecto.

1. Usa el script `scripts/backup_leads.sh` para estandarizar la tarea (ver sección siguiente).
2. Ejemplo de entrada en `crontab -e` para un respaldo diario a las 02:00 (ajusta la ruta absoluta según tu despliegue):

   ```cron
   0 2 * * * cd /ruta/a/embudo-premium && ./scripts/backup_leads.sh >> data/logs/backup.log 2>&1
   ```

3. Revisa el archivo de salida `data/logs/backup.log` y rota el archivo según el esquema de logging documentado abajo.

### Script utilitario: `scripts/backup_leads.sh`

El script opcional automatiza el respaldo sin agregar binarios al repositorio. Su comportamiento:

- Valida la existencia de `data/leads.csv`.
- Crea `data/backups/` si no existe.
- Genera un archivo `.tar.gz` fechado `leads-YYYYMMDD-hhmmss.tar.gz` dentro de `data/backups/`.

Uso:

```bash
chmod +x scripts/backup_leads.sh
./scripts/backup_leads.sh
```

El script imprime la ruta final del respaldo. Si falta `data/leads.csv`, termina con un error explícito (salida distinta de cero).

### Logging de errores en `data/logs/`

- El proyecto reserva el directorio `data/logs/` (incluido en el repositorio mediante un marcador vacío) para almacenar archivos de errores como `data/logs/app-errors.log` o `data/logs/backup.log`.
- Se recomienda configurar rotación local con `logrotate` u otra herramienta equivalente. Ejemplo de bloque de configuración para `logrotate` (ajusta rutas absolutas según el despliegue):

  ```
  /ruta/a/embudo-premium/data/logs/*.log {
      daily
      rotate 14
      compress
      delaycompress
      missingok
      notifempty
      copytruncate
  }
  ```

- Los servicios o scripts que generen errores deben dirigir `stderr` a estos archivos, permitiendo su rotación sin modificar el código principal. Por ejemplo:

  ```bash
  ./scripts/backup_leads.sh >> data/logs/backup.log 2>&1
  ```

Con esto queda definido el esquema de respaldos y logging sin activar tareas programadas por defecto.
