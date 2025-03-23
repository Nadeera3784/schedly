const User = require('../models/user.model');
const Calendar = require('../models/calendar.model');
const Booking = require('../models/booking.model');
const { validationResult } = require('express-validator');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
  try {
    // Get all users
    const users = await User.find().select('-password');
    
    // Get calendar counts for each user
    const usersWithCalendarCount = await Promise.all(
      users.map(async (user) => {
        const calendarsCount = await Calendar.countDocuments({ user: user._id });
        return {
          ...user.toObject(),
          calendarsCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: usersWithCalendarCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ID
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    
    const { name, email, password, role } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'user'
    });
    
    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    // Find user
    let user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user
    user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).select('-password');
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    
    // Check if error is due to invalid ID
    if (err.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    // Find user
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }
    
    // Delete user and all their data
    await Promise.all([
      user.deleteOne(),
      // Find user's calendars
      Calendar.find({ user: req.params.id }).then(calendars => {
        // Delete all bookings for each calendar
        const calendarIds = calendars.map(calendar => calendar._id);
        return Booking.deleteMany({ calendar: { $in: calendarIds } });
      }),
      // Delete all calendars
      Calendar.deleteMany({ user: req.params.id })
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
        message: 'User not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Get all calendars
// @route   GET /api/admin/calendars
// @access  Private/Admin
exports.getCalendars = async (req, res) => {
  try {
    const calendars = await Calendar.find().populate({
      path: 'user',
      select: 'name email'
    });
    
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

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate({
        path: 'calendar',
        select: 'name publicId',
        populate: {
          path: 'user',
          select: 'name email'
        }
      })
      .sort({ date: -1 });
    
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

// @desc    Get admin statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalCalendars,
      totalBookings,
      pendingBookings,
      recentBookings,
      userStats,
      calendarStats
    ] = await Promise.all([
      User.countDocuments(),
      Calendar.countDocuments(),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate({
          path: 'calendar',
          select: 'name',
          populate: {
            path: 'user',
            select: 'name email'
          }
        }),
      // Get user registration stats for the last 7 days
      User.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      // Get booking stats for the last 7 days
      Booking.aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalCalendars,
        totalBookings,
        pendingBookings,
        recentBookings,
        userStats,
        calendarStats
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
}; 