const express = require("express");
const router = express.Router();

const { listMyTeams, createTeam, updateTeam, deleteTeam } = require("../controllers/team.controller");
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/me", authMiddleware, listMyTeams);
router.post("/", authMiddleware, createTeam);
router.put("/:id", authMiddleware, updateTeam);
router.delete("/:id", authMiddleware, deleteTeam);

module.exports = router;
