import { http } from './http';

export const getProducts = (search) =>
    http.get('/api/admin/products', { params: search }).then(res => res.data);

export const getUsedCategoryIds = () =>
    http.get('/api/admin/products/used-categories').then(res => res.data);

export const getProduct = (id) =>
    http.get(`/api/admin/products/${id}`).then(res => res.data);

export const createProduct = (form) =>
    http.post('/api/admin/products', form).then(res => res.data); // { productId }

export const updateProduct = (id, form) =>
    http.put(`/api/admin/products/${id}`, form);

/* 이미지 */
export const getProductImages = (productId) =>
    http.get(`/api/admin/products/${productId}/images`).then(res => res.data);

export const uploadProductImage = (productId, formData) =>
    http.post(`/api/admin/products/${productId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const deleteProductImage = (productId, imageId, imagePath) =>
    http.delete(`/api/admin/products/${productId}/images/${imageId}`, { params: { imagePath } });

export const updateImageOrder = (productId, items) =>
    http.put(`/api/admin/products/${productId}/images/order`, items);

/* 동영상 */
export const updateProductVideoUrl = (productId, videoUrl) =>
    http.patch(`/api/admin/products/${productId}/video-url`, { videoUrl });

export const uploadProductVideo = (productId, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return http.post(`/api/admin/products/${productId}/video`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);
};

export const deleteProductVideo = (productId) =>
    http.delete(`/api/admin/products/${productId}/video`);

/* 첨부파일 */
export const getProductFiles = (productId) =>
    http.get(`/api/admin/products/${productId}/files`).then(res => res.data);

export const uploadProductFile = (productId, formData) =>
    http.post(`/api/admin/products/${productId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const deleteProductFile = (productId, fileId) =>
    http.delete(`/api/admin/products/${productId}/files/${fileId}`);

/* 비활성화 (논리 삭제) */
export const deactivateProduct = (id) =>
    http.delete(`/api/admin/products/${id}`);

/* 물리 삭제 */
export const deleteProduct = (id) =>
    http.delete(`/api/admin/products/${id}/delete`);
