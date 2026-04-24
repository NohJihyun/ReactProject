import { http } from './http';

export const getProductsByCategory = (category) =>
    http.get('/api/products', { params: { category } }).then(res => res.data);

export const getProductById = (id) =>
    http.get(`/api/products/${id}`).then(res => res.data);

export const getProductImages = (id) =>
    http.get(`/api/products/${id}/images`).then(res => res.data);

export const getProductFiles = (id) =>
    http.get(`/api/products/${id}/files`).then(res => res.data);
