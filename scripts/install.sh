#!/bin/bash
# scripts/install.sh — Première installation Dawky sur VPS
# Usage : bash scripts/install.sh

set -e
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'
info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
success() { echo -e "${GREEN}[OK]${NC} $1"; }
warn()    { echo -e "${YELLOW}[ATTENTION]${NC} $1"; }
error()   { echo -e "${RED}[ERREUR]${NC} $1"; exit 1; }

echo ""
echo "🐾 Installation Dawky sur VPS"
echo "================================"

[ ! -f "docker-compose.yml" ] && error "Lancez depuis /opt/dawky"
[ ! -f ".env.production" ]    && error "Créez .env.production d'abord : cp .env.production.example .env.production && nano .env.production"

success ".env.production trouvé"

# ── 1. Démarrer en HTTP ──────────────────────────────────────
info "Étape 1/4 — Démarrage HTTP temporaire..."
cp nginx/nginx.conf nginx/nginx.conf.backup
cp nginx/nginx-init.conf nginx/nginx.conf
docker compose up -d --build
info "Attente 30 secondes que l'app démarre..."
sleep 30
docker compose ps
success "App démarrée"

# ── 2. Certificat SSL ────────────────────────────────────────
info "Étape 2/4 — Certificat SSL..."
warn "dawky.fr doit pointer vers ce serveur avant de continuer !"
read -p "Votre email pour Let's Encrypt : " LEEMAIL

docker compose run --rm certbot certonly \
  --webroot --webroot-path=/var/www/certbot \
  -d dawky.fr -d www.dawky.fr \
  --email "$LEEMAIL" --agree-tos --no-eff-email --force-renewal

success "Certificat obtenu !"

# ── 3. Activer HTTPS ─────────────────────────────────────────
info "Étape 3/4 — Activation HTTPS..."
cp nginx/nginx.conf.backup nginx/nginx.conf
docker compose restart nginx
sleep 5
success "HTTPS activé"

# ── 4. Résumé ────────────────────────────────────────────────
echo ""
echo "✅ Installation terminée !"
echo ""
docker compose ps
echo ""
echo "Votre site : https://dawky.fr"
echo ""
echo "Prochaines étapes (sur votre PC local) :"
echo "  npm run db:push && npm run db:seed"
