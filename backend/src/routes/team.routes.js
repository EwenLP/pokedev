const express = require("express");
const router = express.Router();

const { listMyTeams, createTeam } = require("../controllers/team.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, listMyTeams);
router.post("/", authMiddleware, createTeam);

module.exports = router;
