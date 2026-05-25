const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, updateUser, deleteUser,
  getAllBookings, getAllProperties, toggleFeatured,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');

// All admin routes require authentication + admin role
router.use(protect, authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.get('/bookings', getAllBookings);
router.get('/properties', getAllProperties);
router.put('/properties/:id/feature', toggleFeatured);

module.exports = router;
