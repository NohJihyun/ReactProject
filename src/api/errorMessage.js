/**
 * Axios 에러에서 사용자 친화적 메시지 추출
 * 1순위: 백엔드가 내려준 message
 * 2순위: 상태코드별 기본 메시지
 * 3순위: 네트워크/알 수 없는 오류
 */
export function getErrorMessage(e) {
    // 백엔드 응답 메시지 우선
    const serverMsg = e?.response?.data?.message;
    if (serverMsg) return serverMsg;

    const status = e?.response?.status;
    if (status === 400) return "입력 정보를 다시 확인해주세요.";
    if (status === 401) return "인증이 필요합니다. 다시 로그인해주세요.";
    if (status === 403) return "접근 권한이 없습니다.";
    if (status === 404) return "요청한 정보를 찾을 수 없습니다.";
    if (status === 409) return "이미 사용 중인 정보입니다.";
    if (status >= 500) return "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";

    // 네트워크 연결 오류
    if (!e?.response) return "네트워크 연결을 확인해주세요.";

    return "오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
}
