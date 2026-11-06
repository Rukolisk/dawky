#!/bin/bash
# scripts/sauvegarde-bdd.sh — Sauvegarde chiffrée de la base Dawky (Supabase)
#
# Usage (sur le VPS, depuis /opt/dawky) :
#   bash scripts/sauvegarde-bdd.sh
# Planification quotidienne à 3 h (crontab -e) :
#   0 3 * * * cd /opt/dawky && bash scripts/sauvegarde-bdd.sh >> /var/log/dawky-sauvegarde.log 2>&1
#
# Variables (dans .env.production, ou l'environnement) :
#   DIRECT_URL            connexion directe Postgres (port 5432, sans pgBouncer)
#   BACKUP_PASSPHRASE     phrase secrète de chiffrement (À CONSERVER HORS DU VPS :
#                         sans elle, les sauvegardes sont illisibles)
#   BACKUP_DIR            dossier des sauvegardes (défaut : /opt/dawky/sauvegardes)
#   BACKUP_RETENTION_DAYS durée de conservation en jours (défaut : 30)
#   BACKUP_RCLONE_DEST    optionnel : copie hors du VPS via rclone (ex. « s3:dawky-sauvegardes »)
#   ENV_FILE              fichier d'environnement (défaut : .env.production)

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $(date '+%F %T') $1"; }
success() { echo -e "${GREEN}[OK]${NC} $(date '+%F %T') $1"; }
error()   { echo -e "${RED}[ERREUR]${NC} $(date '+%F %T') $1" >&2; exit 1; }

ENV_FILE="${ENV_FILE:-.env.production}"
if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

[ -n "${DIRECT_URL:-}" ]        || error "DIRECT_URL manquant (connexion directe Postgres, port 5432)"
[ -n "${BACKUP_PASSPHRASE:-}" ] || error "BACKUP_PASSPHRASE manquant : définissez une phrase secrète de chiffrement"

BACKUP_DIR="${BACKUP_DIR:-/opt/dawky/sauvegardes}"
RETENTION="${BACKUP_RETENTION_DAYS:-30}"
mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

HORODATAGE="$(date +%Y-%m-%d_%H%M)"
FICHIER="$BACKUP_DIR/dawky_${HORODATAGE}.dump.enc"
TEMP="$(mktemp "$BACKUP_DIR/.en-cours.XXXXXX")"
trap 'rm -f "$TEMP"' EXIT

# pg_dump de la même version majeure que le serveur (PostgreSQL 17 chez
# Supabase) via Docker ; à défaut, le pg_dump local (version ≥ 17).
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  PG_DUMP=(docker run --rm -i postgres:17-alpine pg_dump)
else
  command -v pg_dump >/dev/null 2>&1 || error "Ni Docker ni pg_dump ne sont disponibles"
  PG_DUMP=(pg_dump)
fi

info "Sauvegarde de la base (schéma public)…"
# Format « custom » : compressé et restaurable table par table avec pg_restore.
# Seul le schéma public (données Dawky) est sauvegardé : les schémas internes
# de Supabase (auth, storage…) sont gérés par Supabase.
"${PG_DUMP[@]}" --dbname="$DIRECT_URL" --format=custom --compress=6 \
  --schema=public --no-owner --no-privileges \
  | openssl enc -aes-256-cbc -pbkdf2 -iter 200000 -salt -pass env:BACKUP_PASSPHRASE -out "$TEMP" \
  || error "Échec de la sauvegarde"

# Une sauvegarde vide signale un problème (connexion, droits…)
[ "$(stat -c%s "$TEMP")" -gt 1024 ] || error "Sauvegarde anormalement petite, vérifiez la connexion"

mv "$TEMP" "$FICHIER"
chmod 600 "$FICHIER"
trap - EXIT
success "Sauvegarde créée : $FICHIER ($(du -h "$FICHIER" | cut -f1))"

if [ -n "${BACKUP_RCLONE_DEST:-}" ]; then
  info "Copie hors du VPS vers $BACKUP_RCLONE_DEST…"
  rclone copy "$FICHIER" "$BACKUP_RCLONE_DEST" || error "Échec de la copie rclone"
  success "Copie hors du VPS effectuée"
fi

SUPPRIMES=$(find "$BACKUP_DIR" -name 'dawky_*.dump.enc' -mtime +"$RETENTION" -print -delete | wc -l)
[ "$SUPPRIMES" -gt 0 ] && info "$SUPPRIMES sauvegarde(s) de plus de $RETENTION jours supprimée(s)"
exit 0
