const express = require("express");
const router = express.Router();
const podcastsController = require("../controllers/podcastsController");

// Middleware для проверки аутентификации и прав администратора
const { authenticateToken, isAdmin } = require("../middleware/auth");

// Публичные маршруты (доступны всем)
router.get("/", podcastsController.getAllPodcasts);
router.get("/:id", podcastsController.getPodcastById);

// Защищенные маршруты (только для администраторов)
router.post("/", authenticateToken, isAdmin, podcastsController.createPodcast);
router.put("/:id", authenticateToken, isAdmin, podcastsController.updatePodcast);
router.patch("/:id", authenticateToken, isAdmin, podcastsController.patchPodcast);
router.delete("/:id", authenticateToken, isAdmin, podcastsController.deletePodcast);

module.exports = router;