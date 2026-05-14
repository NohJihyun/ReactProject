import { http } from './http';

export const getProductsByCategory = (category) =>
    http.get('/api/products', { params: { category } }).then(res => res.data);

export const getProductById = (id) =>
    http.get(`/api/products/${id}`).then(res => res.data);

export const getProductImages = (id) =>
    http.get(`/api/products/${id}/images`).then(res => res.data);

export const getProductFiles = (id) =>
    http.get(`/api/products/${id}/files`).then(res => res.data);

export const getCruiseItineraries = (id) =>
    http.get(`/api/products/${id}/cruise-itineraries`).then(res => res.data);

export const getCruiseDetail = (id) =>
    http.get(`/api/products/${id}/cruise-details`).then(res => res.data);

export const getCruisePrices = (id) =>
    http.get(`/api/products/${id}/cruise-prices`).then(res => res.data);

export const getAirItineraries = (id) =>
    http.get(`/api/products/${id}/air-itineraries`).then(res => res.data);

export const getAirDetail = (id) =>
    http.get(`/api/products/${id}/air-details`).then(res => res.data);

export const getDomesticItineraries = (id) =>
    http.get(`/api/products/${id}/domestic-itineraries`).then(res => res.data);

export const getDomesticDetail = (id) =>
    http.get(`/api/products/${id}/domestic-details`).then(res => res.data);

export const getSchoolTripItineraries = (id) =>
    http.get(`/api/products/${id}/school-trip-itineraries`).then(res => res.data);

export const getSchoolTripDetail = (id) =>
    http.get(`/api/products/${id}/school-trip-details`).then(res => res.data);

export const searchProducts = (keyword, limit = 8) =>
    http.get('/api/products/search', { params: { keyword, limit } }).then(res => res.data);

export const logSearch = (keyword) =>
    http.post('/api/search/log', null, { params: { keyword } }).catch(() => {});

export const getPopularKeywords = (limit = 10) =>
    http.get('/api/search/popular', { params: { limit } }).then(res => res.data);
