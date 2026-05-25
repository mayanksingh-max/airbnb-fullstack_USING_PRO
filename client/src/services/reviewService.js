import API from './api';

export const getPropertyReviews = (propertyId, params) =>
  API.get(`/reviews/${propertyId}`, { params });
export const addReview = (propertyId, data) => API.post(`/reviews/${propertyId}`, data);
export const updateReview = (id, data) => API.put(`/reviews/${id}`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
