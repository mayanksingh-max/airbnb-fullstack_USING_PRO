const Wishlist = require('../models/Wishlist');
const Property = require('../models/Property');

// @desc    Get user wishlist
// @route   GET /api/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user.id }).populate({
      path: 'properties',
      populate: { path: 'host', select: 'name avatar' },
    });

    if (!wishlist) {
      wishlist = { user: req.user.id, properties: [] };
    }

    res.status(200).json({ success: true, wishlist });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle property in wishlist
// @route   POST /api/wishlist/:propertyId
// @access  Private
exports.toggleWishlist = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    let wishlist = await Wishlist.findOne({ user: req.user.id });

    if (!wishlist) {
      wishlist = await Wishlist.create({
        user: req.user.id,
        properties: [req.params.propertyId],
      });
      return res.status(200).json({ success: true, message: 'Added to wishlist', saved: true });
    }

    const isInWishlist = wishlist.properties.includes(req.params.propertyId);

    if (isInWishlist) {
      wishlist.properties = wishlist.properties.filter(
        (id) => id.toString() !== req.params.propertyId
      );
      await wishlist.save();
      return res.status(200).json({ success: true, message: 'Removed from wishlist', saved: false });
    } else {
      wishlist.properties.push(req.params.propertyId);
      await wishlist.save();
      return res.status(200).json({ success: true, message: 'Added to wishlist', saved: true });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Check if property is in wishlist
// @route   GET /api/wishlist/check/:propertyId
// @access  Private
exports.checkWishlist = async (req, res, next) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id });
    const saved = wishlist ? wishlist.properties.includes(req.params.propertyId) : false;
    res.status(200).json({ success: true, saved });
  } catch (error) {
    next(error);
  }
};
