// src/components/auth/LoginDialog.jsx
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Button, Stack, IconButton, Typography, Divider, Box
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import { useAuth } from "../../auth/AuthProvider";

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

export default function LoginDialog({ open, onClose }) {
    const { login } = useAuth(); // AuthProvider에 login()이 있다고 가정
    const [loginId, setLoginId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleNormalLogin = async () => {
        setErrorMsg("");
        setLoading(true);
        try {
            await login({ email: loginId, password });
            onClose();
        } catch (e) {
            setErrorMsg(e?.message || "로그인 실패");
        } finally {
            setLoading(false);
        }
    };

    const handleSocialLogin = (provider) => {
        window.location.href = OAUTH_START_URL[provider];
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
            <DialogTitle sx={{ display: "flex", alignItems: "center" }}>
                <Typography fontWeight={800} sx={{ flex: 1 }}>로그인</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </DialogTitle>

            <DialogContent>
                {/* 1) 일반 로그인 */}
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="아이디"
                        value={loginId}
                        onChange={(e) => setLoginId(e.target.value)}
                        autoComplete="username"
                        fullWidth
                    />
                    <TextField
                        label="비밀번호"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        fullWidth
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