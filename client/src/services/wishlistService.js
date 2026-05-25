import API from './api';

export const getWishlist = () => API.get('/wishlist');
export const toggleWishlist = (propertyId) => API.post(`/wishlist/${propertyId}`);
export const checkWishlist = (propertyId) => API.get(`/wishlist/check/${propertyId}`);
