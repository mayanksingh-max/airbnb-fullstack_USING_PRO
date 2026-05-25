const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Property',
      required: [true, 'Property is required'],
    },
    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Guest is required'],
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Host is required'],
    },
    checkIn: {
      type: Date,
      required: [true, 'Check-in date is required'],
    },
    checkOut: {
      type: Date,
      required: [true, 'Check-out date is required'],
    },
    guests: {
      adults: { type: Number, default: 1, min: 1 },
      children: { type: Number, default: 0, min: 0 },
      infants: { type: Number, default: 0, min: 0 },
    },
    pricing: {
      pricePerNight: { type: Number, required: true },
      nights: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
      totalPrice: { type: Number, required: true },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'confirmed',
    },
    cancellationReason: { type: String, default: '' },
    specialRequests: { type: String, maxlength: 500, default: '' },
  },
  { timestamps: true }
);

// Validate checkOut is after checkIn
BookingSchema.pre('save', function (next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

module.exports = mongoose.model('Booking', BookingSchema);
