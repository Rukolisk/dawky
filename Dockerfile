# ─── Étape 1 : Build ────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Copier les fichiers de dépendances en premier (cache Docker)
COPY package*.json ./
COPY prisma/ ./prisma/

# Installer les dépendances
RUN npm ci --silent

# Copier le reste du code
COPY . .

ARG NUXT_PUBLIC_SUPABASE_URL
ARG NUXT_PUBLIC_SUPABASE_KEY
ENV NUXT_PUBLIC_SUPABASE_URL=$NUXT_PUBLIC_SUPABASE_URL
ENV NUXT_PUBLIC_SUPABASE_KEY=$NUXT_PUBLIC_SUPABASE_KEY
# Générer le client Prisma et builder Nuxt
RUN npx prisma generate
RUN npm run build

# ─── Étape 2 : Image de production légère ───────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S dawky && adduser -S dawky -G dawky

# Copier uniquement ce qui est nécessaire au runtime
COPY --from=builder /app/.output           ./.output
COPY --from=builder /app/prisma            ./prisma
COPY --from=builder /app/package.json      ./package.json
COPY --from=builder /app/node_modules      ./node_modules

# Donner les droits à l'utilisateur dawky
RUN chown -R dawky:dawky /app
USER dawky

EXPOSE 3000

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

CMD ["node", ".output/server/index.mjs"]
