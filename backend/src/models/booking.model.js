const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  calendar: {
    type: mongoose.Schema.ObjectId,
    ref: 'Calendar',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Please specify a date']
  },
  startTime: {
    type: Number,
    required: [true, 'Please specify a start time']
  },
  endTime: {
    type: Number,
    required: [true, 'Please specify an end time']
  },
  name: {
    type: String,
    required: [true, 'Please add your name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add your email'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled'],
    default: 'confirmed'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent users from booking the same time slot
BookingSchema.index({ calendar: 1, date: 1, startTime: 1, status: 1 }, { unique: true });

module.exports = mongoose.model('Booking', BookingSchema); 