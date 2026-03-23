const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

const {
  listMyFavorites,
  addFavorite,
  removeFavorite,
} = require("../controllers/favorite.controller");

router.get("/", authMiddleware, listMyFavorites);
router.post("/", authMiddleware, addFavorite);
router.delete("/:id", authMiddleware, removeFavorite);

module.exports = router;