import API from './api';

export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = (params) => API.get('/bookings/my-bookings', { params });
export const getHostBookings = () => API.get('/bookings/host-bookings');
export const getBooking = (id) => API.get(`/bookings/${id}`);
export const cancelBooking = (id, reason) => API.put(`/bookings/${id}/cancel`, { reason });
export const checkAvailability = (propertyId, checkIn, checkOut) =>
  API.get(`/bookings/availability/${propertyId}`, { params: { checkIn, checkOut } });
export const getBookedDates = (propertyId) => API.get(`/bookings/booked-dates/${propertyId}`);
