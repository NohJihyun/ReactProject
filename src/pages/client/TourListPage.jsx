import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Container, Typography, Grid, Chip, Skeleton, Stack,
} from '@mui/material';
import PeopleIcon         from '@mui/icons-material/People';
import AttachMoneyIcon    from '@mui/icons-material/AttachMoney';
import SchoolIcon         from '@mui/icons-material/School';
import LandscapeIcon      from '@mui/icons-material/Landscape';
import FlightIcon         from '@mui/icons-material/Flight';
import DirectionsBoatIcon from '@mui/icons-material/DirectionsBoat';
import { getProductsByCategory } from '../../api/clientApi';

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

const CATEGORY_MAP = {
    school:   '수학여행',
    domestic: '국내여행',
    air:      '항공 해외여행',
    cruise:   '크루즈 해외여행',
};

const formatPrice = (price) => {
    if (!price) return null;
    return Number(price).toLocaleString('ko-KR') + '원~';
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
    const price      = formatPrice(product.pricePerPerson);
    const meta       = CATEGORY_META[categorySlug] ?? {};
    const depDt      = formatDt(product.departureAt);
    const arrDt      = formatDt(product.arrivalAt);
    const hasRoute   = product.departureLocation || depDt;
    const statusChip = getStatusChip(product.exposureEndAt);
    const peopleLabel = product.minPeople && product.maxPeople
        ? `${product.minPeople}~${product.maxPeople}인`
        : product.minPeople ? `${product.minPeople}인 이상`
        : product.maxPeople ? `최대 ${product.maxPeople}인` : null;
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
            <Box sx={{ position: 'relative', width: '100%', paddingTop: '72%', bgcolor: '#f0f0f0' }}>
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

            <Box sx={{ p: 2.5 }}>
                {/* 상태 + 추천 chip */}
                <Stack direction="row" spacing={0.75} sx={{ mb: 1 }}>
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

                {product.summary && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            overflow: 'hidden', display: '-webkit-box',
                            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            mb: 1.5, lineHeight: 1.6, minHeight: '3.2em', fontSize: '0.875rem',
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
                            size="small" variant="outlined" sx={{ fontSize: '0.75rem' }}
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

export default function TourListPage() {
    const { category } = useParams();
    const navigate = useNavigate();
    const categoryName = CATEGORY_MAP[category];
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

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
            <Container maxWidth="lg">
                <Typography variant="h4" fontWeight={800} sx={{ mb: 1, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                    {categoryName}
                </Typography>
                <Box sx={{ height: 3, width: 48, borderRadius: 2, bgcolor: '#2e7d32', mb: 4 }} />

                {loading && (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <Grid item xs={12} sm={6} md={4} key={i}>
                                <CardSkeleton />
                            </Grid>
                        ))}
                    </Grid>
                )}

                {!loading && products.length === 0 && (
                    <Box sx={{
                        py: 10, textAlign: 'center', borderRadius: 3,
                        bgcolor: 'white', border: '1px dashed #ddd',
                    }}>
                        <Typography color="text.disabled" variant="h6">등록된 상품이 없습니다.</Typography>
                    </Box>
                )}

                {!loading && products.length > 0 && (
                    <Grid container spacing={3}>
                        {products.map(p => (
                            <Grid item xs={12} sm={6} md={4} key={p.productId}>
                                <ProductCard
                                    product={p}
                                    categorySlug={category}
                                    onClick={() => { navigate(`/tour/${category}/${p.productId}`); window.scrollTo(0, 0); }}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </Box>
    );
}
