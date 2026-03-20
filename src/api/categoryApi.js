// api 모듈 => 백엔드api 연동 모듈
// 이미 있다면 이 형식으로 바꿔주세요.
//import axios from 'axios';
import { http } from './http';

/*export const getCategories = () =>
    axios.get('/admin/categories').then(res => res.data);*/

export const getCategories = (search) =>
    http.get('/admin/categories', {
        params: search
    }).then(res => res.data);

export const createCategory = (form) =>
    http.post('/admin/categories', form);

export const updateCategory = (id, form) =>
    http.put(`/admin/categories/${id}`, form);

/* 실제 삭제 (논리  삭제) */
export const deactivateCategory = (id) =>
    http.delete(`/admin/categories/${id}`);

/* 실제 삭제 (물리 삭제) */
export const deleteCategory = (id) =>
    http.delete(`/admin/categories/${id}/delete`);

/* 벨리데이션체크 카테고리코드 + 정렬 검증 */
export const checkCategoryDuplicate = ({
                                           depth,
                                           parentId,
                                           sortOrder,
                                           excludeId
                                       }) => {
    return http.get('/admin/categories/duplicate', {
        params: { depth, parentId, sortOrder, excludeId }
    });
};
