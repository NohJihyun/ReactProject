import { http } from './http';

/* ── 클라이언트 ── */
export const createBooking = (data) =>
    http.post('/api/bookings', data).then(r => r.data);

/* ── 관리자 ── */
export const getAdminBookings = (params) =>
    http.get('/admin/bookings', { params: Object.fromEntries(Object.entries(params).filter(([,v]) => v != null && v !== '')) }).then(r => r.data);

export const exportBookings = (params) =>
    http.get('/admin/bookings/export', {
        params: Object.fromEntries(Object.entries(params).filter(([,v]) => v != null && v !== '')),
        responseType: 'blob',
    }).then(r => r.data);

export const getAdminBooking = (id) =>
    http.get(`/admin/bookings/${id}`).then(r => r.data);

export const getUncheckedCount = () =>
    http.get('/admin/bookings/new-count').then(r => r.data);

export const getBookingStats = () =>
    http.get('/admin/bookings/stats').then(r => r.data);

export const updateBookingStatus = (id, status) =>
    http.patch(`/admin/bookings/${id}/status`, { status }).then(r => r.data);

export const updatePaymentStatus = (id, paymentStatus, paymentMethod) =>
    http.patch(`/admin/bookings/${id}/payment`, { paymentStatus, paymentMethod }).then(r => r.data);

export const updateBookingMemo = (id, adminMemo) =>
    http.patch(`/admin/bookings/${id}/memo`, { adminMemo }).then(r => r.data);

export const markBookingChecked = (id) =>
    http.patch(`/admin/bookings/${id}/check`).then(r => r.data);

export const getMyBookings = () =>
    http.get('/api/bookings/me').then(r => r.data);

export const updateBooking = (id, data) =>
    http.put(`/api/bookings/${id}`, data).then(r => r.data);

export const deleteBooking = (id) =>
    http.delete(`/api/bookings/${id}`).then(r => r.data);
