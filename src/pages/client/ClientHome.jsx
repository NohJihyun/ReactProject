import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Chip, Container, Skeleton, Stack, Rating, Fade } from '@mui/material';
import SchoolIcon           from '@mui/icons-material/School';
import LandscapeIcon        from '@mui/icons-material/Landscape';
import FlightIcon           from '@mui/icons-material/Flight';
import DirectionsBoatIcon   from '@mui/icons-material/DirectionsBoat';
import PeopleIcon           from '@mui/icons-material/People';
import AttachMoneyIcon      from '@mui/icons-material/AttachMoney';
import RateReviewIcon       from '@mui/icons-material/RateReview';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { getProductsByCategory } from '../../api/clientApi';
import { getRecentReviews } from '../../api/reviewApi';

const CATEGORY_META = {
    domestic: { icon: <LandscapeIcon sx={{ fontSize: 16 }} />,      color: '#2e7d32' },
    air:      { icon: <FlightIcon sx={{ fontSize: 16 }} />,         color: '#e65100' },
    cruise:   { icon: <DirectionsBoatIcon sx={{ fontSize: 16 }} />, color: '#0277bd' },
    school:   { icon: <SchoolIcon sx={{ fontSize: 16 }} />,         color: '#3f51b5' },
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

const IMG_BASE = 'http://localhost:8080';

const SECTIONS = [
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
        key:   '항공 해외여행',
        id:    'air',
        label: '항공 해외여행',
        icon:  <FlightIcon />,
        color: '#e65100',
        gradient: 'linear-gradient(135deg, #e65100 0%, #ef6c00 100%)',
        desc:  '세계 각지의 특별한 경험',
    },
    {
        key:   '크루즈 해외여행',
        id:    'cruise',
        label: '크루즈 해외여행',
        icon:  <DirectionsBoatIcon />,
        color: '#0277bd',
        gradient: 'linear-gradient(135deg, #0277bd 0%, #0288d1 100%)',
        desc:  '바다 위에서 즐기는 럭셔리 여행',
    },
    {
        key:   '수학여행',
        id:    'school',
        label: '수학여행',
        icon:  <SchoolIcon />,
        color: '#3f51b5',
        gradient: 'linear-gradient(135deg, #3f51b5 0%, #5c6bc0 100%)',
        desc:  '소중한 추억을 만드는 특별한 여행',
    },
];

const formatPrice = (price) => {
    if (!price) return null;
    return '1인 가격 ' + Number(price).toLocaleString('ko-KR') + '원~';
};

const parseTags = (hashtags) =>
    hashtags.split(' #').map((t, i) => i === 0 ? t : '#' + t).slice(0, 5);

const getStatusChip = (exposureEndAt) => {
    if (!exposureEndAt) return { label: '상시운영', color: '#2e7d32', bg: '#e8f5e9' };
    const days = Math.ceil((new Date(exposureEndAt) - new Date()) / 86400000);
    if (days <= 0)  return { label: '마감',          color: '#757575', bg: '#f5f5f5' };
    if (days <= 7)  return { label: `마감임박 D-${days}`, color: '#e65100', bg: '#fff3e0' };
    return               { label: '진행중',          color: '#1565c0', bg: '#e3f2fd' };
};

/* ── 상품 카드 ── */
function ProductCard({ product, categorySlug, onClick }) {
    const price      = formatPrice(product.pricePerPerson);
    const meta       = CATEGORY_META[categorySlug] ?? {};
    const depDt      = formatDt(product.departureAt);
    const arrDt      = formatDt(product.arrivalAt);
    const hasRoute   = product.departureLocation || depDt;
    const statusChip = getStatusChip(product.exposureEndAt);
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
                height: 420,
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
                    {product.confirmedCount > 0 && (
                        <Box sx={{ textAlign: 'right', flexShrink: 0, ml: 1 }}>
                            <Typography variant="caption" fontWeight={700} sx={{ display: 'block', lineHeight: 1.3,
                                color: product.confirmedCount >= product.minPeople ? '#2e7d32' : '#1565c0' }}>
                                확정 인원 {product.confirmedCount}명
                            </Typography>
                            {product.minPeople > 0 && (
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

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                    {peopleLabel && (
                        <Chip
                            icon={<PeopleIcon sx={{ fontSize: '15px !important' }} />}
                            label={peopleLabel}
                            size="small"
                            variant="outlined"
                            color="primary"
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
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        {parseTags(product.hashtags).map((tag) => (
                            <Typography key={tag} variant="caption" sx={{ color: meta.color ?? '#1976d2', fontSize: '0.68rem', fontWeight: 500, textAlign: 'center', flex: 1, whiteSpace: 'nowrap' }}>
                                {tag}
                            </Typography>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
}

const CATEGORY_SLUG_MAP = {
    '국내여행': 'domestic',
    '항공 해외여행': 'air',
    '크루즈 해외여행': 'cruise',
    '수학여행': 'school',
};

const WRITER_TYPE_LABEL = { GENERAL: '일반회원', STUDENT: '학생', TEACHER: '선생님' };
const WRITER_TYPE_COLOR = { GENERAL: 'default', STUDENT: 'primary', TEACHER: 'success' };
const WRITER_TYPE_ICON  = { GENERAL: '👤', STUDENT: '👨‍🎓', TEACHER: '👨‍🏫' };
const maskName = (name) => {
    if (!name) return '?';
    if (name.length === 1) return name;
    if (name.length === 2) return name[0] + '*';
    return name[0] + '*'.repeat(name.length - 2) + name[name.length - 1];
};

/* ── 후기 카드 (가로형) ── */
function ReviewCard({ review, onClick }) {
    const firstImage = review.images?.[0];
    const date       = review.createdAt
        ? new Date(review.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';

    return (
        <Box
            onClick={onClick}
            sx={{
                borderRadius: 3,
                bgcolor: 'white',
                boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
                borderLeft: '5px solid #ff6f00',
                p: 2.5,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: 2,
                height: { xs: 'auto', sm: 260 },
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'transform 0.25s, box-shadow 0.25s',
                '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 8px 28px rgba(0,0,0,0.13)' },
            }}
        >
            {/* 이미지 — 카드 높이 전체 */}
            <Box sx={{
                width: { xs: '100%', sm: 220 },
                height: { xs: 160, sm: 'auto' },
                flexShrink: 0,
                borderRadius: 2,
                overflow: 'hidden', bgcolor: '#f0f0f0',
                alignSelf: { xs: 'auto', sm: 'stretch' },
                display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
                {firstImage ? (
                    <img
                        src={`${IMG_BASE}${firstImage.imagePath}`}
                        alt="후기 이미지"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                ) : (
                    <Typography sx={{ fontSize: '3rem', lineHeight: 1 }}>
                        {WRITER_TYPE_ICON[review.writerType] ?? '👤'}
                    </Typography>
                )}
            </Box>

            {/* 오른쪽 내용 */}
            <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                {/* 따옴표 — 오른쪽 */}
                <Typography sx={{
                    fontSize: '7rem', lineHeight: 1,
                    color: '#ff6f00', opacity: 0.22,
                    fontFamily: 'Georgia, serif', userSelect: 'none',
                    textAlign: 'right', mb: -3,
                }}>❝</Typography>

                {/* 별점 + 유형 chip */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                    <Rating value={review.rating} readOnly size="small" sx={{ color: '#ff6f00' }} />
                    <Chip
                        label={WRITER_TYPE_LABEL[review.writerType] ?? review.writerType}
                        size="small"
                        color={WRITER_TYPE_COLOR[review.writerType] ?? 'default'}
                        sx={{ fontSize: '0.6rem', height: 18 }}
                    />
                </Stack>

                {/* 본문 */}
                <Typography variant="body2" sx={{
                    flex: 1,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.7,
                    color: 'text.primary',
                    fontSize: '0.875rem',
                    mb: 1,
                }}>
                    {review.content}
                </Typography>

                {/* 하단 */}
                <Box sx={{ borderTop: '1px solid #f0f0f0', pt: 1, mt: 'auto' }}>
                    <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: 'block', mb: 0.2 }}>
                        {maskName(review.userName)}
                    </Typography>
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.68rem', display: 'block', mb: 0.3 }}>
                        {date}
                    </Typography>
                    <Typography variant="caption" sx={{
                        color: '#1565c0', fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        display: 'block',
                    }}>
                        {review.productName}
                    </Typography>
                </Box>
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
                                        categorySlug={section.id}
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

/* ── 최근 후기 섹션 ── */
function RecentReviewSection() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [infoSnack, setInfoSnack] = useState(false);

    useEffect(() => {
        if (!infoSnack) return;
        const t = setTimeout(() => setInfoSnack(false), 4000);
        return () => clearTimeout(t);
    }, [infoSnack]);

    useEffect(() => {
        getRecentReviews(12)
            .then(setReviews)
            .catch(() => setReviews([]))
            .finally(() => setLoading(false));
    }, []);

    if (!loading && reviews.length === 0) return null;

    return (
        <Box component="section" sx={{ bgcolor: '#fff8f1', pt: 6, pb: 6 }}>
            <Container maxWidth="lg">
                {/* 섹션 헤더 */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1, flexWrap: 'wrap' }}>
                    <Box sx={{
                        width: 44, height: 44, borderRadius: 2,
                        background: 'linear-gradient(135deg, #ff6f00 0%, #ffb300 100%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white',
                    }}>
                        <RateReviewIcon />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={800} lineHeight={1.2}>
                            고객 여행후기
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            로이투어와 함께한 생생한 여행 이야기
                        </Typography>
                    </Box>
                    <Fade in={infoSnack}>
                        <Box sx={{
                            px: 2, py: 0.8,
                            bgcolor: '#f5f5f5',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            color: '#757575',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                        }}>
                            ✏️ 등록한 글 관리는 오른쪽 상단 여행후기에서 하실 수 있어요
                        </Box>
                    </Fade>
                </Box>
                <Box sx={{
                    height: 3, width: 48, borderRadius: 2,
                    background: 'linear-gradient(135deg, #ff6f00 0%, #ffb300 100%)',
                    mb: 2.5,
                }} />

                {/* 스켈레톤 */}
                {loading && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', md: 'repeat(3,1fr)' }, gap: 3 }}>
                        {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
                    </Box>
                )}

                {/* Swiper */}
                {!loading && reviews.length > 0 && (
                    <Box>
                        <Swiper
                            modules={[Autoplay]}
                            spaceBetween={28}
                            slidesPerView={1}
                            autoplay={{ delay: 5000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                            breakpoints={{ 600: { slidesPerView: 1 }, 960: { slidesPerView: 2 } }}
                        >
                            {reviews.map(r => (
                                <SwiperSlide key={r.id}>
                                    <ReviewCard review={r} onClick={() => setInfoSnack(true)} />
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
        <Box
            sx={{
                background: slide.bg,
                color: 'white',
                py: { xs: 8, md: 14 },
                position: 'relative',
                overflow: 'hidden',
                transition: 'background 0.6s ease',
            }}
        >
            {/* 배경 장식 원 */}
            {slide.circles.map((c, i) => (
                <Box key={i} sx={{
                    position: 'absolute',
                    width: c.size, height: c.size,
                    borderRadius: '50%',
                    bgcolor: 'white',
                    opacity: c.opacity,
                    top: c.top, bottom: c.bottom,
                    left: c.left, right: c.right,
                    transition: 'opacity 0.4s',
                }} />
            ))}

            {/* 슬라이드 콘텐츠 */}
            <Container
                maxWidth="lg"
                sx={{
                    position: 'relative', zIndex: 1,
                    opacity: fading ? 0 : 1,
                    transform: fading ? 'translateY(8px)' : 'translateY(0)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                }}
            >
                <Typography
                    variant="overline"
                    sx={{ color: 'rgba(255,255,255,0.7)', letterSpacing: 4, display: 'block', mb: 1 }}
                >
                    {slide.overline}
                </Typography>
                <Typography
                    variant="h2"
                    fontWeight={900}
                    sx={{ fontSize: { xs: '2rem', md: '3.2rem' }, lineHeight: 1.2, mb: 2, whiteSpace: 'pre-line' }}
                >
                    {slide.title}
                </Typography>
                <Typography
                    variant="h6"
                    sx={{ color: 'rgba(255,255,255,0.75)', fontWeight: 400, maxWidth: 480, whiteSpace: 'pre-line' }}
                >
                    {slide.sub}
                </Typography>
            </Container>

            {/* 하단 인디케이터 */}
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

/* ── 메인 ── */
export default function ClientHome() {
    return (
        <Box sx={{ bgcolor: '#f7f8fc', minHeight: '100vh' }}>
            <HeroBanner />
            <Box sx={{ pt: 5 }}>
                {SECTIONS.map(section => (
                    <CategorySection key={section.key} section={section} />
                ))}
            </Box>
            <RecentReviewSection />
        </Box>
    );
}
