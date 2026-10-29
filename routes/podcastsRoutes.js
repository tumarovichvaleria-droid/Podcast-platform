const express = require('express');
const router = express.Router();
const podcastController = require('../controllers/podcastController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', podcastController.getAllPodcasts);
router.get('/:id', podcastController.getPodcastById);

router.post('/', authenticateToken, isAdmin, podcastController.createPodcast);
router.put('/:id', authenticateToken, isAdmin, podcastController.updatePodcast);
router.patch('/:id', authenticateToken, isAdmin, podcastController.patchPodcast);
router.delete('/:id', authenticateToken, isAdmin, podcastController.deletePodcast);

module.exports = router;