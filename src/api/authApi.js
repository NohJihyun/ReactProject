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
//refreshTokenApi()는 accessToken “문자열만” 리턴
//AuthProvider에서 쓰기 좋게 그대로 써도 되는데, 의미가 더 명확하게 하려면 이름을 reissueApi로 바꾸거나, 최소한 주석만 맞춰도 OK.
export async function refreshTokenApi() {
    const res = await httpRefresh.post("/api/auth/reissue");
    // 예: { accessToken: "..." }
    return res.data.accessToken;
}

export async function logoutApi() {
    await http.post("/api/auth/logout");
}
//meApi() 는 로그인 여부 체크용 refresh 토큰 로직 실행 안함 -> 즉 401 이면 로그인 안됨으로 간주
//현재 로그인된 사용자의 정보를 확인하는 API 호출 함수
// 즉 **"지금 로그인 상태인지 체크하는 함수"**야.
// "로그인 여부 확인용" 401이면 그냥 비로그인 처리하면 끝
// me는 refresh 스킵 플래그를 붙인다
// me는 401이면 "비로그인"으로 보고 null 반환 (에러로 던지지 않음)
export async function meApi() {
    const res = await http.get("/api/users/me", {
        skipAuthRefresh: true,
        validateStatus: (status) =>
            (status >= 200 && status < 300) || status === 401,
    });

    if (res.status === 401) return null;
    return res.data;
}

/** 이메일 인증코드 발송 */
export async function sendEmailCodeApi(email) {
    await http.post("/api/auth/email/send", { email }, { skipAuthRefresh: true });
}

/** 이메일 인증코드 검증 */
export async function verifyEmailCodeApi(email, code) {
    await http.post("/api/auth/email/verify", { email, code }, { skipAuthRefresh: true });
}

/** 회원가입 */
export async function signUpApi(body) {
    await http.post("/api/auth/signup", body, { skipAuthRefresh: true });
}

/** 아이디 찾기 - 이름 + 휴대폰 */
export async function findLoginIdApi(name, phone) {
    const res = await http.post("/api/auth/find-id", { name, phone }, { skipAuthRefresh: true });
    return res.data.loginId;
}

/** 비밀번호 재설정 이메일 발송 - loginId + 이름 + 휴대폰 */
export async function sendPasswordResetApi(loginId, name, phone) {
    await http.post("/api/auth/password/send", { loginId, name, phone }, { skipAuthRefresh: true });
}

/** 비밀번호 재설정 - 토큰 + 새 비밀번호 */
export async function resetPasswordApi(token, newPassword) {
    await http.post("/api/auth/password/reset", { token, newPassword }, { skipAuthRefresh: true });
}