import { Box, Container, Typography, Divider, Stack } from '@mui/material';
import PhoneIcon  from '@mui/icons-material/Phone';
import EmailIcon  from '@mui/icons-material/Email';
import PlaceIcon  from '@mui/icons-material/Place';
import { Link } from 'react-router-dom';

const LINKS = [
    { label: '회사소개',         path: '/about' },
    { label: '이용약관',         path: null },
    { label: '개인정보처리방침', path: null },
    { label: '여행약관',         path: null },
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
                        <Typography
                            variant="h5"
                            fontWeight={900}
                            sx={{
                                color: '#fff',
                                letterSpacing: 2,
                                mb: 1,
                                fontSize: { xs: '1.3rem', md: '1.5rem' },
                            }}
                        >
                            ROHITOUR
                        </Typography>
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
                        <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ color: '#fff', mb: 2, letterSpacing: 0.5 }}
                        >
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
