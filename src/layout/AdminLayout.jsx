import { AppBar, Toolbar, Typography, Drawer, List, ListItemButton, Box, IconButton, Fab, Zoom } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUncheckedCount } from '../api/bookingApi';
import { getInquiryNewCount } from '../api/inquiryApi';
import { useAuth } from '../auth/AuthProvider';
//import logo from '../assets/rohitour.jpg'

const SUPER_ADMINS = ['admin@rohitour.com'];

/* 관리자 레이아웃 */
const drawerWidth = 240;
export default function AdminLayout() {
    const { user } = useAuth();
    const isSuperAdmin = user?.email && SUPER_ADMINS.includes(user.email);
    const [open, setOpen] = useState(false);
    const [showTop, setShowTop] = useState(false);
    const [uncheckedCount, setUncheckedCount] = useState(0);
    const [inquiryNewCount, setInquiryNewCount] = useState(0);

    useEffect(() => {
        const onScroll = () => setShowTop(window.scrollY > 300);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const fetchCount = () => {
            getUncheckedCount().then(r => setUncheckedCount(r.count ?? 0)).catch(() => {});
            getInquiryNewCount().then(r => setInquiryNewCount(r.count ?? 0)).catch(() => {});
        };
        fetchCount();
        const timer = setInterval(fetchCount, 30000);
        window.addEventListener('booking-status-changed', fetchCount);
        window.addEventListener('inquiry-status-changed', fetchCount);
        return () => {
            clearInterval(timer);
            window.removeEventListener('booking-status-changed', fetchCount);
            window.removeEventListener('inquiry-status-changed', fetchCount);
        };
    }, []);
    // 자바스크립트 배열안 요소 객체 키,값형태
    // 키 label, to 값 대시보드 등
    // 역할 : 메뉴에서 사용할 이동 경로(to)를 미리 정의한다.
    // const : 재할당 불가
    const items = [
        { label: '홈페이지 이용 현황', to: '/admin' },
        { label: '권한 관리', to: '/admin/users' },
        { label: '카테고리 관리', to: '/admin/categories' },
        { label: '여행상품 관리', to: '/admin/products' },
        { label: '예약 및 결제 관리 현황', to: '/admin/bookings' },
        { label: '고객 리뷰 관리', to: '/admin/review' },
        { label: '문의 관리', to: '/admin/inquiries' },
    ];

    return (
        <Box sx={{ display:'flex' }}>
            <AppBar position="fixed" sx={{ zIndex:(t)=>t.zIndex.drawer+1, backgroundColor: '#7CB342' }}>
                <Toolbar>
                    <IconButton edge="start" onClick={()=>setOpen(true)} sx={{ mr:2, display:{ md:'none' }}}>
                        <MenuIcon/>
                    </IconButton>
                    <Typography
                        variant="h6"
                        component={Link}
                        to="/"
                        sx={{
                            flex: 1,
                            textDecoration: 'none',
                            color: 'inherit',
                            cursor: 'pointer',
                            fontWeight: 700
                        }}
                    >
                        로이투어 매니저
                    </Typography>
                </Toolbar>
            </AppBar>

            {/* 영구 드로어 */}
            <Drawer variant="permanent" sx={{
                display:{ xs:'none', md:'block' },
                '& .MuiDrawer-paper':{ width:drawerWidth, boxSizing:'border-box' }
            }}>
                <Toolbar />
                <List>
                    {items.map(i => {
                        const bookingBadge = i.to === '/admin/bookings' && uncheckedCount > 0;
                        const inquiryBadge = i.to === '/admin/inquiries' && inquiryNewCount > 0;
                        return (
                            <ListItemButton
                                key={i.to}
                                component={NavLink}
                                to={i.to}
                                end
                                sx={{ '&.active': { bgcolor: 'action.selected' } }}
                            >
                                {(bookingBadge || inquiryBadge) ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                        <Box sx={{ flex: 1 }}>{i.label}</Box>
                                        {bookingBadge && (
                                            <Box component="span" sx={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                minWidth: 22, height: 22, borderRadius: 20,
                                                bgcolor: 'error.main', color: '#fff',
                                                fontSize: '0.68rem', fontWeight: 700, px: 0.6, flexShrink: 0,
                                                '@keyframes pulse': {
                                                    '0%':   { boxShadow: '0 0 0 0 rgba(211,47,47,0.7)' },
                                                    '70%':  { boxShadow: '0 0 0 8px rgba(211,47,47,0)' },
                                                    '100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0)' },
                                                },
                                                animation: 'pulse 1.5s infinite',
                                            }}>
                                                {uncheckedCount > 99 ? '99+' : uncheckedCount}
                                            </Box>
                                        )}
                                        {inquiryBadge && (
                                            <Box component="span" sx={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                minWidth: 22, height: 22, borderRadius: 20,
                                                bgcolor: '#1565c0', color: '#fff',
                                                fontSize: '0.68rem', fontWeight: 700, px: 0.6, flexShrink: 0,
                                                '@keyframes pulseBlue': {
                                                    '0%':   { boxShadow: '0 0 0 0 rgba(21,101,192,0.7)' },
                                                    '70%':  { boxShadow: '0 0 0 8px rgba(21,101,192,0)' },
                                                    '100%': { boxShadow: '0 0 0 0 rgba(21,101,192,0)' },
                                                },
                                                animation: 'pulseBlue 1.5s infinite',
                                            }}>
                                                {inquiryNewCount > 99 ? '99+' : inquiryNewCount}
                                            </Box>
                                        )}
                                    </Box>
                                ) : i.label}
                            </ListItemButton>
                        );
                    })}
                </List>
            </Drawer>

            {/* 모바일 드로어 */}
            <Drawer open={open} onClose={()=>setOpen(false)} sx={{
                display:{ md:'none' }, '& .MuiDrawer-paper':{ width:drawerWidth }
            }}>
                <List>
                    {items.map(i => {
                        const bookingBadge = i.to === '/admin/bookings' && uncheckedCount > 0;
                        const inquiryBadge = i.to === '/admin/inquiries' && inquiryNewCount > 0;
                        return (
                            <ListItemButton
                                key={i.to}
                                component={NavLink}
                                to={i.to}
                                end
                                onClick={()=>setOpen(false)}
                                sx={{ '&.active': { bgcolor: 'action.selected' } }}
                            >
                                {(bookingBadge || inquiryBadge) ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                        <Box sx={{ flex: 1 }}>{i.label}</Box>
                                        {bookingBadge && (
                                            <Box component="span" sx={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                minWidth: 22, height: 22, borderRadius: 20,
                                                bgcolor: 'error.main', color: '#fff',
                                                fontSize: '0.68rem', fontWeight: 700, px: 0.6, flexShrink: 0,
                                                '@keyframes pulse': {
                                                    '0%':   { boxShadow: '0 0 0 0 rgba(211,47,47,0.7)' },
                                                    '70%':  { boxShadow: '0 0 0 8px rgba(211,47,47,0)' },
                                                    '100%': { boxShadow: '0 0 0 0 rgba(211,47,47,0)' },
                                                },
                                                animation: 'pulse 1.5s infinite',
                                            }}>
                                                {uncheckedCount > 99 ? '99+' : uncheckedCount}
                                            </Box>
                                        )}
                                        {inquiryBadge && (
                                            <Box component="span" sx={{
                                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                minWidth: 22, height: 22, borderRadius: 20,
                                                bgcolor: '#1565c0', color: '#fff',
                                                fontSize: '0.68rem', fontWeight: 700, px: 0.6, flexShrink: 0,
                                                '@keyframes pulseBlue': {
                                                    '0%':   { boxShadow: '0 0 0 0 rgba(21,101,192,0.7)' },
                                                    '70%':  { boxShadow: '0 0 0 8px rgba(21,101,192,0)' },
                                                    '100%': { boxShadow: '0 0 0 0 rgba(21,101,192,0)' },
                                                },
                                                animation: 'pulseBlue 1.5s infinite',
                                            }}>
                                                {inquiryNewCount > 99 ? '99+' : inquiryNewCount}
                                            </Box>
                                        )}
                                    </Box>
                                ) : i.label}
                            </ListItemButton>
                        );
                    })}
                </List>
            </Drawer>

            {/* 본문은 서랍 폭만큼 밀기 */}
            <Box component="main" sx={{
                flexGrow:1, p:{ xs: 1.5, md: 3 },
                ml:{ md: `${drawerWidth}px` },
                width:{ md: `calc(100% - ${drawerWidth}px)` }
            }}>
                <Toolbar />
                <Outlet />
            </Box>

            {/* 스크롤 상단 버튼 */}
            <Zoom in={showTop}>
                <Fab
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    size="medium"
                    sx={{
                        position: "fixed",
                        bottom: 32,
                        right: 24,
                        bgcolor: "#000",
                        color: "#fff",
                        "&:hover": { bgcolor: "#333" },
                        zIndex: 1000,
                    }}
                >
                    <KeyboardArrowUpIcon />
                </Fab>
            </Zoom>
        </Box>
    );
}
