const express = require("express");
const router = express.Router();
const controller = require("../controllers/usersController");
const { authenticateToken, isAdmin } = require("../middleware/auth");

router.get("/", authenticateToken, isAdmin, controller.getAllUsers);
router.get("/:id", authenticateToken, isAdmin, controller.getUserById);
router.post("/", authenticateToken, isAdmin, controller.createUser);
router.put("/:id", authenticateToken, isAdmin, controller.updateUser);
router.patch("/:id", authenticateToken, isAdmin, controller.patchUser);
router.delete("/:id", authenticateToken, isAdmin, controller.deleteUser);

module.exports = router;