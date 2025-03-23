const express = require('express');
const { check } = require('express-validator');
const { 
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getCalendars,
  getBookings,
  getStats
} = require('../controllers/admin.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { validateCreateUser } = require('../middleware/validators');

const router = express.Router();

// Apply protect and admin role authorization to all routes
router.use(protect);
router.use(authorize('admin'));

// User routes
router.route('/users')
  .get(getUsers)
  .post(validateCreateUser, createUser);

router.route('/users/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

// Calendar routes
router.get('/calendars', getCalendars);

// Booking routes
router.get('/bookings', getBookings);

// Stats route
router.route('/stats').get(getStats);

module.exports = router; 