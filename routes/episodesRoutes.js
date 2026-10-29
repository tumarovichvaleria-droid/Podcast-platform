const express = require('express');
const router = express.Router();
const episodeController = require('../controllers/episodeController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

// Публичные маршруты
router.get('/', episodeController.getAllEpisodes);
router.get('/:id', episodeController.getEpisodeById);

// Защищенные маршруты (доступны только администратору)
router.post('/', authenticateToken, isAdmin, episodeController.createEpisode);
router.delete('/:id', authenticateToken, isAdmin, episodeController.deleteEpisode);
router.post('/:id/listen', episodeController.incrementListen);
router.put('/:id', episodeController.updateEpisode);
router.patch('/:id', episodeController.patchEpisode);
module.exports = router;




