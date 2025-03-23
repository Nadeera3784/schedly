const express = require('express');
const { check } = require('express-validator');
const { 
  createCalendar, 
  getCalendars, 
  getCalendar, 
  updateCalendar, 
  deleteCalendar,
  getPublicCalendar,
  getAvailableSlots
} = require('../controllers/calendar.controller');
const { protect } = require('../middleware/auth.middleware');

const router = express.Router();

// Public routes
router.get('/public/:publicId', getPublicCalendar);
router.get('/:id/available-slots', getAvailableSlots);

// Protected routes
router.route('/')
  .get(protect, getCalendars)
  .post(protect, [
    check('name', 'Calendar name is required').not().isEmpty()
  ], createCalendar);

router.route('/:id')
  .get(protect, getCalendar)
  .put(protect, updateCalendar)
  .delete(protect, deleteCalendar);

module.exports = router; 