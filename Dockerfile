# ── Stage 1 : Build du frontend React ────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

# Injecté par Dokploy en Build Arg
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2 : Backend Express + frontend statique ─────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY backend/package*.json ./
COPY backend/prisma ./prisma/

RUN npm ci --omit=dev && npx prisma generate

COPY backend/src ./src/

# Le build React atterrit dans public/ → servi par Express (server.js)
COPY --from=frontend-builder /frontend/dist ./public/

USER appuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "src/server.js"]