import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    InputBase,
    Button
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import logo from "../assets/rohitourlogo.png";
import { useState, useEffect } from "react";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginDialog from "./auth/LoginDialog";
import SignUpDialog from "./auth/SignUpDialog";
import SocialTermsDialog from "./auth/SocialTermsDialog";
import loginImg from "../assets/login.png";
import signupImg from "../assets/signup.png";
import adminImg from "../assets/adminpage.png";


export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [keyword, setKeyword] = useState("");
    const [loginOpen, setLoginOpen] = useState(false);
    const [signupOpen, setSignupOpen] = useState(false);
    const [oauthError, setOauthError] = useState("");
    const [termsOpen, setTermsOpen] = useState(false);
    const [pendingOAuthToken, setPendingOAuthToken] = useState(null);

    useEffect(() => {
        if (location.state?.oauthError) {
            setOauthError(location.state.oauthError);
            setLoginOpen(true);
            window.history.replaceState({}, "");
        }
        if (location.state?.oauthNeedsTerms) {
            const token = localStorage.getItem("oauth_pending_token");
            if (token) {
                setPendingOAuthToken(token);
                setTermsOpen(true);
            }
            window.history.replaceState({}, "");
        }
    }, [location.state]);

    const handleNeedsTerms = (token) => {
        setPendingOAuthToken(token);
        setTermsOpen(true);
    };

    const isAdmin = user?.role === "ADMIN";

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{ backgroundColor: "#fff", color: "#000" }}
        >

            {/* ================= 1단 헤더 ================= */}
            <Toolbar sx={{ px: 0 }}>
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 1280,
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        px: 2
                    }}
                >
                    {/* 로고 */}
                    <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
                        <Box component="img" src={logo} sx={{ height: 150 }} />
                    </Box>

                    {/* 검색 + 실시간 */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            maxWidth: 720
                        }}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                alignItems: "center",
                                px: 2,
                                border: "1px solid #ddd",
                                borderRadius: 2
                            }}
                        >
                            <SearchIcon sx={{ mr: 1, color: "gray" }} />
                            <InputBase
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                placeholder="어디로 떠나실까요?"
                                sx={{ flex: 1 }}
                                inputProps={{
                                    translate: "no",    //번역금지, 텍스트가 변경되는 요인 제거
                                    lang: "ko"          //언어 한국어
                                }}
                            />
                        </Box>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ whiteSpace: "nowrap" }}
                        >
                            제주도 · 서귀포
                        </Typography>
                    </Box>

                    {/* 사용자 영역 */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {!user ? (
                        <>
                            <Tooltip title="로그인">
                                <IconButton onClick={() => setLoginOpen(true)} sx={{ p: 0.5 }}>
                                    <Box
                                        component="img"
                                        src={loginImg}
                                        alt="login"
                                        sx={{ width: 80, height: 80, borderRadius: 20 }}
                                    />
                                </IconButton>
                            </Tooltip>
                            {/* 회원가입 */}
                            <Tooltip title="회원가입">
                                <IconButton onClick={() => setSignupOpen(true)} sx={{ p: 0.5 }}>
                                    <Box
                                        component="img"
                                        src={signupImg}
                                        alt="signup"
                                        sx={{ width: 80, height: 80, borderRadius: 20 }}
                                    />
                                </IconButton>
                            </Tooltip>
                        </>
                        ) : (
                            <>
                                {isAdmin && (
                                    <Tooltip title="관리자 페이지">
                                        <IconButton onClick={() => navigate("/admin")} sx={{ p: 0.5 }}>
                                            <Box
                                                component="img"
                                                src={adminImg}
                                                alt="admin"
                                                sx={{ width: 80, height: 80, borderRadius: 20 }}
                                            />
                                        </IconButton>
                                    </Tooltip>
                                )}

                                <Tooltip title="로그아웃">
                                    <IconButton
                                        onClick={() => {
                                            logout();
                                            navigate("/");
                                        }}
                                    >
                                        <LogoutIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}

                        {/* 로그인 모달 */}
                        <LoginDialog
                            open={loginOpen}
                            onClose={() => { setLoginOpen(false); setOauthError(""); }}
                            oauthError={oauthError}
                            onNeedsTerms={handleNeedsTerms}
                        />
                        <SignUpDialog open={signupOpen} onClose={() => setSignupOpen(false)} />
                        <SocialTermsDialog
                            open={termsOpen}
                            pendingToken={pendingOAuthToken}
                            onSuccess={() => { setTermsOpen(false); setPendingOAuthToken(null); }}
                            onClose={() => { setTermsOpen(false); setPendingOAuthToken(null); }}
                        />
                    </Box>
                </Box>
            </Toolbar>


            {/* ================= 2단 헤더 ================= */}
            <Toolbar
                sx={{
                    minHeight: 48,
                    borderTop: "1px solid #eee",
                    px: 0
                }}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 1280,
                        mx: "auto",
                        display: "flex",
                        alignItems: "center",
                        gap: 3,
                        px: 2
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MenuIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>
                            전체메뉴
                        </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: 3 }}>
                        <Typography variant="body2">해외여행</Typography>
                        <Typography variant="body2">국내여행</Typography>
                        <Typography variant="body2">비행기</Typography>
                        <Typography variant="body2">호텔</Typography>
                        <Typography variant="body2">크루즈</Typography>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
//console.log("Header user =", user);
