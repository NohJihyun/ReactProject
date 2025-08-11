//AuthProvider.jsx는 React Context API를 이용해서 로그인 정보(user, token)를 전역으로 관리하고, 로그인/로그아웃 함수를 제공하는 역할을 합니다.
//AuthProvider: 로그인 상태와 토큰을 관리하고, 전역에서 접근할 수 있게 하는 Context Provider
//부모컴포넌트에 즉, 로그인상태 (USER/TOKEN) 로그인 /로그아웃 함수를 전역에서 상요할수 있게 관리하는 컴포넌트
import React, { createContext, useContext, useMemo, useState } from "react";


// AuthContext: 인증 상태를 보관할 컨텍스트 객체
// useAuth(): 어디서든 인증 상태를 가져올 수 있는 커스텀 훅
// → const { user, token, login, logout } = useAuth();
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

//단순히 localStorage get/set/remove를 래핑한 유틸
// 키: "user", "token"
const storage = {
    get: (k) => localStorage.getItem(k),
    set: (k, v) => localStorage.setItem(k, v),
    del: (k) => localStorage.removeItem(k),
};

export default function AuthProvider({ children }) {
    // 초기상태를 설정
    // 앱이 시작될 때(localStorage에 저장된 값이 있다면) → 로그인 상태 복원
    // user: JSON 형태({ roles: [...], name: ... } 등)
    // token: 문자열(JWT 토큰)
    const [user, setUser] = useState(() => {
        const raw = storage.get("user");
        return raw ? JSON.parse(raw) : null;
    });
    const [token, setToken] = useState(() => storage.get("token"));

    //메모리에 로그인 정보 저장 (setUser, setToken)
    // 로컬스토리지에도 같은 정보 저장 (앱 새로고침 후 유지)
    // token이 없으면 null 처리
    const login = ({ user, token }) => {
        setUser(user);
        setToken(token ?? null);
        storage.set("user", JSON.stringify(user));
        if (token) storage.set("token", token);
    };
    //메모리 상태와 로컬스토리지에서 둘 다 제거
    const logout = () => {
        setUser(null);
        setToken(null);
        storage.del("user");
        storage.del("token");
    };
    //Context에 제공되는 값:
    // user: 현재 사용자 정보
    // token: 인증 토큰
    // login(user, token): 로그인 처리//
    // logout(): 로그아웃 처리
    const value = useMemo(() => ({ user, token, login, logout }), [user, token]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
