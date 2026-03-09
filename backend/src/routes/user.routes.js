const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

router.get("/", authMiddleware, roleMiddleware("ADMIN"), getAllUsers);
router.get("/:id", authMiddleware, roleMiddleware("ADMIN"), getUserById);
router.put("/:id", authMiddleware, roleMiddleware("ADMIN"), updateUser);
router.delete("/:id", authMiddleware, roleMiddleware("ADMIN"), deleteUser);

module.exports = router;