import { http, httpRefresh } from "./http";

/*
 * "인증 관련 API 호출 함수" 모음
 * loginApi, refreshTokenApi, logoutApi, meApi 같은 걸 여기로 몰아둠
 * 아래 엔드포인트는 너희 백엔드에 맞게 수정해.
 * - /auth/login
 * - /auth/refresh
 * - /auth/logout
 * - /users/me
 */

export async function loginApi(body) {
    // body 예: { email, password }
    // 로그인 실패(401) "토큰 만료"가 아닌 , "자격증명 실패"
    const res = await http.post("/api/auth/login", body, { skipAuthRefresh: true });
    // 예: { accessToken: "..." }
    return res.data;
}

export async function refreshTokenApi() {
    const res = await httpRefresh.post("/api/auth/reissue");
    // 예: { accessToken: "..." }
    return res.data.accessToken;
}

export async function logoutApi() {
    await http.post("/api/auth/logout");
}
// "로그인 여부 확인용" 401이면 그냥 비로그인 처리하면 끝
// me는 refresh 스킵 플래그를 붙인다
// me는 401이면 "비로그인"으로 보고 null 반환 (에러로 던지지 않음)
export async function meApi() {
    const res = await http.get("/users/me", {
        skipAuthRefresh: true,
        validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 401,
    });

    if (res.status === 401) return null;
    return res.data;
}