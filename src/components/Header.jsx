import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    InputBase,
    Button,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    Snackbar,
    Alert,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import HomeIcon from "@mui/icons-material/Home";
import LandscapeIcon from "@mui/icons-material/Landscape";
import FlightIcon from "@mui/icons-material/Flight";
import DirectionsBoatIcon from "@mui/icons-material/DirectionsBoat";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import BusinessIcon from "@mui/icons-material/Business";
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
import reviewImg from "../assets/travelreview.png";


const NAV_ITEMS = [
    { label: '국내여행',       path: '/tour/domestic', icon: <LandscapeIcon fontSize="small" />,      color: '#2e7d32' },
    { label: '항공 해외여행',  path: '/tour/air',      icon: <FlightIcon fontSize="small" />,         color: '#e65100' },
    { label: '크루즈 해외여행', path: '/tour/cruise',  icon: <DirectionsBoatIcon fontSize="small" />, color: '#0277bd' },
    { label: '수학여행',       path: '/tour/school',   icon: <SchoolIcon fontSize="small" />,         color: '#3f51b5' },
];

const BRAND_GREEN = '#2e7d32';

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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [guestSnack, setGuestSnack] = useState(false);

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

    const handleReviewClick = () => {
        if (!user) {
            setGuestSnack(true);
        } else {
            navigate("/client/reviews");
            window.scrollTo(0, 0);
        }
    };

    return (
        <>
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
                        gap: { xs: 1, md: 3 },
                        px: { xs: 1, md: 2 }
                    }}
                >
                    {/* 로고 */}
                    <Box sx={{ cursor: "pointer" }} onClick={() => navigate("/")}>
                        <Box component="img" src={logo} sx={{ height: { xs: 60, md: 150 } }} />
                    </Box>

                    {/* 검색 + 실시간 — PC만 표시 */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            display: { xs: "none", md: "flex" },
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
                                    translate: "no",
                                    lang: "ko"
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

                    {/* 검색 아이콘 — 모바일만 표시 */}
                    <Box sx={{ display: { xs: "flex", md: "none" }, flexGrow: 1, justifyContent: "flex-end" }}>
                        <IconButton>
                            <SearchIcon />
                        </IconButton>
                    </Box>

                    {/* 사용자 영역 */}
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                        {!user ? (
                        <>
                            <Tooltip title="로그인">
                                <IconButton onClick={() => setLoginOpen(true)} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box component="img" src={loginImg} alt="login"
                                        sx={{ width: { xs: 30, md: 50 }, height: { xs: 30, md: 50 }, borderRadius: 20 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>로그인</Typography>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="회원가입">
                                <IconButton onClick={() => setSignupOpen(true)} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box component="img" src={signupImg} alt="signup"
                                        sx={{ width: { xs: 30, md: 50 }, height: { xs: 30, md: 50 }, borderRadius: 20 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>회원가입</Typography>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="여행후기">
                                <IconButton onClick={handleReviewClick} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box component="img" src={reviewImg} alt="여행후기"
                                        sx={{ width: { xs: 30, md: 50 }, height: { xs: 30, md: 50 }, borderRadius: 20 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>여행후기</Typography>
                                </IconButton>
                            </Tooltip>
                        </>
                        ) : (
                            <>
                                {isAdmin && (
                                    <Tooltip title="관리자 페이지">
                                        <IconButton onClick={() => navigate("/admin")} sx={{ p: 0.5, flexDirection: 'column' }}>
                                            <Box component="img" src={adminImg} alt="admin"
                                                sx={{ width: { xs: 30, md: 50 }, height: { xs: 30, md: 50 }, borderRadius: 20 }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>관리자페이지</Typography>
                                        </IconButton>
                                    </Tooltip>
                                )}
                                {!isAdmin && (
                                    <Tooltip title="여행후기">
                                        <IconButton onClick={handleReviewClick} sx={{ p: 0.5, flexDirection: 'column' }}>
                                            <Box component="img" src={reviewImg} alt="여행후기"
                                                sx={{ width: { xs: 30, md: 50 }, height: { xs: 30, md: 50 }, borderRadius: 20 }} />
                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>여행후기</Typography>
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="로그아웃">
                                    <IconButton onClick={() => { logout(); navigate("/"); }}>
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
                        <Snackbar
                            open={guestSnack}
                            autoHideDuration={6000}
                            onClose={() => setGuestSnack(false)}
                            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                            message="회원가입 후 사용할 수 있는 메뉴입니다."
                            action={
                                <Button
                                    color="primary"
                                    size="small"
                                    variant="contained"
                                    onClick={() => { setGuestSnack(false); setSignupOpen(true); }}
                                >
                                    회원가입
                                </Button>
                            }
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
                    <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
                        onClick={() => setDrawerOpen(true)}
                    >
                        <MenuIcon fontSize="small" />
                        <Typography variant="body2" fontWeight={600}>전체메뉴</Typography>
                    </Box>

                    <Box sx={{ display: { xs: "none", md: "flex" }, gap: 3 }}>
                        {NAV_ITEMS.map(item => (
                            <Typography
                                key={item.path}
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                    cursor: "pointer",
                                    color: location.pathname.startsWith(item.path) ? BRAND_GREEN : "inherit",
                                    '&:hover': { color: BRAND_GREEN },
                                }}
                                onClick={() => { navigate(item.path); window.scrollTo(0, 0); }}
                            >
                                {item.label}
                            </Typography>
                        ))}
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>

        {/* 전체메뉴 Drawer */}
        <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
            <Box sx={{ width: 280 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 2 }}>
                    <Typography variant="h6" fontWeight={700}>전체메뉴</Typography>
                    <IconButton onClick={() => setDrawerOpen(false)}><CloseIcon /></IconButton>
                </Box>
                <Divider />
                <List disablePadding>
                    {/* 홈 */}
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={location.pathname === '/'}
                            onClick={() => { navigate('/'); setDrawerOpen(false); window.scrollTo(0, 0); }}
                            sx={{ py: 1.5, '&.Mui-selected': { bgcolor: '#f1f8e9' }, '&.Mui-selected .MuiListItemIcon-root': { color: BRAND_GREEN }, '&.Mui-selected .MuiListItemText-primary': { color: BRAND_GREEN, fontWeight: 700 } }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: '#9e9e9e' }}>
                                <HomeIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="홈" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                    <Divider sx={{ mx: 2 }} />
                    {/* 카테고리 */}
                    {NAV_ITEMS.map(item => (
                        <ListItem key={item.path} disablePadding>
                            <ListItemButton
                                selected={location.pathname.startsWith(item.path)}
                                onClick={() => { navigate(item.path); setDrawerOpen(false); window.scrollTo(0, 0); }}
                                sx={{ py: 1.5, '&.Mui-selected': { bgcolor: '#f1f8e9' }, '&.Mui-selected .MuiListItemIcon-root': { color: item.color }, '&.Mui-selected .MuiListItemText-primary': { color: item.color, fontWeight: 700 } }}
                            >
                                <ListItemIcon sx={{ minWidth: 36, color: '#9e9e9e' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                    <Divider sx={{ mx: 2 }} />
                    {/* 회사소개 */}
                    <ListItem disablePadding>
                        <ListItemButton
                            selected={location.pathname === '/about'}
                            onClick={() => { navigate('/about'); setDrawerOpen(false); window.scrollTo(0, 0); }}
                            sx={{ py: 1.5, '&.Mui-selected': { bgcolor: '#f1f8e9' }, '&.Mui-selected .MuiListItemIcon-root': { color: '#1976d2' }, '&.Mui-selected .MuiListItemText-primary': { color: '#1976d2', fontWeight: 700 } }}
                        >
                            <ListItemIcon sx={{ minWidth: 36, color: '#9e9e9e' }}>
                                <BusinessIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="회사소개" primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                </List>
            </Box>
        </Drawer>
        </>
    );
}
//console.log("Header user =", user);
