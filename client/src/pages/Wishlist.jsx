import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { getWishlist } from '../services/wishlistService';
import PropertyCard from '../components/property/PropertyCard';
import { PropertyCardSkeleton } from '../components/property/PropertyGrid';
import { FiHeart } from 'react-icons/fi';

const Wishlist = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const { fetchWishlist } = useWishlist();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data } = await getWishlist();
      setProperties(data.wishlist?.properties || []);
    } catch { setProperties([]); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container-custom py-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
            <FiHeart className="text-primary-500 text-xl" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-display text-gray-900">Saved Places</h1>
            <p className="text-gray-500 text-sm">{properties.length} saved property{properties.length !== 1 ? 'ies' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <PropertyCardSkeleton key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-card p-16 text-center">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No saved places yet</h3>
            <p className="text-gray-500 mb-6">
              Click the heart icon on any property to save it here for later!
            </p>
            <Link to="/search" className="btn-primary">Explore Properties</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {properties.map((property) => (
              <PropertyCard key={property._id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
