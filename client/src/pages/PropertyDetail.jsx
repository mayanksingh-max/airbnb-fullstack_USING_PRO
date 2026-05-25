import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProperty } from '../services/propertyService';
import { getPropertyReviews } from '../services/reviewService';
import BookingWidget from '../components/booking/BookingWidget';
import ReviewCard from '../components/review/ReviewCard';
import ReviewForm from '../components/review/ReviewForm';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import {
  FiMapPin, FiStar, FiUsers, FiArrowLeft, FiShare2,
  FiWifi, FiTv, FiThermometer,
} from 'react-icons/fi';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi';
import {
  MdOutlinePool, MdOutlineKitchen, MdLocalParking, MdOutlineFireplace,
  MdOutlinePets, MdOutlineHotTub,
} from 'react-icons/md';
import { TbWashMachine, TbToolsKitchen2 } from 'react-icons/tb';

const AMENITY_ICONS = {
  wifi: { icon: FiWifi, label: 'Wifi' },
  pool: { icon: MdOutlinePool, label: 'Pool' },
  kitchen: { icon: MdOutlineKitchen, label: 'Kitchen' },
  parking: { icon: MdLocalParking, label: 'Free parking' },
  tv: { icon: FiTv, label: 'TV' },
  air_conditioning: { icon: FiThermometer, label: 'Air conditioning' },
  heating: { icon: FiThermometer, label: 'Heating' },
  washer: { icon: TbWashMachine, label: 'Washer' },
  fireplace: { icon: MdOutlineFireplace, label: 'Fireplace' },
  pet_friendly: { icon: MdOutlinePets, label: 'Pets allowed' },
  hot_tub: { icon: MdOutlineHotTub, label: 'Hot tub' },
  bbq_grill: { icon: TbToolsKitchen2, label: 'BBQ grill' },
};

const PropertyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isSaved, toggleProperty } = useWishlist();

  const [property, setProperty] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [showAllImages, setShowAllImages] = useState(false);

  useEffect(() => {
    fetchData();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [propRes, reviewRes] = await Promise.all([
        getProperty(id),
        getPropertyReviews(id, { limit: 6 }),
      ]);
      setProperty(propRes.data.property);
      setReviews(reviewRes.data.reviews || []);
    } catch {
      navigate('/404');
    } finally {
      setLoading(false);
    }
  };

  const saved = isSaved(id);

  if (loading) {
    return (
      <div className="pt-20 container-custom">
        <div className="animate-pulse space-y-6">
          <div className="skeleton h-8 w-1/2 rounded" />
          <div className="skeleton aspect-[16/7] rounded-2xl" />
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2 space-y-4">
              <div className="skeleton h-4 w-full rounded" />
              <div className="skeleton h-4 w-3/4 rounded" />
            </div>
            <div className="skeleton h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!property) return null;

  const images = property.images || [];
  const amenities = property.amenities || [];
  const displayAmenities = showAllAmenities ? amenities : amenities.slice(0, 6);

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="container-custom pb-16">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 group transition-colors"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900 mb-2">{property.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              {property.ratings > 0 && (
                <span className="flex items-center gap-1">
                  <FiStar className="text-yellow-400 fill-yellow-400" />
                  <strong>{property.ratings.toFixed(1)}</strong>
                  <span className="text-gray-400">({property.reviewCount} reviews)</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <FiMapPin className="text-primary-500" />
                {property.location?.city}, {property.location?.country}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigator.share?.({ title: property.title, url: window.location.href })}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              <FiShare2 /> Share
            </button>
            <button
              onClick={() => toggleProperty(id)}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {saved ? <HiHeart className="text-primary-500" /> : <HiOutlineHeart />}
              {saved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Image Gallery Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-96 mb-8">
            <div className="col-span-2 row-span-2 relative cursor-pointer group" onClick={() => setActiveImage(0)}>
              <img
                src={images[0]?.url}
                alt={property.title}
                className="w-full h-full object-cover group-hover:brightness-90 transition-all"
              />
            </div>
            {images.slice(1, 5).map((img, idx) => (
              <div key={idx} className="relative cursor-pointer group overflow-hidden" onClick={() => setActiveImage(idx + 1)}>
                <img
                  src={img.url}
                  alt={`${property.title} ${idx + 2}`}
                  className="w-full h-full object-cover group-hover:scale-105 group-hover:brightness-90 transition-all duration-300"
                />
                {idx === 3 && images.length > 5 && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">+{images.length - 5} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Host Info */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Hosted by {property.host?.name}
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  <span>{property.maxGuests} guests</span>
                  <span>·</span>
                  <span>{property.bedrooms} bedroom{property.bedrooms !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{property.beds} bed{property.beds !== 1 ? 's' : ''}</span>
                  <span>·</span>
                  <span>{property.bathrooms} bath{property.bathrooms !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <img
                src={property.host?.avatar?.url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${property.host?.name}`}
                alt={property.host?.name}
                className="w-14 h-14 rounded-full border-2 border-white shadow-md object-cover"
              />
            </div>

            {/* Description */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">About this place</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">What this place offers</h3>
                <div className="grid grid-cols-2 gap-3">
                  {displayAmenities.map((amenity) => {
                    const amenityInfo = AMENITY_ICONS[amenity];
                    if (!amenityInfo) return null;
                    const Icon = amenityInfo.icon;
                    return (
                      <div key={amenity} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <Icon className="text-xl text-gray-600" />
                        <span className="text-sm text-gray-700">{amenityInfo.label}</span>
                      </div>
                    );
                  })}
                </div>
                {amenities.length > 6 && (
                  <button
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                    className="mt-4 text-sm font-semibold text-gray-900 underline hover:text-primary-600 transition-colors"
                  >
                    {showAllAmenities ? 'Show less' : `Show all ${amenities.length} amenities`}
                  </button>
                )}
              </div>
            )}

            {/* Location */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Location</h3>
              <div className="flex items-center gap-2 text-gray-600 mb-3">
                <FiMapPin className="text-primary-500" />
                <span>{property.location?.address}, {property.location?.city}, {property.location?.country}</span>
              </div>
              <div className="w-full h-56 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl flex items-center justify-center border border-gray-200">
                <div className="text-center text-gray-500">
                  <FiMapPin className="text-4xl text-primary-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">{property.location?.city}, {property.location?.country}</p>
                  <p className="text-xs text-gray-400 mt-1">Exact location provided after booking</p>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <h3 className="text-lg font-bold text-gray-900">Reviews</h3>
                {property.ratings > 0 && (
                  <span className="flex items-center gap-1 text-sm">
                    <FiStar className="text-yellow-400 fill-yellow-400" />
                    <strong>{property.ratings.toFixed(1)}</strong>
                    <span className="text-gray-400">· {property.reviewCount} review{property.reviewCount !== 1 ? 's' : ''}</span>
                  </span>
                )}
              </div>

              {reviews.length === 0 ? (
                <p className="text-gray-500 text-sm">No reviews yet. Be the first to review!</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((review) => (
                    <ReviewCard key={review._id} review={review} onDelete={fetchData} />
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              {isAuthenticated && (
                <div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-4">Write a Review</h4>
                  <ReviewForm propertyId={id} onSuccess={fetchData} />
                </div>
              )}
            </div>
          </div>

          {/* Right Column — Booking Widget */}
          <div className="lg:col-span-1">
            <BookingWidget property={property} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
