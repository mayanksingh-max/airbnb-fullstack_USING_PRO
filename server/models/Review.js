const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      minlength: [10, 'Comment must be at least 10 characters'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    categories: {
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      communication: { type: Number, min: 1, max: 5, default: 5 },
      checkIn: { type: Number, min: 1, max: 5, default: 5 },
      accuracy: { type: Number, min: 1, max: 5, default: 5 },
      location: { type: Number, min: 1, max: 5, default: 5 },
      value: { type: Number, min: 1, max: 5, default: 5 },
    },
  },
  { timestamps: true }
);

// One review per user per property
ReviewSchema.index({ property: 1, user: 1 }, { unique: true });

// Recalculate property average rating after save/delete
ReviewSchema.statics.calcAverageRating = async function (propertyId) {
  const stats = await this.aggregate([
    { $match: { property: propertyId } },
    {
      $group: {
        _id: '$property',
        avgRating: { $avg: '$rating' },
        nRating: { $sum: 1 },
      },
    },
  ]);

  const Property = require('./Property');
  if (stats.length > 0) {
    await Property.findByIdAndUpdate(propertyId, {
      ratings: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].nRating,
    });
  } else {
    await Property.findByIdAndUpdate(propertyId, { ratings: 0, reviewCount: 0 });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.property);
});

ReviewSchema.post('remove', function () {
  this.constructor.calcAverageRating(this.property);
});

module.exports = mongoose.model('Review', ReviewSchema);
