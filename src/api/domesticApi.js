import { http } from './http';

const base = (productId) => `/admin/products/${productId}/domestic-itineraries`;

export const getDomesticItineraries = (productId) =>
    http.get(base(productId)).then(res => res.data);

export const createDomesticItinerary = (productId, data) =>
    http.post(base(productId), data).then(res => res.data);

export const updateDomesticItinerary = (productId, id, data) =>
    http.put(`${base(productId)}/${id}`, data).then(res => res.data);

export const deleteDomesticItinerary = (productId, id) =>
    http.delete(`${base(productId)}/${id}`);

export const uploadDomesticItineraryImage = (productId, itineraryId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const deleteDomesticItineraryImage = (productId, itineraryId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/images/${imageId}`);

export const uploadDomesticScheduleImage = (productId, itineraryId, scheduleId, formData) =>
    http.post(`${base(productId)}/${itineraryId}/schedules/${scheduleId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }).then(res => res.data);

export const deleteDomesticScheduleImage = (productId, itineraryId, scheduleId, imageId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}/images/${imageId}`);

export const addDomesticSchedule = (productId, itineraryId, data) =>
    http.post(`${base(productId)}/${itineraryId}/schedules`, data).then(res => res.data);

export const updateDomesticSchedule = (productId, itineraryId, scheduleId, data) =>
    http.put(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`, data).then(res => res.data);

export const deleteDomesticSchedule = (productId, itineraryId, scheduleId) =>
    http.delete(`${base(productId)}/${itineraryId}/schedules/${scheduleId}`);

export const getDomesticDetail = (productId) =>
    http.get(`/admin/products/${productId}/domestic-details`).then(res => res.data);

export const saveDomesticDetail = (productId, data) =>
    http.put(`/admin/products/${productId}/domestic-details`, data).then(res => res.data);
