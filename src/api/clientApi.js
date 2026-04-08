import { http } from './http';

export const getProductsByCategory = (category) =>
    http.get('/api/products', { params: { category } }).then(res => res.data);
