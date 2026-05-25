const express = require('express');
const router = express.Router();
const { getWishlist, toggleWishlist, checkWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getWishlist);
router.get('/check/:propertyId', checkWishlist);
router.post('/:propertyId', toggleWishlist);

module.exports = router;
