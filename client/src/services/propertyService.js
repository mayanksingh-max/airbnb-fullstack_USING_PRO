import API from './api';

export const getProperties = (params) => API.get('/properties', { params });
export const getFeaturedProperties = () => API.get('/properties/featured');
export const getProperty = (id) => API.get(`/properties/${id}`);
export const getMyListings = () => API.get('/properties/my-listings');
export const createProperty = (data) => API.post('/properties', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateProperty = (id, data) => API.put(`/properties/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteProperty = (id) => API.delete(`/properties/${id}`);
export const deletePropertyImage = (propertyId, publicId) =>
  API.delete(`/properties/${propertyId}/images/${encodeURIComponent(publicId)}`);
