import { FiStar, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { deleteReview } from '../../services/reviewService';
import toast from 'react-hot-toast';

const ReviewCard = ({ review, onDelete }) => {
  const { user, isAdmin } = useAuth();
  const isOwner = user?._id === review.user?._id;

  const handleDelete = async () => {
    if (!window.confirm('Delete this review?')) return;
    try {
      await deleteReview(review._id);
      toast.success('Review deleted');
      onDelete?.();
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 hover:shadow-card transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img
            src={review.user?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${review.user?.name}`}
            alt={review.user?.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{review.user?.name}</p>
            <p className="text-xs text-gray-400">{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((s) => (
              <FiStar
                key={s}
                className={`text-sm ${s <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-xs font-bold text-gray-700">{review.rating}.0</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>

      {(isOwner || isAdmin) && (
        <div className="mt-3 flex justify-end">
          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            <FiTrash2 className="text-xs" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
