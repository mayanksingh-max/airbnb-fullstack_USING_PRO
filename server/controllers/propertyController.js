const Property = require('../models/Property');
const Booking = require('../models/Booking');
const APIFeatures = require('../utils/apiFeatures');
const cloudinary = require('../config/cloudinary');

// @desc    Get all properties with filtering, sorting, pagination
// @route   GET /api/properties
// @access  Public
exports.getProperties = async (req, res, next) => {
  try {
    let query = Property.find({ isAvailable: true }).populate('host', 'name avatar');

    // Build filter query
    const filter = { isAvailable: true };

    if (req.query.category) filter.category = req.query.category;
    if (req.query.minPrice || req.query.maxPrice) {
      filter.pricePerNight = {};
      if (req.query.minPrice) filter.pricePerNight.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.pricePerNight.$lte = Number(req.query.maxPrice);
    }
    if (req.query.minRating) filter.ratings = { $gte: Number(req.query.minRating) };
    if (req.query.guests) filter.maxGuests = { $gte: Number(req.query.guests) };

    // Location search
    if (req.query.location) {
      const locationRegex = new RegExp(req.query.location, 'i');
      filter.$or = [
        { 'location.city': locationRegex },
        { 'location.country': locationRegex },
        { 'location.state': locationRegex },
      ];
    }

    // Text search on title/description
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    // Availability filter
    if (req.query.checkIn && req.query.checkOut) {
      const checkIn = new Date(req.query.checkIn);
      const checkOut = new Date(req.query.checkOut);

      const bookedPropertyIds = await Booking.find({
        status: { $in: ['confirmed', 'pending'] },
        $or: [
          { checkIn: { $lt: checkOut }, checkOut: { $gt: checkIn } },
        ],
      }).distinct('property');

      filter._id = { $nin: bookedPropertyIds };
    }

    // Sort
    let sortOption = '-createdAt';
    if (req.query.sort === 'price_asc') sortOption = 'pricePerNight';
    if (req.query.sort === 'price_desc') sortOption = '-pricePerNight';
    if (req.query.sort === 'rating') sortOption = '-ratings';
    if (req.query.sort === 'newest') sortOption = '-createdAt';

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const skip = (page - 1) * limit;

    const [properties, total] = await Promise.all([
      Property.find(filter)
        .populate('host', 'name avatar')
        .sort(sortOption)
        .skip(skip)
        .limit(limit),
      Property.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: properties.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      properties,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single property
// @route   GET /api/properties/:id
// @access  Public
exports.getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('host', 'name avatar bio phone createdAt');

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current host's listings
// @route   GET /api/properties/my-listings
// @access  Private (host/admin)
exports.getMyListings = async (req, res, next) => {
  try {
    const properties = await Property.find({ host: req.user.id }).sort('-createdAt');
    res.status(200).json({ success: true, count: properties.length, properties });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
exports.getFeaturedProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({ isAvailable: true, isFeatured: true })
      .populate('host', 'name avatar')
      .sort('-ratings')
      .limit(8);
    res.status(200).json({ success: true, properties });
  } catch (error) {
    next(error);
  }
};

// @desc    Create property
// @route   POST /api/properties
// @access  Private (host/admin)
exports.createProperty = async (req, res, next) => {
  try {
    const {
      title, description, category, location, pricePerNight,
      amenities, maxGuests, bedrooms, bathrooms, beds, cleaningFee, serviceFee,
    } = req.body;

    // Handle uploaded images
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
      }));
    }

    if (images.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one property image is required' });
    }

    // Parse location if sent as JSON string
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
    const parsedAmenities = typeof amenities === 'string' ? JSON.parse(amenities) : (amenities || []);

    const property = await Property.create({
      title,
      description,
      category,
      location: parsedLocation,
      pricePerNight: Number(pricePerNight),
      images,
      amenities: parsedAmenities,
      maxGuests: Number(maxGuests),
      bedrooms: Number(bedrooms),
      bathrooms: Number(bathrooms),
      beds: Number(beds) || 1,
      cleaningFee: Number(cleaningFee) || 0,
      serviceFee: Number(serviceFee) || 0,
      host: req.user.id,
    });

    await property.populate('host', 'name avatar');

    // Update user role to host if needed
    if (req.user.role === 'user') {
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, { role: 'host' });
    }

    res.status(201).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (owner/admin)
exports.updateProperty = async (req, res, next) => {
  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    // Authorization check
    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this property' });
    }

    const updateData = { ...req.body };

    // Parse JSON strings if needed
    if (typeof updateData.location === 'string') updateData.location = JSON.parse(updateData.location);
    if (typeof updateData.amenities === 'string') updateData.amenities = JSON.parse(updateData.amenities);

    // Handle new image uploads
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((file) => ({
        public_id: file.filename,
        url: file.path,
      }));
      updateData.images = [...property.images, ...newImages];
    }

    property = await Property.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).populate('host', 'name avatar');

    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property image
// @route   DELETE /api/properties/:id/images/:publicId
// @access  Private (owner/admin)
exports.deletePropertyImage = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const publicId = decodeURIComponent(req.params.publicId);
    await cloudinary.uploader.destroy(publicId);

    property.images = property.images.filter((img) => img.public_id !== publicId);
    await property.save();

    res.status(200).json({ success: true, property });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (owner/admin)
exports.deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.host.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this property' });
    }

    // Delete images from Cloudinary
    for (const image of property.images) {
      if (image.public_id) {
        await cloudinary.uploader.destroy(image.public_id);
      }
    }

    await property.deleteOne();

    res.status(200).json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    next(error);
  }
};
