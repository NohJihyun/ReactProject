import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useAuth } from "../auth/AuthProvider";

/**
 * 소셜 로그인 완료 후 백엔드가 리다이렉트하는 페이지
 *
 * 백엔드 흐름:
 *   네이버 인증 성공
 *   → OAuth2AuthenticationSuccessHandler
 *   → /oauth/callback?token=ACCESS_TOKEN&email=...&role=...
 *
 * 프론트 처리:
 *   1. URL에서 token 추출
 *   2. AuthProvider.loginWithToken() 호출 → 메모리 + localStorage 저장
 *   3. /로 리다이렉트
 */
export default function OAuthCallback() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { loginWithToken } = useAuth();

    useEffect(() => {
        const token      = searchParams.get("token");
        const error      = searchParams.get("error");
        const needsTerms = searchParams.get("needsTerms") === "true";

        const isPopup = localStorage.getItem("oauth_popup_mode") === "true";
        if (isPopup) localStorage.removeItem("oauth_popup_mode");

        if (error) {
            const message = error === "already_registered"
                ? "일반 회원가입으로 이미 가입된 계정입니다. 아이디/비밀번호로 로그인해주세요."
                : "소셜 로그인에 실패했습니다. 다시 시도해주세요.";
            if (isPopup) {
                localStorage.setItem("oauth_result", JSON.stringify({ type: "OAUTH_ERROR", message }));
                window.close();
            } else {
                navigate("/", { replace: true, state: { oauthError: message } });
            }
            return;
        }

        if (!token) {
            if (isPopup) window.close();
            else navigate("/", { replace: true });
            return;
        }

        if (isPopup) {
            const type = needsTerms ? "OAUTH_NEEDS_TERMS" : "OAUTH_SUCCESS";
            localStorage.setItem("oauth_result", JSON.stringify({ type, token }));
            window.close();
        } else {
            if (needsTerms) {
                // 비팝업 fallback: 홈으로 보내고 약관 다이얼로그 열기
                localStorage.setItem("oauth_pending_token", token);
                navigate("/", { replace: true, state: { oauthNeedsTerms: true } });
            } else {
                loginWithToken(token)
                    .then(() => navigate("/", { replace: true }))
                    .catch(() => navigate("/", { replace: true }));
            }
        }
    }, []);

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 10, gap: 2 }}>
            <CircularProgress sx={{ color: "#7CB342" }} />
            <Typography color="text.secondary">로그인 처리 중...</Typography>
        </Box>
    );
}
