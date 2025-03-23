const express = require('express');
const { check } = require('express-validator');
const { 
  createBooking, 
  getCalendarBookings, 
  getUserBookings, 
  cancelBooking 
} = require('../controllers/booking.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public booking route
router.post('/', [
  check('calendar', 'Calendar ID is required').not().isEmpty(),
  check('date', 'Date is required').isISO8601().toDate(),
  check('startTime', 'Start time is required').isNumeric(),
  check('endTime', 'End time is required').isNumeric(),
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Valid email is required').isEmail()
], createBooking);

// Protected routes
router.get('/', protect, getUserBookings);
router.get('/calendar/:id', protect, getCalendarBookings);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router; 