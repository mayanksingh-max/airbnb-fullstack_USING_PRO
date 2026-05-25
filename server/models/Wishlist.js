const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    properties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Wishlist', WishlistSchema);
