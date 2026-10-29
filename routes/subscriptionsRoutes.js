const express = require("express");
const router = express.Router();
const controller = require("../controllers/subscriptionsController");
const { authenticateToken } = require("../middleware/auth"); 

// Авторизация должна быть подключена ко ВСЕМ эндпоинтам подписок:
router.get("/", authenticateToken, controller.getAllSubscriptions);
router.get("/:id", authenticateToken, controller.getSubscriptionById);
router.post("/", authenticateToken, controller.createSubscription);
router.put("/:id", authenticateToken, controller.updateSubscription);
router.patch("/:id", authenticateToken, controller.patchSubscription);
router.delete("/:id", authenticateToken, controller.deleteSubscription);

module.exports = router;