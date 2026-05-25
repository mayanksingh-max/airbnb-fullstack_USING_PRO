const Booking = require('../models/Booking');
const Property = require('../models/Property');

// Helper: calculate nights between two dates
const calcNights = (checkIn, checkOut) => {
  return Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24));
};

// Helper: check for booking conflicts
const hasConflict = async (propertyId, checkIn, checkOut, excludeBookingId = null) => {
  const query = {
    property: propertyId,
    status: { $in: ['confirmed', 'pending'] },
    $or: [
      { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } },
    ],
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(query);
  return !!conflict;
};

// @desc    Create booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const { propertyId, checkIn, checkOut, guests, specialRequests } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (!property.isAvailable) {
      return res.status(400).json({ success: false, message: 'Property is not available for booking' });
    }

    // Prevent host from booking their own property
    if (property.host.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot book your own property' });
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkInDate < today) {
      return res.status(400).json({ success: false, message: 'Check-in date cannot be in the past' });
    }
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out must be after check-in' });
    }

    // Check for conflicts
    const conflict = await hasConflict(propertyId, checkIn, checkOut);
    if (conflict) {
      return res.status(409).json({
        success: false,
        message: 'Property is already booked for the selected dates',
      });
    }

    // Validate guest count
    const totalGuests = (guests?.adults || 1) + (guests?.children || 0);
    if (totalGuests > property.maxGuests) {
      return res.status(400).json({
        success: false,
        message: `This property accommodates maximum ${property.maxGuests} guests`,
      });
    }

    // Calculate pricing
    const nights = calcNights(checkIn, checkOut);
    const subtotal = property.pricePerNight * nights;
    const cleaningFee = property.cleaningFee || 0;
    const serviceFee = Math.round(subtotal * 0.12); // 12% service fee
    const totalPrice = subtotal + cleaningFee + serviceFee;

    const booking = await Booking.create({
      property: propertyId,
      guest: req.user.id,
      host: property.host,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || { adults: 1, children: 0, infants: 0 },
      pricing: {
        pricePerNight: property.pricePerNight,
        nights,
        subtotal,
        cleaningFee,
        serviceFee,
        totalPrice,
      },
      specialRequests: specialRequests || '',
    });

    await booking.populate([
      { path: 'property', select: 'title images location pricePerNight' },
      { path: 'guest', select: 'name email avatar' },
    ]);

    res.status(201).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { guest: req.user.id };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [bookings, total] = await Promise.all([
      Booking.find(filter)
        .populate('property', 'title images location pricePerNight')
        .populate('host', 'name avatar')
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
      currentPage: Number(page),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get bookings for host's properties
// @route   GET /api/bookings/host-bookings
// @access  Private (host/admin)
exports.getHostBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ host: req.user.id })
      .populate('property', 'title images location')
      .populate('guest', 'name email avatar phone')
      .sort('-createdAt');

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('property', 'title images location pricePerNight host')
      .populate('guest', 'name email avatar phone')
      .populate('host', 'name email avatar phone');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only allow guest, host, or admin
    const isGuest = booking.guest._id.toString() === req.user.id;
    const isHost = booking.host._id.toString() === req.user.id;
    if (!isGuest && !isHost && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Only guest or admin can cancel
    if (booking.guest.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Cannot cancel a completed booking' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = req.body.reason || 'Cancelled by guest';
    await booking.save();

    res.status(200).json({ success: true, message: 'Booking cancelled successfully', booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Check property availability for dates
// @route   GET /api/bookings/availability/:propertyId
// @access  Public
exports.checkAvailability = async (req, res, next) => {
  try {
    const { checkIn, checkOut } = req.query;

    if (!checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: 'Please provide check-in and check-out dates' });
    }

    const conflict = await hasConflict(req.params.propertyId, checkIn, checkOut);

    res.status(200).json({
      success: true,
      available: !conflict,
      message: conflict ? 'Property is not available for selected dates' : 'Property is available',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booked dates for a property (for calendar blocking)
// @route   GET /api/bookings/booked-dates/:propertyId
// @access  Public
exports.getBookedDates = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      property: req.params.propertyId,
      status: { $in: ['confirmed', 'pending'] },
      checkOut: { $gte: new Date() },
    }).select('checkIn checkOut');

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    next(error);
  }
};
