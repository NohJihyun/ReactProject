import { http } from './http';

const base = (productId) => `/admin/products/${productId}/cruise-itineraries`;

/* 일정 목록 (이미지 + 스케줄 포함) */
export const getCruiseItineraries = (productId) =>
    http.get(base(productId)).then(res => res.data);

/* 일정 등록 */
export const createCruiseItinerary = (productId, data) =>
    http.post(base(productId), data).then(res => res.data);

/* 일정 수정 */
export const updateCruiseItinerary = (productId, id, data) =>
    http.put(`${base(productId)}/${id}`, data).then(res => res.data);

/* 일정 삭제 */
export const deleteCruiseItinerary = (productId, id) =>
    http.delete(`${base(productId)}/${id}`);

/* 이미지 업로드 */
export const uploadCruiseItineraryImage = (productId, itineraryId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

/* 이미지 삭제 */
export const deleteCruiseItineraryImage = (productId, itineraryId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/images/${imageId}`);

/* 스케줄별 이미지 업로드 */
export const uploadCruiseScheduleImage = (productId, itineraryId, scheduleId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/schedules/${scheduleId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

/* 스케줄별 이미지 삭제 */
export const deleteCruiseScheduleImage = (productId, itineraryId, scheduleId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}/images/${imageId}`);

/* 스케줄 추가 */
export const addCruiseSchedule = (productId, itineraryId, data) =>
    http.post(`${base(productId)}/${itineraryId}/schedules`, data).then(res => res.data);

/* 스케줄 수정 */
export const updateCruiseSchedule = (productId, itineraryId, scheduleId, data) =>
    http.put(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`, data).then(res => res.data);

/* 스케줄 삭제 */
export const deleteCruiseSchedule = (productId, itineraryId, scheduleId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`);

/* 크루즈 상세 (포함/불포함, 가이드, 유의사항) */
export const getCruiseDetail = (productId) =>
    http.get(`/admin/products/${productId}/cruise-details`).then(res => res.data);

export const saveCruiseDetail = (productId, data) =>
    http.put(`/admin/products/${productId}/cruise-details`, data).then(res => res.data);

/* 크루즈 가격 */
export const getCruisePrices = (productId) =>
    http.get(`/admin/products/${productId}/cruise-prices`).then(res => res.data);

export const addCruisePrice = (productId, data) =>
    http.post(`/admin/products/${productId}/cruise-prices`, data).then(res => res.data);

export const updateCruisePrice = (productId, priceId, data) =>
    http.put(`/admin/products/${productId}/cruise-prices/${priceId}`, data).then(res => res.data);

export const deleteCruisePrice = (productId, priceId) =>
    http.delete(`/admin/products/${productId}/cruise-prices/${priceId}`);
