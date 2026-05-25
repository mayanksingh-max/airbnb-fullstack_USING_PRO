import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import { addReview } from '../../services/reviewService';
import toast from 'react-hot-toast';

const ReviewForm = ({ propertyId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('Please select a rating'); return; }
    if (comment.trim().length < 10) { toast.error('Review must be at least 10 characters'); return; }

    try {
      setLoading(true);
      await addReview(propertyId, { rating, comment });
      toast.success('Review submitted! Thank you.');
      setRating(0);
      setComment('');
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <FiStar
                className={`text-2xl transition-colors ${
                  star <= (hoverRating || rating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium text-gray-600 self-center">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this property..."
          className="input-field resize-none h-24"
          maxLength={1000}
        />
        <p className="text-xs text-gray-400 mt-1">{comment.length}/1000</p>
      </div>

      <button type="submit" disabled={loading} className="btn-primary py-2.5 px-6">
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

export default ReviewForm;
