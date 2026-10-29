const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, subscriptionController.getSubscriptions);
router.get('/:id', authenticateToken, subscriptionController.getSubscriptionById);
router.post('/', authenticateToken, subscriptionController.createSubscription);
router.delete('/:id', authenticateToken, subscriptionController.deleteSubscription);
router.put('/:id', authenticateToken, subscriptionController.updateSubscription);
router.patch('/:id', authenticateToken, subscriptionController.patchSubscription);
module.exports = router;