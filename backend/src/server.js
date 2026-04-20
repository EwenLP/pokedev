const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
require("dotenv").config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes')
const teamRoutes = require('./routes/team.routes');
const favoriteRoutes = require("./routes/favorite.routes");

const app = express();

// Sécurité : headers HTTP
app.use(helmet());

// Sécurité : CORS
const corsOrigin = process.env.CLIENT_URL || (process.env.NODE_ENV === "production" ? undefined : "http://localhost:5173");
if (!corsOrigin) {
  throw new Error("CLIENT_URL est requis en production.");
}
app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Sécurité : limite la taille des requêtes
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Sécurité : rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de requêtes, réessayez plus tard." },
});
app.use("/api/", globalLimiter);

// Sécurité : rate limiting strict sur l'auth
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Trop de tentatives, réessayez dans 15 minutes." },
});
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// ==========================================
// 1. TES ROUTES API (Backend)
// ==========================================

// J'ai changé '/' en '/api' pour que ton API ne bloque pas l'affichage de React sur l'accueil
app.get("/api", (req, res) => {
  res.status(200).json({
    message: "API Pokebuild opérationnelle.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/favorites", favoriteRoutes);

// Gestion des erreurs 404 UNIQUEMENT pour les routes qui commencent par /api/
app.use("/api/:path", (req, res) => {
  res.status(404).json({
    message: "Route API introuvable.",
  });
});

// ==========================================
// 2. TON FRONTEND REACT
// ==========================================

// On dit à Express de servir les fichiers statiques du dossier "public" (générés par le Dockerfile)
app.use(express.static(path.join(__dirname, '../public')));

// Gère le React Router : pour toutes les autres requêtes (qui ne sont pas des /api), on affiche ton site React
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==========================================
// 3. LANCEMENT DU SERVEUR
// ==========================================
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});