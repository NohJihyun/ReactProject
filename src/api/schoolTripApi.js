import { http } from './http';

const base = (productId) => `/admin/products/${productId}/school-trip-itineraries`;

export const getSchoolTripItineraries = (productId) =>
    http.get(base(productId)).then(res => res.data);

export const createSchoolTripItinerary = (productId, data) =>
    http.post(base(productId), data).then(res => res.data);

export const updateSchoolTripItinerary = (productId, id, data) =>
    http.put(`${base(productId)}/${id}`, data).then(res => res.data);

export const deleteSchoolTripItinerary = (productId, id) =>
    http.delete(`${base(productId)}/${id}`);

export const uploadSchoolTripItineraryImage = (productId, itineraryId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const deleteSchoolTripItineraryImage = (productId, itineraryId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/images/${imageId}`);

export const addSchoolTripSchedule = (productId, itineraryId, data) =>
    http.post(`${base(productId)}/${itineraryId}/schedules`, data).then(res => res.data);

export const updateSchoolTripSchedule = (productId, itineraryId, scheduleId, data) =>
    http.put(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`, data).then(res => res.data);

export const deleteSchoolTripSchedule = (productId, itineraryId, scheduleId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`);

export const getSchoolTripDetail = (productId) =>
    http.get(`/admin/products/${productId}/school-trip-details`).then(res => res.data);

export const saveSchoolTripDetail = (productId, data) =>
    http.put(`/admin/products/${productId}/school-trip-details`, data).then(res => res.data);
