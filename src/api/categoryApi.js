// api 모듈 => 백엔드api 연동 모듈
import axios from 'axios';

const API = '/admin/categories';

export const getCategories = () => axios.get(API);
export const createCategory = (data) => axios.post(API, data);
export const updateCategory = (data) => axios.put(API, data);
export const deleteCategory = (id) => axios.delete(`${API}/${id}`);