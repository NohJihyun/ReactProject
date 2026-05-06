import { http } from './http';

/* ── 공개 조회 ── */
export const getReviews = (productId, page = 1, size = 5) =>
    http.get(`/api/products/${productId}/reviews`, { params: { page, size } }).then(r => r.data);

export const getReviewStats = (productId) =>
    http.get(`/api/products/${productId}/reviews/stats`).then(r => r.data);

export const getRecentReviews = (limit = 12) =>
    http.get('/api/reviews/recent', { params: { limit } }).then(r => r.data);

export const getComments = (productId, reviewId) =>
    http.get(`/api/products/${productId}/reviews/${reviewId}/comments`).then(r => r.data);

/* ── 내 후기 (마이페이지) ── */
export const getMyReviews = (page = 1, size = 10) =>
    http.get('/api/users/me/reviews', { params: { page, size } }).then(r => r.data);

/* ── 후기 CRUD ── */
export const createReview = (productId, params) =>
    http.post(`/api/products/${productId}/reviews`, null, { params }).then(r => r.data);

export const updateReview = (productId, reviewId, params) =>
    http.put(`/api/products/${productId}/reviews/${reviewId}`, null, { params }).then(r => r.data);

export const deleteReview = (productId, reviewId) =>
    http.delete(`/api/products/${productId}/reviews/${reviewId}`);

/* ── 이미지 ── */
export const uploadReviewImage = (productId, reviewId, formData) =>
    http.post(`/api/products/${productId}/reviews/${reviewId}/images`, formData).then(r => r.data);

export const deleteReviewImage = (productId, reviewId, imageId) =>
    http.delete(`/api/products/${productId}/reviews/${reviewId}/images/${imageId}`);

/* ── 댓글 CRUD ── */
export const addComment = (productId, reviewId, content) =>
    http.post(`/api/products/${productId}/reviews/${reviewId}/comments`, null, { params: { content } }).then(r => r.data);

export const updateComment = (productId, reviewId, commentId, content) =>
    http.put(`/api/products/${productId}/reviews/${reviewId}/comments/${commentId}`, null, { params: { content } }).then(r => r.data);

export const deleteComment = (productId, reviewId, commentId) =>
    http.delete(`/api/products/${productId}/reviews/${reviewId}/comments/${commentId}`);

/* ── 관리자 ── */
export const adminGetReviews = (params) =>
    http.get('/admin/reviews', { params }).then(r => r.data);

export const adminUpdateStatus = (reviewId, status) =>
    http.patch(`/admin/reviews/${reviewId}/status`, { status }).then(r => r.data);

export const adminDeleteReview = (reviewId) =>
    http.delete(`/admin/reviews/${reviewId}`);
