# ── Build stage ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Monorepo : copier le lock file racine + les package.json des workspaces
COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY prisma ./prisma/

RUN npm ci --workspace=backend
# Installe toutes les deps (prisma CLI requis pour generate)
RUN npm ci

RUN cd backend && npx prisma generate
# Génère le client Prisma (au cas où postinstall ne suffit pas)
RUN npx prisma generate

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

# Utilisateur non-root pour la sécurité
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY package*.json ./
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY prisma ./prisma/

RUN npm ci --workspace=backend --omit=dev && cd backend && npx prisma generate
# Uniquement les deps de prod
RUN npm ci --omit=dev && npx prisma generate

COPY backend/src ./backend/src/
COPY src ./src/

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "src/server.js"]
CMD ["node", "backend/src/server.js"]
