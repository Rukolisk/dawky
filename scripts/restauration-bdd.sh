#!/bin/bash
# scripts/restauration-bdd.sh — Restauration d'une sauvegarde chiffrée
#
# Usage :
#   bash scripts/restauration-bdd.sh <fichier.dump.enc> --verifier
#       Déchiffre et liste le contenu, sans rien modifier (test régulier conseillé).
#   bash scripts/restauration-bdd.sh <fichier.dump.enc> --restaurer
#       ⚠️ REMPLACE les données actuelles du schéma public par la sauvegarde.
#
# Variables : DIRECT_URL (base cible), BACKUP_PASSPHRASE, ENV_FILE (défaut .env.production)

set -euo pipefail
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
error() { echo -e "${RED}[ERREUR]${NC} $1" >&2; exit 1; }

FICHIER="${1:-}"
MODE="${2:-}"
[ -f "$FICHIER" ] || error "Fichier de sauvegarde introuvable : $FICHIER"
[[ "$MODE" == "--verifier" || "$MODE" == "--restaurer" ]] || error "Précisez --verifier ou --restaurer"

ENV_FILE="${ENV_FILE:-.env.production}"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi
[ -n "${BACKUP_PASSPHRASE:-}" ] || error "BACKUP_PASSPHRASE manquant"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  PG_RESTORE=(docker run --rm -i postgres:17-alpine pg_restore)
else
  PG_RESTORE=(pg_restore)
fi

dechiffrer() {
  openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -pass env:BACKUP_PASSPHRASE -in "$FICHIER"
}

if [ "$MODE" = "--verifier" ]; then
  TABLES=$(dechiffrer | "${PG_RESTORE[@]}" --list | grep -c "TABLE DATA" || true)
  [ "$TABLES" -gt 0 ] || error "Sauvegarde illisible (mauvaise phrase secrète ou fichier corrompu)"
  echo -e "${GREEN}[OK]${NC} Sauvegarde lisible : $TABLES tables de données."
  exit 0
fi

[ -n "${DIRECT_URL:-}" ] || error "DIRECT_URL manquant"
echo -e "${YELLOW}[ATTENTION]${NC} Les données actuelles seront remplacées par celles de $FICHIER."
read -r -p "Tapez RESTAURER pour confirmer : " CONFIRMATION
[ "$CONFIRMATION" = "RESTAURER" ] || error "Restauration annulée"

dechiffrer | "${PG_RESTORE[@]}" --dbname="$DIRECT_URL" --clean --if-exists --no-owner --no-privileges --single-transaction
echo -e "${GREEN}[OK]${NC} Restauration terminée."
