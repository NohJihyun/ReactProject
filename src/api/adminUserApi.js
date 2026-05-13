import { http } from './http';

export const getAdminUsers = (keyword = '', page = 0, size = 15) =>
    http.get('/admin/users', { params: { keyword, page, size } }).then(r => r.data);

export const changeUserRole = (userId, role) =>
    http.patch(`/admin/users/${userId}/role`, null, { params: { role } });

export const getAdminStats = () =>
    http.get('/admin/stats').then(r => r.data);
