const Booking = require('../models/booking.model');
const Calendar = require('../models/calendar.model');
const User = require('../models/user.model');
const { validationResult } = require('express-validator');
const { sendBookingNotification, sendBookingConfirmation } = require('../utils/emailSender');

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Public
exports.createBooking = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { calendar: calendarId, date, startTime, endTime, name, email, notes } = req.body;
    
    // Check if calendar exists
    const calendar = await Calendar.findOne({
      $or: [
        { _id: calendarId },
        { publicId: calendarId }
      ]
    });
    
    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    // Check if date is valid
    const bookingDate = new Date(date);
    const now = new Date();
    
    if (bookingDate < now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book a date in the past'
      });
    }
    
    // Check if date is disabled
    const isDateDisabled = calendar.disabledDates.some(disabledDate => 
      new Date(disabledDate).toDateString() === bookingDate.toDateString()
    );
    
    if (isDateDisabled) {
      return res.status(400).json({
        success: false,
        message: 'This date is not available for booking'
      });
    }
    
    // Check if day of week is available
    const dayOfWeek = bookingDate.getDay(); // 0-6 (Sunday-Saturday)
    
    // Log the available days and day of week for debugging
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    console.log(`Booking day of week: ${dayOfWeek} (${dayNames[dayOfWeek]})`);
    console.log(`Calendar available days before conversion:`, calendar.availableDays);
    
    // Convert available days to numbers for consistent comparison
    const availableDaysAsNumbers = calendar.availableDays.map(day => Number(day));
    console.log(`Calendar available days after conversion:`, availableDaysAsNumbers);
    console.log(`Is day available:`, availableDaysAsNumbers.includes(dayOfWeek));
    
    if (!availableDaysAsNumbers.includes(dayOfWeek)) {
      return res.status(400).json({
        success: false,
        message: `This day of week (${dayNames[dayOfWeek]}) is not available for booking. Available days are: ${availableDaysAsNumbers.map(dayIndex => dayNames[dayIndex]).join(', ')}`
      });
    }
    
    // Check if time slot is valid
    const { start, end } = calendar.availableHours;
    if (startTime < start || endTime > end) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is outside of available hours'
      });
    }
    
    // Check if slot is already booked
    const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(new Date(date).setHours(23, 59, 59, 999));
    
    const existingBooking = await Booking.findOne({
      calendar: calendar._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      startTime,
      status: 'confirmed'
    });
    
    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }
    
    // Create booking
    const booking = await Booking.create({
      calendar: calendar._id,
      date: bookingDate,
      startTime,
      endTime,
      name,
      email,
      notes
    });
    
    // Get calendar owner for email notification
    const owner = await User.findById(calendar.user);
    
    // Send email notifications
    try {
      await Promise.all([
        sendBookingNotification(booking, calendar, owner),
        sendBookingConfirmation(booking, calendar)
      ]);
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
      // Continue the booking process even if email fails
    }
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all bookings for a calendar
// @route   GET /api/bookings/calendar/:id
// @access  Private
exports.getCalendarBookings = async (req, res) => {
  try {
    // Check if calendar exists
    const calendar = await Calendar.findById(req.params.id);
    
    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    // Check if user owns the calendar
    if (calendar.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access these bookings'
      });
    }
    
    // Find bookings
    const bookings = await Booking.find({ calendar: req.params.id })
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all bookings for the authenticated user's calendars
// @route   GET /api/bookings
// @access  Private
exports.getUserBookings = async (req, res) => {
  try {
    // Find all calendars for user
    const calendars = await Calendar.find({ user: req.user.id });
    const calendarIds = calendars.map(calendar => calendar._id);
    
    // Find bookings for all calendars
    const bookings = await Booking.find({ calendar: { $in: calendarIds } })
      .populate('calendar')
      .sort({ date: 1, startTime: 1 });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Cancel a booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    // Find booking
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Find calendar to check ownership
    const calendar = await Calendar.findById(booking.calendar);
    
    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    // Check if user owns the calendar
    if (calendar.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Update booking status
    booking.status = 'cancelled';
    await booking.save();
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 