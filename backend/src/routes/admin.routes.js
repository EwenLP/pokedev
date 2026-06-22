const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/auth.middleware");
const roleMiddleware = require("../middlewares/role.middleware");

const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");

router.use(authMiddleware);
router.use(roleMiddleware("ADMIN"));
// En cours de développement
// router.get("/users", getAllUsers);
// router.get("/users/:id", getUserById);
// router.put("/users/:id", updateUser);
// router.delete("/users/:id", deleteUser);
router.get("/", (req, res) => {
  res.status(200).json({
    message: "Partie administration en cours de développement.",
  });
});

module.exports = router;