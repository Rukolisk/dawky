# 🚀 Guide de déploiement Dawky

Suivez les étapes dans l'ordre. Comptez ~45 minutes pour la première fois.
Ensuite, chaque mise à jour sera automatique en faisant `git push`.

---

## VUE D'ENSEMBLE

```
Votre PC ──git push──▶ GitHub ──Build Docker──▶ VPS dawky.fr
                           │
                     Déploiement auto
                     via GitHub Actions
```

---

## ÉTAPE 1 — Créer un compte GitHub et un dépôt

1. Allez sur https://github.com → créez un compte si vous n'en avez pas
2. Cliquez **"New repository"**
3. Nommez-le `dawky`
4. Mettez-le en **Private**
5. Cliquez **"Create repository"**

---

## ÉTAPE 2 — Mettre votre code sur GitHub

Sur votre machine locale, dans le dossier du projet :

```bash
# Initialisez Git si pas déjà fait
git init
git add .
git commit -m "Initial commit"

# Connectez au dépôt GitHub (remplacez VOTRE_USERNAME)
git remote add origin https://github.com/VOTRE_USERNAME/dawky.git
git branch -M main
git push -u origin main
```

---

## ÉTAPE 3 — Configurer les secrets GitHub

Dans votre dépôt GitHub :
→ **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

Ajoutez ces 3 secrets :

| Nom | Valeur |
|-----|--------|
| `VPS_HOST` | L'adresse IP de votre VPS (ex: `51.38.42.100`) |
| `VPS_USER` | `root` (ou votre utilisateur SSH) |
| `VPS_SSH_KEY` | Votre clé SSH privée (voir étape suivante) |

### Comment obtenir votre clé SSH :

```bash
# Sur votre machine locale — si vous n'avez pas de clé SSH
ssh-keygen -t ed25519 -C "deploy@dawky.fr" -f ~/.ssh/dawky_deploy

# Afficher la clé PRIVÉE (à coller dans VPS_SSH_KEY sur GitHub)
cat ~/.ssh/dawky_deploy

# Afficher la clé PUBLIQUE (à copier sur le VPS à l'étape 4)
cat ~/.ssh/dawky_deploy.pub
```

---

## ÉTAPE 4 — Configurer votre VPS

### 4a. Se connecter au VPS

```bash
ssh root@IP_VOTRE_VPS
```

### 4b. Installer Docker

```bash
# Installer Docker (une seule ligne)
curl -fsSL https://get.docker.com | sh

# Vérifier
docker --version       # doit afficher Docker 24+
docker compose version # doit afficher Docker Compose 2+
```

### 4c. Autoriser la clé SSH de déploiement

```bash
# Coller la clé PUBLIQUE (dawky_deploy.pub) ici :
echo "COLLEZ_ICI_LE_CONTENU_DE_dawky_deploy.pub" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### 4d. Configurer le DNS dawky.fr

Chez votre registrar (là où vous avez acheté dawky.fr) :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| A | `@` | IP_VOTRE_VPS | 300 |
| A | `www` | IP_VOTRE_VPS | 300 |

⏳ Attendez 5–30 minutes que le DNS se propage.
Vérifiez : `ping dawky.fr` → doit répondre avec l'IP de votre VPS.

### 4e. Préparer le dossier de l'app sur le VPS

```bash
# Sur le VPS
mkdir -p /opt/dawky
cd /opt/dawky

# Cloner votre dépôt GitHub (remplacez VOTRE_USERNAME)
git clone https://github.com/VOTRE_USERNAME/dawky.git .

# Créer le fichier d'environnement de production
cp .env.production.example .env.production
nano .env.production
# ↑ Remplissez toutes les valeurs (voir section Variables d'env)
```

---

## ÉTAPE 5 — Première installation SSL (HTTPS)

### 5a. Démarrer nginx en mode HTTP temporaire

```bash
cd /opt/dawky

# Utiliser la config sans SSL pour le premier démarrage
cp nginx/nginx.conf nginx/nginx.conf.backup
cp nginx/nginx-init.conf nginx/nginx.conf

# Construire l'image et démarrer
docker compose up -d --build

# Vérifier que tout tourne
docker compose ps
# Vous devez voir : dawky-app ✓, dawky-nginx ✓, dawky-certbot ✓
```

### 5b. Obtenir le certificat SSL

```bash
# Obtenir le certificat Let's Encrypt (gratuit, renouvelé auto)
docker compose run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  -d dawky.fr \
  -d www.dawky.fr \
  --email contact@dawky.fr \
  --agree-tos \
  --no-eff-email

# Succès = "Congratulations! Your certificate..."
```

### 5c. Activer le HTTPS

```bash
# Remettre la config avec SSL
cp nginx/nginx.conf.backup nginx/nginx.conf

# Redémarrer nginx
docker compose restart nginx

# Vérifier
curl -I https://dawky.fr
# Doit retourner HTTP/2 200
```

🎉 **Votre site est en ligne sur https://dawky.fr**

---

## ÉTAPE 6 — Déploiement automatique

À partir de maintenant, **chaque push sur `main` déploie automatiquement** :

```bash
# Sur votre machine locale
git add .
git commit -m "Mise à jour du site"
git push origin main

# → GitHub Actions se déclenche
# → L'image Docker est buildée (~3 min)
# → Déployée sur le VPS (~30 sec)
# → Votre site est mis à jour sans coupure
```

Suivez la progression dans :
→ GitHub → votre dépôt → **Actions** (onglet)

---

## Variables d'environnement (.env.production)

```env
# Base de données Supabase
DATABASE_URL="postgresql://postgres.XXXX:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres.XXXX:MOT_DE_PASSE@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Supabase Auth
SUPABASE_URL="https://XXXX.supabase.co"
SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_KEY="eyJ..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="Dawky <contact@dawky.fr>"
EMAIL_REPLY_TO="contact@dawky.fr"

# App
APP_URL="https://dawky.fr"
NODE_ENV="production"
```

---

## Commandes utiles au quotidien

```bash
# Se connecter au VPS
ssh root@IP_VOTRE_VPS

# Se placer dans le dossier
cd /opt/dawky

# Voir l'état des containers
docker compose ps

# Voir les logs de l'app en temps réel
docker compose logs -f app

# Voir les logs nginx
docker compose logs -f nginx

# Redémarrer manuellement l'app
docker compose restart app

# Mettre à jour manuellement (sans push)
docker pull ghcr.io/VOTRE_USERNAME/dawky:latest
docker compose up -d app

# Arrêter tout
docker compose down

# Voir l'espace disque utilisé par Docker
docker system df
```

---

## Première utilisation — Base de données

La base de données est chez Supabase, pas sur le VPS.
Donc les commandes Prisma se font depuis votre machine locale :

```bash
# Sur votre machine locale (avec le .env rempli)
npm run db:push   # Applique le schéma
npm run db:seed   # Remplit avec les données initiales

# Pour créer un compte Admin :
# 1. Inscrivez-vous sur https://dawky.fr/connexion
# 2. Supabase Dashboard → Table Editor → clients
# 3. Trouvez votre email → changez role = "ADMIN"
# 4. Sur votre profil → cliquez "Actualiser le rôle"
```

---

## En cas de problème

### L'app ne démarre pas
```bash
docker compose logs app
# Lisez les erreurs — souvent un .env.production incomplet
```

### Nginx retourne 502
```bash
# L'app n'est pas encore prête
docker compose logs app --tail 20
# Attendez que vous voyiez "Nuxt ready"
```

### Certificat SSL expiré
```bash
# Normalement auto-renouvelé, mais si besoin :
docker compose run --rm certbot renew
docker compose restart nginx
```

### Voir ce qui tourne sur le VPS
```bash
docker compose ps
# dawky-app      ← votre site
# dawky-nginx    ← reverse proxy + SSL
# dawky-certbot  ← renouvellement SSL auto
```
