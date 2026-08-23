const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require('../controllers/adminController');

router.use(protect, admin); // All admin routes require admin access

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUserRole);
router.delete('/users/:id', deleteUser);

module.exports = router;
