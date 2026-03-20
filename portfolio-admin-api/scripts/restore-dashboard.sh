#!/bin/bash

set -e

if [ $# -lt 2 ]; then
  echo "Usage: $0 <dump.sql.gz> <archives.tar.gz>"
  exit 1
fi

SQL_DUMP="$1"
FILES_ARCHIVE="$2"

DB_NAME="portfolio"
DB_USER="portfolio_user"
DB_PASS="gR]0MNeffKsQ0Goa"

API_ROOT="/volume1/web/portfolio-admin/portfolio-admin-api"
STORAGE_DIR="$API_ROOT/storage"

echo "==> Restauration base..."
gunzip -c "$SQL_DUMP" | mysql -u"$DB_USER" -p"$DB_PASS" "$DB_NAME"

echo "==> Restauration fichiers..."
mkdir -p "$STORAGE_DIR"
tar -xzf "$FILES_ARCHIVE" -C "$STORAGE_DIR"

echo "Restauration terminée."