// src/components/auth/LoginDialog.jsx
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack, IconButton, Typography, Divider, Box, Alert, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { findLoginIdApi, sendPasswordResetApi } from "../../api/authApi";
import { getErrorMessage } from "../../api/errorMessage";

import naverImg from "../../assets/naver.png";
import kakaoImg from "../../assets/kakao.png";
import googleImg from "../../assets/google.png";
/*
 * 로그인 폼 다이얼로그 컴포넌트
 */
const API_BASE = process.env.REACT_APP_API_BASE_URL || "";

const OAUTH_START_URL = {
    naver: `${API_BASE}/oauth2/authorization/naver`,
    kakao: `${API_BASE}/oauth2/authorization/kakao`,
    google: `${API_BASE}/oauth2/authorization/google`,
};

export default function LoginDialog({ open, onClose, oauthError = "", onNeedsTerms, onSignUp }) {
    const { login, loginWithToken } = useAuth();
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    // 아이디 찾기
    const [findIdMode, setFindIdMode] = useState(false);
    const [findName, setFindName] = useState("");
    const [findPhone, setFindPhone] = useState("");
    const [findLoading, setFindLoading] = useState(false);
    const [findResult, setFindResult] = useState("");
    const [findError, setFindError] = useState("");

    // 비밀번호 찾기
    const [findPwMode, setFindPwMode] = useState(false);
    const [pwLoginId, setPwLoginId] = useState("");
    const [pwName, setPwName] = useState("");
    const [pwPhone, setPwPhone] = useState("");
    const [pwLoading, setPwLoading] = useState(false);
    const [pwResult, setPwResult] = useState(false);
    const [pwError, setPwError] = useState("");

    const handleNormalLogin = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            await login({ email: loginId, password });
            onClose();
        } catch (e) {
            setErrorMsg(getErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        const url = OAUTH_START_URL[provider];

        // 네이버는 popup을 인앱 브라우저로 감지해 차단 → 리다이렉트 방식
        if (provider === "naver") {
            window.location.href = url;
            return;
        }

        localStorage.setItem("oauth_popup_mode", "true");
        window.open(url, "socialLogin", "width=500,height=650,top=100,left=100,noopener,noreferrer");

        // storage 이벤트: noopener 환경에서도 동일 origin 창 간 통신 가능
        const handleStorage = (e) => {
            if (e.key !== "oauth_result") return;
            window.removeEventListener("storage", handleStorage);
            clearTimeout(cleanup);

            try {
                const data = JSON.parse(e.newValue);
                localStorage.removeItem("oauth_result");
                if (data?.type === "OAUTH_SUCCESS") {
                    loginWithToken(data.token).then(() => onClose());
                } else if (data?.type === "OAUTH_NEEDS_TERMS") {
                    onClose();
                    onNeedsTerms?.(data.token);
                } else if (data?.type === "OAUTH_ERROR") {
                    setErrorMsg(data.message || "소셜 로그인에 실패했습니다.");
                }
            } catch {}
        };

        window.addEventListener("storage", handleStorage);

        // 10분 후 자동 정리
        const cleanup = setTimeout(() => {
            window.removeEventListener("storage", handleStorage);
        }, 10 * 60 * 1000);
    };

    const handleFindId = async () => {
        setFindError("");
        setFindResult("");
        if (!findName || !findPhone) {
            setFindError("이름과 휴대폰 번호를 입력해주세요.");
            return;
        }
        setFindLoading(true);
        try {
            const id = await findLoginIdApi(findName, findPhone);
            setFindResult(id);
        } catch (e) {
            setFindError(getErrorMessage(e));
        } finally {
            setFindLoading(false);
        }
    };

    const handleCloseFindId = () => {
        setFindIdMode(false);
        setFindName("");
        setFindPhone("");
        setFindResult("");
        setFindError("");
    };

    const handleFindPw = async () => {
        setPwError("");
        if (!pwLoginId || !pwName || !pwPhone) {
            setPwError("모든 항목을 입력해주세요.");
            return;
        }
        setPwLoading(true);
        try {
            await sendPasswordResetApi(pwLoginId, pwName, pwPhone);
            setPwResult(true);
        } catch (e) {
            setPwError(getErrorMessage(e));
        } finally {
            setPwLoading(false);
        }
    };

    const handleCloseFindPw = () => {
        setFindPwMode(false);
        setPwLoginId("");
        setPwName("");
        setPwPhone("");
        setPwResult(false);
        setPwError("");
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs"
            slotProps={{ paper: { translate: "no" } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={800} sx={{ flex: 1 }}>
                    {findIdMode ? "아이디 찾기" : findPwMode ? "비밀번호 찾기" : "로그인"}
                </Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent>
                <Box className="notranslate" translate="no">

                {/* 아이디 찾기 화면 */}
                <Box sx={{ display: findIdMode ? "block" : "none" }}>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {findError && <Alert severity="error">{findError}</Alert>}
                        {findResult && (
                            <Alert severity="success">
                                회원님의 아이디: <strong>{findResult}</strong>
                            </Alert>
                        )}
                        <TextField
                            label="이름"
                            value={findName}
                            onChange={(e) => setFindName(e.target.value)}
                            fullWidth
                            placeholder="예) 홍길동"
                        />
                        <TextField
                            label="휴대폰 번호"
                            value={findPhone}
                            onChange={(e) => setFindPhone(e.target.value)}
                            fullWidth
                            placeholder="예) 010-1234-5678"
                        />
                        <Button
                            variant="contained"
                            size="large"
                            fullWidth
                            disabled={findLoading}
                            onClick={handleFindId}
                            sx={{ backgroundColor: "#7CB342", fontWeight: 600, py: 1.5, "&:hover": { backgroundColor: "#689F38" } }}
                        >
                            {findLoading ? <CircularProgress size={24} color="inherit" /> : "아이디 찾기"}
                        </Button>
                        <Button variant="text" onClick={handleCloseFindId} sx={{ color: "text.secondary" }}>
                            로그인으로 돌아가기
                        </Button>
                    </Stack>
                </Box>

                {/* 비밀번호 찾기 화면 */}
                <Box sx={{ display: findPwMode ? "block" : "none" }}>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Typography sx={{ color: "error.main", fontSize: 12, whiteSpace: "nowrap" }}>
                            * 회원가입 시 인증한 이메일로 재설정 링크를 발송합니다.
                        </Typography>
                        {pwError && <Alert severity="error">{pwError}</Alert>}
                        {pwResult ? (
                            <Alert severity="success">
                                입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다. 이메일을 확인해주세요.
                            </Alert>
                        ) : (
                            <>
                                <TextField
                                    label="이메일"
                                    value={pwLoginId}
                                    onChange={(e) => setPwLoginId(e.target.value)}
                                    fullWidth
                                    placeholder="회원가입 시 인증한 이메일"
                                    slotProps={{ htmlInput: { translate: "no", spellCheck: "false" } }}
                                />
                                <TextField
                                    label="이름"
                                    value={pwName}
                                    onChange={(e) => setPwName(e.target.value)}
                                    fullWidth
                                    placeholder="예) 홍길동"
                                />
                                <TextField
                                    label="휴대폰 번호"
                                    value={pwPhone}
                                    onChange={(e) => setPwPhone(e.target.value)}
                                    fullWidth
                                    placeholder="예) 010-1234-5678"
                                />
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={pwLoading}
                                    onClick={handleFindPw}
                                    sx={{ backgroundColor: "#7CB342", fontWeight: 600, py: 1.5, "&:hover": { backgroundColor: "#689F38" } }}
                                >
                                    {pwLoading ? <CircularProgress size={24} color="inherit" /> : "재설정 링크 받기"}
                                </Button>
                            </>
                        )}
                        <Button variant="text" onClick={handleCloseFindPw} sx={{ color: "text.secondary" }}>
                            로그인으로 돌아가기
                        </Button>
                    </Stack>
                </Box>

                {/* 1) 일반 로그인 */}
                <Box sx={{ display: (findIdMode || findPwMode) ? "none" : "block" }}>
                <>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    {oauthError && <Alert severity="error">{oauthError}</Alert>}
                    <TextField
                        label="아이디"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        autoComplete="username"
                        fullWidth
                        placeholder="가입 시 등록한 이메일 아이디를 입력하세요"
                        slotProps={{
                            htmlInput: {
                                translate: "no",
                                spellCheck: "false",
                            },
                        }}
                    />
                    <TextField
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        fullWidth
                        placeholder="비밀번호를 입력하세요"
                        slotProps={{
                            htmlInput: {
                                translate: "no",
                                spellCheck: "false",
                            },
                        }}
                    />

                    {errorMsg && <Typography color="error" variant="body2">{errorMsg}</Typography>}

                    <Button
                        variant="contained"
                        size="large"
                        fullWidth
                        disabled={loading}
                        onClick={handleNormalLogin}
                        sx={{
                            backgroundColor: "#7CB342",
                            fontWeight: 600,
                            py: 1.5,
                            "&:hover": {
                                backgroundColor: "#689F38"
                            }
                        }}
                    >
                        {loading ? "로그인 중..." : "로그인"}
                    </Button>

                    {/* 로그인 버튼 아래 텍스트 링크 영역 */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: 1,
                            mt: -0.5
                        }}
                    >
                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setFindIdMode(true)}
                            sx={{
                                minWidth: "auto",
                                p: 0,
                                color: "text.secondary",
                                fontSize: 14,
                                fontWeight: 500,
                                textTransform: "none"
                            }}
                        >
                            아이디 찾기
                        </Button>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ lineHeight: 1 }}
                        >
                            |
                        </Typography>

                        <Button
                            variant="text"
                            size="small"
                            onClick={() => setFindPwMode(true)}
                            sx={{
                                minWidth: "auto",
                                p: 0,
                                color: "text.secondary",
                                fontSize: 14,
                                fontWeight: 500,
                                textTransform: "none"
                            }}
                        >
                            비밀번호 찾기
                        </Button>

                        {onSignUp && (
                            <>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ lineHeight: 1 }}
                                >
                                    |
                                </Typography>

                                <Button
                                    variant="text"
                                    size="small"
                                    onClick={onSignUp}
                                    sx={{
                                        minWidth: "auto",
                                        p: 0,
                                        color: "primary.main",
                                        fontSize: 14,
                                        fontWeight: 600,
                                        textTransform: "none"
                                    }}
                                >
                                    회원가입
                                </Button>
                            </>
                        )}
                    </Box>
                </Stack>

                <Box sx={{ my: 3 }}>
                    <Divider>
                        <Typography variant="caption" color="text.secondary">
                            또는 간편 로그인
                        </Typography>
                    </Divider>
                </Box>

                {/* 2) 간편 로그인 */}
                <Stack spacing={1.2}>
                    <SocialImgButton img={naverImg} text="네이버로 계속하기" onClick={() => handleSocialLogin("naver")} />
                    <SocialImgButton img={kakaoImg} text="카카오로 계속하기" onClick={() => handleSocialLogin("kakao")} />
                    <SocialImgButton img={googleImg} text="구글로 계속하기" onClick={() => handleSocialLogin("google")} />
                </Stack>
                </>
                </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    fullWidth
                    disableElevation
                    sx={{
                        backgroundColor: "#7CB342",
                        color: "#fff",
                        fontWeight: 600,
                        py: 1.4,
                        "&:hover": {
                            backgroundColor: "#7CB342"   // hover도 동일
                        }
                    }}
                >
                    닫기
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function SocialImgButton({ img, text, onClick }) {
    return (
        <Button
            onClick={onClick}
            variant="outlined"
            size="large"
            fullWidth
            sx={{
                justifyContent: "flex-start",
                py: 1.8,              // 버튼 높이 증가
                gap: 2,
                textTransform: "none",
                fontSize: 16,
                borderRadius: 2
            }}
            startIcon={
                <Box
                    component="img"
                    src={img}
                    alt=""
                    sx={{
                        width: 60,       //28~32 추천
                        height: 60,
                        objectFit: "contain"
                    }}
                />
            }
        >
            {text}
        </Button>
    );
}