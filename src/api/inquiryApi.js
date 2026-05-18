import { http } from './http';

/* ── 클라이언트 ── */
export const createInquiry = (data) =>
    http.post('/api/inquiries', data).then(r => r.data);

export const getMyInquiries = () =>
    http.get('/api/inquiries/me').then(r => r.data);

export const getMyInquiry = (id) =>
    http.get(`/api/inquiries/${id}`).then(r => r.data);

/* ── 관리자 ── */
export const getAdminInquiries = (params) =>
    http.get('/api/admin/inquiries', { params: Object.fromEntries(Object.entries(params).filter(([,v]) => v != null && v !== '')) }).then(r => r.data);

export const getAdminInquiry = (id) =>
    http.get(`/api/admin/inquiries/${id}`).then(r => r.data);

export const getInquiryNewCount = () =>
    http.get('/api/admin/inquiries/new-count').then(r => r.data);

export const updateInquiryAnswer = (id, answer) =>
    http.patch(`/api/admin/inquiries/${id}/answer`, { answer }).then(r => r.data);

export const updateInquiryStatus = (id, status) =>
    http.patch(`/api/admin/inquiries/${id}/status`, { status }).then(r => r.data);

export const deleteInquiry = (id) =>
    http.delete(`/api/admin/inquiries/${id}`).then(r => r.data);

export const getInquiryStats = () =>
    http.get('/api/admin/inquiries/stats').then(r => r.data);
