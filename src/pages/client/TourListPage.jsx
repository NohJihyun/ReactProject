import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Chip, Skeleton, Stack, Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PeopleIcon         from '@mui/icons-material/People';
import AttachMoneyIcon    from '@mui/icons-material/AttachMoney';
import SchoolIcon         from '@mui/icons-material/School';
import LandscapeIcon      from '@mui/icons-material/Landscape';
import FlightIcon         from '@mui/icons-material/Flight';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getProductsByCategory } from '../../api/clientApi';
import IMG_BASE from '../../config/imageConfig';

const CATEGORY_META = {
    domestic: { icon: <LandscapeIcon sx={{ fontSize: 16 }} />,      color: '#2e7d32', gradient: 'linear-gradient(135deg, #2e7d32 0%, #43a047 100%)' },
    air:      { icon: <FlightIcon sx={{ fontSize: 16 }} />,         color: '#e65100', gradient: 'linear-gradient(135deg, #e65100 0%, #ef6c00 100%)' },
    cruise:   { icon: <DirectionsBoatIcon sx={{ fontSize: 16 }} />, color: '#0277bd', gradient: 'linear-gradient(135deg, #0277bd 0%, #0288d1 100%)' },
    school:   { icon: <SchoolIcon sx={{ fontSize: 16 }} />,         color: '#3f51b5', gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)' },
};

const formatDt = (dt) => {
    if (!dt) return null;
    const d = new Date(dt);
    const m = d.getMonth() + 1;
    const day = d.getDate();
    const wd = ['일','월','화','수','목','금','토'][d.getDay()];
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${m}.${day}(${wd}) ${h}:${min}`;
};

const CATEGORY_MAP = {
    school:   '수학여행',
    domestic: '국내여행',
    air:      '국외여행',
    cruise:   '크루즈 해외여행',
};

const formatPrice = (price) => {
    if (!price) return null;
    return '1인 가격 ' + Number(price).toLocaleString('ko-KR') + '원~';
};

const parseTags = (hashtags) =>
    hashtags.split(' #').map((t, i) => i === 0 ? t : '#' + t).slice(0, 5);

const getStatusChip = (exposureEndAt) => {
    if (!exposureEndAt) return { label: '상시운영', color: '#2e7d32', bg: '#e8f5e9' };
    const days = Math.ceil((new Date(exposureEndAt) - new Date()) / 86400000);
    if (days <= 0)  return { label: '마감',              color: '#757575', bg: '#f5f5f5' };
    if (days <= 7)  return { label: `마감임박 D-${days}`, color: '#e65100', bg: '#fff3e0' };
    return               { label: '진행중',              color: '#1565c0', bg: '#e3f2fd' };
};

function ProductCard({ product, categorySlug, onClick }) {
    const price       = formatPrice(product.pricePerPerson);
    const meta        = CATEGORY_META[categorySlug] ?? {};
    const depDt       = formatDt(product.departureAt);
    const arrDt       = formatDt(product.arrivalAt);
    const hasRoute    = product.departureLocation || depDt;
    const statusChip  = getStatusChip(product.exposureEndAt);
    const peopleLabel = product.minPeople && product.maxPeople
        ? `모집인원 ${product.minPeople}~${product.maxPeople}명`
        : product.minPeople ? `모집인원 최소 ${product.minPeople}명`
        : product.maxPeople ? `모집인원 최대 ${product.maxPeople}명` : null;

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
                display: 'flex',
                flexDirection: 'column',
                height: { xs: 'auto', sm: 420 },
                '&:hover': {
                    transform: 'translateY(-6px)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.16)',
                },
            }}
        >
            {/* 썸네일 */}
            <Box sx={{ position: 'relative', width: '100%', height: 200, flexShrink: 0, bgcolor: '#f0f0f0' }}>
                {product.thumbnailPath ? (
                    <img
                        src={`${IMG_BASE}${product.thumbnailPath}`}
                        alt={product.productName}
                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
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
            </Box>

            {/* 내용 */}
            <Box sx={{ p: 2.5, flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                {/* 상태 + 추천 chip + 확정인원 */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        <Chip
                            label={statusChip.label}
                            size="small"
                            sx={{ bgcolor: statusChip.bg, color: statusChip.color, fontWeight: 700, fontSize: '0.7rem' }}
                        />
                        {product.isFeatured === 'Y' && (
                            <Chip label="추천" size="small"
                                sx={{ bgcolor: '#ff6f00', color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
                            />
                        )}
                    </Stack>
                    {(product.reservedCount > 0 || product.confirmedCount > 0) && (
                        <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                {product.reservedCount > 0 && (
                                    <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.3, color: '#1565c0' }}>
                                        예약 인원 {product.reservedCount}명
                                    </Typography>
                                )}
                                {product.confirmedCount > 0 && (
                                    <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.3,
                                        color: product.confirmedCount >= product.minPeople ? '#2e7d32' : '#1565c0' }}>
                                        확정 인원 {product.confirmedCount}명
                                    </Typography>
                                )}
                            </Stack>
                            {product.minPeople > 0 && product.confirmedCount > 0 && (
                                <Box sx={{ height: 4, width: 72, borderRadius: 3, bgcolor: '#eee', overflow: 'hidden', mt: 0.4, ml: 'auto' }}>
                                    <Box sx={{
                                        height: '100%',
                                        width: `${Math.min((product.confirmedCount / product.minPeople) * 100, 100)}%`,
                                        bgcolor: product.confirmedCount >= product.minPeople ? '#2e7d32' : '#1976d2',
                                        borderRadius: 3,
                                    }} />
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>

                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                        mb: 0.75, fontSize: '1rem',
                    }}
                >
                    {product.productName}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        overflow: 'hidden', display: '-webkit-box',
                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                        mb: 1.5, lineHeight: 1.6, minHeight: '3.2em', fontSize: '0.875rem',
                    }}
                >
                    {product.summary || ''}
                </Typography>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                    {peopleLabel && (
                        <Chip
                            icon={<PeopleIcon sx={{ fontSize: '15px !important' }} />}
                            label={peopleLabel}
                            size="small" variant="outlined" color="primary" sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                    {price && (
                        <Chip
                            icon={<AttachMoneyIcon sx={{ fontSize: '15px !important' }} />}
                            label={price}
                            size="small" variant="outlined" color="primary" sx={{ fontSize: '0.75rem' }}
                        />
                    )}
                </Stack>

                {hasRoute && (
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        sx={{
                            mt: 1.5, px: 1.2, py: 0.8,
                            bgcolor: '#f5f7fa', borderRadius: 1.5,
                            overflow: 'hidden', whiteSpace: 'nowrap',
                            color: 'text.secondary',
                        }}
                    >
                        <Box sx={{ color: meta.color, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            {meta.icon}
                        </Box>
                        <Typography variant="caption" fontWeight={600} sx={{ flexShrink: 0 }}>
                            {product.departureLocation}
                        </Typography>
                        {depDt && (
                            <Typography variant="caption" sx={{ flexShrink: 0 }}>{depDt}</Typography>
                        )}
                        <Typography variant="caption" sx={{ flexShrink: 0, color: '#aaa' }}>→</Typography>
                        <Typography variant="caption" fontWeight={600} sx={{ flexShrink: 0 }}>
                            {product.arrivalLocation}
                        </Typography>
                        {arrDt && (
                            <Typography variant="caption" sx={{ flexShrink: 0 }}>{arrDt}</Typography>
                        )}
                    </Stack>
                )}

                {product.hashtags && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto', pt: 1 }}>
                        {parseTags(product.hashtags).map((tag) => (
                            <Typography key={tag} variant="caption" sx={{ color: meta.color ?? '#1976d2', fontSize: '0.68rem', fontWeight: 500 }}>
                                {tag}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

function CardSkeleton() {
    return (
        <Box sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', height: 420, display: 'flex', flexDirection: 'column' }}>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ flexShrink: 0 }} />
            <Box sx={{ p: 2.5, flex: 1 }}>
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="80%" height={28} sx={{ mb: 0.5 }} />
                <Skeleton variant="text" width="100%" />
                <Skeleton variant="text" width="70%" sx={{ mb: 1.5 }} />
                <Skeleton variant="text" width="50%" height={24} />
            </Box>
        </Box>
    );
}

/* Swiper 네비게이션 공통 스타일 */
function swiperNavStyle(color) {
    return {
        '& .swiper-button-prev, & .swiper-button-next': {
            top: 'auto',
            bottom: '0px',
            width: '28px',
            height: '28px',
            zIndex: 20,
            color,
            '&::after': { fontSize: '14px', fontWeight: '900' },
            '&.swiper-button-disabled': { opacity: 0.3 },
        },
        '& .swiper-button-prev': { left: 'calc(50% - 72px)' },
        '& .swiper-button-next': { right: 'calc(50% - 72px)' },
        '& .swiper-pagination': { bottom: '4px', zIndex: 10 },
        '& .swiper-pagination-bullet-active': { background: color },
    };
}

export default function TourListPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const categoryName = CATEGORY_MAP[category];
    const meta = CATEGORY_META[category] ?? {};
    const [products, setProducts] = useState([]);
    const [loading, setLoading]   = useState(true);

    useEffect(() => {
        if (!categoryName) { setLoading(false); return; }
        getProductsByCategory(categoryName)
            .then(setProducts)
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [categoryName]);

    if (!categoryName) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">잘못된 카테고리입니다.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh', py: 5 }}>
            <Container maxWidth="xl">
                {/* 홈으로 */}
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => { navigate('/'); window.scrollTo(0, 0); }}
                    sx={{ mb: 2, color: 'text.secondary' }}
                >
                    홈으로
                </Button>

                {/* 페이지 헤더 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                    <Box sx={{
                        width: 48, height: 48, borderRadius: 2,
                        background: meta.gradient ?? '#ccc',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: 24,
                    }}>
                        {CATEGORY_META[category]?.icon}
                    </Box>
                    <Box>
                        <Typography variant="h4" fontWeight={800} lineHeight={1.2} sx={{ fontSize: { xs: '1.5rem', md: '2rem' } }}>
                            {categoryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            총 {loading ? '-' : products.length}개 상품
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ height: 3, width: 48, borderRadius: 2, background: meta.gradient ?? '#ccc', mb: 4 }} />

                {/* 스켈레톤 */}
                {loading && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)', lg: 'repeat(4,1fr)' }, gap: 3 }}>
                        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
                    </Box>
                )}

                {/* 상품 없음 */}
                {!loading && products.length === 0 && (
                    <Box sx={{
                        py: 10, textAlign: 'center', borderRadius: 3,
                        bgcolor: 'white', border: '1px dashed #ddd',
                    }}>
                        <Typography color="text.disabled" variant="h6">등록된 상품이 없습니다.</Typography>
                    </Box>
                )}

                {/* Swiper */}
                {!loading && products.length > 0 && (
                    <Box sx={swiperNavStyle(meta.color ?? '#1976d2')}>
                        <Swiper
                            modules={[Navigation, Pagination]}
                            spaceBetween={24}
                            slidesPerView={1}
                            navigation
                            pagination={{ clickable: true }}
                            breakpoints={{
                                600:  { slidesPerView: 2 },
                                960:  { slidesPerView: 3 },
                                1280: { slidesPerView: 4 },
                            }}
                            style={{ paddingBottom: '44px' }}
                        >
                            {products.map(p => (
                                <SwiperSlide key={p.productId}>
                                    <ProductCard
                                        product={p}
                                        categorySlug={category}
                                        onClick={() => { navigate(`/tour/${category}/${p.productId}`); window.scrollTo(0, 0); }}
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
