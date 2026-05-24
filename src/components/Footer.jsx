import { Box, Container, Typography, Divider, Stack } from '@mui/material';
import PhoneIcon  from '@mui/icons-material/Phone';
import EmailIcon  from '@mui/icons-material/Email';
import PlaceIcon  from '@mui/icons-material/Place';
import { Link } from 'react-router-dom';

const LINKS = [
    { label: '회사소개',         path: '/about' },
    { label: '이용약관',         path: '/terms' },
    { label: '개인정보처리방침', path: '/privacy' },
    { label: '여행약관',         path: '/travel-terms' },
];

const Footer = () => {
    return (
        <Box
            component="footer"
            sx={{ bgcolor: '#1a1a2e', color: 'rgba(255,255,255,0.85)' }}
        >
            <Container maxWidth="lg">
                {/* 상단: 브랜드 + 정보 */}
                <Box
                    sx={{
                        py: { xs: 5, md: 6 },
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                        gap: { xs: 4, md: 6 },
                    }}
                >
                    {/* 왼쪽: 브랜드 + 사업자 정보 */}
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                            <Typography
                                variant="h5"
                                fontWeight={900}
                                sx={{
                                    color: '#fff',
                                    letterSpacing: 2,
                                    fontSize: { xs: '1.3rem', md: '1.5rem' },
                                }}
                            >
                                ROHITOUR
                            </Typography>
                            <Box component="a" href="https://www.instagram.com/rohitour_travel/" target="_blank" rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, transition: 'background 0.2s' }}>
                                <Box component="svg" viewBox="0 0 24 24" sx={{ width: 16, height: 16, fill: 'url(#igGradFooter2)', flexShrink: 0 }}>
                                    <defs>
                                        <linearGradient id="igGradFooter2" x1="0%" y1="100%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#f09433" />
                                            <stop offset="50%" stopColor="#dc2743" />
                                            <stop offset="100%" stopColor="#bc1888" />
                                        </linearGradient>
                                    </defs>
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </Box>
                            </Box>
                            <Box component="a" href="https://www.youtube.com/@rohitour_travel" target="_blank" rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: '8px', bgcolor: 'rgba(255,255,255,0.08)', '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' }, transition: 'background 0.2s' }}>
                                <Box component="svg" viewBox="0 0 24 24" sx={{ width: 16, height: 16, flexShrink: 0 }}>
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z" fill="#FF0000"/>
                                    <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#ffffff"/>
                                </Box>
                            </Box>
                        </Box>
                        <Typography
                            variant="body2"
                            sx={{ color: 'rgba(255,255,255,0.5)', mb: 2.5, fontSize: '0.8rem' }}
                        >
                            특별한 여행, 특별한 추억
                        </Typography>

                        <Stack spacing={0.75}>
                            {[
                                { label: '상호명',           value: '(주)로이투어' },
                                { label: '대표자',           value: '노수정' },
                                { label: '기업구분',         value: '여성기업' },
                                { label: '사업자등록번호',   value: '845-81-03904' },
                                { label: '관광사업',         value: '종합여행업' },
                                { label: '영업보증보험',     value: '5,000만원 (피보험자: 한국여행업협회)' },
                            ].map(({ label, value }) => (
                                <Stack key={label} direction="row" spacing={1.5}>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: 'rgba(255,255,255,0.4)', minWidth: 110, flexShrink: 0, lineHeight: 1.8 }}
                                    >
                                        {label}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}
                                    >
                                        {value}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>
                    </Box>

                    {/* 오른쪽: 연락처 */}
                    <Box>
                        <Typography variant="body2" fontWeight={700} sx={{ color: '#fff', letterSpacing: 0.5, mb: 2 }}>
                            고객센터
                        </Typography>

                        <Stack spacing={2}>
                            <Stack direction="row" alignItems="flex-start" spacing={1.2}>
                                <PhoneIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', mt: '2px', flexShrink: 0 }} />
                                <Box>
                                    <Typography variant="h6" fontWeight={800} sx={{ color: '#fff', lineHeight: 1.2, fontSize: '1.2rem' }}>
                                        031-466-9600
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.45)' }}>
                                        평일 09:00 – 18:00 (점심 12:00 – 13:00)
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={1.2}>
                                <PhoneIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                    FAX 031-472-8880
                                </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="center" spacing={1.2}>
                                <EmailIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                                    with@rohitour.com
                                </Typography>
                            </Stack>

                            <Stack direction="row" alignItems="flex-start" spacing={1.2}>
                                <PlaceIcon sx={{ fontSize: 17, color: 'rgba(255,255,255,0.45)', mt: '2px', flexShrink: 0 }} />
                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                                    경기도 안양시 만안구 석수로 42, 2층 202호 (석수동, 럭키아파트상가동)
                                </Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Box>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* 면책 고지 */}
                <Stack spacing={1} sx={{ py: 3 }}>
                    {[
                        '부득이한 사정에 의해 확정된 여행일정이 변경되는 경우 여행자의 사전 동의를 받습니다.',
                        '(주)로이투어는 항공사가 제공하는 개별 항공권 및 여행사가 제공하는 일부 여행상품에 대해 통신판매중개자의 지위를 가지며, 해당 상품, 상품정보, 거래에 관한 의무와 책임은 판매자에게 있습니다.',
                        '로이투어의 법인계좌 또는 가상계좌가 아닌 다른 계좌로 입금하신 경우 발생하는 피해에 관하여, 당사는 책임지지 않습니다. 타 계좌의 입금을 유도하는 행위가 발생하는 경우 반드시 로이투어 고객센터로 문의하거나 신고하여 주시기 바랍니다.',
                    ].map((text, i) => (
                        <Typography key={i} variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, display: 'block' }}>
                            ※ {text}
                        </Typography>
                    ))}
                </Stack>

                <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

                {/* 하단: 약관 링크 + 저작권 */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ py: 2.5 }}
                >
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                        {LINKS.map((link, i) => (
                            link.path ? (
                                <Link
                                    key={link.label}
                                    to={link.path}
                                    onClick={() => window.scrollTo(0, 0)}
                                    style={{
                                        color: 'rgba(255,255,255,0.6)',
                                        fontSize: '0.78rem',
                                        textDecoration: 'none',
                                    }}
                                >
                                    {link.label}
                                </Link>
                            ) : (
                                <Typography
                                    key={link.label}
                                    sx={{
                                        color: i === 2 ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                                        fontWeight: i === 2 ? 700 : 400,
                                        fontSize: '0.78rem',
                                        cursor: 'default',
                                    }}
                                >
                                    {link.label}
                                </Typography>
                            )
                        ))}
                    </Stack>
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.35)' }}>
                        © 2026 ROHITOUR. All rights reserved.
                    </Typography>
                </Stack>
            </Container>
        </Box>
    );
};

export default Footer;
