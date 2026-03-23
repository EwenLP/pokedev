const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes')
const teamRoutes = require('./routes/team.routes');
const favoriteRoutes = require("./routes/favorite.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({
    message: "API Pokebuild opérationnelle.",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/favorites", favoriteRoutes);

app.use((req, res) => {
  res.status(404).json({
    message: "Route introuvable.",
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});