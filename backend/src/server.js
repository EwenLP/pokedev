const express = require("express");
const cors = require("cors");
const path = require("path"); // <-- L'import de 'path' est bien en haut
require("dotenv").config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes')
const teamRoutes = require('./routes/team.routes');
const favoriteRoutes = require("./routes/favorite.routes");

const app = express();

app.use(cors());
app.use(express.json());

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
app.use("/api/*", (req, res) => {
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
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ==========================================
// 3. LANCEMENT DU SERVEUR
// ==========================================
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});