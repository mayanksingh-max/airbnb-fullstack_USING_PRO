const Review = require('../models/Review');
const Property = require('../models/Property');
const Booking = require('../models/Booking');

// @desc    Add review
// @route   POST /api/reviews/:propertyId
// @access  Private
exports.addReview = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Check if user has booked this property
    const hasBooking = await Booking.findOne({
      property: req.params.propertyId,
      guest: req.user.id,
      status: { $in: ['confirmed', 'completed'] },
    });

    if (!hasBooking && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You can only review properties you have booked',
      });
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      property: req.params.propertyId,
      user: req.user.id,
    });

    if (existingReview) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this property' });
    }

    const review = await Review.create({
      property: req.params.propertyId,
      user: req.user.id,
      booking: hasBooking?._id,
      rating: req.body.rating,
      comment: req.body.comment,
      categories: req.body.categories || {},
    });

    await review.populate('user', 'name avatar createdAt');

    res.status(201).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a property
// @route   GET /api/reviews/:propertyId
// @access  Public
exports.getPropertyReviews = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ property: req.params.propertyId })
        .populate('user', 'name avatar createdAt')
        .sort('-createdAt')
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ property: req.params.propertyId }),
    ]);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private (review owner)
exports.updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this review' });
    }

    review = await Review.findByIdAndUpdate(
      req.params.id,
      { rating: req.body.rating, comment: req.body.comment, categories: req.body.categories },
      { new: true, runValidators: true }
    ).populate('user', 'name avatar');

    // Recalculate property rating
    await Review.calcAverageRating(review.property);

    res.status(200).json({ success: true, review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private (owner/admin)
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const propertyId = review.property;
    await review.deleteOne();
    await Review.calcAverageRating(propertyId);

    res.status(200).json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    next(error);
  }
};
