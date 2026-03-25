# ==========================================
# ÉTAPE 1 : Build du Frontend (React)
# ==========================================
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend

# Copie des fichiers de configuration et installation
COPY frontend/package*.json ./
RUN npm install

# Copie du code et build de l'application
COPY frontend/ ./
RUN npm run build


# ==========================================
# ÉTAPE 2 : Setup du Backend et de l'environnement final
# ==========================================
FROM node:18-alpine
WORKDIR /app/backend

# Copie des fichiers de configuration et installation
COPY backend/package*.json ./
RUN npm install

# Copie de tout le code du backend
COPY backend/ ./

# Génération du client Prisma (Requis pour la BDD)
RUN npx prisma generate

# On récupère le build React de l'étape 1 pour le mettre dans un dossier "public"
COPY --from=frontend-builder /app/frontend/dist ./public

# On expose le port sur lequel Express écoute
EXPOSE 3000

# Commande pour démarrer le serveur
CMD ["node", "src/server.js"]