#!/usr/bin/env bash
set -euo pipefail
BASE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DATA_DIR="$BASE_DIR/data"
BACKUP_DIR="$BASE_DIR/backups"
mkdir -p "$BACKUP_DIR"
TS="$(date +%Y%m%d_%H%M%S)"
SRC="$DATA_DIR/leads.csv"
DEST="$BACKUP_DIR/leads_$TS.tar.gz"
if [ ! -f "$SRC" ]; then
  echo "No se encontró $SRC; se omite backup" >&2
  exit 0
fi
tar -czf "$DEST" -C "$DATA_DIR" "$(basename "$SRC")"
echo "Backup creado: $DEST"
