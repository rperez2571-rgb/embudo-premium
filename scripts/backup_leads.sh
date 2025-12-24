#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LEADS_FILE="$ROOT_DIR/data/leads.csv"
BACKUP_DIR="$ROOT_DIR/data/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
ARCHIVE_NAME="leads-${TIMESTAMP}.tar.gz"

if [[ ! -f "$LEADS_FILE" ]]; then
  echo "[error] No se encontró $LEADS_FILE" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

tar -czf "$BACKUP_DIR/$ARCHIVE_NAME" -C "$ROOT_DIR/data" "$(basename "$LEADS_FILE")"

echo "$BACKUP_DIR/$ARCHIVE_NAME"
