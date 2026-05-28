import { http } from './http';

// Folder
export const getFolders = () => http.get('/api/admin/file-share/folders').then(r => r.data);

export const createFolder = (name, parentId = null) =>
    http.post('/api/admin/file-share/folders', null, { params: { name, parentId } }).then(r => r.data);

export const renameFolder = (id, name) =>
    http.patch(`/api/admin/file-share/folders/${id}/name`, null, { params: { name } });

export const deleteFolder = (id) => http.delete(`/api/admin/file-share/folders/${id}`);

// File
export const getFiles = (folderId) =>
    http.get(`/api/admin/file-share/folders/${folderId}/files`).then(r => r.data);

export const getVersions = (groupId) =>
    http.get(`/api/admin/file-share/files/${groupId}/versions`).then(r => r.data);

export const uploadFile = (folderId, file) => {
    const form = new FormData();
    form.append('file', file);
    return http.post(`/api/admin/file-share/folders/${folderId}/files`, form).then(r => r.data);
};

export const uploadVersion = (groupId, folderId, file) => {
    const form = new FormData();
    form.append('file', file);
    return http.post(`/api/admin/file-share/files/${groupId}/versions`, form, {
        params: { folderId }
    }).then(r => r.data);
};

export const downloadFile = (id) =>
    http.get(`/api/admin/file-share/files/${id}/download`, { responseType: 'blob' }).then(r => r);

export const deleteFile = (id) => http.delete(`/api/admin/file-share/files/${id}`);
