import { http } from './http';

export const getAdminUsers = (keyword = '', page = 0, size = 15) =>
    http.get('/api/admin/users', { params: { keyword, page, size } }).then(r => r.data);

export const changeUserRole = (userId, role) =>
    http.patch(`/api/admin/users/${userId}/role`, null, { params: { role } });

export const getAdminStats = () =>
    http.get('/api/admin/stats').then(r => r.data);
