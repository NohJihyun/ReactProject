import { useState, useEffect } from 'react';
import { Box, Container, Typography, Divider, Stack } from '@mui/material';
import LandscapeIcon      from '@mui/icons-material/Landscape';
import FlightIcon         from '@mui/icons-material/Flight';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import SchoolIcon         from '@mui/icons-material/School';
import EmojiEventsIcon    from '@mui/icons-material/EmojiEvents';
import FavoriteIcon       from '@mui/icons-material/Favorite';
import GroupsIcon         from '@mui/icons-material/Groups';

const HERO_SLIDES = [
    {
        bg: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)',
        overline: 'ROHITOUR',
        title: '특별한 여행,\n특별한 추억',
        sub: '수학여행부터 국내·해외 개인·단체여행까지\n로이투어가 함께합니다.',
        circles: [
            { size: 400, top: -120, right: -80,  opacity: 0.06 },
            { size: 250, bottom: -60, left: -60, opacity: 0.08 },
            { size: 150, top: 40,   right: 200,  opacity: 0.05 },
        ],
    },
    {
        bg: 'linear-gradient(135deg, #1b5e20 0%, #2e7d32 45%, #388e3c 100%)',
        overline: 'ROHITOUR',
        title: '여성기업이 만드는\n특별한 여정',
        sub: '직접 기획한 여행상품으로\n새로운 여행 경험을 제안합니다.',
        circles: [
            { size: 360, top: -100, right: -60,  opacity: 0.06 },
            { size: 220, bottom: -50, left: -40, opacity: 0.07 },
            { size: 130, top: 60,   right: 180,  opacity: 0.05 },
        ],
    },
];

const VALUES = [
    {
        icon: <FavoriteIcon sx={{ fontSize: 28 }} />,
        color: '#e53935',
        title: '고객 중심',
        desc: '모든 여행 기획의 출발점은 고객입니다. 고객의 기대를 넘는 경험을 만들기 위해 항상 노력합니다.',
    },
    {
        icon: <EmojiEventsIcon sx={{ fontSize: 28 }} />,
        color: '#f57c00',
        title: '전문성',
        desc: '수학여행부터 크루즈 해외여행까지, 각 분야의 전문 지식과 풍부한 경험을 바탕으로 최적의 여행을 설계합니다.',
    },
    {
        icon: <GroupsIcon sx={{ fontSize: 28 }} />,
        color: '#1976d2',
        title: '신뢰',
        desc: '한국여행업협회 보증 가입, 종합여행업 등록 업체로서 고객이 안심하고 여행을 맡길 수 있는 회사입니다.',
    },
];

const BUSINESSES = [
    { icon: <SchoolIcon />,         color: '#3f51b5', gradient: 'linear-gradient(135deg,#3f51b5,#5c6bc0)', label: '수학여행',       desc: '소중한 추억을 만드는 맞춤형 교육 여행' },
    { icon: <LandscapeIcon />,      color: '#2e7d32', gradient: 'linear-gradient(135deg,#2e7d32,#43a047)', label: '국내여행',       desc: '우리나라 곳곳의 숨겨진 명소 탐방' },
    { icon: <FlightIcon />,         color: '#e65100', gradient: 'linear-gradient(135deg,#e65100,#ef6c00)', label: '항공 해외여행', desc: '세계 각지의 특별한 경험' },
    { icon: <DirectionsBoatIcon />, color: '#0277bd', gradient: 'linear-gradient(135deg,#0277bd,#0288d1)', label: '크루즈 해외여행', desc: '바다 위에서 즐기는 럭셔리 여행' },
];

function HeroBanner() {
    const [current, setCurrent] = useState(0);
    const [fading,  setFading]  = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setFading(true);
            setTimeout(() => {
                setCurrent(prev => (prev + 1) % HERO_SLIDES.length);
                setFading(false);
            }, 400);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const slide = HERO_SLIDES[current];

    return (
        <Box sx={{
            background: slide.bg,
            color: 'white',
            py: { xs: 8, md: 14 },
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.6s ease',
        }}>
            {slide.circles.map((c, i) => (
                <Box key={i} sx={{
                    position: 'absolute',
                    width: c.size, height: c.size,
                    borderRadius: '50%', bgcolor: 'white',
                    opacity: c.opacity,
                    top: c.top, bottom: c.bottom,
                    left: c.left, right: c.right,
                    transition: 'opacity 0.4s',
                }} />
            ))}

            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative', zIndex: 1,
                    opacity: fading ? 0 : 1,
                    transform: fading ? 'translateY(8px)' : 'translateY(0)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
            >
                <Typography variant="overline"
                    sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 4, display: 'block', mb: 1 }}>
                    {slide.overline}
                </Typography>
                <Typography variant="h2" fontWeight={900}
                    sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: 1.2, mb: 2, whiteSpace: 'pre-line' }}>
                    {slide.title}
                </Typography>
                <Typography variant="h6"
                    sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, maxWidth: 480, whiteSpace: 'pre-line' }}>
                    {slide.sub}
                </Typography>
            </Container>

            <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 1, zIndex: 2 }}>
                {HERO_SLIDES.map((_, i) => (
                    <Box
                        key={i}
                        onClick={() => { setFading(true); setTimeout(() => { setCurrent(i); setFading(false); }, 400); }}
                        sx={{
                            width: i === current ? 24 : 8,
                            height: 8,
                            borderRadius: 4,
                            bgcolor: 'white',
                            opacity: i === current ? 1 : 0.4,
                            cursor: 'pointer',
                            transition: 'width 0.3s ease, opacity 0.3s ease',
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}

export default function AboutPage() {
    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh' }}>

            <HeroBanner />

            <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>

                {/* 회사 소개 */}
                <Box sx={{ mb: { xs: 7, md: 10 } }}>
                    <Typography variant="overline"
                        sx={{ color: '#1976d2', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 1 }}>
                        COMPANY
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        로이투어를 소개합니다
                    </Typography>
                    <Box sx={{ height: 4, width: 56, bgcolor: '#1976d2', borderRadius: 2, mb: 4 }} />
                    <Stack spacing={2.5} sx={{ maxWidth: 720 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                            (주)로이투어는 경기도 안양에 본사를 둔 종합여행업 등록 여행사로, 수학여행·국내여행·항공 해외여행·크루즈 해외여행을 전문으로 기획·운영합니다.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                            고객 한 분 한 분의 여정이 단순한 이동이 아닌, 평생 기억에 남는 특별한 경험이 될 수 있도록 세심하게 준비합니다. 학생들의 첫 단체 여행부터 가족·단체의 해외 크루즈까지, 모든 여행에 로이투어의 전문성과 진심을 담습니다.
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 2 }}>
                            한국여행업협회 영업보증보험 가입 업체로서, 고객이 안심하고 여행을 계획하실 수 있는 신뢰할 수 있는 파트너가 되겠습니다.
                        </Typography>
                    </Stack>
                </Box>

                <Divider sx={{ mb: { xs: 7, md: 10 } }} />

                {/* 핵심 가치 */}
                <Box sx={{ mb: { xs: 7, md: 10 } }}>
                    <Typography variant="overline"
                        sx={{ color: '#1976d2', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 1 }}>
                        VALUES
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        로이투어의 약속
                    </Typography>
                    <Box sx={{ height: 4, width: 56, bgcolor: '#1976d2', borderRadius: 2, mb: 4 }} />
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                        gap: 3,
                    }}>
                        {VALUES.map(v => (
                            <Box key={v.title} sx={{
                                p: 3.5, bgcolor: '#fff', borderRadius: 3,
                                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                                borderTop: `4px solid ${v.color}`,
                            }}>
                                <Box sx={{ color: v.color, mb: 2 }}>{v.icon}</Box>
                                <Typography variant="h6" fontWeight={800} sx={{ mb: 1.5 }}>{v.title}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.9 }}>{v.desc}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

                <Divider sx={{ mb: { xs: 7, md: 10 } }} />

                {/* 주요 사업 */}
                <Box>
                    <Typography variant="overline"
                        sx={{ color: '#1976d2', letterSpacing: 3, fontWeight: 700, display: 'block', mb: 1 }}>
                        BUSINESS
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mb: 3, fontSize: { xs: '1.5rem', md: '2rem' } }}>
                        주요 사업 분야
                    </Typography>
                    <Box sx={{ height: 4, width: 56, bgcolor: '#1976d2', borderRadius: 2, mb: 4 }} />
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                        gap: 2.5,
                    }}>
                        {BUSINESSES.map(b => (
                            <Box key={b.label} sx={{
                                p: 3, bgcolor: '#fff', borderRadius: 3,
                                boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
                                textAlign: 'center',
                            }}>
                                <Box sx={{
                                    width: 56, height: 56, borderRadius: 2,
                                    background: b.gradient,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'white', mx: 'auto', mb: 2,
                                }}>
                                    {b.icon}
                                </Box>
                                <Typography variant="body1" fontWeight={800} sx={{ mb: 0.75 }}>{b.label}</Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7, display: 'block' }}>{b.desc}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>

            </Container>
        </Box>
    );
}
