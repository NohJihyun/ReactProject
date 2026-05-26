import { useState, useEffect } from 'react';
import { keyframes } from '@emotion/react';
import {
    Dialog, Box, Typography, Button, Checkbox, FormControlLabel,
    Stack, Divider, IconButton
} from '@mui/material';
import CheckCircleIcon      from '@mui/icons-material/CheckCircle';
import ArrowForwardIosIcon  from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon  from '@mui/icons-material/ArrowBackIosNew';
import HeadsetMicIcon       from '@mui/icons-material/HeadsetMic';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import FlightTakeoffIcon    from '@mui/icons-material/FlightTakeoff';
import EmojiEventsIcon      from '@mui/icons-material/EmojiEvents';
import VerifiedIcon         from '@mui/icons-material/Verified';
import FavoriteIcon         from '@mui/icons-material/Favorite';

const STORAGE_KEY = 'rohitour_popup_hide_until';

const STEPS = [
    { icon: <AssignmentTurnedInIcon sx={{ fontSize: 20, color: '#7CB342' }} />, label: '예약 신청' },
    { icon: <HeadsetMicIcon         sx={{ fontSize: 20, color: '#7CB342' }} />, label: '담당자 검토' },
    { icon: <CheckCircleIcon        sx={{ fontSize: 20, color: '#7CB342' }} />, label: '맞춤 상담' },
    { icon: <FlightTakeoffIcon      sx={{ fontSize: 20, color: '#7CB342' }} />, label: '여행 출발' },
];

const WOMEN_BADGES = [
    { icon: <VerifiedIcon sx={{ fontSize: 28, color: '#9c27b0' }} />, title: '공식 인증', desc: '여성기업 공식 인증을 받은 신뢰할 수 있는 여행사입니다.' },
    { icon: <EmojiEventsIcon sx={{ fontSize: 28, color: '#f57c00' }} />, title: '전문 서비스', desc: '풍부한 경험을 바탕으로 최고의 여행 서비스를 제공합니다.' },
    { icon: <FavoriteIcon sx={{ fontSize: 28, color: '#e91e63' }} />, title: '고객 중심', desc: '고객 한 분 한 분의 여행이 특별해질 수 있도록 정성을 다합니다.' },
];

function Slide1() {
    return (
        <Box>
            {/* 헤더 */}
            <Box sx={{
                background: 'linear-gradient(135deg, #33691E 0%, #558B2F 40%, #7CB342 100%)',
                px: { xs: 2, sm: 4 }, pt: 4, pb: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                {/* 배경 원형 장식 */}
                <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
                <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 90,  height: 90,  borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />

                <Box sx={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 64, height: 64, borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.2)', mb: 1.5,
                }}>
                    <HeadsetMicIcon sx={{ fontSize: 34, color: '#fff' }} />
                </Box>
                <Typography variant="h6" fontWeight={800} color="#fff" letterSpacing={0.5}>
                    예약부터 여행까지
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.85)" mt={0.5}>
                    담당자가 직접 도와드립니다
                </Typography>
            </Box>

            {/* 본문 */}
            <Box sx={{ px: { xs: 2, sm: 3.5 }, pt: 3, pb: 2.5 }}>
                {/* 안내 문구 */}
                <Box sx={{
                    bgcolor: '#F1F8E9', borderRadius: 2, px: 2.5, py: 2, mb: 3,
                    borderLeft: '4px solid #7CB342',
                }}>
                    <Typography variant="body2" color="#33691E" lineHeight={1.85} fontWeight={500}>
                        현재 <strong>온라인 결제 기능을 개발 검토 중</strong>입니다.
                        지금은 원하시는 상품을 예약 신청해 주시면
                        담당자가 직접 확인 후 빠르게 연락드려 여행 준비를 도와드립니다. 😊
                    </Typography>
                </Box>

                {/* 예약 프로세스 */}
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
                    예약 진행 과정
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mt={1.5}>
                    {STEPS.map((s, i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
                            <Stack alignItems="center" spacing={0.5}>
                                <Box sx={{
                                    width: { xs: 36, sm: 46 }, height: { xs: 36, sm: 46 }, borderRadius: '50%',
                                    bgcolor: '#F1F8E9',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    border: '2px solid #C5E1A5',
                                }}>
                                    {s.icon}
                                </Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.58rem', sm: '0.65rem' } }}>
                                    {s.label}
                                </Typography>
                            </Stack>
                            {i < STEPS.length - 1 && (
                                <Box sx={{ width: { xs: 10, sm: 18 }, height: 2, bgcolor: '#C5E1A5', mx: { xs: 0.2, sm: 0.5 }, mb: 2, flexShrink: 0 }} />
                            )}
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}

function Slide2() {
    return (
        <Box>
            {/* 헤더 */}
            <Box sx={{
                background: 'linear-gradient(135deg, #4A148C 0%, #7B1FA2 50%, #AB47BC 100%)',
                px: { xs: 2, sm: 4 }, pt: 4, pb: 4,
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
            }}>
                <Box sx={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />
                <Box sx={{ position: 'absolute', bottom: -20, left: -20, width: 90,  height: 90,  borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.07)' }} />

                {/* 여성기업 배지 */}
                <Box sx={{
                    display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.15)',
                    borderRadius: 3, px: 3, py: 1.5, mb: 1.5,
                    border: '1.5px solid rgba(255,255,255,0.3)',
                }}>
                    <VerifiedIcon sx={{ fontSize: 36, color: '#E1BEE7', mb: 0.5 }} />
                    <Typography variant="caption" color="rgba(255,255,255,0.9)" fontWeight={700} letterSpacing={2} sx={{ fontSize: '0.7rem' }}>
                        CERTIFIED
                    </Typography>
                </Box>
                <Typography variant="h6" fontWeight={800} color="#fff" letterSpacing={0.5}>
                    여성기업 인증 업체
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.85)" mt={0.5}>
                    로이투어는 공식 인증된 여성기업입니다
                </Typography>
            </Box>

            {/* 본문 */}
            <Box sx={{ px: { xs: 2, sm: 3.5 }, pt: 3, pb: 2.5 }}>
                <Stack spacing={2}>
                    {WOMEN_BADGES.map((b, i) => (
                        <Box key={i} sx={{
                            display: 'flex', alignItems: 'flex-start', gap: 2,
                            bgcolor: i === 0 ? '#F3E5F5' : i === 1 ? '#FFF3E0' : '#FCE4EC',
                            borderRadius: 2, px: 2, py: 1.8,
                        }}>
                            <Box sx={{ flexShrink: 0, mt: 0.2 }}>{b.icon}</Box>
                            <Box>
                                <Typography variant="body2" fontWeight={700} color="text.primary">
                                    {b.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" lineHeight={1.7}>
                                    {b.desc}
                                </Typography>
                            </Box>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}

const slideFromRight = keyframes({
    from: { opacity: 0, transform: 'translateX(40px)' },
    to:   { opacity: 1, transform: 'translateX(0)' },
});

const slideFromLeft = keyframes({
    from: { opacity: 0, transform: 'translateX(-40px)' },
    to:   { opacity: 1, transform: 'translateX(0)' },
});

export default function NoticePopup() {
    const [open, setOpen]           = useState(false);
    const [slide, setSlide]         = useState(0);
    const [dir, setDir]             = useState('fromRight');
    const [hideToday, setHideToday] = useState(false);
    const TOTAL = 2;

    useEffect(() => {
        const hideUntil = localStorage.getItem(STORAGE_KEY);
        if (hideUntil && new Date().toDateString() === hideUntil) return;
        setOpen(true);
    }, []);

    const handleClose = () => {
        if (hideToday) {
            localStorage.setItem(STORAGE_KEY, new Date().toDateString());
        }
        setOpen(false);
    };

    const goTo = (next) => {
        setDir(next > slide ? 'fromRight' : 'fromLeft');
        setSlide(next);
    };

    useEffect(() => {
        if (!open) return;
        const timer = setInterval(() => {
            setDir('fromRight');
            setSlide(s => (s + 1) % TOTAL);
        }, 7000);
        return () => clearInterval(timer);
    }, [open]);

    return (
        <Dialog
            open={open}
            onClose={() => {}}
            disableEscapeKeyDown
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, overflow: 'hidden', m: { xs: 2, sm: 3 } }
            }}
        >
            {/* 슬라이드 */}
            <Box key={slide} sx={{ overflow: 'hidden', animation: `${dir === 'fromRight' ? slideFromRight : slideFromLeft} 0.3s ease` }}>
                {slide === 0 ? <Slide1 /> : <Slide2 />}
            </Box>

            <Divider />

            {/* 하단 네비게이션 */}
            <Box sx={{
                px: 2.5, py: 1.5,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                bgcolor: '#fafafa',
            }}>
                {/* 오늘 하루 보지 않기 */}
                <FormControlLabel
                    control={
                        <Checkbox
                            size="small"
                            checked={hideToday}
                            onChange={e => setHideToday(e.target.checked)}
                            sx={{ color: 'text.disabled' }}
                        />
                    }
                    label={
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                            오늘 하루 보지 않기
                        </Typography>
                    }
                    sx={{ m: 0 }}
                />

                {/* 슬라이드 컨트롤 + 닫기 */}
                <Stack direction="row" alignItems="center" spacing={1}>
                    <IconButton size="small" onClick={() => goTo(slide - 1)} disabled={slide === 0}>
                        <ArrowBackIosNewIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    {/* 점 인디케이터 */}
                    <Stack direction="row" spacing={0.6}>
                        {Array.from({ length: TOTAL }).map((_, i) => (
                            <Box key={i} onClick={() => goTo(i)} sx={{
                                width: i === slide ? 18 : 8, height: 8,
                                borderRadius: 4,
                                bgcolor: i === slide ? '#7CB342' : '#ddd',
                                cursor: 'pointer',
                                transition: 'all 0.25s',
                            }} />
                        ))}
                    </Stack>
                    <IconButton size="small" onClick={() => goTo(slide + 1)} disabled={slide === TOTAL - 1}>
                        <ArrowForwardIosIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Button size="small" variant="contained" onClick={handleClose}
                        sx={{ bgcolor: '#7CB342', '&:hover': { bgcolor: '#558B2F' }, fontWeight: 700, ml: 0.5, borderRadius: 2 }}>
                        닫기
                    </Button>
                </Stack>
            </Box>
        </Dialog>
    );
}
