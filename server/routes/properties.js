const express = require('express');
const router = express.Router();
const {
  getProperties, getProperty, getMyListings, getFeaturedProperties,
  createProperty, updateProperty, deleteProperty, deletePropertyImage,
} = require('../controllers/propertyController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roles');
const { uploadPropertyImages } = require('../middleware/upload');

// Public routes
router.get('/', getProperties);
router.get('/featured', getFeaturedProperties);
router.get('/my-listings', protect, getMyListings);
router.get('/:id', getProperty);

// Protected routes
router.post('/', protect, uploadPropertyImages, createProperty);
router.put('/:id', protect, uploadPropertyImages, updateProperty);
router.delete('/:id/images/:publicId', protect, deletePropertyImage);
router.delete('/:id', protect, deleteProperty);

module.exports = router;
