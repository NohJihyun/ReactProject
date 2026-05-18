import { http } from './http';

const base = (productId) => `/api/admin/products/${productId}/air-itineraries`;

/* 일정 목록 (이미지 + 스케줄 포함) */
export const getAirItineraries = (productId) =>
    http.get(base(productId)).then(res => res.data);

/* 일정 등록 */
export const createAirItinerary = (productId, data) =>
    http.post(base(productId), data).then(res => res.data);

/* 일정 수정 */
export const updateAirItinerary = (productId, id, data) =>
    http.put(`${base(productId)}/${id}`, data).then(res => res.data);

/* 일정 삭제 */
export const deleteAirItinerary = (productId, id) =>
    http.delete(`${base(productId)}/${id}`);

/* 이미지 업로드 */
export const uploadAirItineraryImage = (productId, itineraryId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

/* 이미지 삭제 */
export const deleteAirItineraryImage = (productId, itineraryId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/images/${imageId}`);

/* 스케줄별 이미지 업로드 */
export const uploadAirScheduleImage = (productId, itineraryId, scheduleId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/schedules/${scheduleId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

/* 스케줄별 이미지 삭제 */
export const deleteAirScheduleImage = (productId, itineraryId, scheduleId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}/images/${imageId}`);

/* 스케줄 추가 */
export const addAirSchedule = (productId, itineraryId, data) =>
    http.post(`${base(productId)}/${itineraryId}/schedules`, data).then(res => res.data);

/* 스케줄 수정 */
export const updateAirSchedule = (productId, itineraryId, scheduleId, data) =>
    http.put(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`, data).then(res => res.data);

/* 스케줄 삭제 */
export const deleteAirSchedule = (productId, itineraryId, scheduleId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`);

/* 항공 상세 (포함/불포함, 가이드, 가격, 항공편 정보) */
export const getAirDetail = (productId) =>
    http.get(`/api/admin/products/${productId}/air-details`).then(res => res.data);

export const saveAirDetail = (productId, data) =>
    http.put(`/api/admin/products/${productId}/air-details`, data).then(res => res.data);
