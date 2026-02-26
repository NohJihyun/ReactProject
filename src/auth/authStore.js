import { create } from "zustand";

/**
 * user 예시:
 * {
 *   id: 1,
 *   email: "a@a.com",
 *   roles: ["USER", "ADMIN"]  // 또는 ["ROLE_USER", "ROLE_ADMIN"]일 수도 있음
 * }
 */
export const useAuthStore = create((set, get) => ({
    accessToken: null,        // 메모리 저장 (localStorage X)
    user: null,
    isAuthenticated: false,
    bootstrapped: false,

    setAccessToken: (token) => set({ accessToken: token }),
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setBootstrapped: (v) => set({ bootstrapped: v }),

    logoutLocal: () =>
        set({
            accessToken: null,
            user: null,
            isAuthenticated: false,
        }),

    // roles 포맷이 "ADMIN" 이든 "ROLE_ADMIN"이든 둘 다 대응
    hasAnyRole: (allowedRoles = []) => {
        const user = get().user;
        const userRoles = user?.roles || [];

        const normalizedUserRoles = userRoles.map((r) =>
            r.startsWith("ROLE_") ? r.substring(5) : r
        );

        return allowedRoles.some((r) => normalizedUserRoles.includes(r));
    },
}));