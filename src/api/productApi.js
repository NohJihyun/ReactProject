import { http } from './http';

export const getProducts = (search) =>
    http.get('/admin/products', { params: search }).then(res => res.data);

export const createProduct = (form) =>
    http.post('/admin/products', form);

export const updateProduct = (id, form) =>
    http.put(`/admin/products/${id}`, form);

/* 비활성화 (논리 삭제) */
export const deactivateProduct = (id) =>
    http.delete(`/admin/products/${id}`);

/* 물리 삭제 */
export const deleteProduct = (id) =>
    http.delete(`/admin/products/${id}/delete`);
