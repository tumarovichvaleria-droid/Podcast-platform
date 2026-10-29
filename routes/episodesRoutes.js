const express = require("express");
const router = express.Router();
const episodesController = require("../controllers/episodesController");

// Укажите корректный путь к вашим middleware аутентификации
const { authenticateToken, isAdmin } = require("../middleware/auth"); 

// Пути указываются относительно "/episodes"
router.get("/", episodesController.getAllEpisodes);
router.get("/:id", episodesController.getEpisodeById);
router.post("/", authenticateToken, isAdmin, episodesController.createEpisode);
router.put("/:id", authenticateToken, isAdmin, episodesController.updateEpisode);
router.patch("/:id", authenticateToken, isAdmin, episodesController.patchEpisode); // <-- Новая строчка
router.delete("/:id", authenticateToken, isAdmin, episodesController.deleteEpisode);
router.post("/:id/listen", episodesController.listenEpisode);

module.exports = router;