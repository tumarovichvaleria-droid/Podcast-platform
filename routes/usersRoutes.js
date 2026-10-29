const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, isAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, isAdmin, userController.getAllUsers);
router.get('/:id', authenticateToken, userController.getUserById);
router.post('/', authenticateToken, isAdmin, userController.createUser);
router.delete('/:id', authenticateToken, isAdmin, userController.deleteUser);
router.put('/:id', authenticateToken, isAdmin, userController.updateUser);
router.patch('/:id', authenticateToken, isAdmin, userController.patchUser);
module.exports = router;