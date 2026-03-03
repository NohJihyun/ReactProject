// src/auth/AuthProvider.jsx
// AuthProvider: 로그인 상태(user)와 accessToken(메모리)을 전역에서 관리
// - 앱 시작 시 meApi()로 로그인 상태 확정(bootstrap)
// - 부팅 완료 전에는 loading 표시(흰 화면 방지)

import React, { createContext, useContext, useMemo, useState, useEffect } from "react";

// 로그인 인증 API
import { loginApi, logoutApi, meApi } from "../api/authApi";
/*
 * 웹 시작할 때 내가 로그인 상태인지 확인하는 "초기화 담당"
 * 전역에 user, accessToken, login, logout을 제공
 * 웹 실행시 meApi() 호출 성공200, 실패401 로그인, 비로그인 상태 체크 화면 렌더
 */
import { useAuthStore } from "../auth/authStore"; // 전역스토어 토큰 처리

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null); //AT는 메모리에만
    const [bootstrapped, setBootstrapped] = useState(false);

    //토큰 저장/삭제를 한 함수로 통일
    const syncAccessToken = (token) => {
        const t = token ?? null;

        // 1) AuthProvider state
        setAccessToken(t);

        // 2) http.js가 읽는 zustand store에도 반영 (제일 중요)
        useAuthStore.getState().setAccessToken(t);

        // 3) (선택) 새로고침 유지용 localStorage
        if (t) localStorage.setItem("accessToken", t);
        else localStorage.removeItem("accessToken");
    };

    // 앱 시작 시: 서버 기준으로 로그인 상태 확정
    useEffect(() => {
        let alive = true;

        // 혹시 meApi가 네트워크 문제로 오래 걸리면, 최소 화면은 나오게(흰 화면 방지)
        const safetyTimer = setTimeout(() => {
            if (alive) {
                console.log("[Auth] bootstrap timeout -> allow render");
                setBootstrapped(true);
            }
        }, 8000);
        // 웹 켜짐 => meApi() 호출 => 성공(200) 로그인상태, => 실패(401) 비로그인상태
        // bootstrapped가 끝나야 화면(Routes)을 보여줌
        (async () => {
            console.log("[Auth] bootstrap start");

            // 웹 시작 시: localStorage 토큰이 있으면 메모리에도 싱크
            const stored = localStorage.getItem("accessToken");
            if (stored) syncAccessToken(stored);  // store에도 같이 세팅

            const me = await meApi();   // 401이면 null 반환
            if (!alive) return;

            setUser(me);

            // me가 null이면 토큰도 정리(만료/무효 케이스)
            if (!me) syncAccessToken(null)

            clearTimeout(safetyTimer);
            console.log("[Auth] bootstrap done");
            setBootstrapped(true);
        })();

        return () => {
            alive = false;
            clearTimeout(safetyTimer);
        };
    }, []);

    // 로그인: (1) 로그인 API → (2) AT 저장 → (3) me로 user 확정
    const login = async ({ email, password }) => {
        const data = await loginApi({ email, password }); // 예: { accessToken: "..." }

        // 여기서 localStorage까지 같이 저장되게 만들기
        syncAccessToken(data?.accessToken);

        const me = await meApi();
        setUser(me);

        //혹시 me가 null이면 토큰 정리
        if (!me) syncAccessToken(null);

        return me;
    };

    // 로그아웃: 서버 로그아웃 + 메모리 초기화
    const logout = async () => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
            syncAccessToken(null); // store + localStorage + state 모두 정리
        }
    };

    const value = useMemo(
        () => ({
            user,
            accessToken,
            bootstrapped,
            isAuthenticated: !!user,
            login,
            logout,
        }),
        [user, accessToken, bootstrapped]
    );

    //  부팅 완료 전에는 null 대신 loading 표시 (흰 화면 방지)
    if (!bootstrapped) return <div style={{ padding: 16 }}>loading...</div>;

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}