// src/auth/authBootstrap.js
import { meApi } from "../api/authApi";
import { useAuthStore } from "./authStore";
/*
 * 웹 시작 시 me로 로그인 확정
 * "bootstrap" 의미 웹이 시작될 때  로그인 상태를 초기화하는 과정
 */
export async function bootstrapAuth() {
    const store = useAuthStore.getState();

    try {
        //  (선택) 새로고침 유지: localStorage → store로 토큰 주입
        const stored = localStorage.getItem("accessToken");
        if (stored) {
            store.setAccessToken(stored);
        }

        const me = await meApi(); // 401이면 null 반환
        store.setUser(me);

        // me가 null이면 토큰도 정리
        if (!me) {
            store.setAccessToken(null);
            localStorage.removeItem("accessToken");
        }
    } catch (e) {
        store.logoutLocal();
        localStorage.removeItem("accessToken");
    } finally {
        store.setBootstrapped(true);
    }
}