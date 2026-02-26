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
        const me = await meApi();
        store.setUser(me);
    } catch (e) {
        store.setUser(null);
    } finally {
        store.setBootstrapped(true);
    }
}