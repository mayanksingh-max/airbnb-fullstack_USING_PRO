import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getWishlist, toggleWishlist as toggleWishlistAPI } from '../services/wishlistService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const { data } = await getWishlist();
      setWishlist(data.wishlist?.properties?.map((p) => p._id || p) || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleProperty = useCallback(async (propertyId) => {
    if (!isAuthenticated) {
      toast.error('Please login to save properties');
      return;
    }
    try {
      const { data } = await toggleWishlistAPI(propertyId);
      if (data.saved) {
        setWishlist((prev) => [...prev, propertyId]);
        toast.success('Saved to wishlist');
      } else {
        setWishlist((prev) => prev.filter((id) => id !== propertyId));
        toast.success('Removed from wishlist');
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  }, [isAuthenticated]);

  const isSaved = useCallback((propertyId) => {
    return wishlist.some((id) => id === propertyId || id?._id === propertyId);
  }, [wishlist]);

  return (
    <WishlistContext.Provider value={{ wishlist, loading, toggleProperty, isSaved, fetchWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};

export default WishlistContext;
