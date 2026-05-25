import API from './api';

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const updateProfile = (data) => API.put('/auth/update-profile', data);
export const changePassword = (data) => API.put('/auth/change-password', data);
