import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Container, Skeleton, Stack } from '@mui/material';
import SchoolIcon       from '@mui/icons-material/School';
import LandscapeIcon    from '@mui/icons-material/Landscape';
import FlightIcon       from '@mui/icons-material/Flight';
import PeopleIcon       from '@mui/icons-material/People';
import AttachMoneyIcon  from '@mui/icons-material/AttachMoney';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { getProductsByCategory } from '../../api/clientApi';

const IMG_BASE = 'http://localhost:8080';

const SECTIONS = [
    {
        key:   '수학여행',
        id:    'school',
        label: '수학여행',
        icon:  <SchoolIcon />,
        color: '#3f51b5',
        gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
        desc:  '소중한 추억을 만드는 특별한 여행',
    },
    {
        key:   '국내여행',
        id:    'domestic',
        label: '국내여행',
        icon:  <LandscapeIcon />,
        color: '#2e7d32',
        gradient: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)',
        desc:  '우리나라 곳곳의 숨겨진 명소 탐방',
    },
    {
        key:   '해외여행',
        id:    'overseas',
        label: '해외여행',
        icon:  <FlightIcon />,
        color: '#e65100',
        gradient: 'linear-gradient(135deg, #e65100 0%, #ef6c00 100%)',
        desc:  '세계 각지의 특별한 경험',
    },
];

const formatPrice = (price) => {
    if (!price) return null;
    return Number(price).toLocaleString('ko-KR') + '원~';
};

/* ── 상품 카드 ── */
function ProductCard({ product, onClick }) {
    const price = formatPrice(product.pricePerPerson);

    return (
        <Box
            onClick={onClick}
            sx={{
                borderRadius: 3,
                overflow: 'hidden',
                bgcolor: 'white',
                boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
                transition: 'transform 0.25s, box-shadow 0.25s',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
                },
            }}
        >
            {/* 썸네일 */}
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '72%', bgcolor: '#f0f0f0' }}>
                {product.thumbnailPath ? (
                    <img
                        src={`${IMG_BASE}${product.thumbnailPath}`}
                        alt={product.productName}
                        style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <Box sx={{
                        position: 'absolute', inset: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#ccc', fontSize: 48,
                    }}>
                        🏞
                    </Box>
                )}
                {product.isFeatured === 'Y' && (
                    <Chip
                        label="추천"
                        size="small"
                        sx={{
                            position: 'absolute', top: 10, left: 10,
                            bgcolor: '#ff6f00', color: 'white', fontWeight: 700,
                            fontSize: '0.7rem',
                        }}
                    />
                )}
            </Box>

            {/* 내용 */}
            <Box sx={{ p: 2.5 }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        mb: 0.75,
                        fontSize: '1rem',
                    }}
                >
                    {product.productName}
                </Typography>

                {product.summary && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            mb: 1.5,
                            lineHeight: 1.6,
                            minHeight: '3.2em',
                            fontSize: '0.875rem',
                        }}
                    >
                        {product.summary}
                    </Typography>
                )}

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {product.minPeople && (
                        <Chip
                            icon={<PeopleIcon sx={{ fontSize: '15px !important' }} />}
                            label={`${product.minPeople}인 이상`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                    {price && (
                        <Chip
                            icon={<AttachMoneyIcon sx={{ fontSize: '15px !important' }} />}
                            label={price}
                            size="small"
                            variant="outlined"
                            color="primary"
                            sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </Stack>
            </Box>
        </Box>
    );
}

/* ── 카드 스켈레톤 ── */
function CardSkeleton() {
    return (
        <Box sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
            <Skeleton variant="rectangular" width="100%" height={220} />
            <Box sx={{ p: 2 }}>
                <Skeleton variant="text" width="70%" height={28} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="80%" />
            </Box>
        </Box>
    );
}

/* ── 카테고리 섹션 ── */
function CategorySection({ section }) {
    const [products, setProducts] = useState([]);
    const [loading,  setLoading]  = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getProductsByCategory(section.key)
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [section.key]);

    return (
        <Box component="section" sx={{ pt: 1, pb: 0 }}>
            <Container maxWidth="lg">
                {/* 섹션 헤더 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box
                        sx={{
                            width: 44, height: 44, borderRadius: 2,
                            background: section.gradient,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white',
                        }}
                    >
                        {section.icon}
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                            {section.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {section.desc}
                        </Typography>
                    </Box>
                </Box>

                {/* 구분선 */}
                <Box sx={{ height: 3, width: 48, borderRadius: 2, background: section.gradient, mb: 2.5 }} />

                {/* 스켈레톤 */}
                {loading && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                    </Box>
                )}

                {/* 상품 없음 */}
                {!loading && products.length === 0 && (
                    <Box sx={{
                        py: 8, textAlign: 'center', borderRadius: 3,
                        bgcolor: '#f9f9f9', border: '1px dashed #ddd',
                    }}>
                        <Typography color="text.disabled">등록된 상품이 없습니다.</Typography>
                    </Box>
                )}

                {/* Swiper */}
                {!loading && products.length > 0 && (
                    <Box sx={{
                        '& .swiper-button-prev, & .swiper-button-next': {
                            top: 'auto',
                            bottom: '0px',
                            width: '28px',
                            height: '28px',
                            zIndex: 20,
                            color: '#1976d2',
                            '&::after': { fontSize: '14px', fontWeight: '900' },
                            '&.swiper-button-disabled': { opacity: 0.3 },
                        },
                        '& .swiper-button-prev': { left: 'calc(50% - 72px)' },
                        '& .swiper-button-next': { right: 'calc(50% - 72px)' },
                        '& .swiper-pagination': { bottom: '4px', zIndex: 10 },
                        '& .swiper-pagination-bullet-active': { background: '#1976d2' },
                    }}>
                        <Swiper
                            modules={[Navigation, Pagination, Autoplay]}
                            spaceBetween={28}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                            breakpoints={{
                                600: { slidesPerView: 2 },
                                960: { slidesPerView: 3 },
                            }}
                            style={{ paddingBottom: '40px' }}
                        >
                            {products.map(p => (
                                <SwiperSlide key={p.productId}>
                                    <ProductCard
                                        product={p}
                                        onClick={() => { navigate(`/tour/${section.id}/${p.productId}`); window.scrollTo(0, 0); }}
                                    />
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </Box>
                )}
            </Container>
        </Box>
    );
}

/* ── 히어로 배너 ── */
function HeroBanner() {
    return (
        <Box
            sx={{
                background: 'linear-gradient(135deg, #1a237e 0%, #283593 40%, #1565c0 100%)',
                color: 'white',
                py: { xs: 8, md: 14 },
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* 배경 장식 원 */}
            {[
                { size: 400, top: -120, right: -80, opacity: 0.06 },
                { size: 250, bottom: -60, left: -60, opacity: 0.08 },
                { size: 150, top: 40,   right: 200,  opacity: 0.05 },
            ].map((c, i) => (
                <Box key={i} sx={{
                    position: 'absolute',
                    width:  c.size, height: c.size,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    opacity: c.opacity,
                    top:    c.top,
                    bottom: c.bottom,
                    left:   c.left,
                    right:  c.right,
                }} />
            ))}

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                <Typography
                    variant="overline"
                    sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 4, display: 'block', mb: 1 }}
                >
                    ROHITOUR
                </Typography>
                <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: 1.2, mb: 2 }}
                >
                    특별한 여행,<br />
                    특별한 추억
                </Typography>
                <Typography
                    variant="h6"
                    sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, maxWidth: 480 }}
                >
                    수학여행부터 국내·해외 단체여행까지<br />
                    로이투어가 함께합니다.
                </Typography>
            </Container>
        </Box>
    );
}

/* ── 메인 ── */
export default function ClientHome() {
    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh' }}>
            <HeroBanner />
            {SECTIONS.map(section => (
                <CategorySection key={section.key} section={section} />
            ))}
        </Box>
    );
}
