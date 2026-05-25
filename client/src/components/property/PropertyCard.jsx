import { Link } from 'react-router-dom';
import { useWishlist } from '../../context/WishlistContext';
import { FiHeart, FiStar, FiMapPin } from 'react-icons/fi';
import { HiHeart } from 'react-icons/hi';

const PropertyCard = ({ property, className = '' }) => {
  const { isSaved, toggleProperty } = useWishlist();
  const saved = isSaved(property._id);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleProperty(property._id);
  };

  const mainImage = property.images?.[0]?.url || 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop';
  const location = `${property.location?.city}, ${property.location?.country}`;
  const rating = property.ratings || 0;
  const reviewCount = property.reviewCount || 0;

  return (
    <Link to={`/properties/${property._id}`} className={`group block ${className}`}>
      <div className="relative overflow-hidden rounded-2xl mb-3">
        {/* Property Image */}
        <div className="aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={mainImage}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Gradient overlay */}
        <div className="absolute inset-0 gradient-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          {saved ? (
            <HiHeart className="text-2xl text-primary-500 drop-shadow-sm" />
          ) : (
            <FiHeart className="text-2xl text-white drop-shadow-md" />
          )}
        </button>

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full capitalize text-gray-700 shadow-sm">
            {property.category}
          </span>
        </div>
      </div>

      {/* Property Info */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors text-sm">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
              <FiMapPin className="flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
          </div>
          {rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <FiStar className="text-yellow-400 fill-yellow-400 text-xs" />
              <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
              {reviewCount > 0 && (
                <span className="text-xs text-gray-400">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 flex items-center gap-1">
          <span className="font-bold text-gray-900">
            ${property.pricePerNight?.toLocaleString()}
          </span>
          <span className="text-gray-500 text-sm">/ night</span>
        </div>

        {/* Quick details */}
        <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
          <span>{property.bedrooms} bed{property.bedrooms !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
          <span>·</span>
          <span>Up to {property.maxGuests} guests</span>
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
