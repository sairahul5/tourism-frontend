import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'https://tourism-backend-5aj9.onrender.com/api' });

api.interceptors.request.use(req => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export const registerUser = (data) => api.post('/users/register', data);
export const loginUser = (data) => api.post('/users/login', data);
export const getCaptcha = () => api.get('/captcha');
export const getHomestays = (params) => api.get('/homestays', { params });
export const deleteHomestay = (id) => api.delete(`/homestays/${id}`);
export const updateHomestay = (id, data) => api.put(`/homestays/${id}`, data);
export const getPendingHomestays = () => api.get('/homestays/pending');
export const approveHomestay = (id) => api.put(`/homestays/${id}/approve`);
export const getHomestayById = (id) => api.get(`/homestays/${id}`);
export const getContainers = () => api.get('/containers');
export const getContainerItems = (id) => api.get(`/containers/${id}/items`);
export const updateContainer = (id, data) => api.put(`/containers/${id}`, data);
export const deleteContainer = (id) => api.delete(`/containers/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);
export const getGuides = (params) => api.get('/guides', { params });
export const getPendingGuides = () => api.get('/guides/pending');
export const approveGuide = (id) => api.put(`/guides/${id}/approve`);
export const updateGuide = (id, data) => api.put(`/guides/${id}`, data);
export const createBooking = (data) => api.post('/bookings', data);
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status?status=${status}`);
export const createGuideBooking = (data) => api.post('/guide-bookings', data);
export const getGuideBookingsByUser = (userId) => api.get(`/guide-bookings/user/${userId}`);
export const deleteGuideBooking = (id, reason) => api.delete(`/guide-bookings/${id}?reason=${encodeURIComponent(reason)}`);
export const uploadFile = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const getBookingsByHost = (hostId) => api.get(`/bookings/host/${hostId}`);

export default api;
