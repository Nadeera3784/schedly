const Calendar = require('../models/calendar.model');
const Booking = require('../models/booking.model');
const { validationResult } = require('express-validator');

// @desc    Create a new calendar
// @route   POST /api/calendars
// @access  Private
exports.createCalendar = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    // Add user to request body
    req.body.user = req.user.id;
    
    // Create calendar
    const calendar = await Calendar.create(req.body);
    
    res.status(201).json({
      success: true,
      data: calendar
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all calendars for current user
// @route   GET /api/calendars
// @access  Private
exports.getCalendars = async (req, res) => {
  try {
    // Find calendars for current user
    const calendars = await Calendar.find({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      count: calendars.length,
      data: calendars
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single calendar
// @route   GET /api/calendars/:id
// @access  Private
exports.getCalendar = async (req, res) => {
  try {
    // Find calendar by ID
    const calendar = await Calendar.findById(req.params.id);
    
    // Check if calendar exists
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
        message: 'Not authorized to access this calendar'
      });
    }
    
    res.status(200).json({
      success: true,
      data: calendar
    });
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ID
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update calendar
// @route   PUT /api/calendars/:id
// @access  Private
exports.updateCalendar = async (req, res) => {
  try {
    // Find calendar by ID
    let calendar = await Calendar.findById(req.params.id);
    
    // Check if calendar exists
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
        message: 'Not authorized to update this calendar'
      });
    }
    
    // Update calendar
    calendar = await Calendar.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      success: true,
      data: calendar
    });
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ID
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete calendar
// @route   DELETE /api/calendars/:id
// @access  Private
exports.deleteCalendar = async (req, res) => {
  try {
    // Find calendar by ID
    const calendar = await Calendar.findById(req.params.id);
    
    // Check if calendar exists
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
        message: 'Not authorized to delete this calendar'
      });
    }
    
    // Delete calendar and associated bookings
    await Promise.all([
      calendar.deleteOne(),
      Booking.deleteMany({ calendar: req.params.id })
    ]);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ID
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get calendar by public ID
// @route   GET /api/calendars/public/:publicId
// @access  Public
exports.getPublicCalendar = async (req, res) => {
  try {
    // Find calendar by public ID
    const calendar = await Calendar.findOne({ publicId: req.params.publicId });
    
    // Check if calendar exists
    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: calendar
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get available slots for a calendar on a specific date
// @route   GET /api/calendars/:id/available-slots
// @access  Public
exports.getAvailableSlots = async (req, res) => {
  try {
    // Get date from query params
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a date'
      });
    }
    
    // Find calendar by ID or public ID
    const calendar = await Calendar.findOne({
      $or: [
        { _id: req.params.id },
        { publicId: req.params.id }
      ]
    });
    
    // Check if calendar exists
    if (!calendar) {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found'
      });
    }
    
    // Check if date is disabled
    const targetDate = new Date(date);
    const isDateDisabled = calendar.disabledDates.some(disabledDate => 
      new Date(disabledDate).toDateString() === targetDate.toDateString()
    );
    
    if (isDateDisabled) {
      return res.status(200).json({
        success: true,
        availableSlots: []
      });
    }
    
    // Check if day of week is available
    const dayOfWeek = targetDate.getDay(); // 0-6 (Sunday-Saturday)
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    // Convert available days to numbers for consistent comparison
    const availableDaysAsNumbers = calendar.availableDays.map(day => Number(day));
    
    if (!availableDaysAsNumbers.includes(dayOfWeek)) {
      console.log(`[Available Slots] Day ${dayOfWeek} (${dayNames[dayOfWeek]}) not available`);
      return res.status(200).json({
        success: true,
        data: [],
        message: `This day (${dayNames[dayOfWeek]}) is not available for booking. Available days are: ${availableDaysAsNumbers.map(dayIndex => dayNames[dayIndex]).join(', ')}`
      });
    }
    
    // Generate all possible time slots
    const { start, end } = calendar.availableHours;
    const slotDuration = calendar.slotDuration;
    const allSlots = [];
    
    for (let hour = start; hour < end; hour++) {
      // Calculate how many slots in this hour
      const slotsInHour = 60 / slotDuration;
      
      for (let i = 0; i < slotsInHour; i++) {
        const minutes = i * slotDuration;
        // Only add slot if it fits completely within the available hours
        if (hour + (minutes + slotDuration) / 60 <= end) {
          allSlots.push({
            startTime: hour + (minutes / 60),
            endTime: hour + ((minutes + slotDuration) / 60)
          });
        }
      }
    }
    
    // Find existing bookings for this date
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
    
    const bookings = await Booking.find({
      calendar: calendar._id,
      date: { $gte: startOfDay, $lte: endOfDay },
      status: 'confirmed'
    });
    
    // Filter out booked slots
    const bookedTimes = bookings.map(booking => ({
      startTime: booking.startTime,
      endTime: booking.endTime
    }));
    
    const availableSlots = allSlots.filter(slot => {
      return !bookedTimes.some(bookedTime => 
        (slot.startTime === bookedTime.startTime) || 
        (slot.startTime < bookedTime.endTime && slot.endTime > bookedTime.startTime)
      );
    });
    
    res.status(200).json({
      success: true,
      data: availableSlots
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 