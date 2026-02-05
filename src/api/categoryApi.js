// api 모듈 => 백엔드api 연동 모듈
// 이미 있다면 이 형식으로 바꿔주세요.
import axios from 'axios';

/*export const getCategories = () =>
    axios.get('/admin/categories').then(res => res.data);*/

export const getCategories = (search) =>
    axios.get('/admin/categories', {
        params: search
    }).then(res => res.data);

export const createCategory = (form) =>
    axios.post('/admin/categories', form);

export const updateCategory = (id, form) =>
    axios.put(`/admin/categories/${id}`, form);

/* 실제 삭제 (논리  삭제) */
export const deactivateCategory = (id) =>
    axios.delete(`/admin/categories/${id}`);

/* 실제 삭제 (물리 삭제) */
export const deleteCategory = (id) =>
    axios.delete(`/admin/categories/${id}/delete`);