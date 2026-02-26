import axios from "axios";
import { useAuthStore } from "../auth/authStore";
import { refreshTokenApi } from "./authApi";
/*
 * 모든 api 요청을 보냄 axios 엔진
 * Authorization: Bearer AT 자동으로 붙이기
 * 응답이 401 refresh 호출해서 AT 재발급
 * 재발급 성공하면 원래 요청 자동 재시도
 * API호출 -> 401 -> refresh -> 새AT -> 원요청 재시도
 */
const BASE_URL = process.env.REACT_APP_API_BASE_URL;

// 일반 요청용 axios
export const http = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // RT 쿠키 포함
});

// refresh 전용 axios (인터셉터 루프 방지)
export const httpRefresh = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// 401 동시 폭발 방지(single-flight)
let isRefreshing = false;
let waiters = [];

function waitForRefresh() {
    return new Promise((resolve, reject) => {
        waiters.push({ resolve, reject });
    });
}

function resolveWaiters(newToken) {
    waiters.forEach((p) => p.resolve(newToken));
    waiters = [];
}

function rejectWaiters(err) {
    waiters.forEach((p) => p.reject(err));
    waiters = [];
}

// 요청 인터셉터: AT 자동 주입
http.interceptors.request.use((config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
});

// 응답 인터셉터: 401 → refresh → 원요청 재시도
http.interceptors.response.use(
    (res) => res,
    async (error) => {
        const status = error.response?.status;
        const original = error.config;

        // meApi 같은 요청은 401이어도 refresh 시도 금지
        if (original?.skipAuthRefresh) {
            return Promise.reject(error);
        }

        if (status === 401 && original && !original._retry) {
            original._retry = true;

            try {
                if (isRefreshing) {
                    const newToken = await waitForRefresh();
                    original.headers.Authorization = `Bearer ${newToken}`;
                    return http(original);
                }

                isRefreshing = true;

                const newToken = await refreshTokenApi(); // string token
                useAuthStore.getState().setAccessToken(newToken);

                resolveWaiters(newToken);

                original.headers.Authorization = `Bearer ${newToken}`;
                return http(original);
            } catch (e) {
                rejectWaiters(e);
                useAuthStore.getState().logoutLocal();
                return Promise.reject(e);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);