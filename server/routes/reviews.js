const express = require('express');
const router = express.Router();
const { addReview, getPropertyReviews, updateReview, deleteReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:propertyId', getPropertyReviews);
router.post('/:propertyId', protect, addReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
