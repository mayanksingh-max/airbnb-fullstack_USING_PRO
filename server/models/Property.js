const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['apartment', 'house', 'villa', 'cabin', 'beachfront', 'mountain', 'lake', 'desert', 'city', 'countryside'],
    },
    location: {
      address: { type: String, required: [true, 'Address is required'] },
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, default: '' },
      country: { type: String, required: [true, 'Country is required'] },
      zipCode: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 },
      },
    },
    pricePerNight: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [1, 'Price must be at least $1'],
    },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    amenities: {
      type: [String],
      enum: [
        'wifi', 'parking', 'pool', 'gym', 'kitchen', 'air_conditioning',
        'heating', 'washer', 'dryer', 'tv', 'workspace', 'pet_friendly',
        'smoking_allowed', 'bbq_grill', 'hot_tub', 'balcony', 'garden',
        'beach_access', 'mountain_view', 'fireplace',
      ],
      default: [],
    },
    maxGuests: { type: Number, required: [true, 'Max guests is required'], min: 1 },
    bedrooms: { type: Number, required: [true, 'Bedrooms is required'], min: 0 },
    bathrooms: { type: Number, required: [true, 'Bathrooms is required'], min: 0 },
    beds: { type: Number, default: 1, min: 1 },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ratings: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isAvailable: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    cleaningFee: { type: Number, default: 0 },
    serviceFee: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for geospatial/text search
PropertySchema.index({ 'location.city': 'text', 'location.country': 'text', title: 'text' });
PropertySchema.index({ pricePerNight: 1, ratings: -1 });

module.exports = mongoose.model('Property', PropertySchema);
