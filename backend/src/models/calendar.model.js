const mongoose = require('mongoose');
const crypto = require('crypto');

const CalendarSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a calendar name'],
    trim: true,
    maxlength: [100, 'Name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  publicId: {
    type: String,
    unique: true
  },
  availableDays: {
    type: [Number],
    default: [1, 2, 3, 4, 5] // Monday to Friday by default (0 = Sunday, 1 = Monday, etc.)
  },
  availableHours: {
    start: {
      type: Number,
      default: 9 // 9 AM
    },
    end: {
      type: Number,
      default: 17 // 5 PM
    }
  },
  slotDuration: {
    type: Number,
    default: 60, // Duration in minutes
    enum: [15, 30, 45, 60, 90, 120]
  },
  disabledDates: [{
    type: Date
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique public ID for calendar before saving
CalendarSchema.pre('save', function(next) {
  if (!this.publicId) {
    this.publicId = crypto.randomBytes(10).toString('hex');
  }
  next();
});

module.exports = mongoose.model('Calendar', CalendarSchema); 