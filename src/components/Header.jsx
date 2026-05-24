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
    Paper,
    Popper,
    ClickAwayListener,
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
import { useUiStore } from "../pages/store/uiStore";
import logo from "../assets/rohitourlogo.png";
import { useState, useEffect, useRef } from "react";
import { searchProducts, logSearch } from "../api/clientApi";
import { getUncheckedCount } from "../api/bookingApi";
import { getInquiryNewCount } from "../api/inquiryApi";
import RealTimeKeywords from "./RealTimeKeywords";
import Tooltip from "@mui/material/Tooltip";
import LogoutIcon from "@mui/icons-material/Logout";
import YouTubeIcon from "@mui/icons-material/YouTube";
import InstagramIcon from "@mui/icons-material/Instagram";
import LoginDialog from "./auth/LoginDialog";
import SignUpDialog from "./auth/SignUpDialog";
import SocialTermsDialog from "./auth/SocialTermsDialog";
import loginImg from "../assets/login.png";
import signupImg from "../assets/signup.png";
import adminImg from "../assets/adminpage.png";
import reviewImg from "../assets/travelreview.png";


const CATEGORY_PATH = {
    '국내여행': 'domestic',
    '국외여행': 'air',
    '크루즈 해외여행': 'cruise',
    '수학여행': 'school',
};

const NAV_ITEMS = [
    { label: '국내여행',       path: '/tour/domestic', icon: <LandscapeIcon fontSize="small" />,      color: '#2e7d32' },
    { label: '국외여행',  path: '/tour/air',      icon: <FlightIcon fontSize="small" />,         color: '#e65100' },
    { label: '크루즈 해외여행', path: '/tour/cruise',  icon: <DirectionsBoatIcon fontSize="small" />, color: '#0277bd' },
    { label: '수학여행',       path: '/tour/school',   icon: <SchoolIcon fontSize="small" />,         color: '#3f51b5' },
];

const BRAND_GREEN = '#2e7d32';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { isLoginModalOpen, openLoginModal, closeLoginModal } = useUiStore();
    const [keyword, setKeyword] = useState("");
    const [signupOpen, setSignupOpen] = useState(false);
    const [oauthError, setOauthError] = useState("");
    const [termsOpen, setTermsOpen] = useState(false);
    const [pendingOAuthToken, setPendingOAuthToken] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [guestSnack, setGuestSnack] = useState(false);
    const [uncheckedCount, setUncheckedCount] = useState(0);
    const [inquiryNewCount, setInquiryNewCount] = useState(0);

    const [searchResults, setSearchResults] = useState([]);
    const [searchOpen, setSearchOpen] = useState(false);
    const debounceRef = useRef(null);
    const pcInputRef = useRef(null);

    const runSearch = (kw) => {
        if (!kw.trim()) {
            setSearchResults([]);
            setSearchOpen(false);
            return;
        }
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            try {
                const results = await searchProducts(kw.trim());
                setSearchResults(results);
                setSearchOpen(true);
            } catch {
                setSearchResults([]);
            }
        }, 300);
    };

    const handleKeywordChange = (e) => {
        const val = e.target.value;
        setKeyword(val);
        runSearch(val);
    };

    const handleSelectResult = (product) => {
        const cat = CATEGORY_PATH[product.rootCategoryName] || 'domestic';
        logSearch(keyword);
        setSearchOpen(false);
        setKeyword("");
        setSearchResults([]);
        navigate(`/tour/${cat}/${product.productId}`);
        window.scrollTo(0, 0);
    };

    const handlePopularClick = (kw) => {
        setKeyword(kw);
        runSearch(kw);
    };

    const closeSearch = () => {
        setSearchOpen(false);
    };

    const handleEnter = (e) => {
        if (e.key === 'Enter' && keyword.trim()) {
            logSearch(keyword.trim());
            setSearchOpen(false);
            navigate(`/search?q=${encodeURIComponent(keyword.trim())}`);
            window.scrollTo(0, 0);
        }
        if (e.key === 'Escape') closeSearch();
    };

    const clearKeyword = () => {
        setKeyword("");
        setSearchResults([]);
        setSearchOpen(false);
    };

    useEffect(() => {
        if (location.state?.oauthError) {
            setOauthError(location.state.oauthError);
            openLoginModal();
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

    useEffect(() => {
        if (!isAdmin) return;
        const fetchCount = () => {
            getUncheckedCount().then(r => setUncheckedCount(r.count ?? 0)).catch(() => {});
            getInquiryNewCount().then(r => setInquiryNewCount(r.count ?? 0)).catch(() => {});
        };
        fetchCount();
        const timer = setInterval(fetchCount, 30000);
        return () => clearInterval(timer);
    }, [isAdmin]);

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
                        flexWrap: { xs: 'wrap', md: 'nowrap' },
                        alignItems: "center",
                        gap: { xs: 1, md: 3 },
                        px: { xs: 1, md: 2 }
                    }}
                >
                    {/* 로고 */}
                    <Box sx={{ cursor: "pointer" }} onClick={() => { navigate("/"); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                        <Box component="img" src={logo} sx={{ height: { xs: 80, md: 190 } }} />
                    </Box>

                    {/* 검색 + 실시간 */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexShrink: 0,
                            order: { xs: 3, md: 0 },
                            flex: { xs: '1 0 100%', md: 'initial' },
                            pb: { xs: 1, md: 0 },
                        }}
                    >
                        <ClickAwayListener onClickAway={closeSearch}>
                            <Box sx={{ flex: { xs: 1, md: 'none' }, width: { md: 480, lg: 660 }, position: 'relative' }}>
                                <Box
                                    ref={pcInputRef}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        px: 2,
                                        py: 0.5,
                                        border: "2px solid #2e7d32",
                                        borderRadius: 10,
                                        bgcolor: '#fff',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                        transition: 'all 0.2s ease',
                                        '&:focus-within': {
                                            boxShadow: '0 4px 16px rgba(46,125,50,0.18)',
                                        },
                                    }}
                                >
                                    <SearchIcon sx={{ mr: 1, color: '#2e7d32', fontSize: 22 }} />
                                    <InputBase
                                        value={keyword}
                                        onChange={handleKeywordChange}
                                        onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
                                        onKeyDown={handleEnter}
                                        placeholder="어디로 떠나실까요?"
                                        sx={{ flex: 1, fontSize: '0.95rem' }}
                                        inputProps={{ translate: "no", lang: "ko" }}
                                    />
                                    {keyword && (
                                        <IconButton size="small" onClick={clearKeyword} sx={{ p: 0.3 }}>
                                            <CloseIcon fontSize="small" sx={{ color: '#999' }} />
                                        </IconButton>
                                    )}
                                </Box>

                                {/* 검색 결과 드롭다운 */}
                                <Popper
                                    open={searchOpen && searchResults.length > 0}
                                    anchorEl={pcInputRef.current}
                                    placement="bottom-start"
                                    style={{ zIndex: 1400, width: pcInputRef.current?.offsetWidth }}
                                >
                                    <Paper elevation={4} sx={{ mt: 0.5, maxHeight: 480, overflow: 'auto', borderRadius: 2 }}>
                                        {searchResults.map((product, idx) => (
                                            <Box
                                                key={product.productId}
                                                onClick={() => handleSelectResult(product)}
                                                sx={{
                                                    display: 'flex', alignItems: 'center', gap: 1.5,
                                                    px: 2, py: 1.2, cursor: 'pointer',
                                                    borderTop: idx > 0 ? '1px solid #f0f0f0' : 'none',
                                                    '&:hover': { bgcolor: '#f9f9f9' },
                                                }}
                                            >
                                                {product.thumbnailPath ? (
                                                    <Box
                                                        component="img"
                                                        src={product.thumbnailPath}
                                                        sx={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
                                                    />
                                                ) : (
                                                    <Box sx={{ width: 64, height: 48, bgcolor: '#eee', borderRadius: 1, flexShrink: 0 }} />
                                                )}
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography variant="body2" fontWeight={600} noWrap>{product.productName}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{product.rootCategoryName}</Typography>
                                                    {product.pricePerPerson && (
                                                        <Typography variant="caption" color={BRAND_GREEN} sx={{ ml: 1 }}>
                                                            {Number(product.pricePerPerson).toLocaleString()}원~
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        ))}
                                    </Paper>
                                </Popper>

                                {/* 검색 결과 없음 */}
                                <Popper
                                    open={searchOpen && searchResults.length === 0 && keyword.trim().length > 0}
                                    anchorEl={pcInputRef.current}
                                    placement="bottom-start"
                                    style={{ zIndex: 1400, width: pcInputRef.current?.offsetWidth }}
                                >
                                    <Paper elevation={4} sx={{ mt: 0.5, px: 2, py: 2, borderRadius: 2 }}>
                                        <Typography variant="body2" color="text.secondary">검색 결과가 없습니다.</Typography>
                                    </Paper>
                                </Popper>
                            </Box>
                        </ClickAwayListener>

                        {/* 실시간 검색어 */}
                        <RealTimeKeywords onKeywordClick={handlePopularClick} />
                    </Box>

                    {/* 사용자 영역 */}
                    <Box sx={{ display: "flex", flexDirection: 'column', alignItems: "center", ml: 'auto', order: { xs: 2, md: 0 }, gap: 0.3, alignSelf: 'flex-end', pb: 1, pr: { md: 0 } }}>
                        {/* 버튼 가로 배치 */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0 }}>
                        {!user ? (
                        <>
                            <Tooltip title="로그인">
                                <IconButton onClick={() => openLoginModal()} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box component="img" src={loginImg} alt="login"
                                        sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>로그인</Typography>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="회원가입">
                                <IconButton onClick={() => setSignupOpen(true)} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box component="img" src={signupImg} alt="signup"
                                        sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>회원가입</Typography>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="여행후기">
                                <IconButton onClick={handleReviewClick} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box component="img" src={reviewImg} alt="여행후기"
                                        sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20 }} />
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>여행후기</Typography>
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="문의하기">
                                <IconButton onClick={() => { navigate('/inquiry'); window.scrollTo(0, 0); }} sx={{ p: 0.5, flexDirection: 'column' }}>
                                    <Box sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography sx={{ fontSize: { xs: '0.85rem', md: '1.1rem' } }}>💬</Typography>
                                    </Box>
                                    <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>문의하기</Typography>
                                </IconButton>
                            </Tooltip>
                        </>
                        ) : (
                            <>
                                {isAdmin && (
                                    <Box sx={{ position: 'relative', display: 'inline-flex', flexDirection: 'column', alignItems: 'center' }}>
                                        {/* 미리보기용 하드코딩 — 실데이터 연결 전 */}
                                        <Box sx={{
                                            position: 'absolute', top: -34, left: '50%',
                                            transform: 'translateX(-50%)',
                                            display: 'flex', flexDirection: 'row', gap: 0.5,
                                            alignItems: 'center',
                                            '&::after': {
                                                content: '""',
                                                position: 'absolute', bottom: -5, left: '50%',
                                                transform: 'translateX(-50%)',
                                                borderWidth: '5px 4px 0 4px',
                                                borderStyle: 'solid',
                                                borderColor: '#555 transparent transparent transparent',
                                            },
                                        }}>
                                            {[
                                                { label: `예약신청 총 ${uncheckedCount > 99 ? '99+' : uncheckedCount}건`, color: '#d32f2f' },
                                                // { label: '결제완료 2건', color: '#2e7d32' }, // TODO: PG 연동 후 실데이터 연결
                                                { label: `문의 ${inquiryNewCount > 99 ? '99+' : inquiryNewCount}건`, color: '#1565c0' },
                                            ].map((badge) => (
                                                <Box key={badge.label} sx={{
                                                    bgcolor: badge.color, color: '#fff',
                                                    fontSize: '0.62rem', fontWeight: 700,
                                                    borderRadius: '10px', px: 1, py: 0.3,
                                                    whiteSpace: 'nowrap',
                                                    '@keyframes pulse': {
                                                        '0%':   { boxShadow: `0 0 0 0 ${badge.color}b3` },
                                                        '70%':  { boxShadow: `0 0 0 5px ${badge.color}00` },
                                                        '100%': { boxShadow: `0 0 0 0 ${badge.color}00` },
                                                    },
                                                    animation: 'pulse 1.5s infinite',
                                                }}>
                                                    {badge.label}
                                                </Box>
                                            ))}
                                        </Box>
                                        <Tooltip title="관리자 페이지">
                                            <IconButton onClick={() => navigate("/admin")} sx={{ p: 0.5, flexDirection: 'column', position: 'relative' }}>
                                                <Box component="img" src={adminImg} alt="admin"
                                                    sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20 }} />
                                                {uncheckedCount > 0 && (
                                                    <Box sx={{
                                                        position: 'absolute', top: 0, right: 0,
                                                        minWidth: 18, height: 18, borderRadius: 9,
                                                        bgcolor: '#d32f2f', color: '#fff',
                                                        fontSize: '0.7rem', fontWeight: 900,
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        px: 0.4,
                                                        animation: 'pulse 1.5s infinite',
                                                    }}>
                                                        !
                                                    </Box>
                                                )}
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>관리자 페이지</Typography>
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                )}
                                {!isAdmin && (
                                    <>
                                        <Tooltip title="여행후기">
                                            <IconButton onClick={handleReviewClick} sx={{ p: 0.5, flexDirection: 'column' }}>
                                                <Box component="img" src={reviewImg} alt="여행후기"
                                                    sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20 }} />
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>여행후기</Typography>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="예약 및 결제 이용내역">
                                            <IconButton onClick={() => { navigate('/client/bookings'); window.scrollTo(0, 0); }} sx={{ p: 0.5, flexDirection: 'column' }}>
                                                <Box sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography sx={{ fontSize: { xs: '0.85rem', md: '1.1rem' } }}>📋</Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>이용내역</Typography>
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="문의하기">
                                            <IconButton onClick={() => { navigate('/inquiry'); window.scrollTo(0, 0); }} sx={{ p: 0.5, flexDirection: 'column' }}>
                                                <Box sx={{ width: { xs: 26, md: 36 }, height: { xs: 26, md: 36 }, borderRadius: 20, bgcolor: '#e3f2fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Typography sx={{ fontSize: { xs: '0.85rem', md: '1.1rem' } }}>💬</Typography>
                                                </Box>
                                                <Typography variant="caption" sx={{ fontSize: '0.65rem', mt: 0.3, lineHeight: 1, color: '#000', fontWeight: 700 }}>문의하기</Typography>
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                )}
                                <Tooltip title="로그아웃">
                                    <IconButton onClick={async () => { await logout(); navigate("/"); }}>
                                        <LogoutIcon />
                                    </IconButton>
                                </Tooltip>
                            </>
                        )}
                        </Box>

                        {/* SNS 피드 — PC만 */}
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', mt: 0.5, gap: 0.3 }}>
                            <Typography variant="caption" sx={{ fontSize: '0.68rem', color: '#000', letterSpacing: 0.2, whiteSpace: 'nowrap', fontWeight: 600 }}>
                                실시간 로이투어 피드를 확인해보세요
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="유튜브">
                                    <IconButton size="small" sx={{ color: '#FF0000', p: 0.4 }}
                                        onClick={() => window.open('https://www.youtube.com/@rohitour_travel', '_blank', 'noopener')}>
                                        <YouTubeIcon sx={{ fontSize: 22 }} />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="인스타그램">
                                    <IconButton size="small" sx={{ color: '#E1306C', p: 0.4 }}
                                        onClick={() => window.open('https://www.instagram.com/rohitour_travel/', '_blank', 'noopener')}>
                                        <InstagramIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Box>

                        {/* 로그인 모달 */}
                        <LoginDialog
                            open={isLoginModalOpen}
                            onClose={() => { closeLoginModal(); setOauthError(""); }}
                            oauthError={oauthError}
                            onNeedsTerms={handleNeedsTerms}
                            onSignUp={() => { closeLoginModal(); setOauthError(""); setSignupOpen(true); }}
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
