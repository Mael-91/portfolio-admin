#!/bin/bash

set -e

NOW=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_DIR="/volume1/backup/portfolio-admin"
DB_BACKUP_DIR="$BACKUP_DIR/db"
FILES_BACKUP_DIR="$BACKUP_DIR/files"

DB_NAME="portfolio_prod"
DB_USER="portfolio_admin_user"
DB_PASS="REMPLACE_MOI"

API_ROOT="/volume1/web/portfolio-admin/portfolio-admin-api"
LEGAL_ARCHIVES_DIR="$API_ROOT/storage/legal-archives"

mkdir -p "$DB_BACKUP_DIR"
mkdir -p "$FILES_BACKUP_DIR"

echo "==> Dump base MariaDB..."
mysqldump \
  --single-transaction \
  --quick \
  --routines \
  --triggers \
  -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" \
  > "$DB_BACKUP_DIR/${DB_NAME}_$NOW.sql"

gzip -f "$DB_BACKUP_DIR/${DB_NAME}_$NOW.sql"

echo "==> Archive fichiers legal-archives..."
if [ -d "$LEGAL_ARCHIVES_DIR" ]; then
  tar -czf "$FILES_BACKUP_DIR/legal-archives_$NOW.tar.gz" -C "$API_ROOT/storage" "legal-archives"
else
  echo "Dossier legal-archives absent, archive ignorée."
fi

echo "==> Nettoyage anciennes sauvegardes > 30 jours"
find "$DB_BACKUP_DIR" -type f -mtime +30 -delete
find "$FILES_BACKUP_DIR" -type f -mtime +30 -delete

echo "Backup terminé : $NOW"