const User = require('../models/User');
const Property = require('../models/Property');
const Booking = require('../models/Booking');
const Review = require('../models/Review');

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (admin)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers, totalProperties, totalBookings, totalRevenue,
      recentBookings, recentUsers, bookingsByStatus,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { status: { $in: ['confirmed', 'completed'] } } },
        { $group: { _id: null, total: { $sum: '$pricing.totalPrice' } } },
      ]),
      Booking.find().populate('property', 'title').populate('guest', 'name email').sort('-createdAt').limit(5),
      User.find().sort('-createdAt').limit(5).select('name email role avatar createdAt'),
      Booking.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalBookings,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentBookings,
        recentUsers,
        bookingsByStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
      ];
    }

    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id
// @access  Private (admin)
exports.updateUser = async (req, res, next) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (admin)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (admin)
// @route   GET /api/admin/bookings
// @access  Private (admin)
exports.getAllBookings = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('property', 'title images location')
        .populate('guest', 'name email avatar')
        .populate('host', 'name email')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      totalPages: Math.ceil(total / limit),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all properties (admin)
// @route   GET /api/admin/properties
// @access  Private (admin)
exports.getAllProperties = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$text = { $search: search };

    const skip = (page - 1) * limit;
    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('host', 'name email avatar')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle property featured status
// @route   PUT /api/admin/properties/:id/feature
// @access  Private (admin)
exports.toggleFeatured = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    property.isFeatured = !property.isFeatured;
    await property.save();

    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};
